import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsService } from '@/services/alertsService'
import type {
  SystemAlert,
  AlertCondition,
  AlertTarget,
  AlertNotification,
  AlertAction,
  AlertEscalation,
  AlertSuppression,
  AlertMetrics,
  AlertHistory,
  AlertCategory,
  AlertSeverity,
  AlertStatus,
  AlertSource,
  AlertConfiguration,
  AlertTemplate,
  AlertDashboard,
  AlertReport,
  AlertIntegration
} from '@/types/systemAlerts'

interface UseSystemAlertsOptions {
  pageSize?: number
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTime?: boolean
  defaultFilters?: {
    categories?: AlertCategory[]
    severities?: AlertSeverity[]
    statuses?: AlertStatus[]
    sources?: AlertSource[]
    startDate?: string
    endDate?: string
  }
}

interface AlertFilters {
  categories: AlertCategory[]
  severities: AlertSeverity[]
  statuses: AlertStatus[]
  sources: AlertSource[]
  startDate: string
  endDate: string
  search: string
}

interface UseSystemAlertsReturn {
  // Dados dos alertas
  alerts: SystemAlert[]
  totalAlerts: number
  hasMore: boolean
  metrics: AlertMetrics | null
  configuration: AlertConfiguration | null
  templates: AlertTemplate[]
  integrations: AlertIntegration[]
  
  // Estados
  isLoading: boolean
  isError: boolean
  error: Error | null
  isRefreshing: boolean
  currentPage: number
  
  // Filtros e busca
  filters: AlertFilters
  
  // Ações básicas
  setFilters: (filters: Partial<AlertFilters>) => void
  clearFilters: () => void
  refreshAlerts: () => Promise<void>
  loadMore: () => Promise<void>
  goToPage: (page: number) => void
  
