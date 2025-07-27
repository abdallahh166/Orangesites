// Enums matching backend
export enum UserRole {
  Admin = 'Admin',
  Engineer = 'Engineer',
}

export enum SiteStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Maintenance = 'Maintenance',
  Decommissioned = 'Decommissioned',
}

export enum VisitStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Completed = 'Completed',
  InProgress = 'InProgress',
}

export enum VisitPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Critical = 'Critical',
}

export enum VisitType {
  Routine = 'Routine',
  Emergency = 'Emergency',
  FollowUp = 'FollowUp',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  refreshTokenExpiresAt: string;
}

// User DTOs
export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role: UserRole;
  emailConfirmed: boolean;
  isActive: boolean;
  isLocked: boolean;
  lastLoginAt?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  languagePreference?: string;
  timeZone?: string;
  themePreference?: string;
  createdAt: string;
  updatedAt?: string;
}

// Site DTOs
export interface Site {
  id: number;
  name: string;
  code: string;
  location: string;
  address: string;
  status: SiteStatus;
  visitCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteDetail extends Site {
  recentVisits: VisitSummary[];
  totalVisits: number;
  pendingVisits: number;
  completedVisits: number;
}

export interface VisitSummary {
  id: number;
  siteName: string;
  userId: string;
  userName: string;
  createdAt: string;
  status: VisitStatus;
  priority: VisitPriority;
  type: VisitType;
  scheduledDate?: string;
  componentCount: number;
}

// Visit DTOs
export interface Visit {
  id: number;
  siteId: number;
  siteName: string;
  siteCode: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt?: string;
  status: VisitStatus;
  priority: VisitPriority;
  type: VisitType;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  rejectionReason?: string;
  estimatedDurationMinutes?: number;
  actualDurationMinutes?: number;
  componentCount: number;
}

// Orama DTOs
export interface OramaGroup {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  sortOrder: number;
  category?: string;
  icon?: string;
  color?: string;
  itemCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface OramaItem {
  id: number;
  name: string;
  description?: string;
  oramaGroupId: number;
  oramaGroupName: string;
  isActive: boolean;
  isRequired: boolean;
  isCritical: boolean;
  priority: number;
  sortOrder: number;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  maintenanceFrequency?: string;
  expectedLifespanYears?: number;
  maintenanceNotes?: string;
  category?: string;
  icon?: string;
  color?: string;
  tags?: string;
  createdAt: string;
  updatedAt?: string;
}

// Visit Component types
export interface VisitComponent {
  id: number;
  visitId: number;
  oramaGroupId: number;
  oramaItemId?: number;
  groupName: string;
  itemName?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  comments?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dashboard analytics types
export interface DashboardStats {
  totalVisits: number;
  totalVisitsThisMonth: number;
  pendingVisits: number;
  acceptedVisits: number;
  rejectedVisits: number;
  totalSites: number;
  totalUsers: number;
  averageVisitsPerDay: number;
  visitsToday: number;
  visitsThisWeek: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface DashboardCharts {
  visitsByStatus: ChartDataPoint[];
  visitsByMonth: ChartDataPoint[];
  visitsByDay: ChartDataPoint[];
  topSites: ChartDataPoint[];
}

export interface DashboardOverview {
  stats: DashboardStats;
  charts: DashboardCharts;
  latestVisits: any[];
  recentSites: any[];
}

export interface AdminDashboard {
  globalStats: DashboardStats;
  globalCharts: DashboardCharts;
  latestVisits: any[];
  recentSites: any[];
  recentUsers: any[];
  visitsByEngineer: ChartDataPoint[];
  sitesByVisits: ChartDataPoint[];
}

export interface EngineerDashboard {
  totalMyVisits: number;
  myVisitsThisMonth: number;
  myPendingVisits: number;
  myAcceptedVisits: number;
  myRejectedVisits: number;
  totalSitesVisited: number;
  averageVisitsPerDay: number;
  visitsToday: number;
  visitsThisWeek: number;
  myLatestVisits: any[];
  myRecentSites: any[];
  myVisitsByStatus: ChartDataPoint[];
  myVisitsByMonth: ChartDataPoint[];
}

// Auth types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Request DTOs ---
export interface CreateSiteRequest {
  name: string;
  code: string;
  location: string;
  address: string;
  status?: SiteStatus; // Optional, default to Active
}

export interface CreateVisitRequest {
  siteId: number;
  userId?: string; // Will be set by backend for engineer
  status?: VisitStatus; // Optional, default to Pending
  priority?: VisitPriority; // Optional, default to Normal
  type?: VisitType; // Optional, default to Routine
  scheduledDate?: string;
  notes?: string;
  estimatedDurationMinutes?: number;
}

// Orama Request DTOs
export interface CreateOramaGroupRequest {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
}

export interface UpdateOramaGroupRequest {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  priority?: number;
  sortOrder?: number;
}

export interface CreateOramaItemRequest {
  name: string;
  groupId: number;
  description?: string;
  isRequired?: boolean;
  isCritical?: boolean;
  priority?: number;
  sortOrder?: number;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  maintenanceFrequency?: string;
  expectedLifespanYears?: number;
  maintenanceNotes?: string;
  category?: string;
  icon?: string;
  color?: string;
  tags?: string;
}

export interface UpdateOramaItemRequest {
  name?: string;
  groupId?: number;
  description?: string;
  isRequired?: boolean;
  isCritical?: boolean;
  priority?: number;
  sortOrder?: number;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  maintenanceFrequency?: string;
  expectedLifespanYears?: number;
  maintenanceNotes?: string;
  category?: string;
  icon?: string;
  color?: string;
  tags?: string;
  isActive?: boolean;
}

// File Upload DTOs
export interface FileUploadResult {
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  visitId: number;
  componentId?: number;
}

// User Management DTOs
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  languagePreference?: string;
  timeZone?: string;
}

export interface UpdateThemeRequest {
  theme: 'light' | 'dark' | 'system';
}

export interface UserSearchRequest {
  searchTerm?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UpdateUserStatusRequest {
  isActive?: boolean;
  isLocked?: boolean;
  lockoutEnd?: string;
}

export interface BulkUserOperationRequest {
  operation: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'delete';
  userIds: string[];
  lockoutEnd?: string;
}

// Visit Management DTOs
export interface UpdateVisitStatusRequest {
  status: VisitStatus;
  adminComments?: string;
  rejectionReason?: string;
}

export interface VisitSearchRequest {
  siteId?: number;
  userId?: string;
  status?: VisitStatus;
  priority?: VisitPriority;
  type?: VisitType;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Health monitoring types
export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
}

export interface DetailedHealthStatus extends HealthStatus {
  services: Record<string, string>;
}

// Test and debug types
export interface UserInfo {
  userId: string;
  email: string;
  isAdmin: boolean;
  isEngineer: boolean;
  roles: string[];
}

export interface OwnershipCheck {
  visitId: number;
  userId: string;
  isAdmin: boolean;
  canAccess: boolean;
}

// API Client class
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL?: string) {
    // Use environment variable if available, otherwise use the provided baseURL or default
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.10:5247/api';
    console.log(`API Client initialized with base URL: ${this.baseURL}`);
    console.log(`Environment VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL || 'not set'}`);
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`API request attempt ${attempt}/${retries}: ${url}`);
        console.log('Request headers:', headers);
        console.log('Request body:', options.body);
        
