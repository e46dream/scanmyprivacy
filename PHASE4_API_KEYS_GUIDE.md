# Phase 4: Payment API Keys Setup Guide

## Overview
You need 3 payment providers:
1. **Stripe** - Credit/Debit cards (Global)
2. **PayPal** - PayPal payments (Global)
3. **Razorpay** - UPI/NetBanking (India)

---

## 1. STRIPE SETUP (Card Payments)

### Step 1: Create Account
1. Go to https://dashboard.stripe.com/register
2. Sign up with your email
3. Verify email
4. Complete business profile (can use personal info for testing)

### Step 2: Get API Keys
1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Click **Reveal test key** next to **Secret key**
3. Copy the key (starts with `sk_test_`)

**Save this:** `STRIPE_SECRET_KEY=sk_test_xxxxxxxx`

### Step 3: Webhook Setup (Required)

**Option A: Using Railway (Production)**
1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://scanmyprivacy-api-production.up.railway.app/webhook/stripe`
4. Select events: `payment_intent.succeeded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

**Save this:** `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx`

**Option B: Local Testing**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
scoop install stripe                    # Windows

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:8080/webhook/stripe
```

---

## 2. PAYPAL SETUP

### Step 1: Create Developer Account
1. Go to https://developer.paypal.com
2. Click **Log in to Dashboard** (use your existing PayPal account or create one)
3. Accept developer terms

### Step 2: Create App
1. Go to **Apps & Credentials**
2. Click **Create App**
3. App Name: `ScanMyPrivacy`
4. Select **Merchant** app type
5. Click **Create App**

### Step 3: Get Credentials
Under your new app, you'll see:
- **Client ID** (long string)
- **Secret** (click Show)

**Save these:**
```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
PAYPAL_ENV=sandbox
```

### Step 4: Webhook (Optional for testing)
1. In your app, go to **Webhooks**
2. Add webhook URL: `https://scanmyprivacy-api-production.up.railway.app/webhook/paypal`
3. Event type: `Payment capture completed`

---

## 3. RAZORPAY/UPI SETUP (India Payments)

### Step 1: Create Account
1. Go to https://dashboard.razorpay.com
2. Sign up with email
3. Verify email and phone
4. Complete KYC (required for live mode, skip for testing)

### Step 2: Get Test API Keys
1. In Dashboard, go to **Settings** → **API Keys**
2. Switch to **Test Mode** (toggle at top)
3. Click **Generate Key** or **View Key**
4. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

**Save these:**
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret
```

### Step 3: Webhook Setup
1. Dashboard → **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Webhook URL: `https://scanmyprivacy-api-production.up.railway.app/webhook/razorpay`
4. Select events:
   - `payment.captured`
   - `order.paid`
5. Click **Create Webhook**
6. Copy **Webhook Secret**

---

## ADD TO RAILWAY

Once you have all keys, add them to Railway:

```bash
cd /home/sunil/Documents/Sunil/Trades/Test_Sandbox/IP_Project/scanmyprivacy

railway variables set STRIPE_SECRET_KEY="sk_test_xxx" --service=scanmyprivacy-api
railway variables set STRIPE_WEBHOOK_SECRET="whsec_xxx" --service=scanmyprivacy-api
railway variables set PAYPAL_CLIENT_ID="your_id" --service=scanmyprivacy-api
railway variables set PAYPAL_SECRET="your_secret" --service=scanmyprivacy-api
railway variables set PAYPAL_ENV="sandbox" --service=scanmyprivacy-api
railway variables set RAZORPAY_KEY_ID="rzp_test_xxx" --service=scanmyprivacy-api
railway variables set RAZORPAY_KEY_SECRET="your_secret" --service=scanmyprivacy-api
```

Or use Railway Dashboard:
1. Go to https://railway.app
2. Select your project
3. Click **Variables** tab
4. Add each key one by one

---

## TEST PAYMENTS

### Stripe Test Card
- Card: `4242 4242 4242 4242`
- Date: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits

### PayPal Sandbox
Use PayPal Sandbox accounts created in developer dashboard.

### Razorpay Test UPI
- UPI ID: `success@razorpay`
- Or use test cards in Razorpay dashboard

---

## CHECKLIST

- [ ] Stripe account created
- [ ] Stripe Secret Key copied
- [ ] Stripe Webhook Secret copied
- [ ] PayPal Developer account
- [ ] PayPal Client ID copied
- [ ] PayPal Secret copied
- [ ] Razorpay account created
- [ ] Razorpay Key ID copied
- [ ] Razorpay Key Secret copied
- [ ] All keys added to Railway
- [ ] Redeploy Railway service

---

## NEXT: Phase 6 (PDFBolt) & Phase 7 (Resend)

After payments work, we need:
- **PDFBolt**: For generating PDF reports
- **Resend**: For sending email with PDF attached

Want to continue with those next?
