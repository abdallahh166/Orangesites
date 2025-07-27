
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Site } from "@/lib/api";

interface SiteFormProps {
  initialData?: Partial<Site>;
  onSubmit: (data: any) => void;
}

export const SiteForm = ({ initialData, onSubmit }: SiteFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    location: initialData?.location || "",
    address: initialData?.address || "",
    status: initialData?.status || "active"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Site Name</Label>
        <Input
          id="name"
          placeholder="Cairo Central Tower"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">Site Code</Label>
        <Input
          id="code"
          placeholder="CCT-001"
          value={formData.code}
          onChange={(e) => handleInputChange("code", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
        <Input
          id="location"
          placeholder="New Cairo, Cairo"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
        <Textarea
          id="address"
          placeholder="Full address of the site..."
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          required
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleInputChange("status", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="submit" 
          className="btn-orange"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : initialData ? "Update Site" : "Create Site"}
        </Button>
      </div>
    </form>
  );
};
