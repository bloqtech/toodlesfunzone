# Payment flow: test in lower env & release to production

## Part 1: Test in lower environment (local / staging)

### 1.1 Use Razorpay **test** keys (no real money)

- In **lower env** (local or staging), use **Test** keys only.
- Get them: [Razorpay Dashboard](https://dashboard.razorpay.com) → **Settings** → **API Keys** → **Generate Test Key**.
- In `.env` (or staging env vars):
  ```env
  RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
  RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
  ```
- Restart the app after changing env.

### 1.2 Test card (Razorpay test mode)

| Field   | Value              |
|--------|---------------------|
| Card   | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g. 12/30) |
| CVV    | Any 3 digits (e.g. 123) |
| OTP    | `1234` (if prompted) |

No real charge is made in test mode.

### 1.3 Step-by-step payment flow to verify

1. **Start app**
   - Run: `npm run dev` (or your staging URL).
   - Open app (e.g. `http://localhost:5000`).

2. **Create order**
   - Go to Packages or Activities → **Book Now**.
   - Pick package, date, time slot, fill guest details.
   - Click **Pay** / proceed to payment.
   - Check: No “Payment gateway not configured” or “Failed to fetch”.
   - Check: Razorpay checkout opens (test key in URL/title is fine).

3. **Pay with test card**
   - Enter test card above, complete payment.
   - Check: Success message on Razorpay modal.

4. **Booking creation**
   - Check: “Booking Confirmed!” (or similar) toast.
   - Check: No “Booking Failed” or “Failed to fetch” after payment.
   - Check: Modal closes and booking appears (e.g. in Admin or “My Bookings” if you have it).

5. **Backend checks**
   - In server logs: no errors for `/api/payment/create-order`, `/api/bookings/guest`, `/api/payment/verify-booking`.
   - In DB: new row in `bookings` with correct `payment_id`, `payment_status = 'completed'`.

### 1.4 Quick checklist (lower env)

- [ ] Test keys in `.env` (or staging env), app restarted.
- [ ] Create order → Razorpay opens (no “not configured”).
- [ ] Pay with test card → payment succeeds.
- [ ] After payment → “Booking Confirmed”, no “Failed to fetch”.
- [ ] Booking visible in UI and in DB with payment details.
- [ ] Optional: test “Payment cancelled” (close Razorpay) → no booking created, friendly message.

---

## Part 2: Release to production

### 2.1 Before release

- [ ] Payment flow fully tested in lower env (Part 1).
- [ ] **Production** Razorpay keys (Live mode):
  - Dashboard → **Settings** → **API Keys** → **Generate Live Key**.
  - Set in **production** env only (e.g. EC2 `.env` or Render/hosting env vars):
    ```env
    RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
    RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
    ```
- [ ] Never use live keys in local/staging.
- [ ] Ensure production DB is the one you intend (same `DATABASE_URL` as current prod).

### 2.2 Deploy

- [ ] Deploy code (e.g. git push → CI/CD, or manual deploy to EC2).
- [ ] Ensure production server loads new env (restart app/process after changing env vars).
- [ ] Confirm app is up (health/status or homepage loads).

### 2.3 After release – smoke test (one real payment)

- [ ] Open **production** URL (e.g. `https://toodlesfunzone.com`).
- [ ] Do **one** end-to-end booking with **real** card (small amount if possible).
- [ ] Check: Create order → Razorpay Live checkout → Payment success → “Booking Confirmed”.
- [ ] Check: Booking in admin/DB with `payment_status = 'completed'`.
- [ ] Check: Razorpay Dashboard → **Payments** → payment and order visible.
- [ ] Optional: Refund this test payment from Dashboard if needed.

### 2.4 Monitor (first 24–48 hours)

- [ ] Watch server logs for 4xx/5xx on `/api/payment/*` and `/api/bookings/guest`.
- [ ] Check Razorpay Dashboard for failed payments or unusual pattern.
- [ ] If you have alerts (e.g. Sentry, log aggregation), ensure payment/booking errors are covered.

### 2.5 Rollback (if something goes wrong)

- **Code rollback:** Redeploy previous version (e.g. previous git tag/commit).
- **Config rollback:** Revert production env vars (e.g. switch back to test keys temporarily) and restart — only if you must stop live payments while you fix.
- **Data:** Bookings and payment IDs are already in DB; no need to “rollback” DB unless you deployed a bad migration. Fix forward (refunds/customer support) if needed.

---

## Summary

| Environment | Keys        | Purpose                          |
|-------------|------------|-----------------------------------|
| Local / staging | `rzp_test_...` | Full payment flow, no real money |
| Production  | `rzp_live_...` | Real payments                    |

Test end-to-end in lower env with test keys and test card; then release to prod with live keys and run one live smoke test plus short-term monitoring.
