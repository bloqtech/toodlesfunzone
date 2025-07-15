import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email configuration - use environment variables or defaults
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'noreply@toodlesfunzone.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// Create reusable transporter
const transporter = nodemailer.createTransport(emailConfig);

export const sendBookingConfirmation = async (booking: any) => {
  try {
    const mailOptions = {
      from: `"Toodles Funzone" <${emailConfig.auth.user}>`,
      to: booking.parentEmail,
      subject: `Booking Confirmation - Toodles Funzone`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B6B, #4ECDC4); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Booking Confirmed! 🎉</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #2C3E50;">Hi ${booking.parentName},</h2>
            
            <p>Your play session booking has been confirmed! We can't wait to welcome you to Toodles Funzone.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #FF6B6B; margin-top: 0;">Booking Details:</h3>
              <p><strong>Booking ID:</strong> #${booking.id}</p>
              <p><strong>Date:</strong> ${booking.bookingDate}</p>
              <p><strong>Children:</strong> ${booking.numberOfChildren}</p>
              <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
            </div>
            
            <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #2C3E50; margin-top: 0;">Important Reminders:</h4>
              <ul style="margin: 0;">
                <li>Please arrive 10 minutes before your session</li>
                <li>Non-slip socks are required (available for purchase)</li>
                <li>Please bring a valid ID for verification</li>
              </ul>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:hello@toodlesfunzone.com">hello@toodlesfunzone.com</a> or call us at +91 98765 43210.</p>
            
            <p style="color: #666; margin-top: 30px;">
              Best regards,<br>
              The Toodles Funzone Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw error;
  }
};

export const sendBirthdayPartyConfirmation = async (party: any) => {
  try {
    const mailOptions = {
      from: `"Toodles Funzone" <${emailConfig.auth.user}>`,
      to: party.parentEmail,
      subject: `Birthday Party Confirmed - Toodles Funzone`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B6B, #FFE66D); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Birthday Party Confirmed! 🎂</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #2C3E50;">Hi ${party.parentName},</h2>
            
            <p>We're so excited to celebrate ${party.childName}'s special day at Toodles Funzone!</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #FF6B6B; margin-top: 0;">Party Details:</h3>
              <p><strong>Party ID:</strong> #${party.id}</p>
              <p><strong>Child:</strong> ${party.childName} (Age ${party.childAge})</p>
              <p><strong>Date:</strong> ${party.partyDate}</p>
              <p><strong>Guests:</strong> ${party.numberOfGuests}</p>
              <p><strong>Theme:</strong> ${party.theme || 'To be decided'}</p>
              <p><strong>Total Amount:</strong> ₹${party.totalAmount}</p>
            </div>
            
            <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #2C3E50; margin-top: 0;">What's Included:</h4>
              <ul style="margin: 0;">
                <li>Themed decorations</li>
                <li>Birthday cake</li>
                <li>Party games and activities</li>
                <li>Dedicated party host</li>
                <li>Photography session</li>
              </ul>
            </div>
            
            <p>Our party coordinator will contact you 48 hours before the event to finalize all details. We'll make sure ${party.childName}'s birthday is absolutely magical!</p>
            
            <p>If you have any questions, please contact us at <a href="mailto:parties@toodlesfunzone.com">parties@toodlesfunzone.com</a> or call us at +91 98765 43210.</p>
            
            <p style="color: #666; margin-top: 30px;">
              Best regards,<br>
              The Toodles Funzone Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Birthday party confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending birthday party confirmation email:', error);
    throw error;
  }
};

export const sendEnquiryNotification = async (enquiry: any) => {
  try {
    // Send confirmation to customer
    const customerMailOptions = {
      from: `"Toodles Funzone" <${emailConfig.auth.user}>`,
      to: enquiry.email,
      subject: `Thank you for your enquiry - Toodles Funzone`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4ECDC4, #95E1D3); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thank You for Your Enquiry!</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #2C3E50;">Hi ${enquiry.name},</h2>
            
            <p>Thank you for contacting Toodles Funzone! We've received your enquiry and will get back to you within 24 hours.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #4ECDC4; margin-top: 0;">Your Message:</h3>
              <p style="font-style: italic;">"${enquiry.message}"</p>
            </div>
            
            <p>In the meantime, feel free to explore our website or give us a call at +91 98765 43210 if you have any urgent queries.</p>
            
            <p style="color: #666; margin-top: 30px;">
              Best regards,<br>
              The Toodles Funzone Team
            </p>
          </div>
        </div>
      `
    };

    // Send notification to admin
    const adminMailOptions = {
      from: `"Toodles Funzone System" <${emailConfig.auth.user}>`,
      to: process.env.ADMIN_EMAIL || 'admin@toodlesfunzone.com',
      subject: `New Enquiry - ${enquiry.type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #FF6B6B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Enquiry Received</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #2C3E50;">Enquiry Details:</h2>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>Name:</strong> ${enquiry.name}</p>
              <p><strong>Email:</strong> ${enquiry.email}</p>
              <p><strong>Phone:</strong> ${enquiry.phone}</p>
              <p><strong>Type:</strong> ${enquiry.type}</p>
              <p><strong>Message:</strong> ${enquiry.message}</p>
              <p><strong>Received:</strong> ${new Date(enquiry.createdAt).toLocaleString()}</p>
            </div>
            
            <p>Please respond to this enquiry within 24 hours.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);
    console.log('Enquiry notification emails sent successfully');
  } catch (error) {
    console.error('Error sending enquiry notification emails:', error);
    throw error;
  }
};

export const sendPaymentConfirmation = async (booking: any, paymentDetails: any) => {
  try {
    const mailOptions = {
      from: `"Toodles Funzone" <${emailConfig.auth.user}>`,
      to: booking.parentEmail,
      subject: `Payment Confirmation - Toodles Funzone`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #95E1D3, #4ECDC4); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Confirmed! ✅</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #2C3E50;">Hi ${booking.parentName},</h2>
            
            <p>Your payment has been successfully processed. Your booking is now confirmed!</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #4ECDC4; margin-top: 0;">Payment Details:</h3>
              <p><strong>Payment ID:</strong> ${paymentDetails.paymentId}</p>
              <p><strong>Amount:</strong> ₹${booking.totalAmount}</p>
              <p><strong>Method:</strong> ${paymentDetails.method || 'Online'}</p>
              <p><strong>Status:</strong> Confirmed</p>
            </div>
            
            <p>You can now look forward to your visit to Toodles Funzone. We can't wait to welcome you!</p>
            
            <p style="color: #666; margin-top: 30px;">
              Best regards,<br>
              The Toodles Funzone Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};
