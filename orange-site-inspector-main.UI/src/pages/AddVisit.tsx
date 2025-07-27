import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Calendar, 
  User, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Save,
  Clock,
  Info,
  List,
  Image,
  FileText
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
import { Checkbox } from "@/components/ui/checkbox";
import { useVisit } from "@/contexts/VisitContext";
import { visitService } from "@/services/visitService";
import { ApiClient, OramaItem, OramaGroup } from "@/lib/api";

interface Site {
  id: number;
  name: string;
  address: string;
  status: string;
}

interface SelectedComponent {
  id: number;
  name: string;
  groupName: string;
  beforePhoto?: File;
  afterPhoto?: File;
  beforeComment?: string;
  afterComment?: string;
  isSelected: boolean;
}

const AddVisit: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, saveDraft, clearDraft } = useVisit();
  const [currentStep, setCurrentStep] = useState(0);
  const [sites, setSites] = useState<Site[]>([]);
  const [oramaGroups, setOramaGroups] = useState<OramaGroup[]>([]);
  const [oramaItems, setOramaItems] = useState<OramaItem[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [visitData, setVisitData] = useState<any>({});
  const apiClientRef = useRef(new ApiClient());

  // Step configuration
  const steps = [
    {
      id: 'site-selection',
      title: 'Select Site',
      description: 'Choose the site to inspect',
      status: (currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending') as 'current' | 'completed' | 'pending'
    },
    {
      id: 'orama-components',
      title: 'Select Components',
      description: 'Choose components to inspect',
      status: (currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending') as 'current' | 'completed' | 'pending'
    },
    {
      id: 'before-photos',
      title: 'Before Photos',
      description: 'Capture initial state',
      status: (currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending') as 'current' | 'completed' | 'pending'
    },
    {
      id: 'after-photos',
      title: 'After Photos',
      description: 'Capture final state',
      status: (currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending') as 'current' | 'completed' | 'pending'
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review and complete',
      status: (currentStep === 4 ? 'current' : 'pending') as 'current' | 'completed' | 'pending'
    }
  ];

  // Load sites on component mount
  useEffect(() => {
    loadSites();
  }, []);

  // Load orama data when site is selected
  useEffect(() => {
    if (visitData.siteId) {
      loadOramaData();
    }
  }, [visitData.siteId]);

  // Auto-save functionality
  useEffect(() => {
    if (visitData && Object.keys(visitData).length > 0) {
      const timeoutId = setTimeout(() => {
        autoSave();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [visitData, selectedComponents]);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading sites...');
      
      const response = await apiClientRef.current.searchSites({
        searchTerm: '',
        page: 1,
        pageSize: 50,
      });
      console.log('Sites response:', response);
      
      if (response.success && response.data && response.data.items) {
        setSites(response.data.items);
        console.log('Sites loaded:', response.data.items);
      } else if (response.success && response.data && Array.isArray(response.data)) {
        setSites(response.data);
        console.log('Sites loaded (array):', response.data);
      } else {
        console.log('No sites found in API response');
        setSites([]);
        setError('No sites are configured in the system. Please contact an administrator.');
      }
    } catch (err) {
      console.error('Error loading sites:', err);
      setSites([]);
      setError('Failed to load sites. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadOramaData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading orama data for site:', visitData.siteId);
      
      // Ensure API client has authentication token
      const token = localStorage.getItem('authToken');
      if (token) {
        apiClientRef.current.setToken(token);
      }
      
      console.log('Making API calls to get orama data...');
      const [groupsResponse, itemsResponse] = await Promise.all([
        apiClientRef.current.getOramaGroups(),
        apiClientRef.current.getOramaItems()
      ]);

      console.log('Groups response:', groupsResponse);
      console.log('Items response:', itemsResponse);

      if (groupsResponse.success && itemsResponse.success) {
        console.log('API calls successful, setting data...');
        setOramaGroups(groupsResponse.data);
        setOramaItems(itemsResponse.data);
        
        // Initialize selected components
        const components: SelectedComponent[] = itemsResponse.data.map(item => ({
          id: item.id,
          name: item.name,
          groupName: item.oramaGroupName,
          isSelected: false
        }));
        setSelectedComponents(components);
        console.log('Orama data loaded successfully:', { 
          groups: groupsResponse.data, 
          items: itemsResponse.data,
          components: components 
        });
      } else {
        console.log('API calls failed');
        console.log('Groups error:', groupsResponse.message);
        console.log('Items error:', itemsResponse.message);
        
        setOramaGroups([]);
        setOramaItems([]);
        setSelectedComponents([]);
        setError('Failed to load components. Please check your connection and try again.');
      }
    } catch (err) {
      console.error('Error loading orama data:', err);
      setOramaGroups([]);
      setOramaItems([]);
      setSelectedComponents([]);
      setError('Failed to load components. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!visitData || Object.keys(visitData).length === 0) return;

    try {
      setAutoSaveStatus('saving');
      const saveData = {
        ...visitData,
        selectedComponents
      };
      localStorage.setItem('visitData', JSON.stringify(saveData));
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

  const handleSiteSelect = (siteId: number) => {
    const selectedSite = sites.find(site => site.id === siteId);
    if (selectedSite) {
      setVisitData(prev => ({
        ...prev,
        siteId,
        siteName: selectedSite.name,
        siteAddress: selectedSite.address
      }));
    }
  };

  const handleComponentToggle = (componentId: number) => {
    setSelectedComponents(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, isSelected: !comp.isSelected }
          : comp
      )
    );
  };

  const handleBeforePhotoUpload = (componentId: number, file: File) => {
    setSelectedComponents(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, beforePhoto: file }
          : comp
      )
    );
  };

  const handleAfterPhotoUpload = (componentId: number, file: File) => {
    setSelectedComponents(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, afterPhoto: file }
          : comp
      )
    );
  };

  const handleBeforeCommentChange = (componentId: number, comment: string) => {
    setSelectedComponents(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, beforeComment: comment }
          : comp
      )
    );
  };

  const handleAfterCommentChange = (componentId: number, comment: string) => {
    setSelectedComponents(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, afterComment: comment }
          : comp
      )
    );
  };

  const handleCompleteVisit = async () => {
    try {
      setLoading(true);
      setError(null);

      const visit = await visitService.createVisit({
        ...visitData,
        components: selectedComponents.filter(comp => comp.isSelected)
      });
      
      // Clear the visit data after successful creation
      setVisitData({});
      setSelectedComponents([]);
      localStorage.removeItem('visitData');
      
      // Navigate to the after inspection page
      navigate(`/after-inspection/${visit.visitId}`);
    } catch (err) {
      setError('Failed to create visit. Please try again.');
      console.error('Error creating visit:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSiteSelection = () => (
    <StepContent>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Building2 className="w-12 h-12 mx-auto text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Select Site to Inspect
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose the site where you'll be conducting the inspection
          </p>
        </div>

        {loading ? (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading sites...</p>
          </div>
        ) : (
          <>
            {error && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {sites.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Sites Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There are no sites configured in the system.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sites.map((site) => (
                  <Card
                    key={site.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      visitData.siteId === site.id
                        ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'hover:border-orange-300'
                    }`}
                    onClick={() => handleSiteSelect(site.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {site.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {site.address}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant={site.status === 'Active' ? 'default' : 'secondary'}>
                              {site.status}
                            </Badge>
                          </div>
                        </div>
                        {visitData.siteId === site.id && (
                          <CheckCircle className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
        </div>
            )}
          </>
        )}
      </div>
    </StepContent>
  );

  const renderOramaComponents = () => {
    const selectedCount = selectedComponents.filter(comp => comp.isSelected).length;
    
    // Create a map of all available components by group
    const componentsByGroup: Record<string, SelectedComponent[]> = {};
    
    // Initialize all groups with empty arrays
    oramaGroups.forEach(group => {
      componentsByGroup[group.name] = [];
    });
    
    // Add all components to their respective groups
    selectedComponents.forEach(component => {
      if (componentsByGroup[component.groupName]) {
        componentsByGroup[component.groupName].push(component);
      } else {
        // If group doesn't exist, create it
        componentsByGroup[component.groupName] = [component];
      }
    });

    console.log('Components by group:', componentsByGroup);
    console.log('Available groups:', oramaGroups);
    console.log('All components:', selectedComponents);

    return (
      <StepContent>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <List className="w-12 h-12 mx-auto text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Select Components to Inspect
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose the components you want to inspect at {visitData.siteName}
            </p>
            {selectedCount > 0 && (
              <Badge variant="default" className="mt-2">
                {selectedCount} component{selectedCount !== 1 ? 's' : ''} selected
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Loading components...</p>
            </div>
          ) : selectedComponents.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Components Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No components are configured for this site. Please contact an administrator.
              </p>
            </div>
          ) : (
      <div className="space-y-6">
              {Object.entries(componentsByGroup).map(([groupName, components]) => (
                <Card key={groupName}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{groupName}</span>
                      <Badge variant="outline">
                        {components.filter(comp => comp.isSelected).length} selected
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {oramaGroups.find(g => g.name === groupName)?.description || 
                       `${groupName} components and equipment`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {components.map((component) => (
                        <div
                          key={component.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Checkbox
                            checked={component.isSelected}
                            onCheckedChange={() => handleComponentToggle(component.id)}
                          />
                          <div className="flex-1">
                            <Label className="text-sm font-medium cursor-pointer">
                              {component.name}
                            </Label>
                          </div>
                          {component.isSelected && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </StepContent>
    );
  };

  const renderBeforePhotos = () => {
    const selectedComps = selectedComponents.filter(comp => comp.isSelected);

    return (
      <StepContent>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Camera className="w-12 h-12 mx-auto text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Before Photos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Capture the initial state of selected components
            </p>
          </div>

          {selectedComps.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Components Selected
            </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please go back and select components to inspect.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedComps.map((component) => (
                <Card key={component.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{component.name}</span>
                      {component.beforePhoto && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription>{component.groupName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ImageUpload
                      onImageSelect={(file) => handleBeforePhotoUpload(component.id, file)}
                      onImageRemove={() => handleBeforePhotoUpload(component.id, null as any)}
                      selectedImage={component.beforePhoto}
                      label="Before Photo"
                      description="Take a photo showing the initial condition"
                      imageType="before"
                      required
                    />
                    
                    <div className="space-y-2">
                      <Label htmlFor={`before-comment-${component.id}`}>
                        Comments (Optional)
                      </Label>
                      <Textarea
                        id={`before-comment-${component.id}`}
                        placeholder="Add any observations about the initial condition..."
                        value={component.beforeComment || ''}
                        onChange={(e) => handleBeforeCommentChange(component.id, e.target.value)}
                        rows={3}
                      />
                    </div>
          </CardContent>
        </Card>
              ))}
            </div>
          )}
      </div>
      </StepContent>
    );
  };

  const renderAfterPhotos = () => {
    const selectedComps = selectedComponents.filter(comp => comp.isSelected);

  return (
      <StepContent>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Image className="w-12 h-12 mx-auto text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              After Photos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Capture the final state of selected components
            </p>
          </div>

          {selectedComps.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Components Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please go back and select components to inspect.
              </p>
            </div>
          ) : (
      <div className="space-y-6">
              {selectedComps.map((component) => (
                <Card key={component.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{component.name}</span>
                      {component.afterPhoto && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription>{component.groupName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ImageUpload
                      onImageSelect={(file) => handleAfterPhotoUpload(component.id, file)}
                      onImageRemove={() => handleAfterPhotoUpload(component.id, null as any)}
                      selectedImage={component.afterPhoto}
                      label="After Photo"
                      description="Take a photo showing the final condition"
                      imageType="after"
                      required
                    />
                    
                    <div className="space-y-2">
                      <Label htmlFor={`after-comment-${component.id}`}>
                        Comments (Optional)
                      </Label>
                      <Textarea
                        id={`after-comment-${component.id}`}
                        placeholder="Add any observations about the final condition..."
                        value={component.afterComment || ''}
                        onChange={(e) => handleAfterCommentChange(component.id, e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </StepContent>
    );
  };

  const renderReview = () => {
    const selectedComps = selectedComponents.filter(comp => comp.isSelected);
    const completedComps = selectedComps.filter(comp => comp.beforePhoto && comp.afterPhoto);

    return (
      <StepContent>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle className="w-12 h-12 mx-auto text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review & Submit
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Review your inspection details before proceeding
            </p>
        </div>

          <div className="grid gap-6">
          {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Site Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Site Name:</span>
                  <span className="font-medium">{visitData.siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{visitData.siteAddress}</span>
                </div>
              </CardContent>
            </Card>

            {/* Components Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <List className="w-5 h-5" />
                  <span>Components Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Selected:</span>
                    <span className="font-medium">{selectedComps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">{completedComps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium">{selectedComps.length - completedComps.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Component Details */}
            {selectedComps.map((component) => (
              <Card key={component.id}>
              <CardHeader>
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <CardDescription>{component.groupName}</CardDescription>
              </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Before Photo:</span>
                    {component.beforePhoto ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                          </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">After Photo:</span>
                    {component.afterPhoto ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                        </div>
                  {component.beforeComment && (
                    <div>
                      <span className="text-gray-600 text-sm">Before Comment:</span>
                      <p className="text-sm mt-1">{component.beforeComment}</p>
                        </div>
                  )}
                  {component.afterComment && (
                    <div>
                      <span className="text-gray-600 text-sm">After Comment:</span>
                      <p className="text-sm mt-1">{component.afterComment}</p>
                    </div>
                  )}
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      </StepContent>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderSiteSelection();
      case 1:
        return renderOramaComponents();
      case 2:
        return renderBeforePhotos();
      case 3:
        return renderAfterPhotos();
      case 4:
        return renderReview();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return visitData.siteId;
      case 1:
        return selectedComponents.some(comp => comp.isSelected);
      case 2:
        const selectedComps = selectedComponents.filter(comp => comp.isSelected);
        return selectedComps.length > 0 && selectedComps.every(comp => comp.beforePhoto);
      case 3:
        const selectedComps2 = selectedComponents.filter(comp => comp.isSelected);
        return selectedComps2.length > 0 && selectedComps2.every(comp => comp.afterPhoto);
      case 4:
        return true;
      default:
        return false;
    }
  };

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
          nextLabel={currentStep === steps.length - 1 ? "Complete Visit" : "Continue"}
          previousLabel="Back"
          nextDisabled={!canProceed() || loading}
          previousDisabled={currentStep === 0}
        />
      </div>

      {/* Complete Visit Button (only on last step) */}
      {currentStep === steps.length - 1 && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleCompleteVisit}
            disabled={!canProceed() || loading}
            size="lg"
            className="px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Visit...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Visit
              </>
            )}
          </Button>
        </div>
      )}
      </div>
  );
};

export default AddVisit;
