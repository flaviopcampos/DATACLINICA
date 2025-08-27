'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Settings,
  Bell,
  BellOff,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Filter,
  Search,
  RefreshCw,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Alert {
  id: string
  name: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed'
  category: 'system' | 'performance' | 'security' | 'business' | 'custom'
  source: string
  condition: {
    metric: string
    operator: string
    threshold: number
    unit: string
  }
  currentValue?: number
  triggeredAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
  suppressedUntil?: string
  escalationLevel: number
  notificationsSent: number
  tags?: string[]
  metadata?: Record<string, any>
  actions?: {
    id: string
    name: string
    type: 'webhook' | 'email' | 'sms' | 'script'
    executed: boolean
    executedAt?: string
  }[]
}

interface AlertFilter {
  severity?: string[]
  status?: string[]
  category?: string[]
  source?: string[]
  search?: string
  dateRange?: {
    start: string
    end: string
  }
}

interface AlertsPanelProps {
  alerts: Alert[]
  isLoading?: boolean
  isRealTime?: boolean
  filter?: AlertFilter
  availableSources?: string[]
  onFilterChange?: (filter: AlertFilter) => void
  onAlertAction?: (alertId: string, action: 'acknowledge' | 'resolve' | 'suppress' | 'delete') => void
  onCreateAlert?: () => void
  onEditAlert?: (alert: Alert) => void
  onRefresh?: () => void
  className?: string
}

function AlertSeverityBadge({ severity }: { severity: Alert['severity'] }) {
  const config = {
    low: { color: 'bg-blue-100 text-blue-800', icon: Info },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    high: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    critical: { color: 'bg-red-100 text-red-800', icon: XCircle }
  }
  
  const { color, icon: Icon } = config[severity]
  
  return (
    <Badge className={cn('text-xs font-medium', color)}>
      <Icon className="h-3 w-3 mr-1" />
      {severity.toUpperCase()}
    </Badge>
  )
}

function AlertStatusBadge({ status }: { status: Alert['status'] }) {
  const config = {
    active: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    acknowledged: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
    resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    suppressed: { color: 'bg-gray-100 text-gray-800', icon: EyeOff }
  }
  
  const { color, icon: Icon } = config[status]
  
  return (
    <Badge className={cn('text-xs font-medium', color)}>
      <Icon className="h-3 w-3 mr-1" />
      {status === 'acknowledged' ? 'RECONHECIDO' :
       status === 'resolved' ? 'RESOLVIDO' :
       status === 'suppressed' ? 'SUPRIMIDO' :
       'ATIVO'}
    </Badge>
  )
}

