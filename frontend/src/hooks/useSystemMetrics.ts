import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { metricsService } from '@/services/metricsService'
import type {
  SystemMetrics,
  MetricsQuery,
  MetricsAggregation,
  MetricsComparison,
  MetricsAnomaly,
  MetricsDashboard,
  MetricsAlert,
  MetricsConfiguration
} from '@/types/metrics'

interface UseSystemMetricsOptions {
  refreshInterval?: number
  autoRefresh?: boolean
  enableRealTime?: boolean
  cacheTime?: number
}

interface UseSystemMetricsReturn {
  // Dados
  metrics: SystemMetrics | null
  realtimeMetrics: SystemMetrics | null
  statistics: any | null
  availableMetrics: string[]
  sources: string[]
  
  // Estados
  isLoading: boolean
  isError: boolean
  error: Error | null
  isRefreshing: boolean
  lastUpdated: Date | null
  
  // Ações
  refreshMetrics: () => Promise<void>
  toggleAutoRefresh: () => void
  clearCache: () => Promise<void>
  
  // Queries
  executeQuery: (query: MetricsQuery) => Promise<any>
  getAggregations: (config: any) => Promise<MetricsAggregation[]>
  compareMetrics: (config: any) => Promise<MetricsComparison>
  detectAnomalies: (config: any) => Promise<MetricsAnomaly[]>
  
  // Configuração
  updateRefreshInterval: (interval: number) => void
}

export function useSystemMetrics(options: UseSystemMetricsOptions = {}): UseSystemMetricsReturn {
  const {
    refreshInterval = 30000, // 30 segundos
    autoRefresh = true,
    enableRealTime = false,
    cacheTime = 300000 // 5 minutos
  } = options

  const queryClient = useQueryClient()
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoRefresh)
  const [currentRefreshInterval, setCurrentRefreshInterval] = useState(refreshInterval)
  const [realtimeMetrics, setRealtimeMetrics] = useState<SystemMetrics | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Query para métricas gerais
  const {
    data: metrics,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => metricsService.getSystemMetrics(),
    refetchInterval: isAutoRefresh ? currentRefreshInterval : false,
    staleTime: cacheTime,
    onSuccess: () => {
      setLastUpdated(new Date())
    }
  })

  // Query para estatísticas
  const { data: statistics } = useQuery({
    queryKey: ['metrics-statistics'],
    queryFn: () => metricsService.getMetricsStatistics(),
    staleTime: cacheTime
  })

  // Query para métricas disponíveis
  const { data: availableMetrics = [] } = useQuery({
    queryKey: ['available-metrics'],
    queryFn: () => metricsService.getAvailableMetrics(),
    staleTime: 600000 // 10 minutos
  })

  // Query para fontes de métricas
  const { data: sources = [] } = useQuery({
    queryKey: ['metrics-sources'],
    queryFn: () => metricsService.getMetricsSources(),
    staleTime: 600000 // 10 minutos
  })

  // Estado de refresh
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mutation para executar queries
  const executeQueryMutation = useMutation({
    mutationFn: (query: MetricsQuery) => metricsService.executeQuery(query)
  })

  // Mutation para agregações
  const getAggregationsMutation = useMutation({
    mutationFn: (config: any) => metricsService.getAggregations(config)
  })

  // Mutation para comparação
  const compareMetricsMutation = useMutation({
    mutationFn: (config: any) => metricsService.compareMetrics(config)
  })

  // Mutation para detecção de anomalias
  const detectAnomaliesMutation = useMutation({
    mutationFn: (config: any) => metricsService.detectAnomalies(config)
  })

  // Mutation para limpar cache
  const clearCacheMutation = useMutation({
    mutationFn: () => metricsService.clearCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-metrics'] })
      queryClient.invalidateQueries({ queryKey: ['metrics-statistics'] })
    }
  })

  // Configurar WebSocket para dados em tempo real
  useEffect(() => {
    if (!enableRealTime) return

    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
        wsRef.current = new WebSocket(`${wsUrl}/metrics`)

        wsRef.current.onopen = () => {
          console.log('WebSocket conectado para métricas em tempo real')
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'metrics-update') {
              setRealtimeMetrics(data.metrics)
              setLastUpdated(new Date())
            }
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error)
          }
        }

        wsRef.current.onclose = () => {
          console.log('WebSocket desconectado')
          // Tentar reconectar após 5 segundos
          setTimeout(connectWebSocket, 5000)
        }

        wsRef.current.onerror = (error) => {
          console.error('Erro no WebSocket:', error)
        }
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [enableRealTime])

  // Configurar intervalo de refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (isAutoRefresh && !enableRealTime) {
      intervalRef.current = setInterval(() => {
        refetch()
      }, currentRefreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoRefresh, currentRefreshInterval, enableRealTime, refetch])

  // Função para refresh manual
  const refreshMetrics = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      await queryClient.invalidateQueries({ queryKey: ['metrics-statistics'] })
    } finally {
      setIsRefreshing(false)
    }
  }, [refetch, queryClient])

  // Função para alternar auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefresh(prev => !prev)
  }, [])

  // Função para limpar cache
  const clearCache = useCallback(async () => {
    await clearCacheMutation.mutateAsync()
  }, [clearCacheMutation])

  // Função para executar query
  const executeQuery = useCallback(async (query: MetricsQuery) => {
    return executeQueryMutation.mutateAsync(query)
  }, [executeQueryMutation])

  // Função para obter agregações
  const getAggregations = useCallback(async (config: any) => {
    return getAggregationsMutation.mutateAsync(config)
  }, [getAggregationsMutation])

  // Função para comparar métricas
  const compareMetrics = useCallback(async (config: any) => {
    return compareMetricsMutation.mutateAsync(config)
  }, [compareMetricsMutation])

  // Função para detectar anomalias
  const detectAnomalies = useCallback(async (config: any) => {
    return detectAnomaliesMutation.mutateAsync(config)
  }, [detectAnomaliesMutation])

  // Função para atualizar intervalo de refresh
  const updateRefreshInterval = useCallback((interval: number) => {
    setCurrentRefreshInterval(interval)
  }, [])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return {
    // Dados
    metrics: metrics || null,
    realtimeMetrics,
    statistics,
    availableMetrics,
    sources,
    
    // Estados
    isLoading,
    isError,
    error: error as Error | null,
    isRefreshing,
    lastUpdated,
    
    // Ações
    refreshMetrics,
    toggleAutoRefresh,
    clearCache,
    
    // Queries
    executeQuery,
    getAggregations,
    compareMetrics,
    detectAnomalies,
    
    // Configuração
    updateRefreshInterval
  }
}

