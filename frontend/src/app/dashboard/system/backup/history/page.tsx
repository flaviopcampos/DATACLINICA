'use client'

import { BackupHistory } from '@/components/backup/BackupHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  History, 
  Download, 
  Trash2, 
  Shield, 
  Database, 
  Calendar,
  HardDrive,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useBackup } from '@/hooks/useBackup'
import { formatBytes, formatDistanceToNow } from '@/lib/utils'

export default function BackupHistoryPage() {
  const router = useRouter()
  
  const {
    useBackups,
    useBackupStats,
    useStorageUsage
  } = useBackup()
  
  const { data: backups, isLoading } = useBackups()
  const { data: stats } = useBackupStats()
  const { data: storageUsage } = useStorageUsage()
  
  const recentBackups = backups?.slice(0, 5) || []
  const successfulBackups = backups?.filter(b => b.status === 'completed').length || 0
  const failedBackups = backups?.filter(b => b.status === 'failed').length || 0
  const totalSize = backups?.reduce((acc, b) => acc + (b.size || 0), 0) || 0
  
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
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Backups</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os backups realizados no sistema
          </p>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {recentBackups.length > 0 && (
                <>Último: {formatDistanceToNow(new Date(recentBackups[0].createdAt))}</>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {backups?.length ? Math.round((successfulBackups / backups.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {successfulBackups} sucessos, {failedBackups} falhas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaço Utilizado</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              {storageUsage?.localUsed && (
                <>Local: {formatBytes(storageUsage.localUsed)}</>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentBackups.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {formatDistanceToNow(new Date(recentBackups[0].createdAt))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={
                      recentBackups[0].status === 'completed' ? 'default' :
                      recentBackups[0].status === 'failed' ? 'destructive' :
                      recentBackups[0].status === 'running' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {recentBackups[0].status === 'completed' ? 'Sucesso' :
                     recentBackups[0].status === 'failed' ? 'Falha' :
                     recentBackups[0].status === 'running' ? 'Em andamento' :
                     recentBackups[0].status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">-</div>
                <p className="text-xs text-muted-foreground">Nenhum backup realizado</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Backups Summary */}
      {recentBackups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Backups Recentes
            </CardTitle>
            <CardDescription>
              Os 5 backups mais recentes realizados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBackups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {backup.type === 'full' ? (
                        <Database className="h-4 w-4" />
                      ) : backup.type === 'incremental' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-medium">{backup.name}</span>
                    </div>
                    
                    <Badge 
                      variant={
                        backup.status === 'completed' ? 'default' :
                        backup.status === 'failed' ? 'destructive' :
                        backup.status === 'running' ? 'secondary' : 'outline'
                      }
                    >
                      {backup.status === 'completed' ? 'Sucesso' :
                       backup.status === 'failed' ? 'Falha' :
                       backup.status === 'running' ? 'Em andamento' :
                       backup.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatBytes(backup.size || 0)}</span>
                    <span>{formatDistanceToNow(new Date(backup.createdAt))}</span>
                    
                    <div className="flex items-center gap-1">
                      {backup.status === 'completed' && (
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {backup.encrypted && (
                        <Shield className="h-4 w-4 text-green-600" title="Backup criptografado" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Storage Usage Overview */}
      {storageUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Uso de Armazenamento
            </CardTitle>
            <CardDescription>
              Distribuição do espaço utilizado pelos backups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Local</span>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(storageUsage.localUsed || 0)} / {formatBytes(storageUsage.localTotal || 0)}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${storageUsage.localTotal ? (storageUsage.localUsed / storageUsage.localTotal) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              
              {storageUsage.cloudUsed !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nuvem</span>
                    <span className="text-sm text-muted-foreground">
                      {formatBytes(storageUsage.cloudUsed || 0)} / {formatBytes(storageUsage.cloudTotal || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${storageUsage.cloudTotal ? (storageUsage.cloudUsed / storageUsage.cloudTotal) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes((storageUsage.localUsed || 0) + (storageUsage.cloudUsed || 0))}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {backups?.length || 0} backups armazenados
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main History Component */}
      <BackupHistory />
    </div>
  )
}