// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_title: document.title,
      page_location: window.location.href
    });
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url,
    page_title: document.title,
    page_location: window.location.href
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track booking events
export const trackBookingEvent = (eventName: string, bookingData: {
  packageType?: string;
  amount?: number;
  children?: number;
  timeSlot?: string;
}) => {
  trackEvent(eventName, 'booking', JSON.stringify(bookingData), bookingData.amount);
};

// Track user engagement
export const trackEngagement = (action: string, element: string, details?: any) => {
  trackEvent(action, 'engagement', element, details ? 1 : undefined);
};

// Track performance metrics
export const trackPerformance = () => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // Track Core Web Vitals
  if ('web-vitals' in window) {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = (window as any)['web-vitals'];
    
    getCLS((metric: any) => {
      window.gtag('event', 'CLS', {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value * 1000)
      });
    });
    
    getFID((metric: any) => {
      window.gtag('event', 'FID', {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value)
      });
    });
    
    getFCP((metric: any) => {
      window.gtag('event', 'FCP', {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value)
      });
    });
    
    getLCP((metric: any) => {
      window.gtag('event', 'LCP', {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value)
      });
    });
    
    getTTFB((metric: any) => {
      window.gtag('event', 'TTFB', {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value)
      });
    });
  }
};