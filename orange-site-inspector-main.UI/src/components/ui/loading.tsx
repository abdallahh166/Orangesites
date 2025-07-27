import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  text = 'Loading...', 
  size = 'md', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {content}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-24" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const GridSkeleton: React.FC<{ items?: number; columns?: number }> = ({ 
  items = 6, 
  columns = 3 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}; 