function AlertCard({ 
  alert, 
  isExpanded, 
  onToggleExpand, 
  onAction, 
  onEdit 
}: { 
  alert: Alert
  isExpanded: boolean
  onToggleExpand: () => void
  onAction: (action: 'acknowledge' | 'resolve' | 'suppress' | 'delete') => void
  onEdit: () => void
}) {
  const formatThreshold = () => {
    const { operator, threshold, unit } = alert.condition
    return `${operator} ${threshold}${unit}`
  }

  const formatCurrentValue = () => {
    if (alert.currentValue === undefined) return 'N/A'
    return `${alert.currentValue}${alert.condition.unit}`
  }

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
  }

  return (
    <Card className={cn(
      'transition-all duration-200',
      alert.severity === 'critical' && 'border-red-300 bg-red-50/50',
      alert.severity === 'high' && 'border-orange-300 bg-orange-50/50',
      alert.severity === 'medium' && 'border-yellow-300 bg-yellow-50/50',
      alert.status === 'resolved' && 'opacity-75'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <AlertSeverityBadge severity={alert.severity} />
              <AlertStatusBadge status={alert.status} />
              <Badge variant="outline" className="text-xs">
                {alert.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {alert.source}
              </Badge>
            </div>
            
            <div>
              <CardTitle className="text-base font-semibold">{alert.name}</CardTitle>
              {alert.description && (
                <CardDescription className="text-sm mt-1">
                  {alert.description}
                </CardDescription>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Disparado {getTimeAgo(alert.triggeredAt)}</span>
              </div>
              
              {alert.escalationLevel > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Nível {alert.escalationLevel}</span>
                </div>
              )}
              
              {alert.notificationsSent > 0 && (
                <div className="flex items-center space-x-1">
                  <Bell className="h-3 w-3" />
                  <span>{alert.notificationsSent} notificações</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Ações rápidas */}
            {alert.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('acknowledge')}
                title="Reconhecer"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            {(alert.status === 'active' || alert.status === 'acknowledged') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('resolve')}
                title="Resolver"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            {alert.status !== 'suppressed' && alert.status !== 'resolved' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('suppress')}
                title="Suprimir"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Condição do alerta */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Condição</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Métrica:</span>
                  <p className="text-gray-900">{alert.condition.metric}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Limite:</span>
                  <p className="text-gray-900">{formatThreshold()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Valor Atual:</span>
                  <p className={cn(
                    'font-medium',
                    alert.currentValue !== undefined && alert.currentValue > alert.condition.threshold
                      ? 'text-red-600'
                      : 'text-green-600'
                  )}>
                    {formatCurrentValue()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Fonte:</span>
                  <p className="text-gray-900">{alert.source}</p>
                </div>
              </div>
            </div>
            
            {/* Histórico de ações */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Histórico</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Disparado em {format(new Date(alert.triggeredAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                </div>
                
                {alert.acknowledgedAt && (
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-yellow-500" />
                    <span>
                      Reconhecido em {format(new Date(alert.acknowledgedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      {alert.acknowledgedBy && ` por ${alert.acknowledgedBy}`}
                    </span>
                  </div>
                )}
                
                {alert.resolvedAt && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>
                      Resolvido em {format(new Date(alert.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      {alert.resolvedBy && ` por ${alert.resolvedBy}`}
                    </span>
                  </div>
                )}
                
                {alert.suppressedUntil && (
                  <div className="flex items-center space-x-2">
                    <EyeOff className="h-4 w-4 text-gray-500" />
                    <span>
                      Suprimido até {format(new Date(alert.suppressedUntil), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Ações automáticas */}
            {alert.actions && alert.actions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Ações Automáticas</h4>
                <div className="space-y-2">
                  {alert.actions.map(action => (
                    <div key={action.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant={action.executed ? "default" : "secondary"} className="text-xs">
                          {action.type}
                        </Badge>
                        <span className="text-sm">{action.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        {action.executed ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>
                              Executado {action.executedAt && getTimeAgo(action.executedAt)}
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>Pendente</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {alert.tags && alert.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {alert.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Metadados */}
            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Metadados</h4>
                <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(alert.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Ações adicionais */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(alert, null, 2))}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar JSON
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function AlertsPanel({
  alerts,
  isLoading = false,
  isRealTime = false,
  filter = {},
  availableSources = [],
  onFilterChange,
  onAlertAction,
  onCreateAlert,
  onEditAlert,
  onRefresh,
  className
}: AlertsPanelProps) {
  const [searchTerm, setSearchTerm] = useState(filter.search || '')
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(filter.severity || [])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(filter.status || [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filter.category || [])
  const [selectedSources, setSelectedSources] = useState<string[]>(filter.source || [])
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'triggeredAt' | 'severity' | 'name'>('triggeredAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const severities = ['low', 'medium', 'high', 'critical']
  const statuses = ['active', 'acknowledged', 'resolved', 'suppressed']
  const categories = ['system', 'performance', 'security', 'business', 'custom']

  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = alerts.filter(alert => {
      // Filtro de busca
      if (searchTerm && !alert.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !alert.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Filtro de severidade
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(alert.severity)) {
        return false
      }
      
      // Filtro de status
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(alert.status)) {
        return false
      }
      
      // Filtro de categoria
      if (selectedCategories.length > 0 && !selectedCategories.includes(alert.category)) {
        return false
      }
      
      // Filtro de fonte
      if (selectedSources.length > 0 && !selectedSources.includes(alert.source)) {
        return false
      }
      
      return true
    })
    
    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'triggeredAt':
          comparison = new Date(a.triggeredAt).getTime() - new Date(b.triggeredAt).getTime()
          break
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          comparison = severityOrder[a.severity] - severityOrder[b.severity]
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
    
    return filtered
  }, [alerts, searchTerm, selectedSeverities, selectedStatuses, selectedCategories, selectedSources, sortBy, sortOrder])

  const alertCounts = useMemo(() => {
    return {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length
    }
  }, [alerts])

  const toggleAlertExpansion = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(alertId)) {
        newSet.delete(alertId)
      } else {
        newSet.add(alertId)
      }
      return newSet
    })
  }

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve' | 'suppress' | 'delete') => {
    if (onAlertAction) {
      onAlertAction(alertId, action)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSeverities([])
    setSelectedStatuses([])
    setSelectedCategories([])
    setSelectedSources([])
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alertas do Sistema</span>
                {isRealTime && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                    Tempo Real
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {filteredAndSortedAlerts.length} de {alerts.length} alertas
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              {onCreateAlert && (
                <Button onClick={onCreateAlert}>
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Alerta
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
              
              {onRefresh && (
                <Button
                  variant="outline"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                </Button>
              )}
            </div>
          </div>
          
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{alertCounts.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{alertCounts.active}</div>
              <div className="text-sm text-gray-600">Ativos</div>
            </div>
            
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-800">{alertCounts.critical}</div>
              <div className="text-sm text-gray-600">Críticos</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{alertCounts.acknowledged}</div>
              <div className="text-sm text-gray-600">Reconhecidos</div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Busca e ordenação */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="triggeredAt">Data</SelectItem>
                    <SelectItem value="severity">Severidade</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
                
                <Button onClick={clearFilters}>
                  Limpar
                </Button>
              </div>
              
              {/* Filtros por categoria */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Severidade */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Severidade</Label>
                  <div className="space-y-2">
                    {severities.map(severity => (
                      <div key={severity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`severity-${severity}`}
                          checked={selectedSeverities.includes(severity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSeverities(prev => [...prev, severity])
                            } else {
                              setSelectedSeverities(prev => prev.filter(s => s !== severity))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`severity-${severity}`} className="text-sm">
                          <AlertSeverityBadge severity={severity as Alert['severity']} />
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Status */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Status</Label>
                  <div className="space-y-2">
                    {statuses.map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStatuses(prev => [...prev, status])
                            } else {
                              setSelectedStatuses(prev => prev.filter(s => s !== status))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm">
                          <AlertStatusBadge status={status as Alert['status']} />
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Categoria */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Categoria</Label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories(prev => [...prev, category])
                            } else {
                              setSelectedCategories(prev => prev.filter(c => c !== category))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`category-${category}`} className="text-sm capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Fonte */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Fonte</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableSources.map(source => (
                      <div key={source} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`source-${source}`}
                          checked={selectedSources.includes(source)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSources(prev => [...prev, source])
                            } else {
                              setSelectedSources(prev => prev.filter(s => s !== source))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`source-${source}`} className="text-sm">
                          {source}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Lista de alertas */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Carregando alertas...</p>
            </CardContent>
          </Card>
        ) : filteredAndSortedAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Nenhum alerta encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isExpanded={expandedAlerts.has(alert.id)}
              onToggleExpand={() => toggleAlertExpansion(alert.id)}
              onAction={(action) => handleAlertAction(alert.id, action)}
              onEdit={() => onEditAlert?.(alert)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default AlertsPanel