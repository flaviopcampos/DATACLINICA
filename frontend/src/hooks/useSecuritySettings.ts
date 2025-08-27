import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { securityService } from '@/services/securityService'
import { SecuritySettings, SecuritySettingsUpdate, TrustedDevice, SecurityEvent, SessionInfo } from '@/types/security'
import { toast } from 'sonner'

const SECURITY_SETTINGS_QUERY_KEY = ['security-settings']
const TRUSTED_DEVICES_QUERY_KEY = ['trusted-devices']
const SECURITY_EVENTS_QUERY_KEY = ['security-events']
const ACTIVE_SESSIONS_QUERY_KEY = ['active-sessions']

export function useSecuritySettings() {
  const queryClient = useQueryClient()

  // Configurações de segurança
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery({
    queryKey: SECURITY_SETTINGS_QUERY_KEY,
    queryFn: securityService.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })

  // Dispositivos confiáveis
  const {
    data: trustedDevices,
    isLoading: isLoadingDevices,
    error: devicesError,
    refetch: refetchDevices
  } = useQuery({
    queryKey: TRUSTED_DEVICES_QUERY_KEY,
    queryFn: securityService.getTrustedDevices,
    staleTime: 2 * 60 * 1000,
  })

  // Eventos de segurança
  const {
    data: securityEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: SECURITY_EVENTS_QUERY_KEY,
    queryFn: () => securityService.getSecurityEvents({ limit: 50 }),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
  })

  // Sessões ativas
  const {
    data: activeSessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions
  } = useQuery({
    queryKey: ACTIVE_SESSIONS_QUERY_KEY,
    queryFn: securityService.getActiveSessions,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // Atualiza a cada minuto
  })

  // Atualizar configurações de segurança
  const updateSettingsMutation = useMutation({
    mutationFn: (data: SecuritySettingsUpdate) => securityService.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(SECURITY_SETTINGS_QUERY_KEY, updatedSettings)
      toast.success('Configurações de segurança atualizadas!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar configurações de segurança')
    },
  })

  // Ativar/desativar 2FA
  const toggle2FAMutation = useMutation({
    mutationFn: ({ enabled, secret }: { enabled: boolean; secret?: string }) => 
      securityService.toggle2FA(enabled, secret),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SECURITY_SETTINGS_QUERY_KEY })
      if (result.enabled) {
        toast.success('Autenticação de dois fatores ativada!')
      } else {
        toast.success('Autenticação de dois fatores desativada!')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao configurar 2FA')
    },
  })

  // Gerar código QR para 2FA
  const generate2FAQRMutation = useMutation({
    mutationFn: () => securityService.generate2FAQR(),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar código QR')
    },
  })

  // Adicionar dispositivo confiável
  const addTrustedDeviceMutation = useMutation({
    mutationFn: (device: Omit<TrustedDevice, 'id' | 'addedAt'>) => 
      securityService.addTrustedDevice(device),
    onSuccess: (newDevice) => {
      queryClient.setQueryData(TRUSTED_DEVICES_QUERY_KEY, (old: TrustedDevice[] = []) => [
        ...old,
        newDevice
      ])
      toast.success('Dispositivo adicionado como confiável!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar dispositivo confiável')
    },
  })

  // Remover dispositivo confiável
  const removeTrustedDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => securityService.removeTrustedDevice(deviceId),
    onSuccess: (_, removedId) => {
      queryClient.setQueryData(TRUSTED_DEVICES_QUERY_KEY, (old: TrustedDevice[] = []) =>
        old.filter(device => device.id !== removedId)
      )
      toast.success('Dispositivo removido da lista de confiáveis!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover dispositivo confiável')
    },
  })

  // Encerrar sessão
  const terminateSessionMutation = useMutation({
    mutationFn: (sessionId: string) => securityService.terminateSession(sessionId),
    onSuccess: (_, terminatedId) => {
      queryClient.setQueryData(ACTIVE_SESSIONS_QUERY_KEY, (old: SessionInfo[] = []) =>
        old.filter(session => session.id !== terminatedId)
      )
      toast.success('Sessão encerrada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao encerrar sessão')
    },
  })

  // Encerrar todas as outras sessões
  const terminateAllOtherSessionsMutation = useMutation({
    mutationFn: () => securityService.terminateAllOtherSessions(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_SESSIONS_QUERY_KEY })
      toast.success(`${result.terminatedCount} sessões encerradas!`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao encerrar sessões')
    },
  })

  // Alterar senha
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      securityService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao alterar senha')
    },
  })

  // Verificar força da senha
  const checkPasswordStrengthMutation = useMutation({
    mutationFn: (password: string) => securityService.checkPasswordStrength(password),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao verificar força da senha')
    },
  })

  // Configurar política de senha
  const updatePasswordPolicyMutation = useMutation({
    mutationFn: (policy: any) => securityService.updatePasswordPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECURITY_SETTINGS_QUERY_KEY })
      toast.success('Política de senha atualizada!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar política de senha')
    },
  })

  // Configurar alertas de segurança
  const updateSecurityAlertsMutation = useMutation({
    mutationFn: (alerts: any) => securityService.updateSecurityAlerts(alerts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECURITY_SETTINGS_QUERY_KEY })
      toast.success('Alertas de segurança configurados!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao configurar alertas')
    },
  })

  // Marcar evento como lido
  const markEventAsReadMutation = useMutation({
    mutationFn: (eventId: string) => securityService.markEventAsRead(eventId),
    onSuccess: (_, eventId) => {
      queryClient.setQueryData(SECURITY_EVENTS_QUERY_KEY, (old: SecurityEvent[] = []) =>
        old.map(event => 
          event.id === eventId ? { ...event, read: true } : event
        )
      )
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao marcar evento como lido')
    },
  })

  // Exportar eventos de segurança
  const exportSecurityEventsMutation = useMutation({
    mutationFn: ({ startDate, endDate }: { startDate?: Date; endDate?: Date }) => 
      securityService.exportSecurityEvents(startDate, endDate),
    onSuccess: (exportData) => {
      const blob = new Blob([exportData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `eventos-seguranca-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Eventos de segurança exportados!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao exportar eventos')
    },
  })

  return {
    // Data
    settings,
    trustedDevices,
    securityEvents,
    activeSessions,
    
    // Loading states
    isLoading: isLoadingSettings || isLoadingDevices || isLoadingEvents || isLoadingSessions,
    isLoadingSettings,
    isLoadingDevices,
    isLoadingEvents,
    isLoadingSessions,
    
    // Errors
    error: settingsError || devicesError || eventsError || sessionsError,
    settingsError,
    devicesError,
    eventsError,
    sessionsError,
    
    // Actions
    updateSettings: updateSettingsMutation.mutate,
    toggle2FA: toggle2FAMutation.mutate,
    generate2FAQR: generate2FAQRMutation.mutate,
    addTrustedDevice: addTrustedDeviceMutation.mutate,
    removeTrustedDevice: removeTrustedDeviceMutation.mutate,
    terminateSession: terminateSessionMutation.mutate,
    terminateAllOtherSessions: terminateAllOtherSessionsMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    checkPasswordStrength: checkPasswordStrengthMutation.mutate,
    updatePasswordPolicy: updatePasswordPolicyMutation.mutate,
    updateSecurityAlerts: updateSecurityAlertsMutation.mutate,
    markEventAsRead: markEventAsReadMutation.mutate,
    exportSecurityEvents: exportSecurityEventsMutation.mutate,
    refetchSettings,
    refetchDevices,
    refetchEvents,
    refetchSessions,
    
    // Mutation states
    isUpdating: updateSettingsMutation.isPending,
    isToggling2FA: toggle2FAMutation.isPending,
    isGeneratingQR: generate2FAQRMutation.isPending,
    isAddingDevice: addTrustedDeviceMutation.isPending,
    isRemovingDevice: removeTrustedDeviceMutation.isPending,
    isTerminatingSession: terminateSessionMutation.isPending,
    isTerminatingAllSessions: terminateAllOtherSessionsMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isCheckingPassword: checkPasswordStrengthMutation.isPending,
    isUpdatingPolicy: updatePasswordPolicyMutation.isPending,
    isUpdatingAlerts: updateSecurityAlertsMutation.isPending,
    isMarkingRead: markEventAsReadMutation.isPending,
    isExporting: exportSecurityEventsMutation.isPending,
    
    // Mutation errors
    updateError: updateSettingsMutation.error,
    toggle2FAError: toggle2FAMutation.error,
    generateQRError: generate2FAQRMutation.error,
    addDeviceError: addTrustedDeviceMutation.error,
    removeDeviceError: removeTrustedDeviceMutation.error,
    terminateSessionError: terminateSessionMutation.error,
    terminateAllError: terminateAllOtherSessionsMutation.error,
    changePasswordError: changePasswordMutation.error,
    checkPasswordError: checkPasswordStrengthMutation.error,
    updatePolicyError: updatePasswordPolicyMutation.error,
    updateAlertsError: updateSecurityAlertsMutation.error,
    markReadError: markEventAsReadMutation.error,
    exportError: exportSecurityEventsMutation.error,
    
    // Mutation results
    qrCodeData: generate2FAQRMutation.data,
    passwordStrength: checkPasswordStrengthMutation.data,
  }
}

export type UseSecuritySettingsReturn = ReturnType<typeof useSecuritySettings>