import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Database,
  HardDrive,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Download,
  Upload,
  Shield,
  Zap
} from 'lucide-react';
import { useBackup } from '../../hooks/useBackup';
import { useBackupNotifications } from '../../hooks/useBackupNotifications';
import { formatBytes, formatDuration } from '../../utils/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BackupDashboardProps {
  clinicId?: string;
  className?: string;
}

function BackupDashboard({ clinicId, className }: BackupDashboardProps) {
  const {
    backups,
    backupJobs,
    backupStats,
    isLoading: isLoadingBackup
  } = useBackup({ clinicId });

  const {
    stats: notificationStats,
    isLoading: isLoadingNotifications
  } = useBackupNotifications();

  const isLoading = isLoadingBackup || isLoadingNotifications;

  // Calcular métricas do dashboard
  const totalBackups = backups?.length || 0;
  const successfulBackups = backups?.filter(b => b.status === 'completed').length || 0;
  const failedBackups = backups?.filter(b => b.status === 'failed').length || 0;
  const runningBackups = backups?.filter(b => b.status === 'running').length || 0;
  const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;

  // Último backup
  const lastBackup = backups?.[0];
  const lastSuccessfulBackup = backups?.find(b => b.status === 'completed');

  // Próximo backup agendado
  const nextScheduledBackup = backupJobs?.find(job => 
    job.status === 'active' && job.next_run
  );

  // Tamanho total dos backups
  const totalBackupSize = backups?.reduce((total, backup) => 
    total + (backup.size_bytes || 0), 0
  ) || 0;

  // Espaço de armazenamento usado
  const storageUsed = backupStats?.storage_used || 0;
  const storageLimit = backupStats?.storage_limit || 0;
  const storageUsagePercent = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Backups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBackups}</div>
            <p className="text-xs text-muted-foreground">
              {successfulBackups} bem-sucedidos
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Sucesso */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Armazenamento Usado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(storageUsed)}</div>
            <p className="text-xs text-muted-foreground">
              {storageLimit > 0 && `de ${formatBytes(storageLimit)}`}
            </p>
            {storageLimit > 0 && (
              <Progress value={storageUsagePercent} className="mt-2" />
            )}
          </CardContent>
        </Card>

        {/* Status Atual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Atual</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {runningBackups > 0 ? (
                <>
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">
                    {runningBackups} em execução
                  </span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    Sistema ativo
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Último Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Último Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastBackup ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={
                    lastBackup.status === 'completed' ? 'default' :
                    lastBackup.status === 'failed' ? 'destructive' :
                    lastBackup.status === 'running' ? 'secondary' : 'outline'
                  }>
                    {lastBackup.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {lastBackup.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                    {lastBackup.status === 'running' && <Activity className="h-3 w-3 mr-1" />}
                    {lastBackup.status === 'completed' ? 'Concluído' :
                     lastBackup.status === 'failed' ? 'Falhou' :
                     lastBackup.status === 'running' ? 'Em execução' : lastBackup.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(lastBackup.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
                
                {lastBackup.size_bytes && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tamanho:</span>
                    <span className="text-sm font-medium">
                      {formatBytes(lastBackup.size_bytes)}
                    </span>
                  </div>
                )}
                
                {lastBackup.duration_seconds && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duração:</span>
                    <span className="text-sm font-medium">
                      {formatDuration(lastBackup.duration_seconds)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum backup encontrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Próximo Backup Agendado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximo Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextScheduledBackup ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Agendado para:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(nextScheduledBackup.next_run!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">
                    {nextScheduledBackup.backup_type === 'full' ? 'Completo' :
                     nextScheduledBackup.backup_type === 'incremental' ? 'Incremental' :
                     nextScheduledBackup.backup_type === 'differential' ? 'Diferencial' :
                     nextScheduledBackup.backup_type}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Frequência:</span>
                  <span className="text-sm font-medium">
                    {nextScheduledBackup.schedule_type === 'daily' ? 'Diário' :
                     nextScheduledBackup.schedule_type === 'weekly' ? 'Semanal' :
                     nextScheduledBackup.schedule_type === 'monthly' ? 'Mensal' :
                     nextScheduledBackup.schedule_type}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum backup agendado. Configure um agendamento automático.
                  </AlertDescription>
                </Alert>
                <Button variant="outline" size="sm" className="w-full">
                  Configurar Agendamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Notificações */}
      {notificationStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notificações de Backup</CardTitle>
            <CardDescription>
              Estatísticas das notificações do sistema de backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-sm font-medium">
                    {notificationStats.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Não lidas:</span>
                  <span className="text-sm font-medium">
                    {notificationStats.unread}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Backup:</span>
                  <span className="text-sm font-medium">
                    {notificationStats.backup_notifications}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Restauração:</span>
                  <span className="text-sm font-medium">
                    {notificationStats.restore_notifications}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Críticas:</span>
                  <span className="text-sm font-medium text-red-600">
                    {notificationStats.critical_notifications}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hoje:</span>
                  <span className="text-sm font-medium">
                    {notificationStats.today_notifications}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas de Sistema */}
      <div className="space-y-4">
        {/* Alerta de Armazenamento */}
        {storageUsagePercent > 80 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Armazenamento quase cheio ({storageUsagePercent.toFixed(1)}%). 
              Considere limpar backups antigos ou aumentar o limite de armazenamento.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Alerta de Backup Falhando */}
        {failedBackups > 0 && failedBackups / totalBackups > 0.2 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Alta taxa de falhas nos backups ({((failedBackups / totalBackups) * 100).toFixed(1)}%). 
              Verifique as configurações e logs do sistema.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Alerta de Backup Desatualizado */}
        {lastSuccessfulBackup && 
         new Date().getTime() - new Date(lastSuccessfulBackup.created_at).getTime() > 7 * 24 * 60 * 60 * 1000 && (
          <Alert variant="destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Último backup bem-sucedido há mais de 7 dias. 
              Execute um backup manual ou verifique os agendamentos.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default BackupDashboard;