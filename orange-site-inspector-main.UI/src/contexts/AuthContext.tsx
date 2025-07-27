import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient, User, AuthResponse, UserRole } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: {
    userName: string;
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  resetPassword: (data: { email: string; token: string; newPassword: string; confirmPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth hook to access authentication context.
 * @returns {AuthContextType}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Parses a JWT token and returns its payload.
 * @param {string} token
 * @returns {any}
 */
function parseJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 * @param {string} token
 * @returns {boolean}
 */
function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds
  return Date.now() >= payload.exp * 1000;
}

/**
 * AuthProvider wraps the app and provides authentication state and actions.
 * @param {AuthProviderProps} props
 * @returns {JSX.Element}
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Helper to wrap async actions with loading state
  const withLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      return await fn();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to store tokens securely
  const storeTokens = (accessToken: string, refreshToken: string, rememberMe: boolean) => {
    // TODO: Use httpOnly cookies for refresh tokens in production for better security
    if (rememberMe) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('rememberMe', 'true');
    } else {
      sessionStorage.setItem('authToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      localStorage.removeItem('rememberMe');
    }
    apiClient.setToken(accessToken);
  };

  // Helper to clear all tokens
  const clearTokens = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    apiClient.removeToken();
  };

  // Helper to refresh token automatically
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (!currentRefreshToken) {
        console.warn('No refresh token available');
        return false;
      }

      const response = await apiClient.refreshToken(currentRefreshToken);
      
      // Store new tokens
      storeTokens(response.token, response.refreshToken, localStorage.getItem('rememberMe') === 'true');
      
      // Update user info if available
      if (response.user) {
        setUser(response.user);
      }
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      clearTokens();
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (token) {
        if (isTokenExpired(token)) {
          // Try to refresh the token
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            clearTokens();
            setUser(null);
            setIsLoading(false);
            toast({
              title: 'Session Expired',
              description: 'Your session has expired. Please log in again.',
              variant: 'destructive',
            });
            return;
          }
          // Get the new token after refresh
          const newToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (newToken) {
            apiClient.setToken(newToken);
          }
        } else {
          apiClient.setToken(token);
        }
        
        try {
          const response = await apiClient.getUserProfile();
          if (response.success) {
            setUser(response.data);
          } else {
            clearTokens();
          }
        } catch (error) {
          console.error('Failed to get user profile:', error);
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    return withLoading(async () => {
      try {
        console.log('Attempting login for:', email);
        const response = await apiClient.login({ email, password });
        
        if (response.success) {
          const { token, refreshToken, user: userData } = response.data;
          storeTokens(token, refreshToken, rememberMe);
          
          setUser(userData);
          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.fullName || userData.userName}!`,
          });
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (error: any) {
        // Log full backend error for debugging
        if (error?.response) {
          console.error('Login error response:', error.response);
        } else {
          console.error('Login error:', error);
        }
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message) {
          if (error.message.includes('Network error')) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            errorMessage = 'Invalid email or password.';
          } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      }
    });
  };

  const register = async (data: {
    userName: string;
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => {
    return withLoading(async () => {
      try {
        const response = await apiClient.register({
          ...data,
          role: data.role || UserRole.Engineer,
        });
        if (response.success) {
          const { token, refreshToken, user: userData } = response.data;
          storeTokens(token, refreshToken, true); // Always remember for registration
          setUser(userData);
          toast({
            title: "Registration Successful",
            description: `Welcome to Orange Egypt Site Inspection, ${userData.fullName || userData.userName}!`,
          });
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        // Log full backend error for debugging
        if (error?.response) {
          console.error('Register error response:', error.response);
        } else {
          console.error('Register error:', error);
        }
        let errorMessage = error?.response?.data?.message || error.message || "Registration failed";
        const errorList = error?.response?.data?.errors;
        toast({
          title: "Registration Failed",
          description: (
            <div>
              <div>{errorMessage.split(":")[0]}</div>
              {Array.isArray(errorList) && errorList.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-left text-sm text-red-600 dark:text-red-400">
                  {errorList.map((err: string, idx: number) => <li key={idx}>{err}</li>)}
                </ul>
              )}
            </div>
          ),
          variant: "destructive",
        });
        throw error;
      }
    });
  };

  const logout = useCallback(async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (currentRefreshToken) {
        await apiClient.logout(currentRefreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      apiClient.removeToken();
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    }
  }, []);

  const updateProfile = async (data: Partial<User>) => {
    return withLoading(async () => {
      try {
        const response = await apiClient.updateUserProfile(data);
        if (response.success) {
          setUser(response.data);
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully",
          });
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast({
          title: "Update Failed",
          description: error instanceof Error ? error.message : "Failed to update profile",
          variant: "destructive",
        });
        throw error;
      }
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    return withLoading(async () => {
      try {
        const response = await apiClient.changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });
        if (response.success) {
          toast({
            title: "Password Changed",
            description: "Your password has been changed successfully",
          });
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast({
          title: "Password Change Failed",
          description: error instanceof Error ? error.message : "Failed to change password",
          variant: "destructive",
        });
        throw error;
      }
    });
  };

  const resetPassword = async (data: { email: string; token: string; newPassword: string; confirmPassword: string }) => {
    return withLoading(async () => {
      try {
        await apiClient.resetPassword({
          email: data.email,
          token: data.token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        });
        toast({
          title: 'Password Reset',
          description: 'Your password has been reset successfully.',
        });
      } catch (error: any) {
        toast({
          title: 'Password Reset Failed',
          description: error.message || 'Failed to reset password.',
          variant: 'destructive',
        });
        throw error;
      }
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
