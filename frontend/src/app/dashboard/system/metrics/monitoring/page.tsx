'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Heart,
  Monitor,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Wifi,
  Zap,
  Eye,
  EyeOff,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Calendar,
  MapPin,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Componentes
import { RealTimeMonitor } from '@/components/RealTimeMonitor'
import { SystemHealth } from '@/components/SystemHealth'
import { MetricsCard } from '@/components/MetricsCard'

// Hooks
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring'

interface ServiceStatus {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  uptime: number
  responseTime: number
  lastCheck: string
  url?: string
  description?: string
  dependencies?: string[]
  metrics?: {
    requests: number
    errors: number
    avgResponseTime: number
  }
}

interface HealthCheck {
  id: string
  name: string
  status: 'pass' | 'fail' | 'warn'
  responseTime: number
  lastRun: string
  nextRun: string
  endpoint: string
  description?: string
  details?: Record<string, any>
}

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  change: number
  threshold: {
    warning: number
    critical: number
  }
  history: Array<{ timestamp: string; value: number }>
}

interface MonitoringData {
  systemHealth: {
    overall: 'healthy' | 'warning' | 'critical'
    uptime: number
    lastUpdate: string
  }
  services: ServiceStatus[]
  healthChecks: HealthCheck[]
  metrics: SystemMetric[]
  alerts: Array<{
    id: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: string
    source: string
  }>
}

