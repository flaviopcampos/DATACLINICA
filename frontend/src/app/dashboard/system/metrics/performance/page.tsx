'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Activity,
  BarChart3,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Download,
  Filter,
  Search,
  Calendar,
  Gauge,
  Monitor,
  Server,
  Wifi,
  Timer,
  Target,
  BarChart2,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Componentes
import { MetricsCard } from '@/components/MetricsCard'
import { PerformanceChart } from '@/components/PerformanceChart'
import { MetricsFilter } from '@/components/MetricsFilter'

// Hooks
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics'

interface PerformanceAlert {
  id: string
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: string
  acknowledged: boolean
}

interface ProcessInfo {
  pid: number
  name: string
  cpuUsage: number
  memoryUsage: number
  status: 'running' | 'sleeping' | 'stopped'
}

interface NetworkInterface {
  name: string
  type: 'ethernet' | 'wifi' | 'loopback'
  status: 'up' | 'down'
  bytesIn: number
  bytesOut: number
  packetsIn: number
  packetsOut: number
  speed: number
}

interface DiskInfo {
  device: string
  mountPoint: string
  fileSystem: string
  total: number
  used: number
  available: number
  usagePercent: number
  readSpeed: number
  writeSpeed: number
}

function PerformanceAlertsCard({ alerts }: { alerts: PerformanceAlert[] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high': return AlertTriangle
      case 'medium': return Clock
      case 'low': return Activity
      default: return Activity
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Alertas de Performance</span>
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
        <CardDescription>
          Alertas ativos baseados em thresholds configurados
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>Nenhum alerta ativo</p>
            <p className="text-sm">Todas as métricas estão dentro dos limites normais</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const SeverityIcon = getSeverityIcon(alert.severity)
              
              return (
                <div key={alert.id} className={cn(
                  'p-4 rounded-lg border',
                  getSeverityColor(alert.severity),
                  alert.acknowledged && 'opacity-60'
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <SeverityIcon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{alert.metric}</div>
                        <div className="text-sm mt-1">{alert.message}</div>
                        <div className="text-xs mt-2 opacity-75">
                          Valor: {alert.value} | Limite: {alert.threshold} | {alert.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {alert.acknowledged && (
                        <Badge variant="outline" className="text-xs">
                          Reconhecido
                        </Badge>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        Ações
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TopProcessesCard({ processes }: { processes: ProcessInfo[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600'
      case 'sleeping': return 'text-yellow-600'
      case 'stopped': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb.toFixed(1)} MB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Monitor className="h-5 w-5" />
          <span>Top Processos</span>
        </CardTitle>
        <CardDescription>
          Processos com maior uso de CPU e memória
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {processes.map((process) => (
            <div key={process.pid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{process.name}</div>
                <div className="text-sm text-gray-600">PID: {process.pid}</div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">{process.cpuUsage.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">CPU</div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium">{formatMemory(process.memoryUsage)}</div>
                  <div className="text-xs text-gray-600">RAM</div>
                </div>
                
                <div className={cn('text-center font-medium', getStatusColor(process.status))}>
                  {process.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function NetworkInterfacesCard({ interfaces }: { interfaces: NetworkInterface[] }) {
  const getInterfaceIcon = (type: string) => {
    switch (type) {
      case 'wifi': return Wifi
      case 'ethernet': return Network
      default: return Server
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'up' ? 'text-green-600' : 'text-red-600'
  }

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Network className="h-5 w-5" />
          <span>Interfaces de Rede</span>
        </CardTitle>
        <CardDescription>
          Status e estatísticas das interfaces de rede
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {interfaces.map((iface, index) => {
            const InterfaceIcon = getInterfaceIcon(iface.type)
            
            return (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <InterfaceIcon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{iface.name}</div>
                      <div className="text-sm text-gray-600">{iface.type}</div>
                    </div>
                  </div>
                  
                  <div className={cn('font-medium', getStatusColor(iface.status))}>
                    {iface.status.toUpperCase()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Entrada</div>
                    <div className="font-medium">{formatBytes(iface.bytesIn)}</div>
                    <div className="text-xs text-gray-500">{iface.packetsIn.toLocaleString()} pacotes</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Saída</div>
                    <div className="font-medium">{formatBytes(iface.bytesOut)}</div>
                    <div className="text-xs text-gray-500">{iface.packetsOut.toLocaleString()} pacotes</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Velocidade</div>
                    <div className="font-medium">{iface.speed} Mbps</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Tipo</div>
                    <div className="font-medium capitalize">{iface.type}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function DiskUsageCard({ disks }: { disks: DiskInfo[] }) {
  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600'
    if (percent >= 80) return 'text-orange-600'
    if (percent >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <HardDrive className="h-5 w-5" />
          <span>Uso de Disco</span>
        </CardTitle>
        <CardDescription>
          Informações detalhadas dos discos e partições
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {disks.map((disk, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">{disk.device}</div>
                  <div className="text-sm text-gray-600">{disk.mountPoint} • {disk.fileSystem}</div>
                </div>
                
                <div className={cn('text-lg font-bold', getUsageColor(disk.usagePercent))}>
                  {disk.usagePercent.toFixed(1)}%
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    disk.usagePercent >= 90 ? 'bg-red-500' :
                    disk.usagePercent >= 80 ? 'bg-orange-500' :
                    disk.usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  )}
                  style={{ width: `${disk.usagePercent}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Total</div>
                  <div className="font-medium">{formatBytes(disk.total)}</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Usado</div>
                  <div className="font-medium">{formatBytes(disk.used)}</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Disponível</div>
                  <div className="font-medium">{formatBytes(disk.available)}</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Leitura</div>
                  <div className="font-medium">{disk.readSpeed.toFixed(1)} MB/s</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Escrita</div>
                  <div className="font-medium">{disk.writeSpeed.toFixed(1)} MB/s</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isRealTime, setIsRealTime] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)
  const [timeRange, setTimeRange] = useState('1h')
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line')
  const [selectedMetrics, setSelectedMetrics] = useState(['cpu', 'memory'])
  
  // Hook de performance
  const {
    performanceData,
    alerts,
    isLoading,
    error,
    refreshPerformance,
    updateThresholds,
    exportData
  } = usePerformanceMetrics({
    autoRefresh: isRealTime,
    refreshInterval: refreshInterval * 1000,
    timeRange
  })

  // Mock data - em produção, viria do hook
  const mockAlerts: PerformanceAlert[] = [
    {
      id: '1',
      metric: 'CPU Usage',
      severity: 'high',
      message: 'CPU usage above 85% for more than 5 minutes',
      value: 87.5,
      threshold: 85,
      timestamp: '2 min atrás',
      acknowledged: false
    },
    {
      id: '2',
      metric: 'Memory Usage',
      severity: 'medium',
      message: 'Memory usage approaching warning threshold',
      value: 78.2,
      threshold: 80,
      timestamp: '5 min atrás',
      acknowledged: true
    }
  ]

  const mockProcesses: ProcessInfo[] = [
    { pid: 1234, name: 'node.js', cpuUsage: 15.2, memoryUsage: 512 * 1024 * 1024, status: 'running' },
    { pid: 5678, name: 'postgres', cpuUsage: 8.7, memoryUsage: 256 * 1024 * 1024, status: 'running' },
    { pid: 9012, name: 'nginx', cpuUsage: 3.1, memoryUsage: 64 * 1024 * 1024, status: 'running' },
    { pid: 3456, name: 'redis', cpuUsage: 2.8, memoryUsage: 128 * 1024 * 1024, status: 'sleeping' },
    { pid: 7890, name: 'docker', cpuUsage: 1.9, memoryUsage: 32 * 1024 * 1024, status: 'running' }
  ]

  const mockInterfaces: NetworkInterface[] = [
    {
      name: 'eth0',
      type: 'ethernet',
      status: 'up',
      bytesIn: 1024 * 1024 * 1024 * 2.5,
      bytesOut: 1024 * 1024 * 1024 * 1.8,
      packetsIn: 1500000,
      packetsOut: 1200000,
      speed: 1000
    },
    {
      name: 'wlan0',
      type: 'wifi',
      status: 'up',
      bytesIn: 1024 * 1024 * 512,
      bytesOut: 1024 * 1024 * 256,
      packetsIn: 750000,
      packetsOut: 600000,
      speed: 150
    }
  ]

  const mockDisks: DiskInfo[] = [
    {
      device: '/dev/sda1',
      mountPoint: '/',
      fileSystem: 'ext4',
      total: 1024 * 1024 * 1024 * 100, // 100GB
      used: 1024 * 1024 * 1024 * 75,   // 75GB
      available: 1024 * 1024 * 1024 * 25, // 25GB
      usagePercent: 75,
      readSpeed: 120.5,
      writeSpeed: 85.2
    },
    {
      device: '/dev/sdb1',
      mountPoint: '/var',
      fileSystem: 'ext4',
      total: 1024 * 1024 * 1024 * 50,  // 50GB
      used: 1024 * 1024 * 1024 * 42,   // 42GB
      available: 1024 * 1024 * 1024 * 8, // 8GB
      usagePercent: 84,
      readSpeed: 95.3,
      writeSpeed: 67.8
    }
  ]

  const handleExportData = () => {
    exportData('csv')
  }

  const handleRefresh = () => {
    refreshPerformance()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas de Performance</h1>
          <p className="text-muted-foreground">
            Monitoramento detalhado de CPU, memória, disco e rede
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Controles */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={isRealTime}
              onCheckedChange={setIsRealTime}
            />
            <Label className="text-sm">Tempo Real</Label>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 min</SelectItem>
              <SelectItem value="15m">15 min</SelectItem>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="6h">6 horas</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      {performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="CPU"
            value={performanceData.cpu.current}
            unit="%"
            trend={performanceData.cpu.trend}
            status={performanceData.cpu.status}
            threshold={{ warning: 70, critical: 85 }}
            icon={Cpu}
            size="default"
            showProgress
            showTrend
            lastUpdate={performanceData.cpu.lastUpdate}
          />
          
          <MetricsCard
            title="Memória"
            value={performanceData.memory.current}
            unit="%"
            trend={performanceData.memory.trend}
            status={performanceData.memory.status}
            threshold={{ warning: 80, critical: 90 }}
            icon={MemoryStick}
            size="default"
            showProgress
            showTrend
            lastUpdate={performanceData.memory.lastUpdate}
          />
          
          <MetricsCard
            title="Disco"
            value={performanceData.disk.current}
            unit="%"
            trend={performanceData.disk.trend}
            status={performanceData.disk.status}
            threshold={{ warning: 85, critical: 95 }}
            icon={HardDrive}
            size="default"
            showProgress
            showTrend
            lastUpdate={performanceData.disk.lastUpdate}
          />
          
          <MetricsCard
            title="Rede"
            value={performanceData.network.current}
            unit="MB/s"
            trend={performanceData.network.trend}
            status={performanceData.network.status}
            icon={Network}
            size="default"
            showTrend
            lastUpdate={performanceData.network.lastUpdate}
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="processes">Processos</TabsTrigger>
          <TabsTrigger value="network">Rede</TabsTrigger>
          <TabsTrigger value="storage">Armazenamento</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Controles do gráfico */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Label>Tipo de Gráfico:</Label>
                  <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Linha</SelectItem>
                      <SelectItem value="area">Área</SelectItem>
                      <SelectItem value="bar">Barra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label>Métricas:</Label>
                  <div className="flex space-x-2">
                    {['cpu', 'memory', 'disk', 'network'].map((metric) => (
                      <Button
                        key={metric}
                        size="sm"
                        variant={selectedMetrics.includes(metric) ? 'default' : 'outline'}
                        onClick={() => {
                          if (selectedMetrics.includes(metric)) {
                            setSelectedMetrics(selectedMetrics.filter(m => m !== metric))
                          } else {
                            setSelectedMetrics([...selectedMetrics, metric])
                          }
                        }}
                      >
                        {metric.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Gráfico principal */}
          {performanceData && (
            <Card>
              <CardHeader>
                <CardTitle>Performance ao Longo do Tempo</CardTitle>
                <CardDescription>
                  Histórico de {timeRange} das métricas selecionadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart
                  data={performanceData.history}
                  metrics={selectedMetrics}
                  timeRange={timeRange}
                  chartType={chartType}
                  showLegend
                  showGrid
                  showThresholds
                  isRealTime={isRealTime}
                  height={400}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="processes" className="space-y-6">
          <TopProcessesCard processes={mockProcesses} />
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <NetworkInterfacesCard interfaces={mockInterfaces} />
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <DiskUsageCard disks={mockDisks} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <PerformanceAlertsCard alerts={mockAlerts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}