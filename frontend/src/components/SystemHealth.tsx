'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Server,
  Database,
  Globe,
  Wifi,
  Shield,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Settings,
  Bell,
  Users,
  FileText,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface HealthCheck {
  id: string
  name: string
  description?: string
  category: 'system' | 'database' | 'network' | 'security' | 'application'
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  responseTime?: number // em ms
  lastCheck: string
  nextCheck?: string
  details?: {
    message: string
    code?: string
    metadata?: Record<string, any>
  }
  history: {
    timestamp: string
    status: 'healthy' | 'warning' | 'critical' | 'unknown'
    responseTime?: number
  }[]
}

interface SystemResource {
  id: string
  name: string
  type: 'cpu' | 'memory' | 'disk' | 'network'
  usage: number // porcentagem
  available: number
  total: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  thresholds: {
    warning: number
    critical: number
  }
  trend: 'up' | 'down' | 'stable'
  history: {
    timestamp: string
    usage: number
  }[]
}

interface ServiceStatus {
  id: string
  name: string
  description?: string
  type: 'web' | 'api' | 'database' | 'cache' | 'queue' | 'storage'
  status: 'online' | 'offline' | 'degraded' | 'maintenance'
  uptime: number // porcentagem
  responseTime: number // ms médio
  lastIncident?: {
    timestamp: string
    duration: number // em segundos
    reason: string
  }
  dependencies: string[] // IDs de outros serviços
  endpoint?: string
  version?: string
}

interface SystemHealthData {
  overall: {
    status: 'healthy' | 'warning' | 'critical' | 'unknown'
    score: number // 0-100
    uptime: number // em segundos
    lastUpdate: string
  }
  healthChecks: HealthCheck[]
  resources: SystemResource[]
  services: ServiceStatus[]
  incidents: {
    id: string
    title: string
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
    severity: 'low' | 'medium' | 'high' | 'critical'
    startTime: string
    endTime?: string
    affectedServices: string[]
    updates: {
      timestamp: string
      message: string
      status: string
    }[]
  }[]
  metrics: {
    totalRequests: number
    errorRate: number
    avgResponseTime: number
    activeUsers: number
  }
}

interface SystemHealthProps {
  data: SystemHealthData
  isLoading: boolean
  onRefresh: () => void
  onRunHealthCheck: (checkId: string) => void
  onViewDetails: (type: string, id: string) => void
  className?: string
}

