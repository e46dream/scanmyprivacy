/**
 * PrivacyScan — Compliance Scanner
 * 
 * Connects to Browserless (free tier) via WebSocket.
 * Falls back to local Playwright if BROWSERLESS_TOKEN is not set.
 * 
 * Checks: cookies, trackers, consent banner, privacy policy,
 *         form compliance, HTTPS/TLS, data transfer destinations.
 * 
 * Usage:
 *   const { runScan } = require('./scanner')
 *   const results = await runScan('https://acmeshop.com')
 */

const { chromium } = require('playwright-chromium')

// ---------------------------------------------------------------------------
// Tracker blocklist — subset of EasyPrivacy commonly found on small biz sites
// Extend this list as needed. Full EasyPrivacy list can be loaded from URL.
// ---------------------------------------------------------------------------
const KNOWN_TRACKERS = {
  'google-analytics.com':      { name: 'Google Analytics',  category: 'analytics',  risk: 'medium' },
  'googletagmanager.com':      { name: 'Google Tag Manager', category: 'analytics',  risk: 'medium' },
  'googlesyndication.com':     { name: 'Google Ads',         category: 'advertising',risk: 'high'   },
  'doubleclick.net':           { name: 'DoubleClick',        category: 'advertising',risk: 'high'   },
  'connect.facebook.net':      { name: 'Meta Pixel',         category: 'advertising',risk: 'high'   },
  'facebook.com':              { name: 'Facebook',           category: 'advertising',risk: 'high'   },
  'hotjar.com':                { name: 'Hotjar',             category: 'analytics',  risk: 'medium' },
  'clarity.ms':                { name: 'Microsoft Clarity',  category: 'analytics',  risk: 'medium' },
  'intercom.io':               { name: 'Intercom',           category: 'support',    risk: 'low'    },
  'crisp.chat':                { name: 'Crisp Chat',         category: 'support',    risk: 'low'    },
  'tiktok.com':                { name: 'TikTok Pixel',       category: 'advertising',risk: 'high'   },
  'snap.com':                  { name: 'Snapchat Pixel',     category: 'advertising',risk: 'high'   },
  'linkedin.com':              { name: 'LinkedIn Insight',   category: 'advertising',risk: 'medium' },
  'twitter.com':               { name: 'Twitter/X Pixel',    category: 'advertising',risk: 'medium' },
  'segment.com':               { name: 'Segment',            category: 'analytics',  risk: 'medium' },
  'mixpanel.com':              { name: 'Mixpanel',           category: 'analytics',  risk: 'medium' },
  'amplitude.com':             { name: 'Amplitude',          category: 'analytics',  risk: 'medium' },
  'hubspot.com':               { name: 'HubSpot',            category: 'marketing',  risk: 'medium' },
  'mouseflow.com':             { name: 'Mouseflow',          category: 'analytics',  risk: 'medium' },
  'fullstory.com':             { name: 'FullStory',          category: 'analytics',  risk: 'medium' },
}

// Known consent management platforms (CMP) — DOM selectors
const CMP_SIGNATURES = [
  // Major CMP platforms
  '#cookie-banner',               // Generic
  '#cookie-consent',              // Generic
  '#cookie-notice',               // Generic
  '#gdpr-banner',                 // Generic
  '#consent-banner',              // Generic
  '.cookie-banner',               // Generic
  '.cookie-consent',              // Generic
  '.cookie-notice',               // Generic
  '.gdpr-banner',                 // Generic
  '.consent-banner',              // Generic
  
  // Specific CMP platforms
  '#onetrust-banner-sdk',         // OneTrust
  '#onetrust-consent-sdk',        // OneTrust
  '.ot-sdk-container',            // OneTrust
  '[data-testid="cookie-banner"]', // OneTrust
  '#cookiebot',                   // Cookiebot
  '.Cookiebot',                   // Cookiebot
  '#cky-consent',                 // CookieYes
  '.cky-consent',                 // CookieYes
  '#usercentrics-root',           // Usercentrics
  '.usercentrics-root',           // Usercentrics
  '#cc-banner',                   // Cookie Consent by Osano
  '.cc-banner',                   // Cookie Consent by Osano
  '#cookie-law-info-bar',         // Cookie Law Info (WP)
  '.cookie-notice-container',     // Cookie Notice (WP)
  
  // UK/EU specific patterns
  '#cookie-policy',              // UK sites
  '.cookie-policy',              // UK sites
  '#privacy-notice',             // UK sites
  '.privacy-notice',             // UK sites
  '[role="dialog"][aria-label*="cookie"]', // Accessibility patterns
  '[role="alertdialog"][aria-label*="consent"]',
  
  // Generic patterns
  '[id*="cookie"][id*="consent"]',
  '[class*="cookie"][class*="banner"]',
  '[class*="gdpr"]',
  '[id*="gdpr"]',
  '[data-cc*]',                  // Cookie Consent
  '[data-consent*]',
  '[data-cookie*]',
  
  // Text-based detection (will be checked in content)
  // These are handled in the text analysis part
]

