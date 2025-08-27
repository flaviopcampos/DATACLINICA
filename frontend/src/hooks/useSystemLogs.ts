import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logsService } from '@/services/logsService'
import type {
  SystemLog,
  LogFilter,
  LogPagination,
  LogSearchResult,
  LogAggregations,
  LogLevel,
  LogSource,
  LogCategory,
  LogConfiguration,
  LogStatistics,
  LogStream,
  LogAlert,
  LogDashboard
} from '@/types/logs'

interface UseSystemLogsOptions {
  pageSize?: number
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTime?: boolean
  defaultFilters?: Partial<LogFilter>
}

interface UseSystemLogsReturn {
  // Dados dos logs
  logs: SystemLog[]
  totalLogs: number
  hasMore: boolean
  statistics: LogStatistics | null
  aggregations: LogAggregations | null
  availableSources: LogSource[]
  availableCategories: LogCategory[]
  
  // Estados
  isLoading: boolean
  isError: boolean
  error: Error | null
  isRefreshing: boolean
  currentPage: number
  
  // Filtros e busca
  filters: LogFilter
  searchQuery: string
  
  // Ações
  setFilters: (filters: Partial<LogFilter>) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void
  refreshLogs: () => Promise<void>
  loadMore: () => Promise<void>
  goToPage: (page: number) => void
  
  // Funcionalidades avançadas
  exportLogs: (format: 'csv' | 'json' | 'txt') => Promise<string>
  getLogById: (id: string) => Promise<SystemLog | null>
  getRelatedLogs: (logId: string) => Promise<SystemLog[]>
  
  // Real-time
  toggleRealTime: () => void
  isRealTimeEnabled: boolean
  
  // Configuração
  toggleAutoRefresh: () => void
  updateRefreshInterval: (interval: number) => void
}

