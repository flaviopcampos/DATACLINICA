'use client'

import { useState } from 'react'
import { 
  Settings, 
  Save, 
  TestTube, 
  AlertTriangle, 
  CheckCircle, 
  Cloud, 
  HardDrive, 
  Bell, 
  Shield, 
  Clock, 
  Trash2, 
  RefreshCw,
  Database,
  Server,
  Key,
  Globe,
  Folder,
  Calendar,
  Mail,
  Smartphone
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import BackupNotificationCenter from '@/components/backup/BackupNotificationCenter'
import BackupNotificationSettings from '@/components/backup/BackupNotificationSettings'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBackup } from '@/hooks/useBackup'
import { toast } from 'sonner'
import { formatBytes } from '@/lib/utils'
import type { BackupSettings, CloudStorageConfig, BackupFrequency, StorageLocation } from '@/types/backup'

// Schema de validação para configurações gerais
const generalSettingsSchema = z.object({
  retention_days: z.number().min(1).max(365),
  max_concurrent_backups: z.number().min(1).max(10),
  compression_enabled: z.boolean(),
  encryption_enabled: z.boolean(),
  verify_backups: z.boolean(),
  auto_cleanup: z.boolean(),
  cleanup_threshold_gb: z.number().min(1).max(1000),
  default_backup_location: z.enum(['local', 'cloud', 'both'] as const)
})

// Schema para armazenamento local
const localStorageSchema = z.object({
  local_path: z.string().min(1, 'Caminho é obrigatório'),
  max_local_storage_gb: z.number().min(1).max(10000)
})

// Schema para armazenamento em nuvem
const cloudStorageSchema = z.object({
  provider: z.enum(['aws', 'google', 'azure', 'dropbox'] as const),
  access_key: z.string().min(1, 'Chave de acesso é obrigatória'),
  secret_key: z.string().min(1, 'Chave secreta é obrigatória'),
  bucket_name: z.string().min(1, 'Nome do bucket é obrigatório'),
  region: z.string().optional(),
  endpoint: z.string().optional()
})

// Schema para notificações
const notificationSchema = z.object({
  email_enabled: z.boolean(),
  email_recipients: z.string(),
  sms_enabled: z.boolean(),
  sms_recipients: z.string(),
  webhook_enabled: z.boolean(),
  webhook_url: z.string().optional(),
  notify_on_success: z.boolean(),
  notify_on_failure: z.boolean(),
  notify_on_warning: z.boolean()
})

type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>
type LocalStorageForm = z.infer<typeof localStorageSchema>
type CloudStorageForm = z.infer<typeof cloudStorageSchema>
type NotificationForm = z.infer<typeof notificationSchema>

interface TestConnectionResult {
  success: boolean
  message: string
  latency?: number
  available_space?: number
}

