'use client'

import { useState, useMemo } from 'react'
import { 
  History, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Eye, 
  MoreHorizontal,
  RefreshCw,
  Archive,
  Shield,
  HardDrive,
  Cloud,
  FileText,
  Database,
  Users,
  Settings,
  ChevronDown,
  ChevronUp
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import BackupNotificationCenter from '@/components/backup/BackupNotificationCenter'
import { useBackup } from '@/hooks/useBackup'
import { toast } from 'sonner'
import { formatBytes, formatDate, formatDuration } from '@/lib/utils'
import type { Backup, BackupStatus, BackupType } from '@/types/backup'

interface BackupFilters {
  search: string
  status: BackupStatus | 'all'
  type: BackupType | 'all'
  dateRange: 'today' | 'week' | 'month' | 'all'
  sortBy: 'created_at' | 'size' | 'duration' | 'name'
  sortOrder: 'asc' | 'desc'
}

interface BackupDetailsProps {
  backup: Backup
  onClose: () => void
}

function BackupDetails({ backup, onClose }: BackupDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTypeIcon = (type: BackupType) => {
    switch (type) {
      case 'full':
        return <Database className="h-4 w-4" />
      case 'incremental':
        return <Archive className="h-4 w-4" />
      case 'differential':
        return <FileText className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(backup.status)}
          <div>
            <h3 className="text-lg font-semibold">{backup.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(backup.created_at)}
            </p>
          </div>
        </div>
        <Badge variant={backup.status === 'completed' ? 'default' : backup.status === 'failed' ? 'destructive' : 'secondary'}>
          {backup.status === 'completed' ? 'Concluído' : 
           backup.status === 'failed' ? 'Falhou' :
           backup.status === 'in_progress' ? 'Em Progresso' : 'Cancelado'}
        </Badge>
      </div>

      {/* Informações Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              {getTypeIcon(backup.type)}
              <span className="font-medium">Tipo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {backup.type === 'full' ? 'Backup Completo' :
               backup.type === 'incremental' ? 'Backup Incremental' : 'Backup Diferencial'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <HardDrive className="h-4 w-4" />
              <span className="font-medium">Tamanho</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatBytes(backup.size)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Duração</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {backup.duration ? formatDuration(backup.duration) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              {backup.storage_location === 'local' ? <HardDrive className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
              <span className="font-medium">Localização</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {backup.storage_location === 'local' ? 'Armazenamento Local' : 'Nuvem'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso (se em andamento) */}
      {backup.status === 'in_progress' && backup.progress && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{backup.progress.percentage}%</span>
              </div>
              <Progress value={backup.progress.percentage} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{backup.progress.current_step}</span>
                <span>{formatBytes(backup.progress.processed_size)} / {formatBytes(backup.progress.total_size)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Módulos Incluídos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Módulos Incluídos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {backup.modules?.map((module) => (
              <Badge key={module.name} variant="outline" className="justify-center">
                {module.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes Técnicos */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
            <span>Detalhes Técnicos</span>
            {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">ID do Backup</Label>
              <p className="text-sm text-muted-foreground font-mono">{backup.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Caminho</Label>
              <p className="text-sm text-muted-foreground font-mono">{backup.file_path}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Checksum</Label>
              <p className="text-sm text-muted-foreground font-mono">{backup.checksum || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Compressão</Label>
              <p className="text-sm text-muted-foreground">
                {backup.compression_ratio ? `${(backup.compression_ratio * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>

          {backup.metadata && (
            <div>
              <Label className="text-sm font-medium">Metadados</Label>
              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(backup.metadata, null, 2)}
              </pre>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Logs de Erro */}
      {backup.error_message && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {backup.error_message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default function BackupHistoryPage() {
  const [filters, setFilters] = useState<BackupFilters>({
    search: '',
    status: 'all',
    type: 'all',
    dateRange: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const {
    backups,
    backupProgress,
    downloadBackup,
    deleteBackup,
    verifyBackup,
    cancelBackup,
    isLoading,
    refetch
  } = useBackup()

  // Filtrar e ordenar backups
  const filteredBackups = useMemo(() => {
    if (!backups) return []

    let filtered = backups.filter((backup) => {
      // Filtro de busca
      if (filters.search && !backup.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Filtro de status
      if (filters.status !== 'all' && backup.status !== filters.status) {
        return false
      }

      // Filtro de tipo
      if (filters.type !== 'all' && backup.type !== filters.type) {
        return false
      }

      // Filtro de data
      if (filters.dateRange !== 'all') {
        const now = new Date()
        const backupDate = new Date(backup.created_at)
        const diffTime = now.getTime() - backupDate.getTime()
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
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'duration':
          aValue = a.duration || 0
          bValue = b.duration || 0
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
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
  }, [backups, filters])

  const getStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTypeIcon = (type: BackupType) => {
    switch (type) {
      case 'full':
        return <Database className="h-4 w-4" />
      case 'incremental':
        return <Archive className="h-4 w-4" />
      case 'differential':
        return <FileText className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const handleDownload = async (backup: Backup) => {
    try {
      await downloadBackup(backup.id)
      toast.success('Download iniciado!')
    } catch (error) {
      toast.error('Erro ao baixar backup')
      console.error('Erro ao baixar backup:', error)
    }
  }

  const handleDelete = async (backup: Backup) => {
    if (!confirm(`Tem certeza que deseja excluir o backup "${backup.name}"?`)) {
      return
    }

    try {
      await deleteBackup(backup.id)
      toast.success('Backup excluído com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir backup')
      console.error('Erro ao excluir backup:', error)
    }
  }

  const handleVerify = async (backup: Backup) => {
    try {
      await verifyBackup(backup.id)
      toast.success('Verificação de integridade iniciada!')
    } catch (error) {
      toast.error('Erro ao verificar backup')
      console.error('Erro ao verificar backup:', error)
    }
  }

  const handleCancel = async (backup: Backup) => {
    try {
      await cancelBackup(backup.id)
      toast.success('Backup cancelado!')
    } catch (error) {
      toast.error('Erro ao cancelar backup')
      console.error('Erro ao cancelar backup:', error)
    }
  }

  const handleViewDetails = (backup: Backup) => {
    setSelectedBackup(backup)
    setIsDetailsOpen(true)
  }

  const handleRefresh = () => {
    refetch()
    toast.success('Lista atualizada!')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Backups</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os backups realizados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BackupNotificationCenter />
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="full">Completo</SelectItem>
                  <SelectItem value="incremental">Incremental</SelectItem>
                  <SelectItem value="differential">Diferencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-2">
              <Label htmlFor="dateRange">Período</Label>
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
          </div>

          <Separator className="my-4" />

          {/* Ordenação */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="sortBy">Ordenar por:</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Data</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="size">Tamanho</SelectItem>
                  <SelectItem value="duration">Duração</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="sortOrder">Ordem:</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Decrescente</SelectItem>
                  <SelectItem value="asc">Crescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{filteredBackups.length}</p>
              <p className="text-sm text-muted-foreground">Total de Backups</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredBackups.filter(b => b.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredBackups.filter(b => b.status === 'failed').length}
              </p>
              <p className="text-sm text-muted-foreground">Falharam</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredBackups.filter(b => b.status === 'in_progress').length}
              </p>
              <p className="text-sm text-muted-foreground">Em Progresso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Backups ({filteredBackups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando backups...</span>
            </div>
          ) : filteredBackups.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum backup encontrado</p>
              <p className="text-muted-foreground">Tente ajustar os filtros ou criar um novo backup</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBackups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(backup.type)}
                          <div>
                            <p className="font-medium">{backup.name}</p>
                            <p className="text-xs text-muted-foreground">{backup.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {backup.type === 'full' ? 'Completo' :
                           backup.type === 'incremental' ? 'Incremental' : 'Diferencial'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(backup.status)}
                          <span className="text-sm">
                            {backup.status === 'completed' ? 'Concluído' :
                             backup.status === 'failed' ? 'Falhou' :
                             backup.status === 'in_progress' ? 'Em Progresso' : 'Cancelado'}
                          </span>
                        </div>
                        {backup.status === 'in_progress' && backupProgress[backup.id] && (
                          <div className="mt-1">
                            <Progress 
                              value={backupProgress[backup.id].percentage} 
                              className="w-full h-1" 
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {backupProgress[backup.id].percentage}%
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatBytes(backup.size)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(backup.created_at)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(backup.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {backup.duration ? formatDuration(backup.duration) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(backup)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {backup.status === 'completed' && (
                              <>
                                <DropdownMenuItem onClick={() => handleDownload(backup)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleVerify(backup)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Verificar
                                </DropdownMenuItem>
                              </>
                            )}
                            {backup.status === 'in_progress' && (
                              <DropdownMenuItem onClick={() => handleCancel(backup)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(backup)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Backup</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o backup selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <BackupDetails 
              backup={selectedBackup} 
              onClose={() => setIsDetailsOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}