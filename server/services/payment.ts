import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret',
});

export const createPaymentOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string
) => {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw new Error('Failed to create payment order');
  }
};

export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret')
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

export const getPaymentDetails = async (paymentId: string) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

export const refundPayment = async (paymentId: string, amount?: number) => {
  try {
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

// Payment webhook handler (for Razorpay webhooks)
export const handlePaymentWebhook = async (
  signature: string,
  body: any,
  secret: string
): Promise<boolean> => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Error handling payment webhook:', error);
    return false;
  }
};
