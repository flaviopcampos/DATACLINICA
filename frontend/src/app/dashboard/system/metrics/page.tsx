'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  Users,
  Zap,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Globe,
  Server,
  Gauge
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Componentes
import { MetricsCard } from '@/components/MetricsCard'
import { PerformanceChart } from '@/components/PerformanceChart'
import { RealTimeMonitor } from '@/components/RealTimeMonitor'
import { SystemHealth } from '@/components/SystemHealth'
import { ResourceUsage } from '@/components/ResourceUsage'
import { MetricsFilter } from '@/components/MetricsFilter'

// Hooks
import { useSystemMetrics } from '@/hooks/useSystemMetrics'
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics'
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring'

interface QuickStatsData {
  totalMetrics: number
  activeAlerts: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  uptime: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkActivity: number
}

interface MetricsSummary {
  category: string
  count: number
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  lastUpdate: string
}

function QuickStatsCard({ stats }: { stats: QuickStatsData }) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return AlertTriangle
      default: return Activity
    }
  }

  const HealthIcon = getHealthIcon(stats.systemHealth)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <HealthIcon className={cn('h-5 w-5', getHealthColor(stats.systemHealth))} />
          <span>Status do Sistema</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalMetrics}</div>
            <div className="text-sm text-gray-600">Métricas</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.activeAlerts}</div>
            <div className="text-sm text-gray-600">Alertas Ativos</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={cn('text-2xl font-bold', getHealthColor(stats.systemHealth))}>
              {stats.systemHealth.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">Saúde</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{formatUptime(stats.uptime)}</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
        
        {/* Métricas rápidas */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            <span className="text-sm">CPU: {stats.cpuUsage.toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MemoryStick className="h-4 w-4 text-purple-600" />
            <span className="text-sm">RAM: {stats.memoryUsage.toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <HardDrive className="h-4 w-4 text-green-600" />
            <span className="text-sm">Disco: {stats.diskUsage.toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Network className="h-4 w-4 text-orange-600" />
            <span className="text-sm">Rede: {stats.networkActivity.toFixed(1)} MB/s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricsCategoriesCard({ categories }: { categories: MetricsSummary[] }) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Activity
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
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Categorias de Métricas</span>
        </CardTitle>
        <CardDescription>
          Resumo das métricas por categoria
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {categories.map((category, index) => {
            const TrendIcon = getTrendIcon(category.trend)
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{category.category}</div>
                  <div className="text-sm text-gray-600">
                    {category.count} métricas • Atualizado {category.lastUpdate}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={cn('text-xs', getStatusColor(category.status))}>
                    {category.status}
                  </Badge>
                  
                  <TrendIcon className={cn('h-4 w-4', getTrendColor(category.trend))} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Ações Rápidas</span>
        </CardTitle>
        <CardDescription>
          Acesso rápido às funcionalidades principais
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/dashboard/system/metrics/performance">
            <Button variant="outline" className="w-full justify-start">
              <Gauge className="h-4 w-4 mr-2" />
              Performance
            </Button>
          </Link>
          
          <Link href="/dashboard/system/metrics/logs">
            <Button variant="outline" className="w-full justify-start">
              <Database className="h-4 w-4 mr-2" />
              Logs do Sistema
            </Button>
          </Link>
          
          <Link href="/dashboard/system/metrics/monitoring">
            <Button variant="outline" className="w-full justify-start">
              <Eye className="h-4 w-4 mr-2" />
              Monitoramento
            </Button>
          </Link>
          
          <Link href="/dashboard/system/metrics/alerts">
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alertas
            </Button>
          </Link>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="ghost" size="sm" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
            
            <Button variant="ghost" size="sm" className="justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isRealTime, setIsRealTime] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Hooks
  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refreshMetrics
  } = useSystemMetrics({
    autoRefresh: isRealTime,
    refreshInterval: refreshInterval * 1000
  })
  
  const {
    performanceData,
    isLoading: performanceLoading,
    refreshPerformance
  } = usePerformanceMetrics({
    autoRefresh: isRealTime,
    refreshInterval: refreshInterval * 1000
  })
  
  const {
    monitoringData,
    isLoading: monitoringLoading,
    refreshMonitoring
  } = useRealTimeMonitoring({
    autoRefresh: isRealTime,
    refreshInterval: refreshInterval * 1000
  })

  // Mock data - em produção, viria dos hooks
  const quickStats: QuickStatsData = {
    totalMetrics: 156,
    activeAlerts: 3,
    systemHealth: 'warning',
    uptime: 2592000, // 30 dias
    cpuUsage: 45.2,
    memoryUsage: 67.8,
    diskUsage: 82.1,
    networkActivity: 12.5
  }

  const metricsCategories: MetricsSummary[] = [
    {
      category: 'Performance',
      count: 24,
      status: 'healthy',
      trend: 'stable',
      lastUpdate: '2 min atrás'
    },
    {
      category: 'Recursos do Sistema',
      count: 18,
      status: 'warning',
      trend: 'up',
      lastUpdate: '1 min atrás'
    },
    {
      category: 'Rede',
      count: 12,
      status: 'healthy',
      trend: 'down',
      lastUpdate: '3 min atrás'
    },
    {
      category: 'Aplicação',
      count: 32,
      status: 'critical',
      trend: 'up',
      lastUpdate: '30 seg atrás'
    },
    {
      category: 'Segurança',
      count: 8,
      status: 'healthy',
      trend: 'stable',
      lastUpdate: '5 min atrás'
    },
    {
      category: 'Usuários',
      count: 15,
      status: 'healthy',
      trend: 'up',
      lastUpdate: '1 min atrás'
    }
  ]

  const handleRefreshAll = () => {
    refreshMetrics()
    refreshPerformance()
    refreshMonitoring()
  }

  const isLoading = metricsLoading || performanceLoading || monitoringLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento completo de performance e recursos do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Controles de tempo real */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={isRealTime}
              onCheckedChange={setIsRealTime}
            />
            <Label className="text-sm">Tempo Real</Label>
            
            {isRealTime && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1min</option>
              </select>
            )}
          </div>
          
          {/* Refresh manual */}
          <Button onClick={handleRefreshAll} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar métricas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Todas as Categorias</option>
              <option value="performance">Performance</option>
              <option value="resources">Recursos</option>
              <option value="network">Rede</option>
              <option value="application">Aplicação</option>
              <option value="security">Segurança</option>
              <option value="users">Usuários</option>
            </select>
            
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status rápido */}
      <QuickStatsCard stats={quickStats} />

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="health">Saúde</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsCategoriesCard categories={metricsCategories} />
            <QuickActionsCard />
          </div>
          
          {/* Gráficos de overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CPU e Memória</CardTitle>
                <CardDescription>Últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData && (
                  <PerformanceChart
                    data={performanceData.history}
                    metrics={['cpu', 'memory']}
                    timeRange="24h"
                    chartType="area"
                    showLegend
                    showGrid
                    height={200}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Atividade de Rede</CardTitle>
                <CardDescription>Tráfego de entrada e saída</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData && (
                  <PerformanceChart
                    data={performanceData.networkHistory}
                    metrics={['networkIn', 'networkOut']}
                    timeRange="24h"
                    chartType="line"
                    showLegend
                    showGrid
                    height={200}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {performanceData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <MetricsCard
                title="CPU"
                value={performanceData.cpu.current}
                unit="%"
                trend={performanceData.cpu.trend}
                status={performanceData.cpu.status}
                threshold={{ warning: 70, critical: 90 }}
                icon={Cpu}
              />
              
              <MetricsCard
                title="Memória"
                value={performanceData.memory.current}
                unit="%"
                trend={performanceData.memory.trend}
                status={performanceData.memory.status}
                threshold={{ warning: 80, critical: 95 }}
                icon={MemoryStick}
              />
              
              <MetricsCard
                title="Disco"
                value={performanceData.disk.current}
                unit="%"
                trend={performanceData.disk.trend}
                status={performanceData.disk.status}
                threshold={{ warning: 85, critical: 95 }}
                icon={HardDrive}
              />
              
              <MetricsCard
                title="Rede"
                value={performanceData.network.current}
                unit="MB/s"
                trend={performanceData.network.trend}
                status={performanceData.network.status}
                icon={Network}
              />
            </div>
          )}
          
          {performanceData && (
            <PerformanceChart
              data={performanceData.history}
              metrics={['cpu', 'memory', 'disk', 'network']}
              timeRange="24h"
              chartType="line"
              showLegend
              showGrid
              showThresholds
              isRealTime={isRealTime}
              height={400}
            />
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {performanceData && (
            <ResourceUsage
              data={performanceData.resourceData}
              isLoading={performanceLoading}
              isRealTime={isRealTime}
              refreshInterval={refreshInterval}
              onToggleRealTime={setIsRealTime}
              onRefreshIntervalChange={setRefreshInterval}
              onRefresh={refreshPerformance}
            />
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {monitoringData && (
            <RealTimeMonitor
              data={monitoringData}
              isLoading={monitoringLoading}
              isRealTime={isRealTime}
              refreshInterval={refreshInterval}
              onToggleRealTime={setIsRealTime}
              onRefreshIntervalChange={setRefreshInterval}
              onRefresh={refreshMonitoring}
            />
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {monitoringData && (
            <SystemHealth
              data={monitoringData.healthData}
              isLoading={monitoringLoading}
              onRefresh={refreshMonitoring}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}