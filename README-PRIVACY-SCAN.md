# PrivacyScan - GDPR/CCPA Compliance Scanner

Complete website privacy compliance scanner with automated PDF reporting and Stripe payments.

## Architecture

```
User → Vercel (Next.js frontend) → Railway (API) → Browserless (scanner)
                                           ↓
                                    Supabase (DB + Storage)
                                           ↓
                              PDFBolt (PDF) + Resend (Email) + Stripe (Payments)
```

## Quick Start

### 1. Install Dependencies

```bash
# Install API dependencies
npm install

# Install Playwright Chromium
npx playwright install chromium
```

### 2. Set Up Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase-schema.sql
   ```
3. Get credentials from Settings → API:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (service role, NOT anon)

### 3. Set Up Stripe

1. Get test keys at [stripe.com](https://stripe.com)
2. Configure webhook:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/webhook/stripe
   ```
3. Copy the webhook secret output

### 4. Get Other API Keys

- **Browserless** (free): https://browserless.io - 1000 units/month
- **PDFBolt**: https://pdfbolt.com - Create Handlebars template
- **Resend** (free): https://resend.com - 3000 emails/month

### 5. Configure Environment

```bash
cp .env.api.example .env
# Edit .env with your keys
```

### 6. Run Locally

```bash
# Start API server
npm start

# Test scanner standalone
npm run scan:test https://example.com
```

### 7. Deploy

**Railway (Recommended)**
1. Push to GitHub
2. Connect repo to Railway
3. Add environment variables in Railway dashboard
4. Deploy

**Vercel (Frontend)**
```bash
vercel --prod
```

## File Structure

```
api/
├── scanner.js      # Playwright compliance engine (6 checks)
└── server.js       # Express API + Stripe webhooks

app/
└── website/
    └── page.tsx    # Frontend scanner UI

supabase-schema.sql  # Database setup
.env.api.example     # Environment template
```

## Compliance Checks

1. **HTTPS Enforcement** - TLS certificate validation
2. **Cookie Audit** - Pre-consent tracking detection
3. **Tracker Detection** - Network interception for 20+ trackers
4. **Consent Banner** - CMP detection (Cookiebot, CookieYes, etc.)
5. **Privacy Policy** - Link + GDPR content validation
6. **Form Compliance** - Consent checkbox verification

## Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| Free Scan | $0 | Score + issues list |
| Full Report | $49 | 5-page PDF + email delivery |
| Monthly | $49/mo | Automatic rescans + alerts |

## Running Costs (Free Tier)

| Service | Cost |
|---------|------|
| Vercel | $0 |
| Supabase | $0 (500MB) |
| Browserless | $0 (1000 scans) |
| Railway | ~$5/mo (if self-hosted) |
| Resend | $0 (3000 emails) |
| **Total** | **~$5-8/month** |

## API Endpoints

```
POST /webhook/stripe    - Stripe payment webhook
GET  /report/:scanId    - Get presigned PDF download URL
GET  /health            - Health check
```

## PDF Template Variables

PDFBolt template receives these Handlebars variables:

```handlebars
{{domain}}              - example.com
{{score}}               - 67
{{grade}}               - C
{{status}}              - non-compliant
{{criticalCount}}       - 2
{{criticalIssues}}      - Array of issues
{{cookies}}             - Array of cookies
{{trackers}}            - Array of trackers
{{generatedAt}}         - 4 April 2025
```

## Support

For issues or questions, refer to the architecture diagrams in the docs folder.
