'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AuditLog,
  AuditFilters,
  AuditStatistics,
  AuditSettings,
  AuditExportRequest,
  AuditExportResult,
  AuditLogsResponse,
  ActionType,
  EventCategory,
  SeverityLevel,
  AuditStatus
} from '@/types/audit'

// Simulação de dados para desenvolvimento
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    userId: 'user-123',
    userName: 'Dr. João Silva',
    userRole: 'DOCTOR',
    sessionId: 'session-abc123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: {
      country: 'Brasil',
      city: 'São Paulo'
    },
    actionType: ActionType.READ,
    category: EventCategory.DATA_MODIFICATION,
    severity: SeverityLevel.MEDIUM,
    status: AuditStatus.SUCCESS,
    resource: 'patient_record',
    resourceId: 'patient-456',
    module: 'Pacientes',
    description: 'Visualização de prontuário médico',
    details: {
      patientName: 'Maria Santos',
      recordType: 'consultation'
    },
    hash: 'sha256:abc123def456',
    complianceFlags: ['LGPD', 'HIPAA'],
    tags: ['medical-record', 'patient-data']
  },
  {
    id: '2',
    timestamp: new Date('2024-01-15T11:15:00Z'),
    userId: 'user-456',
    userName: 'Admin Sistema',
    userRole: 'ADMIN',
    sessionId: 'session-def456',
    ipAddress: '192.168.1.101',
    actionType: ActionType.PERMISSION_CHANGE,
    category: EventCategory.SYSTEM_ADMINISTRATION,
    severity: SeverityLevel.HIGH,
    status: AuditStatus.SUCCESS,
    resource: 'user_permissions',
    resourceId: 'user-789',
    module: 'Administração',
    description: 'Alteração de permissões de usuário',
    oldValues: { role: 'NURSE' },
    newValues: { role: 'DOCTOR' },
    hash: 'sha256:def456ghi789',
    complianceFlags: ['LGPD'],
    tags: ['permission-change', 'role-assignment']
  }
]

const mockStatistics: AuditStatistics = {
  totalEvents: 1250,
  eventsByCategory: {
    [EventCategory.AUTHENTICATION]: 320,
    [EventCategory.AUTHORIZATION]: 180,
    [EventCategory.DATA_MODIFICATION]: 450,
    [EventCategory.SYSTEM_ADMINISTRATION]: 120,
    [EventCategory.DATA_EXPORT]: 80,
    [EventCategory.SECURITY_INCIDENT]: 15,
    [EventCategory.COMPLIANCE]: 35,
    [EventCategory.BACKUP_RESTORE]: 25,
    [EventCategory.USER_MANAGEMENT]: 15,
    [EventCategory.CONFIGURATION]: 10
  },
  eventsBySeverity: {
    [SeverityLevel.LOW]: 600,
    [SeverityLevel.MEDIUM]: 450,
    [SeverityLevel.HIGH]: 150,
    [SeverityLevel.CRITICAL]: 50
  },
  eventsByStatus: {
    [AuditStatus.SUCCESS]: 1100,
    [AuditStatus.FAILURE]: 80,
    [AuditStatus.WARNING]: 50,
    [AuditStatus.BLOCKED]: 20
  },
  topUsers: [
    { userId: 'user-123', userName: 'Dr. João Silva', eventCount: 245 },
    { userId: 'user-456', userName: 'Enf. Maria Costa', eventCount: 189 },
    { userId: 'user-789', userName: 'Admin Sistema', eventCount: 156 }
  ],
  topModules: [
    { module: 'Pacientes', eventCount: 520 },
    { module: 'Agendamentos', eventCount: 380 },
    { module: 'Administração', eventCount: 220 },
    { module: 'Relatórios', eventCount: 130 }
  ],
  timelineData: [
    {
      date: '2024-01-15',
      count: 85,
      severity: {
        [SeverityLevel.LOW]: 45,
        [SeverityLevel.MEDIUM]: 25,
        [SeverityLevel.HIGH]: 12,
        [SeverityLevel.CRITICAL]: 3
      }
    }
  ],
  securityMetrics: {
    failedLogins: 25,
    suspiciousActivities: 8,
    blockedAttempts: 12,
    riskScore: 3.2
  }
}

