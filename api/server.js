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

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_SECRET = process.env.PAYPAL_SECRET
const PAYPAL_API = process.env.PAYPAL_ENV === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

// Razorpay (UPI for India) configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

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
// Free scan endpoint (for frontend)
// ---------------------------------------------------------------------------
app.get('/scan', async (req, res) => {
  const { url } = req.query
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const results = await runScan(url)
    res.json(results)
  } catch (err) {
    console.error('Scan error:', err)
    res.status(500).json({ error: 'Scan failed', message: err.message })
  }
})

// ---------------------------------------------------------------------------
// Create Stripe checkout session (for frontend)
// ---------------------------------------------------------------------------
app.post('/create-checkout', async (req, res) => {
  const { targetUrl, userEmail, userId } = req.body
  
  if (!targetUrl || !userEmail) {
    return res.status(400).json({ error: 'URL and email are required' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Privacy Compliance Report',
            description: `Full GDPR/CCPA audit for ${new URL(targetUrl).hostname}`,
          },
          unit_amount: 4900, // $49.00
        },
        quantity: 1,
      }],
      metadata: {
        targetUrl,
        userEmail,
        userId: userId || '',
      },
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/cancel`,
    })

    res.json({ url: session.url, provider: 'stripe' })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

// ---------------------------------------------------------------------------
// PayPal: Create order
// ---------------------------------------------------------------------------
app.post('/create-paypal-order', async (req, res) => {
  const { targetUrl, userEmail } = req.body
  
  if (!targetUrl || !userEmail) {
    return res.status(400).json({ error: 'URL and email are required' })
  }

  try {
    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    
    const authData = await authResponse.json()
    
    // Create order
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: '49.00',
          },
          description: `Privacy Compliance Report for ${new URL(targetUrl).hostname}`,
          custom_id: JSON.stringify({ targetUrl, userEmail }),
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/success?provider=paypal`,
          cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/cancel`,
        },
      }),
    })
    
    const orderData = await orderResponse.json()
    
    if (orderData.id) {
      res.json({ orderId: orderData.id, provider: 'paypal' })
    } else {
      throw new Error('PayPal order creation failed')
    }
  } catch (err) {
    console.error('PayPal order error:', err)
    res.status(500).json({ error: 'Failed to create PayPal order' })
  }
})

// ---------------------------------------------------------------------------
// PayPal: Capture payment (called after user approves)
// ---------------------------------------------------------------------------
app.post('/capture-paypal-order', async (req, res) => {
  const { orderId } = req.body
  
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' })
  }

  try {
    // Get access token
    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    
    const authData = await authResponse.json()
    
    // Capture the order
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
    })
    
    const captureData = await captureResponse.json()
    
    if (captureData.status === 'COMPLETED') {
      const customData = JSON.parse(captureData.purchase_units[0].custom_id)
      const { targetUrl, userEmail } = customData
      
      // Create scan job in Supabase
      const { data: job, error } = await supabase
        .from('scan_jobs')
        .insert({
          user_email:  userEmail,
          target_url:  targetUrl,
          status:      'pending',
          payment_id:  orderId,
          amount_paid: 4900,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create scan job:', error)
        return res.status(500).json({ error: 'DB write failed' })
      }

      // Run scan async
      runScanJob(job.id, targetUrl, userEmail).catch(err => {
        console.error(`Scan job ${job.id} failed:`, err)
      })

      res.json({ success: true, scanId: job.id })
    } else {
      res.status(400).json({ error: 'Payment not completed' })
    }
  } catch (err) {
    console.error('PayPal capture error:', err)
    res.status(500).json({ error: 'Failed to capture payment' })
  }
})

// ---------------------------------------------------------------------------
// UPI / Razorpay: Create order for India payments
// ---------------------------------------------------------------------------
app.post('/create-upi-order', async (req, res) => {
  const { targetUrl, userEmail } = req.body
  
  if (!targetUrl || !userEmail) {
    return res.status(400).json({ error: 'URL and email are required' })
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Razorpay not configured' })
  }

  try {
    const domain = new URL(targetUrl).hostname
    
    // Create Razorpay order
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 3900, // ₹39.00 (approx $49 in INR for Indian market)
        currency: 'INR',
        receipt: `scan_${Date.now()}`,
        notes: {
          targetUrl,
          userEmail,
          domain,
        },
      }),
    })
    
    const orderData = await orderResponse.json()
    
    if (orderData.id) {
      res.json({
        orderId: orderData.id,
        provider: 'razorpay',
        keyId: RAZORPAY_KEY_ID,
        amount: 3900,
        currency: 'INR',
        notes: {
          targetUrl,
          userEmail,
        },
      })
    } else {
      throw new Error('Razorpay order creation failed')
    }
  } catch (err) {
    console.error('Razorpay order error:', err)
    res.status(500).json({ error: 'Failed to create UPI order' })
  }
})

// ---------------------------------------------------------------------------
// UPI / Razorpay: Webhook handler
// ---------------------------------------------------------------------------
app.post('/webhook/razorpay', async (req, res) => {
  // Note: In production, verify webhook signature
  // https://razorpay.com/docs/webhooks/validate-test/
  
  const event = req.body
  
  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const notes = payment.notes
    
    if (!notes || !notes.targetUrl || !notes.userEmail) {
      return res.status(400).json({ error: 'Missing metadata' })
    }
    
    // Create scan job
    const { data: job, error } = await supabase
      .from('scan_jobs')
      .insert({
        user_email:  notes.userEmail,
        target_url:  notes.targetUrl,
        status:      'pending',
        payment_id:  payment.order_id,
        amount_paid: payment.amount,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create scan job:', error)
      return res.status(500).json({ error: 'DB write failed' })
    }
    
    // Run scan async
    runScanJob(job.id, notes.targetUrl, notes.userEmail).catch(err => {
      console.error(`Scan job ${job.id} failed:`, err)
    })
    
    res.json({ received: true })
  } else {
    res.json({ received: true })
  }
})

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
