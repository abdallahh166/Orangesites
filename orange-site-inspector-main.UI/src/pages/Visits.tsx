import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, Plus, Calendar, User, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Visit, PaginatedResponse, VisitStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { VisitDetails } from "@/components/VisitDetails";

const Visits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "all">("all");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    loadVisits();
    // eslint-disable-next-line
  }, [currentPage, statusFilter]);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (isAdmin) {
        response = await apiClient.getVisits(currentPage, pageSize);
      } else {
        response = await apiClient.getMyVisits();
        // Convert to paginated format for consistency
        response = {
          success: response.success,
          data: {
            items: response.data || [],
            totalCount: response.data?.length || 0,
            page: 1,
            pageSize: response.data?.length || 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          },
          message: response.message
        };
      }
      if (response.success) {
        let filteredVisits = response.data.items;
        // Apply status filter
        if (statusFilter !== "all") {
          filteredVisits = filteredVisits.filter(visit => visit.status === statusFilter);
        }
        setVisits(filteredVisits);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load visits");
      toast({
        title: "Error",
        description: err?.response?.data?.message || err.message || "Failed to load visits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (visitId: number, status: VisitStatus, comments?: string) => {
    try {
      await apiClient.updateVisitStatus(visitId, status, comments);
      toast({
        title: "Success",
        description: `Visit ${status} successfully`,
      });
      loadVisits();
      setShowDetailsDialog(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || err.message || `Failed to ${status} visit`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case VisitStatus.Accepted:
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Accepted</Badge>;
      case VisitStatus.Rejected:
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Rejected</Badge>;
      case VisitStatus.Pending:
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Pending</Badge>;
      case VisitStatus.Completed:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Completed</Badge>;
      case VisitStatus.InProgress:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: VisitStatus) => {
    switch (status) {
      case VisitStatus.Accepted:
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case VisitStatus.Rejected:
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case VisitStatus.Pending:
        return <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case VisitStatus.Completed:
        return <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case VisitStatus.InProgress:
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredVisits = visits.filter(visit =>
    (visit.siteName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (visit.siteCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (visit.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin ? `${totalCount} total visits` : `${totalCount} your visits`}
          </p>
        </div>
        <Link to="/add-visit">
          <Button className="btn-orange">
            <Plus className="h-5 w-5 mr-2" />
            New Visit
          </Button>
        </Link>
      </div>
      {/* Filters */}
      <Card className="card-luxury">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search visits by site name, code, or engineer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search visits"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VisitStatus | "all")}> 
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={VisitStatus.Pending}>Pending</SelectItem>
                <SelectItem value={VisitStatus.Accepted}>Accepted</SelectItem>
                <SelectItem value={VisitStatus.Rejected}>Rejected</SelectItem>
                <SelectItem value={VisitStatus.Completed}>Completed</SelectItem>
                <SelectItem value={VisitStatus.InProgress}>In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Visits List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="card-luxury animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : filteredVisits.length === 0 ? (
        <Card className="card-luxury">
          <CardContent className="p-6 text-center text-gray-600 dark:text-gray-400">
            No visits found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredVisits.map((visit) => (
            <Card key={visit.id} className="card-luxury hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(visit.status)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {visit.siteName}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{visit.siteCode}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <User className="h-4 w-4 mr-1" />
                    {visit.userName || 'Unknown User'}
                    <Calendar className="h-4 w-4 ml-4 mr-1" />
                    {new Date(visit.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusBadge(visit.status)}
                  </div>
                </div>
                <Button size="icon" variant="ghost" aria-label="View details" onClick={() => { setSelectedVisit(visit); setShowDetailsDialog(true); }}>
                  <Eye className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page">Previous</Button>
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
            <Button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next page">Next</Button>
          </div>
        </div>
      )}
      {/* Visit Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          {selectedVisit && <VisitDetails visit={selectedVisit} onStatusChange={handleStatusChange} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Visits;
