import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CheckCircle, 
  Download, 
  Share2, 
  ArrowRight, 
  Home,
  FileText,
  Camera,
  Clock,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CompletionData {
  visitId: string;
  siteName: string;
  inspectorName: string;
  completionDate: string;
  duration: number;
  photosCount: number;
  findingsCount: number;
}

const VisitCompletion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract completion data from navigation state or URL params
    const data = location.state?.completionData;
    if (data) {
      setCompletionData(data);
    } else {
      // Fallback: try to get from URL params
      const params = new URLSearchParams(location.search);
      const visitId = params.get('visitId');
      if (visitId) {
        setCompletionData({
          visitId,
          siteName: params.get('siteName') || 'Unknown Site',
          inspectorName: params.get('inspectorName') || 'Unknown Inspector',
          completionDate: params.get('completionDate') || new Date().toLocaleDateString(),
          duration: parseInt(params.get('duration') || '0'),
          photosCount: parseInt(params.get('photosCount') || '0'),
          findingsCount: parseInt(params.get('findingsCount') || '0')
        });
      }
    }
    setLoading(false);
  }, [location]);

  const handleDownloadReport = () => {
    // TODO: Implement report download functionality
    console.log('Downloading report for visit:', completionData?.visitId);
  };

  const handleShareReport = () => {
    // TODO: Implement share functionality
    console.log('Sharing report for visit:', completionData?.visitId);
  };

  const handleViewVisit = () => {
    if (completionData?.visitId) {
      navigate(`/visits/${completionData.visitId}`);
    }
  };

  const handleNewVisit = () => {
    navigate('/add-visit');
  };

  const handleGoHome = () => {
    navigate('/sites');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!completionData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Completion Data Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Unable to load visit completion information.
            </p>
            <Button onClick={handleGoHome}>
              <Home className="w-4 h-4 mr-2" />
              Go to Sites
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Inspection Completed Successfully!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your site inspection has been completed and saved.
        </p>
      </div>

      {/* Completion Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Inspection Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Site:</span>
                <span className="font-medium">{completionData.siteName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inspector:</span>
                <span className="font-medium">{completionData.inspectorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Visit ID:</span>
                <Badge variant="outline">{completionData.visitId}</Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Date:</span>
                <span className="font-medium">{completionData.completionDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{completionData.duration} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-green-600">Completed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {completionData.photosCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Photos Captured</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {completionData.findingsCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Findings Documented</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {completionData.duration}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minutes Duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button
          onClick={handleDownloadReport}
          variant="outline"
          size="lg"
          className="h-16"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Report
        </Button>
        
        <Button
          onClick={handleShareReport}
          variant="outline"
          size="lg"
          className="h-16"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Report
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Next Steps */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          What's Next?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleViewVisit}
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="font-medium">View Visit Details</span>
            <span className="text-sm text-gray-500">Review the complete inspection report</span>
          </Button>

          <Button
            onClick={handleNewVisit}
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <ArrowRight className="w-8 h-8 text-green-600" />
            <span className="font-medium">Start New Visit</span>
            <span className="text-sm text-gray-500">Begin another site inspection</span>
          </Button>

          <Button
            onClick={handleGoHome}
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <Home className="w-8 h-8 text-orange-600" />
            <span className="font-medium">Back to Sites</span>
            <span className="text-sm text-gray-500">Return to sites dashboard</span>
          </Button>
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
            💡 Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <li>• Download your report for offline access</li>
            <li>• Share the report with stakeholders if needed</li>
            <li>• Review the findings and recommendations</li>
            <li>• Schedule follow-up visits if required</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitCompletion; 