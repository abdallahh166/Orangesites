import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  CheckCircle, 
  Camera, 
  FileText, 
  Send, 
  ArrowLeft,
  AlertCircle,
  Clock,
  Building2,
  User,
  Calendar,
  Star,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StepWizard, StepContent, StepActions } from "@/components/ui/step-wizard";
import { SmartForm } from "@/components/ui/smart-form";
import { ImageUpload } from "@/components/ui/image-upload";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useVisit } from "@/contexts/VisitContext";
import { VisitService } from "@/services/visitService";
import { apiClient } from "@/lib/api";

interface Visit {
  id: number;
  siteName: string;
  siteAddress: string;
  inspectorName: string;
  visitDate: string;
  visitTime: string;
  weatherConditions: string;
  temperature?: number;
  notes?: string;
  beforePhoto?: string;
  status: string;
}

const AfterInspection: React.FC = () => {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { state: visitData, dispatch } = useVisit();
  const [currentStep, setCurrentStep] = useState(0);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [afterInspectionData, setAfterInspectionData] = useState<any>({});

  // Step configuration
  const steps = [
    {
      id: 'inspection-overview',
      title: 'Inspection Overview',
      description: 'Review visit details',
      status: (currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending') as 'current' | 'completed' | 'pending'
    },
    {
      id: 'after-photos',
      title: 'After Photos',
      description: 'Capture final state',
      status: (currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending') as 'current' | 'completed' | 'pending'
    },
    {
      id: 'findings',
      title: 'Findings & Notes',
      description: 'Document observations',
      status: (currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending') as 'current' | 'completed' | 'pending'
    },
    {
      id: 'completion',
      title: 'Complete Visit',
      description: 'Finalize inspection',
      status: (currentStep === 3 ? 'current' : 'pending') as 'current' | 'completed' | 'pending'
    }
  ];

  // Load visit data on component mount
  useEffect(() => {
    if (visitId && !isNaN(parseInt(visitId))) {
      loadVisit();
      
      // Load existing after inspection data from localStorage
      try {
        const savedData = localStorage.getItem(`afterInspection_${visitId}`);
        if (savedData) {
          setAfterInspectionData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Failed to load after inspection data:', error);
      }
    } else {
      setError('Invalid visit ID');
    }
  }, [visitId]);

  // Auto-save functionality
  useEffect(() => {
    if (afterInspectionData && Object.keys(afterInspectionData).length > 0 && visitId) {
      const timeoutId = setTimeout(() => {
        autoSave();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [afterInspectionData, visitId]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading visit with ID:', visitId);
      const response = await VisitService.getVisitDetails(parseInt(visitId!));
      console.log('Visit details response:', response);
      
      if (response.success && response.visit) {
        setVisit(response.visit as any);
      } else {
        const errorMessage = response.error || 'Failed to load visit data';
        setError(errorMessage);
        console.error('Visit loading failed:', errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load visit data';
      setError(errorMessage);
      console.error('Error loading visit:', err);
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!afterInspectionData || Object.keys(afterInspectionData).length === 0 || !visitId) return;

    try {
      setAutoSaveStatus('saving');
      // Save to localStorage for now
      localStorage.setItem(`afterInspection_${visitId}`, JSON.stringify(afterInspectionData));
      setAutoSaveStatus('saved');
    } catch (err) {
      setAutoSaveStatus('error');
      console.error('Auto-save failed:', err);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAfterPhotoUpload = (file: File) => {
    setAfterInspectionData(prev => ({ ...prev, afterPhoto: file }));
  };

  const handleAfterPhotoRemove = () => {
    setAfterInspectionData(prev => ({ ...prev, afterPhoto: null }));
  };

  const handleFindingsSubmit = (data: Record<string, any>) => {
    setAfterInspectionData(prev => ({ ...prev, ...data }));
    handleNext();
  };

  const handleCompleteInspection = async () => {
    try {
      setLoading(true);
      setError(null);

      await VisitService.completeVisit(parseInt(visitId!), afterInspectionData);
      
      // Clear the after inspection data
      setAfterInspectionData({});
      localStorage.removeItem(`afterInspection_${visitId}`);
      
      // Navigate to success page or dashboard
      navigate('/sites', { 
        state: { 
          message: 'Inspection completed successfully!',
          visitId: visitId 
        }
      });
    } catch (err) {
      setError('Failed to complete inspection. Please try again.');
      console.error('Error completing inspection:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderInspectionOverview = () => (
    <StepContent>
    <div className="space-y-6">
        <div className="text-center space-y-2">
          <Building2 className="w-12 h-12 mx-auto text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inspection Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review the visit details before proceeding with the inspection
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Card>
              <CardHeader>
                <CardTitle>Continue with After Inspection</CardTitle>
                <CardDescription>
                  You can still proceed with the after-inspection process even if visit details couldn't be loaded.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Visit ID:</span>
                      <Badge variant="outline">{visitId}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="secondary">Unknown</Badge>
        </div>
      </div>
                  <Button 
                    onClick={loadVisit} 
                    variant="outline" 
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? 'Retrying...' : 'Retry Loading Visit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
      </div>
        ) : visit ? (
      <div className="grid gap-6">
            {/* Site Information */}
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Site Information</span>
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Site Name:</span>
                  <span className="font-medium">{visit.siteName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-right max-w-xs">{visit.siteAddress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={visit.status === 'completed' ? 'default' : 'secondary'}>
                    {visit.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Visit Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Visit Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Inspector:</span>
                  <span className="font-medium">{visit.inspectorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{visit.visitDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{visit.visitTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Weather:</span>
                  <span className="font-medium capitalize">{visit.weatherConditions}</span>
                </div>
                {visit.temperature && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-medium">{visit.temperature}°C</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Before Photo */}
            {visit.beforePhoto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5" />
                    <span>Before Photo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={visit.beforePhoto}
                    alt="Before inspection"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Initial Notes */}
            {visit.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Initial Notes</span>
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{visit.notes}</p>
                </CardContent>
              </Card>
            )}
                        </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No visit data found</AlertDescription>
          </Alert>
        )}
                      </div>
    </StepContent>
  );

  const renderAfterPhotos = () => (
    <StepContent>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Camera className="w-12 h-12 mx-auto text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            After Photos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Capture the final state of the site after inspection
          </p>
                    </div>

        <div className="grid gap-6">
          <ImageUpload
            onImageSelect={handleAfterPhotoUpload}
            onImageRemove={handleAfterPhotoRemove}
            selectedImage={afterInspectionData?.afterPhoto}
            label="Final Site Photo"
            description="Take a photo showing the final site condition"
            imageType="after"
            required
          />

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-medium mb-1">Photo Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Capture the same areas as the before photo for comparison</li>
                  <li>• Show any changes or improvements made</li>
                  <li>• Ensure good lighting and clear visibility</li>
                  <li>• Photos should be high quality (max 10MB)</li>
                </ul>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
    </StepContent>
  );

  const renderFindings = () => {
    const formFields = [
      {
        name: 'overallCondition',
        label: 'Overall Site Condition',
        type: 'select' as const,
        options: [
          { value: 'excellent', label: 'Excellent' },
          { value: 'good', label: 'Good' },
          { value: 'fair', label: 'Fair' },
          { value: 'poor', label: 'Poor' },
          { value: 'critical', label: 'Critical' }
        ],
        validation: { required: true },
        required: true,
        group: 'Assessment'
      },
      {
        name: 'issuesFound',
        label: 'Issues Found',
        type: 'textarea' as const,
        placeholder: 'Describe any issues or problems discovered during inspection...',
        helpText: 'Be specific about location and severity of issues',
        group: 'Findings'
      },
      {
        name: 'actionsTaken',
        label: 'Actions Taken',
        type: 'textarea' as const,
        placeholder: 'Describe any actions taken during the inspection...',
        helpText: 'What was done to address issues or improve conditions',
        group: 'Actions'
      },
      {
        name: 'recommendations',
        label: 'Recommendations',
        type: 'textarea' as const,
        placeholder: 'Provide recommendations for future improvements...',
        helpText: 'Suggestions for ongoing maintenance or improvements',
        group: 'Recommendations'
      },
      {
        name: 'completionTime',
        label: 'Inspection Duration (minutes)',
        type: 'number' as const,
        placeholder: 'Enter duration in minutes',
        helpText: 'How long the inspection took to complete',
        group: 'Completion Details'
      }
    ];

    return (
      <StepContent>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <FileText className="w-12 h-12 mx-auto text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Findings & Notes
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Document your observations and findings from the inspection
            </p>
          </div>

          <SmartForm
            fields={formFields}
            onSubmit={handleFindingsSubmit}
            initialData={afterInspectionData}
            submitLabel="Continue to Completion"
            onFieldChange={(name, value) => setAfterInspectionData(prev => ({ ...prev, [name]: value }))}
          />
        </div>
      </StepContent>
    );
  };

  const renderCompletion = () => (
    <StepContent>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle className="w-12 h-12 mx-auto text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complete Inspection
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review your inspection details before finalizing
          </p>
        </div>

        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Photos</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {afterInspectionData.afterPhoto ? '2/2' : '1/2'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Findings</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {afterInspectionData.overallCondition ? 'Complete' : 'Pending'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {afterInspectionData.completionTime || '--'} min
                </p>
              </CardContent>
            </Card>
                    </div>

          {/* Key Findings Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Overall Condition:</span>
                <Badge variant="outline" className="capitalize">
                  {afterInspectionData.overallCondition || 'Not assessed'}
                </Badge>
                  </div>

              {afterInspectionData.issuesFound && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Issues Found:</Label>
                  <p className="text-sm text-gray-600 mt-1">{afterInspectionData.issuesFound}</p>
                </div>
              )}
              
              {afterInspectionData.actionsTaken && (
                  <div>
                  <Label className="text-sm font-medium text-gray-700">Actions Taken:</Label>
                  <p className="text-sm text-gray-600 mt-1">{afterInspectionData.actionsTaken}</p>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Completion Confirmation */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Ready to Complete
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All required information has been collected. Click below to finalize the inspection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StepContent>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderInspectionOverview();
      case 1:
        return renderAfterPhotos();
      case 2:
        return renderFindings();
      case 3:
        return renderCompletion();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Always can proceed from overview
      case 1:
        return afterInspectionData.afterPhoto;
      case 2:
        return afterInspectionData.overallCondition && afterInspectionData.issuesFound;
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (!visitId) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No visit ID provided</AlertDescription>
        </Alert>
            </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigate('/sites')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sites</span>
            </Button>
          </div>
        
        {/* Auto-save status */}
        <div className="flex items-center space-x-2 text-sm">
          {autoSaveStatus === 'saving' && (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
              <span className="text-gray-600">Saving...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Draft saved</span>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-600">Save failed</span>
            </>
          )}
        </div>
      </div>

      {/* Step Wizard */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <StepWizard
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Step Actions */}
      <div className="mt-6">
        <StepActions
          onNext={handleNext}
          onPrevious={handlePrevious}
          nextLabel={currentStep === steps.length - 1 ? "Complete Inspection" : "Continue"}
          previousLabel="Back"
          nextDisabled={!canProceed() || loading}
          previousDisabled={currentStep === 0}
        />
      </div>

      {/* Complete Inspection Button (only on last step) */}
      {currentStep === steps.length - 1 && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleCompleteInspection}
            disabled={!canProceed() || loading}
            size="lg"
            className="px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Completing Inspection...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Inspection
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AfterInspection;
