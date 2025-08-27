'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useAudit } from '@/hooks/useAudit'
import { AuditLog, ActionType, SeverityLevel } from '@/types/audit'
import { cn } from '@/lib/utils'

interface AuditLogViewerProps {
  className?: string
  showFilters?: boolean
  maxHeight?: string
}

function AuditLogViewer({ 
  className, 
  showFilters = true, 
  maxHeight = '600px' 
}: AuditLogViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all')
  const [selectedAction, setSelectedAction] = useState<ActionType | 'all'>('all')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const {
    data: auditData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useAudit({
    search: searchTerm || undefined,
    severity: selectedSeverity !== 'all' ? [selectedSeverity] : undefined,
    action: selectedAction !== 'all' ? [selectedAction] : undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize
  })

  const logs = auditData?.data || []
  const totalPages = Math.ceil((auditData?.total || 0) / pageSize)

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'MEDIUM':
        return <Info className="h-4 w-4 text-yellow-500" />
      case 'LOW':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'CREATE':
        return 'bg-blue-100 text-blue-800'
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-green-100 text-green-800'
      case 'ACCESS':
        return 'bg-purple-100 text-purple-800'
      case 'EXPORT':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setIsDetailsOpen(true)
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleExport = () => {
    // TODO: Implementar exportação
    console.log('Exportar logs')
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar logs de auditoria</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-2">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value as SeverityLevel | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as severidades</SelectItem>
                  <SelectItem value="CRITICAL">Crítica</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="LOW">Baixa</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedAction} onValueChange={(value) => setSelectedAction(value as ActionType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criar</SelectItem>
                  <SelectItem value="UPDATE">Atualizar</SelectItem>
                  <SelectItem value="DELETE">Excluir</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="ACCESS">Acesso</SelectItem>
                  <SelectItem value="EXPORT">Exportar</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
                </Button>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <CardDescription>
            {auditData?.total || 0} logs encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border" style={{ maxHeight }}>
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Carregando logs...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum log encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.userName}</div>
                            <div className="text-sm text-gray-500">{log.userId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.resource}</div>
                            {log.resourceId && (
                              <div className="text-sm text-gray-500">ID: {log.resourceId}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(log.severity)}
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleViewDetails(log)}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">por página</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
            <DialogDescription>
              Informações completas sobre o evento de auditoria
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID do Log</label>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data/Hora</label>
                  <p>{format(new Date(selectedLog.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Usuário</label>
                  <p>{selectedLog.userName} ({selectedLog.userId})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Endereço IP</label>
                  <p className="font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ação</label>
                  <Badge className={getActionColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Severidade</label>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(selectedLog.severity)}
                    <Badge className={getSeverityColor(selectedLog.severity)}>
                      {selectedLog.severity}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Recurso</label>
                  <p>{selectedLog.resource}</p>
                </div>
                {selectedLog.resourceId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID do Recurso</label>
                    <p className="font-mono text-sm">{selectedLog.resourceId}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Categoria</label>
                  <p>{selectedLog.category}</p>
                </div>
                {selectedLog.module && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Módulo</label>
                    <p>{selectedLog.module}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Descrição</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedLog.description}</p>
              </div>
              
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Metadados</label>
                  <pre className="mt-1 p-3 bg-gray-50 rounded-md text-xs overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AuditLogViewer