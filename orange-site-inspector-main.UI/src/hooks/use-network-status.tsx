import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api';

interface NetworkStatus {
  isOnline: boolean;
  isApiHealthy: boolean;
  lastChecked: Date | null;
  error: string | null;
}

interface ApiHealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  services?: Record<string, string>;
}

export const useNetworkStatus = (checkInterval: number = 30000) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isApiHealthy: true,
    lastChecked: null,
    error: null,
  });

  const apiClient = new ApiClient();

  const checkApiHealth = useCallback(async () => {
    try {
      const response = await apiClient.getHealthStatus();
      const isHealthy = response.success && response.data.status === 'Healthy';
      
      setNetworkStatus(prev => ({
        ...prev,
        isApiHealthy: isHealthy,
        lastChecked: new Date(),
        error: isHealthy ? null : 'API is not responding properly',
      }));
    } catch (error) {
      setNetworkStatus(prev => ({
        ...prev,
        isApiHealthy: false,
        lastChecked: new Date(),
        error: 'Failed to connect to API',
      }));
    }
  }, []);

  const checkDetailedApiHealth = useCallback(async (): Promise<ApiHealthStatus | null> => {
    try {
      const response = await apiClient.getDetailedHealthStatus();
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        error: null,
      }));
      // Check API health when coming back online
      checkApiHealth();
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        isApiHealthy: false,
        error: 'No internet connection',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkApiHealth]);

  // Periodic API health checks
  useEffect(() => {
    // Initial check
    checkApiHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkApiHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkApiHealth, checkInterval]);

  const refreshStatus = useCallback(() => {
    checkApiHealth();
  }, [checkApiHealth]);

  const isFullyConnected = networkStatus.isOnline && networkStatus.isApiHealthy;

  return {
    ...networkStatus,
    isFullyConnected,
    checkApiHealth,
    checkDetailedApiHealth,
    refreshStatus,
  };
}; 