// Privacy policy link patterns
const PRIVACY_LINK_PATTERNS = [
  /privacy[\s-_]?policy/i,
  /datenschutz/i,       // German
  /privacidad/i,        // Spanish
  /confidentialit/i,    // French
  /privacy notice/i,
  /data protection/i,
  /cookie policy/i,
  // UK specific patterns
  /privacy[\s-_]?and[\s-_]?cookies/i,
  /cookies[\s-_]?policy/i,
  /cookie[\s-_]?information/i,
  /cookie[\s-_]?settings/i,
  /your[\s-_]?privacy/i,
  /privacy[\s-_]?hub/i,
  /privacy[\s-_]?centre/i,
  /privacy[\s-_]?center/i,  // US spelling
  /privacy[\s-_]?statement/i,
  /privacy[\s-_]?portal/i,
  /privacy[\s-_]?dashboard/i,
  // Tesco specific
  /privacy[\s-_]?policy/i,
  /cookie[\s-_]?preferences/i,
  /privacy[\s-_]?centre/i,
  /privacy[\s-_]?and[\s-_]?cookies/i,
  /data[\s-_]?protection/i,
  /legal[\s-_]?information/i,
  /terms[\s-_]?and[\s-_]?conditions/i,
  /cookie[\s-_]?notice/i,
  /privacy[\s-_]?notice/i,
  // Generic patterns
  /privacy/i,
  /cookies/i,
  /gdpr/i
]

// US-based tracker domains (for data transfer warnings)
const US_HOSTED_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'googlesyndication.com',
  'doubleclick.net',
  'connect.facebook.net',
  'facebook.com',
  'hotjar.com',
  'clarity.ms',
  'segment.com',
  'mixpanel.com',
  'amplitude.com',
  'fullstory.com',
]

// ---------------------------------------------------------------------------
// Browser connection
// ---------------------------------------------------------------------------
async function getBrowser() {
  const token = process.env.BROWSERLESS_TOKEN

  if (token) {
    // Connect to Browserless free tier via WebSocket
    return await chromium.connect(
      `wss://chrome.browserless.io?token=${token}` 
    )
  }

  // Fallback: local Chromium (Railway self-hosted)
  return await chromium.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',   // Prevents crashes in low-memory containers
      '--disable-gpu',
    ],
    headless: true,
  })
}

// ---------------------------------------------------------------------------
// Individual check functions
// ---------------------------------------------------------------------------

/**
 * 1. HTTPS check
 * Verifies the site uses HTTPS and doesn't redirect to HTTP.
 */
function checkHttps(url) {
  const parsed = new URL(url)
  const isHttps = parsed.protocol === 'https:'

  return {
    id: 'https',
    name: 'HTTPS enforcement',
    pass: isHttps,
    severity: isHttps ? 'pass' : 'critical',
    detail: isHttps
      ? 'Site is served over HTTPS.'
      : 'Site is not using HTTPS. All data is transmitted in plain text.',
    gdprArticle: 'GDPR Article 32 — Security of processing',
    fix: isHttps
      ? null
      : 'Enable HTTPS via your hosting provider or use Cloudflare (free). Redirect all HTTP traffic to HTTPS.',
  }
}

/**
 * 2. Cookie audit
 * Captures all cookies set after page load, before any consent interaction.
 * Classifies each one as necessary or tracking.
 */
