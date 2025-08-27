// Componente para exibir métricas em cards visuais

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import type {
  Metric,
  MetricValue,
  MetricTrend,
  MetricStatus,
  MetricCategory,
  MetricType
} from '@/types/bi/metrics';

export interface MetricCardProps {
  metric: Metric;
  value?: MetricValue;
  showTrend?: boolean;
  showProgress?: boolean;
  showComparison?: boolean;
  showTarget?: boolean;
  showStatus?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  theme?: 'light' | 'dark' | 'colored';
  className?: string;
  loading?: boolean;
  error?: string | null;
  onClick?: (metric: Metric) => void;
}

export interface MetricValueDisplayProps {
  value: number | string;
  format?: string;
  unit?: string;
  precision?: number;
  showUnit?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface MetricTrendProps {
  trend: MetricTrend;
  showPercentage?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export interface MetricProgressProps {
  current: number;
  target: number;
  showPercentage?: boolean;
  showLabels?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export interface MetricComparisonProps {
  current: number;
  previous: number;
  period?: string;
  showPercentage?: boolean;
  className?: string;
}

export interface MetricStatusProps {
  status: MetricStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

// Utility functions
function formatValue(value: number | string, format?: string, precision = 2): string {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    case 'percentage':
      return `${(value * 100).toFixed(precision)}%`;
    case 'decimal':
      return value.toFixed(precision);
    case 'integer':
      return Math.round(value).toString();
    default:
      return value.toLocaleString('pt-BR');
  }
}

function getMetricIcon(category: MetricCategory, type: MetricType) {
  const iconMap = {
    clinical: {
      occupancy: Activity,
      satisfaction: CheckCircle,
      efficiency: Target,
      quality: CheckCircle,
      safety: AlertTriangle,
      default: Activity
    },
    financial: {
      revenue: DollarSign,
      cost: DollarSign,
      profit: TrendingUp,
      budget: Target,
      default: DollarSign
    },
    operational: {
      productivity: BarChart3,
      utilization: PieChart,
      performance: LineChart,
      efficiency: Target,
      default: BarChart3
    },
    patient: {
      satisfaction: CheckCircle,
      volume: Users,
      retention: TrendingUp,
      default: Users
    },
    staff: {
      productivity: BarChart3,
      satisfaction: CheckCircle,
      utilization: Users,
      default: Users
    }
  };

  const categoryIcons = iconMap[category] || iconMap.operational;
  return categoryIcons[type] || categoryIcons.default;
}

function getStatusColor(status: MetricStatus): string {
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'good':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

function getTrendColor(direction: 'up' | 'down' | 'stable'): string {
  switch (direction) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

// Metric Value Display Component
function MetricValueDisplay({
  value,
  format,
  unit,
  precision = 2,
  showUnit = true,
  size = 'md',
  className
}: MetricValueDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-2xl font-bold',
    lg: 'text-3xl font-bold'
  };

  const formattedValue = formatValue(value, format, precision);

  return (
    <div className={cn('flex items-baseline space-x-1', className)}>
      <span className={sizeClasses[size]}>
        {formattedValue}
      </span>
      {showUnit && unit && (
        <span className="text-sm text-muted-foreground">
          {unit}
        </span>
      )}
    </div>
  );
}

// Metric Trend Component
function MetricTrend({
  trend,
  showPercentage = true,
  showIcon = true,
  size = 'md',
  className
}: MetricTrendProps) {
  const { direction, value, period } = trend;
  
  const TrendIcon = direction === 'up' ? TrendingUp : 
                   direction === 'down' ? TrendingDown : Minus;
  
  const colorClass = getTrendColor(direction);
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className={cn('flex items-center space-x-1', colorClass, sizeClass, className)}>
      {showIcon && <TrendIcon className={iconSize} />}
      <span>
        {showPercentage && typeof value === 'number' ? `${Math.abs(value).toFixed(1)}%` : value}
      </span>
      {period && (
        <span className="text-muted-foreground">
          vs {period}
        </span>
      )}
    </div>
  );
}

// Metric Progress Component
function MetricProgress({
  current,
  target,
  showPercentage = true,
  showLabels = true,
  variant = 'default',
  className
}: MetricProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  
  const variantClasses = {
    default: '',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    destructive: 'text-red-600'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabels && (
        <div className="flex justify-between text-sm">
          <span>Progresso</span>
          {showPercentage && (
            <span className={variantClasses[variant]}>
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <Progress value={percentage} className="h-2" />
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatValue(current)}</span>
          <span>Meta: {formatValue(target)}</span>
        </div>
      )}
    </div>
  );
}

// Metric Comparison Component
function MetricComparison({
  current,
  previous,
  period = 'período anterior',
  showPercentage = true,
  className
}: MetricComparisonProps) {
  const difference = current - previous;
  const percentageChange = previous !== 0 ? (difference / previous) * 100 : 0;
  const isPositive = difference > 0;
  const isNegative = difference < 0;

  return (
    <div className={cn('text-sm space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">vs {period}</span>
        <div className={cn(
          'flex items-center space-x-1',
          isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
        )}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : isNegative ? (
            <TrendingDown className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          <span>
            {showPercentage ? `${Math.abs(percentageChange).toFixed(1)}%` : formatValue(Math.abs(difference))}
          </span>
        </div>
      </div>
    </div>
  );
}

// Metric Status Component
function MetricStatus({
  status,
  showLabel = true,
  size = 'md',
  className
}: MetricStatusProps) {
  const statusConfig = {
    excellent: { label: 'Excelente', icon: CheckCircle },
    good: { label: 'Bom', icon: CheckCircle },
    warning: { label: 'Atenção', icon: AlertTriangle },
    critical: { label: 'Crítico', icon: XCircle },
    unknown: { label: 'Desconhecido', icon: Info }
  };

  const config = statusConfig[status] || statusConfig.unknown;
  const Icon = config.icon;
  const colorClass = getStatusColor(status);
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <Badge 
      variant="outline" 
      className={cn(colorClass, sizeClass, className)}
    >
      <Icon className={cn(iconSize, 'mr-1')} />
      {showLabel && config.label}
    </Badge>
  );
}

// Main Metric Card Component
export function MetricCard({
  metric,
  value,
  showTrend = true,
  showProgress = false,
  showComparison = false,
  showTarget = false,
  showStatus = true,
  showIcon = true,
  size = 'md',
  variant = 'default',
  theme = 'light',
  className,
  loading = false,
  error = null,
  onClick
}: MetricCardProps) {
  const Icon = showIcon ? getMetricIcon(metric.category, metric.type) : null;
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const themeClasses = {
    light: '',
    dark: 'bg-gray-900 text-white',
    colored: getStatusColor(value?.status || 'unknown')
  };

  if (loading) {
    return (
      <Card className={cn(sizeClasses[size], className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
            {showProgress && <Skeleton className="h-2 w-full" />}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(sizeClasses[size], 'border-destructive', className)}>
        <CardContent className="flex items-center justify-center">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">Erro ao carregar métrica</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleClick = () => {
    if (onClick) {
      onClick(metric);
    }
  };

  return (
    <Card 
      className={cn(
        sizeClasses[size],
        themeClasses[theme],
        {
          'cursor-pointer hover:shadow-md transition-shadow': onClick,
          'border-l-4': variant === 'detailed' && value?.status,
        },
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className={cn(
            'font-medium',
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          )}>
            {metric.name}
          </CardTitle>
          {metric.description && variant === 'detailed' && (
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {showStatus && value?.status && (
            <MetricStatus 
              status={value.status} 
              showLabel={variant === 'detailed'}
              size={size === 'lg' ? 'md' : 'sm'}
            />
          )}
          {Icon && (
            <Icon className={cn(
              'text-muted-foreground',
              size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
            )} />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Main Value */}
          {value && (
            <MetricValueDisplay
              value={value.current}
              format={metric.format}
              unit={metric.unit}
              precision={metric.precision}
              size={size}
            />
          )}
          
          {/* Trend */}
          {showTrend && value?.trend && (
            <MetricTrend 
              trend={value.trend}
              size={size === 'lg' ? 'md' : 'sm'}
            />
          )}
          
          {/* Progress to Target */}
          {showProgress && showTarget && value && metric.target && (
            <MetricProgress
              current={typeof value.current === 'number' ? value.current : 0}
              target={metric.target}
              variant={value.status === 'excellent' ? 'success' : 
                      value.status === 'warning' ? 'warning' : 
                      value.status === 'critical' ? 'destructive' : 'default'}
            />
          )}
          
          {/* Comparison */}
          {showComparison && value?.previous !== undefined && (
            <MetricComparison
              current={typeof value.current === 'number' ? value.current : 0}
              previous={value.previous}
              period={value.trend?.period}
            />
          )}
          
          {/* Additional Info */}
          {variant === 'detailed' && (
            <div className="pt-2 border-t space-y-2">
              {metric.category && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Categoria:</span>
                  <Badge variant="outline" className="text-xs">
                    {metric.category}
                  </Badge>
                </div>
              )}
              
              {value?.lastUpdated && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Atualizado: {value.lastUpdated.toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
              
              {metric.target && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>
                    Meta: {formatValue(metric.target, metric.format)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;