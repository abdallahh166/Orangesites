import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useState } from "react";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setLoading(true);
    
    // Capitalize the theme value for the API
    const apiTheme = newTheme.charAt(0).toUpperCase() + newTheme.slice(1);
    
    // Always apply theme locally first for immediate feedback
    setTheme(newTheme);
    
    try {
      // Try to update on server, but don't fail if it doesn't work
      await apiClient.updateUserTheme(apiTheme as any);
      toast({ title: "Theme Updated", description: `Theme set to ${newTheme}.` });
    } catch (err: any) {
      console.log('Server theme update failed:', err);
      // Don't show error toast, just log it - theme is already applied locally
      // This allows the feature to work even if backend doesn't support theme updates yet
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button variant={theme === "light" ? "default" : "outline"} onClick={() => handleThemeChange("light")} className="w-full justify-start" disabled={loading}>Light Mode</Button>
          <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => handleThemeChange("dark")} className="w-full justify-start" disabled={loading}>Dark Mode</Button>
          <Button variant={theme === "system" ? "default" : "outline"} onClick={() => handleThemeChange("system")} className="w-full justify-start" disabled={loading}>System</Button>
        </div>
      </CardContent>
    </Card>
  );
} 