# ScanMyPrivacy.com — Complete Deployment Guide

**Domain:** scanmyprivacy.com (Namecheap)  
**Stack:** Next.js (Vercel) + Playwright API (Railway) + Supabase

---

## 1. HOSTING ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     scanmyprivacy.com                       │
│                      (Namecheap DNS)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────┐              ┌──────────────┐
│   Vercel    │              │   Railway    │
│  Frontend   │◄────────────►│   API Server │
│  (Next.js)  │   API calls  │  (scanner)   │
└─────────────┘              └──────┬───────┘
                                    │
                       ┌────────────┼────────────┐
                       │            │            │
                       ▼            ▼            ▼
                  ┌────────┐   ┌────────┐   ┌────────┐
                  │Supabase│   │ Stripe │   │Browser-│
                  │DB+Storage    │Payments│   │less.io │
                  └────────┘   └────────┘   └────────┘
```

---

## 2. STEP-BY-STEP DEPLOYMENT

### Phase 1: Supabase Setup (Database + Storage)

**Time:** 10 minutes  
**Cost:** FREE (500MB limit)

1. Go to https://supabase.com
2. Click "New Project"
3. Name: `scanmyprivacy`
4. Region: Choose closest to your users (US East Coast recommended)
5. Click "Create Project"
6. Wait ~2 minutes for provisioning

**Get Credentials:**
1. Go to Project Settings → API
2. Copy these values:
   - `SUPABASE_URL`: `https://xxxxx.supabase.co`
   - `SUPABASE_SERVICE_KEY`: Service role secret (NOT the anon key)

**Run Database Setup:**
1. In left sidebar, click "SQL Editor"
2. Click "New Query"
3. Copy entire contents from `supabase-schema.sql` (file in your repo)
4. Click "Run"
5. Verify: Tables should show in left sidebar under "Database"

---

### Phase 2: Vercel Frontend Deployment

**Time:** 5 minutes  
**Cost:** FREE

1. Push your code to GitHub
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to https://vercel.com
3. Sign up with GitHub
4. Click "Add New Project"
5. Import your GitHub repo
6. Framework: Next.js (auto-detected)
7. Click "Deploy"
8. Wait ~1 minute

**Configure Custom Domain:**
1. In Vercel dashboard, click your project
2. Go to "Settings" → "Domains"
3. Add `scanmyprivacy.com`
4. Vercel will show DNS records:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com
5. Go to Namecheap dashboard
6. Navigate to Domain List → Manage → Advanced DNS
7. Add the records Vercel provided
8. Back in Vercel, click "Refresh" (can take 5-60 minutes)

**Environment Variables:**
1. Vercel → Project → Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
   ```
   (We'll get the Railway URL in Phase 3)

---

### Phase 3: Railway API Deployment

**Time:** 10 minutes  
**Cost:** ~$5/month (or FREE with Railway credits)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Railway auto-detects Node.js
6. Click "Deploy"

**Configure Environment Variables:**
1. In Railway dashboard, click your project
2. Go to "Variables" tab
3. Add all variables (see API Keys section below):
   ```
   BROWSERLESS_TOKEN=...
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   PDFBOLT_API_KEY=...
   PDFBOLT_TEMPLATE_ID=...
   RESEND_API_KEY=...
   NEXT_PUBLIC_URL=https://scanmyprivacy.com
   ```

**Get Railway URL:**
1. Go to "Settings" tab
2. Copy "Domain" (e.g., `scanmyprivacy-api.up.railway.app`)
3. Go back to Vercel
4. Update `NEXT_PUBLIC_API_URL` with this Railway URL

**Install Playwright:**
1. Railway dashboard → your project
2. Go to "Settings" → "Deploy"
3. Add build command:
   ```
   npx playwright install chromium && npm start
   ```

---

### Phase 4: Stripe Setup

**Time:** 15 minutes  
**Cost:** 2.9% + 30¢ per transaction

1. Go to https://stripe.com
2. Create account
3. Complete verification (business details)
4. Go to Developers → API Keys
5. Copy `Secret key` (starts with `sk_test_` for testing)
6. Add to Railway environment variables

**Webhook Setup:**
1. Install Stripe CLI locally:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop install stripe
   ```

2. Login:
   ```bash
   stripe login
   ```

3. Forward webhooks to Railway:
   ```bash
   stripe listen --forward-to https://your-railway-url.up.railway.app/webhook/stripe
   ```

4. This will output:
   ```
   Ready! Your webhook signing secret is whsec_xxxxxxxx (copy this!)
   ```

5. Add `whsec_xxxxxxxx` to Railway as `STRIPE_WEBHOOK_SECRET`

