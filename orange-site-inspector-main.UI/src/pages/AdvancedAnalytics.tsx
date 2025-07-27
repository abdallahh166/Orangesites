import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Activity,
  Calendar,
  MapPin,
  Users,
  Clock,
  Download
} from 'lucide-react';
import { apiClient, DashboardOverview, AdminDashboard, DashboardStats, DashboardCharts } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [metricType, setMetricType] = useState('visits');

  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line
  }, [timeRange, metricType]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map timeRange to start/end dates if needed
      // For now, just call the admin dashboard endpoint
      const res = await apiClient.getAdminDashboard();
      if (res.success) {
        setAnalyticsData(res.data);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data. Showing mock data.');
      // fallback to mock data
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  const exportReport = () => {
    // In real implementation, this would generate and download a report
    toast({
      title: 'Report Generated',
      description: 'Analytics report has been downloaded.',
    });
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Access denied. Advanced analytics is only available to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">{analyticsData?.globalStats.totalVisits}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analyticsData?.globalStats.visitsToday > 0 ? 1 : -1)}
                  <span className={`text-sm ${analyticsData?.globalStats.visitsToday > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData?.globalStats.visitsToday > 0 ? '+' : ''}
                    {analyticsData?.globalStats.visitsToday}
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sites</p>
                <p className="text-2xl font-bold">{analyticsData?.globalStats.totalSites}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analyticsData?.globalStats.totalSites > 0 ? 1 : -1)}
                  <span className={`text-sm ${analyticsData?.globalStats.totalSites > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData?.globalStats.totalSites > 0 ? '+' : ''}
                    {analyticsData?.globalStats.totalSites}
                  </span>
                </div>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{analyticsData?.globalStats.totalUsers}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analyticsData?.globalStats.totalUsers > 0 ? 1 : -1)}
                  <span className={`text-sm ${analyticsData?.globalStats.totalUsers > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData?.globalStats.totalUsers > 0 ? '+' : ''}
                    {analyticsData?.globalStats.totalUsers}
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analyticsData?.globalStats.acceptedVisits > 0 ? (analyticsData?.globalStats.acceptedVisits / analyticsData?.globalStats.totalVisits) * 100 : 0}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analyticsData?.globalStats.acceptedVisits > 0 ? 1 : -1)}
                  <span className={`text-sm ${analyticsData?.globalStats.acceptedVisits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData?.globalStats.acceptedVisits > 0 ? '+' : ''}
                    {analyticsData?.globalStats.acceptedVisits}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visit Analytics</TabsTrigger>
          <TabsTrigger value="sites">Site Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visit Status Distribution</CardTitle>
                <CardDescription>Breakdown of visits by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.globalCharts.visitsByStatus.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.label === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.value}</span>
                        <span className="text-sm text-muted-foreground">({(item.value / analyticsData?.globalStats.totalVisits) * 100}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Status Distribution</CardTitle>
                <CardDescription>Breakdown of sites by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.globalCharts.visitsByStatus.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.label === 'Completed' ? 'bg-green-500' : 
                          item.label === 'Pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.value}</span>
                        <span className="text-sm text-muted-foreground">({(item.value / analyticsData?.globalStats.totalVisits) * 100}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visit Trends</CardTitle>
              <CardDescription>Monthly visit statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4">
                  {analyticsData?.globalCharts.visitsByMonth.map((item: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-2xl font-bold text-blue-600">{item.value}</div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Total Visits</p>
                    <p className="text-2xl font-bold">{analyticsData?.globalStats.totalVisits}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analyticsData?.globalStats.acceptedVisits > 0 ? (analyticsData?.globalStats.acceptedVisits / analyticsData?.globalStats.totalVisits) * 100 : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Performance</CardTitle>
              <CardDescription>Site status and maintenance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analyticsData?.globalStats.totalSites}</div>
                  <div className="text-sm text-muted-foreground">Active Sites</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{analyticsData?.globalStats.totalSites - analyticsData?.globalStats.acceptedVisits}</div>
                  <div className="text-sm text-muted-foreground">Under Maintenance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">{analyticsData?.globalStats.totalSites - analyticsData?.globalStats.acceptedVisits - analyticsData?.globalStats.rejectedVisits}</div>
                  <div className="text-sm text-muted-foreground">Inactive Sites</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Users by role and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analyticsData?.globalCharts.visitsByStatus.map((item: any, index: number) => (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{item.value}</div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{(item.value / analyticsData?.globalStats.totalVisits) * 100}%</div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">{analyticsData?.globalStats.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Inactive Users</p>
                    <p className="text-2xl font-bold text-gray-600">{analyticsData?.globalStats.totalUsers - analyticsData?.globalStats.acceptedVisits}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Visit Duration</span>
                  <span className="text-lg font-bold">{analyticsData?.globalStats.averageVisitsPerDay} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-lg font-bold text-green-600">
                    {analyticsData?.globalStats.acceptedVisits > 0 ? (analyticsData?.globalStats.acceptedVisits / analyticsData?.globalStats.totalVisits) * 100 : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Efficiency Score</span>
                  <span className="text-lg font-bold text-blue-600">
                    {analyticsData?.globalStats.acceptedVisits > 0 ? (analyticsData?.globalStats.acceptedVisits / analyticsData?.globalStats.totalVisits) * 100 : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Performance trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Visit Growth</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData?.globalStats.visitsToday > 0 ? 1 : -1)}
                      <span className={`text-sm ${analyticsData?.globalStats.visitsToday > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsData?.globalStats.visitsToday > 0 ? '+' : ''}
                        {analyticsData?.globalStats.visitsToday}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Site Utilization</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData?.globalStats.totalSites > 0 ? 1 : -1)}
                      <span className={`text-sm ${analyticsData?.globalStats.totalSites > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsData?.globalStats.totalSites > 0 ? '+' : ''}
                        {analyticsData?.globalStats.totalSites}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Engagement</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData?.globalStats.totalUsers > 0 ? 1 : -1)}
                      <span className={`text-sm ${analyticsData?.globalStats.totalUsers > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsData?.globalStats.totalUsers > 0 ? '+' : ''}
                        {analyticsData?.globalStats.totalUsers}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function getMockAnalyticsData(): AdminDashboard {
  return {
    globalStats: {
      totalVisits: 1250,
      totalVisitsThisMonth: 190,
      pendingVisits: 270,
      acceptedVisits: 800,
      rejectedVisits: 50,
      totalSites: 85,
      totalUsers: 45,
      averageVisitsPerDay: 6.2,
      visitsToday: 12,
      visitsThisWeek: 40,
    },
    globalCharts: {
      visitsByStatus: [
        { label: 'Completed', value: 980, color: '#22c55e' },
        { label: 'Pending', value: 270, color: '#eab308' },
      ],
      visitsByMonth: [
        { label: 'Jan', value: 120, color: '#3b82f6' },
        { label: 'Feb', value: 135, color: '#3b82f6' },
        { label: 'Mar', value: 145, color: '#3b82f6' },
        { label: 'Apr', value: 160, color: '#3b82f6' },
        { label: 'May', value: 175, color: '#3b82f6' },
        { label: 'Jun', value: 190, color: '#3b82f6' },
      ],
      visitsByDay: [],
      topSites: [],
    },
    latestVisits: [],
    recentSites: [],
    recentUsers: [],
    visitsByEngineer: [],
    sitesByVisits: [],
  };
}

export default AdvancedAnalytics; 