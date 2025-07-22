import { useEffect } from 'react';
import { trackBookingEvent, trackEvent } from '@/lib/analytics';

interface BookingAnalyticsProps {
  step?: string;
  packageType?: string;
  amount?: number;
  children?: number;
  timeSlot?: string;
}

export function useBookingAnalytics({
  step,
  packageType,
  amount,
  children,
  timeSlot
}: BookingAnalyticsProps) {
  
  // Track booking funnel steps
  const trackBookingStep = (stepName: string, data?: any) => {
    trackBookingEvent(`booking_${stepName}`, {
      packageType,
      amount,
      children,
      timeSlot,
      ...data
    });
  };

  // Track booking completion
  const trackBookingComplete = (bookingData: {
    bookingId?: string;
    paymentMethod?: string;
    amount: number;
    packageType: string;
  }) => {
    trackBookingEvent('booking_completed', bookingData);
    
    // Also track as a conversion event
    trackEvent('purchase', 'ecommerce', `${bookingData.packageType}_booking`, bookingData.amount);
  };

  // Track booking abandonment
  const trackBookingAbandonment = (abandonmentPoint: string) => {
    trackBookingEvent('booking_abandoned', {
      packageType,
      amount,
      children,
      timeSlot,
      abandonmentPoint
    });
  };

  // Track form field interactions
  const trackFormFieldFocus = (fieldName: string) => {
    trackEvent('form_field_focus', 'booking_form', fieldName);
  };

  const trackFormValidationError = (fieldName: string, errorType: string) => {
    trackEvent('form_validation_error', 'booking_form', `${fieldName}_${errorType}`);
  };

  return {
    trackBookingStep,
    trackBookingComplete,
    trackBookingAbandonment,
    trackFormFieldFocus,
    trackFormValidationError
  };
}