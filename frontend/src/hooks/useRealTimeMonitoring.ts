import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { monitoringService } from '@/services/monitoringService'
import type {
  SystemMonitoring,
  SystemHealth,
  HealthCheck,
  UptimeMetrics,
  PerformanceMonitoring,
  ResourceMonitoring,
  ServiceMonitoring,
  EndpointMonitoring,
  DependencyMonitoring,
  MonitoringAlert,
  Incident,
  MaintenanceWindow,
  SLAMetrics,
  MonitoringConfiguration,
  SystemStatus,
  HealthStatus,
  ServiceStatus,
  EndpointStatus,
  DependencyStatus
} from '@/types/monitoring'

interface UseRealTimeMonitoringOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTime?: boolean
  enableNotifications?: boolean
  thresholds?: {
    cpu?: number
    memory?: number
    disk?: number
    network?: number
    responseTime?: number
  }
}

interface MonitoringFilters {
  services?: string[]
  endpoints?: string[]
  dependencies?: string[]
  statuses?: SystemStatus[]
  healthStatuses?: HealthStatus[]
  startDate?: string
  endDate?: string
}

interface UseRealTimeMonitoringReturn {
  // Dados de monitoramento
  monitoring: SystemMonitoring | null
  systemHealth: SystemHealth | null
  healthChecks: HealthCheck[]
  uptimeMetrics: UptimeMetrics | null
  performanceMetrics: PerformanceMonitoring | null
  resourceMetrics: ResourceMonitoring | null
  services: ServiceMonitoring[]
  endpoints: EndpointMonitoring[]
  dependencies: DependencyMonitoring[]
  alerts: MonitoringAlert[]
  incidents: Incident[]
  maintenanceWindows: MaintenanceWindow[]
  slaMetrics: SLAMetrics | null
  configuration: MonitoringConfiguration | null
  
  // Estados
  isLoading: boolean
  isError: boolean
  error: Error | null
  isConnected: boolean
  lastUpdate: Date | null
  
  // Filtros
  filters: MonitoringFilters
  
  // Ações básicas
  setFilters: (filters: Partial<MonitoringFilters>) => void
  clearFilters: () => void
  refreshMonitoring: () => Promise<void>
  
