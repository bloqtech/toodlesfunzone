# Step-by-step: Roll out payment changes to production

Use this to take the payment flow (Razorpay Live, webhook, emails) live on production (e.g. EC2 / toodlesfunzone.com).

---

## Phase 1 — Before you deploy

### Step 1.1 — Razorpay Live keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com) and log in.
2. Switch to **Live mode** (toggle at top-right).
3. Go to **Settings → API Keys**.
4. Click **Generate Key** (or use an existing Live key).
5. Copy and store securely:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret**

You will set these only in production env (Step 2.2).

---

### Step 1.2 — Razorpay webhook (production)

1. In Razorpay Dashboard (Live mode): **Settings → Webhooks**.
2. Click **Add New Webhook**.
3. **Webhook URL:**  
   `https://YOUR_PRODUCTION_DOMAIN/api/payment/webhook`  
   (e.g. `https://toodlesfunzone.com/api/payment/webhook`)
4. **Events:** enable **payment.captured** (and any others you need).
5. **Secret:** click to generate or set a strong secret; **copy it**.
6. Save. You will add this secret to production env as `RAZORPAY_WEBHOOK_SECRET` (Step 2.2).

---

### Step 1.3 — Production env checklist

Ensure you have (or will set) these in production **before** or during deploy:

| Variable | Required | Example / notes |
|----------|----------|------------------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | Production PostgreSQL (e.g. Neon) |
| `SESSION_SECRET` | Yes | Long random string |
| `RAZORPAY_KEY_ID` | Yes | `rzp_live_...` (Live only) |
| `RAZORPAY_KEY_SECRET` | Yes | Live key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | From Step 1.2 |
| `ADMIN_EMAIL` | Yes | Email for “New Booking” alerts (e.g. toodlesrasya@gmail.com) |
| `SMTP_HOST` | Yes | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | Yes | e.g. `587` |
| `SMTP_USER` | Yes | Sender email |
| `SMTP_PASS` | Yes | App password / SMTP password |

Optional: `WHATSAPP_*`, `TOODLES_WHATSAPP_NUMBER` if you use WhatsApp notifications.

---

## Phase 2 — Deploy to production

### Step 2.1 — Get latest code on the server

**If using EC2 (or any server with git):**

```bash
# SSH into EC2 (replace with your key and IP)
ssh -i ~/path/to/your-key.pem ubuntu@YOUR_EC2_IP

cd /var/www/toodlesfunzone   # or your app path
git fetch upstream           # or origin, depending on your remotes
git checkout main
git pull upstream main       # or: git pull origin main
```

**If using CI/CD (e.g. GitHub Actions):** trigger a deploy from `main` after merging the payment changes.

---

### Step 2.2 — Set production environment variables

**On EC2 (using a `.env` file):**

1. Edit the production `.env` in the app directory (e.g. `/var/www/toodlesfunzone/.env`).
2. **Ensure `NODE_ENV=production`** — without it, the app runs in dev mode (Vite) and the site will not load (missing source files). Set or update:

   ```env
   NODE_ENV=production
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_live_secret_here
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_step_1_2
   ADMIN_EMAIL=toodlesrasya@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-sender@gmail.com
   SMTP_PASS=your-app-password
   ```

3. Keep `DATABASE_URL`, `SESSION_SECRET`, and any other existing vars. Do **not** commit `.env` to git.

**If using a platform (Render, Heroku, etc.):** set the same variables in the dashboard’s Environment / Config section.

---

### Step 2.3 — Build and restart

**On EC2:**

```bash
cd /var/www/toodlesfunzone
npm install
npm run build
pm2 restart toodlesfunzone   # or your PM2 app name
# If first time: pm2 start dist/index.js --name toodlesfunzone
```

**If using a platform:** trigger a new deploy; the platform usually runs `npm install` and `npm run build`.

---

### Step 2.4 — Confirm app and webhook URL

