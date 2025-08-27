'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Users,
  Database,
  Server,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Wifi,
  WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MetricData {
  timestamp: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
}

interface RealTimeMetric {
  id: string
  name: string
  description?: string
  category: 'system' | 'application' | 'business'
  type: 'gauge' | 'counter' | 'rate'
  unit: string
  currentValue: number
  previousValue?: number
  trend: 'up' | 'down' | 'stable'
  status: 'normal' | 'warning' | 'critical' | 'unknown'
  thresholds: {
    warning: number
    critical: number
  }
  data: MetricData[]
  lastUpdated: string
  isActive: boolean
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown'
  uptime: number // em segundos
  lastCheck: string
  services: {
    id: string
    name: string
    status: 'online' | 'offline' | 'degraded'
    responseTime?: number
    lastCheck: string
  }[]
  alerts: {
    id: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: string
  }[]
}

interface RealTimeMonitorProps {
  metrics: RealTimeMetric[]
  systemHealth: SystemHealth
  isConnected: boolean
  isAutoRefresh: boolean
  refreshInterval: number // em segundos
  onToggleAutoRefresh: (enabled: boolean) => void
  onRefreshIntervalChange: (interval: number) => void
  onMetricToggle: (metricId: string, enabled: boolean) => void
  onRefresh: () => void
  className?: string
}

