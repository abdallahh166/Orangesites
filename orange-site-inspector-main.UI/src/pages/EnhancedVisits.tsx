import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search, 
  Calendar,
  MapPin,
  User,
  FileText
} from 'lucide-react';
import { apiClient, Visit, VisitStatus, VisitPriority, VisitType, Site } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const EnhancedVisits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<VisitStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<VisitPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VisitType | 'all'>('all');
  const [siteFilter, setSiteFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected visit for actions
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [visitsRes, sitesRes] = await Promise.all([
        apiClient.getMyVisits(),
        apiClient.getSites()
      ]);

      if (visitsRes.success) {
        setVisits(visitsRes.data);
      }

      if (sitesRes.success) {
        setSites(sitesRes.data.items || sitesRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVisit = async (visitId: number) => {
    setActionLoading(true);
    try {
      const response = await apiClient.startVisit(visitId);
      if (response.success) {
        toast({
          title: 'Visit Started',
          description: 'Visit has been started successfully.',
        });
        fetchData(); // Refresh data
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to start visit',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteVisit = async (visitId: number) => {
    setActionLoading(true);
    try {
      const response = await apiClient.completeVisit(visitId);
      if (response.success) {
        toast({
          title: 'Visit Completed',
          description: 'Visit has been completed successfully.',
        });
        fetchData(); // Refresh data
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to complete visit',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: VisitStatus) => {
    const variants = {
      [VisitStatus.Pending]: 'secondary',
      [VisitStatus.Accepted]: 'default',
      [VisitStatus.Rejected]: 'destructive',
      [VisitStatus.Completed]: 'default',
      [VisitStatus.InProgress]: 'default',
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: VisitPriority) => {
    const colors = {
      [VisitPriority.Low]: 'bg-blue-100 text-blue-800',
      [VisitPriority.Normal]: 'bg-green-100 text-green-800',
      [VisitPriority.High]: 'bg-yellow-100 text-yellow-800',
      [VisitPriority.Critical]: 'bg-red-100 text-red-800',
    };

    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const getTypeBadge = (type: VisitType) => {
    const colors = {
      [VisitType.Routine]: 'bg-gray-100 text-gray-800',
      [VisitType.Emergency]: 'bg-red-100 text-red-800',
      [VisitType.FollowUp]: 'bg-purple-100 text-purple-800',
    };

    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const filteredVisits = visits.filter(visit => {
    if (statusFilter !== 'all' && visit.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && visit.priority !== priorityFilter) return false;
    if (typeFilter !== 'all' && visit.type !== typeFilter) return false;
    if (siteFilter !== 'all' && visit.siteId !== siteFilter) return false;
    if (searchTerm && !visit.siteName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const groupedVisits = {
    pending: filteredVisits.filter(v => v.status === VisitStatus.Pending),
    inProgress: filteredVisits.filter(v => v.status === VisitStatus.InProgress),
    completed: filteredVisits.filter(v => v.status === VisitStatus.Completed),
    rejected: filteredVisits.filter(v => v.status === VisitStatus.Rejected),
  };

  const canStartVisit = (visit: Visit) => {
    return visit.status === VisitStatus.Accepted && user?.role === 'Engineer';
  };

  const canCompleteVisit = (visit: Visit) => {
    return visit.status === VisitStatus.InProgress && user?.role === 'Engineer';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading visits...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enhanced Visit Management</h1>
        <p className="text-muted-foreground">
          Manage visits with advanced workflow features
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VisitStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(VisitStatus).map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as VisitPriority | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {Object.values(VisitPriority).map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as VisitType | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(VisitType).map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Site</Label>
              <Select value={siteFilter.toString()} onValueChange={(value) => setSiteFilter(value === 'all' ? 'all' : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredVisits.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({groupedVisits.pending.length})</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress ({groupedVisits.inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({groupedVisits.completed.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({groupedVisits.rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <VisitGrid visits={filteredVisits} onStartVisit={handleStartVisit} onCompleteVisit={handleCompleteVisit} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <VisitGrid visits={groupedVisits.pending} onStartVisit={handleStartVisit} onCompleteVisit={handleCompleteVisit} />
        </TabsContent>

        <TabsContent value="inProgress" className="space-y-4">
          <VisitGrid visits={groupedVisits.inProgress} onStartVisit={handleStartVisit} onCompleteVisit={handleCompleteVisit} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <VisitGrid visits={groupedVisits.completed} onStartVisit={handleStartVisit} onCompleteVisit={handleCompleteVisit} />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <VisitGrid visits={groupedVisits.rejected} onStartVisit={handleStartVisit} onCompleteVisit={handleCompleteVisit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Visit Grid Component
const VisitGrid = ({ 
  visits, 
  onStartVisit, 
  onCompleteVisit 
}: { 
  visits: Visit[]; 
  onStartVisit: (id: number) => void; 
  onCompleteVisit: (id: number) => void; 
}) => {
  const { user } = useAuth();

  const getStatusBadge = (status: VisitStatus) => {
    const variants = {
      [VisitStatus.Pending]: 'secondary',
      [VisitStatus.Accepted]: 'default',
      [VisitStatus.Rejected]: 'destructive',
      [VisitStatus.Completed]: 'default',
      [VisitStatus.InProgress]: 'default',
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: VisitPriority) => {
    const colors = {
      [VisitPriority.Low]: 'bg-blue-100 text-blue-800',
      [VisitPriority.Normal]: 'bg-green-100 text-green-800',
      [VisitPriority.High]: 'bg-yellow-100 text-yellow-800',
      [VisitPriority.Critical]: 'bg-red-100 text-red-800',
    };

    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const getTypeBadge = (type: VisitType) => {
    const colors = {
      [VisitType.Routine]: 'bg-gray-100 text-gray-800',
      [VisitType.Emergency]: 'bg-red-100 text-red-800',
      [VisitType.FollowUp]: 'bg-purple-100 text-purple-800',
    };

    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const canStartVisit = (visit: Visit) => {
    return visit.status === VisitStatus.Accepted && user?.role === 'Engineer';
  };

  const canCompleteVisit = (visit: Visit) => {
    return visit.status === VisitStatus.InProgress && user?.role === 'Engineer';
  };

  if (visits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No visits found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {visits.map((visit) => (
        <Card key={visit.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{visit.siteName}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {visit.siteCode}
                </CardDescription>
              </div>
              {getStatusBadge(visit.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Priority:</span>
              {getPriorityBadge(visit.priority)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Type:</span>
              {getTypeBadge(visit.type)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Engineer:</span>
              <span className="text-sm">{visit.userName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm">{new Date(visit.createdAt).toLocaleDateString()}</span>
            </div>
            
            {visit.scheduledDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Scheduled:</span>
                <span className="text-sm">{new Date(visit.scheduledDate).toLocaleDateString()}</span>
              </div>
            )}

            <Separator />

            <div className="flex gap-2">
              {canStartVisit(visit) && (
                <Button 
                  size="sm" 
                  onClick={() => onStartVisit(visit.id)}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              
              {canCompleteVisit(visit) && (
                <Button 
                  size="sm" 
                  onClick={() => onCompleteVisit(visit.id)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnhancedVisits; 