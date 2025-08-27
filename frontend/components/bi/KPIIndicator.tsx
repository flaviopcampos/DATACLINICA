// Componente para exibir indicadores de KPI

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
  LineChart,
  Zap,
  Heart,
  Clock,
  Award,
  Shield,
  Thermometer,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import type {
  KPI,
  KPIValue,
  KPIStatus,
  KPITrend,
  KPICategory,
  KPIType,
  KPITarget,
  KPIAlert
} from '@/types/bi/kpis';

export interface KPIIndicatorProps {
  kpi: KPI;
  value?: KPIValue;
  showTrend?: boolean;
  showProgress?: boolean;
  showTarget?: boolean;
  showStatus?: boolean;
  showIcon?: boolean;
  showAlerts?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  orientation?: 'horizontal' | 'vertical';
  theme?: 'light' | 'dark' | 'colored' | 'gradient';
  interactive?: boolean;
  animated?: boolean;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onClick?: (kpi: KPI) => void;
  onTargetClick?: (target: KPITarget) => void;
  onAlertClick?: (alert: KPIAlert) => void;
}

export interface KPIGaugeProps {
  value: number;
  min: number;
  max: number;
  target?: number;
  size?: number;
  thickness?: number;
  showValue?: boolean;
  showTarget?: boolean;
  status?: KPIStatus;
  animated?: boolean;
  className?: string;
}

export interface KPISparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  animated?: boolean;
  className?: string;
}

export interface KPIComparisonProps {
  current: number;
  previous: number;
  target?: number;
  period?: string;
  format?: string;
  showPercentage?: boolean;
  showTarget?: boolean;
  className?: string;
}

// Utility functions
function formatKPIValue(value: number | string, format?: string, precision = 2): string {
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
    case 'time':
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return `${hours}h ${minutes}m`;
    default:
      return value.toLocaleString('pt-BR');
  }
}

function getKPIIcon(category: KPICategory, type: KPIType) {
  const iconMap = {
    clinical: {
      occupancy: Activity,
      satisfaction: Heart,
      efficiency: Zap,
      quality: Award,
      safety: Shield,
      mortality: AlertTriangle,
      readmission: Target,
      default: Activity
    },
    financial: {
      revenue: DollarSign,
      cost: DollarSign,
      profit: TrendingUp,
      margin: PieChart,
      budget: Target,
      roi: BarChart3,
      default: DollarSign
    },
    operational: {
      productivity: BarChart3,
      utilization: PieChart,
      performance: LineChart,
      efficiency: Target,
      throughput: Activity,
      capacity: Thermometer,
      default: BarChart3
    },
    patient: {
      satisfaction: Heart,
      volume: Users,
      retention: TrendingUp,
      experience: CheckCircle,
      default: Users
    },
    staff: {
      productivity: BarChart3,
      satisfaction: Heart,
      utilization: Users,
      turnover: TrendingDown,
      engagement: Award,
      default: Users
    },
    quality: {
      score: Award,
      compliance: CheckCircle,
      incidents: AlertTriangle,
      improvement: TrendingUp,
      default: Award
    }
  };

  const categoryIcons = iconMap[category] || iconMap.operational;
  return categoryIcons[type] || categoryIcons.default;
}

function getStatusColor(status: KPIStatus): string {
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'good':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'poor':
      return 'text-red-700 bg-red-100 border-red-300';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

function getStatusIcon(status: KPIStatus) {
  switch (status) {
    case 'excellent':
    case 'good':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    case 'critical':
    case 'poor':
      return XCircle;
    default:
      return Info;
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

function calculateProgress(current: number, min: number, max: number): number {
  return Math.min(Math.max(((current - min) / (max - min)) * 100, 0), 100);
}

// KPI Gauge Component
function KPIGauge({
  value,
  min,
  max,
  target,
  size = 120,
  thickness = 8,
  showValue = true,
  showTarget = true,
  status = 'unknown',
  animated = true,
  className
}: KPIGaugeProps) {
  const progress = calculateProgress(value, min, max);
  const targetProgress = target ? calculateProgress(target, min, max) : 0;
  
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const statusColors = {
    excellent: '#10b981',
    good: '#3b82f6',
    warning: '#f59e0b',
    critical: '#ef4444',
    poor: '#dc2626',
    unknown: '#6b7280'
  };
  
  const color = statusColors[status];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={thickness}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-1000 ease-out' : ''}
        />
        
        {/* Target indicator */}
        {showTarget && target && (
          <circle
            cx={size / 2 + radius * Math.cos((targetProgress / 100) * 2 * Math.PI - Math.PI / 2)}
            cy={size / 2 + radius * Math.sin((targetProgress / 100) * 2 * Math.PI - Math.PI / 2)}
            r={3}
            fill="#f59e0b"
          />
        )}
      </svg>
      
      {/* Center value */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">
            {Math.round(progress)}%
          </span>
          <span className="text-xs text-muted-foreground">
            {formatKPIValue(value)}
          </span>
        </div>
      )}
    </div>
  );
}

// KPI Sparkline Component
function KPISparkline({
  data,
  width = 100,
  height = 30,
  color = '#3b82f6',
  showDots = false,
  animated = true,
  className
}: KPISparklineProps) {
  if (!data || data.length === 0) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className={cn('overflow-visible', className)}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        className={animated ? 'transition-all duration-500' : ''}
      />
      {showDots && data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={2}
            fill={color}
            className={animated ? 'transition-all duration-500' : ''}
          />
        );
      })}
    </svg>
  );
}

