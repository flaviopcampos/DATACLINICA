'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  SecurityEvent,
  SecurityAlert,
  SeverityLevel,
  SecurityEventsResponse,
  AuditApiResponse
} from '@/types/audit'

// Simulação de dados para desenvolvimento
const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'sec-001',
    timestamp: new Date('2024-01-15T14:30:00Z'),
    type: 'FAILED_LOGIN_ATTEMPTS',
    severity: SeverityLevel.HIGH,
    source: {
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userId: 'user-unknown',
      location: {
        country: 'Brasil',
        city: 'Rio de Janeiro'
      }
    },
    target: {
      resource: 'authentication',
      module: 'Login',
      endpoint: '/api/auth/login'
    },
    description: 'Múltiplas tentativas de login falharam para usuário inexistente',
    indicators: {
      failedAttempts: 15,
      suspiciousPatterns: ['brute_force', 'credential_stuffing'],
      riskScore: 8.5,
      confidence: 0.92
    },
    response: {
      action: 'BLOCKED',
      automated: true,
      notificationsSent: ['admin@dataclinica.com', 'security@dataclinica.com']
    },
    investigation: {
      status: 'IN_PROGRESS',
      assignedTo: 'security-team',
      notes: 'Possível ataque de força bruta. IP bloqueado temporariamente.'
    },
    relatedEvents: ['sec-002', 'sec-003']
  },
  {
    id: 'sec-002',
    timestamp: new Date('2024-01-15T15:45:00Z'),
    type: 'SUSPICIOUS_ACTIVITY',
    severity: SeverityLevel.MEDIUM,
    source: {
      ipAddress: '192.168.1.150',
      userId: 'user-456',
      location: {
        country: 'Brasil',
        city: 'São Paulo'
      }
    },
    target: {
      resource: 'patient_data',
      module: 'Pacientes',
      endpoint: '/api/patients/bulk-export'
    },
    description: 'Acesso a grande volume de dados de pacientes fora do horário comercial',
    indicators: {
      suspiciousPatterns: ['unusual_time', 'bulk_access'],
      riskScore: 6.2,
      confidence: 0.75
    },
    response: {
      action: 'MONITORED',
      automated: true,
      notificationsSent: ['compliance@dataclinica.com']
    },
    investigation: {
      status: 'OPEN',
      notes: 'Usuário autorizado, mas padrão de acesso incomum. Monitorando.'
    }
  },
  {
    id: 'sec-003',
    timestamp: new Date('2024-01-15T16:20:00Z'),
    type: 'ANOMALY_DETECTED',
    severity: SeverityLevel.CRITICAL,
    source: {
      ipAddress: '10.0.0.25',
      userId: 'admin-001',
      location: {
        country: 'Brasil',
        city: 'São Paulo'
      }
    },
    target: {
      resource: 'system_configuration',
      module: 'Administração',
      endpoint: '/api/admin/config'
    },
    description: 'Alterações críticas na configuração do sistema detectadas',
    indicators: {
      suspiciousPatterns: ['privilege_escalation', 'config_tampering'],
      riskScore: 9.1,
      confidence: 0.88
    },
    response: {
      action: 'ALERTED',
      automated: true,
      notificationsSent: ['admin@dataclinica.com', 'cto@dataclinica.com']
    },
    investigation: {
      status: 'RESOLVED',
      assignedTo: 'admin-team',
      notes: 'Alteração autorizada pelo CTO. Falso positivo.',
      resolution: 'Configuração de regra de detecção ajustada para evitar futuros falsos positivos.'
    }
  }
]

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: 'alert-001',
    timestamp: new Date('2024-01-15T14:35:00Z'),
    type: 'THRESHOLD_EXCEEDED',
    severity: SeverityLevel.HIGH,
    title: 'Tentativas de Login Suspeitas',
    message: 'Detectadas 15 tentativas de login falharam do IP 203.0.113.45 nos últimos 5 minutos.',
    source: {
      module: 'SecurityMonitor',
      rule: 'failed_login_threshold',
      eventIds: ['sec-001']
    },
    recipients: ['admin@dataclinica.com', 'security@dataclinica.com'],
    channels: ['EMAIL', 'IN_APP'],
    status: 'ACKNOWLEDGED',
    acknowledgedBy: 'admin-001',
    acknowledgedAt: new Date('2024-01-15T14:40:00Z')
  },
  {
    id: 'alert-002',
    timestamp: new Date('2024-01-15T16:25:00Z'),
    type: 'REAL_TIME',
    severity: SeverityLevel.CRITICAL,
    title: 'Alteração Crítica no Sistema',
    message: 'Configurações críticas do sistema foram alteradas pelo usuário admin-001.',
    source: {
      module: 'SystemMonitor',
      rule: 'critical_config_change',
      eventIds: ['sec-003']
    },
    recipients: ['admin@dataclinica.com', 'cto@dataclinica.com'],
    channels: ['EMAIL', 'SMS', 'IN_APP'],
    status: 'ACKNOWLEDGED',
    acknowledgedBy: 'cto-001',
    acknowledgedAt: new Date('2024-01-15T16:30:00Z')
  }
]

