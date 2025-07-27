import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiClient } from "@/lib/api";
import { useNotifications } from "@/components/ui/notifications";
import { 
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  CHART_COLORS
} from "@/components/ui/charts";
import { DataTable, createSortableColumn, createActionColumn } from "@/components/ui/data-table";
import { GlobalSearch } from "@/components/ui/global-search";
import { ErrorDisplay, CommonErrors } from "@/components/ui/error-display";
import { usePerformance } from "@/hooks/use-performance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Server, 
  Database, 
  HardDrive, 
  Cpu, 
  Memory, 
  Network, 
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  Lock,
  Unlock,
  Eye,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Thermometer,
  Gauge,
  BarChart3,
  LineChart,
  AreaChart,
  PieChart,
  AlertCircle,
  Info,
  Warning,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Power,
  PowerOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Cloud,
  CloudOff,
  Database as DatabaseIcon,
  HardDrive as HardDriveIcon,
  Network as NetworkIcon,
  Cpu as CpuIcon,
  Memory as MemoryIcon,
  Globe as GlobeIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SystemMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
    latency: number;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
  };
  api: {
    requests: number;
    errors: number;
    responseTime: number;
    uptime: number;
  };
  storage: {
    used: number;
    total: number;
    available: number;
  };
  security: {
    activeThreats: number;
    blockedRequests: number;
    sslStatus: 'valid' | 'expired' | 'invalid';
  };
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  component: string;
  status: 'active' | 'resolved' | 'acknowledged';
  severity: number;
}

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    database: 'healthy' | 'warning' | 'critical';
    api: 'healthy' | 'warning' | 'critical';
    storage: 'healthy' | 'warning' | 'critical';
    network: 'healthy' | 'warning' | 'critical';
    security: 'healthy' | 'warning' | 'critical';
  };
  lastCheck: string;
  uptime: number;
}

