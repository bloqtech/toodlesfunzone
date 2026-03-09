import Razorpay from 'razorpay';
import crypto from 'crypto';

function getRazorpayClient() {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (!keyId || !keySecret || keyId === 'your_razorpay_key_id' || keySecret === 'your_razorpay_key_secret') {
    throw new Error('Payment gateway not configured. In project root .env add RAZORPAY_KEY_ID= and RAZORPAY_KEY_SECRET= (use Test keys for local, Live keys for production).');
  }
  if (isProduction && keyId.startsWith('rzp_test_')) {
    console.error('Razorpay: Live environment requires Live keys (rzp_live_...). Do not use Test keys in production.');
    throw new Error('Payment gateway misconfigured: use Live API keys in production (Razorpay Dashboard → API Keys → Live mode).');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const createPaymentOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string
) => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId || !keySecret || keyId === 'your_razorpay_key_id' || keySecret === 'your_razorpay_key_secret') {
    console.error('Razorpay: Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in project root .env');
    throw new Error('Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (Test keys for local, Live for production).');
  }
  if (process.env.NODE_ENV === 'production' && keyId.startsWith('rzp_test_')) {
    throw new Error('Use Razorpay Live API keys in production (Dashboard → API Keys → Live mode).');
  }

  const amountPaise = Math.round(amount * 100);
  if (amountPaise < 100) {
    throw new Error('Amount must be at least ₹1');
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt,
      payment_capture: 1,
    });
    return order;
  } catch (error: any) {
    const msg = error?.description || error?.error?.description || error?.message || 'Unknown error';
    console.error('Razorpay create order error:', msg, error?.response?.data || error);
    throw new Error(msg || 'Failed to create payment order');
  }
};

export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  try {
    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!secret) {
      console.error('Razorpay: KEY_SECRET missing, cannot verify payment');
      return false;
    }
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    const ok = expectedSignature === (signature || '').trim();
    if (!ok) {
      console.error('Razorpay: signature mismatch (verify failed)');
    }
    return ok;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

export const getPaymentDetails = async (paymentId: string) => {
  try {
    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

export const refundPayment = async (paymentId: string, amount?: number) => {
  try {
    const razorpay = getRazorpayClient();
    const refundOptions: any = {
      payment_id: paymentId,
    };
    if (amount) {
      refundOptions.amount = amount * 100; // Convert to paise
    }
    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
};

// Alternative payment methods (for future use)
export const processPaytmPayment = async (
  amount: number,
  orderId: string,
  customerId: string
) => {
  // Paytm integration would go here
  // This is a placeholder for future implementation
  console.log('Paytm payment processing not implemented yet');
  throw new Error('Paytm payment not implemented');
};

export const processStripePayment = async (
  amount: number,
  currency: string,
  paymentMethodId: string
) => {
  // Stripe integration would go here
  // This is a placeholder for future implementation
  console.log('Stripe payment processing not implemented yet');
  throw new Error('Stripe payment not implemented');
};

// Utility functions for payment processing
export const calculateTotalAmount = (
  baseAmount: number,
  discountAmount: number = 0,
  taxAmount: number = 0
): number => {
  return Math.max(0, baseAmount - discountAmount + taxAmount);
};

export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 500000; // Maximum amount limit
};

export const generateReceiptId = (prefix: string = 'TF'): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Error handling for payment operations
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

/** Verify Razorpay webhook signature using raw body (required by Razorpay). */
export const verifyRazorpayWebhookSignature = (
  rawBody: Buffer | string,
  signature: string,
  secret: string
): boolean => {
  if (!secret || !signature) return false;
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
      .digest('hex');
    return expected === signature.trim();
  } catch {
    return false;
  }
};
