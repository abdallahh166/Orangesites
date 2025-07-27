import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/config/env';

export default function TestPage() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Health check (no auth required)
      console.log('Testing health endpoint...');
      const healthResponse = await apiClient.getHealthStatus();
      results.health = healthResponse;
      console.log('Health response:', healthResponse);

      // Test 2: Sites statistics (if authenticated)
      if (isAuthenticated) {
        console.log('Testing sites statistics...');
        const statsResponse = await apiClient.getSiteStatistics();
        results.statistics = statsResponse;
        console.log('Statistics response:', statsResponse);
      }

      // Test 3: Sites list (if authenticated)
      if (isAuthenticated) {
        console.log('Testing sites list...');
        const sitesResponse = await apiClient.getSites();
        results.sites = sitesResponse;
        console.log('Sites response:', sitesResponse);
      }

    } catch (error: any) {
      console.error('Test error:', error);
      results.error = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  const testSimpleConnection = async () => {
    setLoading(true);
    try {
      // Simple fetch test
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.text();
      setTestResults({
        simpleTest: {
          status: response.status,
          statusText: response.statusText,
          data: data.substring(0, 200) + '...',
          headers: Object.fromEntries(response.headers.entries())
        }
      });
    } catch (error: any) {
      setTestResults({
        simpleTest: {
          error: error.message
        }
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Authentication Status</h3>
              <p>Is Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              {user && (
                <div className="mt-2">
                  <p>User: {user.fullName}</p>
                  <p>Role: {user.role}</p>
                  <p>Email: {user.email}</p>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">API Configuration</h3>
              <p>Base URL: {import.meta.env.VITE_API_BASE_URL}</p>
              <p>Environment: {import.meta.env.MODE}</p>
              <p>API Client Base URL: {apiClient['baseURL'] || 'Not accessible'}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={testSimpleConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Simple Connection'}
            </Button>
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run Full API Tests'}
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Results</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 