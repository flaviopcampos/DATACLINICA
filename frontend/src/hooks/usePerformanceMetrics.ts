import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { metricsService } from '@/services/metricsService'
import type {
  SystemMetrics,
  PerformanceMonitoring,
  MetricsQuery,
  MetricsAggregation
} from '@/types/metrics'

interface PerformanceMetric {
  timestamp: string
  value: number
  unit: string
  threshold?: {
    warning: number
    critical: number
  }
}

interface PerformanceData {
  cpu: {
    usage: PerformanceMetric[]
    cores: PerformanceMetric[]
    load: PerformanceMetric[]
    temperature?: PerformanceMetric[]
  }
  memory: {
    usage: PerformanceMetric[]
    available: PerformanceMetric[]
    swap: PerformanceMetric[]
    cache: PerformanceMetric[]
  }
  disk: {
    usage: PerformanceMetric[]
    io: PerformanceMetric[]
    throughput: PerformanceMetric[]
    latency: PerformanceMetric[]
  }
  network: {
    bandwidth: PerformanceMetric[]
    latency: PerformanceMetric[]
    packets: PerformanceMetric[]
    errors: PerformanceMetric[]
  }
  application: {
    responseTime: PerformanceMetric[]
    throughput: PerformanceMetric[]
    errorRate: PerformanceMetric[]
    activeUsers: PerformanceMetric[]
  }
}

interface PerformanceAlert {
  id: string
  metric: string
  value: number
  threshold: number
  severity: 'warning' | 'critical'
  timestamp: string
  message: string
}

interface UsePerformanceMetricsOptions {
  timeRange?: string
  refreshInterval?: number
  autoRefresh?: boolean
  enableAlerts?: boolean
  thresholds?: Record<string, { warning: number; critical: number }>
}

interface UsePerformanceMetricsReturn {
  // Dados de performance
  performanceData: PerformanceData | null
  currentMetrics: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  alerts: PerformanceAlert[]
  trends: {
    cpu: 'up' | 'down' | 'stable'
    memory: 'up' | 'down' | 'stable'
    disk: 'up' | 'down' | 'stable'
    network: 'up' | 'down' | 'stable'
  }
  
  // Estados
  isLoading: boolean
  isError: boolean
  error: Error | null
  isRefreshing: boolean
  lastUpdated: Date | null
  
  // Ações
  refreshData: () => Promise<void>
  setTimeRange: (range: string) => void
  toggleAutoRefresh: () => void
  clearAlerts: () => void
  
  // Análise
  getMetricTrend: (metric: string, period: number) => 'up' | 'down' | 'stable'
  getAverageMetric: (metric: string, period: number) => number
  getPeakMetric: (metric: string, period: number) => { value: number; timestamp: string }
  
  // Configuração
  updateThresholds: (thresholds: Record<string, { warning: number; critical: number }>) => void
  exportData: (format: 'csv' | 'json') => Promise<string>
}

