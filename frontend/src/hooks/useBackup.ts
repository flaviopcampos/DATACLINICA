'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { backupService } from '@/services/backupService'
import { useBackupNotifications } from './useBackupNotifications'
import type {
  Backup,
  BackupJob,
  BackupSettings,
  BackupHealthStatus,
  BackupModule,
  CreateBackupRequest,
  CreateBackupJobRequest,
  UpdateBackupSettingsRequest,
  BackupProgress
} from '@/types/backup'

// Hook para gerenciar backups
export function useBackups(params?: {
  page?: number
  limit?: number
  type?: string
  status?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: ['backups', params],
    queryFn: () => backupService.getBackups(params),
    staleTime: 30000, // 30 segundos
  })
}

// Hook para backup específico
export function useBackup(id: string) {
  return useQuery({
    queryKey: ['backup', id],
    queryFn: () => backupService.getBackup(id),
    enabled: !!id,
  })
}

// Hook para progresso de backup
export function useBackupProgress(id: string, enabled = false) {
  return useQuery({
    queryKey: ['backup-progress', id],
    queryFn: () => backupService.getBackupProgress(id),
    enabled: enabled && !!id,
    refetchInterval: 2000, // Atualiza a cada 2 segundos
  })
}

// Hook para jobs de backup
export function useBackupJobs(params?: {
  page?: number
  limit?: number
  enabled?: boolean
  frequency?: string
}) {
  return useQuery({
    queryKey: ['backup-jobs', params],
    queryFn: () => backupService.getBackupJobs(params),
    staleTime: 60000, // 1 minuto
  })
}

// Hook para job específico
export function useBackupJob(id: string) {
  return useQuery({
    queryKey: ['backup-job', id],
    queryFn: () => backupService.getBackupJob(id),
    enabled: !!id,
  })
}

// Hook para configurações de backup
export function useBackupSettings() {
  return useQuery({
    queryKey: ['backup-settings'],
    queryFn: () => backupService.getBackupSettings(),
    staleTime: 300000, // 5 minutos
  })
}

// Hook para saúde do sistema de backup
export function useBackupHealth() {
  return useQuery({
    queryKey: ['backup-health'],
    queryFn: () => backupService.getBackupHealth(),
    refetchInterval: 60000, // Atualiza a cada minuto
  })
}

// Hook para módulos de backup
export function useBackupModules() {
  return useQuery({
    queryKey: ['backup-modules'],
    queryFn: () => backupService.getBackupModules(),
    staleTime: 600000, // 10 minutos
  })
}

// Hook para estatísticas de backup
export function useBackupStatistics(params?: {
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: ['backup-statistics', params],
    queryFn: () => backupService.getBackupStatistics(params),
    staleTime: 300000, // 5 minutos
  })
}

// Hook para uso de armazenamento
export function useStorageUsage() {
  return useQuery({
    queryKey: ['storage-usage'],
    queryFn: () => backupService.getStorageUsage(),
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  })
}

