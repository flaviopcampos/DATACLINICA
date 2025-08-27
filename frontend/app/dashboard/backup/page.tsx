import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Database, 
  Download, 
  Upload,
  Settings,
  History,
  Shield,
  Clock,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sistema de Backup | DataClínica',
  description: 'Gerencie backups e recuperação de dados',
}

function BackupSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20" />
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

function BackupDashboard() {
  // Mock data - em produção viria de hooks/API
  const backupStats = {
    totalBackups: 45,
    successfulBackups: 42,
    failedBackups: 3,
    storageUsed: '2.3 GB'
  }

  const recentBackups = [
    {
      id: '1',
      name: 'Backup Completo - Pacientes',
      type: 'full',
      status: 'completed',
      size: '450 MB',
      createdAt: '2024-01-15T08:30:00Z',
      duration: '5m 23s'
    },
    {
      id: '2',
      name: 'Backup Incremental - Agendamentos',
      type: 'incremental',
      status: 'completed',
      size: '12 MB',
      createdAt: '2024-01-15T06:00:00Z',
      duration: '1m 15s'
    },
    {
      id: '3',
      name: 'Backup Completo - Sistema',
      type: 'full',
      status: 'running',
      size: '1.2 GB',
      createdAt: '2024-01-15T10:00:00Z',
      progress: 65
    }
  ]

  const scheduledBackups = [
    {
      id: '1',
      name: 'Backup Diário - Pacientes',
      schedule: 'Diário às 02:00',
      nextRun: '2024-01-16T02:00:00Z',
      enabled: true,
      lastRun: '2024-01-15T02:00:00Z',
      status: 'success'
    },
    {
      id: '2',
      name: 'Backup Semanal - Completo',
      schedule: 'Domingo às 01:00',
      nextRun: '2024-01-21T01:00:00Z',
      enabled: true,
      lastRun: '2024-01-14T01:00:00Z',
      status: 'success'
    },
    {
      id: '3',
      name: 'Backup Mensal - Arquivos',
      schedule: '1º dia do mês às 00:00',
      nextRun: '2024-02-01T00:00:00Z',
      enabled: false,
      lastRun: '2024-01-01T00:00:00Z',
      status: 'failed'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Em Execução</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <Database className="h-4 w-4" />
      case 'incremental':
        return <Upload className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `Em ${diffInHours}h`
    }
    return `Em ${Math.floor(diffInHours / 24)} dias`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Backup</h1>
          <p className="text-gray-600 mt-2">
            Gerencie backups automáticos e recuperação de dados
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/backup/create">
            <Button>
              <Database className="h-4 w-4 mr-2" />
              Novo Backup
            </Button>
          </Link>
          <Link href="/dashboard/backup/restore">
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          </Link>
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
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500">
                Backup
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupStats.totalBackups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bem-sucedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{backupStats.successfulBackups}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Falharam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold">{backupStats.failedBackups}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Armazenamento Usado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{backupStats.storageUsed}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de Status */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Último backup completo realizado há 2 horas. Sistema funcionando normalmente.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Backups Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Backups Recentes
              </CardTitle>
              <Link href="/dashboard/backup/history">
                <Button variant="ghost" size="sm">
                  Ver Todos
                </Button>
              </Link>
            </div>
            <CardDescription>
              Últimos backups executados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBackups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getTypeIcon(backup.type)}
                    </div>
                    <div>
                      <p className="font-medium">{backup.name}</p>
                      <p className="text-sm text-gray-600">
                        {backup.size} • {formatDate(backup.createdAt)}
                      </p>
                      {backup.status === 'running' && backup.progress && (
                        <div className="mt-2">
                          <Progress value={backup.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{backup.progress}% concluído</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(backup.status)}
                    {backup.duration && (
                      <p className="text-sm text-gray-600 mt-1">{backup.duration}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backups Agendados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Backups Agendados
              </CardTitle>
              <Link href="/dashboard/backup/schedule">
                <Button variant="ghost" size="sm">
                  Gerenciar
                </Button>
              </Link>
            </div>
            <CardDescription>
              Backups automáticos configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledBackups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{backup.name}</p>
                      <p className="text-sm text-gray-600">{backup.schedule}</p>
                      <p className="text-xs text-gray-500">
                        Próximo: {formatNextRun(backup.nextRun)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {backup.enabled ? (
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                      )}
                    </div>
                    {getStatusBadge(backup.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades do sistema de backup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/dashboard/backup/create">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Database className="h-6 w-6" />
                <span>Criar Backup</span>
              </Button>
            </Link>
            <Link href="/dashboard/backup/restore">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <RotateCcw className="h-6 w-6" />
                <span>Restaurar Dados</span>
              </Button>
            </Link>
            <Link href="/dashboard/backup/schedule">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span>Agendar Backup</span>
              </Button>
            </Link>
            <Link href="/dashboard/backup/settings">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Settings className="h-6 w-6" />
                <span>Configurações</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BackupPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Suspense fallback={<BackupSkeleton />}>
        <BackupDashboard />
      </Suspense>
    </div>
  )
}