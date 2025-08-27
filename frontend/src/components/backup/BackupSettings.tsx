'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Cloud, 
  Database, 
  HardDrive, 
  Key, 
  Loader2, 
  Save, 
  Settings, 
  Shield, 
  TestTube, 
  Trash2, 
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Server,
  Lock
} from 'lucide-react'
import { useBackup } from '@/hooks/useBackup'
import type { BackupSettings as BackupSettingsType, CloudStorageConfig, BackupFrequency, StorageLocation } from '@/types/backup'
import { toast } from 'sonner'
import { formatBytes } from '@/lib/utils'

const backupSettingsSchema = z.object({
  // Configurações Gerais
  defaultRetentionDays: z.number().min(1).max(365),
  maxConcurrentBackups: z.number().min(1).max(10),
  compressionEnabled: z.boolean(),
  encryptionEnabled: z.boolean(),
  encryptionKey: z.string().optional(),
  
  // Configurações de Armazenamento
  defaultStorageLocation: z.enum(['local', 'cloud', 'hybrid'] as const),
  localStoragePath: z.string().optional(),
  maxLocalStorageSize: z.number().optional(),
  
  // Configurações de Agendamento
  defaultFrequency: z.enum(['daily', 'weekly', 'monthly'] as const),
  defaultBackupTime: z.string(),
  enableAutoBackup: z.boolean(),
  
  // Configurações de Notificação
  notifyOnSuccess: z.boolean(),
  notifyOnFailure: z.boolean(),
  notificationEmail: z.string().email().optional(),
  
  // Configurações de Performance
  maxBackupSpeed: z.number().optional(),
  enableDeltaBackup: z.boolean(),
  enableDeduplication: z.boolean(),
  
  // Configurações de Segurança
  requireApprovalForRestore: z.boolean(),
  enableAuditLog: z.boolean(),
  maxFailedAttempts: z.number().min(1).max(10),
})

const cloudStorageSchema = z.object({
  provider: z.enum(['aws', 'azure', 'gcp', 'dropbox', 'onedrive'] as const),
  accessKey: z.string().min(1),
  secretKey: z.string().min(1),
  bucket: z.string().min(1),
  region: z.string().optional(),
  endpoint: z.string().optional(),
  enableEncryption: z.boolean(),
  storageClass: z.string().optional(),
})

type BackupSettingsFormData = z.infer<typeof backupSettingsSchema>
type CloudStorageFormData = z.infer<typeof cloudStorageSchema>

interface BackupSettingsProps {
  onSettingsChange?: (settings: BackupSettingsType) => void
}