// KPI Comparison Component
function KPIComparison({
  current,
  previous,
  target,
  period = 'período anterior',
  format,
  showPercentage = true,
  showTarget = true,
  className
}: KPIComparisonProps) {
  const difference = current - previous;
  const percentageChange = previous !== 0 ? (difference / previous) * 100 : 0;
  const isPositive = difference > 0;
  const isNegative = difference < 0;
  
  const targetDifference = target ? current - target : 0;
  const targetPercentage = target && target !== 0 ? (targetDifference / target) * 100 : 0;
  const targetMet = target ? current >= target : false;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Comparison with previous period */}
      <div className="flex items-center justify-between text-sm">
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
            {showPercentage ? `${Math.abs(percentageChange).toFixed(1)}%` : formatKPIValue(Math.abs(difference), format)}
          </span>
        </div>
      </div>
      
      {/* Target comparison */}
      {showTarget && target && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">vs meta</span>
          <div className={cn(
            'flex items-center space-x-1',
            targetMet ? 'text-green-600' : 'text-red-600'
          )}>
            {targetMet ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Target className="h-3 w-3" />
            )}
            <span>
              {Math.abs(targetPercentage).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Main KPI Indicator Component
export function KPIIndicator({
  kpi,
  value,
  showTrend = true,
  showProgress = false,
  showTarget = true,
  showStatus = true,
  showIcon = true,
  showAlerts = true,
  size = 'md',
  variant = 'default',
  orientation = 'vertical',
  theme = 'light',
  interactive = false,
  animated = true,
  className,
  loading = false,
  error = null,
  onClick,
  onTargetClick,
  onAlertClick
}: KPIIndicatorProps) {
  const Icon = showIcon ? getKPIIcon(kpi.category, kpi.type) : null;
  const StatusIcon = value?.status ? getStatusIcon(value.status) : null;
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  const valueSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const themeClasses = {
    light: '',
    dark: 'bg-gray-900 text-white',
    colored: value?.status ? getStatusColor(value.status) : '',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100'
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
            <p className="text-sm text-muted-foreground">Erro ao carregar KPI</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleClick = () => {
    if (onClick && interactive) {
      onClick(kpi);
    }
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTargetClick && kpi.target) {
      onTargetClick(kpi.target);
    }
  };

  return (
    <Card 
      className={cn(
        sizeClasses[size],
        themeClasses[theme],
        {
          'cursor-pointer hover:shadow-md transition-all duration-200': interactive && onClick,
          'border-l-4': variant === 'detailed' && value?.status,
        },
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className={cn(
        'flex items-center space-y-0 pb-2',
        orientation === 'horizontal' ? 'flex-row justify-between' : 'flex-col space-y-2'
      )}>
        <div className={cn(
          'flex items-center space-x-2',
          orientation === 'vertical' && 'w-full justify-between'
        )}>
          <div className="space-y-1">
            <CardTitle className={cn(
              'font-medium',
              titleSizes[size]
            )}>
              {kpi.name}
            </CardTitle>
            {kpi.description && variant !== 'minimal' && (
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {showStatus && value?.status && StatusIcon && (
              <StatusIcon className={cn(
                getStatusColor(value.status).split(' ')[0],
                size === 'sm' ? 'h-4 w-4' : size === 'xl' ? 'h-6 w-6' : 'h-5 w-5'
              )} />
            )}
            {Icon && (
              <Icon className={cn(
                'text-muted-foreground',
                size === 'sm' ? 'h-4 w-4' : size === 'xl' ? 'h-6 w-6' : 'h-5 w-5'
              )} />
            )}
          </div>
        </div>
        
        {showAlerts && value?.alerts && value.alerts.length > 0 && (
          <div className="flex items-center space-x-1">
            {value.alerts.slice(0, 3).map((alert, index) => (
              <Badge
                key={index}
                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                className="text-xs cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAlertClick) onAlertClick(alert);
                }}
              >
                {alert.severity === 'critical' ? (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                ) : (
                  <Info className="h-3 w-3 mr-1" />
                )}
                {alert.message.slice(0, 10)}...
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={cn(
          'space-y-3',
          orientation === 'horizontal' && 'flex items-center space-y-0 space-x-4'
        )}>
          {/* Main Value */}
          {value && (
            <div className={cn(
              'flex items-baseline space-x-2',
              orientation === 'horizontal' && 'flex-1'
            )}>
              <span className={cn('font-bold', valueSizes[size])}>
                {formatKPIValue(value.current, kpi.format, kpi.precision)}
              </span>
              {kpi.unit && (
                <span className="text-sm text-muted-foreground">
                  {kpi.unit}
                </span>
              )}
            </div>
          )}
          
          {/* Gauge for circular KPIs */}
          {variant === 'detailed' && showProgress && value && kpi.target && (
            <div className="flex justify-center">
              <KPIGauge
                value={typeof value.current === 'number' ? value.current : 0}
                min={kpi.minValue || 0}
                max={kpi.maxValue || kpi.target || 100}
                target={kpi.target}
                status={value.status}
                animated={animated}
                size={size === 'xl' ? 140 : size === 'lg' ? 120 : 100}
              />
            </div>
          )}
          
          {/* Trend and Sparkline */}
          {showTrend && value?.trend && (
            <div className={cn(
              'flex items-center justify-between',
              orientation === 'horizontal' && 'flex-col items-end space-y-1'
            )}>
              <div className={cn(
                'flex items-center space-x-1',
                getTrendColor(value.trend.direction),
                size === 'sm' ? 'text-xs' : 'text-sm'
              )}>
                {value.trend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : value.trend.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                <span>
                  {typeof value.trend.value === 'number' ? `${Math.abs(value.trend.value).toFixed(1)}%` : value.trend.value}
                </span>
                {value.trend.period && (
                  <span className="text-muted-foreground">
                    vs {value.trend.period}
                  </span>
                )}
              </div>
              
              {value.history && value.history.length > 0 && (
                <KPISparkline
                  data={value.history.map(h => typeof h.value === 'number' ? h.value : 0)}
                  color={getTrendColor(value.trend.direction).includes('green') ? '#10b981' : 
                        getTrendColor(value.trend.direction).includes('red') ? '#ef4444' : '#6b7280'}
                  animated={animated}
                  width={orientation === 'horizontal' ? 60 : 80}
                  height={20}
                />
              )}
            </div>
          )}
          
          {/* Progress Bar */}
          {showProgress && !variant.includes('detailed') && value && kpi.target && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className={value.status ? getStatusColor(value.status).split(' ')[0] : ''}>
                  {Math.round(((typeof value.current === 'number' ? value.current : 0) / kpi.target) * 100)}%
                </span>
              </div>
              <Progress 
                value={((typeof value.current === 'number' ? value.current : 0) / kpi.target) * 100} 
                className="h-2" 
              />
            </div>
          )}
          
          {/* Comparison */}
          {variant === 'detailed' && value && (
            <KPIComparison
              current={typeof value.current === 'number' ? value.current : 0}
              previous={value.previous || 0}
              target={kpi.target}
              period={value.trend?.period}
              format={kpi.format}
            />
          )}
          
          {/* Target Info */}
          {showTarget && kpi.target && variant !== 'minimal' && (
            <div 
              className="flex items-center justify-between text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={handleTargetClick}
            >
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>Meta: {formatKPIValue(kpi.target, kpi.format)}</span>
              </div>
              {value && (
                <Badge 
                  variant={typeof value.current === 'number' && value.current >= kpi.target ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {typeof value.current === 'number' && value.current >= kpi.target ? 'Atingida' : 'Pendente'}
                </Badge>
              )}
            </div>
          )}
          
          {/* Last Updated */}
          {variant === 'detailed' && value?.lastUpdated && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="h-3 w-3" />
              <span>
                Atualizado: {value.lastUpdated.toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default KPIIndicator;