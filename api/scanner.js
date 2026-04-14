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
  '[data-cc]',                   // Cookie Consent
  '[data-consent]',
  '[data-cookie]',
  
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
  /privacy[\s-_]?&[\s-_]?cookies/i,  // Privacy & cookies (ampersand)
  /cookies[\s-_]?policy/i,
  /privacy[\s-_]?&[\s-_]?cookie[\s-_]?policy/i,  // Privacy & cookie policy
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
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process,AutomationControlled',
      '--disable-site-isolation-trials',
      '--disable-web-security',
      '--disable-features=InterestCohort',  // Disable FLoC
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
    headless: true,
  })
}

// ---------------------------------------------------------------------------
// Individual check functions
// ---------------------------------------------------------------------------

/**
 * 1. HTTPS check
 * Verifies the site uses HTTPS and detects redirects
 */
function checkHttps(originalUrl, finalUrl, redirectOccurred) {
  let originalIsHttps = false
  let finalIsHttps = false
  let userEnteredHttp = false
  
  try {
    const originalParsed = new URL(originalUrl)
    const finalParsed = new URL(finalUrl)
    
    originalIsHttps = originalParsed.protocol === 'https:'
    finalIsHttps = finalParsed.protocol === 'https:'
    userEnteredHttp = originalParsed.protocol === 'http:'
  } catch (err) {
    console.log('Debug: URL parsing error:', err.message)
    // If URL parsing fails, assume HTTPS is not enforced
    return {
      id: 'https',
      name: 'HTTPS enforcement',
      pass: false,
      severity: 'critical',
      detail: 'Could not verify HTTPS status due to URL parsing error.',
      gdprArticle: 'GDPR Article 32 — Security of processing',
      fix: 'Ensure the website uses valid HTTPS URLs.',
    }
  }
  
  console.log('Debug HTTPS check:', {
    originalUrl,
    finalUrl,
    redirectOccurred,
    originalIsHttps,
    finalIsHttps,
    userEnteredHttp,
    redirectedToHttps
  })
  
  // Pass if final URL is HTTPS, or if user entered HTTP and got redirected to HTTPS
  const isSecure = finalIsHttps || redirectedToHttps

  return {
    id: 'https',
    name: 'HTTPS enforcement',
    pass: isSecure,
    severity: isSecure ? 'pass' : 'critical',
    detail: isSecure
      ? redirectedToHttps 
        ? `Site automatically redirects HTTP to HTTPS (good security practice).`
        : 'Site is served over HTTPS.'
      : 'Site is not using HTTPS. All data is transmitted in plain text.',
    gdprArticle: 'GDPR Article 32 — Security of processing',
    fix: isSecure
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

  console.log('Debug: Checking for cookie banner...')
  
  for (const selector of CMP_SIGNATURES) {
    const element = await page.$(selector)
    if (element) {
      const visible = await element.isVisible()
      console.log(`Debug: Selector ${selector} found, visible=${visible}`)
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
  
  console.log(`Debug: Banner detection result: found=${bannerFound}, selector=${bannerSelector}`)

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

  // Try to trigger consent banners with common interactions
  if (!bannerFound) {
    try {
      // Click on cookie settings links
      await page.evaluate(() => {
        const cookieLinks = Array.from(document.querySelectorAll('a')).filter(link => {
          const text = link.textContent?.toLowerCase() || ''
          return text.includes('cookie') || text.includes('privacy') || text.includes('preferences')
        })
        
        // Click first cookie/privacy link to potentially trigger banner
        if (cookieLinks.length > 0) {
          cookieLinks[0].click()
        }
      })
      
      // Wait for potential banner to appear
      await page.waitForTimeout(2000)
      
      // Check again for banners
      const afterClickBanners = await page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase()
        const bannerKeywords = ['accept all', 'reject all', 'cookie settings', 'manage cookies', 'consent']
        return bannerKeywords.some(kw => bodyText.includes(kw))
      })
      
      if (afterClickBanners) {
        bannerFound = true
        bannerType = 'Interaction-triggered'
      }
    } catch (err) {
      console.log('Interaction attempt failed:', err.message)
    }
  }

  // Check for iframe-based consent banners
  if (!bannerFound) {
    const iframeBanners = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe')
      for (const iframe of iframes) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            const iframeText = iframeDoc.body.innerText.toLowerCase()
            if (iframeText.includes('cookie') || iframeText.includes('consent')) {
              return true
            }
          }
        } catch (e) {
          // Cross-origin iframe, can't access
        }
      }
      return false
    })
    
    if (iframeBanners) {
      bannerFound = true
      bannerType = 'Iframe-based'
    }
  }

  // Try scrolling to trigger lazy-loaded consent banners
  if (!bannerFound) {
    try {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2)
      })
      await page.waitForTimeout(1000)
      
      const scrollBanners = await page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase()
        const bannerKeywords = ['cookie', 'consent', 'privacy', 'accept all', 'reject all']
        return bannerKeywords.some(kw => bodyText.includes(kw))
      })
      
      if (scrollBanners) {
        bannerFound = true
        bannerType = 'Scroll-triggered'
      }
    } catch (err) {
      console.log('Scroll attempt failed:', err.message)
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
  console.log('Debug: Checking for privacy policy...')
  
  // Check for privacy policy links in page
  const privacyLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'))
    return links.map(link => ({
      href: link.href,
      text: link.textContent?.trim() || '',
      title: link.title || ''
    }))
  })
  
  console.log(`Debug: Found ${privacyLinks.length} links on page`)
  console.log('Debug: Sample links:', privacyLinks.slice(0, 10).map(l => `${l.text} -> ${l.href}`))

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
        console.log(`Debug: Privacy link found: ${link.text} -> ${link.href} (matched: ${pattern})`)
        break
      }
    }
    if (linkFound) break
  }
  
  if (!linkFound) {
    console.log('Debug: No privacy policy link found. Checked patterns:', PRIVACY_LINK_PATTERNS.map(p => p.toString()).slice(0, 5))
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
  // Preserve original URL for redirect detection
  const originalUserUrl = targetUrl
  
  // Only normalize if user didn't specify a protocol
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl
  }

  const startTime = Date.now()
  const browser   = await getBrowser()
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport:  { width: 1920, height: 1080 },
    screen:    { width: 1920, height: 1080 },
    locale:    'en-GB',
    timezoneId: 'Europe/London',
    bypassCSP: true,
    javaScriptEnabled: true,
    hasTouch: false,
    isMobile: false,
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    extraHTTPHeaders: {
      'Accept-Language': 'en-GB,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  })

  const page = await context.newPage()

  // Set up tracker listener BEFORE navigation (captures all requests)
  const trackerCheck = checkTrackers(page)

  // Mock webdriver property to avoid detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    })
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5]
    })
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-GB', 'en-US', 'en']
    })
    window.chrome = { runtime: {} }
  })

  console.log('Debug: Starting scan for', originalUserUrl, 'normalized to', targetUrl)

  let navigationError = null
  let originalUrl = targetUrl // Store original URL
  let finalUrl = targetUrl      // Will be updated if redirect occurs
  let redirectOccurred = false

  try {
    // Navigate to target URL and track redirects
    console.log('Debug: Navigating to URL:', targetUrl)
    console.log('Debug: URL type:', typeof targetUrl)
    console.log('Debug: URL length:', targetUrl?.length)
    
    // Validate URL before navigation
    try {
      new URL(targetUrl)
      console.log('Debug: URL is valid')
    } catch (e) {
      console.log('Debug: URL validation failed:', e.message)
    }
    
    // Add random delay to appear more human-like
    await page.waitForTimeout(Math.floor(Math.random() * 1000) + 500)
    
    const response = await page.goto(targetUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    })
    
    // Get final URL after all redirects
    const pageUrl = page.url()
    console.log('Debug: Page URL after navigation:', pageUrl)
    
    // Only use page URL if it's valid (not about:blank or empty)
    if (pageUrl && pageUrl.startsWith('http')) {
      finalUrl = pageUrl
    }
    console.log('Debug: Final URL set to:', finalUrl)
    
    // Check if redirect occurred by comparing original and final URLs
    if (originalUserUrl !== finalUrl && targetUrl !== finalUrl) {
      redirectOccurred = true
      console.log('Debug: Redirect detected from', originalUserUrl, 'to', finalUrl)
    }
    
    if (!response?.ok()) {
      if (response?.status() === 403) {
        throw new Error(`Access denied (403). The website is blocking automated scans.`)
      } else {
        throw new Error(`Failed to load ${targetUrl}: ${response?.status()}`)
      }
    }
  } catch (err) {
    navigationError = err.message
    console.log('Debug: Navigation error:', err.message)
    // Ensure finalUrl is valid even after error
    if (!finalUrl || !finalUrl.startsWith('http')) {
      finalUrl = targetUrl
      console.log('Debug: Reset finalUrl to targetUrl after error:', finalUrl)
    }
  }

  console.log('Debug: About to run checks...')
  console.log('Debug: originalUserUrl:', originalUserUrl)
  console.log('Debug: finalUrl:', finalUrl)
  console.log('Debug: redirectOccurred:', redirectOccurred)
  console.log('Debug: navigationError:', navigationError)
  
  // If navigation failed, return early with error result
  if (navigationError) {
    await context.close()
    await browser.close()
    
    return {
      meta: {
        url: finalUrl,
        originalUrl: originalUserUrl,
        redirectOccurred,
        scannedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        scannerVersion:'1.0.0',
        navigationError,
      },
      scoring: {
        score: 0,
        grade: 'F',
        totalChecks: 6,
        criticalCount: 6,
        warningCount: 0,
        passedCount: 0,
      },
      checks: [
        { id: 'https', name: 'HTTPS check', pass: false, severity: 'critical', detail: 'Could not verify due to navigation error: ' + navigationError },
        { id: 'cookies', name: 'Cookie audit', pass: false, severity: 'critical', detail: 'Could not check due to navigation error: ' + navigationError },
        { id: 'trackers', name: 'Tracker detection', pass: false, severity: 'critical', detail: 'Could not check due to navigation error: ' + navigationError },
        { id: 'consent', name: 'Consent banner', pass: false, severity: 'critical', detail: 'Could not check due to navigation error: ' + navigationError },
        { id: 'privacy', name: 'Privacy policy', pass: false, severity: 'critical', detail: 'Could not check due to navigation error: ' + navigationError },
        { id: 'forms', name: 'Form security', pass: false, severity: 'critical', detail: 'Could not check due to navigation error: ' + navigationError },
      ],
      criticalIssues: [],
      warnings: [],
      passed: [],
      cookieTable: [],
      trackerList: [],
    }
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

  const httpsResult = checkHttps(originalUserUrl, finalUrl, redirectOccurred)

  await context.close()
  await browser.close()

  const checks  = [httpsResult, cookieResult, trackerResult, consentResult, privacyResult, formResult]
  const scoring = calculateScore(checks)

  const criticalIssues = checks.filter(c => c.severity === 'critical')
  const warnings       = checks.filter(c => c.severity === 'warning')
  const passed         = checks.filter(c => c.pass)

  return {
    meta: {
      url: finalUrl,
      originalUrl: originalUserUrl,
      redirectOccurred,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
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
