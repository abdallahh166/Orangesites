import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Shield, User, Lock, Copy, Eye } from 'lucide-react';
import { apiClient, UserInfo, OwnershipCheck } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const TestDebug = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [ownershipCheck, setOwnershipCheck] = useState<OwnershipCheck | null>(null);
  const [visitId, setVisitId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [rawJson, setRawJson] = useState<string | null>(null);

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, message: result.data || result.message || 'Success' }
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, message: err.message || 'Test failed' }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAdminAccess = () => runTest('adminAccess', () => apiClient.testAdminAccess());
  const testEngineerAccess = () => runTest('engineerAccess', () => apiClient.testEngineerAccess());
  const testAdminOrEngineerAccess = () => runTest('adminOrEngineerAccess', () => apiClient.testAdminOrEngineerAccess());
  const testUserInfo = () => runTest('userInfo', () => apiClient.getUserInfo());

  const testVisitOwnership = async () => {
    if (!visitId) {
      setError('Please enter a visit ID');
      return;
    }
    await runTest('visitOwnership', () => apiClient.checkVisitOwnership(parseInt(visitId)));
  };

  const getTestIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getTestBadge = (success: boolean) => {
    return success ? 
      <Badge variant="default" className="bg-green-500">Passed</Badge> : 
      <Badge variant="destructive">Failed</Badge>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Response copied to clipboard.' });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the test and debug tools.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test & Debug Tools</h1>
        <p className="text-muted-foreground">
          Test authorization policies and API functionality
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authorization Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authorization Tests
            </CardTitle>
            <CardDescription>
              Test role-based access control and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Admin Access Test:</span>
                <Button 
                  size="sm" 
                  onClick={testAdminAccess} 
                  disabled={loading || user.role !== 'Admin'}
                >
                  Test
                </Button>
              </div>
              {testResults.adminAccess && (
                <div className="flex items-center gap-2 text-sm">
                  {getTestIcon(testResults.adminAccess.success)}
                  {getTestBadge(testResults.adminAccess.success)}
                  <span className="text-muted-foreground">{testResults.adminAccess.message}</span>
                  <Button size="icon" variant="ghost" onClick={() => setRawJson(JSON.stringify(testResults.adminAccess, null, 2))}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(JSON.stringify(testResults.adminAccess))}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Engineer Access Test:</span>
                <Button 
                  size="sm" 
                  onClick={testEngineerAccess} 
                  disabled={loading || user.role !== 'Engineer'}
                >
                  Test
                </Button>
              </div>
              {testResults.engineerAccess && (
                <div className="flex items-center gap-2 text-sm">
                  {getTestIcon(testResults.engineerAccess.success)}
                  {getTestBadge(testResults.engineerAccess.success)}
                  <span className="text-muted-foreground">{testResults.engineerAccess.message}</span>
                  <Button size="icon" variant="ghost" onClick={() => setRawJson(JSON.stringify(testResults.engineerAccess, null, 2))}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(JSON.stringify(testResults.engineerAccess))}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Admin or Engineer Access Test:</span>
                <Button 
                  size="sm" 
                  onClick={testAdminOrEngineerAccess} 
                  disabled={loading}
                >
                  Test
                </Button>
              </div>
              {testResults.adminOrEngineerAccess && (
                <div className="flex items-center gap-2 text-sm">
                  {getTestIcon(testResults.adminOrEngineerAccess.success)}
                  {getTestBadge(testResults.adminOrEngineerAccess.success)}
                  <span className="text-muted-foreground">{testResults.adminOrEngineerAccess.message}</span>
                  <Button size="icon" variant="ghost" onClick={() => setRawJson(JSON.stringify(testResults.adminOrEngineerAccess, null, 2))}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(JSON.stringify(testResults.adminOrEngineerAccess))}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Current user details and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Get User Info:</span>
              <Button size="sm" onClick={testUserInfo} disabled={loading}>
                Test
              </Button>
            </div>
            
            {testResults.userInfo && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {getTestIcon(testResults.userInfo.success)}
                  {getTestBadge(testResults.userInfo.success)}
                </div>
                {testResults.userInfo.success && (
                  <div className="text-sm space-y-1 bg-muted p-3 rounded">
                    <div><strong>User ID:</strong> {userInfo?.userId}</div>
                    <div><strong>Email:</strong> {userInfo?.email}</div>
                    <div><strong>Is Admin:</strong> {userInfo?.isAdmin ? 'Yes' : 'No'}</div>
                    <div><strong>Is Engineer:</strong> {userInfo?.isEngineer ? 'Yes' : 'No'}</div>
                    <div><strong>Roles:</strong> {userInfo?.roles.join(', ')}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visit Ownership Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Visit Ownership Test
            </CardTitle>
            <CardDescription>
              Test visit access permissions and ownership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visitId">Visit ID:</Label>
              <div className="flex gap-2">
                <Input
                  id="visitId"
                  type="number"
                  placeholder="Enter visit ID"
                  value={visitId}
                  onChange={(e) => setVisitId(e.target.value)}
                />
                <Button onClick={testVisitOwnership} disabled={loading || !visitId}>
                  Test
                </Button>
              </div>
            </div>

            {testResults.visitOwnership && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {getTestIcon(testResults.visitOwnership.success)}
                  {getTestBadge(testResults.visitOwnership.success)}
                </div>
                {testResults.visitOwnership.success && ownershipCheck && (
                  <div className="text-sm space-y-1 bg-muted p-3 rounded">
                    <div><strong>Visit ID:</strong> {ownershipCheck.visitId}</div>
                    <div><strong>User ID:</strong> {ownershipCheck.userId}</div>
                    <div><strong>Is Admin:</strong> {ownershipCheck.isAdmin ? 'Yes' : 'No'}</div>
                    <div><strong>Can Access:</strong> {ownershipCheck.canAccess ? 'Yes' : 'No'}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current User Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Summary</CardTitle>
            <CardDescription>
              Your current authentication and role information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User ID:</span>
                <span className="text-sm">{user.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Username:</span>
                <span className="text-sm">{user.userName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Full Name:</span>
                <span className="text-sm">{user.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Role:</span>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex gap-2">
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {user.isLocked && <Badge variant="destructive">Locked</Badge>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email Confirmed:</span>
                <Badge variant={user.emailConfirmed ? "default" : "secondary"}>
                  {user.emailConfirmed ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {rawJson && (
        <Dialog open={!!rawJson} onOpenChange={() => setRawJson(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Raw JSON Response</DialogTitle>
            </DialogHeader>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-96">{rawJson}</pre>
            <Button onClick={() => copyToClipboard(rawJson)} size="sm" className="mt-2">
              <Copy className="h-4 w-4 mr-2" /> Copy JSON
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TestDebug; 