export function BackupSettings({ onSettingsChange }: BackupSettingsProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const {
    useBackupSettings,
    updateBackupSettings,
    testCloudConnection
  } = useBackup()
  
  const { data: settings, isLoading } = useBackupSettings()
  
  const {
    register: registerGeneral,
    handleSubmit: handleSubmitGeneral,
    watch: watchGeneral,
    setValue: setValueGeneral,
    formState: { errors: errorsGeneral, isDirty: isDirtyGeneral },
  } = useForm<BackupSettingsFormData>({
    resolver: zodResolver(backupSettingsSchema),
    values: settings ? {
      defaultRetentionDays: settings.defaultRetentionDays,
      maxConcurrentBackups: settings.maxConcurrentBackups,
      compressionEnabled: settings.compressionEnabled,
      encryptionEnabled: settings.encryptionEnabled,
      encryptionKey: settings.encryptionKey || '',
      defaultStorageLocation: settings.defaultStorageLocation,
      localStoragePath: settings.localStoragePath || '',
      maxLocalStorageSize: settings.maxLocalStorageSize || 0,
      defaultFrequency: settings.defaultFrequency,
      defaultBackupTime: settings.defaultBackupTime,
      enableAutoBackup: settings.enableAutoBackup,
      notifyOnSuccess: settings.notifyOnSuccess,
      notifyOnFailure: settings.notifyOnFailure,
      notificationEmail: settings.notificationEmail || '',
      maxBackupSpeed: settings.maxBackupSpeed || 0,
      enableDeltaBackup: settings.enableDeltaBackup,
      enableDeduplication: settings.enableDeduplication,
      requireApprovalForRestore: settings.requireApprovalForRestore,
      enableAuditLog: settings.enableAuditLog,
      maxFailedAttempts: settings.maxFailedAttempts,
    } : undefined,
  })
  
  const {
    register: registerCloud,
    handleSubmit: handleSubmitCloud,
    watch: watchCloud,
    setValue: setValueCloud,
    formState: { errors: errorsCloud, isDirty: isDirtyCloud },
  } = useForm<CloudStorageFormData>({
    resolver: zodResolver(cloudStorageSchema),
    values: settings?.cloudStorage ? {
      provider: settings.cloudStorage.provider,
      accessKey: settings.cloudStorage.accessKey,
      secretKey: settings.cloudStorage.secretKey,
      bucket: settings.cloudStorage.bucket,
      region: settings.cloudStorage.region || '',
      endpoint: settings.cloudStorage.endpoint || '',
      enableEncryption: settings.cloudStorage.enableEncryption,
      storageClass: settings.cloudStorage.storageClass || '',
    } : undefined,
  })
  
  const encryptionEnabled = watchGeneral('encryptionEnabled')
  const defaultStorageLocation = watchGeneral('defaultStorageLocation')
  const enableAutoBackup = watchGeneral('enableAutoBackup')
  const cloudProvider = watchCloud('provider')
  
  const handleSaveGeneral = async (data: BackupSettingsFormData) => {
    try {
      const updatedSettings: Partial<BackupSettingsType> = {
        ...data,
        maxLocalStorageSize: data.maxLocalStorageSize || undefined,
        maxBackupSpeed: data.maxBackupSpeed || undefined,
        encryptionKey: data.encryptionEnabled ? data.encryptionKey : undefined,
        notificationEmail: data.notificationEmail || undefined,
        localStoragePath: data.localStoragePath || undefined,
      }
      
      await updateBackupSettings.mutateAsync(updatedSettings)
      toast.success('Configurações salvas com sucesso')
      onSettingsChange?.(updatedSettings as BackupSettingsType)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar configurações')
    }
  }
  
  const handleSaveCloud = async (data: CloudStorageFormData) => {
    try {
      const cloudConfig: CloudStorageConfig = {
        ...data,
        region: data.region || undefined,
        endpoint: data.endpoint || undefined,
        storageClass: data.storageClass || undefined,
      }
      
      await updateBackupSettings.mutateAsync({ cloudStorage: cloudConfig })
      toast.success('Configurações de nuvem salvas com sucesso')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar configurações de nuvem')
    }
  }
  
  const handleTestConnection = async () => {
    const cloudData = watchCloud()
    if (!cloudData.provider || !cloudData.accessKey || !cloudData.secretKey || !cloudData.bucket) {
      toast.error('Preencha todos os campos obrigatórios antes de testar')
      return
    }
    
    setTestingConnection(true)
    setConnectionStatus('idle')
    
    try {
      const result = await testCloudConnection.mutateAsync({
        provider: cloudData.provider,
        accessKey: cloudData.accessKey,
        secretKey: cloudData.secretKey,
        bucket: cloudData.bucket,
        region: cloudData.region,
        endpoint: cloudData.endpoint,
        enableEncryption: cloudData.enableEncryption,
        storageClass: cloudData.storageClass,
      })
      
      if (result.success) {
        setConnectionStatus('success')
        toast.success('Conexão testada com sucesso')
      } else {
        setConnectionStatus('error')
        toast.error(result.error || 'Erro ao testar conexão')
      }
    } catch (error: any) {
      setConnectionStatus('error')
      toast.error(error.message || 'Erro ao testar conexão')
    } finally {
      setTestingConnection(false)
    }
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Backup
        </CardTitle>
        <CardDescription>
          Configure as opções globais do sistema de backup
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="storage">Armazenamento</TabsTrigger>
            <TabsTrigger value="cloud">Nuvem</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <form onSubmit={handleSubmitGeneral(handleSaveGeneral)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultRetentionDays">Retenção Padrão (dias)</Label>
                  <Input
                    id="defaultRetentionDays"
                    type="number"
                    min="1"
                    max="365"
                    {...registerGeneral('defaultRetentionDays', { valueAsNumber: true })}
                  />
                  {errorsGeneral.defaultRetentionDays && (
                    <p className="text-sm text-red-500">{errorsGeneral.defaultRetentionDays.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxConcurrentBackups">Backups Simultâneos</Label>
                  <Input
                    id="maxConcurrentBackups"
                    type="number"
                    min="1"
                    max="10"
                    {...registerGeneral('maxConcurrentBackups', { valueAsNumber: true })}
                  />
                  {errorsGeneral.maxConcurrentBackups && (
                    <p className="text-sm text-red-500">{errorsGeneral.maxConcurrentBackups.message}</p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Agendamento</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableAutoBackup"
                    {...registerGeneral('enableAutoBackup')}
                    onCheckedChange={(checked) => setValueGeneral('enableAutoBackup', !!checked)}
                  />
                  <Label htmlFor="enableAutoBackup">Habilitar backup automático</Label>
                </div>
                
                {enableAutoBackup && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultFrequency">Frequência Padrão</Label>
                      <Select
                        value={watchGeneral('defaultFrequency')}
                        onValueChange={(value) => setValueGeneral('defaultFrequency', value as BackupFrequency)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultBackupTime">Horário Padrão</Label>
                      <Input
                        id="defaultBackupTime"
                        type="time"
                        {...registerGeneral('defaultBackupTime')}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxBackupSpeed">Velocidade Máxima (MB/s)</Label>
                    <Input
                      id="maxBackupSpeed"
                      type="number"
                      min="0"
                      placeholder="Ilimitado"
                      {...registerGeneral('maxBackupSpeed', { valueAsNumber: true })}
                    />
                    <p className="text-sm text-muted-foreground">0 = ilimitado</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="compressionEnabled"
                      {...registerGeneral('compressionEnabled')}
                      onCheckedChange={(checked) => setValueGeneral('compressionEnabled', !!checked)}
                    />
                    <Label htmlFor="compressionEnabled">Habilitar compressão</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableDeltaBackup"
                      {...registerGeneral('enableDeltaBackup')}
                      onCheckedChange={(checked) => setValueGeneral('enableDeltaBackup', !!checked)}
                    />
                    <Label htmlFor="enableDeltaBackup">Habilitar backup incremental</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableDeduplication"
                      {...registerGeneral('enableDeduplication')}
                      onCheckedChange={(checked) => setValueGeneral('enableDeduplication', !!checked)}
                    />
                    <Label htmlFor="enableDeduplication">Habilitar deduplicação</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyOnSuccess"
                      {...registerGeneral('notifyOnSuccess')}
                      onCheckedChange={(checked) => setValueGeneral('notifyOnSuccess', !!checked)}
                    />
                    <Label htmlFor="notifyOnSuccess">Notificar em caso de sucesso</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyOnFailure"
                      {...registerGeneral('notifyOnFailure')}
                      onCheckedChange={(checked) => setValueGeneral('notifyOnFailure', !!checked)}
                    />
                    <Label htmlFor="notifyOnFailure">Notificar em caso de falha</Label>
                  </div>
                  
                  {(watchGeneral('notifyOnSuccess') || watchGeneral('notifyOnFailure')) && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="notificationEmail">Email para Notificações</Label>
                      <Input
                        id="notificationEmail"
                        type="email"
                        placeholder="admin@dataclinica.com"
                        {...registerGeneral('notificationEmail')}
                      />
                      {errorsGeneral.notificationEmail && (
                        <p className="text-sm text-red-500">{errorsGeneral.notificationEmail.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateBackupSettings.isPending || !isDirtyGeneral}
                >
                  {updateBackupSettings.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Local de Armazenamento Padrão</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="local"
                      value="local"
                      {...registerGeneral('defaultStorageLocation')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="local" className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Armazenamento Local
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cloud"
                      value="cloud"
                      {...registerGeneral('defaultStorageLocation')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="cloud" className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Armazenamento em Nuvem
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="hybrid"
                      value="hybrid"
                      {...registerGeneral('defaultStorageLocation')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="hybrid" className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Híbrido (Local + Nuvem)
                    </Label>
                  </div>
                </div>
              </div>
              
              {(defaultStorageLocation === 'local' || defaultStorageLocation === 'hybrid') && (
                <div className="space-y-4">
                  <h4 className="font-medium">Configurações Locais</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="localStoragePath">Caminho de Armazenamento</Label>
                      <Input
                        id="localStoragePath"
                        placeholder="C:\\Backups\\DataClinica"
                        {...registerGeneral('localStoragePath')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxLocalStorageSize">Tamanho Máximo (GB)</Label>
                      <Input
                        id="maxLocalStorageSize"
                        type="number"
                        min="0"
                        placeholder="Ilimitado"
                        {...registerGeneral('maxLocalStorageSize', { valueAsNumber: true })}
                      />
                      <p className="text-sm text-muted-foreground">0 = ilimitado</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="cloud" className="space-y-6">
            <form onSubmit={handleSubmitCloud(handleSaveCloud)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuração de Nuvem</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="provider">Provedor</Label>
                  <Select
                    value={cloudProvider}
                    onValueChange={(value) => setValueCloud('provider', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                      <SelectItem value="dropbox">Dropbox</SelectItem>
                      <SelectItem value="onedrive">OneDrive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errorsCloud.provider && (
                    <p className="text-sm text-red-500">{errorsCloud.provider.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessKey">Chave de Acesso</Label>
                    <Input
                      id="accessKey"
                      type="password"
                      {...registerCloud('accessKey')}
                    />
                    {errorsCloud.accessKey && (
                      <p className="text-sm text-red-500">{errorsCloud.accessKey.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secretKey">Chave Secreta</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      {...registerCloud('secretKey')}
                    />
                    {errorsCloud.secretKey && (
                      <p className="text-sm text-red-500">{errorsCloud.secretKey.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bucket">Bucket/Container</Label>
                    <Input
                      id="bucket"
                      {...registerCloud('bucket')}
                    />
                    {errorsCloud.bucket && (
                      <p className="text-sm text-red-500">{errorsCloud.bucket.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region">Região (opcional)</Label>
                    <Input
                      id="region"
                      placeholder="us-east-1"
                      {...registerCloud('region')}
                    />
                  </div>
                </div>
                
                {cloudProvider === 'aws' && (
                  <div className="space-y-2">
                    <Label htmlFor="storageClass">Classe de Armazenamento</Label>
                    <Select
                      value={watchCloud('storageClass') || ''}
                      onValueChange={(value) => setValueCloud('storageClass', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Padrão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="STANDARD_IA">Standard-IA</SelectItem>
                        <SelectItem value="GLACIER">Glacier</SelectItem>
                        <SelectItem value="DEEP_ARCHIVE">Deep Archive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableCloudEncryption"
                    {...registerCloud('enableEncryption')}
                    onCheckedChange={(checked) => setValueCloud('enableEncryption', !!checked)}
                  />
                  <Label htmlFor="enableCloudEncryption">Habilitar criptografia no lado do servidor</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                  
                  {connectionStatus === 'success' && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Erro
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateBackupSettings.isPending || !isDirtyCloud}
                >
                  {updateBackupSettings.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Criptografia</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="encryptionEnabled"
                    {...registerGeneral('encryptionEnabled')}
                    onCheckedChange={(checked) => setValueGeneral('encryptionEnabled', !!checked)}
                  />
                  <Label htmlFor="encryptionEnabled">Habilitar criptografia de backups</Label>
                </div>
                
                {encryptionEnabled && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="encryptionKey">Chave de Criptografia</Label>
                    <Input
                      id="encryptionKey"
                      type="password"
                      placeholder="Digite uma chave forte"
                      {...registerGeneral('encryptionKey')}
                    />
                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Importante:</strong> Guarde esta chave em local seguro. 
                        Sem ela, não será possível restaurar os backups criptografados.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Controle de Acesso</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireApprovalForRestore"
                      {...registerGeneral('requireApprovalForRestore')}
                      onCheckedChange={(checked) => setValueGeneral('requireApprovalForRestore', !!checked)}
                    />
                    <Label htmlFor="requireApprovalForRestore">Exigir aprovação para restauração</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableAuditLog"
                      {...registerGeneral('enableAuditLog')}
                      onCheckedChange={(checked) => setValueGeneral('enableAuditLog', !!checked)}
                    />
                    <Label htmlFor="enableAuditLog">Habilitar log de auditoria</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxFailedAttempts">Máximo de Tentativas Falhadas</Label>
                  <Input
                    id="maxFailedAttempts"
                    type="number"
                    min="1"
                    max="10"
                    {...registerGeneral('maxFailedAttempts', { valueAsNumber: true })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Número máximo de tentativas de backup antes de bloquear temporariamente
                  </p>
                  {errorsGeneral.maxFailedAttempts && (
                    <p className="text-sm text-red-500">{errorsGeneral.maxFailedAttempts.message}</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}