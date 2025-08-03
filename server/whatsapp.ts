import axios from 'axios';

// WhatsApp Business API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOODLES_WHATSAPP_NUMBER = process.env.TOODLES_WHATSAPP_NUMBER || '+919901218980';

interface BookingNotificationData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  date: string;
  timeSlot: string;
  numberOfChildren: number;
  totalAmount: number;
  status: string;
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via WhatsApp
export async function sendOTPWhatsApp(phone: string, otp: string): Promise<boolean> {
  const message = `🔐 *Toodles Funzone - OTP Verification*

Your login OTP is: *${otp}*

This OTP is valid for 5 minutes. Please do not share this with anyone.

Thank you for choosing Toodles Funzone! 🎉`;

  return await sendWhatsAppMessage(phone, message);
}

export async function sendWhatsAppMessage(to: string, message: string, templateName?: string, templateParams?: any[]) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('WhatsApp credentials not configured');
    return false;
  }

  try {
    const payload = templateName ? {
      messaging_product: 'whatsapp',
      to: to.replace(/[^0-9]/g, ''), // Remove non-numeric characters
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en'
        },
        components: templateParams ? [{
          type: 'body',
          parameters: templateParams.map(param => ({
            type: 'text',
            text: param
          }))
        }] : []
      }
    } : {
      messaging_product: 'whatsapp',
      to: to.replace(/[^0-9]/g, ''),
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('WhatsApp message sent successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

export async function sendBookingConfirmationToCustomer(bookingData: BookingNotificationData) {
  const message = `🎉 *Booking Confirmed - Toodles Funzone*

Hello ${bookingData.customerName}!

Your booking has been confirmed:

📅 *Date:* ${bookingData.date}
⏰ *Time:* ${bookingData.timeSlot}
👶 *Children:* ${bookingData.numberOfChildren}
🎁 *Package:* ${bookingData.packageName}
💰 *Amount:* ₹${bookingData.totalAmount}

📍 *Location:* Opposite Vishnu Leela Veg, Kodathi, Off Sarjapur Road, Bangalore

⚠️ *Please arrive 15 minutes early*
📞 *Contact:* +91 99012 18980

Thank you for choosing Toodles Funzone! We can't wait to see your little ones have a blast! 🎈`;

  return await sendWhatsAppMessage(bookingData.customerPhone, message);
}

export async function sendBookingNotificationToToodles(bookingData: BookingNotificationData) {
  const message = `🔔 *New Booking Alert - Toodles Funzone*

New booking received:

👤 *Customer:* ${bookingData.customerName}
📱 *Phone:* ${bookingData.customerPhone}
📅 *Date:* ${bookingData.date}
⏰ *Time:* ${bookingData.timeSlot}
👶 *Children:* ${bookingData.numberOfChildren}
🎁 *Package:* ${bookingData.packageName}
💰 *Amount:* ₹${bookingData.totalAmount}
🆔 *Booking ID:* ${bookingData.bookingId}

Status: ${bookingData.status}

Please prepare for the session and ensure all safety measures are in place.`;

  return await sendWhatsAppMessage(TOODLES_WHATSAPP_NUMBER, message);
}

export async function sendBirthdayPartyConfirmation(partyData: {
  customerName: string;
  customerPhone: string;
  childName: string;
  childAge: number;
  date: string;
  timeSlot: string;
  guestCount: number;
  theme: string;
  totalAmount: number;
  partyId: string;
}) {
  const customerMessage = `🎂 *Birthday Party Confirmed - Toodles Funzone*

Hello ${partyData.customerName}!

Your birthday party booking is confirmed:

🎈 *Child:* ${partyData.childName} (${partyData.childAge} years)
📅 *Date:* ${partyData.date}
⏰ *Time:* ${partyData.timeSlot}
👥 *Guests:* ${partyData.guestCount}
🎨 *Theme:* ${partyData.theme}
💰 *Amount:* ₹${partyData.totalAmount}

🎁 *Included:* Decorations, cake cutting, party games, and unlimited play time!

📍 *Location:* Opposite Vishnu Leela Veg, Kodathi, Off Sarjapur Road, Bangalore
📞 *Contact:* +91 99012 18980

We'll make this birthday extra special! 🎉`;

  const toodlesMessage = `🎂 *Birthday Party Booking - Toodles Funzone*

New birthday party booking:

👤 *Customer:* ${partyData.customerName}
📱 *Phone:* ${partyData.customerPhone}
🎈 *Child:* ${partyData.childName} (${partyData.childAge} years)
📅 *Date:* ${partyData.date}
⏰ *Time:* ${partyData.timeSlot}
👥 *Guests:* ${partyData.guestCount}
🎨 *Theme:* ${partyData.theme}
💰 *Amount:* ₹${partyData.totalAmount}
🆔 *Party ID:* ${partyData.partyId}

Please prepare decorations and cake arrangements.`;

  const customerSent = await sendWhatsAppMessage(partyData.customerPhone, customerMessage);
  const toodlesSent = await sendWhatsAppMessage(TOODLES_WHATSAPP_NUMBER, toodlesMessage);

  return customerSent && toodlesSent;
}

export async function sendBookingCancellation(bookingData: BookingNotificationData) {
  const customerMessage = `❌ *Booking Cancelled - Toodles Funzone*

Hello ${bookingData.customerName},

Your booking has been cancelled:

📅 *Date:* ${bookingData.date}
⏰ *Time:* ${bookingData.timeSlot}
🆔 *Booking ID:* ${bookingData.bookingId}

If you cancelled this booking, no action is needed. If this was unexpected, please contact us immediately.

📞 *Contact:* +91 99012 18980

We hope to see you soon at Toodles Funzone! 🎈`;

  const toodlesMessage = `❌ *Booking Cancelled - Toodles Funzone*

Booking cancelled:

👤 *Customer:* ${bookingData.customerName}
📱 *Phone:* ${bookingData.customerPhone}
📅 *Date:* ${bookingData.date}
⏰ *Time:* ${bookingData.timeSlot}
🆔 *Booking ID:* ${bookingData.bookingId}

Time slot is now available for new bookings.`;

  const customerSent = await sendWhatsAppMessage(bookingData.customerPhone, customerMessage);
  const toodlesSent = await sendWhatsAppMessage(TOODLES_WHATSAPP_NUMBER, toodlesMessage);

  return customerSent && toodlesSent;
}

export async function sendBookingReminder(bookingData: BookingNotificationData) {
  const message = `⏰ *Booking Reminder - Toodles Funzone*

Hello ${bookingData.customerName}!

This is a friendly reminder about your upcoming visit:

📅 *Tomorrow:* ${bookingData.date}
⏰ *Time:* ${bookingData.timeSlot}
👶 *Children:* ${bookingData.numberOfChildren}
🎁 *Package:* ${bookingData.packageName}

📍 *Location:* Opposite Vishnu Leela Veg, Kodathi, Off Sarjapur Road, Bangalore

⚠️ *Please arrive 15 minutes early*
📞 *Contact:* +91 99012 18980

Looking forward to seeing you tomorrow! 🎈`;

  return await sendWhatsAppMessage(bookingData.customerPhone, message);
}