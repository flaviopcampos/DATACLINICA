/**
 * Hook de Integração - DataClínica
 * 
 * Este hook gerencia a integração entre o sistema de sessões
 * e os sistemas existentes de 2FA, auditoria e notificações.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { integrationService } from '../services/integrationService'
import { useSessions } from './useSessions'
import { useAuth } from './useAuth'
import type {
  Session,
  SecurityAlert,
  SessionSettings
} from '../types/session'
import type { NotificationPreference } from '../types/notification'

interface UseIntegrationOptions {
  sessionId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useIntegration(options: UseIntegrationOptions = {}) {
  const { sessionId, autoRefresh = false, refreshInterval = 30000 } = options
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { refetch: refetchSessions } = useSessions()

  // Verificar segurança da sessão
  const {
    data: securityCheck,
    isLoading: isCheckingSecurityLoading,
    error: securityCheckError,
    refetch: refetchSecurityCheck
  } = useQuery({
    queryKey: ['session-security-check', sessionId],
    queryFn: () => integrationService.checkSessionSecurity(sessionId!),
    enabled: !!sessionId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Obter dados integrados da sessão
  const {
    data: integrationData,
    isLoading: isIntegrationDataLoading,
    error: integrationDataError,
    refetch: refetchIntegrationData
  } = useQuery({
    queryKey: ['session-integration-data', sessionId],
    queryFn: () => integrationService.getSessionIntegrationData(sessionId!),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Verificar se reautenticação é necessária
  const {
    data: reauthRequired,
    isLoading: isReauthCheckLoading,
    refetch: checkReauthRequired
  } = useQuery({
    queryKey: ['session-reauth-required', sessionId],
    queryFn: () => integrationService.checkReauthenticationRequired(sessionId!),
    enabled: !!sessionId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 1 * 60 * 1000, // 1 minuto
  })

  // Validar sessão com 2FA
  const validateWith2FA = useMutation({
    mutationFn: ({ sessionId, token }: { sessionId: string; token: string }) =>
      integrationService.validateSessionWith2FA(sessionId, token),
    onSuccess: () => {
      toast.success('Sessão validada com sucesso')
      queryClient.invalidateQueries({ queryKey: ['session-security-check'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      refetchSessions()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao validar sessão com 2FA')
    }
  })

  // Registrar atividade da sessão
  const logActivity = useMutation({
    mutationFn: ({
      sessionId,
      activityType,
      details
    }: {
      sessionId: string
      activityType: string
      details: Record<string, any>
    }) => integrationService.logSessionActivity(sessionId, activityType, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-integration-data'] })
    },
    onError: (error: any) => {
      console.error('Erro ao registrar atividade:', error)
    }
  })

  // Enviar notificação de segurança
  const sendSecurityNotification = useMutation({
    mutationFn: ({
      userId,
      notificationType,
      sessionData,
      priority = 'normal'
    }: {
      userId: number
      notificationType: string
      sessionData: Partial<Session>
      priority?: 'low' | 'normal' | 'high' | 'urgent' | 'critical'
    }) => integrationService.sendSessionSecurityNotification(
      userId,
      notificationType,
      sessionData,
      priority
    ),
    onSuccess: () => {
      toast.success('Notificação de segurança enviada')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar notificação')
    }
  })

  // Sincronizar preferências de notificação
  const syncNotificationPreferences = useMutation({
    mutationFn: ({
      userId,
      sessionSettings
    }: {
      userId: number
      sessionSettings: SessionSettings
    }) => integrationService.syncSessionNotificationPreferences(userId, sessionSettings),
    onSuccess: () => {
      toast.success('Preferências de notificação sincronizadas')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao sincronizar preferências')
    }
  })

  // Processar alerta de segurança
  const processSecurityAlert = useMutation({
    mutationFn: (alert: SecurityAlert) =>
      integrationService.processSessionSecurityAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-security-check'] })
      queryClient.invalidateQueries({ queryKey: ['session-integration-data'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      refetchSessions()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao processar alerta de segurança')
    }
  })

  // Executar reautenticação
  const performReauthentication = useMutation({
    mutationFn: ({ sessionId, token }: { sessionId: string; token: string }) =>
      integrationService.performReauthentication(sessionId, token),
    onSuccess: () => {
      toast.success('Reautenticação realizada com sucesso')
      queryClient.invalidateQueries({ queryKey: ['session-reauth-required'] })
      queryClient.invalidateQueries({ queryKey: ['session-security-check'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      refetchSessions()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro na reautenticação')
    }
  })

  // Funções auxiliares
  const handleSecurityAlert = async (alert: SecurityAlert) => {
    try {
      await processSecurityAlert.mutateAsync(alert)
      
      // Registrar atividade
      if (sessionId) {
        await logActivity.mutateAsync({
          sessionId,
          activityType: 'security_alert_handled',
          details: {
            alertType: alert.type,
            severity: alert.severity,
            timestamp: new Date().toISOString()
          }
        })
      }
    } catch (error) {
      console.error('Erro ao processar alerta de segurança:', error)
    }
  }

  const handleSuspiciousActivity = async (sessionId: string, details: Record<string, any>) => {
    if (!user) return

    try {
      // Registrar atividade suspeita
      await logActivity.mutateAsync({
        sessionId,
        activityType: 'suspicious_activity',
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          userId: user.id
        }
      })

      // Enviar notificação
      await sendSecurityNotification.mutateAsync({
        userId: user.id,
        notificationType: 'suspicious_activity',
        sessionData: { id: sessionId },
        priority: 'high'
      })

      // Processar alerta de segurança
      const alert: SecurityAlert = {
        id: `alert_${Date.now()}`,
        sessionId,
        userId: user.id,
        type: 'suspicious_activity',
        severity: 'high',
        message: 'Atividade suspeita detectada na sessão',
        details,
        timestamp: new Date().toISOString(),
        isRead: false
      }

      await handleSecurityAlert(alert)
    } catch (error) {
      console.error('Erro ao processar atividade suspeita:', error)
    }
  }

  const handleNewDeviceLogin = async (sessionData: Partial<Session>) => {
    if (!user || !sessionData.id) return

    try {
      // Registrar login de novo dispositivo
      await logActivity.mutateAsync({
        sessionId: sessionData.id,
        activityType: 'new_device_login',
        details: {
          deviceInfo: sessionData.deviceInfo,
          location: sessionData.location,
          timestamp: new Date().toISOString()
        }
      })

      // Enviar notificação
      await sendSecurityNotification.mutateAsync({
        userId: user.id,
        notificationType: 'new_device',
        sessionData,
        priority: 'normal'
      })
    } catch (error) {
      console.error('Erro ao processar login de novo dispositivo:', error)
    }
  }

  const handleLocationChange = async (sessionId: string, newLocation: any, oldLocation?: any) => {
    if (!user) return

    try {
      const details = {
        newLocation,
        oldLocation,
        timestamp: new Date().toISOString()
      }

      // Registrar mudança de localização
      await logActivity.mutateAsync({
        sessionId,
        activityType: 'location_change',
        details
      })

      // Verificar se a localização é suspeita
      const isSuspicious = securityCheck?.isLocationSuspicious
      
      if (isSuspicious) {
        await sendSecurityNotification.mutateAsync({
          userId: user.id,
          notificationType: 'suspicious_location',
          sessionData: { id: sessionId, location: newLocation },
          priority: 'high'
        })
      }
    } catch (error) {
      console.error('Erro ao processar mudança de localização:', error)
    }
  }

  // Verificar automaticamente se reautenticação é necessária
  const checkAndHandleReauth = async (sessionId: string) => {
    try {
      const required = await integrationService.checkReauthenticationRequired(sessionId)
      
      if (required) {
        toast.warning('Reautenticação necessária para continuar', {
          action: {
            label: 'Reautenticar',
            onClick: () => {
              // Trigger reauth modal/flow
              window.dispatchEvent(new CustomEvent('session:reauth-required', {
                detail: { sessionId }
              }))
            }
          }
        })
      }
      
      return required
    } catch (error) {
      console.error('Erro ao verificar necessidade de reautenticação:', error)
      return false
    }
  }

  return {
    // Dados
    securityCheck,
    integrationData,
    reauthRequired,
    
    // Estados de carregamento
    isCheckingSecurityLoading,
    isIntegrationDataLoading,
    isReauthCheckLoading,
    
    // Erros
    securityCheckError,
    integrationDataError,
    
    // Mutações
    validateWith2FA,
    logActivity,
    sendSecurityNotification,
    syncNotificationPreferences,
    processSecurityAlert,
    performReauthentication,
    
    // Funções auxiliares
    handleSecurityAlert,
    handleSuspiciousActivity,
    handleNewDeviceLogin,
    handleLocationChange,
    checkAndHandleReauth,
    
    // Refetch functions
    refetchSecurityCheck,
    refetchIntegrationData,
    checkReauthRequired,
    
    // Estados das mutações
    isValidating2FA: validateWith2FA.isPending,
    isLoggingActivity: logActivity.isPending,
    isSendingNotification: sendSecurityNotification.isPending,
    isSyncingPreferences: syncNotificationPreferences.isPending,
    isProcessingAlert: processSecurityAlert.isPending,
    isPerformingReauth: performReauthentication.isPending
  }
}

export default useIntegration