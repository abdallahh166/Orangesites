import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiClient } from "@/lib/api";
import { useNotifications } from "@/components/ui/notifications";
import { 
  MetricCard,
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
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
import { 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  Target,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  AlertCircle,
  Settings,
  Shield,
  FileText,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Bell,
  Zap,
  Cpu,
  Network,
  Globe,
  Lock,
  Unlock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminDashboardData {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: { role: string; count: number; color?: string }[];
  
  // Site Statistics
  totalSites: number;
  activeSites: number;
  sitesNeedingAttention: number;
  sitesByStatus: { status: string; count: number; color?: string }[];
  
  // Visit Statistics
  totalVisits: number;
  visitsThisMonth: number;
  pendingVisits: number;
  visitsByEngineer: { engineer: string; count: number; color?: string }[];
  visitsByMonth: { month: string; count: number }[];
  
  // System Health
  systemHealth: {
    database: number;
    api: number;
    storage: number;
    memory: number;
    cpu: number;
    network: number;
  };
  
  // Recent Activity
  recentActivity: any[];
  recentErrors: any[];
  
  // Performance Metrics
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    activeSessions: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  
  // Performance monitoring
  const performanceConfig = useMemo(() => ({
    enableMemoryTracking: true,
    enableNetworkTracking: true,
    enableComponentTracking: true,
    enableUserInteractionTracking: true,
  }), []);

  const { metrics, getPerformanceScore, getPerformanceInsights, exportMetrics } = usePerformance(performanceConfig);

  // Memoize the API client to prevent recreation on every render
  const apiClient = useMemo(() => new ApiClient(), []);

  const fetchAdminDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAdminDashboard();
      
      if (response.success) {
        const transformedData = transformDashboardData(response.data);
        setDashboardData(transformedData);
        setTimeout(() => {
          addNotification({
            type: 'success',
            title: 'Dashboard Updated',
            message: 'Admin dashboard data has been refreshed successfully.'
          });
        }, 0);
      } else {
        throw new Error(response.message || 'Failed to fetch admin dashboard data');
      }
    } catch (error: any) {
      console.error('Error fetching admin dashboard data:', error);
      setError(error.message || 'Failed to fetch admin dashboard data');
      // Fallback to mock data
      setDashboardData(getMockAdminDashboardData());
      setTimeout(() => {
        addNotification({
          type: 'warning',
          title: 'Using Demo Data',
          message: 'Unable to fetch real data. Showing demo admin dashboard instead.'
        });
      }, 0);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAdminDashboardData();
      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Refreshed',
          message: 'Admin dashboard has been refreshed successfully.'
        });
      }, 0);
    } catch (error) {
      setTimeout(() => {
        addNotification({
          type: 'error',
          title: 'Refresh Failed',
          message: 'Failed to refresh admin dashboard data.'
        });
      }, 0);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAdminDashboardData]);

  useEffect(() => {
    fetchAdminDashboardData();
  }, [fetchAdminDashboardData]);

  const transformDashboardData = (data: any): AdminDashboardData => {
    return {
      totalUsers: data.userStats?.totalUsers || 0,
      activeUsers: data.userStats?.activeUsers || 0,
      newUsersThisMonth: data.userStats?.newUsersThisMonth || 0,
      usersByRole: data.userStats?.usersByRole || [],
      totalSites: data.siteStats?.totalSites || 0,
      activeSites: data.siteStats?.activeSites || 0,
      sitesNeedingAttention: data.siteStats?.sitesNeedingAttention || 0,
      sitesByStatus: data.siteStats?.sitesByStatus || [],
      totalVisits: data.visitStats?.totalVisits || 0,
      visitsThisMonth: data.visitStats?.visitsThisMonth || 0,
      pendingVisits: data.visitStats?.pendingVisits || 0,
      visitsByEngineer: data.visitStats?.visitsByEngineer || [],
      visitsByMonth: data.visitStats?.visitsByMonth || [],
      systemHealth: {
        database: 98,
        api: 95,
        storage: 87,
        memory: 75,
        cpu: 45,
        network: 92,
      },
      recentActivity: data.recentActivity || [],
      recentErrors: data.recentErrors || [],
      performanceMetrics: {
        averageResponseTime: 245,
        errorRate: 0.5,
        uptime: 99.8,
        activeSessions: 23,
      },
    };
  };

  const getMockAdminDashboardData = (): AdminDashboardData => ({
    totalUsers: 45,
    activeUsers: 38,
    newUsersThisMonth: 12,
    usersByRole: [
      { role: 'Admin', count: 5, color: CHART_COLORS.primary },
      { role: 'Engineer', count: 25, color: CHART_COLORS.secondary },
      { role: 'Manager', count: 8, color: CHART_COLORS.success },
      { role: 'Viewer', count: 7, color: CHART_COLORS.warning },
    ],
    totalSites: 156,
    activeSites: 142,
    sitesNeedingAttention: 8,
    sitesByStatus: [
      { status: 'Active', count: 142, color: CHART_COLORS.success },
      { status: 'Maintenance', count: 8, color: CHART_COLORS.warning },
      { status: 'Inactive', count: 4, color: CHART_COLORS.gray },
      { status: 'Decommissioned', count: 2, color: CHART_COLORS.danger },
    ],
    totalVisits: 892,
    visitsThisMonth: 156,
    pendingVisits: 23,
    visitsByEngineer: [
      { engineer: 'Ahmed Hassan', count: 45, color: CHART_COLORS.primary },
      { engineer: 'Sarah Wilson', count: 38, color: CHART_COLORS.secondary },
      { engineer: 'Mike Johnson', count: 32, color: CHART_COLORS.success },
      { engineer: 'Fatima Ali', count: 28, color: CHART_COLORS.warning },
      { engineer: 'Omar Khalil', count: 25, color: CHART_COLORS.purple },
    ],
    visitsByMonth: [
      { month: 'Jan', count: 23 },
      { month: 'Feb', count: 28 },
      { month: 'Mar', count: 31 },
      { month: 'Apr', count: 25 },
      { month: 'May', count: 29 },
      { month: 'Jun', count: 20 },
    ],
    systemHealth: {
      database: 98,
      api: 95,
      storage: 87,
      memory: 75,
      cpu: 45,
      network: 92,
    },
    recentActivity: [
      { id: 1, type: 'user_login', user: 'Ahmed Hassan', timestamp: '2024-01-15T10:30:00Z', details: 'User logged in' },
      { id: 2, type: 'visit_created', user: 'Sarah Wilson', timestamp: '2024-01-15T09:45:00Z', details: 'New visit created for Site Alpha' },
      { id: 3, type: 'site_updated', user: 'Mike Johnson', timestamp: '2024-01-15T09:15:00Z', details: 'Site Beta status updated to Active' },
      { id: 4, type: 'user_created', user: 'Admin', timestamp: '2024-01-15T08:30:00Z', details: 'New user account created' },
    ],
    recentErrors: [
      { id: 1, type: 'network_error', message: 'Connection timeout', timestamp: '2024-01-15T10:25:00Z', severity: 'medium' },
      { id: 2, type: 'validation_error', message: 'Invalid form data', timestamp: '2024-01-15T09:50:00Z', severity: 'low' },
      { id: 3, type: 'server_error', message: 'Database connection failed', timestamp: '2024-01-15T08:15:00Z', severity: 'high' },
    ],
    performanceMetrics: {
      averageResponseTime: 245,
      errorRate: 0.5,
      uptime: 99.8,
      activeSessions: 23,
    },
  });

  // Table columns for recent activity
  const activityColumns = useMemo(() => [
    createSortableColumn('timestamp', 'Time', (timestamp: string) => 
      new Date(timestamp).toLocaleString()
    ),
    createSortableColumn('user', 'User'),
    createSortableColumn('type', 'Type', (type: string) => (
      <Badge variant="secondary" className="text-xs">
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    )),
    createSortableColumn('details', 'Details'),
    createActionColumn((row: any) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/admin/activity/${row.id}`)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )),
  ], [navigate]);

  // Table columns for recent errors
  const errorColumns = useMemo(() => [
    createSortableColumn('timestamp', 'Time', (timestamp: string) => 
      new Date(timestamp).toLocaleString()
    ),
    createSortableColumn('type', 'Type', (type: string) => (
      <Badge 
        variant={type.includes('error') ? 'destructive' : 'secondary'} 
        className="text-xs"
      >
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    )),
    createSortableColumn('message', 'Message'),
    createSortableColumn('severity', 'Severity', (severity: string) => (
      <Badge 
        variant={
          severity === 'high' ? 'destructive' : 
          severity === 'medium' ? 'secondary' : 'outline'
        }
        className="text-xs"
      >
        {severity.toUpperCase()}
      </Badge>
    )),
    createActionColumn((row: any) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/admin/errors/${row.id}`)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )),
  ], [navigate]);

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">System overview and administration</p>
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

  if (error && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">System overview and administration</p>
          </div>
        </div>
        <ErrorDisplay 
          error={CommonErrors.server(() => fetchAdminDashboardData())}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    );
  }

  if (!dashboardData) return null;

  const performanceScore = getPerformanceScore();
  const performanceInsights = getPerformanceInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            System overview, analytics, and administration controls
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <GlobalSearch className="w-80" />
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/admin/settings')} size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={dashboardData.totalUsers}
          change={8.5}
          changeLabel="vs last month"
          icon={<Users className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Active Sites"
          value={dashboardData.activeSites}
          change={5.2}
          changeLabel="vs last month"
          icon={<MapPin className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Total Visits"
          value={dashboardData.totalVisits}
          change={12.8}
          changeLabel="vs last month"
          icon={<Activity className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="System Uptime"
          value={`${dashboardData.performanceMetrics.uptime}%`}
          icon={<Server className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* System Health & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-gray-600">{dashboardData.systemHealth.database}%</span>
              </div>
              <Progress value={dashboardData.systemHealth.database} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">API</span>
                <span className="text-sm text-gray-600">{dashboardData.systemHealth.api}%</span>
              </div>
              <Progress value={dashboardData.systemHealth.api} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm text-gray-600">{dashboardData.systemHealth.storage}%</span>
              </div>
              <Progress value={dashboardData.systemHealth.storage} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory</span>
                <span className="text-sm text-gray-600">{dashboardData.systemHealth.memory}%</span>
              </div>
              <Progress value={dashboardData.systemHealth.memory} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="h-5 w-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Score</span>
              <Badge variant={performanceScore >= 90 ? 'default' : performanceScore >= 70 ? 'secondary' : 'destructive'}>
                {performanceScore}/100
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Response Time</span>
                <span>{dashboardData.performanceMetrics.averageResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Error Rate</span>
                <span>{dashboardData.performanceMetrics.errorRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Sessions</span>
                <span>{dashboardData.performanceMetrics.activeSessions}</span>
              </div>
            </div>
            {performanceInsights.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-sm font-medium mb-2">Insights:</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {performanceInsights.slice(0, 3).map((insight, index) => (
                    <li key={index}>• {insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent
          title="Users by Role"
          description="Distribution of users across different roles"
          data={dashboardData.usersByRole}
          nameKey="role"
          valueKey="count"
          loading={loading}
        />
        <BarChartComponent
          title="Visits by Engineer"
          description="Visit count per engineer"
          data={dashboardData.visitsByEngineer}
          xKey="engineer"
          yKey="count"
          color="primary"
          horizontal={true}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          title="Visits Trend"
          description="Monthly visit trends"
          data={dashboardData.visitsByMonth}
          xKey="month"
          yKey="count"
          color="secondary"
          loading={loading}
        />
        <PieChartComponent
          title="Sites by Status"
          description="Distribution of sites by status"
          data={dashboardData.sitesByStatus}
          nameKey="status"
          valueKey="count"
          loading={loading}
        />
      </div>

      {/* Recent Activity & Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Recent Activity"
          description="Latest system activities and user actions"
          columns={activityColumns}
          data={dashboardData.recentActivity}
          loading={loading}
          searchable={true}
          exportable={true}
          onExport={() => addNotification({ type: 'info', title: 'Export', message: 'Export feature coming soon!' })}
          onRefresh={handleRefresh}
        />
        <DataTable
          title="Recent Errors"
          description="System errors and issues"
          columns={errorColumns}
          data={dashboardData.recentErrors}
          loading={loading}
          searchable={true}
          exportable={true}
          onExport={() => addNotification({ type: 'info', title: 'Export', message: 'Export feature coming soon!' })}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/users')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/sites')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <MapPin className="h-6 w-6" />
              <span className="text-sm">Manage Sites</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/reports')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Generate Reports</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/settings')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Settings className="h-6 w-6" />
              <span className="text-sm">System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 