**Production Webhook:**
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-railway-url.up.railway.app/webhook/stripe`
3. Select events: `payment_intent.succeeded`
4. Copy signing secret for production

---

### Phase 5: Browserless Setup

**Time:** 2 minutes  
**Cost:** FREE (1000 units/month)

1. Go to https://browserless.io
2. Sign up with GitHub
3. Go to Dashboard
4. Copy your API token
5. Add to Railway as `BROWSERLESS_TOKEN`

**Usage:**
- 1 scan ≈ 2-4 units
- 1000 units = ~250-500 free scans/month

---

### Phase 6: PDFBolt Setup

**Time:** 10 minutes  
**Cost:** ~$9/month (or pay-per-use)

1. Go to https://pdfbolt.com
2. Sign up
3. Create a new template
4. Use Handlebars syntax with these variables:
   ```handlebars
   {{domain}}
   {{score}}
   {{grade}}
   {{status}}
   {{criticalCount}}
   {{criticalIssues}}
   {{cookies}}
   {{trackers}}
   {{generatedAt}}
   ```
5. Save template → Copy Template ID
6. Go to API Keys → Copy API Key
7. Add both to Railway variables:
   ```
   PDFBOLT_API_KEY=...
   PDFBOLT_TEMPLATE_ID=...
   ```

---

### Phase 7: Resend Setup (Email)

**Time:** 5 minutes  
**Cost:** FREE (3000 emails/month)

1. Go to https://resend.com
2. Sign up with GitHub
3. Go to API Keys
4. Create new key → Copy
5. Add to Railway as `RESEND_API_KEY`

**Verify Domain (for production):**
1. Resend dashboard → Domains
2. Add domain: `scanmyprivacy.com`
3. Follow DNS verification steps (add records in Namecheap)
4. Wait for verification (can take a few hours)

---

## 3. API KEYS CHEAT SHEET

| Service | What It's For | Where to Get | Free Tier |
|---------|--------------|--------------|-----------|
| **Supabase** | Database, PDF storage | supabase.com | 500MB DB + 1GB storage |
| **Browserless** | Headless Chrome scanning | browserless.io | 1000 units/month |
| **Stripe** | Payments ($49 reports) | stripe.com | No fees until you earn |
| **PDFBolt** | PDF generation | pdfbolt.com | Pay per use |
| **Resend** | Email delivery | resend.com | 3000 emails/month |
| **Railway** | API hosting | railway.app | $5 credit/month |
| **Vercel** | Frontend hosting | vercel.com | Unlimited |

---

## 4. VERIFY EVERYTHING WORKS

### Test 1: Free Scan
1. Visit https://scanmyprivacy.com
2. Enter `example.com`
3. Click "Scan Now"
4. Should show score and issues within 10 seconds

### Test 2: Payment Flow
1. Run scan on any URL
2. Enter your email
3. Click "Buy Detailed Report - $49"
4. Should redirect to Stripe checkout
5. Use test card: `4242 4242 4242 4242`, any future date, any CVC
6. Complete payment
7. Check email for report (within 2 minutes)

### Test 3: Webhook
1. Check Railway logs:
   ```
   Railway → Project → Deployments → Logs
   ```
2. Should see:
   ```
   [job-id] Starting scan for https://example.com
   [job-id] Scan complete — score: 67
   [job-id] PDF generated — 245 KB
   [job-id] Job complete
   [job-id] Delivery email sent to user@example.com
   ```

---

## 5. TROUBLESHOOTING

### Domain not connecting
- Check DNS records in Namecheap match Vercel's requirements
- Wait up to 24 hours for propagation
- Test: `dig scanmyprivacy.com` should show Vercel IPs

### API not responding
- Check Railway logs for errors
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches Railway domain
- Test: `curl https://your-railway-url.up.railway.app/health`

### Stripe webhook failing
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Check Railway logs for signature errors
- Webhook must return 200 in < 10 seconds

### PDF not generating
- Check `PDFBOLT_API_KEY` and `PDFBOLT_TEMPLATE_ID`
- Verify template variables match scanner output
- Test PDFBolt directly via their API docs

### Email not sending
- Verify `RESEND_API_KEY`
- Check Resend dashboard for sent emails
- Domain must be verified in Resend for production

---

## 6. MONTHLY COSTS (Realistic)

| Service | Expected Cost |
|---------|--------------|
| Namecheap domain | ~$12/year |
| Vercel (frontend) | FREE |
| Railway (API) | ~$5-10/month |
| Supabase | FREE (under limits) |
| Browserless | FREE (under 1000 units) |
| Resend | FREE (under 3000 emails) |
| Stripe | 2.9% + 30¢ per $49 sale |
| PDFBolt | ~$0.10 per PDF |
| **Total fixed cost** | **~$8/month** |

**Break-even:** At ~2 paid reports/month, you're profitable.

---

## 7. NEXT STEPS AFTER DEPLOYMENT

1. **Set up monitoring:** Railway + Vercel both have built-in analytics
2. **Add Google Analytics:** Track conversion from free scan to paid
3. **Create affiliate accounts:** NordVPN, Bitwarden for additional revenue
4. **Set up alerts:** Get notified when scans fail or payments come in
5. **Optimize PDFBolt template:** Make the $49 report visually stunning

---

## Support Resources

- **Vercel:** https://vercel.com/docs
- **Railway:** https://docs.railway.app
- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **Browserless:** https://docs.browserless.io
- **PDFBolt:** https://pdfbolt.com/docs
- **Resend:** https://resend.com/docs

---

**Your privacy compliance scanner is now ready to generate revenue!**
