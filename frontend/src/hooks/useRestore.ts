import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { backupService } from '@/services/backupService'
import type {
  RestoreJob,
  RestoreProgress,
  RestoreScope,
  CreateRestoreRequest,
  RestorePreviewResponse
} from '@/types/backup'
import { toast } from 'sonner'
import { useCallback, useEffect } from 'react'

// Hook para listar jobs de restauração
export function useRestoreJobs() {
  return useQuery({
    queryKey: ['restore-jobs'],
    queryFn: () => backupService.getRestoreJobs(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })
}

// Hook para obter job de restauração específico
export function useRestoreJob(jobId: string) {
  return useQuery({
    queryKey: ['restore-job', jobId],
    queryFn: () => backupService.getRestoreJob(jobId),
    enabled: !!jobId,
    refetchInterval: 5000, // Atualiza a cada 5 segundos durante restauração
  })
}

// Hook para progresso de restauração
export function useRestoreProgress(jobId: string) {
  return useQuery({
    queryKey: ['restore-progress', jobId],
    queryFn: () => backupService.getRestoreProgress(jobId),
    enabled: !!jobId,
    refetchInterval: 2000, // Atualiza a cada 2 segundos
  })
}

// Hook para preview de restauração
export function useRestorePreview(backupId: string, scope?: RestoreScope) {
  return useQuery({
    queryKey: ['restore-preview', backupId, scope],
    queryFn: () => backupService.getRestorePreview(backupId, scope),
    enabled: !!backupId,
  })
}

// Hook para criar job de restauração
export function useCreateRestore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRestoreRequest) => 
      backupService.createRestoreJob(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['restore-jobs'] })
      toast.success('Restauração iniciada com sucesso')
      return data
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao iniciar restauração')
      throw error
    },
  })
}

// Hook para cancelar restauração
export function useCancelRestore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => backupService.cancelRestore(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['restore-job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['restore-jobs'] })
      toast.success('Restauração cancelada')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar restauração')
    },
  })
}

// Hook para monitoramento em tempo real de restauração
export function useRestoreMonitor(jobId: string) {
  const queryClient = useQueryClient()

  const subscribeToProgress = useCallback(() => {
    if (!jobId) return

    const unsubscribe = backupService.subscribeToRestoreProgress(
      jobId,
      (progress: RestoreProgress) => {
        queryClient.setQueryData(['restore-progress', jobId], progress)
        
        // Notificar sobre mudanças importantes
        if (progress.status === 'completed') {
          toast.success('Restauração concluída com sucesso')
          queryClient.invalidateQueries({ queryKey: ['restore-jobs'] })
        } else if (progress.status === 'failed') {
          toast.error(`Restauração falhou: ${progress.error}`)
        } else if (progress.status === 'cancelled') {
          toast.info('Restauração cancelada')
        }
      }
    )

    return unsubscribe
  }, [jobId, queryClient])

  useEffect(() => {
    const unsubscribe = subscribeToProgress()
    return unsubscribe
  }, [subscribeToProgress])

  return {
    subscribeToProgress,
  }
}

// Hook combinado para operações de restauração
export function useRestore() {
  const createRestore = useCreateRestore()
  const cancelRestore = useCancelRestore()

  return {
    // Queries
    useRestoreJobs,
    useRestoreJob,
    useRestoreProgress,
    useRestorePreview,
    useRestoreMonitor,
    
    // Mutations
    createRestore,
    cancelRestore,
    
    // Estados
    isCreating: createRestore.isPending,
    isCancelling: cancelRestore.isPending,
    
    // Métodos
    create: createRestore.mutateAsync,
    cancel: cancelRestore.mutateAsync,
  }
}

// Hook para validação de restauração
export function useRestoreValidation() {
  const validateRestoreData = useCallback(async (
    backupId: string,
    scope?: RestoreScope
  ) => {
    try {
      const preview = await backupService.getRestorePreview(backupId, scope)
      
      const warnings = []
      
      // Verificar se há dados que serão sobrescritos
      if (preview.conflictingData && preview.conflictingData.length > 0) {
        warnings.push(`${preview.conflictingData.length} registros serão sobrescritos`)
      }
      
      // Verificar tamanho dos dados
      if (preview.estimatedSize > 1024 * 1024 * 1024) { // > 1GB
        warnings.push('Restauração de grande volume de dados (>1GB)')
      }
      
      // Verificar dependências
      if (preview.missingDependencies && preview.missingDependencies.length > 0) {
        warnings.push(`${preview.missingDependencies.length} dependências ausentes`)
      }
      
      return {
        isValid: true,
        warnings,
        preview,
      }
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message,
        warnings: [],
      }
    }
  }, [])

  return {
    validateRestoreData,
  }
}

// Hook para histórico de restaurações
export function useRestoreHistory() {
  return useQuery({
    queryKey: ['restore-history'],
    queryFn: () => backupService.getRestoreJobs(),
    select: (data) => {
      // Filtrar apenas restaurações concluídas e ordenar por data
      return data
        .filter(job => ['completed', 'failed', 'cancelled'].includes(job.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
  })
}

// Hook para estatísticas de restauração
export function useRestoreStats() {
  return useQuery({
    queryKey: ['restore-stats'],
    queryFn: async () => {
      const jobs = await backupService.getRestoreJobs()
      
      const stats = {
        total: jobs.length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
        inProgress: jobs.filter(j => j.status === 'in_progress').length,
        cancelled: jobs.filter(j => j.status === 'cancelled').length,
        averageDuration: 0,
        successRate: 0,
      }
      
      const completedJobs = jobs.filter(j => j.status === 'completed' && j.duration)
      if (completedJobs.length > 0) {
        stats.averageDuration = completedJobs.reduce((sum, job) => 
          sum + (job.duration || 0), 0) / completedJobs.length
      }
      
      if (stats.total > 0) {
        stats.successRate = (stats.completed / stats.total) * 100
      }
      
      return stats
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  })
}