export default function SystemHealth() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Performance monitoring
  const { metrics: perfMetrics, getPerformanceScore, getPerformanceInsights } = usePerformance({
    enableMemoryTracking: true,
    enableNetworkTracking: true,
    enableComponentTracking: true,
    enableUserInteractionTracking: true,
  });

  const apiClient = new ApiClient();

  const fetchSystemHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getSystemHealth();
      
      if (response.success) {
        setMetrics(response.data.metrics || []);
        setAlerts(response.data.alerts || []);
        setSystemStatus(response.data.status || null);
      } else {
        throw new Error(response.message || 'Failed to fetch system health data');
      }
    } catch (error: any) {
      console.error('Error fetching system health data:', error);
      setError(error.message || 'Failed to fetch system health data');
      // Fallback to mock data
      const mockData = getMockSystemHealthData();
      setMetrics(mockData.metrics);
      setAlerts(mockData.alerts);
      setSystemStatus(mockData.status);
      addNotification({
        type: 'warning',
        title: 'Using Demo Data',
        message: 'Unable to fetch real system health data. Showing demo data instead.'
      });
    } finally {
      setLoading(false);
    }
  }, [apiClient, addNotification]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSystemHealth();
      addNotification({
        type: 'success',
        title: 'Refreshed',
        message: 'System health data has been refreshed successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh system health data.'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await apiClient.acknowledgeAlert(alertId);
      if (response.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged' as const }
            : alert
        ));
        addNotification({
          type: 'success',
          title: 'Alert Acknowledged',
          message: 'Alert has been acknowledged successfully.'
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Failed',
        message: 'Failed to acknowledge alert.'
      });
    }
  }, [apiClient, addNotification]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const response = await apiClient.resolveAlert(alertId);
      if (response.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved' as const }
            : alert
        ));
        addNotification({
          type: 'success',
          title: 'Alert Resolved',
          message: 'Alert has been resolved successfully.'
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Failed',
        message: 'Failed to resolve alert.'
      });
    }
  }, [apiClient, addNotification]);

  useEffect(() => {
    fetchSystemHealth();
  }, [selectedTimeRange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchSystemHealth]);

  const getMockSystemHealthData = () => {
    const now = new Date();
    const mockMetrics: SystemMetrics[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(now.getTime() - (23 - i) * 3600000).toISOString(),
      cpu: Math.random() * 30 + 20,
      memory: Math.random() * 20 + 60,
      disk: Math.random() * 15 + 70,
      network: {
        upload: Math.random() * 10 + 5,
        download: Math.random() * 15 + 10,
        latency: Math.random() * 50 + 20,
      },
      database: {
        connections: Math.floor(Math.random() * 20 + 10),
        queries: Math.floor(Math.random() * 100 + 50),
        responseTime: Math.random() * 100 + 50,
      },
      api: {
        requests: Math.floor(Math.random() * 1000 + 500),
        errors: Math.floor(Math.random() * 10 + 1),
        responseTime: Math.random() * 200 + 100,
        uptime: 99.8,
      },
      storage: {
        used: 750,
        total: 1000,
        available: 250,
      },
      security: {
        activeThreats: Math.floor(Math.random() * 3),
        blockedRequests: Math.floor(Math.random() * 50 + 10),
        sslStatus: 'valid' as const,
      },
    }));

    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Memory usage has exceeded 80% threshold',
        timestamp: new Date(now.getTime() - 300000).toISOString(),
        component: 'memory',
        status: 'active',
        severity: 2,
      },
      {
        id: '2',
        type: 'info',
        title: 'Database Backup Completed',
        message: 'Daily database backup completed successfully',
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        component: 'database',
        status: 'resolved',
        severity: 1,
      },
      {
        id: '3',
        type: 'critical',
        title: 'API Response Time Degraded',
        message: 'API response time has increased significantly',
        timestamp: new Date(now.getTime() - 600000).toISOString(),
        component: 'api',
        status: 'active',
        severity: 3,
      },
    ];

    const mockStatus: SystemStatus = {
      overall: 'warning',
      components: {
        database: 'healthy',
        api: 'warning',
        storage: 'healthy',
        network: 'healthy',
        security: 'healthy',
      },
      lastCheck: now.toISOString(),
      uptime: 99.8,
    };

    return { metrics: mockMetrics, alerts: mockAlerts, status: mockStatus };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Table columns for alerts
  const alertColumns = [
    createSortableColumn('timestamp', 'Time', (timestamp: string) => 
      new Date(timestamp).toLocaleString()
    ),
    createSortableColumn('type', 'Type', (type: string) => (
      <Badge 
        variant={
          type === 'critical' ? 'destructive' : 
          type === 'warning' ? 'secondary' : 
          type === 'info' ? 'outline' : 'default'
        }
        className="text-xs"
      >
        {type.toUpperCase()}
      </Badge>
    )),
    createSortableColumn('title', 'Title'),
    createSortableColumn('component', 'Component'),
    createSortableColumn('status', 'Status', (status: string) => (
      <Badge 
        variant={
          status === 'active' ? 'destructive' : 
          status === 'acknowledged' ? 'secondary' : 'default'
        }
        className="text-xs"
      >
        {status.toUpperCase()}
      </Badge>
    )),
    createActionColumn((row) => (
      <div className="flex items-center space-x-1">
        {row.status === 'active' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => acknowledgeAlert(row.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resolveAlert(row.id)}
              className="h-8 w-8 p-0"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    )),
  ];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesComponent = selectedComponent === 'all' || alert.component === selectedComponent;
    
    return matchesSearch && matchesComponent;
  });

  const currentMetrics = metrics[metrics.length - 1];
  const performanceScore = getPerformanceScore();
  const performanceInsights = getPerformanceInsights();

  if (loading && !currentMetrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Health</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time system monitoring and diagnostics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !currentMetrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Health</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time system monitoring and diagnostics</p>
          </div>
        </div>
        <ErrorDisplay 
          error={CommonErrors.server(() => fetchSystemHealth())}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    );
  }

  if (!currentMetrics || !systemStatus) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Health</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time system monitoring, performance metrics, and health diagnostics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <GlobalSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search alerts..."
            className="w-80"
          />
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
          >
            {autoRefresh ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            {getStatusIcon(systemStatus.overall)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemStatus.overall}</div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemStatus.uptime}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceScore}/100</div>
            <p className="text-xs text-muted-foreground">
              {performanceScore >= 90 ? 'Excellent' : performanceScore >= 70 ? 'Good' : 'Needs Attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.type === 'critical' && a.status === 'active').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(systemStatus.lastCheck).toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(systemStatus.lastCheck).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Component Status */}
      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(systemStatus.components).map(([component, status]) => (
              <div key={component} className="flex items-center space-x-3 p-3 border rounded-lg">
                {getStatusIcon(status)}
                <div>
                  <p className="font-medium capitalize">{component}</p>
                  <p className={`text-sm ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU & Memory Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CPU</span>
                <span className="text-sm text-gray-600">{currentMetrics.cpu.toFixed(1)}%</span>
              </div>
              <Progress value={currentMetrics.cpu} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory</span>
                <span className="text-sm text-gray-600">{currentMetrics.memory.toFixed(1)}%</span>
              </div>
              <Progress value={currentMetrics.memory} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Disk</span>
                <span className="text-sm text-gray-600">{currentMetrics.disk.toFixed(1)}%</span>
              </div>
              <Progress value={currentMetrics.disk} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network & API Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Network Latency</p>
                <p className="text-2xl font-bold">{currentMetrics.network.latency.toFixed(0)}ms</p>
              </div>
              <div>
                <p className="text-sm font-medium">API Response Time</p>
                <p className="text-2xl font-bold">{currentMetrics.api.responseTime.toFixed(0)}ms</p>
              </div>
              <div>
                <p className="text-sm font-medium">Database Queries</p>
                <p className="text-2xl font-bold">{currentMetrics.database.queries}</p>
              </div>
              <div>
                <p className="text-sm font-medium">API Requests</p>
                <p className="text-2xl font-bold">{currentMetrics.api.requests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          title="CPU Usage Trend"
          description="CPU utilization over time"
          data={metrics.map(m => ({ time: new Date(m.timestamp).toLocaleTimeString(), value: m.cpu }))}
          xKey="time"
          yKey="value"
          color="primary"
          loading={loading}
        />
        <LineChartComponent
          title="Memory Usage Trend"
          description="Memory utilization over time"
          data={metrics.map(m => ({ time: new Date(m.timestamp).toLocaleTimeString(), value: m.memory }))}
          xKey="time"
          yKey="value"
          color="secondary"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartComponent
          title="Network Performance"
          description="Network upload/download speeds"
          data={metrics.map(m => ({ 
            time: new Date(m.timestamp).toLocaleTimeString(), 
            upload: m.network.upload,
            download: m.network.download
          }))}
          xKey="time"
          yKeys={['upload', 'download']}
          colors={[CHART_COLORS.primary, CHART_COLORS.secondary]}
          loading={loading}
        />
        <BarChartComponent
          title="API Performance"
          description="API requests and errors"
          data={metrics.map(m => ({ 
            time: new Date(m.timestamp).toLocaleTimeString(), 
            requests: m.api.requests,
            errors: m.api.errors
          }))}
          xKey="time"
          yKeys={['requests', 'errors']}
          colors={[CHART_COLORS.success, CHART_COLORS.danger]}
          loading={loading}
        />
      </div>

      {/* Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">System Alerts</h2>
          <Select value={selectedComponent} onValueChange={setSelectedComponent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by component" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Components</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="memory">Memory</SelectItem>
              <SelectItem value="cpu">CPU</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Alerts</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All systems are running smoothly with no active alerts.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription>{alert.message}</AlertDescription>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Component: {alert.component}</span>
                        <span>Time: {new Date(alert.timestamp).toLocaleString()}</span>
                        <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {alert.status === 'active' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {performanceInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {performanceInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 