import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { useNetworkStatus } from './use-network-status';

export interface SystemHealthData {
  overall: number;
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    storage: ServiceStatus;
    authentication: ServiceStatus;
  };
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  alerts: SystemAlert[];
  lastUpdated: Date;
  uptime: number;
  version: string;
  environment: string;
}

export interface ServiceStatus {
  status: 'healthy' | 'warning' | 'error' | 'offline';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  message?: string;
  healthScore: number;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  category: 'performance' | 'security' | 'availability' | 'maintenance';
}

export interface PerformanceMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  apiResponseTime: number;
  databaseResponseTime: number;
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
}

export const useSystemHealth = (checkInterval: number = 30000) => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, isApiHealthy, lastChecked } = useNetworkStatus();
  const apiClient = new ApiClient();

  const fetchHealthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch detailed health status from API
      const healthResponse = await apiClient.getDetailedHealthStatus();
      
      // Generate performance metrics
      const performanceMetrics = await getPerformanceMetrics();
      setPerformanceHistory(prev => [...prev.slice(-50), performanceMetrics]); // Keep last 50 data points
      
      // Generate system alerts
      const alerts = generateSystemAlerts(healthResponse, performanceMetrics);
      
      // Calculate overall health score
      const overallHealth = calculateOverallHealth(healthResponse, performanceMetrics);
      
      const newHealthData: SystemHealthData = {
        overall: overallHealth,
        services: {
          api: {
            status: healthResponse.success && healthResponse.data.services?.API === 'Healthy' ? 'healthy' : 'error',
            responseTime: performanceMetrics.apiResponseTime,
            uptime: 99.9,
            lastCheck: new Date(),
            message: healthResponse.success ? 'API is responding normally' : 'API is not responding',
            healthScore: healthResponse.success ? 95 : 30
          },
          database: {
            status: healthResponse.success && healthResponse.data.services?.Database === 'Healthy' ? 'healthy' : 'error',
            responseTime: performanceMetrics.databaseResponseTime,
            uptime: 99.8,
            lastCheck: new Date(),
            message: healthResponse.success ? 'Database connection stable' : 'Database connection issues',
            healthScore: healthResponse.success ? 92 : 25
          },
          storage: {
            status: performanceMetrics.disk > 90 ? 'warning' : 'healthy',
            responseTime: Math.random() * 50 + 20,
            uptime: 99.9,
            lastCheck: new Date(),
            message: performanceMetrics.disk > 90 ? 'Storage usage high' : 'Storage usage normal',
            healthScore: performanceMetrics.disk > 90 ? 70 : 96
          },
          authentication: {
            status: healthResponse.success && healthResponse.data.services?.Authentication === 'Healthy' ? 'healthy' : 'error',
            responseTime: Math.random() * 80 + 40,
            uptime: 99.9,
            lastCheck: new Date(),
            message: healthResponse.success ? 'Authentication service active' : 'Authentication service issues',
            healthScore: healthResponse.success ? 98 : 20
          }
        },
        performance: {
          cpu: performanceMetrics.cpu,
          memory: performanceMetrics.memory,
          disk: performanceMetrics.disk,
          network: performanceMetrics.network
        },
        alerts,
        lastUpdated: new Date(),
        uptime: 99.9,
        version: healthResponse.data?.version || '1.0.0',
        environment: healthResponse.data?.environment || 'Development'
      };
      
      setHealthData(newHealthData);
    } catch (error) {
      console.error('Error fetching system health data:', error);
      setError('Failed to fetch system health data');
      setHealthData(getFallbackHealthData());
    } finally {
      setLoading(false);
    }
  }, [isOnline, isApiHealthy]);

  const getPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
    // Simulate performance metrics - in real app, these would come from system monitoring
    return {
      timestamp: new Date(),
      cpu: Math.random() * 30 + 20, // 20-50%
      memory: Math.random() * 40 + 30, // 30-70%
      disk: Math.random() * 20 + 70, // 70-90%
      network: Math.random() * 15 + 85, // 85-100%
      apiResponseTime: Math.random() * 100 + 50,
      databaseResponseTime: Math.random() * 200 + 100,
      activeUsers: Math.floor(Math.random() * 50) + 10,
      requestsPerMinute: Math.floor(Math.random() * 100) + 50,
      errorRate: Math.random() * 5
    };
  };

  const generateSystemAlerts = (healthResponse: any, performance: PerformanceMetrics): SystemAlert[] => {
    const alerts: SystemAlert[] = [];
    
    if (!healthResponse.success) {
      alerts.push({
        id: 'api-failure',
        type: 'critical',
        title: 'API Service Failure',
        message: 'The main API service is not responding to health checks',
        timestamp: new Date(),
        resolved: false,
        category: 'availability'
      });
    }
    
    if (performance.cpu > 80) {
      alerts.push({
        id: 'high-cpu',
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage has exceeded 80% (currently ${performance.cpu.toFixed(1)}%)`,
        timestamp: new Date(),
        resolved: false,
        category: 'performance'
      });
    }
    
    if (performance.memory > 85) {
      alerts.push({
        id: 'high-memory',
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage has exceeded 85% (currently ${performance.memory.toFixed(1)}%)`,
        timestamp: new Date(),
        resolved: false,
        category: 'performance'
      });
    }
    
    if (performance.disk > 90) {
      alerts.push({
        id: 'high-disk',
        type: 'warning',
        title: 'High Disk Usage',
        message: `Disk usage has exceeded 90% (currently ${performance.disk.toFixed(1)}%)`,
        timestamp: new Date(),
        resolved: false,
        category: 'performance'
      });
    }
    
    if (performance.errorRate > 3) {
      alerts.push({
        id: 'high-error-rate',
        type: 'error',
        title: 'High Error Rate',
        message: `Error rate has exceeded 3% (currently ${performance.errorRate.toFixed(2)}%)`,
        timestamp: new Date(),
        resolved: false,
        category: 'availability'
      });
    }
    
    if (!isOnline) {
      alerts.push({
        id: 'network-offline',
        type: 'critical',
        title: 'Network Offline',
        message: 'No internet connection detected',
        timestamp: new Date(),
        resolved: false,
        category: 'availability'
      });
    }
    
    if (!isApiHealthy) {
      alerts.push({
        id: 'api-unhealthy',
        type: 'error',
        title: 'API Unhealthy',
        message: 'API health check failed',
        timestamp: new Date(),
        resolved: false,
        category: 'availability'
      });
    }
    
    return alerts;
  };

  const calculateOverallHealth = (healthResponse: any, performance: PerformanceMetrics): number => {
    let score = 100;
    
    if (!healthResponse.success) score -= 30;
    if (performance.cpu > 80) score -= 10;
    if (performance.memory > 85) score -= 8;
    if (performance.disk > 90) score -= 12;
    if (performance.errorRate > 3) score -= 15;
    if (!isOnline) score -= 25;
    if (!isApiHealthy) score -= 20;
    
    return Math.max(0, Math.round(score));
  };

  const getFallbackHealthData = (): SystemHealthData => ({
    overall: 75,
    services: {
      api: { 
        status: 'error', 
        responseTime: 0, 
        uptime: 0, 
        lastCheck: new Date(), 
        message: 'Unable to check API status',
        healthScore: 30
      },
      database: { 
        status: 'error', 
        responseTime: 0, 
        uptime: 0, 
        lastCheck: new Date(), 
        message: 'Unable to check database status',
        healthScore: 25
      },
      storage: { 
        status: 'warning', 
        responseTime: 0, 
        uptime: 0, 
        lastCheck: new Date(), 
        message: 'Unable to check storage status',
        healthScore: 70
      },
      authentication: { 
        status: 'error', 
        responseTime: 0, 
        uptime: 0, 
        lastCheck: new Date(), 
        message: 'Unable to check authentication status',
        healthScore: 20
      }
    },
    performance: { cpu: 0, memory: 0, disk: 0, network: 0 },
    alerts: [{
      id: 'health-check-failed',
      type: 'error',
      title: 'Health Check Failed',
      message: 'Unable to fetch system health data',
      timestamp: new Date(),
      resolved: false,
      category: 'availability'
    }],
    lastUpdated: new Date(),
    uptime: 0,
    version: 'Unknown',
    environment: 'Unknown'
  });

  // Monitor online/offline status changes
  useEffect(() => {
    if (isOnline) {
      fetchHealthData();
    }
  }, [isOnline, fetchHealthData]);

  // Periodic health checks
  useEffect(() => {
    // Initial check
    fetchHealthData();

    // Set up interval for periodic checks
    const interval = setInterval(fetchHealthData, checkInterval);

    return () => clearInterval(interval);
  }, [fetchHealthData, checkInterval]);

  const refreshHealthData = useCallback(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  const resolveAlert = useCallback((alertId: string) => {
    setHealthData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        )
      };
    });
  }, []);

  const getHealthTrend = useCallback(() => {
    if (performanceHistory.length < 2) return 'stable';
    const recent = performanceHistory.slice(-5);
    const older = performanceHistory.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, m) => sum + m.cpu, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.cpu, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'declining';
    if (recentAvg < olderAvg - 5) return 'improving';
    return 'stable';
  }, [performanceHistory]);

  return {
    healthData,
    performanceHistory,
    loading,
    error,
    refreshHealthData,
    resolveAlert,
    getHealthTrend,
    isOnline,
    isApiHealthy,
    lastChecked
  };
}; 