1. Open **https://YOUR_PRODUCTION_DOMAIN** in a browser — site should load.
2. Confirm the webhook URL is reachable by Razorpay (must be HTTPS and publicly accessible).  
   Example: `https://toodlesfunzone.com/api/payment/webhook`  
   The app does not expose a “test” page for it; Razorpay will call it on `payment.captured`.

---

## Phase 3 — After deploy (verify)

### Step 3.1 — One real payment (smoke test)

1. Open your production site (e.g. https://toodlesfunzone.com).
2. Go through the full booking flow: select package → date → time slot → enter details → **Proceed to payment**.
3. Complete payment with a **real card** (use a small amount if possible).
4. Confirm:
   - [ ] “Booking Confirmed” (or success message) on the site.
   - [ ] Customer receives confirmation email (parent email).
   - [ ] Toodles receives “New Booking #…” at `ADMIN_EMAIL`.
5. In **Razorpay Dashboard (Live) → Payments**, confirm the payment is listed.

---

### Step 3.2 — Webhook (optional check)

1. In Razorpay Dashboard: **Settings → Webhooks** → your webhook.
2. If available, use **Send test webhook** or wait for a real `payment.captured` event.
3. Check production server logs for a line like:  
   `Razorpay webhook: booking X confirmed via webhook`  
   or at least no 4xx/5xx for `POST /api/payment/webhook`.  
   The endpoint returns **200 OK** when the signature is valid.

---

### Step 3.3 — Database check (optional)

In your production DB (e.g. Neon SQL Editor):

```sql
SELECT id, parent_name, booking_date, total_amount, payment_status, status
FROM bookings
ORDER BY created_at DESC
LIMIT 5;
```

Confirm the test booking has `payment_status = 'completed'` and `status = 'confirmed'`.

---

### Step 3.4 — Monitor briefly

- Watch server logs for errors on `/api/payment/create-order`, `/api/bookings/guest`, `/api/payment/webhook`.
- Check Razorpay Dashboard for failed payments or unusual activity.

---

## Quick reference

| Phase | What you do |
|-------|------------------|
| 1.1   | Get Razorpay **Live** Key ID + Secret |
| 1.2   | Add **Webhook** URL + secret in Razorpay (Live) |
| 1.3   | Prepare production env vars (Razorpay, SMTP, ADMIN_EMAIL, etc.) |
| 2.1   | Pull latest `main` on production server |
| 2.2   | Set production `.env` (or platform env) with Live keys + webhook secret |
| 2.3   | Build and restart app (e.g. `npm run build` + `pm2 restart`) |
| 2.4   | Confirm site and webhook URL are live over HTTPS |
| 3.1   | Run one real payment; check success, emails, Razorpay Dashboard |
| 3.2   | (Optional) Verify webhook in logs / test webhook |
| 3.3   | (Optional) Check DB for completed booking |
| 3.4   | Monitor logs and Razorpay for a short period |

---

## If something goes wrong

- **“Payment gateway not configured” / “Use Live keys”:**  
  Ensure `NODE_ENV=production` and both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are **Live** (`rzp_live_...`). Restart the app after changing env.

- **Webhook 400 / “Invalid signature”:**  
  Ensure `RAZORPAY_WEBHOOK_SECRET` in production **exactly** matches the secret in Razorpay Dashboard → Webhooks. No extra spaces or quotes.

- **No admin email:**  
  Check `ADMIN_EMAIL` and SMTP vars; see [NOTIFICATIONS.md](./NOTIFICATIONS.md). Look in server logs for `[Email] Booking notification sent to Toodles` or `[Email] Failed to send...`.

- **Booking not created after payment:**  
  Check server logs for errors on `POST /api/bookings/guest`. If the user closed the browser after paying, the webhook should still confirm the booking if it was created with the same payment ID.

For full payment and deployment details, see [PRODUCTION_PAYMENT.md](./PRODUCTION_PAYMENT.md) and [EC2_MIGRATION.md](./EC2_MIGRATION.md).
