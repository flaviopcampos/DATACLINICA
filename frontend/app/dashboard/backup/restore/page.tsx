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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  Database, 
  Download,
  FileText,
  Users,
  Calendar,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Upload,
  RefreshCw,
  Shield,
  Eye
} from 'lucide-react'
import Link from 'next/link'

// Metadata moved to layout.tsx since this is now a Client Component

function RestoreBackupSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, j) => (
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

function RestoreBackupForm() {
  // Mock data - em produção viria de hooks/API
  const availableBackups = [
    {
      id: 'backup-001',
      name: 'Backup Completo - 15/01/2024',
      description: 'Backup completo com todos os módulos',
      date: '2024-01-15T10:30:00Z',
      size: '1.2 GB',
      type: 'Completo',
      status: 'Válido',
      modules: ['patients', 'appointments', 'users', 'settings'],
      location: 'Local',
      verified: true
    },
    {
      id: 'backup-002',
      name: 'Backup Incremental - 14/01/2024',
      description: 'Backup incremental - dados modificados',
      date: '2024-01-14T18:00:00Z',
      size: '250 MB',
      type: 'Incremental',
      status: 'Válido',
      modules: ['patients', 'appointments'],
      location: 'Local',
      verified: true
    },
    {
      id: 'backup-003',
      name: 'Backup Manual - 10/01/2024',
      description: 'Backup manual antes da atualização',
      date: '2024-01-10T14:20:00Z',
      size: '980 MB',
      type: 'Completo',
      status: 'Válido',
      modules: ['patients', 'appointments', 'users'],
      location: 'Nuvem',
      verified: false
    },
    {
      id: 'backup-004',
      name: 'Backup Automático - 05/01/2024',
      description: 'Backup automático semanal',
      date: '2024-01-05T02:00:00Z',
      size: '1.1 GB',
      type: 'Completo',
      status: 'Expirado',
      modules: ['patients', 'appointments', 'users', 'settings'],
      location: 'Local',
      verified: true
    }
  ]

  const restoreOptions = [
    {
      id: 'full',
      name: 'Restauração Completa',
      description: 'Substitui todos os dados atuais pelos do backup',
      risk: 'Alto',
      recommended: false
    },
    {
      id: 'selective',
      name: 'Restauração Seletiva',
      description: 'Restaura apenas módulos específicos',
      risk: 'Médio',
      recommended: true
    },
    {
      id: 'merge',
      name: 'Mesclagem de Dados',
      description: 'Mescla dados do backup com os atuais',
      risk: 'Baixo',
      recommended: false
    }
  ]

  const handleRestoreBackup = () => {
    // Implementar lógica de restauração
    console.log('Restoring backup...')
  }

  const handleVerifyBackup = (backupId: string) => {
    // Implementar verificação de integridade
    console.log('Verifying backup:', backupId)
  }

  const handlePreviewBackup = (backupId: string) => {
    // Implementar preview do backup
    console.log('Previewing backup:', backupId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Válido':
        return 'bg-green-100 text-green-800'
      case 'Expirado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Alto':
        return 'bg-red-100 text-red-800'
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800'
      case 'Baixo':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Restaurar Backup</h1>
          <p className="text-gray-600 mt-2">
            Selecione um backup para restaurar seus dados
          </p>
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
                Restaurar
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Alerta de Segurança */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Atenção:</strong> A restauração de backup pode sobrescrever dados atuais. 
          Recomendamos criar um backup dos dados atuais antes de prosseguir.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de Backups */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backups Disponíveis
              </CardTitle>
              <CardDescription>
                Selecione o backup que deseja restaurar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup className="space-y-4">
                {availableBackups.map((backup) => (
                  <div key={backup.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={backup.id} id={backup.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={backup.id} className="font-medium cursor-pointer">
                              {backup.name}
                            </Label>
                            <Badge className={getStatusColor(backup.status)}>
                              {backup.status}
                            </Badge>
                            <Badge variant="outline">
                              {backup.type}
                            </Badge>
                            {backup.verified && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreviewBackup(backup.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!backup.verified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVerifyBackup(backup.id)}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{backup.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Data:</span>
                            <br />
                            {formatDate(backup.date)}
                          </div>
                          <div>
                            <span className="font-medium">Tamanho:</span>
                            <br />
                            {backup.size}
                          </div>
                          <div>
                            <span className="font-medium">Local:</span>
                            <br />
                            {backup.location}
                          </div>
                          <div>
                            <span className="font-medium">Módulos:</span>
                            <br />
                            {backup.modules.length} módulos
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {backup.modules.map((module) => (
                            <Badge key={module} variant="secondary" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Opções de Restauração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tipo de Restauração
              </CardTitle>
              <CardDescription>
                Escolha como os dados serão restaurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="selective" className="space-y-4">
                {restoreOptions.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </Label>
                        <Badge className={getRiskColor(option.risk)}>
                          Risco {option.risk}
                        </Badge>
                        {option.recommended && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Módulos para Restaurar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Módulos para Restaurar
              </CardTitle>
              <CardDescription>
                Selecione quais dados restaurar (apenas para restauração seletiva)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: 'patients', name: 'Pacientes', description: 'Dados dos pacientes e histórico médico' },
                  { id: 'appointments', name: 'Agendamentos', description: 'Consultas e agendamentos' },
                  { id: 'users', name: 'Usuários', description: 'Usuários e permissões' },
                  { id: 'settings', name: 'Configurações', description: 'Configurações do sistema' }
                ].map((module) => (
                  <div key={module.id} className="flex items-center space-x-3">
                    <Checkbox id={module.id} defaultChecked />
                    <div>
                      <Label htmlFor={module.id} className="font-medium cursor-pointer">
                        {module.name}
                      </Label>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Resumo da Restauração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Resumo da Restauração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Backup selecionado:</span>
                  <span className="font-medium">Nenhum</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tipo de restauração:</span>
                  <span className="font-medium">Seletiva</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Módulos:</span>
                  <span className="font-medium">4 selecionados</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tempo estimado:</span>
                  <span className="font-medium">15-25 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A restauração pode levar alguns minutos dependendo do tamanho do backup.
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Recomendamos fazer um backup dos dados atuais antes da restauração.
            </AlertDescription>
          </Alert>

          {/* Ações */}
          <div className="space-y-3">
            <Button onClick={handleRestoreBackup} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Iniciar Restauração
            </Button>
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Backup Atual Primeiro
            </Button>
          </div>

          {/* Checklist de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Checklist de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'Backup dos dados atuais criado',
                  'Usuários notificados sobre a manutenção',
                  'Sistema em modo de manutenção',
                  'Backup verificado e íntegro'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`check-${index}`} />
                    <Label htmlFor={`check-${index}`} className="text-xs cursor-pointer">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                <li>A restauração pode demorar dependendo do tamanho</li>
                <li>O sistema ficará indisponível durante o processo</li>
                <li>Dados modificados após o backup serão perdidos</li>
                <li>Verifique a integridade antes de restaurar</li>
                <li>Mantenha logs da operação para auditoria</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function RestoreBackupPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Suspense fallback={<RestoreBackupSkeleton />}>
        <RestoreBackupForm />
      </Suspense>
    </div>
  )
}