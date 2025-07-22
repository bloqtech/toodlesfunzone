import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function usePerformanceTracking() {
  useEffect(() => {
    // Track page load performance
    const trackPageLoad = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // Track loading times
          trackEvent('page_load_time', 'performance', 'dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          trackEvent('page_load_time', 'performance', 'full_load', navigation.loadEventEnd - navigation.loadEventStart);
          
          // Track Time to First Byte
          trackEvent('ttfb', 'performance', 'response_start', navigation.responseStart - navigation.requestStart);
        }
      }
    };

    // Track Core Web Vitals if available
    const trackWebVitals = () => {
      try {
        // Web vitals tracking without external dependency
        if ('PerformanceObserver' in window) {
          // Track Largest Contentful Paint (LCP)
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              trackEvent('lcp', 'web_vitals', 'largest_contentful_paint', Math.round(entry.startTime));
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Track First Input Delay (FID)
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              trackEvent('fid', 'web_vitals', 'first_input_delay', Math.round((entry as any).processingStart - entry.startTime));
            }
          }).observe({ entryTypes: ['first-input'] });

          // Track Cumulative Layout Shift (CLS)
          new PerformanceObserver((entryList) => {
            let cls = 0;
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
            trackEvent('cls', 'web_vitals', 'cumulative_layout_shift', Math.round(cls * 1000));
          }).observe({ entryTypes: ['layout-shift'] });
        }

      } catch (error) {
        console.warn('Web Vitals not available:', error);
      }
    };

    // Track user engagement metrics
    const trackEngagementMetrics = () => {
      let startTime = Date.now();
      let isActive = true;
      
      const trackSessionTime = () => {
        if (isActive) {
          const sessionTime = Date.now() - startTime;
          trackEvent('session_time', 'engagement', 'page_active_time', Math.round(sessionTime / 1000));
        }
      };

      // Track when user becomes inactive
      const handleVisibilityChange = () => {
        if (document.hidden) {
          isActive = false;
          trackSessionTime();
        } else {
          isActive = true;
          startTime = Date.now();
        }
      };

      // Track before page unload
      const handleBeforeUnload = () => {
        trackSessionTime();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Cleanup
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        trackSessionTime();
      };
    };

    // Run tracking functions
    const cleanup = trackEngagementMetrics();
    
    // Delay performance tracking to ensure page is fully loaded
    setTimeout(() => {
      trackPageLoad();
      trackWebVitals();
    }, 1000);

    return cleanup;
  }, []);
}