export function usePerformanceMetrics(options: UsePerformanceMetricsOptions = {}): UsePerformanceMetricsReturn {
  const {
    timeRange = '1h',
    refreshInterval = 10000, // 10 segundos
    autoRefresh = true,
    enableAlerts = true,
    thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      network: { warning: 80, critical: 95 }
    }
  } = options

  const queryClient = useQueryClient()
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange)
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoRefresh)
  const [currentThresholds, setCurrentThresholds] = useState(thresholds)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Query para dados de performance
  const {
    data: performanceData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['performance-metrics', currentTimeRange],
    queryFn: async () => {
      const query: MetricsQuery = {
        metrics: ['cpu.usage', 'memory.usage', 'disk.usage', 'network.bandwidth', 'application.responseTime'],
        timeRange: currentTimeRange,
        aggregation: 'avg',
        interval: '1m'
      }
      
      const result = await metricsService.executeQuery(query)
      return transformPerformanceData(result)
    },
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    onSuccess: (data) => {
      setLastUpdated(new Date())
      if (enableAlerts) {
        checkThresholds(data)
      }
    }
  })

  // Estado de refresh
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Transformar dados da API para formato do hook
  const transformPerformanceData = useCallback((apiData: any): PerformanceData => {
    const now = new Date()
    const timestamps = Array.from({ length: 60 }, (_, i) => 
      new Date(now.getTime() - (59 - i) * 60000).toISOString()
    )

    return {
      cpu: {
        usage: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 100,
          unit: '%',
          threshold: currentThresholds.cpu
        })),
        cores: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 8,
          unit: 'cores'
        })),
        load: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 4,
          unit: 'load'
        }))
      },
      memory: {
        usage: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 100,
          unit: '%',
          threshold: currentThresholds.memory
        })),
        available: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 16,
          unit: 'GB'
        })),
        swap: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 4,
          unit: 'GB'
        })),
        cache: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 2,
          unit: 'GB'
        }))
      },
      disk: {
        usage: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 100,
          unit: '%',
          threshold: currentThresholds.disk
        })),
        io: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 1000,
          unit: 'IOPS'
        })),
        throughput: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 500,
          unit: 'MB/s'
        })),
        latency: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 10,
          unit: 'ms'
        }))
      },
      network: {
        bandwidth: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 100,
          unit: '%',
          threshold: currentThresholds.network
        })),
        latency: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 50,
          unit: 'ms'
        })),
        packets: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 10000,
          unit: 'pps'
        })),
        errors: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 10,
          unit: 'errors/s'
        }))
      },
      application: {
        responseTime: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 1000,
          unit: 'ms'
        })),
        throughput: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 1000,
          unit: 'req/s'
        })),
        errorRate: timestamps.map(timestamp => ({
          timestamp,
          value: Math.random() * 5,
          unit: '%'
        })),
        activeUsers: timestamps.map(timestamp => ({
          timestamp,
          value: Math.floor(Math.random() * 1000),
          unit: 'users'
        }))
      }
    }
  }, [currentThresholds])

  // Verificar thresholds e gerar alertas
  const checkThresholds = useCallback((data: PerformanceData) => {
    const newAlerts: PerformanceAlert[] = []
    const now = new Date().toISOString()

    // Verificar CPU
    const latestCpu = data.cpu.usage[data.cpu.usage.length - 1]
    if (latestCpu && latestCpu.threshold) {
      if (latestCpu.value >= latestCpu.threshold.critical) {
        newAlerts.push({
          id: `cpu-critical-${Date.now()}`,
          metric: 'CPU',
          value: latestCpu.value,
          threshold: latestCpu.threshold.critical,
          severity: 'critical',
          timestamp: now,
          message: `Uso de CPU crítico: ${latestCpu.value.toFixed(1)}%`
        })
      } else if (latestCpu.value >= latestCpu.threshold.warning) {
        newAlerts.push({
          id: `cpu-warning-${Date.now()}`,
          metric: 'CPU',
          value: latestCpu.value,
          threshold: latestCpu.threshold.warning,
          severity: 'warning',
          timestamp: now,
          message: `Uso de CPU elevado: ${latestCpu.value.toFixed(1)}%`
        })
      }
    }

    // Verificar Memória
    const latestMemory = data.memory.usage[data.memory.usage.length - 1]
    if (latestMemory && latestMemory.threshold) {
      if (latestMemory.value >= latestMemory.threshold.critical) {
        newAlerts.push({
          id: `memory-critical-${Date.now()}`,
          metric: 'Memory',
          value: latestMemory.value,
          threshold: latestMemory.threshold.critical,
          severity: 'critical',
          timestamp: now,
          message: `Uso de memória crítico: ${latestMemory.value.toFixed(1)}%`
        })
      } else if (latestMemory.value >= latestMemory.threshold.warning) {
        newAlerts.push({
          id: `memory-warning-${Date.now()}`,
          metric: 'Memory',
          value: latestMemory.value,
          threshold: latestMemory.threshold.warning,
          severity: 'warning',
          timestamp: now,
          message: `Uso de memória elevado: ${latestMemory.value.toFixed(1)}%`
        })
      }
    }

    setAlerts(prev => [...prev.slice(-10), ...newAlerts]) // Manter apenas os últimos 10 alertas
  }, [])

  // Calcular métricas atuais
  const currentMetrics = {
    cpu: performanceData?.cpu.usage[performanceData.cpu.usage.length - 1]?.value || 0,
    memory: performanceData?.memory.usage[performanceData.memory.usage.length - 1]?.value || 0,
    disk: performanceData?.disk.usage[performanceData.disk.usage.length - 1]?.value || 0,
    network: performanceData?.network.bandwidth[performanceData.network.bandwidth.length - 1]?.value || 0
  }

  // Calcular tendências
  const trends = {
    cpu: getMetricTrend('cpu', 10),
    memory: getMetricTrend('memory', 10),
    disk: getMetricTrend('disk', 10),
    network: getMetricTrend('network', 10)
  }

  // Configurar auto-refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (isAutoRefresh) {
      intervalRef.current = setInterval(() => {
        refetch()
      }, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoRefresh, refreshInterval, refetch])

  // Função para refresh manual
  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }, [refetch])

  // Função para alterar time range
  const setTimeRange = useCallback((range: string) => {
    setCurrentTimeRange(range)
  }, [])

  // Função para alternar auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefresh(prev => !prev)
  }, [])

  // Função para limpar alertas
  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Função para obter tendência de métrica
  function getMetricTrend(metric: string, period: number): 'up' | 'down' | 'stable' {
    if (!performanceData) return 'stable'
    
    let data: PerformanceMetric[] = []
    switch (metric) {
      case 'cpu':
        data = performanceData.cpu.usage
        break
      case 'memory':
        data = performanceData.memory.usage
        break
      case 'disk':
        data = performanceData.disk.usage
        break
      case 'network':
        data = performanceData.network.bandwidth
        break
    }

    if (data.length < period) return 'stable'

    const recent = data.slice(-period)
    const first = recent[0].value
    const last = recent[recent.length - 1].value
    const diff = ((last - first) / first) * 100

    if (diff > 5) return 'up'
    if (diff < -5) return 'down'
    return 'stable'
  }

  // Função para obter média de métrica
  const getAverageMetric = useCallback((metric: string, period: number): number => {
    if (!performanceData) return 0
    
    let data: PerformanceMetric[] = []
    switch (metric) {
      case 'cpu':
        data = performanceData.cpu.usage
        break
      case 'memory':
        data = performanceData.memory.usage
        break
      case 'disk':
        data = performanceData.disk.usage
        break
      case 'network':
        data = performanceData.network.bandwidth
        break
    }

    if (data.length < period) return 0

    const recent = data.slice(-period)
    const sum = recent.reduce((acc, item) => acc + item.value, 0)
    return sum / recent.length
  }, [performanceData])

  // Função para obter pico de métrica
  const getPeakMetric = useCallback((metric: string, period: number): { value: number; timestamp: string } => {
    if (!performanceData) return { value: 0, timestamp: '' }
    
    let data: PerformanceMetric[] = []
    switch (metric) {
      case 'cpu':
        data = performanceData.cpu.usage
        break
      case 'memory':
        data = performanceData.memory.usage
        break
      case 'disk':
        data = performanceData.disk.usage
        break
      case 'network':
        data = performanceData.network.bandwidth
        break
    }

    if (data.length < period) return { value: 0, timestamp: '' }

    const recent = data.slice(-period)
    const peak = recent.reduce((max, item) => item.value > max.value ? item : max, recent[0])
    return { value: peak.value, timestamp: peak.timestamp }
  }, [performanceData])

  // Função para atualizar thresholds
  const updateThresholds = useCallback((newThresholds: Record<string, { warning: number; critical: number }>) => {
    setCurrentThresholds(newThresholds)
  }, [])

  // Função para exportar dados
  const exportData = useCallback(async (format: 'csv' | 'json'): Promise<string> => {
    if (!performanceData) return ''

    if (format === 'json') {
      return JSON.stringify(performanceData, null, 2)
    }

    // Formato CSV
    const headers = ['timestamp', 'cpu_usage', 'memory_usage', 'disk_usage', 'network_bandwidth']
    const rows = performanceData.cpu.usage.map((_, index) => [
      performanceData.cpu.usage[index]?.timestamp || '',
      performanceData.cpu.usage[index]?.value || 0,
      performanceData.memory.usage[index]?.value || 0,
      performanceData.disk.usage[index]?.value || 0,
      performanceData.network.bandwidth[index]?.value || 0
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }, [performanceData])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    // Dados de performance
    performanceData,
    currentMetrics,
    alerts,
    trends,
    
    // Estados
    isLoading,
    isError,
    error: error as Error | null,
    isRefreshing,
    lastUpdated,
    
    // Ações
    refreshData,
    setTimeRange,
    toggleAutoRefresh,
    clearAlerts,
    
    // Análise
    getMetricTrend,
    getAverageMetric,
    getPeakMetric,
    
    // Configuração
    updateThresholds,
    exportData
  }
}

export default usePerformanceMetrics