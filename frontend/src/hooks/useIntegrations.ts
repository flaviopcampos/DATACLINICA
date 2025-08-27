import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationService } from '@/services/integrationService'
import { Integration, IntegrationConfig, IntegrationStatus, IntegrationStats } from '@/types/integrations'
import { toast } from 'sonner'

const INTEGRATIONS_QUERY_KEY = ['integrations']
const INTEGRATION_STATS_QUERY_KEY = ['integration-stats']
const INTEGRATION_LOGS_QUERY_KEY = ['integration-logs']

export function useIntegrations() {
  const queryClient = useQueryClient()

  // Lista de integrações
  const {
    data: integrations,
    isLoading: isLoadingIntegrations,
    error: integrationsError,
    refetch: refetchIntegrations
  } = useQuery({
    queryKey: INTEGRATIONS_QUERY_KEY,
    queryFn: integrationService.getIntegrations,
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 5 * 60 * 1000, // 5 minutos
  })

  // Estatísticas das integrações
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: INTEGRATION_STATS_QUERY_KEY,
    queryFn: integrationService.getStats,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
  })

  // Criar nova integração
  const createIntegrationMutation = useMutation({
    mutationFn: (data: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => 
      integrationService.createIntegration(data),
    onSuccess: (newIntegration) => {
      queryClient.setQueryData(INTEGRATIONS_QUERY_KEY, (old: Integration[] = []) => [
        ...old,
        newIntegration
      ])
      queryClient.invalidateQueries({ queryKey: INTEGRATION_STATS_QUERY_KEY })
      toast.success('Integração criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar integração')
    },
  })

  // Atualizar integração
  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Integration> }) => 
      integrationService.updateIntegration(id, data),
    onSuccess: (updatedIntegration) => {
      queryClient.setQueryData(INTEGRATIONS_QUERY_KEY, (old: Integration[] = []) =>
        old.map(integration => 
          integration.id === updatedIntegration.id ? updatedIntegration : integration
        )
      )
      toast.success('Integração atualizada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar integração')
    },
  })

  // Deletar integração
  const deleteIntegrationMutation = useMutation({
    mutationFn: (id: string) => integrationService.deleteIntegration(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(INTEGRATIONS_QUERY_KEY, (old: Integration[] = []) =>
        old.filter(integration => integration.id !== deletedId)
      )
      queryClient.invalidateQueries({ queryKey: INTEGRATION_STATS_QUERY_KEY })
      toast.success('Integração removida com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover integração')
    },
  })

  // Testar integração
  const testIntegrationMutation = useMutation({
    mutationFn: (id: string) => integrationService.testIntegration(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Teste da integração ${result.name} realizado com sucesso!`)
      } else {
        toast.error(`Falha no teste da integração ${result.name}: ${result.error}`)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao testar integração')
    },
  })

  // Ativar/desativar integração
  const toggleIntegrationMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => 
      integrationService.toggleIntegration(id, enabled),
    onSuccess: (updatedIntegration) => {
      queryClient.setQueryData(INTEGRATIONS_QUERY_KEY, (old: Integration[] = []) =>
        old.map(integration => 
          integration.id === updatedIntegration.id ? updatedIntegration : integration
        )
      )
      queryClient.invalidateQueries({ queryKey: INTEGRATION_STATS_QUERY_KEY })
      const action = updatedIntegration.enabled ? 'ativada' : 'desativada'
      toast.success(`Integração ${action} com sucesso!`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao alterar status da integração')
    },
  })

  // Sincronizar integração
  const syncIntegrationMutation = useMutation({
    mutationFn: (id: string) => integrationService.syncIntegration(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INTEGRATION_STATS_QUERY_KEY })
      toast.success(`Sincronização da integração ${result.name} iniciada!`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao sincronizar integração')
    },
  })

  // Sincronizar todas as integrações
  const syncAllIntegrationsMutation = useMutation({
    mutationFn: () => integrationService.syncAllIntegrations(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INTEGRATION_STATS_QUERY_KEY })
      toast.success(`Sincronização de ${result.count} integrações iniciada!`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao sincronizar integrações')
    },
  })

  // Configurar integração
  const configureIntegrationMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: IntegrationConfig }) => 
      integrationService.configureIntegration(id, config),
    onSuccess: (updatedIntegration) => {
      queryClient.setQueryData(INTEGRATIONS_QUERY_KEY, (old: Integration[] = []) =>
        old.map(integration => 
          integration.id === updatedIntegration.id ? updatedIntegration : integration
        )
      )
      toast.success('Configuração da integração salva!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao configurar integração')
    },
  })

  // Obter logs de integração
  const getIntegrationLogs = (id: string, options?: { limit?: number; offset?: number }) => {
    return useQuery({
      queryKey: [...INTEGRATION_LOGS_QUERY_KEY, id, options],
      queryFn: () => integrationService.getIntegrationLogs(id, options),
      enabled: !!id,
      staleTime: 30 * 1000, // 30 segundos
    })
  }

  // Validar configuração
  const validateConfigMutation = useMutation({
    mutationFn: ({ type, config }: { type: string; config: IntegrationConfig }) => 
      integrationService.validateConfig(type, config),
    onError: (error: any) => {
      toast.error(error.message || 'Configuração inválida')
    },
  })

  return {
    // Data
    integrations,
    stats,
    
    // Loading states
    isLoading: isLoadingIntegrations || isLoadingStats,
    isLoadingIntegrations,
    isLoadingStats,
    
    // Errors
    error: integrationsError || statsError,
    integrationsError,
    statsError,
    
    // Actions
    createIntegration: createIntegrationMutation.mutate,
    updateIntegration: updateIntegrationMutation.mutate,
    deleteIntegration: deleteIntegrationMutation.mutate,
    testIntegration: testIntegrationMutation.mutate,
    toggleIntegration: toggleIntegrationMutation.mutate,
    syncIntegration: syncIntegrationMutation.mutate,
    syncAllIntegrations: syncAllIntegrationsMutation.mutate,
    configureIntegration: configureIntegrationMutation.mutate,
    validateConfig: validateConfigMutation.mutate,
    refetchIntegrations,
    refetchStats,
    getIntegrationLogs,
    
    // Mutation states
    isCreating: createIntegrationMutation.isPending,
    isUpdating: updateIntegrationMutation.isPending,
    isDeleting: deleteIntegrationMutation.isPending,
    isTesting: testIntegrationMutation.isPending,
    isToggling: toggleIntegrationMutation.isPending,
    isSyncing: syncIntegrationMutation.isPending,
    isSyncingAll: syncAllIntegrationsMutation.isPending,
    isConfiguring: configureIntegrationMutation.isPending,
    isValidating: validateConfigMutation.isPending,
    
    // Mutation errors
    createError: createIntegrationMutation.error,
    updateError: updateIntegrationMutation.error,
    deleteError: deleteIntegrationMutation.error,
    testError: testIntegrationMutation.error,
    toggleError: toggleIntegrationMutation.error,
    syncError: syncIntegrationMutation.error,
    syncAllError: syncAllIntegrationsMutation.error,
    configureError: configureIntegrationMutation.error,
    validateError: validateConfigMutation.error,
  }
}

export type UseIntegrationsReturn = ReturnType<typeof useIntegrations>