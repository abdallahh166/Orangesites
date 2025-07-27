import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, AlertTriangle } from 'lucide-react';

interface DebugInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  timestamp: string;
  url: string;
  errors: string[];
  warnings: string[];
}

export const DebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    userAgent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    timestamp: new Date().toISOString(),
    url: window.location.href,
    errors: [],
    warnings: []
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for window resize
    const handleResize = () => {
      setDebugInfo(prev => ({
        ...prev,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }));
    };

    window.addEventListener('resize', handleResize);

    // Capture console errors and warnings
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const errorMessage = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, errorMessage]
      }));
      
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const warningMessage = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      setDebugInfo(prev => ({
        ...prev,
        warnings: [...prev.warnings, warningMessage]
      }));
      
      originalWarn.apply(console, args);
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const copyDebugInfo = () => {
    const debugText = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(debugText);
  };

  const refreshDebugInfo = () => {
    setDebugInfo({
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      timestamp: new Date().toISOString(),
      url: window.location.href,
      errors: debugInfo.errors,
      warnings: debugInfo.warnings
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <Card className="shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug Information</CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={copyDebugInfo}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                onClick={refreshDebugInfo}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 text-xs max-h-64 overflow-y-auto">
            <div>
              <strong>Viewport:</strong> {debugInfo.viewport.width} × {debugInfo.viewport.height}
            </div>
            <div>
              <strong>URL:</strong> {debugInfo.url}
            </div>
            <div>
              <strong>Timestamp:</strong> {debugInfo.timestamp}
            </div>
            
            {debugInfo.errors.length > 0 && (
              <div>
                <strong className="text-red-600">Errors ({debugInfo.errors.length}):</strong>
                <div className="mt-1 space-y-1">
                  {debugInfo.errors.slice(-3).map((error, index) => (
                    <div key={index} className="text-red-500 bg-red-50 dark:bg-red-900/20 p-1 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {debugInfo.warnings.length > 0 && (
              <div>
                <strong className="text-yellow-600">Warnings ({debugInfo.warnings.length}):</strong>
                <div className="mt-1 space-y-1">
                  {debugInfo.warnings.slice(-3).map((warning, index) => (
                    <div key={index} className="text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-1 rounded">
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <strong>User Agent:</strong>
              <div className="mt-1 text-gray-600 dark:text-gray-400 break-all">
                {debugInfo.userAgent}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 