function SystemOverviewCard({ data }: { data: MonitoringData }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return AlertCircle
      default: return Activity
    }
  }

  const StatusIcon = getStatusIcon(data.systemHealth.overall)

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60))
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((uptime % (60 * 60)) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const healthyServices = data.services.filter(s => s.status === 'healthy').length
  const totalServices = data.services.length
  const passedChecks = data.healthChecks.filter(h => h.status === 'pass').length
  const totalChecks = data.healthChecks.length
  const criticalAlerts = data.alerts.filter(a => a.severity === 'critical').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Monitor className="h-5 w-5" />
          <span>Visão Geral do Sistema</span>
        </CardTitle>
        <CardDescription>
          Status geral e métricas principais do sistema
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Status Geral */}
          <div className="text-center">
            <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full mb-3', getStatusColor(data.systemHealth.overall))}>
              <StatusIcon className="h-8 w-8" />
            </div>
            <div className="text-2xl font-bold capitalize">{data.systemHealth.overall}</div>
            <div className="text-sm text-gray-600">Status Geral</div>
          </div>
          
          {/* Uptime */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatUptime(data.systemHealth.uptime)}
            </div>
            <div className="text-sm text-gray-600">Uptime</div>
            <div className="text-xs text-gray-500 mt-1">
              99.9% disponibilidade
            </div>
          </div>
          
          {/* Serviços */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {healthyServices}/{totalServices}
            </div>
            <div className="text-sm text-gray-600">Serviços Ativos</div>
            <Progress 
              value={(healthyServices / totalServices) * 100} 
              className="mt-2 h-2"
            />
          </div>
          
          {/* Health Checks */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {passedChecks}/{totalChecks}
            </div>
            <div className="text-sm text-gray-600">Health Checks</div>
            <Progress 
              value={(passedChecks / totalChecks) * 100} 
              className="mt-2 h-2"
            />
          </div>
        </div>
        
        {/* Alertas Críticos */}
        {criticalAlerts > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {criticalAlerts} alerta{criticalAlerts > 1 ? 's' : ''} crítico{criticalAlerts > 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {data.alerts
                .filter(a => a.severity === 'critical')
                .slice(0, 3)
                .map((alert) => (
                  <div key={alert.id} className="text-sm text-red-700">
                    • {alert.message}
                  </div>
                ))
              }
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Última atualização: {new Date(data.systemHealth.lastUpdate).toLocaleString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  )
}

function ServicesCard({ services }: { services: ServiceStatus[] }) {
  const [filter, setFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return AlertCircle
      default: return Activity
    }
  }

  const formatUptime = (uptime: number) => {
    return `${(uptime * 100).toFixed(2)}%`
  }

  const filteredServices = services.filter(service => {
    const matchesName = service.name.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus = !statusFilter || service.status === statusFilter
    return matchesName && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Server className="h-5 w-5" />
          <span>Serviços</span>
          <Badge variant="secondary">{services.length}</Badge>
        </CardTitle>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar serviços..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="healthy">Saudável</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="unknown">Desconhecido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const StatusIcon = getStatusIcon(service.status)
            
            return (
              <div key={service.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-600">{service.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={cn('text-xs', getStatusColor(service.status))}>
                      {service.status}
                    </Badge>
                    
                    {service.url && (
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Uptime</div>
                    <div className="font-medium">{formatUptime(service.uptime)}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Tempo de Resposta</div>
                    <div className="font-medium">{service.responseTime}ms</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Última Verificação</div>
                    <div className="font-medium">
                      {new Date(service.lastCheck).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                  
                  {service.metrics && (
                    <div>
                      <div className="text-gray-600">Requisições</div>
                      <div className="font-medium">{service.metrics.requests}</div>
                    </div>
                  )}
                </div>
                
                {service.dependencies && service.dependencies.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600 mb-2">Dependências:</div>
                    <div className="flex flex-wrap gap-1">
                      {service.dependencies.map((dep) => (
                        <Badge key={dep} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function HealthChecksCard({ healthChecks }: { healthChecks: HealthCheck[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-200'
      case 'warn': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'fail': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return CheckCircle
      case 'warn': return AlertTriangle
      case 'fail': return AlertCircle
      default: return Activity
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Heart className="h-5 w-5" />
          <span>Health Checks</span>
          <Badge variant="secondary">{healthChecks.length}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {healthChecks.map((check) => {
            const StatusIcon = getStatusIcon(check.status)
            
            return (
              <div key={check.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">{check.name}</div>
                      {check.description && (
                        <div className="text-sm text-gray-600">{check.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={cn('text-xs', getStatusColor(check.status))}>
                    {check.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Endpoint</div>
                    <div className="font-medium font-mono text-xs">{check.endpoint}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Tempo de Resposta</div>
                    <div className="font-medium">{check.responseTime}ms</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Última Execução</div>
                    <div className="font-medium">
                      {new Date(check.lastRun).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Próxima Execução</div>
                    <div className="font-medium">
                      {new Date(check.nextRun).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
                
                {check.details && Object.keys(check.details).length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600 mb-2">Detalhes:</div>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      <pre>{JSON.stringify(check.details, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function MetricsGrid({ metrics }: { metrics: SystemMetric[] }) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Minus
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'critical': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => {
        const TrendIcon = getTrendIcon(metric.trend)
        
        return (
          <Card key={metric.id} className={cn('border-2', getStatusColor(metric.status))}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-600">{metric.name}</div>
                <div className={cn('flex items-center space-x-1', getTrendColor(metric.trend))}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-xs">{Math.abs(metric.change)}%</span>
                </div>
              </div>
              
              <div className="text-3xl font-bold mb-2">
                {metric.value.toLocaleString()}
                <span className="text-lg text-gray-600 ml-1">{metric.unit}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                  <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                </div>
                
                <Progress 
                  value={(metric.value / metric.threshold.critical) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function MonitoringPage() {
  const [isRealTime, setIsRealTime] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Hook de monitoramento
  const {
    data,
    isLoading,
    error,
    isConnected,
    refreshData,
    runHealthCheck,
    toggleService
  } = useRealTimeMonitoring({
    autoRefresh: isRealTime,
    refreshInterval: refreshInterval * 1000
  })

  // Mock data - em produção, viria do hook
  const mockData: MonitoringData = {
    systemHealth: {
      overall: 'healthy',
      uptime: 2592000, // 30 dias em segundos
      lastUpdate: new Date().toISOString()
    },
    services: [
      {
        id: '1',
        name: 'API Server',
        status: 'healthy',
        uptime: 0.999,
        responseTime: 45,
        lastCheck: new Date().toISOString(),
        url: 'https://api.dataclinica.com',
        description: 'Servidor principal da API',
        dependencies: ['database', 'redis'],
        metrics: {
          requests: 15420,
          errors: 23,
          avgResponseTime: 45
        }
      },
      {
        id: '2',
        name: 'Database',
        status: 'healthy',
        uptime: 0.998,
        responseTime: 12,
        lastCheck: new Date().toISOString(),
        description: 'Banco de dados PostgreSQL'
      },
      {
        id: '3',
        name: 'Redis Cache',
        status: 'warning',
        uptime: 0.995,
        responseTime: 8,
        lastCheck: new Date().toISOString(),
        description: 'Cache Redis'
      },
      {
        id: '4',
        name: 'File Storage',
        status: 'healthy',
        uptime: 0.999,
        responseTime: 25,
        lastCheck: new Date().toISOString(),
        description: 'Armazenamento de arquivos'
      }
    ],
    healthChecks: [
      {
        id: '1',
        name: 'Database Connection',
        status: 'pass',
        responseTime: 12,
        lastRun: new Date().toISOString(),
        nextRun: new Date(Date.now() + 60000).toISOString(),
        endpoint: '/health/database',
        description: 'Verifica conectividade com o banco'
      },
      {
        id: '2',
        name: 'External API',
        status: 'warn',
        responseTime: 1200,
        lastRun: new Date().toISOString(),
        nextRun: new Date(Date.now() + 60000).toISOString(),
        endpoint: '/health/external-api',
        description: 'Verifica APIs externas',
        details: {
          timeout: true,
          retries: 3
        }
      },
      {
        id: '3',
        name: 'Disk Space',
        status: 'pass',
        responseTime: 5,
        lastRun: new Date().toISOString(),
        nextRun: new Date(Date.now() + 300000).toISOString(),
        endpoint: '/health/disk',
        description: 'Verifica espaço em disco'
      }
    ],
    metrics: [
      {
        id: '1',
        name: 'CPU Usage',
        value: 45,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        change: 2.1,
        threshold: { warning: 70, critical: 90 },
        history: []
      },
      {
        id: '2',
        name: 'Memory Usage',
        value: 68,
        unit: '%',
        status: 'warning',
        trend: 'up',
        change: 5.3,
        threshold: { warning: 80, critical: 95 },
        history: []
      },
      {
        id: '3',
        name: 'Disk Usage',
        value: 42,
        unit: '%',
        status: 'healthy',
        trend: 'up',
        change: 1.2,
        threshold: { warning: 80, critical: 95 },
        history: []
      },
      {
        id: '4',
        name: 'Network I/O',
        value: 125,
        unit: 'MB/s',
        status: 'healthy',
        trend: 'down',
        change: 3.8,
        threshold: { warning: 500, critical: 800 },
        history: []
      },
      {
        id: '5',
        name: 'Active Users',
        value: 1247,
        unit: '',
        status: 'healthy',
        trend: 'up',
        change: 8.2,
        threshold: { warning: 2000, critical: 3000 },
        history: []
      },
      {
        id: '6',
        name: 'Response Time',
        value: 45,
        unit: 'ms',
        status: 'healthy',
        trend: 'stable',
        change: 0.5,
        threshold: { warning: 200, critical: 500 },
        history: []
      }
    ],
    alerts: [
      {
        id: '1',
        severity: 'medium',
        message: 'Memory usage above 65%',
        timestamp: new Date().toISOString(),
        source: 'system-monitor'
      },
      {
        id: '2',
        severity: 'low',
        message: 'External API response time increased',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        source: 'health-check'
      }
    ]
  }

  const handleRunHealthCheck = (checkId: string) => {
    runHealthCheck(checkId)
  }

  const handleToggleService = (serviceId: string) => {
    toggleService(serviceId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoramento em Tempo Real</h1>
          <p className="text-muted-foreground">
            Acompanhamento contínuo da saúde e performance do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Status da conexão */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            )} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          {/* Controles */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={isRealTime}
              onCheckedChange={setIsRealTime}
            />
            <Label className="text-sm">Tempo Real</Label>
          </div>
          
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1s</SelectItem>
              <SelectItem value="5">5s</SelectItem>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Visão Geral */}
      <SystemOverviewCard data={mockData} />

      {/* Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RealTimeMonitor />
            <SystemHealth />
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-6">
          <ServicesCard services={mockData.services} />
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6">
          <HealthChecksCard healthChecks={mockData.healthChecks} />
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-6">
          <MetricsGrid metrics={mockData.metrics} />
        </TabsContent>
      </Tabs>
    </div>
  )
}