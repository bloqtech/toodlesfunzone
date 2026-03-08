# Production payment flow checklist

Use this when going live with real payments (Razorpay Live mode).

---

## 1. Razorpay Dashboard (Live mode)

- [ ] Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
- [ ] Switch to **Live mode** (toggle top-right).
- [ ] Go to **Settings → API Keys** → **Generate Key** (or use existing Live key).
- [ ] Copy **Key ID** (`rzp_live_...`) and **Key Secret**; keep the secret secure.

---

## 2. Webhook (recommended for production)

- [ ] In Dashboard (Live mode): **Settings → Webhooks** → **Add New Webhook**.
- [ ] **URL:** `https://your-production-domain.com/api/payment/webhook`
- [ ] **Events:** Select at least **payment.captured**.
- [ ] **Secret:** Generate or set a secret; copy it (you’ll add it to env).
- [ ] In production `.env` (or hosting env vars), set:
  ```env
  RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
  ```
- [ ] Save. Razorpay will send payment events to this URL; the app verifies the signature and can confirm bookings if the frontend didn’t complete.

---

## 3. Production environment variables

Set these **only in production** (e.g. EC2 `.env`, Render/Heroku env vars). Do **not** use test keys in production.

| Variable | Value | Notes |
|----------|--------|------|
| `NODE_ENV` | `production` | Enables production checks (e.g. rejects test keys). |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | From Dashboard → API Keys (Live). |
| `RAZORPAY_KEY_SECRET` | Your Live secret | From same page; keep private. |
| `RAZORPAY_WEBHOOK_SECRET` | Your webhook secret | From Settings → Webhooks. |
| `DATABASE_URL` | Production DB URL | Same DB you use for live data. |
| `SESSION_SECRET` | Strong random string | For sessions. |
| `ADMIN_EMAIL` | Toodles notification email | “New Booking” emails go here. |
| `SMTP_*` | Production SMTP | So customer and admin emails send. |

---

## 4. What the app does in production

- **Create order:** Uses `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. If `NODE_ENV=production` and keys are `rzp_test_...`, the app throws and refuses to create orders.
- **Verify payment:** Signature is checked with `RAZORPAY_KEY_SECRET` before creating/confirming the booking.
- **Webhook:** `POST /api/payment/webhook` receives Razorpay events. Signature is verified with `RAZORPAY_WEBHOOK_SECRET`. On `payment.captured`, if a booking exists for that payment and is not yet completed, it is marked completed and confirmed (backup if the user closed the browser after paying).

---

## 5. After deploy

- [ ] Restart the app so it loads Live keys and webhook secret.
- [ ] Do **one real payment** (small amount) end-to-end: create booking → pay with real card → see “Booking Confirmed” and check admin email.
- [ ] In Razorpay Dashboard → **Payments**, confirm the payment appears.
- [ ] Optionally trigger a test webhook from Dashboard to confirm the endpoint responds 200 and logs as expected.

---

## 6. Security reminders

- Never commit `.env` or Live secrets to git.
- Use **Live** keys only in production; use **Test** keys only in local/staging.
- Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` server-side only (never in frontend).
