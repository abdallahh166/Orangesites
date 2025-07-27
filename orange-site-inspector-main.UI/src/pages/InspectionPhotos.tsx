import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, Save } from "lucide-react";
import InspectionPhotoCapture from "@/components/InspectionPhotoCapture";
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

const InspectionPhotos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [componentPhotos, setComponentPhotos] = useState<ComponentPhoto[]>([]);
  const [oramaGroups, setOramaGroups] = useState<OramaGroup[]>([]);
  const [oramaItems, setOramaItems] = useState<OramaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrama = async () => {
      setLoading(true);
      setError(null);
      try {
        const groupsRes = await apiClient.getOramaGroups();
        if (!groupsRes.success) throw new Error(groupsRes.message);
        setOramaGroups(groupsRes.data);
        // Fetch all items for all groups
        const itemsResults = await Promise.all(
          groupsRes.data.map(group => apiClient.getOramaItemsByGroup(group.id))
        );
        const allItems = itemsResults.flatMap(res => (res.success ? res.data : []));
        setOramaItems(allItems);
      } catch (err: any) {
        setError(err.message || "Failed to load equipment data");
      } finally {
        setLoading(false);
      }
    };
    fetchOrama();
  }, []);

  const handlePhotosUpdate = (photos: ComponentPhoto[]) => {
    setComponentPhotos(photos);
  };

  const handleSave = () => {
    toast({
      title: "Photos Saved",
      description: "Your inspection photos have been saved as draft.",
    });
  };

  const handleSubmit = () => {
    // Dynamically determine required components from Orama items
    const requiredComponentIds = oramaItems.filter(i => i.isRequired).map(i => i.id.toString());
    const requiredPhotos = componentPhotos.filter(p => requiredComponentIds.includes(p.componentId));
    const missingPhotos = requiredComponentIds.filter(id => !componentPhotos.some(p => p.componentId === id && p.afterImage));
    if (missingPhotos.length > 0) {
      toast({
        title: "Missing Required Photos",
        description: `Please upload after images for ${missingPhotos.length} required components.`,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Inspection Photos Submitted",
      description: "All inspection photos have been submitted successfully.",
    });
    navigate("/visits");
  };

  // Count completed required components
  const requiredComponentIds = oramaItems.filter(i => i.isRequired).map(i => i.id.toString());
  const completedCount = componentPhotos.filter(p => requiredComponentIds.includes(p.componentId) && p.status === 'completed').length;
  const totalRequired = requiredComponentIds.length;

  if (loading) {
    return <div className="text-center py-10">Loading equipment data...</div>;
  }
  if (error) {
    return <div className="text-center text-red-600 py-10">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Site Inspection Photos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Capture before and after images for all site components
        </p>
      </div>

      {/* Photo Capture Component */}
      <InspectionPhotoCapture onPhotosUpdate={handlePhotosUpdate} />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button 
          onClick={handleSave}
          variant="outline"
          className="flex-1 h-12 text-lg border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Draft
        </Button>
        
        <Button 
          onClick={handleSubmit}
          className="flex-1 h-12 text-lg btn-orange"
          disabled={completedCount < totalRequired}
        >
          <Send className="h-5 w-5 mr-2" />
          Submit Photos ({completedCount}/{totalRequired})
        </Button>
      </div>
    </div>
  );
};

export default InspectionPhotos;
