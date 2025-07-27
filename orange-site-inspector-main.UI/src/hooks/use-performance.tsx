import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  memoryUsage: number;
  networkRequests: number;
  errors: number;
  userInteractions: number;
}

interface PerformanceEvent {
  type: 'page_load' | 'api_call' | 'error' | 'interaction';
  timestamp: number;
  duration?: number;
  details?: any;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    timeToInteractive: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errors: 0,
    userInteractions: 0,
  });

  const [events, setEvents] = useState<PerformanceEvent[]>([]);
  const pageLoadStart = useRef<number>(performance.now());
  const isInteractive = useRef<boolean>(false);

  // Track page load performance
  useEffect(() => {
    const trackPageLoad = () => {
      const loadTime = performance.now() - pageLoadStart.current;
      
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const timeToInteractive = navigation?.domInteractive || loadTime;

      setMetrics(prev => ({
        ...prev,
        pageLoadTime: loadTime,
        timeToInteractive,
      }));

      // Track memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }

      addEvent('page_load', loadTime);
    };

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, []);

  // Track time to interactive
  useEffect(() => {
    const checkInteractive = () => {
      if (!isInteractive.current && document.readyState === 'interactive') {
        isInteractive.current = true;
        const interactiveTime = performance.now() - pageLoadStart.current;
        setMetrics(prev => ({
          ...prev,
          timeToInteractive: interactiveTime,
        }));
      }
    };

    const interval = setInterval(checkInteractive, 100);
    return () => clearInterval(interval);
  }, []);

  // Track network requests
  const trackApiCall = useCallback((duration: number, details?: any) => {
    setMetrics(prev => ({
      ...prev,
      networkRequests: prev.networkRequests + 1,
    }));
    addEvent('api_call', duration, details);
  }, []);

  // Track errors
  const trackError = useCallback((error: Error, details?: any) => {
    setMetrics(prev => ({
      ...prev,
      errors: prev.errors + 1,
    }));
    addEvent('error', undefined, { error: error.message, ...details });
  }, []);

  // Track user interactions
  const trackInteraction = useCallback((type: string, details?: any) => {
    setMetrics(prev => ({
      ...prev,
      userInteractions: prev.userInteractions + 1,
    }));
    addEvent('interaction', undefined, { type, ...details });
  }, []);

  // Add performance event
  const addEvent = useCallback((type: PerformanceEvent['type'], duration?: number, details?: any) => {
    const event: PerformanceEvent = {
      type,
      timestamp: performance.now(),
      duration,
      details,
    };

    setEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
  }, []);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    const recentEvents = events.slice(-20); // Last 20 events
    const apiCalls = recentEvents.filter(e => e.type === 'api_call');
    const errors = recentEvents.filter(e => e.type === 'error');
    const interactions = recentEvents.filter(e => e.type === 'interaction');

    const avgApiCallTime = apiCalls.length > 0 
      ? apiCalls.reduce((sum, e) => sum + (e.duration || 0), 0) / apiCalls.length 
      : 0;

    return {
      metrics,
      recentEvents,
      apiCallCount: apiCalls.length,
      errorCount: errors.length,
      interactionCount: interactions.length,
      averageApiCallTime: avgApiCallTime,
      performanceScore: calculatePerformanceScore(metrics),
    };
  }, [metrics, events]);

  // Calculate performance score (0-100)
  const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
    let score = 100;

    // Deduct points for slow page load
    if (metrics.pageLoadTime > 3000) score -= 20;
    else if (metrics.pageLoadTime > 2000) score -= 10;
    else if (metrics.pageLoadTime > 1000) score -= 5;

    // Deduct points for slow time to interactive
    if (metrics.timeToInteractive > 5000) score -= 20;
    else if (metrics.timeToInteractive > 3000) score -= 10;
    else if (metrics.timeToInteractive > 2000) score -= 5;

    // Deduct points for high memory usage
    if (metrics.memoryUsage > 100) score -= 15;
    else if (metrics.memoryUsage > 50) score -= 10;
    else if (metrics.memoryUsage > 25) score -= 5;

    // Deduct points for errors
    score -= Math.min(metrics.errors * 5, 20);

    return Math.max(0, score);
  };

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Global error tracking
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason), {
        type: 'unhandledRejection',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return {
    metrics,
    events,
    trackApiCall,
    trackError,
    trackInteraction,
    getPerformanceReport,
    addEvent,
  };
}; 