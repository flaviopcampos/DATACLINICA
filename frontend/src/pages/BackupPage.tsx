'use client'

import { useState } from 'react'
import { 
  Database, 
  Settings, 
  History, 
  RotateCcw, 
  Plus, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  HardDrive, 
  Cloud, 
  Shield,
  Activity,
  TrendingUp,
  Calendar,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import BackupNotificationCenter from '@/components/backup/BackupNotificationCenter'
import BackupDashboard from '@/components/backup/BackupDashboard'
import { BackupScheduler } from '@/components/backup/BackupScheduler'
import { BackupHistory } from '@/components/backup/BackupHistory'
import { RestoreWizard } from '@/components/backup/RestoreWizard'
import { BackupStatus } from '@/components/backup/BackupStatus'
import { BackupSettings } from '@/components/backup/BackupSettings'
import { useBackup } from '@/hooks/useBackup'
import { useRestore } from '@/hooks/useRestore'
import { toast } from 'sonner'
import { formatBytes, formatDate } from '@/lib/utils'
import type { BackupType } from '@/types/backup'

interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline'
}

function QuickActionCard({ title, description, icon, action, disabled, variant = 'default' }: QuickActionCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={disabled ? undefined : action}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${
            variant === 'destructive' ? 'bg-red-100 text-red-600' :
            variant === 'outline' ? 'bg-gray-100 text-gray-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="p-2 bg-blue-100 rounded-full">
              {icon}
            </div>
            {trend && (
              <div className={`flex items-center text-xs ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend.value}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BackupPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showRestoreWizard, setShowRestoreWizard] = useState(false)
  
  const {
    backups,
    backupJobs,
    backupProgress,
    backupHealth,
    storageUsage,
    backupStats,
    isLoading,
    createBackup,
    cancelBackup,
    pauseBackup,
    resumeBackup
  } = useBackup()
  
  const {
    restoreJobs,
    activeRestores
  } = useRestore()

  const handleQuickBackup = async (type: BackupType) => {
    try {
      await createBackup({
        name: `Backup Manual - ${formatDate(new Date())}`,
        type,
        description: 'Backup criado manualmente pelo usuário',
        modules: ['patients', 'appointments', 'billing', 'inventory']
      })
      toast.success('Backup iniciado com sucesso!')
    } catch (error) {
      toast.error('Erro ao iniciar backup')
      console.error('Erro ao criar backup:', error)
    }
  }

  const handlePauseResumeBackup = async (backupId: string, isPaused: boolean) => {
    try {
      if (isPaused) {
        await resumeBackup(backupId)
        toast.success('Backup retomado')
      } else {
        await pauseBackup(backupId)
        toast.success('Backup pausado')
      }
    } catch (error) {
      toast.error('Erro ao alterar status do backup')
    }
  }

  const handleCancelBackup = async (backupId: string) => {
    try {
      await cancelBackup(backupId)
      toast.success('Backup cancelado')
    } catch (error) {
      toast.error('Erro ao cancelar backup')
    }
  }

  // Estatísticas calculadas
  const totalBackups = backups?.length || 0
  const successfulBackups = backups?.filter(b => b.status === 'completed').length || 0
  const failedBackups = backups?.filter(b => b.status === 'failed').length || 0
  const activeBackups = backups?.filter(b => b.status === 'running').length || 0
  const successRate = totalBackups > 0 ? Math.round((successfulBackups / totalBackups) * 100) : 0

  const recentBackups = backups?.slice(0, 5) || []
  const activeJobs = backupJobs?.filter(job => job.enabled) || []
  const nextScheduledJob = activeJobs.find(job => job.next_run)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Backup</h1>
          <p className="text-muted-foreground">
            Gerencie backups e restaurações do DataClínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BackupNotificationCenter />
          <Button
            variant="outline"
            onClick={() => setShowRestoreWizard(true)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button onClick={() => handleQuickBackup('full')}>
            <Plus className="h-4 w-4 mr-2" />
            Backup Manual
          </Button>
        </div>
      </div>

      {/* Status de Saúde */}
      {backupHealth && (
        <Alert className={backupHealth.status === 'healthy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {backupHealth.status === 'healthy' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertTitle>
            Sistema de Backup {backupHealth.status === 'healthy' ? 'Saudável' : 'Com Problemas'}
          </AlertTitle>
          <AlertDescription>
            {backupHealth.message}
            {backupHealth.last_successful_backup && (
              <span className="block mt-1 text-sm">
                Último backup bem-sucedido: {formatDate(new Date(backupHealth.last_successful_backup))}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="scheduler">Agendamentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard de Métricas */}
          <BackupDashboard clinicId={currentUser?.clinicId} className="mb-6" />
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total de Backups"
              value={totalBackups}
              description="Todos os backups criados"
              icon={<Database className="h-4 w-4 text-blue-600" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Taxa de Sucesso"
              value={`${successRate}%`}
              description={`${successfulBackups} de ${totalBackups} bem-sucedidos`}
              icon={<CheckCircle className="h-4 w-4 text-green-600" />}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Backups Ativos"
              value={activeBackups}
              description="Em execução no momento"
              icon={<Activity className="h-4 w-4 text-orange-600" />}
            />
            <StatCard
              title="Espaço Usado"
              value={storageUsage ? formatBytes(storageUsage.used_space) : '0 B'}
              description={storageUsage ? `${Math.round((storageUsage.used_space / storageUsage.total_space) * 100)}% do total` : 'Carregando...'}
              icon={<HardDrive className="h-4 w-4 text-purple-600" />}
            />
          </div>

          {/* Ações Rápidas */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickActionCard
                title="Backup Completo"
                description="Criar backup completo de todos os dados"
                icon={<Database className="h-5 w-5" />}
                action={() => handleQuickBackup('full')}
              />
              <QuickActionCard
                title="Backup Incremental"
                description="Backup apenas das alterações recentes"
                icon={<TrendingUp className="h-5 w-5" />}
                action={() => handleQuickBackup('incremental')}
              />
              <QuickActionCard
                title="Restaurar Dados"
                description="Restaurar dados de um backup anterior"
                icon={<RotateCcw className="h-5 w-5" />}
                action={() => setShowRestoreWizard(true)}
                variant="outline"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backups Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Backups Recentes
                </CardTitle>
                <CardDescription>
                  Últimos 5 backups executados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentBackups.length > 0 ? (
                  <div className="space-y-4">
                    {recentBackups.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            backup.status === 'completed' ? 'bg-green-100 text-green-600' :
                            backup.status === 'failed' ? 'bg-red-100 text-red-600' :
                            backup.status === 'running' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {backup.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                             backup.status === 'failed' ? <AlertTriangle className="h-4 w-4" /> :
                             backup.status === 'running' ? <Activity className="h-4 w-4" /> :
                             <Clock className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{backup.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(new Date(backup.created_at))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={backup.status === 'completed' ? 'default' : 
                                        backup.status === 'failed' ? 'destructive' : 'secondary'}>
                            {backup.status === 'completed' ? 'Concluído' :
                             backup.status === 'failed' ? 'Falhou' :
                             backup.status === 'running' ? 'Executando' : 'Pendente'}
                          </Badge>
                          {backup.status === 'running' && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePauseResumeBackup(backup.id, false)}
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelBackup(backup.id)}
                              >
                                <AlertTriangle className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {backup.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum backup encontrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Próximos Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximos Agendamentos
                </CardTitle>
                <CardDescription>
                  Backups agendados para execução
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeJobs.length > 0 ? (
                  <div className="space-y-4">
                    {activeJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{job.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.schedule.frequency} - {job.schedule.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {job.backup_type === 'full' ? 'Completo' :
                             job.backup_type === 'incremental' ? 'Incremental' : 'Diferencial'}
                          </Badge>
                          {job.next_run && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(new Date(job.next_run))}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum agendamento ativo
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progresso de Backups Ativos */}
          {backupProgress && backupProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Backups em Execução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backupProgress.map((progress) => (
                    <div key={progress.backup_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{progress.backup_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {progress.percentage}% - {progress.current_step}
                        </p>
                      </div>
                      <Progress value={progress.percentage} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Processados: {progress.processed_items}</span>
                        <span>Total: {progress.total_items}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Agendamentos */}
        <TabsContent value="scheduler">
          <BackupScheduler />
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history">
          <BackupHistory />
        </TabsContent>

        {/* Status */}
        <TabsContent value="status">
          <BackupStatus />
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings">
          <BackupSettings />
        </TabsContent>
      </Tabs>

      {/* Wizard de Restauração */}
      {showRestoreWizard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Assistente de Restauração</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowRestoreWizard(false)}
                >
                  Fechar
                </Button>
              </div>
              <RestoreWizard onComplete={() => setShowRestoreWizard(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}