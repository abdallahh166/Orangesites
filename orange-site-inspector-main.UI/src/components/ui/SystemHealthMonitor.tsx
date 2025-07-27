import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { ApiClient } from '@/lib/api';

interface SystemHealthData {
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
}

interface ServiceStatus {
  status: 'healthy' | 'warning' | 'error' | 'offline';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  message?: string;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface PerformanceMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export const SystemHealthMonitor: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { isOnline, isApiHealthy, lastChecked } = useNetworkStatus();
  const apiClient = new ApiClient();

  useEffect(() => {
    fetchHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Fetch detailed health status from API
      const healthResponse = await apiClient.getDetailedHealthStatus();
      
      // Simulate performance metrics (in real app, these would come from monitoring service)
      const performanceMetrics = await getPerformanceMetrics();
      
      // Generate system alerts based on health status
      const alerts = generateSystemAlerts(healthResponse, performanceMetrics);
      
      const newHealthData: SystemHealthData = {
        overall: calculateOverallHealth(healthResponse, performanceMetrics),
        services: {
          api: {
            status: healthResponse.success && healthResponse.data.services?.API === 'Healthy' ? 'healthy' : 'error',
            responseTime: Math.random() * 100 + 50, // Simulated response time
            uptime: 99.9,
            lastCheck: new Date(),
            message: healthResponse.success ? 'API is responding normally' : 'API is not responding'
          },
          database: {
            status: healthResponse.success && healthResponse.data.services?.Database === 'Healthy' ? 'healthy' : 'error',
            responseTime: Math.random() * 200 + 100,
            uptime: 99.8,
            lastCheck: new Date(),
            message: healthResponse.success ? 'Database connection stable' : 'Database connection issues'
          },
          storage: {
            status: performanceMetrics.disk > 90 ? 'warning' : 'healthy',
            responseTime: Math.random() * 50 + 20,
            uptime: 99.9,
            lastCheck: new Date(),
            message: performanceMetrics.disk > 90 ? 'Storage usage high' : 'Storage usage normal'
          },
          authentication: {
            status: healthResponse.success && healthResponse.data.services?.Authentication === 'Healthy' ? 'healthy' : 'error',
            responseTime: Math.random() * 80 + 40,
            uptime: 99.9,
            lastCheck: new Date(),
            message: healthResponse.success ? 'Authentication service active' : 'Authentication service issues'
          }
        },
        performance: performanceMetrics,
        alerts,
        lastUpdated: new Date()
      };
      
      setHealthData(newHealthData);
    } catch (error) {
      console.error('Error fetching health data:', error);
      // Set fallback data
      setHealthData(getFallbackHealthData());
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceMetrics = async (): Promise<SystemHealthData['performance']> => {
    // Simulate performance metrics - in real app, these would come from system monitoring
    return {
      cpu: Math.random() * 30 + 20, // 20-50%
      memory: Math.random() * 40 + 30, // 30-70%
      disk: Math.random() * 20 + 70, // 70-90%
      network: Math.random() * 15 + 85 // 85-100%
    };
  };

  const generateSystemAlerts = (healthResponse: any, performance: any): SystemAlert[] => {
    const alerts: SystemAlert[] = [];
    
    if (!healthResponse.success) {
      alerts.push({
        id: 'api-unavailable',
        type: 'error',
        title: 'API Service Unavailable',
        message: 'The API service is not responding to health checks',
        timestamp: new Date(),
        resolved: false
      });
    }
    
    if (performance.disk > 85) {
      alerts.push({
        id: 'disk-usage-high',
        type: 'warning',
        title: 'High Disk Usage',
        message: `Disk usage is at ${performance.disk.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      });
    }
    
    if (performance.memory > 80) {
      alerts.push({
        id: 'memory-usage-high',
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is at ${performance.memory.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      });
    }
    
    if (!isOnline) {
      alerts.push({
        id: 'network-offline',
        type: 'critical',
        title: 'Network Offline',
        message: 'No internet connection detected',
        timestamp: new Date(),
        resolved: false
      });
    }
    
    return alerts;
  };

  const calculateOverallHealth = (healthResponse: any, performance: any): number => {
    let score = 100;
    
    if (!healthResponse.success) score -= 30;
    if (performance.disk > 90) score -= 15;
    if (performance.memory > 85) score -= 10;
    if (!isOnline) score -= 25;
    
    return Math.max(0, score);
  };

  const getFallbackHealthData = (): SystemHealthData => ({
    overall: 75,
    services: {
      api: { status: 'error', responseTime: 0, uptime: 0, lastCheck: new Date(), message: 'Unable to check API status' },
      database: { status: 'error', responseTime: 0, uptime: 0, lastCheck: new Date(), message: 'Unable to check database status' },
      storage: { status: 'warning', responseTime: 0, uptime: 0, lastCheck: new Date(), message: 'Unable to check storage status' },
      authentication: { status: 'error', responseTime: 0, uptime: 0, lastCheck: new Date(), message: 'Unable to check authentication status' }
    },
    performance: { cpu: 0, memory: 0, disk: 0, network: 0 },
    alerts: [{
      id: 'health-check-failed',
      type: 'error',
      title: 'Health Check Failed',
      message: 'Unable to fetch system health data',
      timestamp: new Date(),
      resolved: false
    }],
    lastUpdated: new Date()
  });

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-red-500';
    if (value >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'CPU Usage',
      value: healthData?.performance.cpu || 0,
      max: 100,
      unit: '%',
      trend: 'stable',
      color: getPerformanceColor(healthData?.performance.cpu || 0)
    },
    {
      label: 'Memory Usage',
      value: healthData?.performance.memory || 0,
      max: 100,
      unit: '%',
      trend: 'stable',
      color: getPerformanceColor(healthData?.performance.memory || 0)
    },
    {
      label: 'Disk Usage',
      value: healthData?.performance.disk || 0,
      max: 100,
      unit: '%',
      trend: 'stable',
      color: getPerformanceColor(healthData?.performance.disk || 0)
    },
    {
      label: 'Network',
      value: healthData?.performance.network || 0,
      max: 100,
      unit: '%',
      trend: 'stable',
      color: getPerformanceColor(healthData?.performance.network || 0)
    }
  ];

  if (loading && !healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHealthData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge 
              variant={autoRefresh ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health Score */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {healthData?.overall || 0}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Overall System Health
          </div>
          <Progress value={healthData?.overall || 0} className="mt-2" />
        </div>

        {/* Service Status */}
        <div>
          <h4 className="font-semibold mb-3">Service Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthData && Object.entries(healthData.services).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.status)}
                  <span className="font-medium capitalize">{service}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(status.status)}>
                    {status.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {status.responseTime}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="font-semibold mb-3">Performance Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.label}
                </div>
                <Progress value={metric.value} className="mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        {healthData?.alerts && healthData.alerts.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">System Alerts</h4>
            <div className="space-y-2">
              {healthData.alerts.slice(0, 3).map((alert) => (
                <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Network Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
            <span>Network Status</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Badge variant={isApiHealthy ? 'default' : 'destructive'}>
              API {isApiHealthy ? 'Healthy' : 'Unhealthy'}
            </Badge>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {healthData?.lastUpdated.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}; 