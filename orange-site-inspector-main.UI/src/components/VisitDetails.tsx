import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, User, CheckCircle, AlertCircle, Clock, Image, MessageSquare } from "lucide-react";
import { Visit, VisitComponent, VisitStatus, apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface VisitDetailsProps {
  visit: Visit;
  onStatusChange?: (visitId: number, status: VisitStatus, comments?: string) => void;
}

export const VisitDetails = ({ visit, onStatusChange }: VisitDetailsProps) => {
  const [components, setComponents] = useState<VisitComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminComments, setAdminComments] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadComponents();
  }, [visit.id]);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getVisitComponents(visit.id);
      if (response.success) {
        setComponents(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load visit components",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case "rejected":
        return <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case "pending":
        return <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Visit Information */}
      <Card className="card-luxury">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                {getStatusIcon(visit.status)}
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  {visit.siteName}
                </CardTitle>
                <p className="text-orange-600 dark:text-orange-400 font-medium mt-1">
                  {visit.siteCode}
                </p>
              </div>
            </div>
            {getStatusBadge(visit.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <User className="h-4 w-4 mr-2" />
                Engineer
              </div>
              <p className="text-gray-900 dark:text-white">{visit.userName}</p>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Created
              </div>
              <p className="text-gray-900 dark:text-white">
                {new Date(visit.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                Components
              </div>
              <p className="text-gray-900 dark:text-white">{visit.componentCount}</p>
            </div>
          </div>

          {visit.completedAt && (
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </div>
              <p className="text-gray-900 dark:text-white">
                {new Date(visit.completedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          {visit.notes && (
            <div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MessageSquare className="h-4 w-4 mr-2" />
                Notes
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-900 dark:text-white">{visit.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {onStatusChange && visit.status === VisitStatus.Pending && (
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Admin Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminComments" className="text-gray-700 dark:text-gray-300">
                Comments (Optional)
              </Label>
              <Textarea
                id="adminComments"
                placeholder="Add comments about this visit..."
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => onStatusChange(visit.id, VisitStatus.Accepted, adminComments)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Visit
              </Button>
              <Button
                onClick={() => onStatusChange(visit.id, VisitStatus.Rejected, adminComments)}
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Reject Visit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visit Components */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            Visit Components ({components.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse p-4 border border-gray-100 dark:border-gray-800 rounded-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : components.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No components
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This visit doesn't have any components yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {components.map((component, index) => (
                <div key={component.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {component.groupName}
                        {component.itemName && ` - ${component.itemName}`}
                      </h4>
                      <Badge 
                        className={component.isCompleted 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                        }
                      >
                        {component.isCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>

                  {component.comments && (
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Comments
                      </div>
                      <p className="text-gray-900 dark:text-white text-sm">{component.comments}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {component.beforeImageUrl && (
                      <div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Image className="h-4 w-4 mr-1" />
                          Before Image
                        </div>
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={component.beforeImageUrl}
                            alt="Before"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {component.afterImageUrl && (
                      <div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Image className="h-4 w-4 mr-1" />
                          After Image
                        </div>
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={component.afterImageUrl}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {!component.beforeImageUrl && !component.afterImageUrl && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <Image className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No images uploaded</p>
                    </div>
                  )}

                  {index < components.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
