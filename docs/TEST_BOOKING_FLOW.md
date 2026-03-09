# End-to-end: Test payment and booking flow

Use this checklist to test the full flow locally (Razorpay test mode + email).

---

## Before you start

- [ ] **Server running:** `npm run dev` (port 5000)
- [ ] **.env has:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (test keys), `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`
- [ ] **Razorpay:** Dashboard in **Test mode** (toggle top-right); keys must be `rzp_test_...`

---

## Test steps

### 1. Open the app

- Go to **http://localhost:5000**
- Click **“Book Now”** (or go to Packages and click **“Book”** on a package) to open the booking modal

### 2. Fill the booking form

1. **Package:** Select any package (e.g. “Hourly Fun Weekday”).
2. **Date:** Pick a **future** date (time slots load for that date).
3. **Time slot:** Choose a slot that shows “spots left” (not “Full”).
4. **Details:** Enter parent name, phone, email, number of children (use real email so you get the confirmation).
5. Leave **“Create account”** unchecked for a simple guest booking.

### 3. Pay with test card

1. Click **“Proceed to payment”** or **“Pay & book”**.
2. Razorpay checkout should open (test mode).
3. Use this **test card** (Razorpay test mode only):

   | Field   | Value                |
   |--------|----------------------|
   | Card   | `4111 1111 1111 1111` |
   | Expiry | Any future (e.g. 12/30) |
   | CVV    | Any 3 digits (e.g. 123) |

4. Complete payment. Razorpay shows success.

### 4. After payment

- The modal should show **“Booking confirmed”** (or similar success message).
- If you see “Connection issue” or “Failed to fetch”, check server logs; the booking may still be created (see step 5).

---

## What to verify

### Customer (you)

- [ ] Success message in the booking modal.
- [ ] **Email:** Check the **parent email** you entered for “Booking Confirmation - Toodles Funzone” (inbox/spam).

### Toodles (admin)

- [ ] **Email:** Check **ADMIN_EMAIL** inbox for “New Booking #…” with customer name, phone, date, time, package, amount.

### Server logs

- [ ] No 500 errors when submitting after payment.
- [ ] Lines like: `Booking confirmation email sent successfully`, `Booking notification email sent to Toodles (ADMIN_EMAIL)`.

### Optional: database

- In Neon (or your DB client), run:
  ```sql
  SELECT id, parent_name, parent_email, booking_date, total_amount, payment_status, status
  FROM bookings ORDER BY created_at DESC LIMIT 5;
  ```
- Your test booking should appear with `payment_status = 'completed'` and `status = 'confirmed'`.

### Optional: admin dashboard

- Log in as admin and open the bookings list; the new booking should appear there.

---

## Quick reference

| Item        | Value                    |
|------------|---------------------------|
| App        | http://localhost:5000     |
| Test card  | 4111 1111 1111 1111       |
| Razorpay   | Test mode ON, keys in .env |
| Emails     | Customer: parent email; Toodles: ADMIN_EMAIL |

If anything fails, check server terminal for errors and ensure Razorpay keys and SMTP/ADMIN_EMAIL are set in `.env`.
