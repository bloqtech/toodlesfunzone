import { useEffect } from 'react';
import { trackEvent, trackEngagement } from '@/lib/analytics';

interface AnalyticsWrapperProps {
  eventName: string;
  category?: string;
  children: React.ReactNode;
  className?: string;
  trackClick?: boolean;
  trackView?: boolean;
}

export function AnalyticsWrapper({ 
  eventName, 
  category = 'interaction', 
  children, 
  className,
  trackClick = false,
  trackView = false 
}: AnalyticsWrapperProps) {
  
  useEffect(() => {
    if (trackView) {
      trackEvent('view', category, eventName);
    }
  }, [trackView, category, eventName]);

  const handleClick = () => {
    if (trackClick) {
      trackEvent('click', category, eventName);
    }
  };

  return (
    <div 
      className={className}
      onClick={handleClick}
      onMouseEnter={() => trackEngagement('hover', eventName)}
    >
      {children}
    </div>
  );
}

// Higher-order component for automatic analytics tracking
export function withAnalytics<T extends {}>(
  Component: React.ComponentType<T>,
  eventName: string,
  category: string = 'component'
) {
  return function AnalyticsComponent(props: T) {
    useEffect(() => {
      trackEvent('component_mount', category, eventName);
    }, []);

    return <Component {...props} />;
  };
}