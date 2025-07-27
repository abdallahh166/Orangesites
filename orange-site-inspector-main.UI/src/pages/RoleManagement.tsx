import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Wrench, 
  Shield, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  BarChart3,
  MapPin,
  FileText,
  Database
} from "lucide-react";
import { UserRole } from "@/lib/api";

interface Permission {
  name: string;
  description: string;
  admin: boolean;
  engineer: boolean;
  icon: React.ReactNode;
}

interface RoleInfo {
  name: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  permissions: string[];
}

const permissions: Permission[] = [
  {
    name: "Dashboard Access",
    description: "View dashboard statistics and charts",
    admin: true,
    engineer: true,
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    name: "Global Statistics",
    description: "View system-wide statistics and performance",
    admin: true,
    engineer: false,
    icon: <Database className="h-4 w-4" />
  },
  {
    name: "All Sites Access",
    description: "View and manage all sites in the system",
    admin: true,
    engineer: false,
    icon: <MapPin className="h-4 w-4" />
  },
  {
    name: "Visited Sites Only",
    description: "View only sites that have been visited",
    admin: false,
    engineer: true,
    icon: <Eye className="h-4 w-4" />
  },
  {
    name: "All Visits Access",
    description: "View and manage all visits in the system",
    admin: true,
    engineer: false,
    icon: <FileText className="h-4 w-4" />
  },
  {
    name: "Own Visits Only",
    description: "View and manage only own visits",
    admin: false,
    engineer: true,
    icon: <Edit className="h-4 w-4" />
  },
  {
    name: "User Management",
    description: "Create, edit, and manage system users",
    admin: true,
    engineer: false,
    icon: <Users className="h-4 w-4" />
  },
  {
    name: "System Settings",
    description: "Access and modify system configuration",
    admin: true,
    engineer: false,
    icon: <Settings className="h-4 w-4" />
  },
  {
    name: "Reports Generation",
    description: "Generate and export system reports",
    admin: true,
    engineer: true,
    icon: <FileText className="h-4 w-4" />
  },
  {
    name: "Orama Management",
    description: "Manage Orama components and items",
    admin: true,
    engineer: true,
    icon: <Database className="h-4 w-4" />
  }
];

const roles: RoleInfo[] = [
  {
    name: UserRole.Admin,
    title: "Administrator",
    description: "Full system access with complete control over all features and user management",
    icon: <Crown className="h-6 w-6" />,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    permissions: [
      "Dashboard Access",
      "Global Statistics", 
      "All Sites Access",
      "All Visits Access",
      "User Management",
      "System Settings",
      "Reports Generation",
      "Orama Management"
    ]
  },
  {
    name: UserRole.Engineer,
    title: "Site Engineer",
    description: "Limited access focused on site visits, inspections, and personal data management",
    icon: <Wrench className="h-6 w-6" />,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    permissions: [
      "Dashboard Access",
      "Visited Sites Only",
      "Own Visits Only",
      "Reports Generation",
      "Orama Management"
    ]
  }
];

export default function RoleManagement() {
  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Understand and manage user roles and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button variant="outline">
            <Info className="h-4 w-4 mr-2" />
            Documentation
          </Button>
        </div>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.name} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  {role.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <Badge className={role.color}>
                    {role.name}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {role.description}
              </p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Permissions:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {role.permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Permissions Matrix</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Permission
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Admin
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Engineer
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {permission.icon}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {permission.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {permission.admin ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {permission.engineer ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {permission.description}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">JWT Authentication</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓ Active</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Secure token-based authentication with automatic refresh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role-Based Access</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓ Active</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Granular permissions based on user roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Protection</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓ Active</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              API endpoints protected with authorization policies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Role Management Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">✅ Do's</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Regularly review user roles and permissions</li>
                <li>• Use the principle of least privilege</li>
                <li>• Monitor user activity and access patterns</li>
                <li>• Keep role assignments up to date</li>
                <li>• Document role changes and reasons</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">❌ Don'ts</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Don't assign Admin role unnecessarily</li>
                <li>• Don't share user credentials</li>
                <li>• Don't leave inactive users with high privileges</li>
                <li>• Don't ignore security audit logs</li>
                <li>• Don't create custom roles without proper planning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security Audit</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Export Permissions</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 