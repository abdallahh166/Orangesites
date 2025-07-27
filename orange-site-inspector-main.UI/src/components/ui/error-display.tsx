import React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft, Wifi, WifiOff, Server, Database, FileText, User, Settings } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { useNavigate } from 'react-router-dom';

export interface ErrorInfo {
  type: 'network' | 'server' | 'auth' | 'permission' | 'not-found' | 'validation' | 'unknown';
  title: string;
  message: string;
  details?: string;
  code?: string;
  timestamp?: Date;
  retry?: () => void;
  actions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  icon?: React.ReactNode;
}

interface ErrorDisplayProps {
  error: ErrorInfo;
  className?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ 
  error, 
  className = "", 
  showDetails = false,
  onRetry,
  onDismiss 
}: ErrorDisplayProps) {
  const navigate = useNavigate();

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <WifiOff className="h-8 w-8 text-red-500" />;
      case 'server':
        return <Server className="h-8 w-8 text-orange-500" />;
      case 'auth':
        return <User className="h-8 w-8 text-blue-500" />;
      case 'permission':
        return <Settings className="h-8 w-8 text-purple-500" />;
      case 'not-found':
        return <FileText className="h-8 w-8 text-gray-500" />;
      case 'validation':
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'network':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'server':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
      case 'auth':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'permission':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
      case 'not-found':
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
      case 'validation':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default:
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    }
  };

  const getDefaultActions = (): ErrorAction[] => {
    const actions: ErrorAction[] = [];

    if (error.type === 'network' || error.type === 'server') {
      actions.push({
        label: 'Retry',
        action: () => {
          if (onRetry) onRetry();
          else if (error.retry) error.retry();
        },
        variant: 'default',
        icon: <RefreshCw className="h-4 w-4" />
      });
    }

    if (error.type === 'auth') {
      actions.push({
        label: 'Login',
        action: () => navigate('/login'),
        variant: 'default',
        icon: <User className="h-4 w-4" />
      });
    }

    if (error.type === 'permission') {
      actions.push({
        label: 'Go Home',
        action: () => navigate('/dashboard'),
        variant: 'outline',
        icon: <Home className="h-4 w-4" />
      });
    }

    actions.push({
      label: 'Go Back',
      action: () => navigate(-1),
      variant: 'outline',
      icon: <ArrowLeft className="h-4 w-4" />
    });

    return actions;
  };

  const actions = error.actions || getDefaultActions();

  return (
    <Card className={`${getErrorColor()} ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          {getErrorIcon()}
          <div className="flex-1">
            <CardTitle className="text-lg">{error.title}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {error.type.toUpperCase()}
              </Badge>
              {error.code && (
                <Badge variant="outline" className="text-xs">
                  {error.code}
                </Badge>
              )}
              {error.timestamp && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {error.timestamp.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
        
        {showDetails && error.details && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Technical Details:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{error.details}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.action}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Network Status Component
interface NetworkStatusProps {
  isOnline: boolean;
  className?: string;
}

export function NetworkStatus({ isOnline, className = "" }: NetworkStatusProps) {
  if (isOnline) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">
              You're offline
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Error Boundary Fallback
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void;
}) {
  const errorInfo: ErrorInfo = {
    type: 'unknown',
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try refreshing the page.',
    details: error.message,
    timestamp: new Date(),
    retry: resetErrorBoundary,
    actions: [
      {
        label: 'Refresh Page',
        action: () => window.location.reload(),
        variant: 'default',
        icon: <RefreshCw className="h-4 w-4" />
      },
      {
        label: 'Go Home',
        action: () => window.location.href = '/dashboard',
        variant: 'outline',
        icon: <Home className="h-4 w-4" />
      }
    ]
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorDisplay error={errorInfo} showDetails={process.env.NODE_ENV === 'development'} />
      </div>
    </div>
  );
}

// Common Error Types
export const CommonErrors = {
  network: (retry?: () => void): ErrorInfo => ({
    type: 'network',
    title: 'Connection Lost',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    timestamp: new Date(),
    retry
  }),

  server: (retry?: () => void): ErrorInfo => ({
    type: 'server',
    title: 'Server Error',
    message: 'The server encountered an error. Please try again in a few moments.',
    timestamp: new Date(),
    retry
  }),

  auth: (): ErrorInfo => ({
    type: 'auth',
    title: 'Authentication Required',
    message: 'Please log in to access this resource.',
    timestamp: new Date()
  }),

  permission: (): ErrorInfo => ({
    type: 'permission',
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    timestamp: new Date()
  }),

  notFound: (resource: string): ErrorInfo => ({
    type: 'not-found',
    title: `${resource} Not Found`,
    message: `The ${resource.toLowerCase()} you're looking for doesn't exist or has been moved.`,
    timestamp: new Date()
  }),

  validation: (field?: string): ErrorInfo => ({
    type: 'validation',
    title: 'Invalid Input',
    message: field 
      ? `Please check the ${field} field and try again.`
      : 'Please check your input and try again.',
    timestamp: new Date()
  }),

  database: (retry?: () => void): ErrorInfo => ({
    type: 'server',
    title: 'Database Error',
    message: 'Unable to access the database. Please try again.',
    timestamp: new Date(),
    retry
  })
}; 