function MetricCard({ 
  metric, 
  isExpanded, 
  onToggleExpand, 
  onToggle 
}: { 
  metric: RealTimeMetric
  isExpanded: boolean
  onToggleExpand: () => void
  onToggle: (enabled: boolean) => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return XCircle
      default: return Clock
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Minus
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`
    }
    if (unit === 'bytes') {
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(value) / Math.log(1024))
      return `${(value / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
    }
    if (unit === 'ms') {
      return `${value.toFixed(0)}ms`
    }
    return `${value.toFixed(2)} ${unit}`
  }

  const calculateProgress = () => {
    if (metric.type === 'gauge' && metric.unit === '%') {
      return Math.min(metric.currentValue, 100)
    }
    if (metric.thresholds.critical > 0) {
      return Math.min((metric.currentValue / metric.thresholds.critical) * 100, 100)
    }
    return 0
  }

  const StatusIcon = getStatusIcon(metric.status)
  const TrendIcon = getTrendIcon(metric.trend)

  return (
    <Card className={cn(
      'transition-all duration-200',
      metric.status === 'critical' && 'border-red-300 bg-red-50/50',
      metric.status === 'warning' && 'border-yellow-300 bg-yellow-50/50',
      !metric.isActive && 'opacity-60'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <Switch
                checked={metric.isActive}
                onCheckedChange={onToggle}
                size="sm"
              />
              
              <Badge className={cn('text-xs font-medium', getStatusColor(metric.status))}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {metric.status.toUpperCase()}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                {metric.category}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                {metric.type}
              </Badge>
            </div>
            
            <div>
              <CardTitle className="text-base font-semibold">{metric.name}</CardTitle>
              {metric.description && (
                <CardDescription className="text-sm mt-1">
                  {metric.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleExpand}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Valor atual e tendência */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {formatValue(metric.currentValue, metric.unit)}
            </div>
            
            {metric.previousValue !== undefined && (
              <div className="flex items-center space-x-1 text-sm">
                <TrendIcon className={cn(
                  'h-4 w-4',
                  metric.trend === 'up' && 'text-red-500',
                  metric.trend === 'down' && 'text-green-500',
                  metric.trend === 'stable' && 'text-gray-500'
                )} />
                <span className="text-gray-600">
                  {metric.trend === 'up' && '+'}
                  {(metric.currentValue - metric.previousValue).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-right text-xs text-gray-500">
            <div>Atualizado</div>
            <div>{format(new Date(metric.lastUpdated), 'HH:mm:ss', { locale: ptBR })}</div>
          </div>
        </div>
        
        {/* Barra de progresso para métricas de gauge */}
        {metric.type === 'gauge' && (
          <div className="space-y-2">
            <Progress 
              value={calculateProgress()} 
              className={cn(
                'h-2',
                metric.status === 'critical' && '[&>div]:bg-red-500',
                metric.status === 'warning' && '[&>div]:bg-yellow-500',
                metric.status === 'normal' && '[&>div]:bg-green-500'
              )}
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span className="text-yellow-600">⚠ {metric.thresholds.warning}</span>
              <span className="text-red-600">🚨 {metric.thresholds.critical}</span>
              {metric.unit === '%' && <span>100%</span>}
            </div>
          </div>
        )}
        
        {/* Gráfico expandido */}
        {isExpanded && metric.data.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metric.data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => formatValue(value, metric.unit)}
                  className="text-xs"
                />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm:ss')}
                  formatter={(value: number) => [formatValue(value, metric.unit), metric.name]}
                />
                
                {/* Linhas de referência para thresholds */}
                <ReferenceLine 
                  y={metric.thresholds.warning} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5"
                  label="Aviso"
                />
                <ReferenceLine 
                  y={metric.thresholds.critical} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label="Crítico"
                />
                
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={metric.status === 'critical' ? '#ef4444' : 
                         metric.status === 'warning' ? '#f59e0b' : '#10b981'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SystemHealthCard({ health }: { health: SystemHealth }) {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return XCircle
      default: return Clock
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const HealthIcon = getHealthIcon(health.overall)

  return (
    <Card className={cn('border-2', getHealthColor(health.overall))}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <HealthIcon className="h-5 w-5" />
          <span>Saúde do Sistema</span>
        </CardTitle>
        <CardDescription>
          Última verificação: {format(new Date(health.lastCheck), 'dd/MM HH:mm:ss', { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status geral e uptime */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {health.overall.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">Status Geral</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatUptime(health.uptime)}
            </div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
        
        {/* Serviços */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Serviços ({health.services.length})</Label>
          <div className="space-y-1">
            {health.services.map(service => {
              const statusColor = service.status === 'online' ? 'bg-green-100 text-green-800' :
                                service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
              
              return (
                <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Badge className={cn('text-xs', statusColor)}>
                      {service.status}
                    </Badge>
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    {service.responseTime && `${service.responseTime}ms`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Alertas recentes */}
        {health.alerts.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Alertas Recentes ({health.alerts.length})</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {health.alerts.slice(0, 5).map(alert => {
                const severityColor = alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                
                return (
                  <div key={alert.id} className="p-2 bg-gray-50 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={cn('text-xs', severityColor)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(alert.timestamp), 'HH:mm:ss')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function RealTimeMonitor({
  metrics,
  systemHealth,
  isConnected,
  isAutoRefresh,
  refreshInterval,
  onToggleAutoRefresh,
  onRefreshIntervalChange,
  onMetricToggle,
  onRefresh,
  className
}: RealTimeMonitorProps) {
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const categories = ['all', ...Array.from(new Set(metrics.map(m => m.category)))]
  
  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory)

  const activeMetrics = filteredMetrics.filter(m => m.isActive)
  const criticalMetrics = activeMetrics.filter(m => m.status === 'critical')
  const warningMetrics = activeMetrics.filter(m => m.status === 'warning')

  // Auto-refresh
  useEffect(() => {
    if (isAutoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        onRefresh()
      }, refreshInterval * 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoRefresh, refreshInterval, onRefresh])

  const toggleMetricExpansion = (metricId: string) => {
    setExpandedMetrics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(metricId)) {
        newSet.delete(metricId)
      } else {
        newSet.add(metricId)
      }
      return newSet
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Monitor em Tempo Real</span>
                
                <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                  <div className={cn(
                    'w-2 h-2 rounded-full mr-1',
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  )} />
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </CardTitle>
              
              <CardDescription>
                {activeMetrics.length} métricas ativas • 
                {criticalMetrics.length} críticas • 
                {warningMetrics.length} com aviso
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-refresh */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isAutoRefresh}
                  onCheckedChange={onToggleAutoRefresh}
                />
                <Label className="text-sm">Auto-refresh</Label>
                
                {isAutoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => onRefreshIntervalChange(parseInt(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                  </select>
                )}
              </div>
              
              {/* Refresh manual */}
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={!isConnected}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </div>
          
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{metrics.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeMetrics.length}</div>
              <div className="text-sm text-gray-600">Ativas</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{warningMetrics.length}</div>
              <div className="text-sm text-gray-600">Avisos</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalMetrics.length}</div>
              <div className="text-sm text-gray-600">Críticas</div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saúde do sistema */}
        <div className="lg:col-span-1">
          <SystemHealthCard health={systemHealth} />
        </div>
        
        {/* Métricas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtro por categoria */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category === 'all' ? 'Todas' : category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                {filteredMetrics.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Activity className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Nenhuma métrica encontrada</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredMetrics.map(metric => (
                    <MetricCard
                      key={metric.id}
                      metric={metric}
                      isExpanded={expandedMetrics.has(metric.id)}
                      onToggleExpand={() => toggleMetricExpansion(metric.id)}
                      onToggle={(enabled) => onMetricToggle(metric.id, enabled)}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default RealTimeMonitor