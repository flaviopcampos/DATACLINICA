'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  Shield, 
  Clock, 
  Activity, 
  Settings, 
  History, 
  Download, 
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  HardDrive,
  Cloud,
  Zap
} from 'lucide-react'
import { BackupScheduler } from '@/components/backup/BackupScheduler'
import { BackupHistory } from '@/components/backup/BackupHistory'
import { RestoreWizard } from '@/components/backup/RestoreWizard'
import { BackupStatus } from '@/components/backup/BackupStatus'
import { BackupSettings } from '@/components/backup/BackupSettings'
import { useBackup } from '@/hooks/useBackup'
import { formatBytes, formatDistanceToNow } from '@/lib/utils'

export default function BackupPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showRestoreWizard, setShowRestoreWizard] = useState(false)
  
  const {
    useBackupHealth,
    useStorageUsage,
    useBackupStats,
    useRecentBackups
  } = useBackup()
  
  const { data: health } = useBackupHealth()
  const { data: storageUsage } = useStorageUsage()
  const { data: stats } = useBackupStats()
  const { data: recentBackups } = useRecentBackups(5)
  
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Backup</h1>
          <p className="text-muted-foreground">
            Gerencie backups, restaurações e configurações do sistema
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRestoreWizard(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          
          <Button onClick={() => setActiveTab('scheduler')}>
            <Upload className="h-4 w-4 mr-2" />
            Novo Backup
          </Button>
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            {health && getHealthStatusIcon(health.overallStatus)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getHealthStatusColor(health?.overallStatus || 'unknown')}`} />
              <span className="text-2xl font-bold capitalize">
                {health?.overallStatus === 'healthy' ? 'Saudável' :
                 health?.overallStatus === 'warning' ? 'Atenção' :
                 health?.overallStatus === 'critical' ? 'Crítico' : 'Desconhecido'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Última verificação: {health?.lastCheck ? formatDistanceToNow(new Date(health.lastCheck)) : 'Nunca'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups Totais</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBackups || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.successfulBackups || 0} bem-sucedidos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso de Armazenamento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageUsage ? formatBytes(storageUsage.totalUsed) : '0 B'}
            </div>
            <p className="text-xs text-muted-foreground">
              {storageUsage ? `${Math.round((storageUsage.totalUsed / storageUsage.totalCapacity) * 100)}% usado` : '0% usado'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentBackups && recentBackups.length > 0 
                ? formatDistanceToNow(new Date(recentBackups[0].createdAt))
                : 'Nunca'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {recentBackups && recentBackups.length > 0 
                ? `Status: ${recentBackups[0].status === 'completed' ? 'Concluído' : 
                           recentBackups[0].status === 'failed' ? 'Falhou' : 'Em andamento'}`
                : 'Nenhum backup realizado'
              }
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Health Alerts */}
      {health && health.issues && health.issues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Problemas detectados:</strong>
            <ul className="mt-2 list-disc list-inside">
              {health.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="scheduler">Agendar</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Últimos backups realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentBackups && recentBackups.length > 0 ? (
                  <div className="space-y-3">
                    {recentBackups.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            backup.status === 'completed' ? 'bg-green-500' :
                            backup.status === 'failed' ? 'bg-red-500' :
                            backup.status === 'running' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`} />
                          <div>
                            <p className="font-medium">{backup.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(backup.createdAt))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={backup.status === 'completed' ? 'default' : 
                                        backup.status === 'failed' ? 'destructive' : 'secondary'}>
                            {backup.status === 'completed' ? 'Concluído' :
                             backup.status === 'failed' ? 'Falhou' :
                             backup.status === 'running' ? 'Executando' : 'Pendente'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatBytes(backup.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum backup encontrado</p>
                    <p className="text-sm">Crie seu primeiro backup para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Storage Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Uso de Armazenamento
                </CardTitle>
                <CardDescription>
                  Distribuição do espaço utilizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {storageUsage ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Local</span>
                        <span>{formatBytes(storageUsage.local.used)} / {formatBytes(storageUsage.local.total)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(storageUsage.local.used / storageUsage.local.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {storageUsage.cloud && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Nuvem</span>
                          <span>{formatBytes(storageUsage.cloud.used)} / {formatBytes(storageUsage.cloud.total)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(storageUsage.cloud.used / storageUsage.cloud.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatBytes(storageUsage.totalUsed)} / {formatBytes(storageUsage.totalCapacity)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Carregando informações de armazenamento...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">
                    {stats ? Math.round((stats.successfulBackups / stats.totalBackups) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Economia de Espaço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {stats ? Math.round(stats.compressionRatio * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-2xl font-bold">
                    {stats ? Math.round(stats.averageDuration / 60) : 0}min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scheduler">
          <BackupScheduler />
        </TabsContent>
        
        <TabsContent value="history">
          <BackupHistory />
        </TabsContent>
        
        <TabsContent value="status">
          <BackupStatus />
        </TabsContent>
        
        <TabsContent value="settings">
          <BackupSettings />
        </TabsContent>
      </Tabs>
      
      {/* Restore Wizard Modal */}
      {showRestoreWizard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <RestoreWizard onClose={() => setShowRestoreWizard(false)} />
          </div>
        </div>
      )}
    </div>
  )
}