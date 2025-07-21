export const sendWhatsAppMessage = (phoneNumber: string, message: string) => {
  const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
  const formattedPhoneNumber = cleanPhoneNumber.startsWith('91') 
    ? cleanPhoneNumber 
    : `91${cleanPhoneNumber}`;
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedPhoneNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};

export const getDefaultWhatsAppNumber = () => {
  return "+919901218980"; // Default Toodles WhatsApp number
};

export const getBookingWhatsAppMessage = (bookingDetails?: any) => {
  if (bookingDetails) {
    return `Hi! I'd like to confirm my booking details:
Booking ID: #${bookingDetails.id}
Date: ${bookingDetails.bookingDate}
Children: ${bookingDetails.numberOfChildren}
Amount: ₹${bookingDetails.totalAmount}

Please let me know if you need any additional information.`;
  }
  
  return "Hi! I'd like to book a play session at Toodles Funzone. Can you please help me with the available slots?";
};

export const getBirthdayWhatsAppMessage = (partyDetails?: any) => {
  if (partyDetails) {
    return `Hi! I'd like to confirm my birthday party booking:
Party ID: #${partyDetails.id}
Child: ${partyDetails.childName} (Age ${partyDetails.childAge})
Date: ${partyDetails.partyDate}
Guests: ${partyDetails.numberOfGuests}
Theme: ${partyDetails.theme}

Please let me know if you need any additional information.`;
  }
  
  return "Hi! I'm interested in booking a birthday party at Toodles Funzone. Can you please share the package details and help me plan the perfect celebration?";
};

export const getGeneralEnquiryMessage = () => {
  return "Hi! I have some questions about Toodles Funzone. Can you please help me with information about your facilities, packages, and booking process?";
};

export const getAvailabilityCheckMessage = (date?: string) => {
  if (date) {
    return `Hi! Can you please check the availability for ${date}? I'd like to book a play session for my child.`;
  }
  
  return "Hi! Can you please check the availability for this weekend? I'd like to book a play session for my child.";
};

export const getPackageEnquiryMessage = () => {
  return "Hi! Can you please share details about your play packages, pricing, and what's included? I'm looking for the best option for my child.";
};

export const getCancellationMessage = (bookingId?: string) => {
  if (bookingId) {
    return `Hi! I need to cancel my booking #${bookingId}. Can you please help me with the cancellation process and refund details?`;
  }
  
  return "Hi! I need to cancel my booking. Can you please help me with the cancellation process?";
};

export const getLocationMessage = () => {
  return "Hi! Can you please share your exact location, directions, and parking information? I want to make sure I can find you easily.";
};

export const getPricingMessage = () => {
  return "Hi! Can you please share your current pricing for play sessions, birthday parties, and any special packages or offers available?";
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  if (cleanNumber.length === 10) {
    return `+91 ${cleanNumber.substring(0, 5)} ${cleanNumber.substring(5)}`;
  }
  return phoneNumber;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  return cleanNumber.length === 10 || (cleanNumber.length === 12 && cleanNumber.startsWith('91'));
};

export const getWhatsAppShareUrl = (text: string, phoneNumber?: string) => {
  const encodedText = encodeURIComponent(text);
  if (phoneNumber) {
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    const formattedPhoneNumber = cleanPhoneNumber.startsWith('91') 
      ? cleanPhoneNumber 
      : `91${cleanPhoneNumber}`;
    return `https://wa.me/${formattedPhoneNumber}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
};

// WhatsApp Business API integration (for future use)
export const sendBusinessMessage = async (phoneNumber: string, message: string) => {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Template messages for common scenarios
export const WHATSAPP_TEMPLATES = {
  BOOKING_CONFIRMATION: (details: any) => `🎉 *Booking Confirmed!*

Hi ${details.parentName},

Your play session at Toodles Funzone is confirmed!

📅 *Date:* ${details.bookingDate}
👶 *Children:* ${details.numberOfChildren}
💰 *Amount:* ₹${details.totalAmount}
🆔 *Booking ID:* #${details.id}

See you soon! 🎪`,

  BIRTHDAY_CONFIRMATION: (details: any) => `🎂 *Birthday Party Confirmed!*

Hi ${details.parentName},

${details.childName}'s birthday party is all set!

🎉 *Date:* ${details.partyDate}
👥 *Guests:* ${details.numberOfGuests}
🎨 *Theme:* ${details.theme}
💰 *Amount:* ₹${details.totalAmount}

We'll make it magical! ✨`,

  PAYMENT_REMINDER: (details: any) => `💳 *Payment Reminder*

Hi ${details.parentName},

Your booking for ${details.bookingDate} needs payment completion.

💰 *Amount:* ₹${details.totalAmount}
🆔 *Booking ID:* #${details.id}

Please complete payment to secure your slot.`,

  CANCELLATION_NOTICE: (details: any) => `❌ *Booking Cancelled*

Hi ${details.parentName},

Your booking for ${details.bookingDate} has been cancelled.

🆔 *Booking ID:* #${details.id}

Refund will be processed within 5-7 business days.`
};
