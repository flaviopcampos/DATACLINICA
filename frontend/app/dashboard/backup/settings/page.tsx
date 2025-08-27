'use client'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Settings, 
  Clock,
  HardDrive,
  Cloud,
  Shield,
  Bell,
  Mail,
  Database,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  Calendar,
  Server
} from 'lucide-react'
import Link from 'next/link'

// Metadata moved to layout.tsx since this is now a Client Component

function BackupSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BackupSettingsForm() {
  const handleSaveSettings = () => {
    // Implementar salvamento das configurações
    console.log('Saving backup settings...')
  }

  const handleResetSettings = () => {
    // Implementar reset das configurações
    console.log('Resetting backup settings...')
  }

  const handleTestConnection = (type: string) => {
    // Implementar teste de conexão
    console.log('Testing connection:', type)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/backup">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações de Backup</h1>
          <p className="text-gray-600 mt-2">
            Configure as opções de backup automático e armazenamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link 
                href="/dashboard/backup" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Backup
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500">
                Configurações
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Agendamento
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Armazenamento
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Retenção
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Agendamento */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Backup Automático
              </CardTitle>
              <CardDescription>
                Configure quando os backups automáticos devem ser executados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Ativar Backup Automático</Label>
                  <p className="text-sm text-gray-600">Execute backups automaticamente conforme agendado</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Frequência do Backup Completo</Label>
                    <Select defaultValue="weekly">
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
                    <Label>Dia da Semana (Backup Completo)</Label>
                    <Select defaultValue="sunday">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Domingo</SelectItem>
                        <SelectItem value="monday">Segunda-feira</SelectItem>
                        <SelectItem value="tuesday">Terça-feira</SelectItem>
                        <SelectItem value="wednesday">Quarta-feira</SelectItem>
                        <SelectItem value="thursday">Quinta-feira</SelectItem>
                        <SelectItem value="friday">Sexta-feira</SelectItem>
                        <SelectItem value="saturday">Sábado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Horário do Backup Completo</Label>
                    <Input type="time" defaultValue="02:00" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Frequência do Backup Incremental</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="every6h">A cada 6 horas</SelectItem>
                        <SelectItem value="every12h">A cada 12 horas</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="disabled">Desabilitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Horário do Backup Incremental</Label>
                    <Input type="time" defaultValue="18:00" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Executar apenas em dias úteis</Label>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Backups automáticos são executados apenas quando o sistema está ativo. 
                  Horários são baseados no fuso horário do servidor.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Janela de Manutenção</CardTitle>
              <CardDescription>
                Defina períodos específicos para execução de backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Início da Janela</Label>
                  <Input type="time" defaultValue="22:00" />
                </div>
                <div className="space-y-2">
                  <Label>Fim da Janela</Label>
                  <Input type="time" defaultValue="06:00" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch />
                <Label>Executar backups apenas na janela de manutenção</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Armazenamento */}
        <TabsContent value="storage" className="space-y-6">
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Diretório de Backup</Label>
                <div className="flex gap-2">
                  <Input defaultValue="/var/backups/dataclinica" className="flex-1" />
                  <Button variant="outline">Procurar</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Limite de Espaço (GB)</Label>
                <Input type="number" defaultValue="100" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <Label>Compressão de backups</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch />
                <Label>Criptografia de backups</Label>
              </div>

              <Button variant="outline" onClick={() => handleTestConnection('local')}>
                <Server className="h-4 w-4 mr-2" />
                Testar Diretório
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Armazenamento em Nuvem
              </CardTitle>
              <CardDescription>
                Configure backup na nuvem (AWS S3, Google Cloud, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Ativar Backup na Nuvem</Label>
                  <p className="text-sm text-gray-600">Enviar backups para armazenamento em nuvem</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label>Provedor de Nuvem</Label>
                <Select defaultValue="aws">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">Amazon S3</SelectItem>
                    <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                    <SelectItem value="azure">Azure Blob Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Access Key ID</Label>
                  <Input type="password" placeholder="Sua Access Key" />
                </div>
                <div className="space-y-2">
                  <Label>Secret Access Key</Label>
                  <Input type="password" placeholder="Sua Secret Key" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Bucket/Container</Label>
                  <Input placeholder="nome-do-bucket" />
                </div>
                <div className="space-y-2">
                  <Label>Região</Label>
                  <Select defaultValue="us-east-1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="sa-east-1">South America (São Paulo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="outline" onClick={() => handleTestConnection('cloud')}>
                <Cloud className="h-4 w-4 mr-2" />
                Testar Conexão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retenção */}
        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Política de Retenção
              </CardTitle>
              <CardDescription>
                Configure por quanto tempo manter os backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Backups Completos</h4>
                  <div className="space-y-2">
                    <Label>Manter por (dias)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo de backups</Label>
                    <Input type="number" defaultValue="10" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Backups Incrementais</h4>
                  <div className="space-y-2">
                    <Label>Manter por (dias)</Label>
                    <Input type="number" defaultValue="7" />
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo de backups</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Limpeza Automática</h4>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Excluir backups expirados automaticamente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>Notificar antes de excluir backups</Label>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Backups excluídos não podem ser recuperados. Certifique-se de que as políticas 
                  de retenção atendem às suas necessidades de recuperação.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações de Backup
              </CardTitle>
              <CardDescription>
                Configure quando e como receber notificações sobre backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Eventos para Notificar</h4>
                <div className="space-y-3">
                  {[
                    { id: 'success', label: 'Backup concluído com sucesso', defaultChecked: false },
                    { id: 'failure', label: 'Falha no backup', defaultChecked: true },
                    { id: 'warning', label: 'Avisos durante o backup', defaultChecked: true },
                    { id: 'start', label: 'Início do backup', defaultChecked: false },
                    { id: 'cleanup', label: 'Limpeza de backups antigos', defaultChecked: false },
                    { id: 'storage', label: 'Espaço de armazenamento baixo', defaultChecked: true }
                  ].map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Switch defaultChecked={event.defaultChecked} />
                      <Label>{event.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Canais de Notificação</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>Webhook</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Emails para Notificação</Label>
                <Textarea 
                  placeholder="admin@dataclinica.com&#10;backup@dataclinica.com"
                  rows={3}
                />
                <p className="text-xs text-gray-500">Um email por linha</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança dos Backups
              </CardTitle>
              <CardDescription>
                Configure opções de segurança e criptografia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Criptografia</h4>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Criptografar backups</Label>
                </div>
                <div className="space-y-2">
                  <Label>Algoritmo de Criptografia</Label>
                  <Select defaultValue="aes256">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes256">AES-256</SelectItem>
                      <SelectItem value="aes128">AES-128</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chave de Criptografia</Label>
                  <div className="flex gap-2">
                    <Input type="password" placeholder="Digite a chave de criptografia" className="flex-1" />
                    <Button variant="outline">Gerar</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Verificação de Integridade</h4>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Verificar integridade após backup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>Gerar checksums MD5</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Gerar checksums SHA-256</Label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Controle de Acesso</h4>
                <div className="space-y-2">
                  <Label>Usuários Autorizados</Label>
                  <Textarea 
                    placeholder="admin&#10;backup-operator"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">Um usuário por linha</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Registrar todas as operações de backup</Label>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Mantenha as chaves de criptografia em local seguro. Sem elas, 
                  não será possível restaurar os backups criptografados.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function BackupSettingsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Suspense fallback={<BackupSettingsSkeleton />}>
        <BackupSettingsForm />
      </Suspense>
    </div>
  )
}