// Hook especializado para métricas de recursos do sistema
export function useSystemResourceMetrics(options: UseSystemMetricsOptions = {}) {
  const { metrics, isLoading, isError, error, refreshMetrics } = useSystemMetrics(options)
  
  return {
    cpu: metrics?.system?.cpu || null,
    memory: metrics?.system?.memory || null,
    disk: metrics?.system?.disk || null,
    network: metrics?.system?.network || null,
    isLoading,
    isError,
    error,
    refreshMetrics
  }
}

// Hook especializado para métricas de aplicação
export function useApplicationMetrics(options: UseSystemMetricsOptions = {}) {
  const { metrics, isLoading, isError, error, refreshMetrics } = useSystemMetrics(options)
  
  return {
    requests: metrics?.application?.requests || null,
    responses: metrics?.application?.responses || null,
    errors: metrics?.application?.errors || null,
    sessions: metrics?.application?.sessions || null,
    cache: metrics?.application?.cache || null,
    isLoading,
    isError,
    error,
    refreshMetrics
  }
}

// Hook especializado para métricas de negócio
export function useBusinessMetrics(options: UseSystemMetricsOptions = {}) {
  const { metrics, isLoading, isError, error, refreshMetrics } = useSystemMetrics(options)
  
  return {
    users: metrics?.business?.users || null,
    revenue: metrics?.business?.revenue || null,
    conversions: metrics?.business?.conversions || null,
    engagement: metrics?.business?.engagement || null,
    isLoading,
    isError,
    error,
    refreshMetrics
  }
}

export default useSystemMetrics