const mockSettings: AuditSettings = {
  retention: {
    defaultDays: 2555, // 7 anos
    byCategory: {
      [EventCategory.AUTHENTICATION]: 365,
      [EventCategory.AUTHORIZATION]: 1095,
      [EventCategory.DATA_MODIFICATION]: 2555,
      [EventCategory.SYSTEM_ADMINISTRATION]: 2555,
      [EventCategory.DATA_EXPORT]: 2555,
      [EventCategory.SECURITY_INCIDENT]: 2555,
      [EventCategory.COMPLIANCE]: 2555,
      [EventCategory.BACKUP_RESTORE]: 1095,
      [EventCategory.USER_MANAGEMENT]: 2555,
      [EventCategory.CONFIGURATION]: 1095
    },
    complianceOverride: true
  },
  monitoring: {
    realTimeAlerts: true,
    emailNotifications: true,
    alertThresholds: {
      failedLogins: 5,
      suspiciousActivity: 3,
      criticalEvents: 1
    }
  },
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyRotationDays: 90
  },
  compliance: {
    standards: ['LGPD', 'HIPAA'],
    autoReporting: true,
    reportSchedule: '0 0 1 * *' // Primeiro dia de cada mês
  },
  performance: {
    batchSize: 1000,
    indexingEnabled: true,
    archiveAfterDays: 365
  }
}

// Simulação de API
const auditApi = {
  async getLogs(filters?: AuditFilters): Promise<AuditLogsResponse> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let filteredLogs = [...mockAuditLogs]
    
    if (filters) {
      if (filters.dateRange) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp >= filters.dateRange!.startDate &&
          log.timestamp <= filters.dateRange!.endDate
        )
      }
      
      if (filters.users?.length) {
        filteredLogs = filteredLogs.filter(log => 
          filters.users!.includes(log.userId || '')
        )
      }
      
      if (filters.actions?.length) {
        filteredLogs = filteredLogs.filter(log => 
          filters.actions!.includes(log.actionType)
        )
      }
      
      if (filters.categories?.length) {
        filteredLogs = filteredLogs.filter(log => 
          filters.categories!.includes(log.category)
        )
      }
      
      if (filters.severity?.length) {
        filteredLogs = filteredLogs.filter(log => 
          filters.severity!.includes(log.severity)
        )
      }
      
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        filteredLogs = filteredLogs.filter(log => 
          log.description.toLowerCase().includes(searchLower) ||
          log.userName?.toLowerCase().includes(searchLower) ||
          log.module.toLowerCase().includes(searchLower)
        )
      }
    }
    
    return {
      success: true,
      data: {
        logs: filteredLogs,
        statistics: mockStatistics
      },
      pagination: {
        page: 1,
        limit: 50,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / 50)
      }
    }
  },
  
  async getSettings(): Promise<AuditSettings> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockSettings
  },
  
  async updateSettings(settings: Partial<AuditSettings>): Promise<AuditSettings> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return { ...mockSettings, ...settings }
  },
  
  async exportLogs(request: AuditExportRequest): Promise<AuditExportResult> {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      id: `export-${Date.now()}`,
      status: 'COMPLETED',
      progress: 100,
      downloadUrl: '/api/audit/exports/audit-logs-2024-01-15.xlsx',
      fileName: `audit-logs-${new Date().toISOString().split('T')[0]}.${request.format.toLowerCase()}`,
      fileSize: 2048576, // 2MB
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    }
  },
  
  async createLog(log: Omit<AuditLog, 'id' | 'timestamp' | 'hash'>): Promise<AuditLog> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      hash: `sha256:${Math.random().toString(36).substring(2)}`
    }
    
    return newLog
  }
}

