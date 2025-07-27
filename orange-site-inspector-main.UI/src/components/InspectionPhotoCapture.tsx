import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  Home,
  Shield,
  Radio,
  Zap,
  Flame,
  Globe,
  Wrench,
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { apiClient, OramaGroup, OramaItem } from "@/lib/api";

interface ComponentPhoto {
  id: string;
  componentId: string;
  beforeImage?: File;
  afterImage?: File;
  notes: string;
  status: 'pending' | 'completed' | 'issue';
  timestamp: string;
}

interface ComponentGroup {
  id: string;
  name: string;
  icon: any;
  color: string;
  components: {
    id: string;
    name: string;
    required: boolean;
  }[];
}

interface InspectionPhotoCaptureProps {
  onPhotosUpdate: (photos: ComponentPhoto[]) => void;
}

const InspectionPhotoCapture = ({ onPhotosUpdate }: InspectionPhotoCaptureProps) => {
  const [componentPhotos, setComponentPhotos] = useState<ComponentPhoto[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [oramaGroups, setOramaGroups] = useState<OramaGroup[]>([]);
  const [oramaItemsByGroup, setOramaItemsByGroup] = useState<Record<string, OramaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOramaData = async () => {
      setLoading(true);
      setError(null);
      try {
        const groupsRes = await apiClient.getOramaGroups();
        if (!groupsRes.success) throw new Error(groupsRes.message);
        setOramaGroups(groupsRes.data);
        // Fetch all items for each group in parallel
        const itemsResults = await Promise.all(
          groupsRes.data.map(group => apiClient.getOramaItemsByGroup(group.id))
        );
        const itemsByGroup: Record<string, OramaItem[]> = {};
        groupsRes.data.forEach((group, idx) => {
          itemsByGroup[group.id.toString()] = itemsResults[idx].success ? itemsResults[idx].data : [];
        });
        setOramaItemsByGroup(itemsByGroup);
      } catch (err: any) {
        setError(err.message || "Failed to load equipment groups");
      } finally {
        setLoading(false);
      }
    };
    fetchOramaData();
  }, []);

  const handleGroupToggle = (groupId: string) => {
    const groupItems = oramaItemsByGroup[groupId] || [];
    const isSelected = selectedGroups.includes(groupId);
    const allComponentIds = groupItems.map(c => c.id.toString());
    if (isSelected) {
      // Deselect entire group
      setSelectedGroups(prev => prev.filter(id => id !== groupId));
      setSelectedComponents(prev => prev.filter(id => !allComponentIds.includes(id)));
    } else {
      // Select entire group
      setSelectedGroups(prev => [...prev, groupId]);
      setSelectedComponents(prev => [...new Set([...prev, ...allComponentIds])]);
    }
  };

  const handleComponentToggle = (componentId: string, groupId: string) => {
    const isSelected = selectedComponents.includes(componentId);
    if (isSelected) {
      setSelectedComponents(prev => prev.filter(id => id !== componentId));
      setSelectedGroups(prev => prev.filter(id => id !== groupId));
    } else {
      setSelectedComponents(prev => [...prev, componentId]);
      // Check if all components in group are now selected
      const groupItems = oramaItemsByGroup[groupId] || [];
      const allSelected = groupItems.every(c => selectedComponents.includes(c.id.toString()) || c.id.toString() === componentId);
      if (allSelected && !selectedGroups.includes(groupId)) {
        setSelectedGroups(prev => [...prev, groupId]);
      }
    }
  };

  const handleImageUpload = (componentId: string, file: File, type: 'before' | 'after') => {
    const existingPhoto = componentPhotos.find(p => p.componentId === componentId);
    
    if (existingPhoto) {
      const updatedPhotos = componentPhotos.map(p =>
        p.componentId === componentId
          ? { ...p, [type === 'before' ? 'beforeImage' : 'afterImage']: file, timestamp: new Date().toISOString() }
          : p
      );
      setComponentPhotos(updatedPhotos);
      onPhotosUpdate(updatedPhotos);
    } else {
      const newPhoto: ComponentPhoto = {
        id: `photo-${Date.now()}-${componentId}`,
        componentId,
        [type === 'before' ? 'beforeImage' : 'afterImage']: file,
        notes: '',
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      const updatedPhotos = [...componentPhotos, newPhoto];
      setComponentPhotos(updatedPhotos);
      onPhotosUpdate(updatedPhotos);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getComponentPhoto = (componentId: string) => {
    return componentPhotos.find(p => p.componentId === componentId);
  };

  if (loading) {
    return <div className="text-center py-10">Loading equipment groups...</div>;
  }
  if (error) {
    return <div className="text-center text-red-600 py-10">{error}</div>;
  }
  if (oramaGroups.length === 0) {
    return <div className="text-center py-10">No equipment groups found.</div>;
  }

  return (
    <div className="space-y-6">
      {oramaGroups.map((group) => {
        const groupItems = oramaItemsByGroup[group.id.toString()] || [];
        const isGroupExpanded = expandedGroups.includes(group.id.toString());
        const isGroupSelected = selectedGroups.includes(group.id.toString());
        const selectedCount = groupItems.filter(c => selectedComponents.includes(c.id.toString())).length;
        return (
          <Card key={group.id} className="card-luxury">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {/* Optionally map group.icon if you have a mapping */}
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                      {group.name}
                    </CardTitle>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      {selectedCount}/{groupItems.length}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isGroupSelected}
                    onCheckedChange={() => handleGroupToggle(group.id.toString())}
                  />
                  <Label className="text-sm text-gray-600 dark:text-gray-400">
                    Select All
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroupExpansion(group.id.toString())}
                  >
                    {isGroupExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isGroupExpanded && (
              <CardContent>
                <div className="grid gap-4">
                  {groupItems.map((component) => {
                    const isSelected = selectedComponents.includes(component.id.toString());
                    const photo = getComponentPhoto(component.id.toString());
                    return (
                      <div
                        key={component.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleComponentToggle(component.id.toString(), group.id.toString())}
                            />
                            <div>
                              <Label className="font-medium text-gray-900 dark:text-white">
                                {component.name}
                              </Label>
                              {component.isRequired && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Required
                                </Badge>
                              )}
                              {component.isCritical && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  Critical
                                </Badge>
                              )}
                            </div>
                          </div>
                          {photo && (photo.beforeImage || photo.afterImage) && (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        {isSelected && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Before Image Upload */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Before Image
                              </Label>
                              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                {photo?.beforeImage ? (
                                  <div className="text-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <span className="text-sm text-green-600">Before image uploaded</span>
                                  </div>
                                ) : (
                                  <Label className="cursor-pointer text-center p-4 flex flex-col items-center justify-center w-full h-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <Camera className="h-8 w-8 mb-2 text-gray-400" />
                                    <span className="text-xs text-gray-500">Upload before image</span>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleImageUpload(component.id.toString(), e.target.files[0], 'before');
                                        }
                                      }}
                                    />
                                  </Label>
                                )}
                              </div>
                            </div>
                            {/* After Image Upload */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                After Image
                              </Label>
                              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                {photo?.afterImage ? (
                                  <div className="text-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <span className="text-sm text-green-600">After image uploaded</span>
                                  </div>
                                ) : (
                                  <Label className="cursor-pointer text-center p-4 flex flex-col items-center justify-center w-full h-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <Camera className="h-8 w-8 mb-2 text-gray-400" />
                                    <span className="text-xs text-gray-500">Upload after image</span>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleImageUpload(component.id.toString(), e.target.files[0], 'after');
                                        }
                                      }}
                                    />
                                  </Label>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default InspectionPhotoCapture;
