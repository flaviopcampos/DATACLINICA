'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  HardDrive, 
  Loader2, 
  Pause, 
  Play, 
  RefreshCw, 
  Server, 
  Shield, 
  Trash2, 
  XCircle,
  Zap,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react'
import { useBackup } from '@/hooks/useBackup'
import type { BackupJob, BackupProgress, BackupHealthStatus } from '@/types/backup'
import { toast } from 'sonner'
import { formatBytes, formatDuration } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BackupStatusProps {
  showDetails?: boolean
  refreshInterval?: number
}

export function BackupStatus({ showDetails = true, refreshInterval = 5000 }: BackupStatusProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  
  const {
    useBackupJobs,
    useBackupProgress,
    useBackupHealth,
    useBackupStats,
    pauseBackupJob,
    resumeBackupJob,
    cancelBackupJob,
    deleteBackupJob
  } = useBackup()
  
  const { data: jobs = [], isLoading: loadingJobs, refetch: refetchJobs } = useBackupJobs()
  const { data: health, isLoading: loadingHealth } = useBackupHealth()
  const { data: stats } = useBackupStats()
  
  // Obter progresso dos jobs ativos
  const activeJobs = jobs.filter(job => 
    job.status === 'running' || job.status === 'paused' || job.status === 'pending'
  )
  
  const { data: progressData } = useBackupProgress(
    activeJobs.map(job => job.id).join(','),
    activeJobs.length > 0
  )
  
  // Auto-refresh
  useEffect(() => {
    if (activeJobs.length > 0) {
      const interval = setInterval(() => {
        refetchJobs()
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [activeJobs.length, refreshInterval, refetchJobs])
  
  const handleJobAction = async (jobId: string, action: 'pause' | 'resume' | 'cancel' | 'delete') => {
    try {
      switch (action) {
        case 'pause':
          await pauseBackupJob.mutateAsync(jobId)
          toast.success('Job pausado com sucesso')
          break
        case 'resume':
          await resumeBackupJob.mutateAsync(jobId)
          toast.success('Job retomado com sucesso')
          break
        case 'cancel':
          await cancelBackupJob.mutateAsync(jobId)
          toast.success('Job cancelado com sucesso')
          break
        case 'delete':
          if (confirm('Tem certeza que deseja excluir este job?')) {
            await deleteBackupJob.mutateAsync(jobId)
            toast.success('Job excluído com sucesso')
          }
          break
      }
    } catch (error: any) {
      toast.error(error.message || `Erro ao ${action} job`)
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'pending':
        return 'bg-gray-500'
      case 'cancelled':
        return 'bg-gray-400'
      default:
        return 'bg-gray-500'
    }
  }
  
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }
  
  if (loadingJobs || loadingHealth) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Status Geral */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status do Sistema de Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)}`} />
                <div>
                  <p className="font-medium">Sistema</p>
                  <p className={`text-sm ${getHealthStatusColor(health.status)}`}>
                    {health.status === 'healthy' ? 'Saudável' :
                     health.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Armazenamento</p>
                  <p className="text-sm text-muted-foreground">
                    {health.storageUsage ? 
                      `${((health.storageUsage.used / health.storageUsage.total) * 100).toFixed(1)}% usado` :
                      'N/A'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Jobs Ativos</p>
                  <p className="text-sm text-muted-foreground">
                    {activeJobs.length} em execução
                  </p>
                </div>
              </div>
            </div>
            
            {health.issues && health.issues.length > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Problemas detectados:</strong>
                  <ul className="mt-2 space-y-1">
                    {health.issues.map((issue, index) => (
                      <li key={index} className="text-sm">• {issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Estatísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total de Backups</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalBackups}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Sucessos (30d)</span>
              </div>
              <p className="text-2xl font-bold">{stats.successfulBackups}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Espaço Usado</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.totalSize ? formatBytes(stats.totalSize) : '0 B'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Taxa de Sucesso</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Jobs Ativos */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Jobs Ativos ({activeJobs.length})
            </CardTitle>
            <CardDescription>
              Backups em execução ou agendados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job) => {
                const progress = progressData?.[job.id]
                
                return (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium">{job.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {job.type === 'full' ? 'Backup Completo' :
                             job.type === 'incremental' ? 'Backup Incremental' :
                             'Backup Diferencial'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {job.status === 'running' ? 'Executando' :
                           job.status === 'paused' ? 'Pausado' :
                           job.status === 'pending' ? 'Pendente' :
                           job.status}
                        </Badge>
                        
                        {job.status === 'running' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJobAction(job.id, 'pause')}
                            disabled={pauseBackupJob.isPending}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {job.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJobAction(job.id, 'resume')}
                            disabled={resumeBackupJob.isPending}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {(job.status === 'running' || job.status === 'paused') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJobAction(job.id, 'cancel')}
                            disabled={cancelBackupJob.isPending}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{progress.percentage}%</span>
                        </div>
                        <Progress value={progress.percentage} className="h-2" />
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          {progress.currentStep && (
                            <div>
                              <span className="font-medium">Etapa:</span>
                              <p>{progress.currentStep}</p>
                            </div>
                          )}
                          
                          {progress.processedSize && progress.totalSize && (
                            <div>
                              <span className="font-medium">Dados:</span>
                              <p>{formatBytes(progress.processedSize)} / {formatBytes(progress.totalSize)}</p>
                            </div>
                          )}
                          
                          {progress.speed && (
                            <div>
                              <span className="font-medium">Velocidade:</span>
                              <p>{formatBytes(progress.speed)}/s</p>
                            </div>
                          )}
                          
                          {progress.estimatedTimeRemaining && (
                            <div>
                              <span className="font-medium">Tempo restante:</span>
                              <p>{formatDuration(progress.estimatedTimeRemaining)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {job.startedAt && (
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Iniciado: {format(new Date(job.startedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                        
                        {job.estimatedDuration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Duração estimada: {formatDuration(job.estimatedDuration)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Jobs Recentes */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Jobs Recentes
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchJobs()}
                disabled={loadingJobs}
              >
                {loadingJobs ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum job de backup encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.slice(0, 10).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h4 className="font-medium">{job.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.createdAt && format(new Date(job.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {job.status === 'completed' ? 'Concluído' :
                         job.status === 'failed' ? 'Falhou' :
                         job.status === 'cancelled' ? 'Cancelado' :
                         job.status}
                      </Badge>
                      
                      {job.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                        >
                          Ver Erro
                        </Button>
                      )}
                      
                      {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJobAction(job.id, 'delete')}
                          disabled={deleteBackupJob.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Detalhes do Job Selecionado */}
      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Erro</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const job = jobs.find(j => j.id === selectedJob)
              return job?.error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <pre className="whitespace-pre-wrap text-sm">{job.error}</pre>
                  </AlertDescription>
                </Alert>
              ) : (
                <p className="text-muted-foreground">Nenhum erro registrado.</p>
              )
            })()
            }
          </CardContent>
        </Card>
      )}
    </div>
  )
}