  // Ações de alerta
  createAlert: (alert: Omit<SystemAlert, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SystemAlert>
  updateAlert: (id: string, updates: Partial<SystemAlert>) => Promise<SystemAlert>
  deleteAlert: (id: string) => Promise<void>
  activateAlert: (id: string) => Promise<void>
  deactivateAlert: (id: string) => Promise<void>
  acknowledgeAlert: (id: string, userId: string, notes?: string) => Promise<void>
  resolveAlert: (id: string, userId: string, resolution: string) => Promise<void>
  suppressAlert: (id: string, duration: number, reason: string) => Promise<void>
  testAlert: (id: string) => Promise<{ success: boolean; message: string }>
  duplicateAlert: (id: string) => Promise<SystemAlert>
  
  // Funcionalidades avançadas
  getAlertHistory: (id: string) => Promise<AlertHistory[]>
  exportAlerts: (config: { filters?: any; format: 'json' | 'yaml'; includeHistory?: boolean; includeMetrics?: boolean }) => Promise<{ data: string; filename: string; count: number }>
  importAlerts: (data: File, options?: { overwrite?: boolean; validate?: boolean; dryRun?: boolean }) => Promise<{ success: boolean; imported: number; skipped: number; errors: string[]; warnings: string[] }>
  
  // Templates
  createTemplate: (template: Omit<AlertTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AlertTemplate>
  updateTemplate: (id: string, updates: Partial<AlertTemplate>) => Promise<AlertTemplate>
  deleteTemplate: (id: string) => Promise<void>
  createAlertFromTemplate: (templateId: string, config: { name: string; description?: string; overrides?: Partial<SystemAlert> }) => Promise<SystemAlert>
  
  // Configuração
  updateConfiguration: (config: Partial<AlertConfiguration>) => Promise<AlertConfiguration>
  
  // Real-time
  toggleRealTime: () => void
  isRealTimeEnabled: boolean
  
  // Auto-refresh
  toggleAutoRefresh: () => void
  updateRefreshInterval: (interval: number) => void
}

export function useSystemAlerts(options: UseSystemAlertsOptions = {}): UseSystemAlertsReturn {
  const {
    pageSize = 50,
    autoRefresh = true,
    refreshInterval = 30000, // 30 segundos
    enableRealTime = true,
    defaultFilters = {}
  } = options

  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFiltersState] = useState<AlertFilters>({
    categories: defaultFilters.categories || [],
    severities: defaultFilters.severities || [],
    statuses: defaultFilters.statuses || [],
    sources: defaultFilters.sources || [],
    startDate: defaultFilters.startDate || '',
    endDate: defaultFilters.endDate || '',
    search: ''
  })
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoRefresh)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(enableRealTime)
  const [currentRefreshInterval, setCurrentRefreshInterval] = useState(refreshInterval)
  const [realtimeAlerts, setRealtimeAlerts] = useState<SystemAlert[]>([])
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Query para alertas
  const {
    data: alertsResult,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['system-alerts', filters, currentPage],
    queryFn: () => alertsService.getAlerts({
      ...filters,
      page: currentPage,
      limit: pageSize
    }),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false,
    keepPreviousData: true
  })

  // Query para métricas de alertas
  const { data: metrics } = useQuery({
    queryKey: ['alert-metrics', filters],
    queryFn: () => alertsService.getAlertMetrics(filters),
    staleTime: 60000 // 1 minuto
  })

  // Query para configuração
  const { data: configuration } = useQuery({
    queryKey: ['alert-configuration'],
    queryFn: () => alertsService.getConfiguration(),
    staleTime: 300000 // 5 minutos
  })

  // Query para templates
  const { data: templates = [] } = useQuery({
    queryKey: ['alert-templates'],
    queryFn: () => alertsService.getTemplates(),
    staleTime: 300000 // 5 minutos
  })

  // Query para integrações
  const { data: integrations = [] } = useQuery({
    queryKey: ['alert-integrations'],
    queryFn: () => alertsService.getIntegrations(),
    staleTime: 300000 // 5 minutos
  })

  // Estados derivados
  const alerts = isRealTimeEnabled ? realtimeAlerts : (alertsResult?.alerts || [])
  const totalAlerts = alertsResult?.total || 0
  const hasMore = alertsResult?.hasMore || false
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mutations para ações de alerta
  const createAlertMutation = useMutation({
    mutationFn: (alert: Omit<SystemAlert, 'id' | 'createdAt' | 'updatedAt'>) =>
      alertsService.createAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-metrics'] })
    }
  })

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SystemAlert> }) =>
      alertsService.updateAlert(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
    }
  })

  const deleteAlertMutation = useMutation({
    mutationFn: (id: string) => alertsService.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-metrics'] })
    }
  })

  const activateAlertMutation = useMutation({
    mutationFn: (id: string) => alertsService.toggleAlert(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
    }
  })

  const deactivateAlertMutation = useMutation({
    mutationFn: (id: string) => alertsService.toggleAlert(id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
    }
  })

  const acknowledgeAlertMutation = useMutation({
    mutationFn: ({ id, userId, notes }: { id: string; userId: string; notes?: string }) =>
      alertsService.acknowledgeAlert(id, userId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
    }
  })

  const resolveAlertMutation = useMutation({
    mutationFn: ({ id, userId, resolution }: { id: string; userId: string; resolution: string }) =>
      alertsService.resolveAlert(id, userId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-metrics'] })
    }
  })

  const suppressAlertMutation = useMutation({
    mutationFn: ({ id, duration, reason }: { id: string; duration: number; reason: string }) =>
      alertsService.suppressAlert(id, duration, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
    }
  })

  const testAlertMutation = useMutation({
    mutationFn: (id: string) => alertsService.testAlert(id)
  })

  const duplicateAlertMutation = useMutation({
    mutationFn: (id: string) => alertsService.duplicateAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
    }
  })

  // Mutations para funcionalidades avançadas
  const exportAlertsMutation = useMutation({
    mutationFn: ({ config }: { config: { filters?: any; format: 'json' | 'yaml'; includeHistory?: boolean; includeMetrics?: boolean } }) => alertsService.exportAlerts(config)
  })

  const importAlertsMutation = useMutation({
    mutationFn: ({ data, options }: { data: File; options?: { overwrite?: boolean; validate?: boolean; dryRun?: boolean } }) => 
      alertsService.importAlerts(data, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-metrics'] })
    }
  })

  // Mutations para templates
  const createTemplateMutation = useMutation({
    mutationFn: (template: Omit<AlertTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => 
      alertsService.createAlertTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-templates'] })
    }
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AlertTemplate> }) => 
      alertsService.updateAlertTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-templates'] })
    }
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => alertsService.deleteAlertTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-templates'] })
    }
  })

  const createAlertFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, config }: { templateId: string; config: { name: string; description?: string; overrides?: Partial<SystemAlert> } }) =>
      alertsService.createAlertFromTemplate(templateId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] })
    }
  })

  // Mutation para configuração
  const updateConfigurationMutation = useMutation({
    mutationFn: (config: Partial<AlertConfiguration>) => alertsService.updateAlertConfiguration(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-configuration'] })
    }
  })

  // Configurar WebSocket para alertas em tempo real
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
        wsRef.current = new WebSocket(`${wsUrl}/alerts`)

        wsRef.current.onopen = () => {
          console.log('WebSocket conectado para alertas em tempo real')
          // Enviar filtros atuais
          if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'subscribe', filters }))
          }
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'alert-update') {
              setRealtimeAlerts(prev => {
                const existingIndex = prev.findIndex(alert => alert.id === data.alert.id)
                if (existingIndex >= 0) {
                  // Atualizar alerta existente
                  const newAlerts = [...prev]
                  newAlerts[existingIndex] = data.alert
                  return newAlerts
                } else {
                  // Adicionar novo alerta
                  return [data.alert, ...prev].slice(0, 1000) // Manter apenas os últimos 1000
                }
              })
            } else if (data.type === 'alert-deleted') {
              setRealtimeAlerts(prev => prev.filter(alert => alert.id !== data.alertId))
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
    }
  }, [filters, isRealTimeEnabled])

  // Função para definir filtros
  const setFilters = useCallback((newFilters: Partial<AlertFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset para primeira página
  }, [])

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFiltersState({
      categories: [],
      severities: [],
      statuses: [],
      sources: [],
      startDate: '',
      endDate: '',
      search: ''
    })
    setCurrentPage(1)
  }, [])

  // Função para refresh manual
  const refreshAlerts = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      await queryClient.invalidateQueries({ queryKey: ['alert-metrics'] })
    } finally {
      setIsRefreshing(false)
    }
  }, [refetch, queryClient])

  // Função para carregar mais alertas
  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasMore, isLoading])

  // Função para ir para página específica
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Funções de ação de alerta
  const createAlert = useCallback(async (alert: Omit<SystemAlert, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createAlertMutation.mutateAsync(alert)
  }, [createAlertMutation])

  const updateAlert = useCallback(async (id: string, updates: Partial<SystemAlert>) => {
    return await updateAlertMutation.mutateAsync({ id, updates })
  }, [updateAlertMutation])

  const deleteAlert = useCallback(async (id: string) => {
    await deleteAlertMutation.mutateAsync(id)
  }, [deleteAlertMutation])

  const activateAlert = useCallback(async (id: string) => {
    await activateAlertMutation.mutateAsync(id)
  }, [activateAlertMutation])

  const deactivateAlert = useCallback(async (id: string) => {
    await deactivateAlertMutation.mutateAsync(id)
  }, [deactivateAlertMutation])

  const acknowledgeAlert = useCallback(async (id: string, userId: string, notes?: string) => {
    await acknowledgeAlertMutation.mutateAsync({ id, userId, notes })
  }, [acknowledgeAlertMutation])

  const resolveAlert = useCallback(async (id: string, userId: string, resolution: string) => {
    await resolveAlertMutation.mutateAsync({ id, userId, resolution })
  }, [resolveAlertMutation])

  const suppressAlert = useCallback(async (id: string, duration: number, reason: string) => {
    await suppressAlertMutation.mutateAsync({ id, duration, reason })
  }, [suppressAlertMutation])

  const testAlert = useCallback(async (id: string) => {
    return await testAlertMutation.mutateAsync(id)
  }, [testAlertMutation])

  const duplicateAlert = useCallback(async (id: string) => {
    return await duplicateAlertMutation.mutateAsync(id)
  }, [duplicateAlertMutation])

  // Funções avançadas
  const getAlertHistory = useCallback(async (id: string) => {
    return await alertsService.getAlertHistory(id)
  }, [])

  const exportAlerts = useCallback(async (config: { filters?: any; format: 'json' | 'yaml'; includeHistory?: boolean; includeMetrics?: boolean }) => {
    return await exportAlertsMutation.mutateAsync({ config })
  }, [exportAlertsMutation])

  const importAlerts = useCallback(async (data: File, options?: { overwrite?: boolean; validate?: boolean; dryRun?: boolean }) => {
    return await importAlertsMutation.mutateAsync({ data, options })
  }, [importAlertsMutation])

  // Funções de template
  const createTemplate = useCallback(async (template: Omit<AlertTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createTemplateMutation.mutateAsync(template)
  }, [createTemplateMutation])

  const updateTemplate = useCallback(async (id: string, updates: Partial<AlertTemplate>) => {
    return await updateTemplateMutation.mutateAsync({ id, updates })
  }, [updateTemplateMutation])

  const deleteTemplate = useCallback(async (id: string) => {
    await deleteTemplateMutation.mutateAsync(id)
  }, [deleteTemplateMutation])

  const createAlertFromTemplate = useCallback(async (templateId: string, config: { name: string; description?: string; overrides?: Partial<SystemAlert> }) => {
    return await createAlertFromTemplateMutation.mutateAsync({ templateId, config })
  }, [createAlertFromTemplateMutation])

  // Função de configuração
  const updateConfiguration = useCallback(async (config: Partial<AlertConfiguration>) => {
    return await updateConfigurationMutation.mutateAsync(config)
  }, [updateConfigurationMutation])

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
    // Dados dos alertas
    alerts,
    totalAlerts,
    hasMore,
    metrics: metrics || null,
    configuration,
    templates,
    integrations,
    
    // Estados
    isLoading,
    isError,
    error: error as Error | null,
    isRefreshing,
    currentPage,
    
    // Filtros e busca
    filters,
    
    // Ações básicas
    setFilters,
    clearFilters,
    refreshAlerts,
    loadMore,
    goToPage,
    
    // Ações de alerta
    createAlert,
    updateAlert,
    deleteAlert,
    activateAlert,
    deactivateAlert,
    acknowledgeAlert,
    resolveAlert,
    suppressAlert,
    testAlert,
    duplicateAlert,
    
    // Funcionalidades avançadas
    getAlertHistory,
    exportAlerts,
    importAlerts,
    
    // Templates
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createAlertFromTemplate,
    
    // Configuração
    updateConfiguration,
    
    // Real-time
    toggleRealTime,
    isRealTimeEnabled,
    
    // Auto-refresh
    toggleAutoRefresh,
    updateRefreshInterval
  }
}

// Hook especializado para alertas críticos
export function useCriticalAlerts(options: UseSystemAlertsOptions = {}) {
  return useSystemAlerts({
    ...options,
    defaultFilters: {
      severities: ['critical'],
      statuses: ['active', 'resolved'],
      ...options.defaultFilters
    }
  })
}

// Hook especializado para alertas de segurança
export function useSecurityAlerts(options: UseSystemAlertsOptions = {}) {
  return useSystemAlerts({
    ...options,
    defaultFilters: {
      categories: ['security', 'application', 'business'],
      ...options.defaultFilters
    }
  })
}

// Hook especializado para alertas de performance
export function usePerformanceAlerts(options: UseSystemAlertsOptions = {}) {
  return useSystemAlerts({
    ...options,
    defaultFilters: {
      categories: ['infrastructure', 'application', 'custom'],
      ...options.defaultFilters
    }
  })
}

export default useSystemAlerts