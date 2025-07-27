import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  MapPin, 
  Plus, 
  FileText, 
  Settings, 
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from './AppSidebar';
import { Sidebar, SidebarProvider } from './ui/sidebar';
import { NotificationBell, NotificationCenter } from './ui/notifications';
import { DebugInfo } from './ui/DebugInfo';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sites", href: "/sites", icon: MapPin },
  { name: "New Visit", href: "/add-visit", icon: Plus },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar>
            <AppSidebar />
          </Sidebar>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 max-w-[80vw] bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto h-full">
                <AppSidebar />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 bg-orange-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">OE</span>
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-gray-900 dark:text-white truncate">Orange Egypt</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Site Inspection</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <NotificationBell onClick={() => setIsNotificationCenterOpen(true)} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-4 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                Site Inspector
              </h1>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <NotificationBell onClick={() => setIsNotificationCenterOpen(true)} />
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto p-4 md:p-6">
              <div className="max-w-full">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Notification Center */}
        <NotificationCenter
          isOpen={isNotificationCenterOpen}
          onClose={() => setIsNotificationCenterOpen(false)}
        />
        
        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && <DebugInfo />}
      </div>
    </SidebarProvider>
  );
};
