'use client'

import { useState, useMemo } from 'react'
import { 
  RotateCcw, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Eye, 
  Play,
  Pause,
  Square,
  RefreshCw,
  Archive,
  Database,
  FileText,
  HardDrive,
  Cloud,
  Users,
  Settings,
  ChevronRight,
  Download,
  Shield,
  History,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BackupNotificationCenter from '@/components/backup/BackupNotificationCenter'
import { useRestore, useCancelRestore } from '@/hooks/useRestore'
import { useBackups } from '@/hooks/useBackup'
import { RestoreWizard } from '@/components/backup/RestoreWizard'
import { toast } from 'sonner'
import { formatBytes, formatDate, formatDuration } from '@/lib/utils'
import type { RestoreJob, RestoreStatus, BackupType } from '@/types/backup'

interface RestoreFilters {
  search: string
  status: RestoreStatus | 'all'
  dateRange: 'today' | 'week' | 'month' | 'all'
  sortBy: 'createdAt' | 'backupId' | 'progress'
  sortOrder: 'asc' | 'desc'
}

interface RestoreJobDetailsProps {
  job: RestoreJob
  onClose: () => void
}

function RestoreJobDetails({ job, onClose }: RestoreJobDetailsProps) {
  const getStatusIcon = (status: RestoreStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(job.status)}
          <div>
            <h3 className="text-lg font-semibold">Restauração #{job.id.slice(0, 8)}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(job.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
          {job.status === 'completed' ? 'Concluída' : 
           job.status === 'failed' ? 'Falhou' :
           job.status === 'in_progress' ? 'Em Progresso' : 
           job.status === 'paused' ? 'Pausada' : 'Cancelada'}
        </Badge>
      </div>

      {/* Informações do Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup de Origem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Nome do Backup</Label>
              <p className="text-sm text-muted-foreground">Backup {job.backupId.slice(0, 8)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">ID do Backup</Label>
              <p className="text-sm text-muted-foreground font-mono">{job.backup_id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Escopo</Label>
              <p className="text-sm text-muted-foreground">
                {job.type === 'full' ? 'Restauração Completa' :
                 job.type === 'partial' ? 'Restauração Parcial' : 'Arquivos Específicos'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Destino</Label>
              <p className="text-sm text-muted-foreground">{job.target_path || 'Padrão'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progresso */}
      {job.progress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progresso da Restauração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso Geral</span>
                  <span>{job.progress.percentage}%</span>
                </div>
                <Progress value={job.progress.percentage} className="w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Etapa Atual</Label>
                  <p className="text-sm text-muted-foreground">{job.progress.stage}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Processado</Label>
                  <p className="text-sm text-muted-foreground">
                    {job.progress.current} / {job.progress.total}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tempo Estimado</Label>
                  <p className="text-sm text-muted-foreground">
                    {job.progress.estimated_time_remaining ? 
                      formatDuration(job.progress.estimated_time_remaining) : 'Calculando...'}
                  </p>
                </div>
              </div>

              {job.progress.current_file && (
                <div>
                  <Label className="text-sm font-medium">Arquivo Atual</Label>
                  <p className="text-sm text-muted-foreground font-mono">{job.progress.current_file}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Módulos Selecionados */}
      {job.selected_modules && job.selected_modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Módulos Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {job.selected_modules.map((module) => (
                <Badge key={module} variant="outline" className="justify-center">
                  {module}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Sobrescrever Existentes</Label>
              <p className="text-sm text-muted-foreground">
                {job.overwrite_existing ? 'Sim' : 'Não'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Validar Integridade</Label>
              <p className="text-sm text-muted-foreground">
                {job.validate_integrity ? 'Sim' : 'Não'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Criar Backup</Label>
              <p className="text-sm text-muted-foreground">
                {job.create_backup_before_restore ? 'Sim' : 'Não'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Notificar ao Concluir</Label>
              <p className="text-sm text-muted-foreground">
                {job.notify_on_completion ? 'Sim' : 'Não'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs de Erro */}
      {job.error_message && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro na Restauração</AlertTitle>
          <AlertDescription>
            {job.error_message}
          </AlertDescription>
        </Alert>
      )}

      {/* Metadados */}
      {job.metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadados</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(job.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function RestorePage() {
  const [filters, setFilters] = useState<RestoreFilters>({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [selectedJob, setSelectedJob] = useState<RestoreJob | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('active')

  const { data: restoreHistory, isLoading: restoreLoading, error: restoreError } = useRestoreJobs()
  const { data: backups, isLoading: backupsLoading, error: backupsError } = useBackups()
  const cancelRestoreMutation = useCancelRestore()

  // Filtrar e ordenar jobs de restauração
  const filteredJobs = useMemo(() => {
    let jobs: RestoreJob[] = []
    
    if (activeTab === 'active') {
      jobs = restoreHistory?.filter((j: RestoreJob) => j.status === 'running') || []
    } else {
      jobs = restoreHistory || []
    }

    let filtered = jobs.filter((job) => {
      // Filtro de busca
      if (filters.search && !job.backupId.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Filtro de status
      if (filters.status !== 'all' && job.status !== filters.status) {
        return false
      }

      // Filtro de data
      if (filters.dateRange !== 'all') {
        const now = new Date()
        const jobDate = new Date(job.createdAt)
        const diffTime = now.getTime() - jobDate.getTime()
        const diffDays = diffTime / (1000 * 3600 * 24)

        switch (filters.dateRange) {
          case 'today':
            if (diffDays > 1) return false
            break
          case 'week':
            if (diffDays > 7) return false
            break
          case 'month':
            if (diffDays > 30) return false
            break
        }
      }

      return true
    })

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (filters.sortBy) {
        case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
          break
        case 'backupId':
        aValue = a.backupId.toLowerCase()
        bValue = b.backupId.toLowerCase()
          break
        case 'progress':
          aValue = a.progress?.percentage || 0
          bValue = b.progress?.percentage || 0
          break
        default:
          return 0
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [restoreHistory, filters, activeTab])

  const getStatusIcon = (status: RestoreStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const handleCancel = async (job: RestoreJob) => {
    if (!confirm(`Tem certeza que deseja cancelar a restauração do backup ${job.backupId.slice(0, 8)}?`)) {
      return
    }

    try {
      cancelRestoreMutation.mutate(job.id, {
        onSuccess: () => {
          toast.success('Restauração cancelada com sucesso!')
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Erro ao cancelar restauração')
        }
      })
    } catch (error) {
      toast.error('Erro ao cancelar restauração')
      console.error('Erro ao cancelar restauração:', error)
    }
  }

  const handleViewDetails = (job: RestoreJob) => {
    setSelectedJob(job)
    setIsDetailsOpen(true)
  }

  const handleRefresh = () => {
    // Refresh será feito automaticamente pelo React Query
    window.location.reload()
    toast.success('Lista atualizada!')
  }

  const handleNewRestore = () => {
    setIsWizardOpen(true)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restauração de Dados</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore processos de restauração
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BackupNotificationCenter />
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleNewRestore}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Nova Restauração
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {restoreHistory?.filter((j: RestoreJob) => j.status === 'running').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Ativas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {restoreHistory?.filter((j: RestoreJob) => j.status === 'completed').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {restoreHistory?.filter((j: RestoreJob) => j.status === 'failed').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Falharam</p>
              </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {backups?.filter((b: Backup) => b.status === 'completed').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Backups Disponíveis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta para Restaurações Ativas */}
      {restoreHistory?.filter((j: RestoreJob) => j.status === 'running').length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Restaurações em Andamento</AlertTitle>
          <AlertDescription>
            Existem {restoreHistory?.filter((j: RestoreJob) => j.status === 'running').length} restauração(ões) em andamento. 
            Monitore o progresso na aba "Ativas".
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Loader2 className="h-4 w-4" />
            Ativas ({restoreHistory?.filter((j: RestoreJob) => j.status === 'running').length || 0})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico ({restoreHistory?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Filtros para Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Busca */}
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nome do backup..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                  <Label htmlFor="sortBy">Ordenar por</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Data</SelectItem>
                <SelectItem value="backupId">ID do Backup</SelectItem>
                      <SelectItem value="progress">Progresso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Restaurações Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5" />
                Restaurações Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {restoreLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Carregando restaurações...</span>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8">
                  <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhuma restauração ativa</p>
                  <p className="text-muted-foreground mb-4">Inicie uma nova restauração para começar</p>
                  <Button onClick={handleNewRestore}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Nova Restauração
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(job.status)}
                            <div>
                              <h4 className="font-medium">Backup {job.backupId.slice(0, 8)}</h4>
                              <p className="text-sm text-muted-foreground">
                                Iniciada em {formatDate(job.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(job)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </Button>
                            {job.status === 'running' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancel(job)}
                              >
                                <Square className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>

                        {job.progress && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{job.progress.current}</span>
                              <span>{job.progress.percentage}%</span>
                            </div>
                            <Progress value={job.progress.percentage} className="w-full" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                {job.progress.current} / {job.progress.total}
                              </span>
                              <span>
                                Progresso: {job.progress.stage}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filtros para Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Busca */}
                <div className="space-y-2">
                  <Label htmlFor="search-history">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-history"
                      placeholder="Nome do backup..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status-history">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Período */}
                <div className="space-y-2">
                  <Label htmlFor="dateRange-history">Período</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última Semana</SelectItem>
                      <SelectItem value="month">Último Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                  <Label htmlFor="sortBy-history">Ordenar por</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Data</SelectItem>
                <SelectItem value="backupId">ID do Backup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Restaurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Carregando histórico...</span>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhuma restauração encontrada</p>
                  <p className="text-muted-foreground">Tente ajustar os filtros</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Backup</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Escopo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">Backup {job.backupId.slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground">#{job.id.slice(0, 8)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(job.status)}
                              <span className="text-sm">
                                {job.status === 'completed' ? 'Concluída' :
                                 job.status === 'failed' ? 'Falhou' :
                                 job.status === 'cancelled' ? 'Cancelada' : job.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {job.type === 'full' ? 'Completa' :
                               job.type === 'partial' ? 'Parcial' : 'Arquivos'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{formatDate(job.createdAt)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(job.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {job.completedAt ? 
                              formatDuration(
                                new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()
                              ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(job)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Restauração</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a restauração selecionada
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <RestoreJobDetails 
              job={selectedJob} 
              onClose={() => setIsDetailsOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Wizard de Nova Restauração */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Restauração</DialogTitle>
            <DialogDescription>
              Assistente para configurar uma nova restauração de dados
            </DialogDescription>
          </DialogHeader>
          <RestoreWizard 
            onComplete={() => setIsWizardOpen(false)}
            onCancel={() => setIsWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}