export default function BackupSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<TestConnectionResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const {
    backupSettings,
    storageUsage,
    updateBackupSettings,
    testCloudConnection,
    cleanupOldBackups,
    verifyBackupIntegrity,
    isLoading
  } = useBackup()

  // Formulário de configurações gerais
  const generalForm = useForm<GeneralSettingsForm>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      retention_days: backupSettings?.retention_days || 30,
      max_concurrent_backups: backupSettings?.max_concurrent_backups || 2,
      compression_enabled: backupSettings?.compression_enabled || true,
      encryption_enabled: backupSettings?.encryption_enabled || true,
      verify_backups: backupSettings?.verify_backups || true,
      auto_cleanup: backupSettings?.auto_cleanup || true,
      cleanup_threshold_gb: backupSettings?.cleanup_threshold_gb || 100,
      default_backup_location: backupSettings?.default_backup_location || 'local'
    }
  })

  // Formulário de armazenamento local
  const localForm = useForm<LocalStorageForm>({
    resolver: zodResolver(localStorageSchema),
    defaultValues: {
      local_path: backupSettings?.local_storage?.path || 'C:\\DataClinica\\Backups',
      max_local_storage_gb: backupSettings?.local_storage?.max_size_gb || 500
    }
  })

  // Formulário de armazenamento em nuvem
  const cloudForm = useForm<CloudStorageForm>({
    resolver: zodResolver(cloudStorageSchema),
    defaultValues: {
      provider: backupSettings?.cloud_storage?.provider || 'aws',
      access_key: backupSettings?.cloud_storage?.access_key || '',
      secret_key: backupSettings?.cloud_storage?.secret_key || '',
      bucket_name: backupSettings?.cloud_storage?.bucket_name || '',
      region: backupSettings?.cloud_storage?.region || '',
      endpoint: backupSettings?.cloud_storage?.endpoint || ''
    }
  })

  // Formulário de notificações
  const notificationForm = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_enabled: backupSettings?.notifications?.email_enabled || false,
      email_recipients: backupSettings?.notifications?.email_recipients?.join(', ') || '',
      sms_enabled: backupSettings?.notifications?.sms_enabled || false,
      sms_recipients: backupSettings?.notifications?.sms_recipients?.join(', ') || '',
      webhook_enabled: backupSettings?.notifications?.webhook_enabled || false,
      webhook_url: backupSettings?.notifications?.webhook_url || '',
      notify_on_success: backupSettings?.notifications?.notify_on_success || true,
      notify_on_failure: backupSettings?.notifications?.notify_on_failure || true,
      notify_on_warning: backupSettings?.notifications?.notify_on_warning || true
    }
  })

  const handleSaveGeneralSettings = async (data: GeneralSettingsForm) => {
    setIsSaving(true)
    try {
      await updateBackupSettings({
        ...backupSettings,
        ...data
      })
      toast.success('Configurações gerais salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações gerais')
      console.error('Erro ao salvar configurações:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveLocalStorage = async (data: LocalStorageForm) => {
    setIsSaving(true)
    try {
      await updateBackupSettings({
        ...backupSettings,
        local_storage: {
          path: data.local_path,
          max_size_gb: data.max_local_storage_gb
        }
      })
      toast.success('Configurações de armazenamento local salvas!')
    } catch (error) {
      toast.error('Erro ao salvar configurações de armazenamento local')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCloudStorage = async (data: CloudStorageForm) => {
    setIsSaving(true)
    try {
      await updateBackupSettings({
        ...backupSettings,
        cloud_storage: {
          provider: data.provider,
          access_key: data.access_key,
          secret_key: data.secret_key,
          bucket_name: data.bucket_name,
          region: data.region,
          endpoint: data.endpoint
        }
      })
      toast.success('Configurações de armazenamento em nuvem salvas!')
    } catch (error) {
      toast.error('Erro ao salvar configurações de armazenamento em nuvem')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async (data: NotificationForm) => {
    setIsSaving(true)
    try {
      await updateBackupSettings({
        ...backupSettings,
        notifications: {
          email_enabled: data.email_enabled,
          email_recipients: data.email_recipients.split(',').map(email => email.trim()).filter(Boolean),
          sms_enabled: data.sms_enabled,
          sms_recipients: data.sms_recipients.split(',').map(phone => phone.trim()).filter(Boolean),
          webhook_enabled: data.webhook_enabled,
          webhook_url: data.webhook_url,
          notify_on_success: data.notify_on_success,
          notify_on_failure: data.notify_on_failure,
          notify_on_warning: data.notify_on_warning
        }
      })
      toast.success('Configurações de notificações salvas!')
    } catch (error) {
      toast.error('Erro ao salvar configurações de notificações')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestCloudConnection = async () => {
    setIsTestingConnection(true)
    setConnectionTestResult(null)
    
    try {
      const cloudData = cloudForm.getValues()
      const result = await testCloudConnection({
        provider: cloudData.provider,
        access_key: cloudData.access_key,
        secret_key: cloudData.secret_key,
        bucket_name: cloudData.bucket_name,
        region: cloudData.region,
        endpoint: cloudData.endpoint
      })
      
      setConnectionTestResult(result)
      
      if (result.success) {
        toast.success('Conexão testada com sucesso!')
      } else {
        toast.error('Falha no teste de conexão')
      }
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: 'Erro ao testar conexão'
      })
      toast.error('Erro ao testar conexão')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleCleanupOldBackups = async () => {
    try {
      await cleanupOldBackups()
      toast.success('Limpeza de backups antigos iniciada!')
    } catch (error) {
      toast.error('Erro ao iniciar limpeza de backups')
    }
  }

  const handleVerifyBackups = async () => {
    try {
      await verifyBackupIntegrity()
      toast.success('Verificação de integridade iniciada!')
    } catch (error) {
      toast.error('Erro ao iniciar verificação de integridade')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações de Backup</h1>
          <p className="text-muted-foreground">
            Configure o sistema de backup e recuperação
          </p>
        </div>
        <BackupNotificationCenter />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="local">Armazenamento Local</TabsTrigger>
          <TabsTrigger value="cloud">Nuvem</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure as opções básicas do sistema de backup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={generalForm.handleSubmit(handleSaveGeneralSettings)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="retention_days">Retenção de Backups (dias)</Label>
                    <Input
                      id="retention_days"
                      type="number"
                      min="1"
                      max="365"
                      {...generalForm.register('retention_days', { valueAsNumber: true })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Backups serão mantidos por este período
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_concurrent_backups">Backups Simultâneos</Label>
                    <Input
                      id="max_concurrent_backups"
                      type="number"
                      min="1"
                      max="10"
                      {...generalForm.register('max_concurrent_backups', { valueAsNumber: true })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Número máximo de backups executando simultaneamente
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cleanup_threshold_gb">Limite para Limpeza (GB)</Label>
                    <Input
                      id="cleanup_threshold_gb"
                      type="number"
                      min="1"
                      max="1000"
                      {...generalForm.register('cleanup_threshold_gb', { valueAsNumber: true })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Iniciar limpeza automática quando atingir este limite
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_backup_location">Local Padrão</Label>
                    <Select
                      value={generalForm.watch('default_backup_location')}
                      onValueChange={(value) => generalForm.setValue('default_backup_location', value as StorageLocation)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Armazenamento Local</SelectItem>
                        <SelectItem value="cloud">Nuvem</SelectItem>
                        <SelectItem value="both">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Opções Avançadas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="compression_enabled" className="font-medium">Compressão</Label>
                        <p className="text-sm text-muted-foreground">Reduzir tamanho dos backups</p>
                      </div>
                      <Switch
                        id="compression_enabled"
                        checked={generalForm.watch('compression_enabled')}
                        onCheckedChange={(checked) => generalForm.setValue('compression_enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="encryption_enabled" className="font-medium">Criptografia</Label>
                        <p className="text-sm text-muted-foreground">Proteger dados com criptografia</p>
                      </div>
                      <Switch
                        id="encryption_enabled"
                        checked={generalForm.watch('encryption_enabled')}
                        onCheckedChange={(checked) => generalForm.setValue('encryption_enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="verify_backups" className="font-medium">Verificação</Label>
                        <p className="text-sm text-muted-foreground">Verificar integridade após backup</p>
                      </div>
                      <Switch
                        id="verify_backups"
                        checked={generalForm.watch('verify_backups')}
                        onCheckedChange={(checked) => generalForm.setValue('verify_backups', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="auto_cleanup" className="font-medium">Limpeza Automática</Label>
                        <p className="text-sm text-muted-foreground">Remover backups antigos automaticamente</p>
                      </div>
                      <Switch
                        id="auto_cleanup"
                        checked={generalForm.watch('auto_cleanup')}
                        onCheckedChange={(checked) => generalForm.setValue('auto_cleanup', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Armazenamento Local */}
        <TabsContent value="local">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Armazenamento Local
              </CardTitle>
              <CardDescription>
                Configure o armazenamento local de backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={localForm.handleSubmit(handleSaveLocalStorage)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="local_path">Caminho dos Backups</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="local_path"
                        {...localForm.register('local_path')}
                        placeholder="C:\DataClinica\Backups"
                      />
                      <Button type="button" variant="outline">
                        <Folder className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Diretório onde os backups serão armazenados
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_local_storage_gb">Limite de Armazenamento (GB)</Label>
                    <Input
                      id="max_local_storage_gb"
                      type="number"
                      min="1"
                      max="10000"
                      {...localForm.register('max_local_storage_gb', { valueAsNumber: true })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Espaço máximo para backups locais
                    </p>
                  </div>
                </div>

                {/* Status do Armazenamento */}
                {storageUsage && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-lg font-semibold">Status do Armazenamento</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Espaço Usado</p>
                            <p className="text-2xl font-bold">{formatBytes(storageUsage.used_space)}</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Espaço Total</p>
                            <p className="text-2xl font-bold">{formatBytes(storageUsage.total_space)}</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Disponível</p>
                            <p className="text-2xl font-bold">{formatBytes(storageUsage.available_space)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uso do Armazenamento</span>
                        <span>{Math.round((storageUsage.used_space / storageUsage.total_space) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(storageUsage.used_space / storageUsage.total_space) * 100} 
                        className="w-full" 
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Armazenamento em Nuvem */}
        <TabsContent value="cloud">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Armazenamento em Nuvem
              </CardTitle>
              <CardDescription>
                Configure a integração com serviços de nuvem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={cloudForm.handleSubmit(handleSaveCloudStorage)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provedor</Label>
                    <Select
                      value={cloudForm.watch('provider')}
                      onValueChange={(value) => cloudForm.setValue('provider', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">Amazon S3</SelectItem>
                        <SelectItem value="google">Google Cloud Storage</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        <SelectItem value="dropbox">Dropbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="access_key">Chave de Acesso</Label>
                      <Input
                        id="access_key"
                        type="password"
                        {...cloudForm.register('access_key')}
                        placeholder="Sua chave de acesso"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secret_key">Chave Secreta</Label>
                      <Input
                        id="secret_key"
                        type="password"
                        {...cloudForm.register('secret_key')}
                        placeholder="Sua chave secreta"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bucket_name">Nome do Bucket</Label>
                      <Input
                        id="bucket_name"
                        {...cloudForm.register('bucket_name')}
                        placeholder="dataclinica-backups"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Região (opcional)</Label>
                      <Input
                        id="region"
                        {...cloudForm.register('region')}
                        placeholder="us-east-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint Personalizado (opcional)</Label>
                    <Input
                      id="endpoint"
                      {...cloudForm.register('endpoint')}
                      placeholder="https://s3.amazonaws.com"
                    />
                  </div>
                </div>

                {/* Teste de Conexão */}
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Teste de Conexão</h3>
                      <p className="text-sm text-muted-foreground">
                        Verifique se as credenciais estão corretas
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestCloudConnection}
                      disabled={isTestingConnection}
                    >
                      {isTestingConnection ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Testar Conexão
                    </Button>
                  </div>

                  {connectionTestResult && (
                    <Alert className={connectionTestResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      {connectionTestResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertTitle>
                        {connectionTestResult.success ? 'Conexão Bem-sucedida' : 'Falha na Conexão'}
                      </AlertTitle>
                      <AlertDescription>
                        {connectionTestResult.message}
                        {connectionTestResult.latency && (
                          <span className="block mt-1">
                            Latência: {connectionTestResult.latency}ms
                          </span>
                        )}
                        {connectionTestResult.available_space && (
                          <span className="block mt-1">
                            Espaço disponível: {formatBytes(connectionTestResult.available_space)}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestCloudConnection}
                    disabled={isTestingConnection}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações sobre backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(handleSaveNotifications)} className="space-y-6">
                {/* Email */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Email</h3>
                    </div>
                    <Switch
                      checked={notificationForm.watch('email_enabled')}
                      onCheckedChange={(checked) => notificationForm.setValue('email_enabled', checked)}
                    />
                  </div>
                  
                  {notificationForm.watch('email_enabled') && (
                    <div className="space-y-2">
                      <Label htmlFor="email_recipients">Destinatários</Label>
                      <Textarea
                        id="email_recipients"
                        {...notificationForm.register('email_recipients')}
                        placeholder="admin@dataclinica.com, backup@dataclinica.com"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">
                        Separe múltiplos emails com vírgula
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* SMS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">SMS</h3>
                    </div>
                    <Switch
                      checked={notificationForm.watch('sms_enabled')}
                      onCheckedChange={(checked) => notificationForm.setValue('sms_enabled', checked)}
                    />
                  </div>
                  
                  {notificationForm.watch('sms_enabled') && (
                    <div className="space-y-2">
                      <Label htmlFor="sms_recipients">Números de Telefone</Label>
                      <Textarea
                        id="sms_recipients"
                        {...notificationForm.register('sms_recipients')}
                        placeholder="+5511999999999, +5511888888888"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">
                        Separe múltiplos números com vírgula (formato internacional)
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Webhook */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Webhook</h3>
                    </div>
                    <Switch
                      checked={notificationForm.watch('webhook_enabled')}
                      onCheckedChange={(checked) => notificationForm.setValue('webhook_enabled', checked)}
                    />
                  </div>
                  
                  {notificationForm.watch('webhook_enabled') && (
                    <div className="space-y-2">
                      <Label htmlFor="webhook_url">URL do Webhook</Label>
                      <Input
                        id="webhook_url"
                        {...notificationForm.register('webhook_url')}
                        placeholder="https://api.exemplo.com/webhook/backup"
                      />
                      <p className="text-sm text-muted-foreground">
                        URL que receberá notificações via POST
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Tipos de Notificação */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quando Notificar</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">Backup Bem-sucedido</Label>
                        <p className="text-sm text-muted-foreground">Notificar quando backup for concluído com sucesso</p>
                      </div>
                      <Switch
                        checked={notificationForm.watch('notify_on_success')}
                        onCheckedChange={(checked) => notificationForm.setValue('notify_on_success', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">Backup com Falha</Label>
                        <p className="text-sm text-muted-foreground">Notificar quando backup falhar</p>
                      </div>
                      <Switch
                        checked={notificationForm.watch('notify_on_failure')}
                        onCheckedChange={(checked) => notificationForm.setValue('notify_on_failure', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">Avisos</Label>
                        <p className="text-sm text-muted-foreground">Notificar sobre avisos e problemas menores</p>
                      </div>
                      <Switch
                        checked={notificationForm.watch('notify_on_warning')}
                        onCheckedChange={(checked) => notificationForm.setValue('notify_on_warning', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Notificações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas de Notificação */}
        <TabsContent value="advanced">
          <BackupNotificationSettings
            userId={backupSettings?.user_id}
            clinicId={backupSettings?.clinic_id}
            onSettingsChange={(settings) => {
              console.log('Configurações de notificação atualizadas:', settings);
            }}
          />
        </TabsContent>

        {/* Manutenção */}
        <TabsContent value="maintenance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Manutenção do Sistema
                </CardTitle>
                <CardDescription>
                  Ferramentas para manutenção e otimização do sistema de backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Limpeza de Backups */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Limpeza de Backups Antigos</h3>
                      <p className="text-sm text-muted-foreground">
                        Remove backups que excedem o período de retenção configurado
                      </p>
                    </div>
                    <Button onClick={handleCleanupOldBackups} variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Executar Limpeza
                    </Button>
                  </div>

                  {/* Verificação de Integridade */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Verificação de Integridade</h3>
                      <p className="text-sm text-muted-foreground">
                        Verifica a integridade de todos os backups armazenados
                      </p>
                    </div>
                    <Button onClick={handleVerifyBackups} variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Verificar Integridade
                    </Button>
                  </div>

                  {/* Otimização de Armazenamento */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Otimização de Armazenamento</h3>
                      <p className="text-sm text-muted-foreground">
                        Otimiza o uso do espaço de armazenamento removendo duplicatas
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      <Database className="h-4 w-4 mr-2" />
                      Em Breve
                    </Button>
                  </div>

                  {/* Teste de Restauração */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Teste de Restauração</h3>
                      <p className="text-sm text-muted-foreground">
                        Executa um teste de restauração para validar os backups
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      <TestTube className="h-4 w-4 mr-2" />
                      Em Breve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas de Manutenção */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Backups Corrompidos</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Limpezas Executadas</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-sm text-muted-foreground">Taxa de Integridade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}