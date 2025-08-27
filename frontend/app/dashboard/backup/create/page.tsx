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
  Upload,
  FileText,
  Users,
  Calendar,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react'
import Link from 'next/link'

// Metadata moved to layout.tsx since this is now a Client Component

function CreateBackupSkeleton() {
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

function CreateBackupForm() {
  // Mock data - em produção viria de hooks/API
  const backupModules = [
    {
      id: 'patients',
      name: 'Pacientes',
      description: 'Dados dos pacientes, histórico médico e documentos',
      size: '450 MB',
      enabled: true,
      critical: true
    },
    {
      id: 'appointments',
      name: 'Agendamentos',
      description: 'Consultas agendadas, histórico de agendamentos',
      size: '120 MB',
      enabled: true,
      critical: true
    },
    {
      id: 'users',
      name: 'Usuários',
      description: 'Dados dos usuários, permissões e configurações',
      size: '25 MB',
      enabled: true,
      critical: true
    },
    {
      id: 'settings',
      name: 'Configurações',
      description: 'Configurações do sistema e personalizações',
      size: '5 MB',
      enabled: false,
      critical: false
    },
    {
      id: 'logs',
      name: 'Logs',
      description: 'Logs de sistema e auditoria',
      size: '200 MB',
      enabled: false,
      critical: false
    },
    {
      id: 'files',
      name: 'Arquivos',
      description: 'Documentos, imagens e outros arquivos',
      size: '1.2 GB',
      enabled: false,
      critical: false
    }
  ]

  const storageOptions = [
    {
      id: 'local',
      name: 'Armazenamento Local',
      description: 'Salvar no servidor local',
      available: '50 GB',
      recommended: true
    },
    {
      id: 'cloud',
      name: 'Nuvem (AWS S3)',
      description: 'Salvar na nuvem AWS',
      available: 'Ilimitado',
      recommended: false
    },
    {
      id: 'external',
      name: 'Disco Externo',
      description: 'Salvar em disco externo',
      available: '2 TB',
      recommended: false
    }
  ]

  const handleCreateBackup = () => {
    // Implementar lógica de criação de backup
    console.log('Creating backup...')
  }

  const handleScheduleBackup = () => {
    // Implementar lógica de agendamento
    console.log('Scheduling backup...')
  }

  const getTotalSize = () => {
    const enabledModules = backupModules.filter(module => module.enabled)
    // Simulação de cálculo de tamanho total
    return '595 MB'
  }

  const getEstimatedTime = () => {
    // Simulação de tempo estimado baseado no tamanho
    return '8-12 minutos'
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
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Backup</h1>
          <p className="text-gray-600 mt-2">
            Configure os dados que deseja incluir no backup
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
                Criar Backup
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Defina o nome e descrição do backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-name">Nome do Backup</Label>
                <Input 
                  id="backup-name" 
                  placeholder="Ex: Backup Completo - Janeiro 2024"
                  defaultValue={`Backup Manual - ${new Date().toLocaleDateString('pt-BR')}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-description">Descrição (Opcional)</Label>
                <Textarea 
                  id="backup-description" 
                  placeholder="Descreva o propósito deste backup..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Tipo de Backup
              </CardTitle>
              <CardDescription>
                Escolha o tipo de backup a ser executado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="full" className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="full" className="font-medium cursor-pointer">
                      Backup Completo
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Inclui todos os dados selecionados. Recomendado para backup inicial ou periódico.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Mais lento
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        Maior espaço
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="incremental" id="incremental" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="incremental" className="font-medium cursor-pointer">
                      Backup Incremental
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Inclui apenas dados modificados desde o último backup. Mais rápido e eficiente.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Mais rápido
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        Menor espaço
                      </span>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Seleção de Módulos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Módulos para Backup
              </CardTitle>
              <CardDescription>
                Selecione quais dados incluir no backup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupModules.map((module) => (
                  <div key={module.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox 
                      id={module.id} 
                      defaultChecked={module.enabled}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={module.id} className="font-medium cursor-pointer">
                          {module.name}
                        </Label>
                        {module.critical && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            Crítico
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Tamanho: {module.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Destino do Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Destino do Backup
              </CardTitle>
              <CardDescription>
                Escolha onde salvar o arquivo de backup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="local" className="space-y-4">
                {storageOptions.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </Label>
                        {option.recommended && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Disponível: {option.available}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Resumo do Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Módulos selecionados:</span>
                  <span className="font-medium">3 de 6</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tamanho estimado:</span>
                  <span className="font-medium">{getTotalSize()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tempo estimado:</span>
                  <span className="font-medium">{getEstimatedTime()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Destino:</span>
                  <span className="font-medium">Local</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Certifique-se de que há espaço suficiente no destino selecionado antes de iniciar o backup.
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Backups podem impactar a performance do sistema durante a execução.
            </AlertDescription>
          </Alert>

          {/* Ações */}
          <div className="space-y-3">
            <Button onClick={handleCreateBackup} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Iniciar Backup Agora
            </Button>
            <Button onClick={handleScheduleBackup} variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar para Mais Tarde
            </Button>
          </div>

          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dicas de Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                <li>Execute backups completos semanalmente</li>
                <li>Backups incrementais podem ser diários</li>
                <li>Mantenha pelo menos 3 backups recentes</li>
                <li>Teste a restauração periodicamente</li>
                <li>Armazene backups em locais seguros</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CreateBackupPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Suspense fallback={<CreateBackupSkeleton />}>
        <CreateBackupForm />
      </Suspense>
    </div>
  )
}