async function checkCookies(page) {
  const cookies = await page.context().cookies()

  const classified = cookies.map(cookie => {
    const domain = cookie.domain.replace(/^\./, '')
    const tracker = Object.entries(KNOWN_TRACKERS).find(([trackerDomain]) =>
      domain.includes(trackerDomain)
    )

    const lifetimeDays = cookie.expires > 0
      ? Math.round((cookie.expires - Date.now() / 1000) / 86400)
      : 0

    return {
      name:       cookie.name,
      domain:     domain,
      lifetime:   cookie.expires > 0 ? `${lifetimeDays} days` : 'Session',
      httpOnly:   cookie.httpOnly,
      secure:     cookie.secure,
      sameSite:   cookie.sameSite,
      value:      cookie.value ? `${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}` : '', // First 50 chars
      category:   tracker ? tracker[1].category : 'necessary',
      provider:   tracker ? tracker[1].name : domain,
      risk:       tracker ? tracker[1].risk : 'low',
      preConsent: true, // All captured cookies are pre-consent (we never click accept)
    }
  })

  const trackingCookies     = classified.filter(c => c.category !== 'necessary')
  const preConsentTracking  = trackingCookies.length
  const insecureCookies     = classified.filter(c => !c.secure && c.category !== 'necessary')
  const longLived           = classified.filter(c => {
    const days = parseInt(c.lifetime)
    return !isNaN(days) && days > 395 // ICO guidance: max 13 months
  })

  const pass = preConsentTracking === 0

  return {
    id:       'cookies',
    name:     'Cookie audit',
    pass,
    severity: preConsentTracking > 0 ? 'critical' : 'pass',
    detail:   pass
      ? `${classified.length} cookies found — all appear necessary.` 
      : `${preConsentTracking} tracking cookie(s) set before consent was collected.`,
    gdprArticle: 'GDPR Article 7 + ePrivacy Directive',
    fix: pass ? null : 'Install a consent management platform (CookieYes, Cookiebot). Block all non-essential cookies until user gives explicit consent.',
    data: {
      total:            classified.length,
      tracking:         preConsentTracking,
      necessary:        classified.length - preConsentTracking,
      insecure:         insecureCookies.length,
      longLived:        longLived.length,
      cookies:          classified,
    },
  }
}

/**
 * 3. Third-party tracker detection
 * Intercepts all network requests and matches against known tracker domains.
 */
async function checkTrackers(page) {
  const detected = new Map()

  // Listen for all outgoing requests (set up BEFORE navigation)
  page.on('request', request => {
    const url = request.url()
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '')
      for (const [trackerDomain, meta] of Object.entries(KNOWN_TRACKERS)) {
        if (hostname.includes(trackerDomain) && !detected.has(trackerDomain)) {
          detected.set(trackerDomain, {
            ...meta,
            domain:       trackerDomain,
            requestUrl:   url,
            resourceType: request.resourceType(),
            method:       request.method(),
            headers:      Object.keys(request.headers()).slice(0, 5), // First 5 headers
          })
        }
      }
    } catch {
      // Ignore malformed URLs
    }
  })

  const trackers    = Array.from(detected.values())
  const highRisk    = trackers.filter(t => t.risk === 'high')
  const usTransfers = trackers.filter(t => US_HOSTED_DOMAINS.includes(t.domain))
  const pass        = trackers.length === 0

  return {
    id:       'trackers',
    name:     'Third-party tracker detection',
    pass,
    severity: highRisk.length > 0 ? 'critical' : trackers.length > 0 ? 'warning' : 'pass',
    detail:   pass
      ? 'No known third-party trackers detected.'
      : `${trackers.length} tracker(s) detected — ${highRisk.length} high risk.`,
    gdprArticle: 'GDPR Article 5(1)(c) — Data minimisation',
    fix: pass ? null : 'Remove unnecessary trackers. For remaining ones, ensure they only load after consent and document them in your privacy policy.',
    data: {
      total:        trackers.length,
      highRisk:     highRisk.length,
      usTransfers:  usTransfers.length,
      trackers,
    },
  }
}

/**
 * 4. Consent banner detection
 * Checks for a visible CMP banner on page load.
 */
