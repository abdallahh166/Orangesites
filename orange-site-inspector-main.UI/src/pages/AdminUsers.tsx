import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  Shield,
  UserCheck,
  UserX,
  Crown,
  Wrench
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/components/ui/notifications";
import { ApiClient, UserRole } from "@/lib/api";

interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isLocked: boolean;
  lastLoginAt?: string;
  department?: string;
  position?: string;
  createdAt: string;
}

interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  locked: number;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleStats, setRoleStats] = useState<Record<UserRole, RoleStats>>({
    [UserRole.Admin]: { total: 0, active: 0, inactive: 0, locked: 0 },
    [UserRole.Engineer]: { total: 0, active: 0, inactive: 0, locked: 0 }
  });

  const apiClient = useMemo(() => new ApiClient(), []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // If there are search parameters, use searchUsers
      if (search || role || status !== 'all') {
        const searchDto = {
          searchTerm: search || undefined,
          role: role !== 'all' ? role : undefined,
          isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
          page,
          pageSize: 10
        };
        
        const response = await apiClient.searchUsers(searchDto);
        if (response.success) {
          setUsers(response.data.items);
          setTotalPages(response.data.totalPages);
        }
      } else {
        // Use getAllUsers for no filters
        const response = await apiClient.getAllUsers(page, 10);
        if (response.success) {
          setUsers(response.data.items);
          setTotalPages(response.data.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch users'
      });
    } finally {
      setLoading(false);
    }
  }, [apiClient, search, role, status, page, addNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    calculateRoleStats();
  }, [users]);

  const calculateRoleStats = () => {
    const stats = {
      [UserRole.Admin]: { total: 0, active: 0, inactive: 0, locked: 0 },
      [UserRole.Engineer]: { total: 0, active: 0, inactive: 0, locked: 0 }
    };

    users.forEach(user => {
      stats[user.role].total++;
      if (user.isActive) {
        stats[user.role].active++;
      } else {
        stats[user.role].inactive++;
      }
      if (user.isLocked) {
        stats[user.role].locked++;
      }
    });

    setRoleStats(stats);
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await apiClient.updateUser(userId, { isActive });
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
        });
        fetchUsers();
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user status'
      });
    }
  };

  const handleToggleUserLock = async (userId: string, isLocked: boolean) => {
    try {
      const response = await apiClient.updateUser(userId, { isLocked });
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: `User ${isLocked ? 'locked' : 'unlocked'} successfully`
        });
        fetchUsers();
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user lock status'
      });
    }
  };

  const getRoleIcon = (role: UserRole) => {
    return role === UserRole.Admin ? <Crown className="h-4 w-4" /> : <Wrench className="h-4 w-4" />;
  };

  const getRoleColor = (role: UserRole) => {
    return role === UserRole.Admin ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
  };

  const getStatusColor = (isActive: boolean, isLocked: boolean) => {
    if (isLocked) return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    return isActive ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const getStatusText = (isActive: boolean, isLocked: boolean) => {
    if (isLocked) return "Locked";
    return isActive ? "Active" : "Inactive";
  };

  const getStatusIcon = (isActive: boolean, isLocked: boolean) => {
    if (isLocked) return <Lock className="h-4 w-4" />;
    return isActive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system users and their roles
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button className="btn-orange">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Crown className="h-4 w-4 mr-2 text-purple-600" />
              Admin Users
            </CardTitle>
            <Badge variant="outline" className={getRoleColor(UserRole.Admin)}>
              {roleStats[UserRole.Admin].total}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-600 dark:text-green-400 font-medium">
                  {roleStats[UserRole.Admin].active}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Active</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {roleStats[UserRole.Admin].inactive}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Inactive</p>
              </div>
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  {roleStats[UserRole.Admin].locked}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engineer Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wrench className="h-4 w-4 mr-2 text-blue-600" />
              Engineer Users
            </CardTitle>
            <Badge variant="outline" className={getRoleColor(UserRole.Engineer)}>
              {roleStats[UserRole.Engineer].total}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-600 dark:text-green-400 font-medium">
                  {roleStats[UserRole.Engineer].active}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Active</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {roleStats[UserRole.Engineer].inactive}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Inactive</p>
              </div>
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  {roleStats[UserRole.Engineer].locked}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              placeholder="Search users by name, email, or username..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1"
            />
            <select 
              className="border rounded px-3 py-2 bg-white dark:bg-gray-800" 
              value={role} 
              onChange={e => { setRole(e.target.value); setPage(1); }}
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Engineer">Engineer</option>
            </select>
            <select 
              className="border rounded px-3 py-2 bg-white dark:bg-gray-800" 
              value={status} 
              onChange={e => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Login
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            @{user.userName}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(user.isActive, user.isLocked)}>
                          {getStatusIcon(user.isActive, user.isLocked)}
                          <span className="ml-1">{getStatusText(user.isActive, user.isLocked)}</span>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {user.department || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                            disabled={user.id === currentUser?.id}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserLock(user.id, !user.isLocked)}
                            disabled={user.id === currentUser?.id}
                          >
                            {user.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {users.length} users
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 