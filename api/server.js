/**
 * PrivacyScan — Railway API Server
 * 
 * Handles:
 *   POST /webhook/stripe   — receives payment, queues scan job
 *   POST /scan/run         — internal: runs scan + generates PDF via PDFBolt
 *   GET  /report/:scanId   — returns presigned Supabase download URL
 *   GET  /health           — Railway health check
 * 
 * Environment variables required:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   PDFBOLT_API_KEY
 *   PDFBOLT_TEMPLATE_ID
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 *   RESEND_API_KEY
 *   BROWSERLESS_TOKEN        (optional — falls back to local Chromium)
 */

const express        = require('express')
const Stripe         = require('stripe')
const { createClient } = require('@supabase/supabase-js')
const { Resend }     = require('resend')
const { runScan }    = require('./scanner')

const app    = express()
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => res.json({ ok: true }))

// ---------------------------------------------------------------------------
// Stripe webhook
// Raw body required for signature verification — must come BEFORE json parser
// ---------------------------------------------------------------------------
app.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Stripe webhook signature failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Only handle successful payments
    if (event.type !== 'payment_intent.succeeded') {
      return res.json({ received: true })
    }

    const intent  = event.data.object
    const { targetUrl, userEmail, userId } = intent.metadata

    // Write pending job to Supabase immediately
    const { data: job, error } = await supabase
      .from('scan_jobs')
      .insert({
        user_id:     userId || null,
        user_email:  userEmail,
        target_url:  targetUrl,
        status:      'pending',
        payment_id:  intent.id,
        amount_paid: intent.amount,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create scan job:', error)
      return res.status(500).json({ error: 'DB write failed' })
    }

    // Return 200 to Stripe IMMEDIATELY — never make Stripe wait for the scan
    res.json({ received: true })

    // Run scan async — fire and forget from Stripe's perspective
    runScanJob(job.id, targetUrl, userEmail).catch(err => {
      console.error(`Scan job ${job.id} failed:`, err)
    })
  }
)

// ---------------------------------------------------------------------------
// JSON parser for all other routes (after raw body route)
// ---------------------------------------------------------------------------
app.use(express.json())

// ---------------------------------------------------------------------------
// Report download URL
// ---------------------------------------------------------------------------
app.get('/report/:scanId', async (req, res) => {
  const { scanId } = req.params

  const { data: job, error } = await supabase
    .from('scan_jobs')
    .select('status, pdf_path, user_email')
    .eq('id', scanId)
    .single()

  if (error || !job) {
    return res.status(404).json({ error: 'Report not found' })
  }

  if (job.status !== 'complete') {
    return res.json({ status: job.status, ready: false })
  }

  // Generate presigned URL valid for 7 days
  const { data: signedUrl } = await supabase.storage
    .from('reports')
    .createSignedUrl(job.pdf_path, 60 * 60 * 24 * 7)

  return res.json({ status: 'complete', ready: true, url: signedUrl.signedUrl })
})

