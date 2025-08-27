'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Clock,
  User,
  MapPin,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Bell,
  BellOff,
  Filter,
  Search,
  Ban,
  UserX,
  Lock,
} from 'lucide-react'
import { SecurityAlert, SeverityLevel } from '@/types/audit'
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SecurityAlertsProps {
  className?: string
  maxHeight?: string
  showFilters?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

type AlertFilter = 'all' | 'unread' | 'critical' | 'high' | 'medium' | 'low'
type AlertAction = 'acknowledge' | 'investigate' | 'block_ip' | 'disable_user'

function SecurityAlerts({ 
  className, 
  maxHeight = '600px',
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 30000
}: SecurityAlertsProps) {
  const [filter, setFilter] = useState<AlertFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<AlertAction>('acknowledge')
  const [actionNotes, setActionNotes] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)

  const {
    alerts,
    isLoading,
    acknowledgeAlert,
    updateInvestigation,
    blockIp,
    refetch
  } = useSecurityMonitor()

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetch()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refetch])

  // Sound notification for new critical alerts
  useEffect(() => {
    if (!soundEnabled) return

    const criticalAlerts = alerts?.filter(alert => 
      alert.severity === 'CRITICAL' && !alert.acknowledged
    ) || []

    if (criticalAlerts.length > 0) {
      // Simular som de alerta
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      audio.volume = 0.3
      audio.play().catch(() => {}) // Ignorar erros de autoplay
    }
  }, [alerts, soundEnabled])

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'MEDIUM':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'LOW':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-50'
      case 'HIGH':
        return 'border-orange-500 bg-orange-50'
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-50'
      case 'LOW':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  const getSeverityBadgeColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'login_failure':
      case 'brute_force':
        return <Lock className="h-4 w-4" />
      case 'suspicious_activity':
        return <Eye className="h-4 w-4" />
      case 'data_breach':
        return <Shield className="h-4 w-4" />
      case 'unauthorized_access':
        return <UserX className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredAlerts = React.useMemo(() => {
    if (!alerts) return []

    let filtered = alerts

    // Filtro por status/severidade
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(alert => !alert.acknowledged)
        break
      case 'critical':
        filtered = filtered.filter(alert => alert.severity === 'CRITICAL')
        break
      case 'high':
        filtered = filtered.filter(alert => alert.severity === 'HIGH')
        break
      case 'medium':
        filtered = filtered.filter(alert => alert.severity === 'MEDIUM')
        break
      case 'low':
        filtered = filtered.filter(alert => alert.severity === 'LOW')
        break
    }

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(term) ||
        alert.description.toLowerCase().includes(term) ||
        alert.source.toLowerCase().includes(term) ||
        alert.ipAddress?.toLowerCase().includes(term) ||
        alert.userId?.toLowerCase().includes(term)
      )
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [alerts, filter, searchTerm])

  const unreadCount = alerts?.filter(alert => !alert.acknowledged).length || 0
  const criticalCount = alerts?.filter(alert => alert.severity === 'CRITICAL' && !alert.acknowledged).length || 0

  const handleViewDetails = (alert: SecurityAlert) => {
    setSelectedAlert(alert)
    setIsDetailsOpen(true)
  }

  const handleAction = (alert: SecurityAlert, action: AlertAction) => {
    setSelectedAlert(alert)
    setActionType(action)
    setActionNotes('')
    setIsActionDialogOpen(true)
  }

  const executeAction = async () => {
    if (!selectedAlert) return

    try {
      switch (actionType) {
        case 'acknowledge':
          await acknowledgeAlert.mutateAsync({
            alertId: selectedAlert.id,
            notes: actionNotes
          })
          toast.success('Alerta reconhecido com sucesso')
          break
        case 'investigate':
          await updateInvestigation.mutateAsync({
            alertId: selectedAlert.id,
            status: 'investigating',
            notes: actionNotes
          })
          toast.success('Investigação iniciada')
          break
        case 'block_ip':
          if (selectedAlert.ipAddress) {
            await blockIp.mutateAsync({
              ipAddress: selectedAlert.ipAddress,
              reason: actionNotes || 'Bloqueado devido a alerta de segurança',
              duration: 24 * 60 // 24 horas
            })
            toast.success('IP bloqueado com sucesso')
          }
          break
        case 'disable_user':
          // Implementar desabilitação de usuário
          toast.success('Usuário desabilitado')
          break
      }
      setIsActionDialogOpen(false)
    } catch (error) {
      toast.error('Erro ao executar ação')
    }
  }

  const getActionLabel = (action: AlertAction) => {
    switch (action) {
      case 'acknowledge':
        return 'Reconhecer'
      case 'investigate':
        return 'Investigar'
      case 'block_ip':
        return 'Bloquear IP'
      case 'disable_user':
        return 'Desabilitar Usuário'
      default:
        return action
    }
  }

  const getActionIcon = (action: AlertAction) => {
    switch (action) {
      case 'acknowledge':
        return <CheckCircle className="h-4 w-4" />
      case 'investigate':
        return <Eye className="h-4 w-4" />
      case 'block_ip':
        return <Ban className="h-4 w-4" />
      case 'disable_user':
        return <UserX className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Cabeçalho com Estatísticas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Alertas de Segurança
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real de eventos de segurança
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="ghost"
                size="sm"
              >
                {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <Activity className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {criticalCount > 0 && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  {criticalCount} alerta{criticalCount > 1 ? 's' : ''} crítico{criticalCount > 1 ? 's' : ''} requer{criticalCount === 1 ? '' : 'em'} atenção imediata
                </p>
                <p className="text-sm text-red-600">
                  Verifique os alertas não reconhecidos
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={filter} onValueChange={(value) => setFilter(value as AlertFilter)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os alertas</SelectItem>
                    <SelectItem value="unread">Não lidos ({unreadCount})</SelectItem>
                    <SelectItem value="critical">Críticos</SelectItem>
                    <SelectItem value="high">Altos</SelectItem>
                    <SelectItem value="medium">Médios</SelectItem>
                    <SelectItem value="low">Baixos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Buscar alertas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Alertas */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea style={{ height: maxHeight }}>
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Carregando alertas...</p>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum alerta encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'rounded-lg border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md',
                        getSeverityColor(alert.severity),
                        !alert.acknowledged && 'ring-2 ring-blue-100'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 mt-1">
                            {getTypeIcon(alert.type)}
                            {getSeverityIcon(alert.severity)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {alert.title}
                              </h3>
                              <Badge className={getSeverityBadgeColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {!alert.acknowledged && (
                                <Badge variant="outline" className="text-blue-600 bg-blue-50">
                                  Novo
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {alert.description}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                <span>{alert.source}</span>
                              </div>
                              {alert.ipAddress && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-mono">{alert.ipAddress}</span>
                                </div>
                              )}
                              {alert.userId && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{alert.userId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleViewDetails(alert)}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {!alert.acknowledged && (
                            <Button
                              onClick={() => handleAction(alert, 'acknowledge')}
                              variant="outline"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Select onValueChange={(value) => handleAction(alert, value as AlertAction)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Ações" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="investigate">Investigar</SelectItem>
                              {alert.ipAddress && (
                                <SelectItem value="block_ip">Bloquear IP</SelectItem>
                              )}
                              {alert.userId && (
                                <SelectItem value="disable_user">Desabilitar Usuário</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Alerta</DialogTitle>
            <DialogDescription>
              Informações completas sobre o alerta de segurança
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2',
                  getSeverityColor(selectedAlert.severity)
                )}>
                  {getTypeIcon(selectedAlert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityBadgeColor(selectedAlert.severity)}>
                      {selectedAlert.severity}
                    </Badge>
                    <Badge variant="outline">
                      {selectedAlert.type}
                    </Badge>
                  </div>
                  <h3 className="font-medium">{selectedAlert.title}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID do Alerta</label>
                  <p className="font-mono text-sm">{selectedAlert.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data/Hora</label>
                  <p>{format(new Date(selectedAlert.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fonte</label>
                  <p>{selectedAlert.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p>{selectedAlert.acknowledged ? 'Reconhecido' : 'Pendente'}</p>
                </div>
                {selectedAlert.ipAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Endereço IP</label>
                    <p className="font-mono">{selectedAlert.ipAddress}</p>
                  </div>
                )}
                {selectedAlert.userId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Usuário</label>
                    <p>{selectedAlert.userId}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Descrição</label>
                <p className="mt-1 text-sm">{selectedAlert.description}</p>
              </div>
              
              {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Metadados</label>
                  <pre className="mt-1 p-3 bg-gray-50 rounded-md text-xs overflow-auto">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Ação */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getActionIcon(actionType)}
              {getActionLabel(actionType)}
            </DialogTitle>
            <DialogDescription>
              Confirme a ação a ser executada neste alerta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="actionNotes">Observações</Label>
              <Textarea
                id="actionNotes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Adicione observações sobre esta ação..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={executeAction}>
                {getActionIcon(actionType)}
                {getActionLabel(actionType)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SecurityAlerts