        const response = await fetch(url, {
          ...options,
          headers,
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!response.ok) {
          // For 404 errors, provide more specific debugging information
          if (response.status === 404) {
            console.error(`404 Not Found: ${url}`);
            console.error('This usually means the API endpoint does not exist or the backend is not running.');
            console.error('Please check:');
            console.error('1. Is the backend API running?');
            console.error('2. Is the API base URL correct?');
            console.error('3. Does the endpoint exist in the backend?');
            throw new Error(`API endpoint not found: ${endpoint}. Please check if the backend is running and the URL is correct.`);
          }
          
          // For other errors, try to parse JSON if possible
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.error('Error response data:', data);
            let errorMsg = data.message;
            if (!errorMsg && data.errors) {
              if (Array.isArray(data.errors)) {
                errorMsg = data.errors.join(', ');
              } else if (typeof data.errors === 'string') {
                errorMsg = data.errors;
              } else {
                errorMsg = JSON.stringify(data.errors);
              }
            }
            throw new Error(errorMsg || `HTTP error! status: ${response.status}`);
          } else {
            // For non-JSON responses (like HTML error pages)
            const text = await response.text();
            console.error(`Non-JSON response received: ${contentType || 'unknown content type'}`);
            console.error(`Response text: ${text.substring(0, 500)}...`);
            throw new Error(`Server returned ${response.status} with content type: ${contentType || 'unknown'}. This usually means the backend is not running or the URL is incorrect.`);
          }
        }

