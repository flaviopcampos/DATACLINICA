'use client'

import React, { useState, useMemo } from 'react'
import { format, isToday, isYesterday, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
import {
  Clock,
  User,
  Shield,
  Database,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  Calendar,
  Filter,
} from 'lucide-react'
import { AuditLog, ActionType, SeverityLevel, EventCategory, AuditTimelineEvent } from '@/types/audit'
import { cn } from '@/lib/utils'

interface AuditTimelineProps {
  events: AuditLog[]
  className?: string
  maxHeight?: string
  showGrouping?: boolean
  showFilters?: boolean
}

type TimelineGrouping = 'none' | 'hour' | 'day' | 'week'
type TimelineFilter = 'all' | 'security' | 'data' | 'system' | 'user'

function AuditTimeline({ 
  events, 
  className, 
  maxHeight = '600px',
  showGrouping = true,
  showFilters = true
}: AuditTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<AuditLog | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [grouping, setGrouping] = useState<TimelineGrouping>('day')
  const [filter, setFilter] = useState<TimelineFilter>('all')

  const getEventIcon = (action: ActionType, category: EventCategory) => {
    switch (category) {
      case 'SECURITY':
        return <Shield className="h-4 w-4" />
      case 'DATA':
        return <Database className="h-4 w-4" />
      case 'SYSTEM':
        return <Settings className="h-4 w-4" />
      case 'USER':
        return <User className="h-4 w-4" />
      case 'AUDIT':
        return <FileText className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

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
        return 'border-red-500 bg-red-50'
      case 'HIGH':
        return 'border-orange-500 bg-orange-50'
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-50'
      case 'LOW':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-500 bg-gray-50'
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

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case 'SECURITY':
        return 'text-red-600 bg-red-100'
      case 'DATA':
        return 'text-blue-600 bg-blue-100'
      case 'SYSTEM':
        return 'text-purple-600 bg-purple-100'
      case 'USER':
        return 'text-green-600 bg-green-100'
      case 'AUDIT':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimeGroup = (date: Date) => {
    if (isToday(date)) {
      return 'Hoje'
    } else if (isYesterday(date)) {
      return 'Ontem'
    } else {
      const daysDiff = differenceInDays(new Date(), date)
      if (daysDiff <= 7) {
        return format(date, 'EEEE', { locale: ptBR })
      } else {
        return format(date, 'dd/MM/yyyy', { locale: ptBR })
      }
    }
  }

  const filteredEvents = useMemo(() => {
    let filtered = events

    if (filter !== 'all') {
      filtered = filtered.filter(event => {
        switch (filter) {
          case 'security':
            return event.category === 'SECURITY' || ['LOGIN', 'LOGOUT', 'ACCESS'].includes(event.action)
          case 'data':
            return event.category === 'DATA' || ['CREATE', 'UPDATE', 'DELETE'].includes(event.action)
          case 'system':
            return event.category === 'SYSTEM'
          case 'user':
            return event.category === 'USER'
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [events, filter])

  const groupedEvents = useMemo(() => {
    if (grouping === 'none') {
      return [{ group: 'Todos os eventos', events: filteredEvents }]
    }

    const groups: { [key: string]: AuditLog[] } = {}

    filteredEvents.forEach(event => {
      const date = new Date(event.timestamp)
      let groupKey: string

      switch (grouping) {
        case 'hour':
          groupKey = format(date, 'dd/MM/yyyy HH:00', { locale: ptBR })
          break
        case 'day':
          groupKey = formatTimeGroup(date)
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          groupKey = `Semana de ${format(weekStart, 'dd/MM', { locale: ptBR })}`
          break
        default:
          groupKey = 'Todos'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(event)
    })

    return Object.entries(groups).map(([group, events]) => ({ group, events }))
  }, [filteredEvents, grouping])

  const handleViewDetails = (event: AuditLog) => {
    setSelectedEvent(event)
    setIsDetailsOpen(true)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controles */}
      {(showGrouping || showFilters) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline de Auditoria
            </CardTitle>
            <CardDescription>
              Visualização cronológica dos eventos de auditoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {showGrouping && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Select value={grouping} onValueChange={(value) => setGrouping(value as TimelineGrouping)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem agrupamento</SelectItem>
                      <SelectItem value="hour">Por hora</SelectItem>
                      <SelectItem value="day">Por dia</SelectItem>
                      <SelectItem value="week">Por semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {showFilters && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select value={filter} onValueChange={(value) => setFilter(value as TimelineFilter)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os eventos</SelectItem>
                      <SelectItem value="security">Segurança</SelectItem>
                      <SelectItem value="data">Dados</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea style={{ height: maxHeight }}>
            <div className="p-6">
              {groupedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum evento encontrado</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedEvents.map(({ group, events }, groupIndex) => (
                    <div key={group} className="space-y-4">
                      {/* Cabeçalho do Grupo */}
                      {grouping !== 'none' && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{group}</h3>
                            <p className="text-sm text-gray-500">{events.length} eventos</p>
                          </div>
                          <Separator className="flex-1" />
                        </div>
                      )}

                      {/* Eventos do Grupo */}
                      <div className="relative">
                        {/* Linha da Timeline */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                        
                        <div className="space-y-4">
                          {events.map((event, eventIndex) => (
                            <div key={event.id} className="relative flex gap-4">
                              {/* Indicador da Timeline */}
                              <div className={cn(
                                'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2',
                                getSeverityColor(event.severity)
                              )}>
                                {getEventIcon(event.action, event.category)}
                              </div>

                              {/* Conteúdo do Evento */}
                              <div className="flex-1 min-w-0">
                                <div className={cn(
                                  'rounded-lg border-l-4 bg-white p-4 shadow-sm',
                                  getSeverityColor(event.severity)
                                )}>
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      {/* Cabeçalho do Evento */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge className={getActionColor(event.action)}>
                                          {event.action}
                                        </Badge>
                                        <Badge variant="outline" className={getCategoryColor(event.category)}>
                                          {event.category}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                          {getSeverityIcon(event.severity)}
                                          <span className="text-xs font-medium">{event.severity}</span>
                                        </div>
                                      </div>

                                      {/* Descrição */}
                                      <p className="text-sm font-medium text-gray-900 mb-1">
                                        {event.description}
                                      </p>

                                      {/* Detalhes */}
                                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          <span>{event.userName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{format(new Date(event.timestamp), 'HH:mm:ss', { locale: ptBR })}</span>
                                        </div>
                                        {event.resource && (
                                          <div className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            <span>{event.resource}</span>
                                          </div>
                                        )}
                                        {event.ipAddress && (
                                          <div className="flex items-center gap-1">
                                            <span className="font-mono">{event.ipAddress}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center gap-2">
                                      <Button
                                        onClick={() => handleViewDetails(event)}
                                        variant="ghost"
                                        size="sm"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
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
            <DialogTitle>Detalhes do Evento</DialogTitle>
            <DialogDescription>
              Informações completas sobre o evento de auditoria
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2',
                  getSeverityColor(selectedEvent.severity)
                )}>
                  {getEventIcon(selectedEvent.action, selectedEvent.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getActionColor(selectedEvent.action)}>
                      {selectedEvent.action}
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(selectedEvent.category)}>
                      {selectedEvent.category}
                    </Badge>
                  </div>
                  <p className="font-medium">{selectedEvent.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID do Evento</label>
                  <p className="font-mono text-sm">{selectedEvent.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data/Hora</label>
                  <p>{format(new Date(selectedEvent.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Usuário</label>
                  <p>{selectedEvent.userName} ({selectedEvent.userId})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Endereço IP</label>
                  <p className="font-mono">{selectedEvent.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Recurso</label>
                  <p>{selectedEvent.resource}</p>
                </div>
                {selectedEvent.resourceId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID do Recurso</label>
                    <p className="font-mono text-sm">{selectedEvent.resourceId}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Severidade</label>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(selectedEvent.severity)}
                    <span>{selectedEvent.severity}</span>
                  </div>
                </div>
                {selectedEvent.module && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Módulo</label>
                    <p>{selectedEvent.module}</p>
                  </div>
                )}
              </div>
              
              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Metadados</label>
                  <pre className="mt-1 p-3 bg-gray-50 rounded-md text-xs overflow-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
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

export default AuditTimeline