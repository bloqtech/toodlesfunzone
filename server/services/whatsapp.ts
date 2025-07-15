import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'text' | 'template';
}

interface WhatsAppConfig {
  apiUrl: string;
  accessToken: string;
  phoneNumberId: string;
}

// WhatsApp Business API configuration
const whatsappConfig: WhatsAppConfig = {
  apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'your_whatsapp_access_token',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id',
};

export const sendWhatsAppNotification = async (
  phoneNumber: string,
  message: string
): Promise<boolean> => {
  try {
    // Clean phone number (remove any formatting)
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // Ensure phone number has country code
    const formattedPhoneNumber = cleanPhoneNumber.startsWith('91') 
      ? cleanPhoneNumber 
      : `91${cleanPhoneNumber}`;

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhoneNumber,
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await axios.post(
      `${whatsappConfig.apiUrl}/${whatsappConfig.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${whatsappConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.messages?.[0]?.id) {
      console.log('WhatsApp message sent successfully:', response.data.messages[0].id);
      return true;
    }

    console.error('Failed to send WhatsApp message:', response.data);
    return false;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};

export const sendBookingConfirmationWhatsApp = async (
  phoneNumber: string,
  bookingDetails: any
): Promise<boolean> => {
  const message = `🎉 *Booking Confirmed!* 

Hi ${bookingDetails.parentName},

Your play session at Toodles Funzone has been confirmed!

📅 *Date:* ${bookingDetails.bookingDate}
👶 *Children:* ${bookingDetails.numberOfChildren}
💰 *Amount:* ₹${bookingDetails.totalAmount}
🆔 *Booking ID:* #${bookingDetails.id}

⏰ Please arrive 10 minutes early
🧦 Non-slip socks required
📱 Bring this message for quick check-in

Need help? Reply to this message or call us at +91 98765 43210

Looking forward to seeing you!
- Team Toodles 🎪`;

  return await sendWhatsAppNotification(phoneNumber, message);
};

export const sendBirthdayPartyWhatsApp = async (
  phoneNumber: string,
  partyDetails: any
): Promise<boolean> => {
  const message = `🎂 *Birthday Party Confirmed!* 

Hi ${partyDetails.parentName},

${partyDetails.childName}'s birthday party is all set!

🎉 *Child:* ${partyDetails.childName} (Age ${partyDetails.childAge})
📅 *Date:* ${partyDetails.partyDate}
👥 *Guests:* ${partyDetails.numberOfGuests}
🎨 *Theme:* ${partyDetails.theme || 'To be decided'}
💰 *Amount:* ₹${partyDetails.totalAmount}
🆔 *Party ID:* #${partyDetails.id}

Our party coordinator will call you 48 hours before the event to finalize details.

We'll make ${partyDetails.childName}'s day absolutely magical! ✨

Need help? Reply to this message or call us at +91 98765 43210

- Team Toodles 🎪`;

  return await sendWhatsAppNotification(phoneNumber, message);
};

export const sendEnquiryConfirmationWhatsApp = async (
  phoneNumber: string,
  enquiryDetails: any
): Promise<boolean> => {
  const message = `✅ *Enquiry Received!* 

Hi ${enquiryDetails.name},

Thank you for contacting Toodles Funzone! We've received your enquiry and will get back to you within 24 hours.

📝 *Your Message:* "${enquiryDetails.message}"

For immediate assistance, call us at +91 98765 43210

- Team Toodles 🎪`;

  return await sendWhatsAppNotification(phoneNumber, message);
};

export const sendPaymentReminderWhatsApp = async (
  phoneNumber: string,
  bookingDetails: any
): Promise<boolean> => {
  const message = `💳 *Payment Reminder* 

Hi ${bookingDetails.parentName},

Your booking for ${bookingDetails.bookingDate} is confirmed but payment is still pending.

💰 *Amount Due:* ₹${bookingDetails.totalAmount}
🆔 *Booking ID:* #${bookingDetails.id}

Please complete your payment to secure your slot.

Pay now: [Payment Link]

Need help? Call us at +91 98765 43210

- Team Toodles 🎪`;

  return await sendWhatsAppNotification(phoneNumber, message);
};

export const sendCancellationWhatsApp = async (
  phoneNumber: string,
  bookingDetails: any
): Promise<boolean> => {
  const message = `❌ *Booking Cancelled* 

Hi ${bookingDetails.parentName},

Your booking for ${bookingDetails.bookingDate} has been cancelled as requested.

🆔 *Booking ID:* #${bookingDetails.id}

If you paid online, your refund will be processed within 5-7 business days.

Want to book again? Visit our website or call us at +91 98765 43210

We hope to see you soon!
- Team Toodles 🎪`;

  return await sendWhatsAppNotification(phoneNumber, message);
};

// Template message for marketing campaigns
export const sendMarketingTemplate = async (
  phoneNumber: string,
  templateName: string,
  templateParams: string[]
): Promise<boolean> => {
  try {
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    const formattedPhoneNumber = cleanPhoneNumber.startsWith('91') 
      ? cleanPhoneNumber 
      : `91${cleanPhoneNumber}`;

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en'
        },
        components: [
          {
            type: 'body',
            parameters: templateParams.map(param => ({
              type: 'text',
              text: param
            }))
          }
        ]
      }
    };

    const response = await axios.post(
      `${whatsappConfig.apiUrl}/${whatsappConfig.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${whatsappConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.messages?.[0]?.id ? true : false;
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
    return false;
  }
};

// Webhook handler for incoming WhatsApp messages
export const handleWhatsAppWebhook = async (body: any) => {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages) {
      const message = value.messages[0];
      const from = message.from;
      const messageBody = message.text?.body;

      console.log(`Received WhatsApp message from ${from}: ${messageBody}`);

      // Handle different types of incoming messages
      if (messageBody?.toLowerCase().includes('booking')) {
        await sendWhatsAppNotification(from, 
          "Thanks for your interest in booking! Please visit our website toodlesfunzone.com or call us at +91 98765 43210 for booking assistance."
        );
      } else if (messageBody?.toLowerCase().includes('birthday')) {
        await sendWhatsAppNotification(from, 
          "Great! We'd love to help plan an amazing birthday party! Please call us at +91 98765 43210 or visit our website for birthday party packages."
        );
      } else {
        await sendWhatsAppNotification(from, 
          "Thanks for contacting Toodles Funzone! For immediate assistance, please call us at +91 98765 43210 or visit toodlesfunzone.com"
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
    return false;
  }
};

// Utility function to validate phone number format
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  return cleanNumber.length >= 10 && cleanNumber.length <= 12;
};

// Utility function to format phone number for WhatsApp
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  return cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
};
