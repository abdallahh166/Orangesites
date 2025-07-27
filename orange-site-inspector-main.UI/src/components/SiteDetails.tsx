
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Site, Visit, apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface SiteDetailsProps {
  site: Site;
}

export const SiteDetails = ({ site }: SiteDetailsProps) => {
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRecentVisits();
  }, [site.id]);

  const loadRecentVisits = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getVisits(1, 5);
      if (response.success) {
        // Filter visits for this site
        const siteVisits = response.data.items.filter(visit => visit.siteId === site.id);
        setRecentVisits(siteVisits);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recent visits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Inactive</Badge>;
      case "maintenance":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVisitStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Site Information */}
      <Card className="card-luxury">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {site.name}
              </CardTitle>
              <p className="text-orange-600 dark:text-orange-400 font-medium mt-1">
                {site.code}
              </p>
            </div>
            {getStatusBadge(site.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </div>
              <p className="text-gray-900 dark:text-white">{site.location}</p>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Users className="h-4 w-4 mr-2" />
                Total Visits
              </div>
              <p className="text-gray-900 dark:text-white">{site.totalVisits}</p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Address
            </div>
            <p className="text-gray-900 dark:text-white">{site.address}</p>
          </div>

          {site.lastVisitDate && (
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Last Visit
              </div>
              <p className="text-gray-900 dark:text-white">
                {new Date(site.lastVisitDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Visits */}
      <Card className="card-luxury">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Recent Visits
            </CardTitle>
            <Link to="/visits">
              <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : recentVisits.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No visits yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This site hasn't been visited yet
              </p>
              <Link to="/add-visit">
                <Button className="btn-orange">
                  Schedule Visit
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      {visit.status === 'accepted' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : visit.status === 'rejected' ? (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Visit by {visit.engineerName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(visit.createdAt).toLocaleDateString()} • {visit.componentsCount} components
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getVisitStatusBadge(visit.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