  // Ações de health checks
  runHealthCheck: (id: string) => Promise<HealthCheck>
  runAllHealthChecks: () => Promise<HealthCheck[]>
  createHealthCheck: (check: Omit<HealthCheck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<HealthCheck>
  updateHealthCheck: (id: string, updates: Partial<HealthCheck>) => Promise<HealthCheck>
  deleteHealthCheck: (id: string) => Promise<void>
  
  // Ações de serviços
  createService: (service: Omit<ServiceMonitoring, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ServiceMonitoring>
  updateService: (id: string, updates: Partial<ServiceMonitoring>) => Promise<ServiceMonitoring>
  deleteService: (id: string) => Promise<void>
  
  // Ações de endpoints
  createEndpoint: (endpoint: Omit<EndpointMonitoring, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EndpointMonitoring>
  updateEndpoint: (id: string, updates: Partial<EndpointMonitoring>) => Promise<EndpointMonitoring>
  deleteEndpoint: (id: string) => Promise<void>
  
  // Ações de dependências
  createDependency: (dependency: Omit<DependencyMonitoring, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DependencyMonitoring>
  updateDependency: (id: string, updates: Partial<DependencyMonitoring>) => Promise<DependencyMonitoring>
  deleteDependency: (id: string) => Promise<void>
  
  // Ações de alertas
  acknowledgeAlert: (id: string, userId: string) => Promise<void>
  resolveAlert: (id: string, userId: string, resolution: string) => Promise<void>
  suppressAlert: (id: string, duration: number) => Promise<void>
  
  // Ações de incidentes
  createIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Incident>
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<Incident>
  resolveIncident: (id: string, resolution: string) => Promise<void>
  
  // Ações de manutenção
  createMaintenanceWindow: (window: Omit<MaintenanceWindow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceWindow>
  updateMaintenanceWindow: (id: string, updates: Partial<MaintenanceWindow>) => Promise<MaintenanceWindow>
  cancelMaintenanceWindow: (id: string, reason: string) => Promise<void>
  
  // Configuração
  updateConfiguration: (config: Partial<MonitoringConfiguration>) => Promise<MonitoringConfiguration>
  
  // Real-time
  toggleRealTime: () => void
  isRealTimeEnabled: boolean
  
  // Auto-refresh
  toggleAutoRefresh: () => void
  updateRefreshInterval: (interval: number) => void
  
  // Notificações
  toggleNotifications: () => void
  isNotificationsEnabled: boolean
  
  // Utilitários
  getSystemStatus: () => SystemStatus
  getOverallHealth: () => HealthStatus
  getActiveIncidentsCount: () => number
  getActiveAlertsCount: () => number
  getCurrentUptime: () => number
}

export function useRealTimeMonitoring(options: UseRealTimeMonitoringOptions = {}): UseRealTimeMonitoringReturn {
  const {
    autoRefresh = true,
    refreshInterval = 10000, // 10 segundos
    enableRealTime = true,
    enableNotifications = true,
    thresholds = {
      cpu: 80,
      memory: 85,
      disk: 90,
      network: 75,
      responseTime: 5000
    }
  } = options

  const queryClient = useQueryClient()
  const [filters, setFiltersState] = useState<MonitoringFilters>({})
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoRefresh)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(enableRealTime)
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(enableNotifications)
  const [currentRefreshInterval, setCurrentRefreshInterval] = useState(refreshInterval)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const notificationRef = useRef<Notification | null>(null)

  // Query para monitoramento geral
  const {
    data: monitoring,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['system-monitoring', filters],
    queryFn: () => monitoringService.getMonitoring(filters),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false,
    keepPreviousData: true
  })

  // Query para saúde do sistema
  const { data: systemHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => monitoringService.getSystemHealth(),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para health checks
  const { data: healthChecks = [] } = useQuery({
    queryKey: ['health-checks'],
    queryFn: () => monitoringService.getHealthChecks(),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para métricas de uptime
  const { data: uptimeMetrics } = useQuery({
    queryKey: ['uptime-metrics', filters],
    queryFn: () => monitoringService.getUptimeMetrics(filters),
    staleTime: 60000 // 1 minuto
  })

  // Query para métricas de performance
  const { data: performanceMetrics } = useQuery({
    queryKey: ['performance-monitoring', filters],
    queryFn: () => monitoringService.getPerformanceMonitoring(filters),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para métricas de recursos
  const { data: resourceMetrics } = useQuery({
    queryKey: ['resource-monitoring', filters],
    queryFn: () => monitoringService.getResourceMonitoring(filters),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para serviços
  const { data: services = [] } = useQuery({
    queryKey: ['service-monitoring', filters],
    queryFn: () => monitoringService.getServices(filters),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para endpoints
  const { data: endpoints = [] } = useQuery({
    queryKey: ['endpoint-monitoring', filters],
    queryFn: () => monitoringService.getEndpoints(filters),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para dependências
  const { data: dependencies = [] } = useQuery({
    queryKey: ['dependency-monitoring', filters],
    queryFn: () => monitoringService.getDependencies(filters),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para alertas
  const { data: alerts = [] } = useQuery({
    queryKey: ['monitoring-alerts', filters],
    queryFn: () => monitoringService.getAlerts(filters),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para incidentes
  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => monitoringService.getIncidents(filters),
    refetchInterval: isAutoRefresh && !isRealTimeEnabled ? currentRefreshInterval : false
  })

  // Query para janelas de manutenção
  const { data: maintenanceWindows = [] } = useQuery({
    queryKey: ['maintenance-windows'],
    queryFn: () => monitoringService.getMaintenanceWindows(),
    staleTime: 300000 // 5 minutos
  })

  // Query para métricas de SLA
  const { data: slaMetrics } = useQuery({
    queryKey: ['sla-metrics', filters],
    queryFn: () => monitoringService.getSLAMetrics(filters),
    staleTime: 300000 // 5 minutos
  })

  // Query para configuração
  const { data: configuration } = useQuery({
    queryKey: ['monitoring-configuration'],
    queryFn: () => monitoringService.getConfiguration(),
    staleTime: 600000 // 10 minutos
  })

  // Mutations para health checks
  const runHealthCheckMutation = useMutation({
    mutationFn: (id: string) => monitoringService.runHealthCheck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-checks'] })
      queryClient.invalidateQueries({ queryKey: ['system-health'] })
    }
  })

  const createHealthCheckMutation = useMutation({
    mutationFn: (check: Omit<HealthCheck, 'id' | 'createdAt' | 'updatedAt'>) =>
      monitoringService.createHealthCheck(check),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-checks'] })
    }
  })

  const updateHealthCheckMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<HealthCheck> }) =>
      monitoringService.updateHealthCheck(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-checks'] })
    }
  })

  const deleteHealthCheckMutation = useMutation({
    mutationFn: (id: string) => monitoringService.deleteHealthCheck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-checks'] })
    }
  })

  // Mutations para serviços
  const createServiceMutation = useMutation({
    mutationFn: (service: Omit<ServiceMonitoring, 'id' | 'createdAt' | 'updatedAt'>) =>
      monitoringService.createService(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-monitoring'] })
    }
  })

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ServiceMonitoring> }) =>
      monitoringService.updateService(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-monitoring'] })
    }
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => monitoringService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-monitoring'] })
    }
  })

  // Mutations para endpoints
  const createEndpointMutation = useMutation({
    mutationFn: (endpoint: Omit<EndpointMonitoring, 'id' | 'createdAt' | 'updatedAt'>) =>
      monitoringService.createEndpoint(endpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoint-monitoring'] })
    }
  })

  const updateEndpointMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<EndpointMonitoring> }) =>
      monitoringService.updateEndpoint(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoint-monitoring'] })
    }
  })

