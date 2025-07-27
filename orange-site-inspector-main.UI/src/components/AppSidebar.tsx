import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Settings, 
  LogOut,
  Home,
  MapPin,
  Plus,
  List,
  FileText,
  BarChart2,
  BarChart3,
  Box,
  Activity,
  Bug,
  Clock,
  Shield
} from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Sites", url: "/sites", icon: MapPin },
  { title: "Visits", url: "/visits", icon: MapPin },
  { title: "Enhanced Visits", url: "/enhanced-visits", icon: Clock },
  { title: "Add New Visit", url: "/add-visit", icon: Plus },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium" 
      : "hover:bg-orange-50 dark:hover:bg-orange-900/10 text-gray-700 dark:text-gray-300";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Navigate to login page after successful logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarContent className="bg-white dark:bg-gray-900 border-r border-orange-100 dark:border-gray-800">
      {/* Logo Section */}
      <div className="p-4 border-b border-orange-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">OE</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Orange Egypt</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Site Inspection</p>
            </div>
          )}
        </div>
      </div>

      <SidebarGroup>
        <SidebarGroupLabel className="text-orange-600 dark:text-orange-400 font-semibold">
          {!collapsed ? "Navigation" : ""}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.url} 
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {user?.role === 'Admin' && (
              <>
                <SidebarGroupLabel className="text-orange-600 dark:text-orange-400 font-semibold mt-4">
                  {!collapsed ? "Admin" : ""}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/admin-dashboard" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/admin-dashboard')}`}>
                          <BarChart2 className="h-5 w-5" />
                          {!collapsed && <span>Admin Dashboard</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/admin-users" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/admin-users')}`}>
                          <Settings className="h-5 w-5" />
                          {!collapsed && <span>User Management</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/role-management" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/role-management')}`}>
                          <Shield className="h-5 w-5" />
                          {!collapsed && <span>Role Management</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/admin-visits" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/admin-visits')}`}>
                          <List className="h-5 w-5" />
                          {!collapsed && <span>Visit Management</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/admin-orama" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/admin-orama')}`}>
                          <Box className="h-5 w-5" />
                          {!collapsed && <span>Orama Management</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/enhanced-orama" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/enhanced-orama')}`}>
                          <BarChart3 className="h-5 w-5" />
                          {!collapsed && <span>Enhanced Orama</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/system-health" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/system-health')}`}>
                          <Activity className="h-5 w-5" />
                          {!collapsed && <span>System Health</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/admin-files" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/admin-files')}`}>
                          <FileText className="h-5 w-5" />
                          {!collapsed && <span>File Uploads</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/health-monitor" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/health-monitor')}`}>
                          <Activity className="h-5 w-5" />
                          {!collapsed && <span>Health Monitor</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/test-debug" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/test-debug')}`}>
                          <Bug className="h-5 w-5" />
                          {!collapsed && <span>Test & Debug</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/user-activity" className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${getNavClass('/user-activity')}`}>
                          <Activity className="h-5 w-5" />
                          {!collapsed && <span>User Activity</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Logout Button */}
      <div className="p-4 border-t border-orange-100 dark:border-gray-800 mt-auto">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className={`h-5 w-5 mr-3 ${isLoggingOut ? 'animate-spin' : ''}`} />
          {!collapsed && (isLoggingOut ? "Logging out..." : "Logout")}
        </Button>
      </div>
    </SidebarContent>
  );
}