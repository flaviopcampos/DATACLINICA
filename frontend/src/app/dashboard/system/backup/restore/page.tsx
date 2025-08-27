'use client'

import { RestoreWizard } from '@/components/backup/RestoreWizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Database,
  Shield,
  Info,
  Activity
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useBackup, useRestore } from '@/hooks/useBackup'
import { formatBytes, formatDistanceToNow } from '@/lib/utils'

export default function BackupRestorePage() {
  const router = useRouter()
  
  const {
    useBackups
  } = useBackup()
  
  const {
    useRestoreJobs,
    useRestoreStats
  } = useRestore()
  
  const { data: backups } = useBackups()
  const { data: restoreJobs } = useRestoreJobs()
  const { data: restoreStats } = useRestoreStats()
  
  const availableBackups = backups?.filter(b => b.status === 'completed') || []
  const activeRestores = restoreJobs?.filter(j => j.status === 'running') || []
  const recentRestores = restoreJobs?.slice(0, 3) || []
  
  const successfulRestores = restoreJobs?.filter(j => j.status === 'completed').length || 0
  const failedRestores = restoreJobs?.filter(j => j.status === 'failed').length || 0
  const totalRestores = restoreJobs?.length || 0
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restauração de Backup</h1>
          <p className="text-muted-foreground">
            Restaure dados a partir de backups disponíveis no sistema
          </p>
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups Disponíveis</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableBackups.length}</div>
            <p className="text-xs text-muted-foreground">
              {availableBackups.length > 0 && (
                <>Mais recente: {formatDistanceToNow(new Date(availableBackups[0]?.createdAt))}</>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurações Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeRestores.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeRestores.length > 0 ? 'Em andamento' : 'Nenhuma ativa'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRestores ? Math.round((successfulRestores / totalRestores) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {successfulRestores} sucessos, {failedRestores} falhas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Restauração</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentRestores.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {formatDistanceToNow(new Date(recentRestores[0].createdAt))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={
                      recentRestores[0].status === 'completed' ? 'default' :
                      recentRestores[0].status === 'failed' ? 'destructive' :
                      recentRestores[0].status === 'running' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {recentRestores[0].status === 'completed' ? 'Sucesso' :
                     recentRestores[0].status === 'failed' ? 'Falha' :
                     recentRestores[0].status === 'running' ? 'Em andamento' :
                     recentRestores[0].status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">-</div>
                <p className="text-xs text-muted-foreground">Nenhuma restauração</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Active Restores */}
      {activeRestores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Restaurações em Andamento
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso das restaurações ativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeRestores.map((restore) => (
                <div key={restore.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      <div>
                        <h4 className="font-medium">{restore.backupName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Iniciado {formatDistanceToNow(new Date(restore.createdAt))}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant="secondary">
                      {restore.progress?.percentage || 0}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${restore.progress?.percentage || 0}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{restore.progress?.currentStep || 'Preparando...'}</span>
                      <span>
                        {restore.progress?.processedSize && restore.progress?.totalSize && (
                          `${formatBytes(restore.progress.processedSize)} / ${formatBytes(restore.progress.totalSize)}`
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span>Escopo: {restore.scope === 'full' ? 'Completo' : 'Parcial'}</span>
                      {restore.encrypted && (
                        <Shield className="h-4 w-4 text-green-600" title="Backup criptografado" />
                      )}
                    </div>
                    
                    <Button size="sm" variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Restores */}
      {recentRestores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Restaurações Recentes
            </CardTitle>
            <CardDescription>
              Histórico das últimas restaurações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRestores.map((restore) => (
                <div key={restore.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {restore.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : restore.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : restore.status === 'running' ? (
                        <RotateCcw className="h-4 w-4 animate-spin text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-600" />
                      )}
                      <span className="font-medium">{restore.backupName}</span>
                    </div>
                    
                    <Badge 
                      variant={
                        restore.status === 'completed' ? 'default' :
                        restore.status === 'failed' ? 'destructive' :
                        restore.status === 'running' ? 'secondary' : 'outline'
                      }
                    >
                      {restore.status === 'completed' ? 'Sucesso' :
                       restore.status === 'failed' ? 'Falha' :
                       restore.status === 'running' ? 'Em andamento' :
                       restore.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Escopo: {restore.scope === 'full' ? 'Completo' : 'Parcial'}</span>
                    <span>{formatDistanceToNow(new Date(restore.createdAt))}</span>
                    
                    {restore.encrypted && (
                      <Shield className="h-4 w-4 text-green-600" title="Backup criptografado" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Important Alerts */}
      <div className="space-y-4">
        {availableBackups.length === 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nenhum backup disponível:</strong> Não há backups completos disponíveis 
              para restauração. Execute um backup completo antes de tentar restaurar dados.
            </AlertDescription>
          </Alert>
        )}
        
        {activeRestores.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Restauração em andamento:</strong> Existe {activeRestores.length} 
              restauração{activeRestores.length > 1 ? 'ões' : ''} em andamento. 
              Evite executar operações que possam interferir no processo.
            </AlertDescription>
          </Alert>
        )}
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> A restauração de dados pode sobrescrever informações 
            existentes. Certifique-se de fazer um backup atual antes de prosseguir com a restauração.
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Main Restore Wizard */}
      <RestoreWizard />
      
      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações sobre Restauração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Tipos de Restauração</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Completa:</strong> Restaura todos os dados do backup</li>
                <li>• <strong>Parcial:</strong> Restaura apenas módulos específicos</li>
                <li>• <strong>Seletiva:</strong> Restaura registros específicos</li>
                <li>• <strong>Preview:</strong> Visualiza dados antes da restauração</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Precauções</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Faça backup atual antes de restaurar</li>
                <li>• Verifique a integridade do backup</li>
                <li>• Teste em ambiente de desenvolvimento primeiro</li>
                <li>• Monitore o processo até a conclusão</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Segurança</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Backups criptografados requerem chave de descriptografia</li>
                <li>• Logs de auditoria registram todas as restaurações</li>
                <li>• Permissões são verificadas antes da restauração</li>
                <li>• Dados sensíveis são tratados com cuidado especial</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Performance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Restaurações podem impactar a performance do sistema</li>
                <li>• Programe para horários de menor uso</li>
                <li>• Monitore recursos durante o processo</li>
                <li>• Cancele se necessário para evitar problemas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}