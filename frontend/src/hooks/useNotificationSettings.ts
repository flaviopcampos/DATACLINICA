import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notificationService'
import { NotificationSettings, NotificationSettingsUpdate, NotificationChannel, NotificationType } from '@/types/notifications'
import { toast } from 'sonner'

const NOTIFICATION_SETTINGS_QUERY_KEY = ['notification-settings']
const NOTIFICATION_CHANNELS_QUERY_KEY = ['notification-channels']
const NOTIFICATION_TYPES_QUERY_KEY = ['notification-types']

export function useNotificationSettings() {
  const queryClient = useQueryClient()

  // Configurações de notificação
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery({
    queryKey: NOTIFICATION_SETTINGS_QUERY_KEY,
    queryFn: notificationService.getSettings,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })

  // Canais disponíveis
  const {
    data: channels,
    isLoading: isLoadingChannels,
    error: channelsError
  } = useQuery({
    queryKey: NOTIFICATION_CHANNELS_QUERY_KEY,
    queryFn: notificationService.getChannels,
    staleTime: 30 * 60 * 1000, // 30 minutos
  })

  // Tipos de notificação
  const {
    data: types,
    isLoading: isLoadingTypes,
    error: typesError
  } = useQuery({
    queryKey: NOTIFICATION_TYPES_QUERY_KEY,
    queryFn: notificationService.getTypes,
    staleTime: 30 * 60 * 1000,
  })

  // Atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: (data: NotificationSettingsUpdate) => notificationService.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_QUERY_KEY, updatedSettings)
      toast.success('Configurações de notificação atualizadas!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar configurações de notificação')
    },
  })

  // Testar canal de notificação
  const testChannelMutation = useMutation({
    mutationFn: ({ channel, message }: { channel: string; message?: string }) => 
      notificationService.testChannel(channel, message),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Teste do canal ${result.channel} enviado com sucesso!`)
      } else {
        toast.error(`Falha no teste do canal ${result.channel}: ${result.error}`)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao testar canal de notificação')
    },
  })

  // Ativar/desativar canal
  const toggleChannelMutation = useMutation({
    mutationFn: ({ channel, enabled }: { channel: string; enabled: boolean }) => 
      notificationService.toggleChannel(channel, enabled),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_QUERY_KEY, updatedSettings)
      toast.success('Canal de notificação atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar canal')
    },
  })

  // Configurar tipo de notificação
  const configureTypeMutation = useMutation({
    mutationFn: ({ type, config }: { type: string; config: any }) => 
      notificationService.configureType(type, config),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_QUERY_KEY, updatedSettings)
      toast.success('Tipo de notificação configurado!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao configurar tipo de notificação')
    },
  })

  // Resetar configurações
  const resetSettingsMutation = useMutation({
    mutationFn: () => notificationService.resetSettings(),
    onSuccess: (defaultSettings) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_QUERY_KEY, defaultSettings)
      toast.success('Configurações de notificação restauradas!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao restaurar configurações')
    },
  })

  // Verificar permissões de notificação
  const checkPermissionsMutation = useMutation({
    mutationFn: () => notificationService.checkPermissions(),
    onSuccess: (permissions) => {
      if (permissions.granted) {
        toast.success('Permissões de notificação concedidas!')
      } else {
        toast.warning('Algumas permissões de notificação não foram concedidas')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao verificar permissões')
    },
  })

  // Solicitar permissões
  const requestPermissionsMutation = useMutation({
    mutationFn: () => notificationService.requestPermissions(),
    onSuccess: (result) => {
      if (result.granted) {
        toast.success('Permissões concedidas com sucesso!')
      } else {
        toast.error('Permissões negadas pelo usuário')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao solicitar permissões')
    },
  })

  // Enviar notificação de teste
  const sendTestNotificationMutation = useMutation({
    mutationFn: ({ type, title, message }: { type: string; title: string; message: string }) => 
      notificationService.sendTestNotification(type, title, message),
    onSuccess: () => {
      toast.success('Notificação de teste enviada!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar notificação de teste')
    },
  })

  return {
    // Data
    settings,
    channels,
    types,
    
    // Loading states
    isLoading: isLoadingSettings || isLoadingChannels || isLoadingTypes,
    isLoadingSettings,
    isLoadingChannels,
    isLoadingTypes,
    
    // Errors
    error: settingsError || channelsError || typesError,
    settingsError,
    channelsError,
    typesError,
    
    // Actions
    updateSettings: updateSettingsMutation.mutate,
    testChannel: testChannelMutation.mutate,
    toggleChannel: toggleChannelMutation.mutate,
    configureType: configureTypeMutation.mutate,
    resetSettings: resetSettingsMutation.mutate,
    checkPermissions: checkPermissionsMutation.mutate,
    requestPermissions: requestPermissionsMutation.mutate,
    sendTestNotification: sendTestNotificationMutation.mutate,
    refetchSettings,
    
    // Mutation states
    isUpdating: updateSettingsMutation.isPending,
    isTesting: testChannelMutation.isPending,
    isToggling: toggleChannelMutation.isPending,
    isConfiguring: configureTypeMutation.isPending,
    isResetting: resetSettingsMutation.isPending,
    isCheckingPermissions: checkPermissionsMutation.isPending,
    isRequestingPermissions: requestPermissionsMutation.isPending,
    isSendingTest: sendTestNotificationMutation.isPending,
    
    // Mutation errors
    updateError: updateSettingsMutation.error,
    testError: testChannelMutation.error,
    toggleError: toggleChannelMutation.error,
    configureError: configureTypeMutation.error,
    resetError: resetSettingsMutation.error,
    permissionsError: checkPermissionsMutation.error,
    requestError: requestPermissionsMutation.error,
    testNotificationError: sendTestNotificationMutation.error,
  }
}

export type UseNotificationSettingsReturn = ReturnType<typeof useNotificationSettings>