// ---------------------------------------------------------------------------
// Core async job runner
// ---------------------------------------------------------------------------
async function runScanJob(jobId, targetUrl, userEmail) {
  console.log(`[${jobId}] Starting scan for ${targetUrl}`)

  // Mark as scanning
  await supabase
    .from('scan_jobs')
    .update({ status: 'scanning', started_at: new Date().toISOString() })
    .eq('id', jobId)

  // ── 1. Run the Playwright compliance scan ──────────────────────────────
  let scanResults
  try {
    scanResults = await runScan(targetUrl)
    console.log(`[${jobId}] Scan complete — score: ${scanResults.scoring.score}`)
  } catch (err) {
    console.error(`[${jobId}] Scan failed:`, err)
    await supabase
      .from('scan_jobs')
      .update({ status: 'failed', error: err.message })
      .eq('id', jobId)
    return
  }

  // Save raw results to DB (useful for dashboard, future re-reports)
  await supabase
    .from('scan_jobs')
    .update({ scan_results: scanResults })
    .eq('id', jobId)

  // ── 2. Generate PDF via PDFBolt ────────────────────────────────────────
  console.log(`[${jobId}] Generating PDF via PDFBolt`)

  const templateData = buildTemplateData(jobId, targetUrl, scanResults)

  let pdfBuffer
  try {
    const pdfResponse = await fetch('https://api.pdfbolt.com/v1/direct', {
      method:  'POST',
      headers: {
        'API-KEY':      process.env.PDFBOLT_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId:   process.env.PDFBOLT_TEMPLATE_ID,
        templateData,
        options: {
          format:  'A4',
          margin:  { top: '0', right: '0', bottom: '0', left: '0' },
        },
      }),
    })

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text()
      throw new Error(`PDFBolt error ${pdfResponse.status}: ${errText}`)
    }

    pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
    console.log(`[${jobId}] PDF generated — ${(pdfBuffer.length / 1024).toFixed(0)} KB`)
  } catch (err) {
    console.error(`[${jobId}] PDF generation failed:`, err)
    await supabase
      .from('scan_jobs')
      .update({ status: 'failed', error: err.message })
      .eq('id', jobId)
    return
  }

  // ── 3. Upload PDF to Supabase Storage ─────────────────────────────────
  const pdfPath = `reports/${jobId}/compliance-report.pdf` 

  const { error: uploadError } = await supabase.storage
    .from('reports')
    .upload(pdfPath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert:      true,
    })

  if (uploadError) {
    console.error(`[${jobId}] Supabase upload failed:`, uploadError)
    await supabase
      .from('scan_jobs')
      .update({ status: 'failed', error: uploadError.message })
      .eq('id', jobId)
    return
  }

  // Generate 7-day presigned download URL
  const { data: signedUrlData } = await supabase.storage
    .from('reports')
    .createSignedUrl(pdfPath, 60 * 60 * 24 * 7)

  const downloadUrl = signedUrlData.signedUrl

  // ── 4. Mark job complete ───────────────────────────────────────────────
  await supabase
    .from('scan_jobs')
    .update({
      status:       'complete',
      pdf_path:     pdfPath,
      download_url: downloadUrl,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  console.log(`[${jobId}] Job complete`)

  // ── 5. Send delivery email via Resend ─────────────────────────────────
  const domain  = new URL(targetUrl).hostname
  const score   = scanResults.scoring.score

  await resend.emails.send({
    from:    'PrivacyScan <reports@privacyscan.io>',
    to:      userEmail,
    subject: `Your compliance report for ${domain} is ready`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="margin-bottom:8px">Your PrivacyScan report is ready</h2>
        <p style="color:#555;margin-bottom:24px">
          We've completed the GDPR/CCPA compliance audit for <strong>${domain}</strong>.
        </p>
        <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center">
          <div style="font-size:13px;color:#777;margin-bottom:4px">Overall compliance score</div>
          <div style="font-size:48px;font-weight:600;color:${score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'}">
            ${score}<span style="font-size:20px;color:#999">/100</span>
          </div>
          <div style="font-size:13px;color:#777;margin-top:4px">
            ${scanResults.scoring.criticalCount} critical · 
            ${scanResults.scoring.warningCount} warnings · 
            ${scanResults.scoring.passedCount} passed
          </div>
        </div>
        <a href="${downloadUrl}"
           style="display:block;background:#0f172a;color:#fff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:500;margin-bottom:16px">
          Download your PDF report
        </a>
        <p style="font-size:12px;color:#999;text-align:center">
          This link expires in 7 days. Report ID: ${jobId}
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:12px;color:#bbb;text-align:center">
          PrivacyScan · <a href="https://privacyscan.io" style="color:#bbb">privacyscan.io</a>
        </p>
      </div>
    `,
  })

  console.log(`[${jobId}] Delivery email sent to ${userEmail}`)
}

// ---------------------------------------------------------------------------
// Build PDFBolt Handlebars template data from scan results
// ---------------------------------------------------------------------------
function buildTemplateData(jobId, targetUrl, results) {
  const domain      = new URL(targetUrl).hostname
  const { scoring } = results

  return {
    // Report metadata
    reportId:    jobId,
    domain,
    targetUrl,
    generatedAt: new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    scanDuration: `${(results.meta.durationMs / 1000).toFixed(1)}s`,

    // Score block
    score:         scoring.score,
    grade:         scoring.grade,
    status:        scoring.status,
    statusLabel:   scoring.status === 'compliant' ? 'Compliant' : scoring.status === 'partial' ? 'Partially compliant' : 'Non-compliant',
    scoreColor:    scoring.score >= 80 ? '#16a34a' : scoring.score >= 60 ? '#d97706' : '#dc2626',
    criticalCount: scoring.criticalCount,
    warningCount:  scoring.warningCount,
    passedCount:   scoring.passedCount,
    totalChecks:   scoring.totalChecks,

    // Findings for report pages
    criticalIssues: results.criticalIssues,
    warnings:       results.warnings,
    passed:         results.passed,

    // Cookie table (page 2)
    cookies:         results.cookieTable,
    cookieTotal:     results.cookieTable.length,
    cookieTracking:  results.cookieTable.filter(c => c.category !== 'necessary').length,
    cookieNecessary: results.cookieTable.filter(c => c.category === 'necessary').length,

    // Tracker table (page 3)
    trackers:        results.trackerList,
    trackerTotal:    results.trackerList.length,
    trackerHighRisk: results.trackerList.filter(t => t.risk === 'high').length,
    usTransfers:     results.trackerList.filter(t => t.domain && [
      'google-analytics.com','connect.facebook.net','hotjar.com',
      'clarity.ms','segment.com','mixpanel.com','amplitude.com',
    ].includes(t.domain)).length,

    // Boolean flags for conditional sections in Handlebars template
    hasCritical:  results.criticalIssues.length > 0,
    hasWarnings:  results.warnings.length > 0,
    hasTrackers:  results.trackerList.length > 0,
    hasCookies:   results.cookieTable.length > 0,
  }
}

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`PrivacyScan API running on port ${PORT}`)
})
