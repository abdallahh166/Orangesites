import { useState, useEffect, useCallback } from "react";
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
  Plus,
  Eye,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardData {
  totalVisits: number;
  visitsThisMonth: number;
  pendingVisits: number;
  acceptedVisits: number;
  rejectedVisits: number;
  averageVisitsPerDay: number;
  visitsToday: number;
  visitsThisWeek: number;
  recentVisits: any[];
  recentlyVisitedSites: any[];
  visitsByStatus: { label: string; value: number; color?: string }[];
  visitsByMonth: { label: string; value: number }[];
  visitsByDay: { label: string; value: number }[];
  topSites: { label: string; value: number; color?: string }[];
  visitsByEngineer?: { label: string; value: number; color?: string }[];
  systemHealth: {
    database: number;
    api: number;
    storage: number;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  
  // Create API client instance
  const apiClient = new ApiClient();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      if (user?.role === 'Admin') {
        response = await apiClient.getAdminDashboard();
      } else {
        response = await apiClient.getEngineerDashboard();
      }
      
      if (response.success) {
        // Transform the response data to match our interface
        const transformedData = transformDashboardData(response.data);
        setDashboardData(transformedData);
        addNotification({
          type: 'success',
          title: 'Dashboard Updated',
          message: 'Dashboard data has been refreshed successfully.'
        });
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to fetch dashboard data');
      // Fallback to mock data
      setDashboardData(getMockDashboardData());
      addNotification({
        type: 'warning',
        title: 'Using Demo Data',
        message: 'Unable to fetch real data. Showing demo data instead.'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.role, apiClient, addNotification]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      addNotification({
        type: 'success',
        title: 'Refreshed',
        message: 'Dashboard has been refreshed successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh dashboard data.'
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role, timeRange]);

  const transformDashboardData = (data: any): DashboardData => {
    // Transform the API response to match our interface
    return {
      totalVisits: data.stats?.totalVisits || data.totalMyVisits || 0,
      visitsThisMonth: data.stats?.totalVisitsThisMonth || data.myVisitsThisMonth || 0,
      pendingVisits: data.stats?.pendingVisits || data.myPendingVisits || 0,
      acceptedVisits: data.stats?.acceptedVisits || data.myAcceptedVisits || 0,
      rejectedVisits: data.stats?.rejectedVisits || data.myRejectedVisits || 0,
      averageVisitsPerDay: data.stats?.averageVisitsPerDay || data.averageVisitsPerDay || 0,
      visitsToday: data.stats?.visitsToday || data.visitsToday || 0,
      visitsThisWeek: data.stats?.visitsThisWeek || data.visitsThisWeek || 0,
      recentVisits: data.latestVisits || data.myLatestVisits || [],
      recentlyVisitedSites: data.recentSites || data.myRecentSites || [],
      visitsByStatus: data.charts?.visitsByStatus || data.myVisitsByStatus || [],
      visitsByMonth: data.charts?.visitsByMonth || data.myVisitsByMonth || [],
      visitsByDay: data.charts?.visitsByDay || [],
      topSites: data.charts?.topSites || [],
      visitsByEngineer: data.visitsByEngineer || undefined,
      systemHealth: {
        database: 98,
        api: 95,
        storage: 87,
      },
    };
  };

  const getMockDashboardData = (): DashboardData => ({
    totalVisits: 156,
    visitsThisMonth: 23,
    pendingVisits: 8,
    acceptedVisits: 142,
    rejectedVisits: 6,
    averageVisitsPerDay: 2.3,
    visitsToday: 3,
    visitsThisWeek: 12,
    recentVisits: [
      { id: 1, siteName: 'Site A', status: 'Pending', date: '2024-01-15', engineer: 'John Doe' },
      { id: 2, siteName: 'Site B', status: 'Accepted', date: '2024-01-14', engineer: 'Jane Smith' },
      { id: 3, siteName: 'Site C', status: 'Rejected', date: '2024-01-13', engineer: 'Mike Johnson' },
    ],
    recentlyVisitedSites: [
      { id: 1, name: 'Site A', lastVisit: '2024-01-15', status: 'Active' },
      { id: 2, name: 'Site B', lastVisit: '2024-01-14', status: 'Active' },
      { id: 3, name: 'Site C', lastVisit: '2024-01-13', status: 'Maintenance' },
    ],
    visitsByStatus: [
      { label: 'Pending', value: 8, color: CHART_COLORS.warning },
      { label: 'Accepted', value: 142, color: CHART_COLORS.success },
      { label: 'Rejected', value: 6, color: CHART_COLORS.danger },
    ],
    visitsByMonth: [
      { label: 'Jan', value: 23 },
      { label: 'Feb', value: 28 },
      { label: 'Mar', value: 31 },
      { label: 'Apr', value: 25 },
      { label: 'May', value: 29 },
      { label: 'Jun', value: 20 },
    ],
    visitsByDay: [
      { label: 'Mon', value: 5 },
      { label: 'Tue', value: 8 },
      { label: 'Wed', value: 6 },
      { label: 'Thu', value: 9 },
      { label: 'Fri', value: 7 },
      { label: 'Sat', value: 3 },
      { label: 'Sun', value: 1 },
    ],
    topSites: [
      { label: 'Site A', value: 15, color: CHART_COLORS.primary },
      { label: 'Site B', value: 12, color: CHART_COLORS.secondary },
      { label: 'Site C', value: 10, color: CHART_COLORS.success },
      { label: 'Site D', value: 8, color: CHART_COLORS.warning },
      { label: 'Site E', value: 6, color: CHART_COLORS.purple },
    ],
    visitsByEngineer: [
      { label: 'John Doe', value: 45, color: CHART_COLORS.primary },
      { label: 'Jane Smith', value: 38, color: CHART_COLORS.secondary },
      { label: 'Mike Johnson', value: 32, color: CHART_COLORS.success },
      { label: 'Sarah Wilson', value: 28, color: CHART_COLORS.warning },
      { label: 'David Brown', value: 25, color: CHART_COLORS.purple },
    ],
    systemHealth: {
      database: 98,
      api: 95,
      storage: 87,
    },
  });

  // Table columns for recent visits
  const recentVisitsColumns = [
    createSortableColumn('siteName', 'Site Name'),
    createSortableColumn('status', 'Status', (status: string) => (
      <Badge 
        variant={status === 'Accepted' ? 'default' : status === 'Pending' ? 'secondary' : 'destructive'}
        className="text-xs"
      >
        {status}
      </Badge>
    )),
    createSortableColumn('date', 'Date'),
    createSortableColumn('engineer', 'Engineer'),
    createActionColumn((row) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/visits/${row.id}`)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )),
  ];

  // Table columns for recent sites
  const recentSitesColumns = [
    createSortableColumn('name', 'Site Name'),
    createSortableColumn('lastVisit', 'Last Visit'),
    createSortableColumn('status', 'Status', (status: string) => (
      <Badge 
        variant={status === 'Active' ? 'default' : 'secondary'}
        className="text-xs"
      >
        {status}
      </Badge>
    )),
    createActionColumn((row) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/sites/${row.id}`)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )),
  ];

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.fullName || 'User'}!</p>
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
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.fullName || 'User'}! Here's what's happening today.
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
          <Button onClick={() => navigate('/add-visit')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Visit
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Visits"
          value={dashboardData.totalVisits}
          change={12.5}
          changeLabel="vs last month"
          icon={<Activity className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="This Month"
          value={dashboardData.visitsThisMonth}
          change={8.2}
          changeLabel="vs last month"
          icon={<Calendar className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Pending Visits"
          value={dashboardData.pendingVisits}
          change={-5.1}
          changeLabel="vs last week"
          icon={<Clock className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Success Rate"
          value={`${((dashboardData.acceptedVisits / dashboardData.totalVisits) * 100).toFixed(1)}%`}
          change={2.3}
          changeLabel="vs last month"
          icon={<Target className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          title="Visits Trend"
          description="Daily visits over the last 30 days"
          data={dashboardData.visitsByDay}
          xKey="label"
          yKey="value"
          color="primary"
          loading={loading}
        />
        <AreaChartComponent
          title="Monthly Overview"
          description="Visit distribution by month"
          data={dashboardData.visitsByMonth}
          xKey="label"
          yKey="value"
          color="secondary"
          loading={loading}
        />
      </div>

      {/* Status and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PieChartComponent
          title="Visit Status"
          description="Distribution by status"
          data={dashboardData.visitsByStatus}
          nameKey="label"
          valueKey="value"
          loading={loading}
        />
        {user?.role === 'Admin' && dashboardData.visitsByEngineer && (
          <BarChartComponent
            title="Engineer Performance"
            description="Visits completed by engineer"
            data={dashboardData.visitsByEngineer}
            xKey="label"
            yKey="value"
            color="success"
            horizontal={true}
            loading={loading}
          />
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
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
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Recent Visits"
          description="Latest inspection visits"
          columns={recentVisitsColumns}
          data={dashboardData.recentVisits}
          loading={loading}
          searchable={true}
          exportable={true}
          onExport={() => addNotification({ type: 'info', title: 'Export', message: 'Export feature coming soon!' })}
          onRefresh={handleRefresh}
        />
        <DataTable
          title="Recently Visited Sites"
          description="Sites with recent activity"
          columns={recentSitesColumns}
          data={dashboardData.recentlyVisitedSites}
          loading={loading}
          searchable={true}
          exportable={true}
          onExport={() => addNotification({ type: 'info', title: 'Export', message: 'Export feature coming soon!' })}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