        // Check content type for successful responses
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Expected JSON response but got ${contentType || 'unknown content type'} for URL: ${url}`);
          const text = await response.text();
          console.error(`Response text: ${text.substring(0, 200)}...`);
          throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
        }

        const data = await response.json();
        console.log(`API request successful: ${url}`);
        console.log('Response data:', data);
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format: expected an object');
        }
        
        if (data.success === undefined) {
          console.warn('Response does not have success property, assuming success');
          return { success: true, message: 'Success', data: data };
        }
        
        return data;
      } catch (error) {
        console.error(`API request failed (attempt ${attempt}/${retries}):`, error);
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('4')) {
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          // Handle network errors
          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the server. Please check your internet connection and ensure the backend API is running.');
          }
          
          // Handle JSON parsing errors
          if (error instanceof SyntaxError) {
            throw new Error('Invalid response from server. Please try again.');
          }
          
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw new Error('Request failed after all retry attempts');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refresh token');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data.email),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async resetPassword(data: ResetPasswordRequest & { email: string }): Promise<ApiResponse<void>> {
    const body = {
      email: data.email,
      token: data.token,
      newPassword: data.newPassword
    };
    return this.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async confirmEmail(userId: string, token: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/confirm-email', {
      method: 'POST',
      body: JSON.stringify({ userId, token }),
    });
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile');
  }

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateTheme(theme: 'light' | 'dark' | 'system'): Promise<ApiResponse<void>> {
    return this.request<void>('/users/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme }),
    });
  }

  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/users/check-email?email=${encodeURIComponent(email)}`);
  }