// Hook principal para operações de backup
export function useBackupOperations() {
  const queryClient = useQueryClient()
  const [activeBackups, setActiveBackups] = useState<Set<string>>(new Set())
  const [backupProgress, setBackupProgress] = useState<Record<string, BackupProgress>>({})
  
  // Hook de notificações de backup
  const {
    notifyBackupStarted,
    notifyBackupCompleted,
    notifyBackupFailed
  } = useBackupNotifications({ enableRealTime: true })

  // Mutation para criar backup
  const createBackupMutation = useMutation({
    mutationFn: (data: CreateBackupRequest) => backupService.createBackup(data),
    onSuccess: (backup) => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      queryClient.invalidateQueries({ queryKey: ['backup-health'] })
      setActiveBackups(prev => new Set([...prev, backup.id]))
      
      // Notificar início do backup
      if (backup.id) {
        notifyBackupStarted(backup.id, backup.job_id)
      }
      
      toast.success('Backup iniciado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao iniciar backup')
    },
  })

  // Mutation para deletar backup
  const deleteBackupMutation = useMutation({
    mutationFn: (id: string) => backupService.deleteBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      queryClient.invalidateQueries({ queryKey: ['backup-health'] })
      queryClient.invalidateQueries({ queryKey: ['storage-usage'] })
      toast.success('Backup excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir backup')
    },
  })

  // Mutation para cancelar backup
  const cancelBackupMutation = useMutation({
    mutationFn: (id: string) => backupService.cancelBackup(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['backup', id] })
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      setActiveBackups(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      toast.success('Backup cancelado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar backup')
    },
  })

  // Mutation para verificar backup
  const verifyBackupMutation = useMutation({
    mutationFn: (id: string) => backupService.verifyBackup(id),
    onSuccess: (verification) => {
      if (verification.verified) {
        toast.success('Backup verificado com sucesso!')
      } else {
        toast.error('Falha na verificação do backup')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao verificar backup')
    },
  })

  // Mutation para criar job de backup
  const createBackupJobMutation = useMutation({
    mutationFn: (data: CreateBackupJobRequest) => backupService.scheduleBackup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] })
      toast.success('Job de backup criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar job de backup')
    },
  })

  // Mutation para atualizar job de backup
  const updateBackupJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBackupJobRequest> }) =>
      backupService.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] })
      toast.success('Job de backup atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar job de backup')
    },
  })

  // Mutation para deletar job de backup
  const deleteBackupJobMutation = useMutation({
    mutationFn: (id: string) => backupService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] })
      toast.success('Job de backup excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir job de backup')
    },
  })

  // Mutation para executar job agora
  const runBackupJobMutation = useMutation({
    mutationFn: (id: string) => backupService.runBackupJobNow(id),
    onSuccess: (backup) => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] })
      setActiveBackups(prev => new Set([...prev, backup.id]))
      toast.success('Backup iniciado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao executar backup')
    },
  })

  // Mutation para habilitar/desabilitar job
  const toggleBackupJobMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      enabled ? backupService.enableBackupJob(id) : backupService.disableBackupJob(id),
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] })
      toast.success(`Job ${enabled ? 'habilitado' : 'desabilitado'} com sucesso!`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao alterar status do job')
    },
  })

  // Mutation para atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: (data: UpdateBackupSettingsRequest) => backupService.updateBackupSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] })
      toast.success('Configurações atualizadas com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configurações')
    },
  })

  // Função para download de backup (placeholder)
  const downloadBackup = useCallback(async (id: string, name: string) => {
    toast.info('Funcionalidade de download em desenvolvimento')
  }, [])

  // Função para estimar tamanho do backup (placeholder)
  const estimateBackupSize = useCallback(async (modules: string[], type: string) => {
    return { size: 0, estimatedTime: 0 }
  }, [])

  // Placeholder para subscrições em tempo real (será implementado futuramente)
  useEffect(() => {
    // Implementação de subscrições será adicionada quando disponível no backupService
  }, [queryClient])

  return {
    // Mutations
    createBackup: createBackupMutation.mutate,
    deleteBackup: deleteBackupMutation.mutate,
    cancelBackup: cancelBackupMutation.mutate,
    verifyBackup: verifyBackupMutation.mutate,
    createBackupJob: createBackupJobMutation.mutate,
    updateBackupJob: updateBackupJobMutation.mutate,
    deleteBackupJob: deleteBackupJobMutation.mutate,
    runBackupJob: runBackupJobMutation.mutate,
    toggleBackupJob: toggleBackupJobMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    
    // Utility functions
    downloadBackup,
    estimateBackupSize,
    
    // State
    activeBackups,
    backupProgress,
    
    // Loading states
    isCreatingBackup: createBackupMutation.isPending,
    isDeletingBackup: deleteBackupMutation.isPending,
    isCancellingBackup: cancelBackupMutation.isPending,
    isVerifyingBackup: verifyBackupMutation.isPending,
    isCreatingJob: createBackupJobMutation.isPending,
    isUpdatingJob: updateBackupJobMutation.isPending,
    isDeletingJob: deleteBackupJobMutation.isPending,
    isRunningJob: runBackupJobMutation.isPending,
    isTogglingJob: toggleBackupJobMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
  }
}