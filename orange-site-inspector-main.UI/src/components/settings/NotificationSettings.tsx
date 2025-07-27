import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inspectionReminders: true,
    reportUpdates: false,
  });
  const handleSave = () => {
    toast({ title: "Notification Settings Updated", description: "Your notification preferences have been saved." });
  };
  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified about inspections and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Receive inspection updates via email</p>
          </div>
          <Switch id="email-notifications" checked={notifications.emailNotifications} onCheckedChange={checked => setNotifications(n => ({ ...n, emailNotifications: checked }))} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get browser notifications for important updates</p>
          </div>
          <Switch id="push-notifications" checked={notifications.pushNotifications} onCheckedChange={checked => setNotifications(n => ({ ...n, pushNotifications: checked }))} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="inspection-reminders">Inspection Reminders</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Remind me about scheduled inspections</p>
          </div>
          <Switch id="inspection-reminders" checked={notifications.inspectionReminders} onCheckedChange={checked => setNotifications(n => ({ ...n, inspectionReminders: checked }))} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="report-updates">Report Updates</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when inspection reports are processed</p>
          </div>
          <Switch id="report-updates" checked={notifications.reportUpdates} onCheckedChange={checked => setNotifications(n => ({ ...n, reportUpdates: checked }))} />
        </div>
        <Button onClick={handleSave} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20">Save Notification Settings</Button>
        <p className="text-xs text-gray-400 mt-2">(Notification settings are stored locally. API integration can be added if available.)</p>
      </CardContent>
    </Card>
  );
} 