async function checkConsentBanner(page) {
  let bannerFound = false
  let bannerSelector = null
  let bannerType = null

  for (const selector of CMP_SIGNATURES) {
    const element = await page.$(selector)
    if (element) {
      const visible = await element.isVisible()
      if (visible) {
        bannerFound   = true
        bannerSelector = selector
        
        // Identify CMP type
        if (selector.includes('cookiebot')) bannerType = 'Cookiebot'
        else if (selector.includes('cky')) bannerType = 'CookieYes'
        else if (selector.includes('onetrust')) bannerType = 'OneTrust'
        else if (selector.includes('usercentrics')) bannerType = 'Usercentrics'
        else if (selector.includes('cc-banner')) bannerType = 'Osano'
        else bannerType = 'Generic'
        
        break
      }
    }
  }

  // Also check for common banner text patterns in page body
  if (!bannerFound) {
    const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase())
    const bannerKeywords = [
      // English
      'we use cookies', 
      'cookie policy', 
      'accept cookies', 
      'consent',
      'privacy preferences',
      'cookie settings',
      'manage cookies',
      'your choices',
      'personalise your experience',
      'personalize your experience',
      // UK specific
      'cookie notice',
      'privacy and cookies',
      'cookies on our website',
      'our use of cookies',
      'cookie information',
      // EU specific
      'gdpr consent',
      'data protection',
      'privacy statement',
      // Tesco specific patterns
      'cookie preferences',
      'accept all',
      'reject all',
      'customise',
      'customise cookies',
      'essential cookies',
      'marketing cookies',
      'analytics cookies',
      'cookie banner',
      'privacy centre',
      'cookie policy',
      'privacy policy',
      'data protection',
      'cookie settings',
      'manage preferences'
    ]
    bannerFound = bannerKeywords.some(kw => bodyText.includes(kw))
    if (bannerFound) bannerType = 'Text-based'
  }

  // Check for hidden or dynamically loaded consent banners
  if (!bannerFound) {
    const hiddenBanners = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*')
      for (const element of allElements) {
        const text = element.textContent?.toLowerCase() || ''
        const style = window.getComputedStyle(element)
        
        // Check if element contains consent-related text
        if (text.includes('cookie') || text.includes('consent') || text.includes('privacy')) {
          // Check if element is visible or potentially visible
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            // Check if element has substantial content
            if (text.length > 20 && (text.includes('accept') || text.includes('agree') || text.includes('manage'))) {
              return {
                found: true,
                element: element.tagName,
                text: text.substring(0, 100),
                display: style.display,
                visibility: style.visibility
              }
            }
          }
        }
      }
      return { found: false }
    })
    
    if (hiddenBanners.found) {
      bannerFound = true
      bannerType = 'Hidden/Dynamic'
    }
  }

  return {
    id:       'consent_banner',
    name:     'Cookie consent banner',
    pass:     bannerFound,
    severity: bannerFound ? 'pass' : 'critical',
    detail:   bannerFound
      ? `Consent mechanism detected${bannerSelector ? ` (${bannerType})` : ''}.` 
      : 'No cookie consent banner detected. Cookies may be set without user knowledge.',
    gdprArticle: 'GDPR Article 7 + ePrivacy Directive Article 5(3)',
    fix: bannerFound ? null : 'Add a consent management platform: CookieYes (free tier available), Cookiebot, or Osano. Ensure it blocks non-essential cookies until consent is given.',
    data: {
      bannerFound,
      bannerSelector,
      bannerType,
    },
  }
}

/**
 * 5. Privacy policy check
 * Looks for a privacy policy link in header, footer, and nav.
 */
