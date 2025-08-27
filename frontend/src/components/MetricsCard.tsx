'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MetricValue {
  current: number
  previous?: number
  target?: number
  unit: string
  format?: 'number' | 'percentage' | 'bytes' | 'duration' | 'currency'
}

interface MetricTrend {
  direction: 'up' | 'down' | 'stable'
  percentage: number
  isGood: boolean
}

interface MetricThreshold {
  warning: number
  critical: number
  type: 'above' | 'below'
}

interface MetricsCardProps {
  title: string
  description?: string
  value: MetricValue
  trend?: MetricTrend
  threshold?: MetricThreshold
  status?: 'healthy' | 'warning' | 'critical' | 'unknown'
  lastUpdated?: Date
  isLoading?: boolean
  showProgress?: boolean
  showTrend?: boolean
  showThreshold?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'detailed'
  icon?: React.ReactNode
  actions?: {
    onRefresh?: () => void
    onViewDetails?: () => void
    onConfigure?: () => void
  }
  className?: string
  children?: React.ReactNode
}

function formatValue(value: number, format: MetricValue['format'], unit: string): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'bytes':
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      if (value === 0) return '0 B'
      const i = Math.floor(Math.log(value) / Math.log(1024))
      return `${(value / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
    case 'duration':
      if (value < 1000) return `${value}ms`
      if (value < 60000) return `${(value / 1000).toFixed(1)}s`
      if (value < 3600000) return `${(value / 60000).toFixed(1)}m`
      return `${(value / 3600000).toFixed(1)}h`
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    case 'number':
    default:
      return `${value.toLocaleString('pt-BR')} ${unit}`.trim()
  }
}

function getStatusColor(status: MetricsCardProps['status']) {
  switch (status) {
    case 'healthy':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'unknown':
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

function getStatusIcon(status: MetricsCardProps['status']) {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />
    case 'critical':
      return <XCircle className="h-4 w-4" />
    case 'unknown':
    default:
      return <Info className="h-4 w-4" />
  }
}

function getTrendIcon(trend: MetricTrend) {
  switch (trend.direction) {
    case 'up':
      return <TrendingUp className={cn('h-4 w-4', trend.isGood ? 'text-green-600' : 'text-red-600')} />
    case 'down':
      return <TrendingDown className={cn('h-4 w-4', trend.isGood ? 'text-green-600' : 'text-red-600')} />
    case 'stable':
    default:
      return <Minus className="h-4 w-4 text-gray-600" />
  }
}

function calculateProgress(value: MetricValue, threshold?: MetricThreshold): number {
  if (!threshold) return 0
  
  if (threshold.type === 'above') {
    return Math.min((value.current / threshold.critical) * 100, 100)
  } else {
    return Math.max(100 - (value.current / threshold.critical) * 100, 0)
  }
}

function getProgressColor(progress: number, threshold?: MetricThreshold): string {
  if (!threshold) return 'bg-blue-500'
  
  if (progress >= 90) return 'bg-red-500'
  if (progress >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function MetricsCard({
  title,
  description,
  value,
  trend,
  threshold,
  status = 'unknown',
  lastUpdated,
  isLoading = false,
  showProgress = false,
  showTrend = true,
  showThreshold = false,
  size = 'md',
  variant = 'default',
  icon,
  actions,
  className,
  children
}: MetricsCardProps) {
  const progress = showProgress && threshold ? calculateProgress(value, threshold) : 0
  const progressColor = getProgressColor(progress, threshold)
  
  const cardSizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const valueSizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-2xl font-bold',
    lg: 'text-3xl font-bold'
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('relative', className)}>
        <CardContent className={cn('flex items-center justify-between', cardSizeClasses[size])}>
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className={cn('font-medium text-gray-900 truncate', titleSizeClasses[size])}>
                {title}
              </p>
              <p className={cn('text-gray-600', valueSizeClasses[size])}>
                {formatValue(value.current, value.format, value.unit)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showTrend && trend && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(trend)}
                <span className={cn(
                  'text-sm font-medium',
                  trend.isGood ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.percentage.toFixed(1)}%
                </span>
              </div>
            )}
            
            <Badge variant="outline" className={getStatusColor(status)}>
              {getStatusIcon(status)}
            </Badge>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 animate-spin text-gray-600" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 pb-2', cardSizeClasses[size])}>
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className={cn('font-medium', titleSizeClasses[size])}>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-gray-600">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={getStatusColor(status)}>
            {getStatusIcon(status)}
            <span className="ml-1 text-xs font-medium">
              {status === 'healthy' ? 'Saudável' :
               status === 'warning' ? 'Atenção' :
               status === 'critical' ? 'Crítico' : 'Desconhecido'}
            </span>
          </Badge>
          
          {actions && (
            <div className="flex items-center space-x-1">
              {actions.onRefresh && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={actions.onRefresh}
                        disabled={isLoading}
                      >
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Atualizar métrica</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {actions.onViewDetails && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={actions.onViewDetails}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver detalhes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cardSizeClasses[size]}>
        <div className="space-y-4">
          {/* Valor principal */}
          <div className="flex items-baseline justify-between">
            <div>
              <div className={cn('text-gray-900', valueSizeClasses[size])}>
                {formatValue(value.current, value.format, value.unit)}
              </div>
              
              {showTrend && trend && (
                <div className="flex items-center space-x-2 mt-1">
                  {getTrendIcon(trend)}
                  <span className={cn(
                    'text-sm font-medium',
                    trend.isGood ? 'text-green-600' : 'text-red-600'
                  )}>
                    {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    vs período anterior
                  </span>
                </div>
              )}
            </div>
            
            {value.target && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Meta</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatValue(value.target, value.format, value.unit)}
                </div>
              </div>
            )}
          </div>
          
          {/* Barra de progresso */}
          {showProgress && threshold && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Utilização</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {showThreshold && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Aviso: {threshold.warning}{value.unit}</span>
                  <span>Crítico: {threshold.critical}{value.unit}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Conteúdo adicional */}
          {children && (
            <>
              <Separator />
              <div>{children}</div>
            </>
          )}
          
          {/* Informações adicionais para variante detalhada */}
          {variant === 'detailed' && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {value.previous !== undefined && (
                  <div>
                    <div className="text-gray-600">Valor Anterior</div>
                    <div className="font-medium">
                      {formatValue(value.previous, value.format, value.unit)}
                    </div>
                  </div>
                )}
                
                {lastUpdated && (
                  <div>
                    <div className="text-gray-600">Última Atualização</div>
                    <div className="font-medium flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(lastUpdated, {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2 text-gray-600">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Carregando...</span>
          </div>
        </div>
      )}
    </Card>
  )
}

export default MetricsCard