  const deleteEndpointMutation = useMutation({
    mutationFn: (id: string) => monitoringService.deleteEndpoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoint-monitoring'] })
    }
  })

  // Mutations para dependências
  const createDependencyMutation = useMutation({
    mutationFn: (dependency: Omit<DependencyMonitoring, 'id' | 'createdAt' | 'updatedAt'>) =>
      monitoringService.createDependency(dependency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependency-monitoring'] })
    }
  })

  const updateDependencyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DependencyMonitoring> }) =>
      monitoringService.updateDependency(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependency-monitoring'] })
    }
  })

  const deleteDependencyMutation = useMutation({
    mutationFn: (id: string) => monitoringService.deleteDependency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependency-monitoring'] })
    }
  })

  // Mutations para alertas
  const acknowledgeAlertMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      monitoringService.acknowledgeAlert(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-alerts'] })
    }
  })

  const resolveAlertMutation = useMutation({
    mutationFn: ({ id, userId, resolution }: { id: string; userId: string; resolution: string }) =>
      monitoringService.resolveAlert(id, userId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-alerts'] })
    }
  })

  const suppressAlertMutation = useMutation({
    mutationFn: ({ id, duration }: { id: string; duration: number }) =>
      monitoringService.suppressAlert(id, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-alerts'] })
    }
  })

  // Mutations para incidentes
  const createIncidentMutation = useMutation({
    mutationFn: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) =>
      monitoringService.createIncident(incident),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    }
  })

  const updateIncidentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Incident> }) =>
      monitoringService.updateIncident(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    }
  })

  const resolveIncidentMutation = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      monitoringService.resolveIncident(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    }
  })

  // Mutations para manutenção
  const createMaintenanceWindowMutation = useMutation({
    mutationFn: (window: Omit<MaintenanceWindow, 'id' | 'createdAt' | 'updatedAt'>) =>
      monitoringService.createMaintenanceWindow(window),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] })
    }
  })

  const updateMaintenanceWindowMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MaintenanceWindow> }) =>
      monitoringService.updateMaintenanceWindow(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] })
    }
  })

  const cancelMaintenanceWindowMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      monitoringService.cancelMaintenanceWindow(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] })
    }
  })

  // Mutation para configuração
  const updateConfigurationMutation = useMutation({
    mutationFn: (config: Partial<MonitoringConfiguration>) =>
      monitoringService.updateConfiguration(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-configuration'] })
    }
  })

  // Configurar WebSocket para monitoramento em tempo real
  useEffect(() => {
    if (!isRealTimeEnabled) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setIsConnected(false)
      return
    }

    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
        wsRef.current = new WebSocket(`${wsUrl}/monitoring`)

        wsRef.current.onopen = () => {
          console.log('WebSocket conectado para monitoramento em tempo real')
          setIsConnected(true)
          // Enviar filtros e thresholds atuais
          if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ 
              type: 'subscribe', 
              filters, 
              thresholds 
            }))
          }
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setLastUpdate(new Date())
            
            if (data.type === 'monitoring-update') {
              // Atualizar cache do React Query com novos dados
              queryClient.setQueryData(['system-monitoring', filters], data.monitoring)
              queryClient.setQueryData(['system-health'], data.systemHealth)
              queryClient.setQueryData(['performance-monitoring', filters], data.performanceMetrics)
              queryClient.setQueryData(['resource-monitoring', filters], data.resourceMetrics)
              
              // Verificar thresholds e enviar notificações
              if (isNotificationsEnabled && data.alerts && data.alerts.length > 0) {
                data.alerts.forEach((alert: MonitoringAlert) => {
                  if (alert.severity === 'critical' || alert.severity === 'high') {
                    showNotification(alert)
                  }
                })
              }
            } else if (data.type === 'alert-triggered') {
              // Novo alerta disparado
              queryClient.invalidateQueries({ queryKey: ['monitoring-alerts'] })
              if (isNotificationsEnabled) {
                showNotification(data.alert)
              }
            } else if (data.type === 'incident-created') {
              // Novo incidente criado
              queryClient.invalidateQueries({ queryKey: ['incidents'] })
              if (isNotificationsEnabled) {
                showIncidentNotification(data.incident)
              }
            }
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error)
          }
        }

        wsRef.current.onclose = () => {
          console.log('WebSocket desconectado')
          setIsConnected(false)
          // Tentar reconectar após 5 segundos
          setTimeout(connectWebSocket, 5000)
        }

        wsRef.current.onerror = (error) => {
          console.error('Erro no WebSocket:', error)
          setIsConnected(false)
        }
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
        setIsConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isRealTimeEnabled, filters, thresholds, isNotificationsEnabled, queryClient])

  // Configurar auto-refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (isAutoRefresh && !isRealTimeEnabled) {
      intervalRef.current = setInterval(() => {
        refetch()
        queryClient.invalidateQueries({ queryKey: ['system-health'] })
        queryClient.invalidateQueries({ queryKey: ['health-checks'] })
        queryClient.invalidateQueries({ queryKey: ['performance-monitoring'] })
        queryClient.invalidateQueries({ queryKey: ['resource-monitoring'] })
      }, currentRefreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoRefresh, isRealTimeEnabled, currentRefreshInterval, refetch, queryClient])

  // Função para mostrar notificação de alerta
  const showNotification = useCallback((alert: MonitoringAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`Alerta ${alert.severity.toUpperCase()}`, {
        body: alert.message,
        icon: '/icons/alert.png',
        tag: alert.id
      })
      
      notification.onclick = () => {
        window.focus()
        // Navegar para a página de alertas
        notification.close()
      }
      
      setTimeout(() => notification.close(), 10000) // Fechar após 10 segundos
    }
  }, [])

  // Função para mostrar notificação de incidente
  const showIncidentNotification = useCallback((incident: Incident) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`Novo Incidente: ${incident.severity.toUpperCase()}`, {
        body: incident.title,
        icon: '/icons/incident.png',
        tag: incident.id
      })
      
      notification.onclick = () => {
        window.focus()
        // Navegar para a página de incidentes
        notification.close()
      }
      
      setTimeout(() => notification.close(), 15000) // Fechar após 15 segundos
    }
  }, [])

  // Solicitar permissão para notificações
  useEffect(() => {
    if (isNotificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [isNotificationsEnabled])

  // Função para definir filtros
  const setFilters = useCallback((newFilters: Partial<MonitoringFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFiltersState({})
  }, [])

  // Função para refresh manual
  const refreshMonitoring = useCallback(async () => {
    await Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: ['system-health'] }),
      queryClient.invalidateQueries({ queryKey: ['health-checks'] }),
      queryClient.invalidateQueries({ queryKey: ['performance-monitoring'] }),
      queryClient.invalidateQueries({ queryKey: ['resource-monitoring'] }),
      queryClient.invalidateQueries({ queryKey: ['service-monitoring'] }),
      queryClient.invalidateQueries({ queryKey: ['endpoint-monitoring'] }),
      queryClient.invalidateQueries({ queryKey: ['dependency-monitoring'] }),
      queryClient.invalidateQueries({ queryKey: ['monitoring-alerts'] }),
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    ])
  }, [refetch, queryClient])

  // Funções de health checks
  const runHealthCheck = useCallback(async (id: string) => {
    return await runHealthCheckMutation.mutateAsync(id)
  }, [runHealthCheckMutation])

  const runAllHealthChecks = useCallback(async () => {
    const results = await Promise.all(
      healthChecks.map(check => runHealthCheckMutation.mutateAsync(check.id))
    )
    return results
  }, [healthChecks, runHealthCheckMutation])

  const createHealthCheck = useCallback(async (check: Omit<HealthCheck, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createHealthCheckMutation.mutateAsync(check)
  }, [createHealthCheckMutation])

  const updateHealthCheck = useCallback(async (id: string, updates: Partial<HealthCheck>) => {
    return await updateHealthCheckMutation.mutateAsync({ id, updates })
  }, [updateHealthCheckMutation])

  const deleteHealthCheck = useCallback(async (id: string) => {
    await deleteHealthCheckMutation.mutateAsync(id)
  }, [deleteHealthCheckMutation])

  // Funções de serviços
  const createService = useCallback(async (service: Omit<ServiceMonitoring, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createServiceMutation.mutateAsync(service)
  }, [createServiceMutation])

  const updateService = useCallback(async (id: string, updates: Partial<ServiceMonitoring>) => {
    return await updateServiceMutation.mutateAsync({ id, updates })
  }, [updateServiceMutation])

  const deleteService = useCallback(async (id: string) => {
    await deleteServiceMutation.mutateAsync(id)
  }, [deleteServiceMutation])

  // Funções de endpoints
  const createEndpoint = useCallback(async (endpoint: Omit<EndpointMonitoring, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createEndpointMutation.mutateAsync(endpoint)
  }, [createEndpointMutation])

  const updateEndpoint = useCallback(async (id: string, updates: Partial<EndpointMonitoring>) => {
    return await updateEndpointMutation.mutateAsync({ id, updates })
  }, [updateEndpointMutation])

  const deleteEndpoint = useCallback(async (id: string) => {
    await deleteEndpointMutation.mutateAsync(id)
  }, [deleteEndpointMutation])

  // Funções de dependências
  const createDependency = useCallback(async (dependency: Omit<DependencyMonitoring, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createDependencyMutation.mutateAsync(dependency)
  }, [createDependencyMutation])

  const updateDependency = useCallback(async (id: string, updates: Partial<DependencyMonitoring>) => {
    return await updateDependencyMutation.mutateAsync({ id, updates })
  }, [updateDependencyMutation])

  const deleteDependency = useCallback(async (id: string) => {
    await deleteDependencyMutation.mutateAsync(id)
  }, [deleteDependencyMutation])

  // Funções de alertas
  const acknowledgeAlert = useCallback(async (id: string, userId: string) => {
    await acknowledgeAlertMutation.mutateAsync({ id, userId })
  }, [acknowledgeAlertMutation])

  const resolveAlert = useCallback(async (id: string, userId: string, resolution: string) => {
    await resolveAlertMutation.mutateAsync({ id, userId, resolution })
  }, [resolveAlertMutation])

  const suppressAlert = useCallback(async (id: string, duration: number) => {
    await suppressAlertMutation.mutateAsync({ id, duration })
  }, [suppressAlertMutation])

  // Funções de incidentes
  const createIncident = useCallback(async (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createIncidentMutation.mutateAsync(incident)
  }, [createIncidentMutation])

  const updateIncident = useCallback(async (id: string, updates: Partial<Incident>) => {
    return await updateIncidentMutation.mutateAsync({ id, updates })
  }, [updateIncidentMutation])

  const resolveIncident = useCallback(async (id: string, resolution: string) => {
    await resolveIncidentMutation.mutateAsync({ id, resolution })
  }, [resolveIncidentMutation])

  // Funções de manutenção
  const createMaintenanceWindow = useCallback(async (window: Omit<MaintenanceWindow, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createMaintenanceWindowMutation.mutateAsync(window)
  }, [createMaintenanceWindowMutation])

  const updateMaintenanceWindow = useCallback(async (id: string, updates: Partial<MaintenanceWindow>) => {
    return await updateMaintenanceWindowMutation.mutateAsync({ id, updates })
  }, [updateMaintenanceWindowMutation])

  const cancelMaintenanceWindow = useCallback(async (id: string, reason: string) => {
    await cancelMaintenanceWindowMutation.mutateAsync({ id, reason })
  }, [cancelMaintenanceWindowMutation])

  // Função de configuração
  const updateConfiguration = useCallback(async (config: Partial<MonitoringConfiguration>) => {
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

  // Função para alternar notificações
  const toggleNotifications = useCallback(() => {
    setIsNotificationsEnabled(prev => !prev)
  }, [])

  // Utilitários
  const getSystemStatus = useCallback((): SystemStatus => {
    if (!monitoring) return 'unknown'
    return monitoring.status
  }, [monitoring])

  const getOverallHealth = useCallback((): HealthStatus => {
    if (!systemHealth) return 'unknown'
    return systemHealth.status
  }, [systemHealth])

  const getActiveIncidentsCount = useCallback((): number => {
    return incidents.filter(incident => incident.status === 'open' || incident.status === 'investigating').length
  }, [incidents])

  const getActiveAlertsCount = useCallback((): number => {
    return alerts.filter(alert => alert.status === 'active' || alert.status === 'triggered').length
  }, [alerts])

  const getCurrentUptime = useCallback((): number => {
    if (!uptimeMetrics) return 0
    return uptimeMetrics.currentUptime
  }, [uptimeMetrics])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (notificationRef.current) {
        notificationRef.current.close()
      }
    }
  }, [])

  return {
    // Dados de monitoramento
    monitoring,
    systemHealth,
    healthChecks,
    uptimeMetrics,
    performanceMetrics,
    resourceMetrics,
    services,
    endpoints,
    dependencies,
    alerts,
    incidents,
    maintenanceWindows,
    slaMetrics,
    configuration,
    
    // Estados
    isLoading,
    isError,
    error: error as Error | null,
    isConnected,
    lastUpdate,
    
    // Filtros
    filters,
    
    // Ações básicas
    setFilters,
    clearFilters,
    refreshMonitoring,
    
    // Ações de health checks
    runHealthCheck,
    runAllHealthChecks,
    createHealthCheck,
    updateHealthCheck,
    deleteHealthCheck,
    
    // Ações de serviços
    createService,
    updateService,
    deleteService,
    
    // Ações de endpoints
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    
    // Ações de dependências
    createDependency,
    updateDependency,
    deleteDependency,
    
    // Ações de alertas
    acknowledgeAlert,
    resolveAlert,
    suppressAlert,
    
    // Ações de incidentes
    createIncident,
    updateIncident,
    resolveIncident,
    
    // Ações de manutenção
    createMaintenanceWindow,
    updateMaintenanceWindow,
    cancelMaintenanceWindow,
    
    // Configuração
    updateConfiguration,
    
    // Real-time
    toggleRealTime,
    isRealTimeEnabled,
    
    // Auto-refresh
    toggleAutoRefresh,
    updateRefreshInterval,
    
    // Notificações
    toggleNotifications,
    isNotificationsEnabled,
    
    // Utilitários
    getSystemStatus,
    getOverallHealth,
    getActiveIncidentsCount,
    getActiveAlertsCount,
    getCurrentUptime
  }
}

export default useRealTimeMonitoring