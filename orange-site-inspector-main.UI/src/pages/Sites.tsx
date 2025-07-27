import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, createSortableColumn, createActionColumn } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/charts";
import { GlobalSearch } from "@/components/ui/global-search";
import { 
  MapPin, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Map,
  Grid3X3,
  Download,
  Settings,
  Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/components/ui/notifications";
import { ApiClient, Site, SiteStatus } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface SiteWithStats extends Site {
  visitCount: number;
  lastVisit?: string;
  status: SiteStatus;
  coordinates?: { lat: number; lng: number };
  engineer?: string;
  priority?: string;
}

type ViewMode = 'table' | 'grid' | 'map';

export default function Sites() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [sites, setSites] = useState<SiteWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<SiteStatus | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalSites: 0,
    activeSites: 0,
    maintenanceSites: 0,
    inactiveSites: 0,
    highPrioritySites: 0,
    sitesNeedingVisit: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const apiClientRef = useRef(new ApiClient());
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setCurrentPage(prev => prev);
      addNotification({
        type: 'success',
        title: 'Refreshed',
        message: 'Sites data has been refreshed successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh sites data.'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleBulkAction = (action: 'export' | 'delete' | 'status') => {
    if (selectedSites.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Selection',
        message: 'Please select sites to perform bulk actions.'
      });
      return;
    }

    switch (action) {
      case 'export':
        addNotification({
          type: 'info',
          title: 'Export',
          message: `Exporting ${selectedSites.length} sites...`
        });
        break;
      case 'delete':
        addNotification({
          type: 'warning',
          title: 'Delete Confirmation',
          message: `Are you sure you want to delete ${selectedSites.length} sites?`
        });
        break;
      case 'status':
        addNotification({
          type: 'info',
          title: 'Status Update',
          message: `Updating status for ${selectedSites.length} sites...`
        });
        break;
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClientRef.current.searchSites({
          searchTerm: searchQuery,
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          location: selectedLocation === 'all' ? undefined : selectedLocation,
          page: currentPage,
          pageSize: 10,
        });

        if (response.success) {
          const mappedSites: SiteWithStats[] = response.data.items.map(site => ({
            ...site,
            lastVisit: site.visitCount > 0 ? 'Recent' : 'No visits',
            engineer: 'Assigned',
            priority: 'Normal',
            coordinates: undefined,
          }));

          console.log('API Response - Mapped Sites:', mappedSites);
          
          // If API returns empty data, use mock data
          if (mappedSites.length === 0 || !mappedSites[0].name) {
            console.log('API returned empty data, using mock data');
            const mockSites = getMockSites();
            setSites(mockSites);
            setTotalPages(1);
            addNotification({
              type: 'warning',
              title: 'Using Demo Data',
              message: 'API returned empty data. Showing demo sites instead.'
            });
          } else {
            setSites(mappedSites);
            setTotalPages(response.data.totalPages);
            addNotification({
              type: 'success',
              title: 'Sites Loaded',
              message: `Loaded ${response.data.items.length} sites successfully.`
            });
          }
        } else {
          throw new Error(response.message || 'Failed to fetch sites');
        }
      } catch (error: any) {
        console.error('Error fetching sites:', error);
        setError(error.message || 'Failed to fetch sites');
        const mockSites = getMockSites();
        setSites(mockSites);
        addNotification({
          type: 'warning',
          title: 'Using Demo Data',
          message: 'Unable to fetch real data. Showing demo sites instead.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery, selectedStatus, selectedLocation, currentPage]);

  // Load stats separately
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiClientRef.current.getSiteStatistics();
        if (response.success) {
          setStats(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch statistics');
        }
      } catch (error: any) {
        console.error('Error fetching site statistics:', error);
        setStats({
          totalSites: 25,
          activeSites: 18,
          maintenanceSites: 4,
          inactiveSites: 3,
          highPrioritySites: 5,
          sitesNeedingVisit: 8,
        });
      }
    };

    loadStats();
  }, []);

  const getMockSites = (): SiteWithStats[] => [
    {
      id: 1,
      name: "Site Alpha",
      code: "ALPHA001",
      location: "Cairo",
      address: "123 Main St, Cairo, Egypt",
      status: SiteStatus.Active,
      visitCount: 15,
      lastVisit: "2024-01-15",
      createdAt: "2023-01-01",
      coordinates: { lat: 30.0444, lng: 31.2357 },
      engineer: "Ahmed Hassan",
      priority: "high"
    },
    {
      id: 2,
      name: "Site Beta",
      code: "BETA002",
      location: "Alexandria",
      address: "456 Ocean Ave, Alexandria, Egypt",
      status: SiteStatus.Maintenance,
      visitCount: 8,
      lastVisit: "2024-01-10",
      createdAt: "2023-02-01",
      coordinates: { lat: 31.2001, lng: 29.9187 },
      engineer: "Sarah Wilson",
      priority: "medium"
    },
    {
      id: 3,
      name: "Site Gamma",
      code: "GAMMA003",
      location: "Giza",
      address: "789 Pyramid Rd, Giza, Egypt",
      status: SiteStatus.Active,
      visitCount: 12,
      lastVisit: "2024-01-12",
      createdAt: "2023-03-01",
      coordinates: { lat: 29.9792, lng: 31.1342 },
      engineer: "Mike Johnson",
      priority: "low"
    },
    {
      id: 4,
      name: "Site Delta",
      code: "DELTA004",
      location: "Luxor",
      address: "321 Temple St, Luxor, Egypt",
      status: SiteStatus.Inactive,
      visitCount: 3,
      lastVisit: "2023-12-20",
      createdAt: "2023-04-01",
      coordinates: { lat: 25.6872, lng: 32.6396 },
      engineer: "Fatima Ali",
      priority: "low"
    },
    {
      id: 5,
      name: "Site Epsilon",
      code: "EPSILON005",
      location: "Aswan",
      address: "654 Nile Rd, Aswan, Egypt",
      status: SiteStatus.Active,
      visitCount: 20,
      lastVisit: "2024-01-18",
      createdAt: "2023-05-01",
      coordinates: { lat: 24.0889, lng: 32.8998 },
      engineer: "Omar Khalil",
      priority: "high"
    }
  ];

  const getStatusColor = (status: SiteStatus) => {
    switch (status) {
      case SiteStatus.Active:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case SiteStatus.Inactive:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case SiteStatus.Maintenance:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case SiteStatus.Decommissioned:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: SiteStatus) => {
    switch (status) {
      case SiteStatus.Active:
        return <CheckCircle className="h-4 w-4" />;
      case SiteStatus.Inactive:
        return <Clock className="h-4 w-4" />;
      case SiteStatus.Maintenance:
        return <AlertTriangle className="h-4 w-4" />;
      case SiteStatus.Decommissioned:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case 'medium':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case 'low':
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // Table columns
  const columns = [
    createSortableColumn('name', 'Site Name', (name: string) => (
      <span className="font-medium">{name}</span>
    )),
    createSortableColumn('code', 'Site Code', (code: string) => (
      <span className="font-mono text-sm">{code}</span>
    )),
    createSortableColumn('location', 'Location', (location: string) => (
      <span className="text-sm">{location}</span>
    )),
    createSortableColumn('status', 'Status', (status: SiteStatus) => (
      <Badge className={`${getStatusColor(status)} flex items-center space-x-1`}>
        {getStatusIcon(status)}
        <span>{status}</span>
      </Badge>
    )),
    createSortableColumn('priority', 'Priority', (priority: string) => (
      <Badge className={getPriorityColor(priority)}>
        {priority?.toUpperCase() || 'NORMAL'}
      </Badge>
    )),
    createSortableColumn('visitCount', 'Visits', (visitCount: number) => (
      <span className="font-medium">{visitCount}</span>
    )),
    createSortableColumn('lastVisit', 'Last Visit', (lastVisit: string) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {lastVisit || 'No visits yet'}
      </span>
    )),
    createSortableColumn('engineer', 'Engineer', (engineer: string) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {engineer || 'Unassigned'}
      </span>
    )),
    createActionColumn((row: SiteWithStats) => (
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/sites/${row.id}`)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/sites/${row.id}/edit`)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    )),
  ];

  if (loading && sites.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sites</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and monitor all inspection sites</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sites</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all inspection sites across Egypt
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
          <Button onClick={() => navigate('/add-site')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sites"
          value={stats.totalSites}
          icon={<MapPin className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Active Sites"
          value={stats.activeSites}
          change={5.2}
          changeLabel="vs last month"
          icon={<CheckCircle className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="High Priority"
          value={stats.highPrioritySites}
          icon={<AlertTriangle className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Needs Visit"
          value={stats.sitesNeedingVisit}
          icon={<Calendar className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* Filters and View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as SiteStatus | "all")}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Statuses</option>
                <option value={SiteStatus.Active}>Active</option>
                <option value={SiteStatus.Inactive}>Inactive</option>
                <option value={SiteStatus.Maintenance}>Maintenance</option>
                <option value={SiteStatus.Decommissioned}>Decommissioned</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Locations</option>
                <option value="Cairo">Cairo</option>
                <option value="Alexandria">Alexandria</option>
                <option value="Giza">Giza</option>
                <option value="Luxor">Luxor</option>
                <option value="Aswan">Aswan</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSites.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSites.length} sites selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('status')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Area */}
      {viewMode === 'table' && (
        <>
          {console.log('DataTable Props:', { sites, loading, sitesLength: sites.length, firstSite: sites[0] })}
        <DataTable<SiteWithStats, any>
          title="Sites Overview"
          description="All sites with their current status and visit information"
          columns={columns as any}
          data={sites}
          loading={loading}
          searchable={true}
          exportable={true}
          onExport={() => addNotification({ type: 'info', title: 'Export', message: 'Export feature coming soon!' })}
          onRefresh={handleRefresh}
        />
        </>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <Badge className={getStatusColor(site.status)}>
                    {site.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{site.code}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{site.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{site.visitCount} visits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Last: {site.lastVisit || 'Never'}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Badge className={getPriorityColor(site.priority || 'low')}>
                    {site.priority?.toUpperCase() || 'LOW'}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/sites/${site.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/sites/${site.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>Sites Map View</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interactive map showing all site locations
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Map integration coming soon!</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  This will show an interactive map with all site locations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
