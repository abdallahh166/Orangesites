import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { apiClient, HealthStatus, DetailedHealthStatus } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const HealthMonitor = () => {
  const { user } = useAuth();
  const [basicHealth, setBasicHealth] = useState<HealthStatus | null>(null);
  const [detailedHealth, setDetailedHealth] = useState<DetailedHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [basicRes, detailedRes] = await Promise.all([
        apiClient.getHealthStatus(),
        apiClient.getDetailedHealthStatus()
      ]);

      if (basicRes.success) {
        setBasicHealth(basicRes.data);
      }

      if (detailedRes.success) {
        setDetailedHealth(detailedRes.data);
      }

      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-500">Degraded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Health monitoring is only available to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitor</h1>
          <p className="text-muted-foreground">
            Monitor API status and system health in real-time
          </p>
        </div>
        <Button onClick={fetchHealthData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {lastChecked && (
        <p className="text-sm text-muted-foreground">
          Last checked: {lastChecked.toLocaleString()}
        </p>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Health Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {basicHealth && getStatusIcon(basicHealth.status)}
              Basic Health Status
            </CardTitle>
            <CardDescription>
              Overall API health and status information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {basicHealth ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(basicHealth.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Version:</span>
                  <span className="text-sm">{basicHealth.version}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Environment:</span>
                  <Badge variant="outline">{basicHealth.environment}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Timestamp:</span>
                  <span className="text-sm">{formatTimestamp(basicHealth.timestamp)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                {loading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Health Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {detailedHealth && getStatusIcon(detailedHealth.status)}
              Detailed Health Status
            </CardTitle>
            <CardDescription>
              Service-specific health information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailedHealth ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Overall Status:</span>
                  {getStatusBadge(detailedHealth.status)}
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Services:</h4>
                  {Object.entries(detailedHealth.services).map(([service, status]) => (
                    <div key={service} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{service}:</span>
                      {getStatusBadge(status)}
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Version:</span>
                  <span className="text-sm">{detailedHealth.version}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Environment:</span>
                  <Badge variant="outline">{detailedHealth.environment}</Badge>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                {loading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Additional system details and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">API Configuration</h4>
              <div className="text-sm space-y-1">
                <div>Base URL: {import.meta.env.VITE_API_BASE_URL || 'Default'}</div>
                <div>Environment: {import.meta.env.MODE}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">User Information</h4>
              <div className="text-sm space-y-1">
                <div>Role: {user.role}</div>
                <div>Email: {user.email}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Browser Information</h4>
              <div className="text-sm space-y-1">
                <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthMonitor; 