// Simulação de métricas de segurança em tempo real
const mockSecurityMetrics = {
  realTimeThreats: {
    active: 2,
    blocked: 15,
    investigating: 3
  },
  riskScore: {
    current: 4.2,
    trend: 'decreasing',
    history: [
      { timestamp: new Date('2024-01-15T10:00:00Z'), score: 5.1 },
      { timestamp: new Date('2024-01-15T12:00:00Z'), score: 4.8 },
      { timestamp: new Date('2024-01-15T14:00:00Z'), score: 4.5 },
      { timestamp: new Date('2024-01-15T16:00:00Z'), score: 4.2 }
    ]
  },
  failedLogins: {
    last24h: 45,
    trend: 'increasing',
    topIPs: [
      { ip: '203.0.113.45', attempts: 15, blocked: true },
      { ip: '198.51.100.23', attempts: 8, blocked: false },
      { ip: '192.0.2.100', attempts: 6, blocked: false }
    ]
  },
  suspiciousActivities: {
    last24h: 12,
    categories: {
      'unusual_access_patterns': 5,
      'bulk_data_access': 3,
      'off_hours_activity': 2,
      'privilege_escalation': 1,
      'anomalous_behavior': 1
    }
  }
}

// Simulação de API de segurança
const securityApi = {
  async getSecurityEvents(filters?: {
    severity?: SeverityLevel[]
    type?: string[]
    status?: string[]
    dateRange?: { startDate: Date; endDate: Date }
  }): Promise<SecurityEventsResponse> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    let filteredEvents = [...mockSecurityEvents]
    
    if (filters) {
      if (filters.severity?.length) {
        filteredEvents = filteredEvents.filter(event => 
          filters.severity!.includes(event.severity)
        )
      }
      
      if (filters.type?.length) {
        filteredEvents = filteredEvents.filter(event => 
          filters.type!.includes(event.type)
        )
      }
      
      if (filters.status?.length) {
        filteredEvents = filteredEvents.filter(event => 
          filters.status!.includes(event.investigation.status)
        )
      }
      
      if (filters.dateRange) {
        filteredEvents = filteredEvents.filter(event => 
          event.timestamp >= filters.dateRange!.startDate &&
          event.timestamp <= filters.dateRange!.endDate
        )
      }
    }
    
    return {
      success: true,
      data: {
        events: filteredEvents,
        summary: {
          total: filteredEvents.length,
          open: filteredEvents.filter(e => e.investigation.status === 'OPEN').length,
          resolved: filteredEvents.filter(e => e.investigation.status === 'RESOLVED').length,
          falsePositives: filteredEvents.filter(e => e.investigation.status === 'FALSE_POSITIVE').length
        }
      }
    }
  },
  
  async getSecurityAlerts(): Promise<AuditApiResponse<SecurityAlert[]>> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      success: true,
      data: mockSecurityAlerts
    }
  },
  
  async getSecurityMetrics(): Promise<AuditApiResponse<typeof mockSecurityMetrics>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      success: true,
      data: mockSecurityMetrics
    }
  },
  
  async acknowledgeAlert(alertId: string, userId: string): Promise<SecurityAlert> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const alert = mockSecurityAlerts.find(a => a.id === alertId)
    if (!alert) throw new Error('Alerta não encontrado')
    
    return {
      ...alert,
      status: 'ACKNOWLEDGED',
      acknowledgedBy: userId,
      acknowledgedAt: new Date()
    }
  },
  
  async updateInvestigation(eventId: string, updates: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE'
    assignedTo?: string
    notes?: string
    resolution?: string
  }): Promise<SecurityEvent> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const event = mockSecurityEvents.find(e => e.id === eventId)
    if (!event) throw new Error('Evento não encontrado')
    
    return {
      ...event,
      investigation: {
        ...event.investigation,
        ...updates
      }
    }
  },
  
  async blockIP(ipAddress: string, reason: string, duration?: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800))
    console.log(`IP ${ipAddress} bloqueado. Motivo: ${reason}. Duração: ${duration || 'indefinida'}`)
  },
  
  async createSecurityRule(rule: {
    name: string
    description: string
    conditions: Record<string, any>
    actions: string[]
    severity: SeverityLevel
  }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Nova regra de segurança criada:', rule)
  }
}