  async checkUsernameExists(userName: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/users/check-username?userName=${encodeURIComponent(userName)}`);
  }

  // Admin User Management endpoints
  async getAllUsers(page: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    return this.request<PaginatedResponse<User>>(`/users?${params}`);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  async getUsersByRole(role: UserRole): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(`/users/by-role/${role}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserStatus(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}/status`);
  }

  async updateUserStatus(id: string, status: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  }

  async searchUsers(searchDto: any): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.request<PaginatedResponse<User>>('/users/search', {
      method: 'POST',
      body: JSON.stringify(searchDto),
    });
  }

  async getUserStatistics(): Promise<ApiResponse<any>> {
    return this.request<any>('/users/statistics');
  }

  async getUserActivity(page: number = 1, pageSize: number = 10): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    return this.request<any[]>(`/users/activity?${params}`);
  }

  async bulkUserOperation(operation: BulkUserOperationRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/users/bulk-operation', {
      method: 'POST',
      body: JSON.stringify(operation),
    });
  }

  async lockUser(id: string, lockoutEnd?: string): Promise<ApiResponse<void>> {
    const params = lockoutEnd ? `?lockoutEnd=${lockoutEnd}` : '';
    return this.request<void>(`/users/${id}/lock${params}`, {
      method: 'POST',
    });
  }

  async unlockUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}/unlock`, {
      method: 'POST',
    });
  }

  async activateUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async resetUserLoginAttempts(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}/reset-login-attempts`, {
      method: 'POST',
    });
  }

  // Sites endpoints
  async getSites(page: number = 1, pageSize: number = 10, search?: string): Promise<ApiResponse<PaginatedResponse<Site>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) params.append('search', search);

    return this.request<PaginatedResponse<Site>>(`/sites?${params}`);
  }

  async searchSites(filters: any): Promise<ApiResponse<PaginatedResponse<Site>>> {
    return this.request<PaginatedResponse<Site>>('/sites/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async getSiteById(id: number): Promise<ApiResponse<Site>> {
    return this.request<Site>(`/sites/${id}`);
  }

  async createSite(data: CreateSiteRequest): Promise<ApiResponse<Site>> {
    return this.request<Site>('/sites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSite(id: number, data: Partial<CreateSiteRequest>): Promise<ApiResponse<Site>> {
    return this.request<Site>(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSite(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/sites/${id}`, {
      method: 'DELETE',
    });
  }

  // Visits endpoints
  async getVisits(page: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedResponse<Visit>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return this.request<PaginatedResponse<Visit>>(`/visits?${params}`);
  }

  async searchVisits(searchDto: VisitSearchRequest): Promise<ApiResponse<PaginatedResponse<Visit>>> {
    return this.request<PaginatedResponse<Visit>>('/visits/search', {
      method: 'POST',
      body: JSON.stringify(searchDto),
    });
  }

  async getMyVisits(): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>('/visits/my-visits');
  }

  async getVisitById(id: number): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/visits/${id}`);
  }

  async createVisit(data: CreateVisitRequest): Promise<ApiResponse<Visit>> {
    return this.request<Visit>('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVisitStatus(id: number, status: VisitStatus, adminComments?: string, rejectionReason?: string): Promise<ApiResponse<Visit>> {
    const updateDto: UpdateVisitStatusRequest = {
      status,
      adminComments,
      rejectionReason,
    };
    return this.request<Visit>(`/visits/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateDto),
    });
  }

  async deleteVisit(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/visits/${id}`, {
      method: 'DELETE',
    });
  }

  // Orama endpoints
  async getOramaGroups(): Promise<ApiResponse<OramaGroup[]>> {
    return this.request<OramaGroup[]>('/orama/groups');
  }

  async getOramaItems(): Promise<ApiResponse<OramaItem[]>> {
    return this.request<OramaItem[]>('/orama/items');
  }

  async getOramaItemsByGroup(groupId: number): Promise<ApiResponse<OramaItem[]>> {
    return this.request<OramaItem[]>(`/orama/groups/${groupId}/items`);
  }

  async getOramaGroupById(id: number): Promise<ApiResponse<OramaGroup>> {
    return this.request<OramaGroup>(`/orama/groups/${id}`);
  }

  async getOramaItemById(id: number): Promise<ApiResponse<OramaItem>> {
    return this.request<OramaItem>(`/orama/items/${id}`);
  }

  async createOramaGroup(name: string): Promise<ApiResponse<OramaGroup>> {
    return this.request<OramaGroup>('/orama/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async createOramaGroupWithDetails(data: CreateOramaGroupRequest): Promise<ApiResponse<OramaGroup>> {
    return this.request<OramaGroup>('/orama/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOramaGroup(id: number, name: string): Promise<ApiResponse<OramaGroup>> {
    return this.request<OramaGroup>(`/orama/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async updateOramaGroupWithDetails(id: number, data: UpdateOramaGroupRequest): Promise<ApiResponse<OramaGroup>> {
    return this.request<OramaGroup>(`/orama/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOramaGroup(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/orama/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async createOramaItem(name: string, groupId: number): Promise<ApiResponse<OramaItem>> {
    return this.request<OramaItem>('/orama/items', {
      method: 'POST',
      body: JSON.stringify({ name, groupId }),
    });
  }

  async createOramaItemWithDetails(data: CreateOramaItemRequest): Promise<ApiResponse<OramaItem>> {
    return this.request<OramaItem>('/orama/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOramaItem(id: number, name: string, groupId: number): Promise<ApiResponse<OramaItem>> {
    return this.request<OramaItem>(`/orama/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, groupId }),
    });
  }

  async updateOramaItemWithDetails(id: number, data: UpdateOramaItemRequest): Promise<ApiResponse<OramaItem>> {
    return this.request<OramaItem>(`/orama/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOramaItem(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/orama/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Visit Components endpoints
  async getVisitComponents(visitId: number): Promise<ApiResponse<VisitComponent[]>> {
    return this.request<VisitComponent[]>(`/visitcomponents/visit/${visitId}`);
  }

  async updateVisitComponent(componentId: number, comments: string): Promise<ApiResponse<VisitComponent>> {
    return this.request<VisitComponent>(`/visitcomponents/${componentId}`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  async uploadComponentImage(
    componentId: number,
    imageType: 'before' | 'after',
    file: File
  ): Promise<ApiResponse<VisitComponent>> {
    const formData = new FormData();
    formData.append('componentId', componentId.toString());
    formData.append('imageType', imageType);
    formData.append('image', file);

    return fetch(`${this.baseURL}/visitcomponents/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    }).then(response => response.json());
  }

  async getVisitReport(visitId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/visitcomponents/visit/${visitId}/report`);
  }

  async getFinalReport(visitId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/visitcomponents/visit/${visitId}/final-report`);
  }

  // Dashboard analytics endpoints
  async getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
    return this.request<DashboardOverview>('/dashboard/overview');
  }

  async getAdminDashboard(): Promise<ApiResponse<AdminDashboard>> {
    return this.request<AdminDashboard>('/dashboard/admin');
  }

  async getEngineerDashboard(): Promise<ApiResponse<EngineerDashboard>> {
    return this.request<EngineerDashboard>('/dashboard/engineer');
  }

  async getDashboardStats(params?: Record<string, any>): Promise<ApiResponse<DashboardStats>> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<DashboardStats>(`/dashboard/stats${query}`);
  }

  async getDashboardCharts(params?: Record<string, any>): Promise<ApiResponse<DashboardCharts>> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<DashboardCharts>(`/dashboard/charts${query}`);
  }

  // Admin endpoints
  async getPendingVisits(): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>('/admin/visits/pending');
  }

  async acceptVisit(visitId: number): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/admin/visits/${visitId}/accept`, {
      method: 'PUT',
    });
  }

  async rejectVisit(visitId: number): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/admin/visits/${visitId}/reject`, {
      method: 'PUT',
    });
  }

  // Admin endpoints
  async getAdminDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/dashboard/stats');
  }

  async getRecentVisits(count: number = 10): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>(`/admin/visits/recent?count=${count}`);
  }

  async getVisitsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Visit[]>> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return this.request<Visit[]>(`/admin/visits/by-date-range?${params}`);
  }

  async getAllOramaGroups(): Promise<ApiResponse<OramaGroup[]>> {
    return this.request<OramaGroup[]>('/admin/orama/groups');
  }

  async getAllOramaItems(): Promise<ApiResponse<OramaItem[]>> {
    return this.request<OramaItem[]>('/admin/orama/items');
  }

  async createOramaGroupAdmin(name: string): Promise<ApiResponse<OramaGroup>> {
    return this.request<OramaGroup>('/admin/orama/groups', {
      method: 'POST',
      body: JSON.stringify(name),
    });
  }

  async createOramaItemAdmin(name: string, groupId: number): Promise<ApiResponse<OramaItem>> {
    return this.request<OramaItem>('/admin/orama/items', {
      method: 'POST',
      body: JSON.stringify({ name, groupId }),
    });
  }

  // File Upload endpoints
  async uploadVisitImage(file: File, visitId: number, componentId?: number): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visitId', visitId.toString());
    if (componentId) {
      formData.append('componentId', componentId.toString());
    }

    return fetch(`${this.baseURL}/fileupload/visit-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    }).then(response => response.json());
  }

  async uploadVisitImages(files: File[], visitId: number, componentId?: number): Promise<ApiResponse<any[]>> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('visitId', visitId.toString());
    if (componentId) {
      formData.append('componentId', componentId.toString());
    }

    return fetch(`${this.baseURL}/fileupload/visit-images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    }).then(response => response.json());
  }

  async deleteVisitImage(fileName: string, visitId: number): Promise<ApiResponse<void>> {
    const params = new URLSearchParams({
      fileName,
      visitId: visitId.toString(),
    });
    return this.request<void>(`/fileupload/visit-image?${params}`, {
      method: 'DELETE',
    });
  }

  // Health monitoring endpoints
  async getHealthStatus(): Promise<ApiResponse<HealthStatus>> {
    return this.request<HealthStatus>('/health');
  }

  async getDetailedHealthStatus(): Promise<ApiResponse<DetailedHealthStatus>> {
    return this.request<DetailedHealthStatus>('/health/detailed');
  }

  // Test and debug endpoints
  async testAdminAccess(): Promise<ApiResponse<string>> {
    return this.request<string>('/test/admin-only');
  }

  async testEngineerAccess(): Promise<ApiResponse<string>> {
    return this.request<string>('/test/engineer-only');
  }

  async testAdminOrEngineerAccess(): Promise<ApiResponse<string>> {
    return this.request<string>('/test/admin-or-engineer');
  }

  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return this.request<UserInfo>('/test/user-info');
  }

  async checkVisitOwnership(visitId: number): Promise<ApiResponse<OwnershipCheck>> {
    return this.request<OwnershipCheck>(`/test/visit-ownership/${visitId}`);
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout(refreshToken?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Logout warning:', errorData.message);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Don't throw error for logout - we want to clear local storage anyway
    }
  }

  // Enhanced Visit endpoints
  async getVisitDetails(id: number): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/visits/${id}/details`);
  }

  async getVisitsBySite(siteId: number): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>(`/visits/by-site/${siteId}`);
  }

  async getVisitsByStatus(status: VisitStatus): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>(`/visits/by-status/${status}`);
  }

  async startVisit(visitId: number): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/visits/${visitId}/start`, {
      method: 'PUT',
    });
  }

  async completeVisit(visitId: number): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/visits/${visitId}/complete`, {
      method: 'PUT',
    });
  }

  async getOverdueVisits(): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>('/visits/overdue');
  }

  async getScheduledVisits(): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>('/visits/scheduled');
  }

  async getVisitsByPriority(priority: VisitPriority): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>(`/visits/by-priority/${priority}`);
  }

  async getVisitsByType(type: VisitType): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>(`/visits/by-type/${type}`);
  }

  async updateVisit(id: number, data: Partial<CreateVisitRequest>): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Enhanced Site endpoints
  async getSiteDetails(id: number): Promise<ApiResponse<SiteDetail>> {
    return this.request<SiteDetail>(`/sites/${id}/details`);
  }

  async checkSiteCodeExists(code: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/sites/code-exists/${code}`);
  }

  async getSitesByLocation(location: string): Promise<ApiResponse<Site[]>> {
    return this.request<Site[]>(`/sites/by-location/${encodeURIComponent(location)}`);
  }

  async updateSiteStatus(id: number, status: SiteStatus): Promise<ApiResponse<Site>> {
    return this.request<Site>(`/sites/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getSiteStatistics(): Promise<ApiResponse<any>> {
    return this.request<any>('/sites/statistics');
  }

  async getSitesByStatus(status: SiteStatus): Promise<ApiResponse<Site[]>> {
    return this.request<Site[]>(`/sites/by-status/${status}`);
  }

  async checkSiteAccessibility(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/sites/${id}/accessible`);
  }

  async getMaintenanceSites(): Promise<ApiResponse<Site[]>> {
    return this.request<Site[]>('/sites/maintenance');
  }

  async bulkUpdateSiteStatus(siteIds: number[], status: SiteStatus): Promise<ApiResponse<void>> {
    return this.request<void>('/sites/bulk-status', {
      method: 'PUT',
      body: JSON.stringify({ siteIds, status }),
    });
  }

  async getAdminSites(): Promise<ApiResponse<Site[]>> {
    return this.request<Site[]>('/sites/admin');
  }

  // Enhanced User Management endpoints
  async updateUserTheme(theme: 'light' | 'dark' | 'system'): Promise<ApiResponse<void>> {
    return this.request<void>('/users/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme }),
    });
  }

  // Enhanced Site endpoints
}

// Export singleton instance
export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);
