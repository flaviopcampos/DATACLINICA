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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  History, 
  Download,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  MoreHorizontal,
  RefreshCw,
  FileText,
  Database,
  Archive
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Metadata moved to layout.tsx since this is now a Client Component

function BackupHistorySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-8 w-20 mt-2" />
              <Skeleton className="h-4 w-24 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BackupHistoryContent() {
  const handleRefresh = () => {
    console.log('Refreshing backup history...')
  }

  const handleDownloadBackup = (backupId: string) => {
    console.log('Downloading backup:', backupId)
  }

  const handleDeleteBackup = (backupId: string) => {
    console.log('Deleting backup:', backupId)
  }

  const handleViewDetails = (backupId: string) => {
    console.log('Viewing backup details:', backupId)
  }

  const handleRestoreBackup = (backupId: string) => {
    console.log('Restoring backup:', backupId)
  }

  // Mock data para demonstração
  const backupHistory = [
    {
      id: '1',
      name: 'Backup Completo - Sistema',
      type: 'Completo',
      status: 'Concluído',
      date: '2024-01-15',
      time: '02:00:15',
      duration: '45m 32s',
      size: '2.4 GB',
      modules: ['Pacientes', 'Agendamentos', 'Usuários', 'Configurações'],
      location: 'Local + Nuvem'
    },
    {
      id: '2',
      name: 'Backup Incremental - Dados',
      type: 'Incremental',
      status: 'Concluído',
      date: '2024-01-14',
      time: '18:00:08',
      duration: '12m 45s',
      size: '156 MB',
      modules: ['Pacientes', 'Agendamentos'],
      location: 'Local'
    },
    {
      id: '3',
      name: 'Backup Manual - Migração',
      type: 'Manual',
      status: 'Falhado',
      date: '2024-01-13',
      time: '14:30:22',
      duration: '8m 15s',
      size: '0 MB',
      modules: ['Todos'],
      location: 'Nuvem',
      error: 'Erro de conexão com o armazenamento'
    },
    {
      id: '4',
      name: 'Backup Completo - Sistema',
      type: 'Completo',
      status: 'Concluído',
      date: '2024-01-08',
      time: '02:00:12',
      duration: '42m 18s',
      size: '2.3 GB',
      modules: ['Pacientes', 'Agendamentos', 'Usuários', 'Configurações'],
      location: 'Local + Nuvem'
    },
    {
      id: '5',
      name: 'Backup Incremental - Dados',
      type: 'Incremental',
      status: 'Concluído',
      date: '2024-01-07',
      time: '18:00:05',
      duration: '15m 22s',
      size: '203 MB',
      modules: ['Pacientes', 'Agendamentos'],
      location: 'Local'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>
      case 'Falhado':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Falhado</Badge>
      case 'Em Progresso':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Em Progresso</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Completo':
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><Database className="h-3 w-3 mr-1" />Completo</Badge>
      case 'Incremental':
        return <Badge variant="outline" className="text-green-600 border-green-200"><Archive className="h-3 w-3 mr-1" />Incremental</Badge>
      case 'Manual':
        return <Badge variant="outline" className="text-purple-600 border-purple-200"><FileText className="h-3 w-3 mr-1" />Manual</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
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
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Backups</h1>
          <p className="text-gray-600 mt-2">
            Visualize e gerencie o histórico completo de backups do sistema
          </p>
        </div>
        <Button onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
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
                Histórico
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Total</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">127</div>
              <p className="text-sm text-gray-600">Backups realizados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sucesso</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">119</div>
              <p className="text-sm text-gray-600">Bem-sucedidos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Falhas</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="text-sm text-gray-600">Com falhas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Armazenamento</Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">45.2 GB</div>
              <p className="text-sm text-gray-600">Total usado</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Nome do backup..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="failed">Falhado</SelectItem>
                  <SelectItem value="in-progress">Em Progresso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="full">Completo</SelectItem>
                  <SelectItem value="incremental">Incremental</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Período</Label>
              <Select defaultValue="30days">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="90days">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>
            Lista completa de todos os backups realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome / Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{backup.name}</div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(backup.type)}
                        <span className="text-xs text-gray-500">
                          {backup.modules.join(', ')}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(backup.status)}
                      {backup.error && (
                        <div className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {backup.error}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {backup.date}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {backup.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{backup.duration}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{backup.size}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {backup.location}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(backup.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {backup.status === 'Concluído' && (
                          <>
                            <DropdownMenuItem onClick={() => handleDownloadBackup(backup.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRestoreBackup(backup.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Restaurar
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações sobre Backups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Tipos de Backup</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Completo:</strong> Backup de todos os dados do sistema</li>
                <li>• <strong>Incremental:</strong> Backup apenas das alterações recentes</li>
                <li>• <strong>Manual:</strong> Backup executado manualmente pelo usuário</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Retenção de Dados</h4>
              <p className="text-sm text-gray-600">
                Backups são mantidos conforme a política de retenção configurada. 
                Backups antigos são automaticamente removidos para economizar espaço.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Dicas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Verifique regularmente se os backups estão sendo executados com sucesso 
                e teste a restauração periodicamente.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <h4 className="font-medium">Recomendações</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mantenha múltiplas cópias em locais diferentes</li>
                <li>• Teste a restauração mensalmente</li>
                <li>• Monitore o espaço de armazenamento</li>
                <li>• Configure notificações para falhas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BackupHistoryPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Suspense fallback={<BackupHistorySkeleton />}>
        <BackupHistoryContent />
      </Suspense>
    </div>
  )
}