export function useSecurityMonitor() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<{
    severity?: SeverityLevel[]
    type?: string[]
    status?: string[]
    dateRange?: { startDate: Date; endDate: Date }
  }>({})
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  // Query para eventos de segurança
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['security-events', filters],
    queryFn: () => securityApi.getSecurityEvents(filters),
    staleTime: 30000,
    refetchInterval: isMonitoring ? 30000 : false // Auto-refresh a cada 30 segundos
  })
  
  // Query para alertas de segurança
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    error: alertsError
  } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: securityApi.getSecurityAlerts,
    staleTime: 15000,
    refetchInterval: isMonitoring ? 15000 : false // Auto-refresh a cada 15 segundos
  })
  
  // Query para métricas de segurança
  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: securityApi.getSecurityMetrics,
    staleTime: 10000,
    refetchInterval: isMonitoring ? 10000 : false // Auto-refresh a cada 10 segundos
  })
  
  // Mutation para reconhecer alerta
  const acknowledgeAlertMutation = useMutation({
    mutationFn: ({ alertId, userId }: { alertId: string; userId: string }) => 
      securityApi.acknowledgeAlert(alertId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] })
      toast.success('Alerta reconhecido com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao reconhecer alerta:', error)
      toast.error('Erro ao reconhecer alerta de segurança')
    }
  })
  
  // Mutation para atualizar investigação
  const updateInvestigationMutation = useMutation({
    mutationFn: ({ eventId, updates }: { 
      eventId: string
      updates: {
        status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE'
        assignedTo?: string
        notes?: string
        resolution?: string
      }
    }) => securityApi.updateInvestigation(eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] })
      toast.success('Investigação atualizada com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao atualizar investigação:', error)
      toast.error('Erro ao atualizar investigação')
    }
  })
  
  // Mutation para bloquear IP
  const blockIPMutation = useMutation({
    mutationFn: ({ ipAddress, reason, duration }: { 
      ipAddress: string
      reason: string
      duration?: number 
    }) => securityApi.blockIP(ipAddress, reason, duration),
    onSuccess: () => {
      toast.success('IP bloqueado com sucesso')
      queryClient.invalidateQueries({ queryKey: ['security-events'] })
    },
    onError: (error) => {
      console.error('Erro ao bloquear IP:', error)
      toast.error('Erro ao bloquear endereço IP')
    }
  })
  
  // Mutation para criar regra de segurança
  const createRuleMutation = useMutation({
    mutationFn: securityApi.createSecurityRule,
    onSuccess: () => {
      toast.success('Regra de segurança criada com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao criar regra:', error)
      toast.error('Erro ao criar regra de segurança')
    }
  })
  
  // Simulação de notificações em tempo real
  useEffect(() => {
    if (!isMonitoring) return
    
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      
      // Simular novos eventos ocasionalmente
      if (Math.random() < 0.05) { // 5% de chance
        queryClient.invalidateQueries({ queryKey: ['security-events'] })
        queryClient.invalidateQueries({ queryKey: ['security-alerts'] })
        
        // Simular notificação de novo evento crítico
        if (Math.random() < 0.3) { // 30% de chance de ser crítico
          toast.error('Novo evento de segurança crítico detectado!', {
            duration: 10000,
            action: {
              label: 'Ver Detalhes',
              onClick: () => console.log('Navegando para detalhes do evento')
            }
          })
        }
      }
    }, 15000) // A cada 15 segundos
    
    return () => clearInterval(interval)
  }, [isMonitoring, queryClient])
  
  // Funções de filtro
  const updateFilters = useCallback((newFilters: typeof filters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])
  
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])
  
  const applyQuickFilter = useCallback((type: 'critical' | 'today' | 'unresolved' | 'high-risk') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (type) {
      case 'critical':
        updateFilters({ severity: [SeverityLevel.CRITICAL] })
        break
      case 'today':
        updateFilters({
          dateRange: {
            startDate: today,
            endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
          }
        })
        break
      case 'unresolved':
        updateFilters({ status: ['OPEN', 'IN_PROGRESS'] })
        break
      case 'high-risk':
        updateFilters({ severity: [SeverityLevel.CRITICAL, SeverityLevel.HIGH] })
        break
    }
  }, [updateFilters])
  
  // Função para refresh manual
  const refresh = useCallback(() => {
    refetchEvents()
    queryClient.invalidateQueries({ queryKey: ['security-alerts'] })
    queryClient.invalidateQueries({ queryKey: ['security-metrics'] })
    setLastUpdate(new Date())
  }, [refetchEvents, queryClient])
  
  // Função para reconhecer alerta
  const acknowledgeAlert = useCallback((alertId: string) => {
    acknowledgeAlertMutation.mutate({ 
      alertId, 
      userId: 'current-user' // Seria obtido do contexto de autenticação
    })
  }, [acknowledgeAlertMutation])
  
  // Função para atualizar investigação
  const updateInvestigation = useCallback((eventId: string, updates: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE'
    assignedTo?: string
    notes?: string
    resolution?: string
  }) => {
    updateInvestigationMutation.mutate({ eventId, updates })
  }, [updateInvestigationMutation])
  
  // Função para bloquear IP
  const blockIP = useCallback((ipAddress: string, reason: string, duration?: number) => {
    blockIPMutation.mutate({ ipAddress, reason, duration })
  }, [blockIPMutation])
  
  return {
    // Dados
    events: eventsData?.data?.events || [],
    eventsSummary: eventsData?.data?.summary,
    alerts: alertsData?.data || [],
    metrics: metricsData?.data,
    
    // Estados
    isLoading: isLoadingEvents || isLoadingAlerts || isLoadingMetrics,
    isLoadingEvents,
    isLoadingAlerts,
    isLoadingMetrics,
    isAcknowledging: acknowledgeAlertMutation.isPending,
    isUpdatingInvestigation: updateInvestigationMutation.isPending,
    isBlockingIP: blockIPMutation.isPending,
    isCreatingRule: createRuleMutation.isPending,
    
    // Erros
    error: eventsError || alertsError || metricsError,
    eventsError,
    alertsError,
    metricsError,
    
    // Filtros
    filters,
    updateFilters,
    clearFilters,
    applyQuickFilter,
    
    // Ações
    acknowledgeAlert,
    updateInvestigation,
    blockIP,
    createRule: createRuleMutation.mutate,
    refresh,
    
    // Monitoramento
    isMonitoring,
    setIsMonitoring,
    lastUpdate,
    
    // Estatísticas derivadas
    criticalEvents: eventsData?.data?.events.filter(e => e.severity === SeverityLevel.CRITICAL).length || 0,
    unresolvedEvents: eventsData?.data?.events.filter(e => 
      e.investigation.status === 'OPEN' || e.investigation.status === 'IN_PROGRESS'
    ).length || 0,
    unacknowledgedAlerts: alertsData?.data?.filter(a => a.status !== 'ACKNOWLEDGED').length || 0
  }
}

export default useSecurityMonitor