async function checkPrivacyPolicy(page) {
  // Check for privacy policy links in page
  const privacyLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'))
    return links.map(link => ({
      href: link.href,
      text: link.textContent?.trim() || '',
      title: link.title || ''
    }))
  })

  let linkFound = false
  let linkUrl = null
  let contentValid = false
  let gdprMentions = []
  let wordCount = 0
  
  // Check each link against privacy patterns
  for (const link of privacyLinks) {
    const combinedText = `${link.text} ${link.title} ${link.href}`.toLowerCase()
    
    for (const pattern of PRIVACY_LINK_PATTERNS) {
      if (pattern.test(combinedText)) {
        linkFound = true
        linkUrl = link.href
        break
      }
    }
    if (linkFound) break
  }

  // Also check for privacy policy in page content
  if (linkFound) {
    try {
      const contentCheck = await page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase()
        const gdprKeywords = ['gdpr', 'general data protection', 'data protection', 'privacy policy', 'cookie policy']
        const mentions = gdprKeywords.filter(keyword => bodyText.includes(keyword))
        return {
          gdprMentions: mentions,
          wordCount: document.body.innerText.split(/\s+/).length
        }
      })
      
      contentValid = contentCheck.gdprMentions.length > 0
      gdprMentions = contentCheck.gdprMentions
      wordCount = contentCheck.wordCount
    } catch (err) {
      console.log('Could not analyze privacy content:', err.message)
    }
  }

  const pass = linkFound && contentValid

  return {
    id:       'privacy_policy',
    name:     'Privacy policy',
    pass,
    severity: pass ? 'pass' : 'critical',
    detail:   pass
      ? `Privacy policy found${linkUrl ? ` at ${linkUrl}` : ''} — mentions ${gdprMentions.join(', ')}.` 
      : 'No privacy policy link found in page links.',
    gdprArticle: 'GDPR Article 13 — Information to be provided',
    fix: pass ? null : 'Add a /privacy page covering: data collected, legal basis, retention periods, data controller identity, and user rights. Link it in your site footer.',
    data: {
      linkFound,
      linkUrl,
      contentValid,
      gdprMentions,
      wordCount
    },
  }
}

/**
 * 6. Form compliance check
 * Looks for forms collecting personal data
 */
