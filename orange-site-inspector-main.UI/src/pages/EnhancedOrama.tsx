import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  BarChart3, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Wrench,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Star,
  StarOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/components/ui/notifications";
import { ApiClient, OramaGroup, OramaItem } from "@/lib/api";
import { 
  LineChartComponent, 
  BarChartComponent, 
  PieChartComponent, 
  MetricCard 
} from "@/components/ui/charts";

interface OramaStats {
  totalGroups: number;
  activeGroups: number;
  totalItems: number;
  activeItems: number;
  criticalItems: number;
  requiredItems: number;
  itemsByCategory: { label: string; value: number; color?: string }[];
  itemsByStatus: { label: string; value: number; color?: string }[];
  itemsByPriority: { label: string; value: number; color?: string }[];
  maintenanceOverdue: number;
  newItemsThisMonth: number;
}

export default function EnhancedOrama() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [groups, setGroups] = useState<OramaGroup[]>([]);
  const [items, setItems] = useState<OramaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OramaStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const apiClient = new ApiClient();

  useEffect(() => {
    fetchOramaData();
  }, []);

  const fetchOramaData = async () => {
    try {
      setLoading(true);
      const [groupsRes, itemsRes] = await Promise.all([
        apiClient.getOramaGroups(),
        apiClient.getOramaItems(),
      ]);

      if (groupsRes.success) setGroups(groupsRes.data);
      if (itemsRes.success) setItems(itemsRes.data);

      // Calculate statistics
      calculateStats(groupsRes.data, itemsRes.data);
      
      addNotification({
        type: 'success',
        title: 'Orama Data Loaded',
        message: `Loaded ${groupsRes.data?.length || 0} groups and ${itemsRes.data?.length || 0} items successfully.`
      });
    } catch (error) {
      console.error('Error fetching Orama data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load Orama data'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (groupsData: OramaGroup[], itemsData: OramaItem[]) => {
    const stats: OramaStats = {
      totalGroups: groupsData.length,
      activeGroups: groupsData.filter(g => g.isActive).length,
      totalItems: itemsData.length,
      activeItems: itemsData.filter(i => i.isActive).length,
      criticalItems: itemsData.filter(i => i.isCritical).length,
      requiredItems: itemsData.filter(i => i.isRequired).length,
      itemsByCategory: [],
      itemsByStatus: [],
      itemsByPriority: [],
      maintenanceOverdue: 0,
      newItemsThisMonth: 0
    };

    // Calculate category distribution
    const categoryCount: Record<string, number> = {};
    itemsData.forEach(item => {
      const category = item.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    stats.itemsByCategory = Object.entries(categoryCount).map(([label, value]) => ({
      label,
      value,
      color: getCategoryColor(label)
    }));

    // Calculate status distribution
    const statusCount: Record<string, number> = {};
    itemsData.forEach(item => {
      const status = item.isActive ? 'Active' : 'Inactive';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    stats.itemsByStatus = Object.entries(statusCount).map(([label, value]) => ({
      label,
      value,
      color: getStatusColor(label)
    }));

    // Calculate priority distribution
    const priorityCount: Record<string, number> = {};
    itemsData.forEach(item => {
      const priority = getPriorityLabel(item.priority);
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
    });
    stats.itemsByPriority = Object.entries(priorityCount).map(([label, value]) => ({
      label,
      value,
      color: getPriorityColor(label)
    }));

    setStats(stats);
  };

  const getCategoryColor = (category: string) => {
    const colors = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const index = category.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Inactive': return '#6b7280';
      default: return '#f59e0b';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Normal': return '#3b82f6';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 0: return 'Critical';
      case 1: return 'High';
      case 2: return 'Normal';
      case 3: return 'Low';
      default: return 'Normal';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && item.isActive) ||
                         (selectedStatus === 'inactive' && !item.isActive);
    const matchesPriority = selectedPriority === 'all' || 
                           getPriorityLabel(item.priority).toLowerCase() === selectedPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="space-y-6 max-w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-500 dark:text-gray-400">Loading Orama data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orama Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage inspection components and equipment
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button variant="outline" onClick={fetchOramaData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="btn-orange">
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Total Groups"
            value={stats.totalGroups}
            icon={<Database className="h-6 w-6 text-blue-600" />}
          />
          <MetricCard
            title="Total Items"
            value={stats.totalItems}
            icon={<Wrench className="h-6 w-6 text-green-600" />}
          />
          <MetricCard
            title="Critical Items"
            value={stats.criticalItems}
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          />
          <MetricCard
            title="Active Items"
            value={stats.activeItems}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Items by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.itemsByCategory && (
                  <PieChartComponent
                    data={stats.itemsByCategory}
                    nameKey="label"
                    valueKey="value"
                    title=""
                    className="h-64"
                  />
                )}
              </CardContent>
            </Card>

            {/* Items by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Items by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.itemsByStatus && (
                  <BarChartComponent
                    data={stats.itemsByStatus}
                    xKey="label"
                    yKey="value"
                    title=""
                    className="h-64"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.oramaGroupName} • {item.manufacturer || 'No manufacturer'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={item.isCritical ? "destructive" : "outline"}>
                        {item.isCritical ? 'Critical' : 'Normal'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orama Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {group.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span>Items: {group.itemCount}</span>
                        <span>Priority: {group.priority}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input 
                  placeholder="Search items by name, description, or manufacturer..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <select 
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-800" 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select 
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-800" 
                  value={selectedStatus} 
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select 
                  className="border rounded px-3 py-2 bg-white dark:bg-gray-800" 
                  value={selectedPriority} 
                  onChange={e => setSelectedPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Components ({filteredItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Component
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Group
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Manufacturer
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="p-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.description || 'No description'}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {item.oramaGroupName}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.manufacturer || '-'}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={item.isCritical ? "destructive" : "outline"}
                            className={item.isCritical ? "" : "text-gray-600"}
                          >
                            {item.isCritical ? 'Critical' : getPriorityLabel(item.priority)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items by Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Items by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.itemsByPriority && (
                  <PieChartComponent
                    data={stats.itemsByPriority}
                    nameKey="label"
                    valueKey="value"
                    title=""
                    className="h-64"
                  />
                )}
              </CardContent>
            </Card>

            {/* Maintenance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        Overdue Maintenance
                      </span>
                    </div>
                    <Badge variant="destructive">{stats?.maintenanceOverdue || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Up to Date
                      </span>
                    </div>
                    <Badge variant="default">{stats?.activeItems || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        New This Month
                      </span>
                    </div>
                    <Badge variant="outline">{stats?.newItemsThisMonth || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 