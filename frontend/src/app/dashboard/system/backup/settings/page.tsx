'use client'

import { BackupSettings } from '@/components/backup/BackupSettings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Settings, 
  Shield, 
  Database, 
  Cloud, 
  Bell, 
  Zap,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useBackup } from '@/hooks/useBackup'
import { formatBytes, formatDistanceToNow } from '@/lib/utils'

export default function BackupSettingsPage() {
  const router = useRouter()
  
  const {
    useBackupSettings,
    useBackupHealth
  } = useBackup()
  
  const { data: settings, isLoading } = useBackupSettings()
  const { data: health } = useBackupHealth()
  
  const handleSettingsChange = (newSettings: any) => {
    // Callback para quando as configurações forem alteradas
    console.log('Configurações atualizadas:', newSettings)
  }
  
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
          <h1 className="text-3xl font-bold tracking-tight">Configurações de Backup</h1>
          <p className="text-muted-foreground">
            Configure as opções globais do sistema de backup e recuperação
          </p>
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {health?.overallStatus === 'healthy' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium capitalize">
                {health?.overallStatus === 'healthy' ? 'Saudável' :
                 health?.overallStatus === 'warning' ? 'Atenção' :
                 health?.overallStatus === 'critical' ? 'Crítico' : 'Desconhecido'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Última verificação: {health?.lastCheck ? formatDistanceToNow(new Date(health.lastCheck)) : 'Nunca'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento Padrão</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {settings?.defaultStorageLocation === 'local' ? (
                <Database className="h-4 w-4" />
              ) : settings?.defaultStorageLocation === 'cloud' ? (
                <Cloud className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {settings?.defaultStorageLocation === 'local' ? 'Local' :
                 settings?.defaultStorageLocation === 'cloud' ? 'Nuvem' :
                 settings?.defaultStorageLocation === 'hybrid' ? 'Híbrido' : 'Não configurado'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {settings?.localStoragePath || 'Caminho não definido'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criptografia</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={settings?.encryptionEnabled ? 'default' : 'secondary'}>
                {settings?.encryptionEnabled ? 'Habilitada' : 'Desabilitada'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {settings?.encryptionEnabled ? 'Backups protegidos' : 'Sem proteção adicional'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={(settings?.notifyOnSuccess || settings?.notifyOnFailure) ? 'default' : 'secondary'}>
                {(settings?.notifyOnSuccess || settings?.notifyOnFailure) ? 'Ativas' : 'Inativas'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {settings?.notificationEmail || 'Email não configurado'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Configuration Alerts */}
      {settings && (
        <div className="space-y-4">
          {!settings.encryptionEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Recomendação de Segurança:</strong> Considere habilitar a criptografia 
                para proteger seus backups contra acesso não autorizado.
              </AlertDescription>
            </Alert>
          )}
          
          {!settings.notificationEmail && (settings.notifyOnSuccess || settings.notifyOnFailure) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuração Incompleta:</strong> As notificações estão habilitadas 
                mas nenhum email foi configurado. Configure um email para receber as notificações.
              </AlertDescription>
            </Alert>
          )}
          
          {settings.defaultStorageLocation === 'cloud' && !settings.cloudStorage && (
            <Alert variant="destructive">
              <Cloud className="h-4 w-4" />
              <AlertDescription>
                <strong>Armazenamento em Nuvem:</strong> O armazenamento padrão está configurado 
                para nuvem, mas as credenciais não foram configuradas. Configure as credenciais 
                na aba "Nuvem".
              </AlertDescription>
            </Alert>
          )}
          
          {settings.maxLocalStorageSize && settings.maxLocalStorageSize > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Limite de Armazenamento:</strong> O limite de armazenamento local está 
                configurado para {formatBytes(settings.maxLocalStorageSize * 1024 * 1024 * 1024)}. 
                Backups antigos serão removidos automaticamente quando o limite for atingido.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {/* Main Settings Component */}
      <BackupSettings onSettingsChange={handleSettingsChange} />
      
      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Segurança</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• A criptografia protege seus dados contra acesso não autorizado</li>
                <li>• Guarde a chave de criptografia em local seguro</li>
                <li>• Sem a chave, não será possível restaurar backups criptografados</li>
                <li>• Logs de auditoria registram todas as operações de backup</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Performance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Backup incremental reduz tempo e espaço utilizado</li>
                <li>• Compressão pode reduzir o tamanho dos backups em até 70%</li>
                <li>• Deduplicação elimina dados duplicados</li>
                <li>• Limite a velocidade para não impactar outros sistemas</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Armazenamento</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Local: Mais rápido, mas limitado ao espaço disponível</li>
                <li>• Nuvem: Mais seguro e com maior capacidade</li>
                <li>• Híbrido: Combina velocidade local com segurança da nuvem</li>
                <li>• Configure limites para evitar esgotamento de espaço</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Retenção</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Backups antigos são removidos automaticamente</li>
                <li>• Configure o período de retenção conforme suas necessidades</li>
                <li>• Considere regulamentações de compliance</li>
                <li>• Backups importantes podem ser marcados como permanentes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}