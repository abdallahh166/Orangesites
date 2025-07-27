import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ScrollArea } from './scroll-area';
import { cn } from '@/lib/api/utils';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Toast notification component
export const Toast: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[notification.type];

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transform transition-all duration-300',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Icon
            className={cn(
              'h-5 w-5 mt-0.5',
              notification.type === 'success' && 'text-green-500',
              notification.type === 'error' && 'text-red-500',
              notification.type === 'warning' && 'text-yellow-500',
              notification.type === 'info' && 'text-blue-500'
            )}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {notification.message}
            </p>
            {notification.action && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-sm mt-2"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Notification center component
export const NotificationCenter: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    !notification.read && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                        {notification.action && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-sm mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action!.onClick();
                            }}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Notification provider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setToasts(prev => [newNotification, ...prev.slice(0, 2)]); // Keep only 3 toasts
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
      
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Notification bell component
export const NotificationBell: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { unreadCount } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}; 