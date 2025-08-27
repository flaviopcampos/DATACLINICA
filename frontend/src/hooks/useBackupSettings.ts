import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backupService } from '@/services/backupService'
import { BackupSettings, BackupSettingsUpdate, BackupJob, BackupHistory, BackupStats } from '@/types/backup'
import { toast } from 'sonner'

const BACKUP_SETTINGS_QUERY_KEY = ['backup-settings']
const BACKUP_JOBS_QUERY_KEY = ['backup-jobs']
const BACKUP_HISTORY_QUERY_KEY = ['backup-history']
const BACKUP_STATS_QUERY_KEY = ['backup-stats']

export function useBackupSettings() {
  const queryClient = useQueryClient()

  // Configurações de backup
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery({
    queryKey: BACKUP_SETTINGS_QUERY_KEY,
    queryFn: backupService.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })

  // Jobs de backup ativos
  const {
    data: activeJobs,
    isLoading: isLoadingJobs,
    error: jobsError,
    refetch: refetchJobs
  } = useQuery({
    queryKey: BACKUP_JOBS_QUERY_KEY,
    queryFn: backupService.getActiveJobs,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 10 * 1000, // Atualiza a cada 10 segundos
  })

  // Histórico de backups
  const {
    data: history,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: BACKUP_HISTORY_QUERY_KEY,
    queryFn: () => backupService.getHistory({ limit: 50 }),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Estatísticas de backup
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: BACKUP_STATS_QUERY_KEY,
    queryFn: backupService.getStats,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Atualiza a cada minuto
  })

  // Atualizar configurações de backup
  const updateSettingsMutation = useMutation({
    mutationFn: (data: BackupSettingsUpdate) => backupService.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(BACKUP_SETTINGS_QUERY_KEY, updatedSettings)
      toast.success('Configurações de backup atualizadas!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar configurações de backup')
    },
  })

  // Iniciar backup manual
  const startBackupMutation = useMutation({
    mutationFn: (options?: { type?: string; description?: string }) => 
      backupService.startBackup(options),
    onSuccess: (job) => {
      queryClient.setQueryData(BACKUP_JOBS_QUERY_KEY, (old: BackupJob[] = []) => [
        job,
        ...old
      ])
      queryClient.invalidateQueries({ queryKey: BACKUP_STATS_QUERY_KEY })
      toast.success('Backup iniciado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao iniciar backup')
    },
  })

  // Cancelar backup
  const cancelBackupMutation = useMutation({
    mutationFn: (jobId: string) => backupService.cancelBackup(jobId),
    onSuccess: (_, jobId) => {
      queryClient.setQueryData(BACKUP_JOBS_QUERY_KEY, (old: BackupJob[] = []) =>
        old.map(job => 
          job.id === jobId ? { ...job, status: 'cancelled' } : job
        )
      )
      toast.success('Backup cancelado!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar backup')
    },
  })

  // Testar conexão de armazenamento
  const testStorageMutation = useMutation({
    mutationFn: (storageConfig: any) => backupService.testStorage(storageConfig),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Conexão com armazenamento testada com sucesso!')
      } else {
        toast.error(`Falha na conexão: ${result.error}`)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao testar armazenamento')
    },
  })

  // Restaurar backup
  const restoreBackupMutation = useMutation({
    mutationFn: ({ backupId, options }: { backupId: string; options?: any }) => 
      backupService.restoreBackup(backupId, options),
    onSuccess: (job) => {
      queryClient.setQueryData(BACKUP_JOBS_QUERY_KEY, (old: BackupJob[] = []) => [
        job,
        ...old
      ])
      toast.success('Restauração iniciada!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao iniciar restauração')
    },
  })

  // Deletar backup
  const deleteBackupMutation = useMutation({
    mutationFn: (backupId: string) => backupService.deleteBackup(backupId),
    onSuccess: (_, backupId) => {
      queryClient.setQueryData(BACKUP_HISTORY_QUERY_KEY, (old: BackupHistory[] = []) =>
        old.filter(backup => backup.id !== backupId)
      )
      queryClient.invalidateQueries({ queryKey: BACKUP_STATS_QUERY_KEY })
      toast.success('Backup removido!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover backup')
    },
  })

  // Verificar integridade do backup
  const verifyBackupMutation = useMutation({
    mutationFn: (backupId: string) => backupService.verifyBackup(backupId),
    onSuccess: (result) => {
      if (result.valid) {
        toast.success('Backup verificado com sucesso!')
      } else {
        toast.error(`Backup corrompido: ${result.errors?.join(', ')}`)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao verificar backup')
    },
  })

  // Configurar retenção automática
  const configureRetentionMutation = useMutation({
    mutationFn: (policy: any) => backupService.configureRetention(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKUP_SETTINGS_QUERY_KEY })
      toast.success('Política de retenção configurada!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao configurar retenção')
    },
  })

  // Executar limpeza de backups antigos
  const cleanupOldBackupsMutation = useMutation({
    mutationFn: () => backupService.cleanupOldBackups(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: BACKUP_HISTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: BACKUP_STATS_QUERY_KEY })
      toast.success(`${result.deletedCount} backups antigos removidos!`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro na limpeza de backups')
    },
  })

  // Exportar configurações de backup
  const exportConfigMutation = useMutation({
    mutationFn: () => backupService.exportConfig(),
    onSuccess: (configData) => {
      const blob = new Blob([JSON.stringify(configData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `config-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Configurações de backup exportadas!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao exportar configurações')
    },
  })

  // Importar configurações de backup
  const importConfigMutation = useMutation({
    mutationFn: (file: File) => {
      return new Promise<BackupSettingsUpdate>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const configData = JSON.parse(e.target?.result as string)
            resolve(configData)
          } catch (error) {
            reject(new Error('Arquivo de configuração inválido'))
          }
        }
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
        reader.readAsText(file)
      }).then(data => backupService.importConfig(data))
    },
    onSuccess: (importedConfig) => {
      queryClient.setQueryData(BACKUP_SETTINGS_QUERY_KEY, importedConfig)
      toast.success('Configurações de backup importadas!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao importar configurações')
    },
  })

  // Agendar backup
  const scheduleBackupMutation = useMutation({
    mutationFn: (schedule: any) => backupService.scheduleBackup(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKUP_SETTINGS_QUERY_KEY })
      toast.success('Backup agendado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao agendar backup')
    },
  })

  return {
    // Data
    settings,
    activeJobs,
    history,
    stats,
    
    // Loading states
    isLoading: isLoadingSettings || isLoadingJobs || isLoadingHistory || isLoadingStats,
    isLoadingSettings,
    isLoadingJobs,
    isLoadingHistory,
    isLoadingStats,
    
    // Errors
    error: settingsError || jobsError || historyError || statsError,
    settingsError,
    jobsError,
    historyError,
    statsError,
    
    // Actions
    updateSettings: updateSettingsMutation.mutate,
    startBackup: startBackupMutation.mutate,
    cancelBackup: cancelBackupMutation.mutate,
    testStorage: testStorageMutation.mutate,
    restoreBackup: restoreBackupMutation.mutate,
    deleteBackup: deleteBackupMutation.mutate,
    verifyBackup: verifyBackupMutation.mutate,
    configureRetention: configureRetentionMutation.mutate,
    cleanupOldBackups: cleanupOldBackupsMutation.mutate,
    exportConfig: exportConfigMutation.mutate,
    importConfig: importConfigMutation.mutate,
    scheduleBackup: scheduleBackupMutation.mutate,
    refetchSettings,
    refetchJobs,
    refetchHistory,
    refetchStats,
    
    // Mutation states
    isUpdating: updateSettingsMutation.isPending,
    isStarting: startBackupMutation.isPending,
    isCancelling: cancelBackupMutation.isPending,
    isTesting: testStorageMutation.isPending,
    isRestoring: restoreBackupMutation.isPending,
    isDeleting: deleteBackupMutation.isPending,
    isVerifying: verifyBackupMutation.isPending,
    isConfiguringRetention: configureRetentionMutation.isPending,
    isCleaning: cleanupOldBackupsMutation.isPending,
    isExporting: exportConfigMutation.isPending,
    isImporting: importConfigMutation.isPending,
    isScheduling: scheduleBackupMutation.isPending,
    
    // Mutation errors
    updateError: updateSettingsMutation.error,
    startError: startBackupMutation.error,
    cancelError: cancelBackupMutation.error,
    testError: testStorageMutation.error,
    restoreError: restoreBackupMutation.error,
    deleteError: deleteBackupMutation.error,
    verifyError: verifyBackupMutation.error,
    retentionError: configureRetentionMutation.error,
    cleanupError: cleanupOldBackupsMutation.error,
    exportError: exportConfigMutation.error,
    importError: importConfigMutation.error,
    scheduleError: scheduleBackupMutation.error,
    
    // Mutation results
    testResult: testStorageMutation.data,
    verifyResult: verifyBackupMutation.data,
  }
}

export type UseBackupSettingsReturn = ReturnType<typeof useBackupSettings>