export function useAudit() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<AuditFilters>({})
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  // Query para buscar logs de auditoria
  const {
    data: logsData,
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditApi.getLogs(filters),
    staleTime: 30000, // 30 segundos
    refetchInterval: isConnected ? 60000 : false // Auto-refresh a cada minuto
  })
  
  // Query para configurações
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError
  } = useQuery({
    queryKey: ['audit-settings'],
    queryFn: auditApi.getSettings,
    staleTime: 300000 // 5 minutos
  })
  
  // Mutation para atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: auditApi.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['audit-settings'], data)
      toast.success('Configurações de auditoria atualizadas com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao atualizar configurações de auditoria')
    }
  })
  
  // Mutation para exportar logs
  const exportLogsMutation = useMutation({
    mutationFn: auditApi.exportLogs,
    onSuccess: (result) => {
      toast.success(`Exportação concluída: ${result.fileName}`)
      if (result.downloadUrl) {
        // Trigger download
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = result.fileName || 'audit-export'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    onError: (error) => {
      console.error('Erro na exportação:', error)
      toast.error('Erro ao exportar logs de auditoria')
    }
  })
  
  // Mutation para criar log de auditoria
  const createLogMutation = useMutation({
    mutationFn: auditApi.createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
    onError: (error) => {
      console.error('Erro ao criar log de auditoria:', error)
    }
  })
  
  // Simulação de WebSocket para atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setLastUpdate(new Date())
        // Simular nova atividade ocasionalmente
        if (Math.random() < 0.1) { // 10% de chance
          queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
        }
      }
    }, 30000) // A cada 30 segundos
    
    return () => clearInterval(interval)
  }, [isConnected, queryClient])
  
  // Funções de filtro
  const updateFilters = useCallback((newFilters: Partial<AuditFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])
  
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])
  
  const applyQuickFilter = useCallback((type: 'today' | 'week' | 'month' | 'critical' | 'failed') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (type) {
      case 'today':
        updateFilters({
          dateRange: {
            startDate: today,
            endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
          }
        })
        break
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        updateFilters({
          dateRange: {
            startDate: weekAgo,
            endDate: now
          }
        })
        break
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        updateFilters({
          dateRange: {
            startDate: monthAgo,
            endDate: now
          }
        })
        break
      case 'critical':
        updateFilters({
          severity: [SeverityLevel.CRITICAL, SeverityLevel.HIGH]
        })
        break
      case 'failed':
        updateFilters({
          status: [AuditStatus.FAILURE, AuditStatus.BLOCKED]
        })
        break
    }
  }, [updateFilters])
  
  // Função para criar log de auditoria
  const createAuditLog = useCallback(async (logData: {
    actionType: ActionType
    category: EventCategory
    severity: SeverityLevel
    resource: string
    resourceId?: string
    module: string
    description: string
    details?: Record<string, any>
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
  }) => {
    const log: Omit<AuditLog, 'id' | 'timestamp' | 'hash'> = {
      ...logData,
      userId: 'current-user', // Seria obtido do contexto de autenticação
      userName: 'Usuário Atual',
      userRole: 'USER',
      sessionId: 'current-session',
      ipAddress: '192.168.1.100', // Seria obtido do cliente
      status: AuditStatus.SUCCESS,
      complianceFlags: ['LGPD']
    }
    
    return createLogMutation.mutateAsync(log)
  }, [createLogMutation])
  
  // Função para refresh manual
  const refresh = useCallback(() => {
    refetchLogs()
    queryClient.invalidateQueries({ queryKey: ['audit-settings'] })
    setLastUpdate(new Date())
  }, [refetchLogs, queryClient])
  
  return {
    // Dados
    logs: logsData?.data?.logs || [],
    statistics: logsData?.data?.statistics || null,
    settings,
    
    // Estados
    isLoading: isLoadingLogs || isLoadingSettings,
    isLoadingLogs,
    isLoadingSettings,
    isExporting: exportLogsMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
    isCreatingLog: createLogMutation.isPending,
    
    // Erros
    error: logsError || settingsError,
    logsError,
    settingsError,
    exportError: exportLogsMutation.error,
    
    // Filtros
    filters,
    updateFilters,
    clearFilters,
    applyQuickFilter,
    
    // Ações
    updateSettings: updateSettingsMutation.mutate,
    exportLogs: exportLogsMutation.mutate,
    createAuditLog,
    refresh,
    
    // Status da conexão
    isConnected,
    setIsConnected,
    lastUpdate,
    
    // Paginação
    pagination: logsData?.pagination
  }
}

export default useAudit