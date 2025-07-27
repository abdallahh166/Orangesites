import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  UserX,
  Calendar,
  BarChart3,
  Eye
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const UserActivity = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activityFilter, setActivityFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, activityRes] = await Promise.all([
        apiClient.getUserStatistics(),
        apiClient.getUserActivity(page, pageSize)
      ]);

      if (statsRes.success) {
        setUserStats(statsRes.data);
      }

      if (activityRes.success) {
        setUserActivity(activityRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'login':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'visit_created':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'visit_completed':
        return <Activity className="h-4 w-4 text-green-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (activityType: string) => {
    const colors = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-red-100 text-red-800',
      visit_created: 'bg-blue-100 text-blue-800',
      visit_completed: 'bg-green-100 text-green-800',
      site_updated: 'bg-purple-100 text-purple-800',
      default: 'bg-gray-100 text-gray-800',
    };

    const color = colors[activityType.toLowerCase()] || colors.default;
    return <Badge className={color}>{activityType.replace('_', ' ')}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredActivity = userActivity.filter(activity => {
    if (activityFilter === 'all') return true;
    return activity.type.toLowerCase().includes(activityFilter.toLowerCase());
  });

  if (!user || user.role !== 'Admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Access denied. User activity monitoring is only available to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading user activity...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Activity Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor user activity and system usage statistics
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{userStats.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.activeUsers || 0}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Logins</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.todayLogins || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-orange-600">{userStats.weeklyLogins || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="login">Logins</SelectItem>
                  <SelectItem value="logout">Logouts</SelectItem>
                  <SelectItem value="visit">Visit Activities</SelectItem>
                  <SelectItem value="site">Site Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <Button onClick={fetchData} className="w-full">
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="logins">Login Activity</TabsTrigger>
          <TabsTrigger value="visits">Visit Activity</TabsTrigger>
          <TabsTrigger value="sites">Site Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <ActivityList activities={filteredActivity} />
        </TabsContent>

        <TabsContent value="logins" className="space-y-4">
          <ActivityList activities={filteredActivity.filter(a => a.type.toLowerCase().includes('login'))} />
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <ActivityList activities={filteredActivity.filter(a => a.type.toLowerCase().includes('visit'))} />
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <ActivityList activities={filteredActivity.filter(a => a.type.toLowerCase().includes('site'))} />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredActivity.length)} of {filteredActivity.length} activities
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={filteredActivity.length < pageSize}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

// Activity List Component
const ActivityList = ({ activities }: { activities: any[] }) => {
  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'login':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'visit_created':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'visit_completed':
        return <Activity className="h-4 w-4 text-green-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (activityType: string) => {
    const colors = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-red-100 text-red-800',
      visit_created: 'bg-blue-100 text-blue-800',
      visit_completed: 'bg-green-100 text-green-800',
      site_updated: 'bg-purple-100 text-purple-800',
      default: 'bg-gray-100 text-gray-800',
    };

    const color = colors[activityType.toLowerCase()] || colors.default;
    return <Badge className={color}>{activityType.replace('_', ' ')}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No activities found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="font-medium">{activity.userName || activity.userId}</p>
                  <p className="text-sm text-muted-foreground">{activity.description || activity.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getActivityBadge(activity.type)}
                <div className="text-right">
                  <p className="text-sm font-medium">{formatTimestamp(activity.timestamp)}</p>
                  {activity.ipAddress && (
                    <p className="text-xs text-muted-foreground">IP: {activity.ipAddress}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserActivity; 