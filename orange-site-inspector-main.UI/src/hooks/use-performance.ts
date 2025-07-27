import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  // Page Load Metrics
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  
  // Memory Usage
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
  } | null;
  
  // Network Metrics
  networkRequests: number;
  networkErrors: number;
  averageResponseTime: number;
  
  // Component Metrics
  componentRenderTime: number;
  reRenderCount: number;
  
  // User Interaction Metrics
  timeToInteractive: number;
  firstInputDelay: number;
  
  // Custom Metrics
  customMetrics: Record<string, number>;
}

export interface PerformanceConfig {
  enableMemoryTracking?: boolean;
  enableNetworkTracking?: boolean;
  enableComponentTracking?: boolean;
  enableUserInteractionTracking?: boolean;
  sampleRate?: number; // 0-1, percentage of sessions to track
  maxMetricsHistory?: number;
}

const defaultConfig: PerformanceConfig = {
  enableMemoryTracking: true,
  enableNetworkTracking: true,
  enableComponentTracking: true,
  enableUserInteractionTracking: true,
  sampleRate: 1.0,
  maxMetricsHistory: 100,
};

export function usePerformance(config: PerformanceConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...config };
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    memoryUsage: null,
    networkRequests: 0,
    networkErrors: 0,
    averageResponseTime: 0,
    componentRenderTime: 0,
    reRenderCount: 0,
    timeToInteractive: 0,
    firstInputDelay: 0,
    customMetrics: {},
  });
  
  const [metricsHistory, setMetricsHistory] = useState<PerformanceMetrics[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const startTime = useRef<number>(Date.now());
  const renderStartTime = useRef<number>(0);
  const networkRequests = useRef<number>(0);
  const networkErrors = useRef<number>(0);
  const responseTimes = useRef<number[]>([]);
  const reRenderCount = useRef<number>(0);

  // Initialize performance tracking
  useEffect(() => {
    if (Math.random() > mergedConfig.sampleRate!) {
      return; // Skip tracking for this session
    }

    setIsTracking(true);
    startTime.current = performance.now();

    // Track page load metrics
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setMetrics(prev => ({
          ...prev,
          domContentLoaded: performance.now() - startTime.current,
        }));
      });
    } else {
      setMetrics(prev => ({
        ...prev,
        domContentLoaded: performance.now() - startTime.current,
      }));
    }

    // Track First Contentful Paint
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({
              ...prev,
              firstContentfulPaint: entry.startTime,
            }));
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Track Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          setMetrics(prev => ({
            ...prev,
            largestContentfulPaint: entry.startTime,
          }));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          setMetrics(prev => ({
            ...prev,
            firstInputDelay: fidEntry.processingStart - fidEntry.startTime,
          }));
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // Track memory usage
    if (mergedConfig.enableMemoryTracking && 'memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
          },
        }));
      };

      updateMemoryUsage();
      const memoryInterval = setInterval(updateMemoryUsage, 5000);
      return () => clearInterval(memoryInterval);
    }
  }, [mergedConfig.sampleRate, mergedConfig.enableMemoryTracking]);

  // Track network requests
  useEffect(() => {
    if (!mergedConfig.enableNetworkTracking) return;

    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // Track fetch requests
    window.fetch = async (...args) => {
      const startTime = performance.now();
      networkRequests.current++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        responseTimes.current.push(endTime - startTime);
        
        setMetrics(prev => ({
          ...prev,
          networkRequests: networkRequests.current,
          averageResponseTime: responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length,
        }));
        
        return response;
      } catch (error) {
        networkErrors.current++;
        setMetrics(prev => ({
          ...prev,
          networkErrors: networkErrors.current,
        }));
        throw error;
      }
    };

    // Track XMLHttpRequest
    XMLHttpRequest.prototype.open = function(...args) {
      this._startTime = performance.now();
      return originalXHROpen.apply(this, args);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      networkRequests.current++;
      const xhr = this;
      
      xhr.addEventListener('load', () => {
        const endTime = performance.now();
        responseTimes.current.push(endTime - xhr._startTime);
        
        setMetrics(prev => ({
          ...prev,
          networkRequests: networkRequests.current,
          averageResponseTime: responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length,
        }));
      });

      xhr.addEventListener('error', () => {
        networkErrors.current++;
        setMetrics(prev => ({
          ...prev,
          networkErrors: networkErrors.current,
        }));
      });

      return originalXHRSend.apply(this, args);
    };

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    };
  }, [mergedConfig.enableNetworkTracking]);

  // Track component render time
  useEffect(() => {
    if (!mergedConfig.enableComponentTracking) return;

    renderStartTime.current = performance.now();
    reRenderCount.current++;

    const renderTime = performance.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      ...prev,
      componentRenderTime: renderTime,
      reRenderCount: reRenderCount.current,
    }));
  }, [mergedConfig.enableComponentTracking]);

  // Track user interactions
  useEffect(() => {
    if (!mergedConfig.enableUserInteractionTracking) return;

    let firstInteraction = true;
    const interactionHandler = () => {
      if (firstInteraction) {
        firstInteraction = false;
        setMetrics(prev => ({
          ...prev,
          timeToInteractive: performance.now() - startTime.current,
        }));
        
        // Remove listeners after first interaction
        document.removeEventListener('click', interactionHandler);
        document.removeEventListener('keydown', interactionHandler);
        document.removeEventListener('touchstart', interactionHandler);
      }
    };

    document.addEventListener('click', interactionHandler);
    document.addEventListener('keydown', interactionHandler);
    document.addEventListener('touchstart', interactionHandler);

    return () => {
      document.removeEventListener('click', interactionHandler);
      document.removeEventListener('keydown', interactionHandler);
      document.removeEventListener('touchstart', interactionHandler);
    };
  }, [mergedConfig.enableUserInteractionTracking]);

  // Update page load time when component mounts
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      pageLoadTime: performance.now() - startTime.current,
    }));
  }, []);

  // Add metrics to history
  useEffect(() => {
    if (metrics.pageLoadTime > 0) {
      setMetricsHistory(prev => {
        const newHistory = [...prev, metrics];
        if (newHistory.length > mergedConfig.maxMetricsHistory!) {
          return newHistory.slice(-mergedConfig.maxMetricsHistory!);
        }
        return newHistory;
      });
    }
  }, [metrics, mergedConfig.maxMetricsHistory]);

  // Custom metric tracking
  const trackCustomMetric = useCallback((name: string, value: number) => {
    setMetrics(prev => ({
      ...prev,
      customMetrics: {
        ...prev.customMetrics,
        [name]: value,
      },
    }));
  }, []);

  // Performance analysis
  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // Deduct points for slow page load
    if (metrics.pageLoadTime > 3000) score -= 20;
    else if (metrics.pageLoadTime > 2000) score -= 10;
    
    // Deduct points for slow FCP
    if (metrics.firstContentfulPaint > 2000) score -= 15;
    else if (metrics.firstContentfulPaint > 1500) score -= 8;
    
    // Deduct points for slow LCP
    if (metrics.largestContentfulPaint > 4000) score -= 20;
    else if (metrics.largestContentfulPaint > 2500) score -= 10;
    
    // Deduct points for high FID
    if (metrics.firstInputDelay > 300) score -= 15;
    else if (metrics.firstInputDelay > 100) score -= 8;
    
    // Deduct points for network errors
    if (metrics.networkErrors > 0) score -= metrics.networkErrors * 5;
    
    // Deduct points for high memory usage
    if (metrics.memoryUsage && metrics.memoryUsage.used / metrics.memoryUsage.limit > 0.8) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }, [metrics]);

  const getPerformanceInsights = useCallback(() => {
    const insights: string[] = [];
    const score = getPerformanceScore();
    
    if (score < 50) insights.push('Critical performance issues detected');
    else if (score < 70) insights.push('Performance needs improvement');
    else if (score < 90) insights.push('Good performance with room for optimization');
    else insights.push('Excellent performance');
    
    if (metrics.pageLoadTime > 3000) insights.push('Page load time is too slow');
    if (metrics.firstContentfulPaint > 2000) insights.push('First contentful paint is slow');
    if (metrics.largestContentfulPaint > 4000) insights.push('Largest contentful paint is slow');
    if (metrics.firstInputDelay > 300) insights.push('First input delay is high');
    if (metrics.networkErrors > 0) insights.push(`${metrics.networkErrors} network errors occurred`);
    if (metrics.memoryUsage && metrics.memoryUsage.used / metrics.memoryUsage.limit > 0.8) {
      insights.push('High memory usage detected');
    }
    
    return insights;
  }, [metrics, getPerformanceScore]);

  // Export metrics
  const exportMetrics = useCallback(() => {
    const data = {
      current: metrics,
      history: metricsHistory,
      score: getPerformanceScore(),
      insights: getPerformanceInsights(),
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [metrics, metricsHistory, getPerformanceScore, getPerformanceInsights]);

  return {
    metrics,
    metricsHistory,
    isTracking,
    trackCustomMetric,
    getPerformanceScore,
    getPerformanceInsights,
    exportMetrics,
  };
} 