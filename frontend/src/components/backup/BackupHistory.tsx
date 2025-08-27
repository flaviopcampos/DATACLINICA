'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Archive, 
  Calendar, 
  Clock, 
  Database, 
  Download, 
  Eye, 
  FileText, 
  Filter, 
  HardDrive, 
  MoreHorizontal, 
  RefreshCw, 
  Search, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useBackup } from '@/hooks/useBackup'
import type { Backup, BackupStatus, BackupType } from '@/types/backup'
import { toast } from 'sonner'
import { formatBytes } from '@/lib/utils'

interface BackupHistoryProps {
  limit?: number
  showFilters?: boolean
  onBackupSelect?: (backup: Backup) => void
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-500', label: 'Pendente' },
  in_progress: { icon: Loader2, color: 'bg-blue-500', label: 'Em Progresso' },
  completed: { icon: CheckCircle, color: 'bg-green-500', label: 'Concluído' },
  failed: { icon: XCircle, color: 'bg-red-500', label: 'Falhou' },
  cancelled: { icon: AlertCircle, color: 'bg-gray-500', label: 'Cancelado' },
}

const typeConfig = {
  full: { label: 'Completo', color: 'bg-blue-100 text-blue-800' },
  incremental: { label: 'Incremental', color: 'bg-green-100 text-green-800' },
  differential: { label: 'Diferencial', color: 'bg-purple-100 text-purple-800' },
}

export function BackupHistory({ limit, showFilters = true, onBackupSelect }: BackupHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<BackupStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<BackupType | 'all'>('all')
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  
  const { 
    useBackups, 
    deleteBackup, 
    downloadBackup, 
    verifyBackup 
  } = useBackup()
  
  const { data: backups = [], isLoading, refetch } = useBackups()
  
  // Filtrar backups
  const filteredBackups = backups
    .filter(backup => {
      const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           backup.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || backup.status === statusFilter
      const matchesType = typeFilter === 'all' || backup.type === typeFilter
      
      return matchesSearch && matchesStatus && matchesType
    })
    .slice(0, limit)
  
  const handleDownload = async (backup: Backup) => {
    try {
      await downloadBackup.mutateAsync(backup.id)
      toast.success('Download iniciado')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao baixar backup')
    }
  }
  
  const handleDelete = async (backup: Backup) => {
    if (!confirm(`Tem certeza que deseja excluir o backup "${backup.name}"?`)) {
      return
    }
    
    try {
      await deleteBackup.mutateAsync(backup.id)
      toast.success('Backup excluído com sucesso')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir backup')
    }
  }
  
  const handleVerify = async (backup: Backup) => {
    try {
      const result = await verifyBackup.mutateAsync(backup.id)
      if (result.isValid) {
        toast.success('Backup verificado com sucesso')
      } else {
        toast.error(`Backup corrompido: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao verificar backup')
    }
  }
  
  const getStatusIcon = (status: BackupStatus) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return <Icon className={`h-4 w-4 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
  }
  
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Histórico de Backups
        </CardTitle>
        <CardDescription>
          Visualize e gerencie todos os backups realizados
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar backups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BackupStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as BackupType | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                {Object.entries(typeConfig).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando backups...</span>
          </div>
        ) : filteredBackups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum backup encontrado</p>
            {searchTerm && (
              <p className="text-sm mt-2">
                Tente ajustar os filtros de busca
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBackups.map((backup) => {
                  const statusConf = statusConfig[backup.status]
                  const typeConf = typeConfig[backup.type]
                  
                  return (
                    <TableRow 
                      key={backup.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onBackupSelect?.(backup)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{backup.name}</div>
                          {backup.description && (
                            <div className="text-sm text-muted-foreground">
                              {backup.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary" className={typeConf.color}>
                          {typeConf.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(backup.status)}
                          <span className="text-sm">{statusConf.label}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {backup.size ? formatBytes(backup.size) : '-'}
                      </TableCell>
                      
                      <TableCell>
                        {backup.duration ? formatDuration(backup.duration) : '-'}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(backup.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</div>
                          <div className="text-muted-foreground">
                            {format(new Date(backup.createdAt), 'HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              setSelectedBackup(backup)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            
                            {backup.status === 'completed' && (
                              <>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownload(backup)
                                }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleVerify(backup)
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Verificar
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(backup)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Dialog de Detalhes do Backup */}
        <Dialog open={!!selectedBackup} onOpenChange={() => setSelectedBackup(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Detalhes do Backup
              </DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre o backup selecionado
              </DialogDescription>
            </DialogHeader>
            
            {selectedBackup && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-sm text-muted-foreground">{selectedBackup.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedBackup.status)}
                      <span className="text-sm">{statusConfig[selectedBackup.status].label}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <Badge variant="secondary" className={`mt-1 ${typeConfig[selectedBackup.type].color}`}>
                      {typeConfig[selectedBackup.type].label}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tamanho</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedBackup.size ? formatBytes(selectedBackup.size) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Duração</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedBackup.duration ? formatDuration(selectedBackup.duration) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Data de Criação</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedBackup.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                {selectedBackup.description && (
                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedBackup.description}</p>
                  </div>
                )}
                
                {selectedBackup.modules && selectedBackup.modules.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Módulos Incluídos</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedBackup.modules.map((module) => (
                        <Badge key={module} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedBackup.error && (
                  <div>
                    <Label className="text-sm font-medium text-red-600">Erro</Label>
                    <p className="text-sm text-red-600 mt-1">{selectedBackup.error}</p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-4">
                  {selectedBackup.status === 'completed' && (
                    <>
                      <Button variant="outline" onClick={() => handleVerify(selectedBackup)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verificar
                      </Button>
                      <Button onClick={() => handleDownload(selectedBackup)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}