export function useSystemLogs(options: UseSystemLogsOptions = {}): UseSystemLogsReturn {
  const {
    pageSize = 50,
    autoRefresh = false,
    refreshInterval = 30000, // 30 segundos
    enableRealTime = false,
    defaultFilters = {}
  } = options

  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFiltersState] = useState<LogFilter>({
    levels: [],
    sources: [],
    categories: [],
    startDate: '',
    endDate: '',
    userId: '',
    sessionId: '',
    correlationId: '',
    tags: [],
    ...defaultFilters
  })
  const [searchQuery, setSearchQueryState] = useState('')
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoRefresh)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(enableRealTime)
  const [currentRefreshInterval, setCurrentRefreshInterval] = useState(refreshInterval)
  const [realtimeLogs, setRealtimeLogs] = useState<SystemLog[]>([])
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Pagination
  const pagination = {
    page: currentPage,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize
  }

  // Query para logs
  const {
    data: logsResult,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['system-logs', filters, searchQuery, pagination],
    queryFn: () => logsService.getLogs(filters, pagination),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false,
    placeholderData: (previousData) => previousData
  })

  // Query para estatísticas
  const { data: statistics } = useQuery({
    queryKey: ['logs-statistics', filters],
    queryFn: () => logsService.getLogStatistics(filters),
    staleTime: 60000 // 1 minuto
  })

  // Query para agregações
  const { data: aggregations } = useQuery({
    queryKey: ['logs-aggregations', filters],
    queryFn: () => logsService.getLogAggregations({
      groupBy: ['level', 'source', 'category'],
      timeInterval: '1h'
    }),
    staleTime: 60000 // 1 minuto
  })

  // Query para fontes disponíveis
  const { data: availableSources = [] } = useQuery({
    queryKey: ['log-sources'],
    queryFn: () => logsService.getLogSources(),
    staleTime: 300000 // 5 minutos
  })

  // Query para categorias disponíveis
  const { data: availableCategories = [] } = useQuery({
    queryKey: ['log-categories'],
    queryFn: () => logsService.getLogCategories(),
    staleTime: 300000 // 5 minutos
  })

  // Estados derivados
  const logs = isRealTimeEnabled ? realtimeLogs : (logsResult?.logs || [])
  const totalLogs = logsResult?.pagination?.total || 0
  const hasMore = logsResult?.pagination?.hasNext || false
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mutations
  const exportMutation = useMutation({
    mutationFn: (config: { format: 'csv' | 'json' | 'txt'; filters?: LogFilter }) =>
      logsService.exportLogs(config)
  })

  const getLogByIdMutation = useMutation({
    mutationFn: (id: string) => logsService.getLogById(id)
  })

  const getRelatedLogsMutation = useMutation({
    mutationFn: (logId: string) => logsService.getRelatedLogs(logId)
  })

  // Configurar WebSocket para logs em tempo real
  useEffect(() => {
    if (!isRealTimeEnabled) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      return
    }

    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
        wsRef.current = new WebSocket(`${wsUrl}/logs`)

        wsRef.current.onopen = () => {
          console.log('WebSocket conectado para logs em tempo real')
          // Enviar filtros atuais
          if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'subscribe', filters }))
          }
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'log-entry') {
              setRealtimeLogs(prev => {
                const newLogs = [data.log, ...prev]
                // Manter apenas os últimos 1000 logs em tempo real
                return newLogs.slice(0, 1000)
              })
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
  }, [isRealTimeEnabled, filters])

  // Configurar auto-refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (isAutoRefresh && !isRealTimeEnabled) {
      intervalRef.current = setInterval(() => {
        refetch()
      }, currentRefreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoRefresh, isRealTimeEnabled, currentRefreshInterval, refetch])

  // Atualizar filtros no WebSocket quando mudarem
  useEffect(() => {
    if (isRealTimeEnabled && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'update-filters', filters }))
      // Limpar logs em tempo real ao mudar filtros
      setRealtimeLogs([])
    }
  }, [filters, isRealTimeEnabled])

  // Função para definir filtros
  const setFilters = useCallback((newFilters: Partial<LogFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset para primeira página
  }, [])

  // Função para definir query de busca
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query)
    setCurrentPage(1) // Reset para primeira página
  }, [])

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFiltersState({
      levels: [],
      sources: [],
      categories: [],
      timeRange: undefined,
      userId: '',
      sessionId: '',
      correlationId: '',
      tags: []
    })
    setSearchQueryState('')
    setCurrentPage(1)
  }, [])

  // Função para refresh manual
  const refreshLogs = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      await queryClient.invalidateQueries({ queryKey: ['logs-statistics'] })
      await queryClient.invalidateQueries({ queryKey: ['logs-aggregations'] })
    } finally {
      setIsRefreshing(false)
    }
  }, [refetch, queryClient])

  // Função para carregar mais logs
  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasMore, isLoading])

  // Função para ir para página específica
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Função para exportar logs
  const exportLogs = useCallback(async (format: 'csv' | 'json' | 'txt'): Promise<string> => {
    try {
      const exportConfig: LogExport = {
        format: format as 'json' | 'csv' | 'txt',
        filters: {
          ...filters,
          search: {
            query: searchQuery,
            fields: ['message', 'source', 'category'],
            caseSensitive: false,
            regex: false
          }
        },
        options: {
          includeMetadata: true,
          includeContext: false,
          compression: false,
          encryption: false,
          maxRecords: 10000
        },
        delivery: {
          method: 'download'
        }
      }
      
      const result = await exportMutation.mutateAsync(exportConfig)
      
      // Criar e baixar arquivo
      const blob = new Blob([result], {
        type: format === 'json' ? 'application/json' : 'text/plain'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `logs-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return result.url || result.data || ''
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      throw error
    }
  }, [filters, searchQuery, exportMutation])

  // Função para buscar log por ID
  const getLogById = useCallback(async (id: string): Promise<SystemLog | null> => {
    try {
      return await getLogByIdMutation.mutateAsync(id)
    } catch (error) {
      console.error('Erro ao buscar log por ID:', error)
      return null
    }
  }, [getLogByIdMutation])

  // Função para buscar logs relacionados
  const getRelatedLogs = useCallback(async (logId: string): Promise<SystemLog[]> => {
    try {
      const result = await getRelatedLogsMutation.mutateAsync(logId)
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('Erro ao buscar logs relacionados:', error)
      return []
    }
  }, [getRelatedLogsMutation])

  // Função para alternar tempo real
  const toggleRealTime = useCallback(() => {
    setIsRealTimeEnabled(prev => !prev)
  }, [])

  // Função para alternar auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefresh(prev => !prev)
  }, [])

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
    // Dados dos logs
    logs,
    totalLogs,
    hasMore,
    statistics: statistics || null,
    aggregations: aggregations || null,
    availableSources: availableSources || [],
    availableCategories: availableCategories || [],
    
    // Estados
    isLoading,
    isError,
    error: error as Error | null,
    isRefreshing,
    currentPage,
    
    // Filtros e busca
    filters,
    searchQuery,
    
    // Ações
    setFilters,
    setSearchQuery,
    clearFilters,
    refreshLogs,
    loadMore,
    goToPage,
    
    // Funcionalidades avançadas
    exportLogs,
    getLogById,
    getRelatedLogs,
    
    // Real-time
    toggleRealTime,
    isRealTimeEnabled,
    
    // Configuração
    toggleAutoRefresh,
    updateRefreshInterval
  }
}

// Hook especializado para logs de erro
export function useErrorLogs(options: UseSystemLogsOptions = {}) {
  return useSystemLogs({
    ...options,
    defaultFilters: {
      levels: ['error'],
      ...options.defaultFilters
    }
  })
}

// Hook especializado para logs de auditoria
export function useAuditLogs(options: UseSystemLogsOptions = {}) {
  return useSystemLogs({
    ...options,
    defaultFilters: {
      categories: ['audit', 'security'],
      ...options.defaultFilters
    }
  })
}

// Hook especializado para logs de performance
export function usePerformanceLogs(options: UseSystemLogsOptions = {}) {
  return useSystemLogs({
    ...options,
    defaultFilters: {
      categories: ['performance', 'monitoring'],
      ...options.defaultFilters
    }
  })
}

// Hook especializado para logs de usuário
export function useUserLogs(userId: string, options: UseSystemLogsOptions = {}) {
  return useSystemLogs({
    ...options,
    defaultFilters: {
      userId,
      ...options.defaultFilters
    }
  })
}

export default useSystemLogs