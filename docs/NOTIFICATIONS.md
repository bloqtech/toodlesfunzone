# Booking notifications & Toodles intimation

When a customer completes a booking (payment or guest), the system notifies both the **customer** and **Toodles** (business owner). This doc explains how to validate that Toodles receives notifications and what mechanisms are available.

---

## What runs on each new booking

| Recipient | Channel | Trigger |
|-----------|---------|--------|
| **Customer** | Email | If SMTP is configured; sent to `parentEmail` |
| **Customer** | WhatsApp | If WhatsApp Business API is configured; sent to `parentPhone` |
| **Toodles** | Email | If `ADMIN_EMAIL` and SMTP are set; “New Booking #…” |
| **Toodles** | WhatsApp | If WhatsApp Business API is configured; sent to `TOODLES_WHATSAPP_NUMBER` |

So **Toodles can get intimation via email and/or WhatsApp**. Email is the easiest to validate in testing (no WhatsApp API needed).

---

## How to validate Toodles gets notified (testing)

### 1. Set environment variables (in `.env`)

**Email to Toodles (recommended for testing):**

- `ADMIN_EMAIL` = email where Toodles wants to receive booking alerts (e.g. your personal/business Gmail).
- SMTP must work: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (e.g. Gmail App Password).

**WhatsApp to Toodles (optional):**

- `TOODLES_WHATSAPP_NUMBER` = Toodles’ WhatsApp number (e.g. `+919901218980`). This is who **receives** the alert.
- `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` = Meta WhatsApp Business API credentials (the “from” number). Without these, WhatsApp is skipped and you’ll see a server log: “WhatsApp credentials not configured”.

### 2. Create a test booking

- Complete a test booking (use Razorpay test card if payment is required).
- Wait a few seconds (notifications are sent in the background after the API responds).

### 3. Check that Toodles was notified

- **Email:** Check the inbox (and spam) of `ADMIN_EMAIL`. You should see a “New Booking #…” email with customer name, phone, date, time slot, package, amount.
- **WhatsApp:** Check the phone for `TOODLES_WHATSAPP_NUMBER`. You should see “New Booking Alert - Toodles Funzone” with the same details.
- **Server logs:** Look for:
  - `Booking notification email sent to Toodles (ADMIN_EMAIL)` → email to Toodles succeeded.
  - `WhatsApp message sent successfully` → WhatsApp to Toodles (and/or customer) succeeded.
  - `WhatsApp credentials not configured` → WhatsApp was skipped (only email will work if SMTP is set).

### 4. If Toodles does not get email

- Confirm `ADMIN_EMAIL` is set in `.env` (no typo, correct address).
- Confirm SMTP is working: check logs for “Booking confirmation email sent successfully” (customer) or “Booking notification email sent to Toodles”; any SMTP error will be logged.
- For Gmail, use an **App Password**, not the normal password.

### 5. If Toodles does not get WhatsApp

- Confirm `TOODLES_WHATSAPP_NUMBER` is the number where Toodles should receive the alert (with country code, e.g. `+91…`).
- Confirm `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are set and valid (Meta Business account, WhatsApp Business API).
- Check server logs for “WhatsApp message sent successfully” or the exact error from the API.

---

## Mechanisms for intimation (summary)

| Mechanism | Purpose | Config |
|-----------|---------|--------|
| **Email to Toodles** | Reliable in testing and production; works without WhatsApp | `ADMIN_EMAIL` + SMTP (`SMTP_*`) |
| **WhatsApp to Toodles** | Instant alert on Toodles’ phone | `TOODLES_WHATSAPP_NUMBER` + `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` |
| **Email to customer** | Confirmation to customer | SMTP; recipient = booking `parentEmail` |
| **WhatsApp to customer** | Confirmation to customer | Same WhatsApp API; recipient = booking `parentPhone` |

Optional future options you could add later:

- **SMS to Toodles** (e.g. Twilio, MSG91): same idea as WhatsApp—call a provider API with `TOODLES_WHATSAPP_NUMBER` or a dedicated `TOODLES_SMS_NUMBER` after booking.
- **Admin dashboard / in-app alert:** show “Latest booking” or a small notification list so staff can confirm even without email/WhatsApp.

For **testing env**, the most reliable way to validate Toodles end is: set `ADMIN_EMAIL` and SMTP, then confirm the “New Booking #…” email arrives at that inbox. Add WhatsApp once the Business API is configured so Toodles also gets the alert on their phone.