function HealthCheckCard({ 
  check, 
  onRun, 
  onViewDetails 
}: { 
  check: HealthCheck
  onRun: () => void
  onViewDetails: () => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return XCircle
      default: return Clock
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return Server
      case 'database': return Database
      case 'network': return Globe
      case 'security': return Shield
      case 'application': return Zap
      default: return Activity
    }
  }

  const StatusIcon = getStatusIcon(check.status)
  const CategoryIcon = getCategoryIcon(check.category)

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', getStatusColor(check.status))}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <CategoryIcon className="h-4 w-4 text-gray-600" />
              <Badge variant="outline" className="text-xs">
                {check.category}
              </Badge>
              <Badge className={cn('text-xs font-medium', getStatusColor(check.status))}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {check.status.toUpperCase()}
              </Badge>
            </div>
            
            <div>
              <CardTitle className="text-base font-semibold">{check.name}</CardTitle>
              {check.description && (
                <CardDescription className="text-sm mt-1">
                  {check.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onRun}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Tempo de resposta */}
        {check.responseTime !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tempo de resposta:</span>
            <span className="font-medium">{check.responseTime}ms</span>
          </div>
        )}
        
        {/* Última verificação */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Última verificação:</span>
          <span className="font-medium">
            {format(new Date(check.lastCheck), 'dd/MM HH:mm:ss', { locale: ptBR })}
          </span>
        </div>
        
        {/* Próxima verificação */}
        {check.nextCheck && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Próxima verificação:</span>
            <span className="font-medium">
              {format(new Date(check.nextCheck), 'dd/MM HH:mm:ss', { locale: ptBR })}
            </span>
          </div>
        )}
        
        {/* Detalhes do erro */}
        {check.details && check.status !== 'healthy' && (
          <div className="p-2 bg-gray-50 rounded text-sm">
            <p className="font-medium text-gray-900">{check.details.message}</p>
            {check.details.code && (
              <p className="text-gray-600 mt-1">Código: {check.details.code}</p>
            )}
          </div>
        )}
        
        {/* Histórico (mini gráfico) */}
        {check.history.length > 0 && (
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={check.history}>
                <Area 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke={check.status === 'healthy' ? '#10b981' : '#ef4444'}
                  fill={check.status === 'healthy' ? '#10b981' : '#ef4444'}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ResourceCard({ resource }: { resource: SystemResource }) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu': return Cpu
      case 'memory': return MemoryStick
      case 'disk': return HardDrive
      case 'network': return Network
      default: return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Minus
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'bytes') {
      return formatBytes(value)
    }
    return `${value.toFixed(1)} ${unit}`
  }

  const ResourceIcon = getResourceIcon(resource.type)
  const TrendIcon = getTrendIcon(resource.trend)

  return (
    <Card className={cn(
      'transition-all duration-200',
      resource.status === 'critical' && 'border-red-300 bg-red-50/50',
      resource.status === 'warning' && 'border-yellow-300 bg-yellow-50/50'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ResourceIcon className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-base font-semibold">{resource.name}</CardTitle>
          </div>
          
          <div className="flex items-center space-x-1">
            <TrendIcon className={cn(
              'h-4 w-4',
              resource.trend === 'up' && 'text-red-500',
              resource.trend === 'down' && 'text-green-500',
              resource.trend === 'stable' && 'text-gray-500'
            )} />
            <span className={cn('text-sm font-medium', getStatusColor(resource.status))}>
              {resource.usage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Barra de progresso */}
        <div className="space-y-2">
          <Progress 
            value={resource.usage} 
            className={cn(
              'h-3',
              resource.status === 'critical' && '[&>div]:bg-red-500',
              resource.status === 'warning' && '[&>div]:bg-yellow-500',
              resource.status === 'normal' && '[&>div]:bg-green-500'
            )}
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="text-yellow-600">⚠ {resource.thresholds.warning}%</span>
            <span className="text-red-600">🚨 {resource.thresholds.critical}%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Uso atual */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Em uso</div>
            <div className="font-medium">
              {formatValue(resource.total - resource.available, resource.unit)}
            </div>
          </div>
          
          <div>
            <div className="text-gray-600">Disponível</div>
            <div className="font-medium">
              {formatValue(resource.available, resource.unit)}
            </div>
          </div>
        </div>
        
        {/* Mini gráfico de histórico */}
        {resource.history.length > 0 && (
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resource.history}>
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke={resource.status === 'critical' ? '#ef4444' : 
                         resource.status === 'warning' ? '#f59e0b' : '#10b981'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ServiceCard({ service, onViewDetails }: { service: ServiceStatus, onViewDetails: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'offline': return 'text-red-600 bg-red-100'
      case 'maintenance': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle
      case 'degraded': return AlertTriangle
      case 'offline': return XCircle
      case 'maintenance': return Settings
      default: return Clock
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return Globe
      case 'api': return Zap
      case 'database': return Database
      case 'cache': return MemoryStick
      case 'queue': return FileText
      case 'storage': return HardDrive
      default: return Server
    }
  }

  const StatusIcon = getStatusIcon(service.status)
  const TypeIcon = getTypeIcon(service.type)

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md cursor-pointer',
      service.status === 'offline' && 'border-red-300 bg-red-50/50',
      service.status === 'degraded' && 'border-yellow-300 bg-yellow-50/50'
    )} onClick={onViewDetails}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <TypeIcon className="h-4 w-4 text-gray-600" />
              <Badge variant="outline" className="text-xs">
                {service.type}
              </Badge>
              <Badge className={cn('text-xs font-medium', getStatusColor(service.status))}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {service.status.toUpperCase()}
              </Badge>
            </div>
            
            <div>
              <CardTitle className="text-base font-semibold">{service.name}</CardTitle>
              {service.description && (
                <CardDescription className="text-sm mt-1">
                  {service.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Uptime</div>
            <div className="font-medium">{service.uptime.toFixed(2)}%</div>
          </div>
          
          <div>
            <div className="text-gray-600">Resp. Time</div>
            <div className="font-medium">{service.responseTime}ms</div>
          </div>
        </div>
        
        {/* Versão e endpoint */}
        {(service.version || service.endpoint) && (
          <div className="space-y-1 text-xs text-gray-600">
            {service.version && (
              <div>Versão: {service.version}</div>
            )}
            {service.endpoint && (
              <div className="truncate">Endpoint: {service.endpoint}</div>
            )}
          </div>
        )}
        
        {/* Último incidente */}
        {service.lastIncident && (
          <div className="p-2 bg-red-50 rounded text-xs">
            <div className="font-medium text-red-800">Último Incidente</div>
            <div className="text-red-600 mt-1">
              {format(new Date(service.lastIncident.timestamp), 'dd/MM HH:mm', { locale: ptBR })}
              {' • '}
              {Math.floor(service.lastIncident.duration / 60)}min
            </div>
            <div className="text-red-700 mt-1">{service.lastIncident.reason}</div>
          </div>
        )}
        
        {/* Dependências */}
        {service.dependencies.length > 0 && (
          <div className="text-xs">
            <div className="text-gray-600 mb-1">Dependências ({service.dependencies.length})</div>
            <div className="flex flex-wrap gap-1">
              {service.dependencies.slice(0, 3).map(dep => (
                <Badge key={dep} variant="outline" className="text-xs">
                  {dep}
                </Badge>
              ))}
              {service.dependencies.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{service.dependencies.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SystemHealth({
  data,
  isLoading,
  onRefresh,
  onRunHealthCheck,
  onViewDetails,
  className
}: SystemHealthProps) {
  const [selectedTab, setSelectedTab] = useState('overview')

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

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const healthyChecks = data.healthChecks.filter(c => c.status === 'healthy').length
  const warningChecks = data.healthChecks.filter(c => c.status === 'warning').length
  const criticalChecks = data.healthChecks.filter(c => c.status === 'critical').length

  const onlineServices = data.services.filter(s => s.status === 'online').length
  const degradedServices = data.services.filter(s => s.status === 'degraded').length
  const offlineServices = data.services.filter(s => s.status === 'offline').length

  const activeIncidents = data.incidents.filter(i => i.status !== 'resolved').length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com status geral */}
      <Card className={cn('border-2', getOverallStatusColor(data.overall.status))}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <Activity className="h-6 w-6" />
                <span>Saúde do Sistema</span>
                <Badge className={cn('text-sm font-medium', getOverallStatusColor(data.overall.status))}>
                  {data.overall.status.toUpperCase()}
                </Badge>
              </CardTitle>
              
              <CardDescription>
                Score: {data.overall.score}/100 • 
                Uptime: {formatUptime(data.overall.uptime)} • 
                Última atualização: {format(new Date(data.overall.lastUpdate), 'dd/MM HH:mm:ss', { locale: ptBR })}
              </CardDescription>
            </div>
            
            <Button onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
              Atualizar
            </Button>
          </div>
          
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{data.overall.score}</div>
              <div className="text-sm text-gray-600">Score Geral</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{onlineServices}</div>
              <div className="text-sm text-gray-600">Serviços Online</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{warningChecks + degradedServices}</div>
              <div className="text-sm text-gray-600">Avisos</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalChecks + offlineServices}</div>
              <div className="text-sm text-gray-600">Críticos</div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Tabs de conteúdo */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="checks">Health Checks</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.metrics.totalRequests.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Requisições Totais</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.metrics.errorRate.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Erro</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.metrics.avgResponseTime}ms
                </div>
                <div className="text-sm text-gray-600">Tempo Médio</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.metrics.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Usuários Ativos</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Incidentes ativos */}
          {activeIncidents > 0 && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Incidentes Ativos ({activeIncidents})</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {data.incidents.filter(i => i.status !== 'resolved').slice(0, 3).map(incident => (
                  <div key={incident.id} className="p-3 bg-white rounded border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={cn(
                            'text-xs',
                            incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          )}>
                            {incident.severity}
                          </Badge>
                          
                          <Badge variant="outline" className="text-xs">
                            {incident.status}
                          </Badge>
                          
                          <span className="text-xs text-gray-500">
                            {format(new Date(incident.startTime), 'dd/MM HH:mm')}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-gray-900">{incident.title}</h4>
                        
                        {incident.affectedServices.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {incident.affectedServices.slice(0, 3).map(service => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {incident.affectedServices.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{incident.affectedServices.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDetails('incident', incident.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="checks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.healthChecks.map(check => (
              <HealthCheckCard
                key={check.id}
                check={check}
                onRun={() => onRunHealthCheck(check.id)}
                onViewDetails={() => onViewDetails('check', check.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.resources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onViewDetails={() => onViewDetails('service', service.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SystemHealth