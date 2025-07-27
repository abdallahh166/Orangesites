import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { DataManagementSettings } from "@/components/settings/DataManagementSettings";
import { LogoutButton } from "@/components/settings/LogoutButton";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and application preferences</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main settings sections */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileSettings />
          <NotificationSettings />
        </div>
        {/* Sidebar quick settings */}
        <div className="space-y-6">
          <AppearanceSettings />
          <SecuritySettings />
          <DataManagementSettings />
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
