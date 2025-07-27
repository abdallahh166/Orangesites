import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Skeleton, ChartSkeleton } from './skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Color palette for charts
const CHART_COLORS = {
  primary: '#f97316', // Orange
  secondary: '#3b82f6', // Blue
  success: '#10b981', // Green
  warning: '#f59e0b', // Yellow
  danger: '#ef4444', // Red
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899',
  gray: '#6b7280',
};

// Utility function to format numbers
const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

// Utility function to calculate percentage change
const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

interface ChartProps {
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
}

interface LineChartProps extends ChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: keyof typeof CHART_COLORS;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export function LineChartComponent({
  data,
  xKey,
  yKey,
  title,
  description,
  loading = false,
  color = 'primary',
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className,
}: LineChartProps) {
  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xKey} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatNumber}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [formatNumber(value), yKey]}
              />
            )}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={CHART_COLORS[color]}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS[color], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: CHART_COLORS[color], strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface AreaChartProps extends ChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: keyof typeof CHART_COLORS;
  gradient?: boolean;
}

export function AreaChartComponent({
  data,
  xKey,
  yKey,
  title,
  description,
  loading = false,
  color = 'primary',
  gradient = true,
  className,
}: AreaChartProps) {
  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatNumber} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [formatNumber(value), yKey]}
            />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={CHART_COLORS[color]}
              fill={gradient ? `url(#${color}Gradient)` : CHART_COLORS[color]}
              strokeWidth={2}
            />
            {gradient && (
              <defs>
                <linearGradient id={`${color}Gradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[color]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS[color]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface BarChartProps extends ChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: keyof typeof CHART_COLORS;
  horizontal?: boolean;
}

export function BarChartComponent({
  data,
  xKey,
  yKey,
  title,
  description,
  loading = false,
  color = 'primary',
  horizontal = false,
  className,
}: BarChartProps) {
  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout={horizontal ? 'horizontal' : 'vertical'}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            {horizontal ? (
              <>
                <YAxis dataKey={xKey} stroke="#6b7280" fontSize={12} type="category" />
                <XAxis stroke="#6b7280" fontSize={12} tickFormatter={formatNumber} type="number" />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} type="category" />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatNumber} type="number" />
              </>
            )}
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [formatNumber(value), yKey]}
            />
            <Bar
              dataKey={yKey}
              fill={CHART_COLORS[color]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface PieChartProps extends ChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  colors?: string[];
}

export function PieChartComponent({
  data,
  nameKey,
  valueKey,
  title,
  description,
  loading = false,
  colors = Object.values(CHART_COLORS),
  className,
}: PieChartProps) {
  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={valueKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [formatNumber(value), valueKey]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
  className,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            {icon && <Skeleton className="h-8 w-8 rounded-full" />}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChangeIcon = () => {
    if (!change) return <Minus className="h-4 w-4" />;
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
            {change !== undefined && (
              <div className="flex items-center space-x-1">
                {getChangeIcon()}
                <span className={`text-sm font-medium ${getChangeColor()}`}>
                  {Math.abs(change).toFixed(1)}%
                </span>
                {changeLabel && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Export chart colors for use in other components
export { CHART_COLORS, formatNumber, calculateChange }; 