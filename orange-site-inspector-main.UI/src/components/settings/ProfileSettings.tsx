import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient, User, ApiResponse } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function ProfileSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery<ApiResponse<User>>({ 
    queryKey: ["userProfile"], 
    queryFn: () => apiClient.getUserProfile() 
  });
  const mutation = useMutation<ApiResponse<User>, Error, Partial<User>>({
    mutationFn: (data: Partial<User>) => apiClient.updateUserProfile(data),
    onSuccess: () => {
      toast({ title: "Profile Updated", description: "Your profile has been updated." });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (err: any) => {
      toast({ title: "Update Failed", description: err.message || "Failed to update profile", variant: "destructive" });
    },
  });
  const [form, setForm] = useState<Partial<User>>({});

  useEffect(() => {
    if (data?.data) setForm(data.data);
  }, [data]);

  if (isLoading) return <Card className="card-luxury"><CardContent>Loading profile...</CardContent></Card>;
  if (isError) return <Card className="card-luxury"><CardContent>Error loading profile: {error?.message}</CardContent></Card>;

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              value={form.fullName || ""} 
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userName">Username</Label>
            <Input 
              id="userName" 
              value={form.userName || ""} 
              onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} 
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            value={form.email || ""} 
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              value={form.phoneNumber || ""} 
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input 
              id="department" 
              value={form.department || ""} 
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))} 
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input 
              id="position" 
              value={form.position || ""} 
              onChange={e => setForm(f => ({ ...f, position: e.target.value }))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="languagePreference">Language Preference</Label>
            <Select 
              value={form.languagePreference || "en"} 
              onValueChange={(value) => setForm(f => ({ ...f, languagePreference: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Time Zone */}
        <div className="space-y-2">
          <Label htmlFor="timeZone">Time Zone</Label>
          <Select 
            value={form.timeZone || "UTC"} 
            onValueChange={(value) => setForm(f => ({ ...f, timeZone: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
              <SelectItem value="UTC+1">UTC+1 (Central European Time)</SelectItem>
              <SelectItem value="UTC+2">UTC+2 (Eastern European Time)</SelectItem>
              <SelectItem value="UTC+3">UTC+3 (Moscow Time)</SelectItem>
              <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
              <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Read-only Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input 
              id="role" 
              value={form.role || ""} 
              disabled 
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailConfirmed">Email Confirmed</Label>
            <Input 
              id="emailConfirmed" 
              value={form.emailConfirmed ? "Yes" : "No"} 
              disabled 
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>
        </div>

        <Button 
          className="btn-orange" 
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Profile Changes"}
        </Button>
      </CardContent>
    </Card>
  );
} 