async function checkForms(page) {
  const formResults = await page.evaluate(() => {
    const personalFieldTypes  = ['email', 'tel', 'text', 'password', 'search', 'url']
    const personalFieldNames  = /name|email|phone|address|postcode|zip|dob|birth|ssn|passport|credit|card|bank|account|username|password/i
    const consentPatterns     = /consent|agree|privacy|terms|gdpr/i

    return Array.from(document.querySelectorAll('form')).map((form, i) => {
      const inputs  = Array.from(form.querySelectorAll('input, textarea'))
      const isPersonal = inputs.some(input =>
        personalFieldTypes.includes(input.type) ||
        personalFieldNames.test(input.name) ||
        personalFieldNames.test(input.id) ||
        personalFieldNames.test(input.placeholder || '')
      )

      if (!isPersonal) return null

      const checkboxes    = inputs.filter(i => i.type === 'checkbox')
      const consentBox    = checkboxes.find(cb =>
        consentPatterns.test(cb.name) ||
        consentPatterns.test(cb.id) ||
        consentPatterns.test(cb.closest('label')?.innerText || '')
      )
      const privacyLink   = form.querySelector('a[href*="privacy"], a[href*="datenschutz"]')
      const formText      = form.innerText?.toLowerCase() || ''
      const mentionsPrivacy = /privacy|gdpr|data protection|consent/i.test(formText)

      // Analyze input fields
      const fieldAnalysis = inputs
        .filter(input => personalFieldTypes.includes(input.type) || personalFieldNames.test(input.name) || personalFieldNames.test(input.id))
        .map(input => ({
          name: input.name || input.id || 'unnamed',
          type: input.type,
          required: input.required,
          placeholder: input.placeholder || '',
          hasLabel: !!input.closest('label')?.innerText
        }))

      return {
        formIndex:      i,
        action:        form.action || form.getAttribute('action') || '',
        method:        form.method || 'GET',
        fieldCount:     fieldAnalysis.length,
        hasConsentBox:  !!consentBox,
        hasPrivacyLink: !!privacyLink,
        mentionsPrivacy,
        compliant:      (!!consentBox || mentionsPrivacy) && !!privacyLink,
        fields:        fieldAnalysis,
      }
    }).filter(Boolean)
  })

  const personalForms   = formResults.length
  const nonCompliant    = formResults.filter(f => !f.compliant).length
  const pass            = personalForms === 0 || nonCompliant === 0

  return {
    id:       'forms',
    name:     'Form compliance',
    pass,
    severity: nonCompliant > 0 ? 'warning' : 'pass',
    detail:   personalForms === 0
      ? 'No forms collecting personal data detected.'
      : pass
        ? `${personalForms} form(s) found — all appear compliant.` 
        : `${nonCompliant} of ${personalForms} form(s) missing consent checkbox or privacy link.`,
    gdprArticle: 'GDPR Article 6 — Lawfulness of processing',
    fix: pass ? null : 'Add a checkbox to each form: "I have read and agree to the Privacy Policy [link]". The checkbox must be unchecked by default.',
    data: { 
      forms: formResults,
      summary: {
        totalForms: personalForms,
        compliantForms: personalForms - nonCompliant,
        nonCompliantForms: nonCompliant,
        totalFields: formResults.reduce((sum, f) => sum + f.fieldCount, 0),
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Score calculator
// ---------------------------------------------------------------------------
function calculateScore(checks) {
  const weights = {
    critical: 25,
    warning:  10,
    pass:     0,
  }

  let score = 100
  for (const check of checks) {
    if (!check.pass) {
      score -= weights[check.severity] || 0
    }
  }

  score = Math.max(0, Math.round(score))

  let grade, status
  if (score >= 80)      { grade = 'A'; status = 'compliant' }
  else if (score >= 60) { grade = 'B'; status = 'partial' }
  else if (score >= 40) { grade = 'C'; status = 'non-compliant' }
  else                  { grade = 'F'; status = 'non-compliant' }

  return { score, grade, status }
}

// ---------------------------------------------------------------------------
// Main scan runner
// ---------------------------------------------------------------------------
async function runScan(targetUrl) {
  // Normalise URL
  if (!targetUrl.startsWith('http')) {
    targetUrl = 'https://' + targetUrl
  }

  const startTime = Date.now()
  const browser   = await getBrowser()
  const context   = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport:  { width: 1280, height: 800 },
    locale:    'en-GB',  // Triggers GDPR-targeted behaviour on many EU-aware sites
    extraHTTPHeaders: {
      'Accept-Language': 'en-GB,en;q=0.9',
    },
  })

  const page = await context.newPage()

  // Set up tracker listener BEFORE navigation (captures all requests)
  const trackerCheck = checkTrackers(page)

  // Set realistic user agent to avoid blocking
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  })

  let navigationError = null
  try {
    // Navigate to target URL
    const response = await page.goto(targetUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    
    if (!response?.ok()) {
      if (response?.status() === 403) {
        throw new Error(`Access denied (403). The website is blocking automated scans.`)
      } else if (response?.status() === 301 || response?.status() === 302) {
        const location = response.headers()['location']
        if (location) {
          // Follow redirect
          await page.goto(location, { 
            waitUntil: 'networkidle',
            timeout: 30000 
          })
        }
      } else {
        throw new Error(`Failed to load ${targetUrl}: ${response?.status()}`)
      }
    }

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(5000)
  } catch (err) {
    navigationError = err.message
  }

  // Run all checks in parallel where possible
  const [
    cookieResult,
    trackerResult,
    consentResult,
    privacyResult,
    formResult,
  ] = await Promise.all([
    checkCookies(page),
    trackerCheck,
    checkConsentBanner(page),
    checkPrivacyPolicy(page),
    checkForms(page),
  ])

  const httpsResult = checkHttps(targetUrl)

  await context.close()
  await browser.close()

  const checks  = [httpsResult, cookieResult, trackerResult, consentResult, privacyResult, formResult]
  const scoring = calculateScore(checks)

  const criticalIssues = checks.filter(c => c.severity === 'critical')
  const warnings       = checks.filter(c => c.severity === 'warning')
  const passed         = checks.filter(c => c.pass)

  return {
    meta: {
      url:           targetUrl,
      scannedAt:     new Date().toISOString(),
      durationMs:    Date.now() - startTime,
      scannerVersion:'1.0.0',
      navigationError,
    },
    scoring: {
      ...scoring,
      totalChecks:    checks.length,
      criticalCount:  criticalIssues.length,
      warningCount:   warnings.length,
      passedCount:    passed.length,
    },
    checks,
    // Convenience flat lists for PDFBolt template
    criticalIssues: criticalIssues.map(c => ({
      name:       c.name,
      detail:     c.detail,
      fix:        c.fix,
      gdprArticle:c.gdprArticle,
    })),
    warnings: warnings.map(c => ({
      name:       c.name,
      detail:     c.detail,
      fix:        c.fix,
      gdprArticle:c.gdprArticle,
    })),
    passed: passed.map(c => ({
      name:   c.name,
      detail: c.detail,
    })),
    // Full cookie + tracker tables for PDF report pages
    cookieTable:   cookieResult.data?.cookies  || [],
    trackerList:   trackerResult.data?.trackers || [],
  }
}

module.exports = { runScan }
