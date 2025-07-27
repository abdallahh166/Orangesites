import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiClient } from "@/lib/api";
import { useNotifications } from "@/components/ui/notifications";
import { 
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent,
  CHART_COLORS
} from "@/components/ui/charts";
import { DataTable, createSortableColumn, createActionColumn } from "@/components/ui/data-table";
import { GlobalSearch } from "@/components/ui/global-search";
import { ErrorDisplay, CommonErrors } from "@/components/ui/error-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  FileText, 
  Download, 
  Upload, 
  Filter, 
  RefreshCw, 
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Eye,
  Share2,
  Printer,
  Mail,
  Settings,
  Plus,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Target,
  Award,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportData {
  id: string;
  name: string;
  type: 'visit' | 'site' | 'user' | 'performance' | 'custom';
  status: 'draft' | 'generated' | 'scheduled' | 'failed';
  createdAt: string;
  updatedAt: string;
  generatedBy: string;
  data: any;
  filters: any;
  exportFormats: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  icon: string;
  defaultFilters: any;
  availableFormats: string[];
}

export default function Reports() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [filters, setFilters] = useState({
    dateRange: { from: null, to: null },
    reportType: 'all',
    status: 'all',
    engineer: 'all',
    site: 'all',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const apiClient = new ApiClient();

  // Report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'visit-summary',
      name: 'Visit Summary Report',
      description: 'Comprehensive overview of all site visits with detailed metrics',
      type: 'visit',
      category: 'Operations',
      icon: 'Activity',
      defaultFilters: { dateRange: '30d', groupBy: 'engineer' },
      availableFormats: ['pdf', 'excel', 'csv', 'json']
    },
    {
      id: 'site-performance',
      name: 'Site Performance Report',
      description: 'Performance metrics and health status for all sites',
      type: 'site',
      category: 'Analytics',
      icon: 'BarChart3',
      defaultFilters: { dateRange: '90d', includeInactive: false },
      availableFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'engineer-productivity',
      name: 'Engineer Productivity Report',
      description: 'Productivity metrics and performance analysis for engineers',
      type: 'user',
      category: 'HR',
      icon: 'Users',
      defaultFilters: { dateRange: '30d', includeMetrics: true },
      availableFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'system-health',
      name: 'System Health Report',
      description: 'System performance, uptime, and technical metrics',
      type: 'performance',
      category: 'IT',
      icon: 'Zap',
      defaultFilters: { dateRange: '7d', includeAlerts: true },
      availableFormats: ['pdf', 'excel', 'json']
    },
    {
      id: 'custom-analytics',
      name: 'Custom Analytics Report',
      description: 'Create custom reports with flexible data selection',
      type: 'custom',
      category: 'Analytics',
      icon: 'PieChart',
      defaultFilters: { dateRange: '30d', customFields: [] },
      availableFormats: ['pdf', 'excel', 'csv', 'json']
    }
  ];

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getReports();
      
      if (response.success) {
        setReports(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch reports');
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Failed to fetch reports');
      // Fallback to mock data
      setReports(getMockReports());
      addNotification({
        type: 'warning',
        title: 'Using Demo Data',
        message: 'Unable to fetch real reports. Showing demo data instead.'
      });
    } finally {
      setLoading(false);
    }
  }, [apiClient, addNotification]);

  const generateReport = useCallback(async (template: ReportTemplate, customFilters?: any) => {
    try {
      setGenerating(true);
      const response = await apiClient.generateReport({
        templateId: template.id,
        filters: { ...template.defaultFilters, ...customFilters },
        format: 'pdf'
      });
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Report Generated',
          message: `Report "${template.name}" has been generated successfully.`
        });
        await fetchReports(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error.message || 'Failed to generate report'
      });
    } finally {
      setGenerating(false);
    }
  }, [apiClient, addNotification, fetchReports]);

  const exportReport = useCallback(async (report: ReportData, format: string) => {
    try {
      const response = await apiClient.exportReport(report.id, format);
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        addNotification({
          type: 'success',
          title: 'Export Successful',
          message: `Report exported as ${format.toUpperCase()} successfully.`
        });
      } else {
        throw new Error(response.message || 'Failed to export report');
      }
    } catch (error: any) {
      console.error('Error exporting report:', error);
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export report'
      });
    }
  }, [apiClient, addNotification]);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      const response = await apiClient.deleteReport(reportId);
      
      if (response.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        addNotification({
          type: 'success',
          title: 'Report Deleted',
          message: 'Report has been deleted successfully.'
        });
      } else {
        throw new Error(response.message || 'Failed to delete report');
      }
    } catch (error: any) {
      console.error('Error deleting report:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete report'
      });
    }
  }, [apiClient, addNotification]);

  useEffect(() => {
    fetchReports();
    setTemplates(reportTemplates);
  }, []);

  const getMockReports = (): ReportData[] => [
    {
      id: '1',
      name: 'Monthly Visit Summary - January 2024',
      type: 'visit',
      status: 'generated',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      generatedBy: 'Ahmed Hassan',
      data: { totalVisits: 156, completedVisits: 142, pendingVisits: 14 },
      filters: { dateRange: '30d', groupBy: 'engineer' },
      exportFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: '2',
      name: 'Site Performance Report - Q4 2023',
      type: 'site',
      status: 'generated',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      generatedBy: 'Sarah Wilson',
      data: { totalSites: 156, activeSites: 142, maintenanceSites: 8 },
      filters: { dateRange: '90d', includeInactive: false },
      exportFormats: ['pdf', 'excel']
    },
    {
      id: '3',
      name: 'Engineer Productivity Analysis',
      type: 'user',
      status: 'draft',
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
      generatedBy: 'Mike Johnson',
      data: { totalEngineers: 25, averageProductivity: 87.5 },
      filters: { dateRange: '30d', includeMetrics: true },
      exportFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: '4',
      name: 'System Health Dashboard',
      type: 'performance',
      status: 'scheduled',
      createdAt: '2024-01-14T16:45:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      generatedBy: 'Admin',
      data: { uptime: 99.8, averageResponseTime: 245 },
      filters: { dateRange: '7d', includeAlerts: true },
      exportFormats: ['pdf', 'json']
    }
  ];

  // Table columns for reports
  const reportColumns = [
    createSortableColumn('name', 'Report Name'),
    createSortableColumn('type', 'Type', (type: string) => (
      <Badge variant="outline" className="text-xs">
        {type.toUpperCase()}
      </Badge>
    )),
    createSortableColumn('status', 'Status', (status: string) => {
      const statusConfig = {
        draft: { variant: 'secondary' as const, icon: Edit },
        generated: { variant: 'default' as const, icon: CheckCircle },
        scheduled: { variant: 'outline' as const, icon: Clock },
        failed: { variant: 'destructive' as const, icon: XCircle }
      };
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
      const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="text-xs flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    }),
    createSortableColumn('createdAt', 'Created', (date: string) => 
      new Date(date).toLocaleDateString()
    ),
    createSortableColumn('generatedBy', 'Generated By'),
    createActionColumn((row) => (
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedReport(row)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => exportReport(row, 'pdf')}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteReport(row.id)}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )),
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.generatedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filters.reportType === 'all' || report.type === filters.reportType;
    const matchesStatus = filters.status === 'all' || report.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading && reports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate and manage system reports</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate and manage system reports</p>
          </div>
        </div>
        <ErrorDisplay 
          error={CommonErrors.server(() => fetchReports())}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate, manage, and export comprehensive system reports
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <GlobalSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search reports..."
            className="w-80"
          />
          <Button
            onClick={() => fetchReports()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setSelectedTemplate(templates[0])} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={filters.reportType} onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="visit">Visit Reports</SelectItem>
                  <SelectItem value="site">Site Reports</SelectItem>
                  <SelectItem value="user">User Reports</SelectItem>
                  <SelectItem value="performance">Performance Reports</SelectItem>
                  <SelectItem value="custom">Custom Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <DatePicker
                value={filters.dateRange.from}
                onChange={(date) => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, from: date } 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <DatePicker
                value={filters.dateRange.to}
                onChange={(date) => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, to: date } 
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const Icon = getIconComponent(template.icon);
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Formats: {template.availableFormats.join(', ').toUpperCase()}
                    </div>
                    <Button
                      onClick={() => generateReport(template)}
                      disabled={generating}
                      size="sm"
                    >
                      {generating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Reports List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Generated Reports</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <DataTable
            columns={reportColumns}
            data={filteredReports}
            loading={loading}
            searchable={false}
            exportable={true}
            onExport={() => addNotification({ type: 'info', title: 'Export', message: 'Export feature coming soon!' })}
            onRefresh={fetchReports}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">{report.name}</CardTitle>
                    <Badge 
                      variant={
                        report.status === 'generated' ? 'default' : 
                        report.status === 'draft' ? 'secondary' : 
                        report.status === 'scheduled' ? 'outline' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generated by {report.generatedBy}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Formats: {report.exportFormats.join(', ').toUpperCase()}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportReport(report, 'pdf')}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReport(report.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{selectedReport.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {selectedReport.type}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedReport.status}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(selectedReport.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Generated By:</span> {selectedReport.generatedBy}
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Report Data</h4>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(selectedReport.data, null, 2)}
                </pre>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => exportReport(selectedReport, 'pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportReport(selectedReport, 'excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Generate New Report</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Report Template</Label>
                <Select value={selectedTemplate.id} onValueChange={(value) => {
                  const template = templates.find(t => t.id === value);
                  if (template) setSelectedTemplate(template);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    generateReport(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  disabled={generating}
                >
                  {generating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get icon component
function getIconComponent(iconName: string) {
  const iconMap: { [key: string]: any } = {
    Activity,
    BarChart3,
    Users,
    Zap,
    PieChart,
    FileText,
    TrendingUp,
    Calendar,
    Target,
    Award
  };
  return iconMap[iconName] || FileText;
}
