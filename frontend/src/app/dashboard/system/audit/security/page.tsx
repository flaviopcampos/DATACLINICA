'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  User,
  Activity
} from 'lucide-react'
import { SecurityAlerts } from '@/components/audit/SecurityAlerts'
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor'
import { SecurityEvent, SeverityLevel } from '@/types/audit'

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('alerts')
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all')
  
  const { events, alerts, metrics, isLoading, refetch } = useSecurityMonitor()

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.sourceIp.includes(searchTerm) ||
                         event.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    
    return matchesSearch && matchesSeverity && matchesStatus
  }) || []

  const criticalAlerts = alerts?.filter(alert => alert.severity === 'critical').length || 0
  const highAlerts = alerts?.filter(alert => alert.severity === 'high').length || 0
  const activeThreats = alerts?.filter(alert => alert.status === 'active').length || 0

  const securityMetrics = [
    {
      title: 'Alertas Críticos',
      value: criticalAlerts,
      description: 'Requerem ação imediata',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Alertas de Alto Risco',
      value: highAlerts,
      description: 'Monitoramento necessário',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Ameaças Ativas',
      value: activeThreats,
      description: 'Em investigação',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'IPs Bloqueados',
      value: metrics?.blockedIps || 0,
      description: 'Últimas 24 horas',
      icon: Ban,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoramento de Segurança</h1>
          <p className="text-muted-foreground">
            Alertas, eventos e análise de ameaças em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {criticalAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlerts} alertas críticos</strong> detectados e requerem atenção imediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas de Segurança */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {securityMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className={`${metric.bgColor} ${metric.borderColor}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="events">Eventos de Segurança</TabsTrigger>
          <TabsTrigger value="analysis">Análise de Ameaças</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <SecurityAlerts />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por descrição, IP ou usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={(value: SeverityLevel | 'all') => setSeverityFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'resolved') => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="resolved">Resolvidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Eventos de Segurança
              </CardTitle>
              <CardDescription>
                {filteredEvents.length} eventos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum evento encontrado com os filtros aplicados.
                  </div>
                ) : (
                  filteredEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {event.category}
                            </Badge>
                            <Badge 
                              variant={event.status === 'active' ? 'destructive' : 'secondary'}
                            >
                              {event.status === 'active' ? 'Ativo' : 'Resolvido'}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{event.description}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatEventTime(event.timestamp)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.sourceIp}
                            </div>
                            {event.userId && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.userId}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                          {event.status === 'active' && (
                            <Button variant="outline" size="sm">
                              <Ban className="h-3 w-3 mr-1" />
                              Bloquear IP
                            </Button>
                          )}
                        </div>
                      </div>
                      {event.details && (
                        <div className="bg-muted/50 rounded p-3 text-sm">
                          <strong>Detalhes:</strong> {event.details}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Padrões</CardTitle>
                <CardDescription>
                  Identificação de comportamentos suspeitos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <div className="font-medium text-yellow-800">Múltiplas tentativas de login</div>
                      <div className="text-sm text-yellow-600">IP: 192.168.1.100</div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Suspeito</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <div className="font-medium text-red-800">Acesso fora do horário</div>
                      <div className="text-sm text-red-600">Usuário: admin@dataclinica.com</div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Alto Risco</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <div className="font-medium text-orange-800">Geolocalização incomum</div>
                      <div className="text-sm text-orange-600">Localização: Exterior</div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Médio Risco</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Ameaças</CardTitle>
                <CardDescription>
                  Resumo das últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tentativas de invasão bloqueadas</span>
                    <span className="text-lg font-bold text-green-600">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Malware detectado</span>
                    <span className="text-lg font-bold text-red-600">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Acessos suspeitos</span>
                    <span className="text-lg font-bold text-yellow-600">7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Regras de firewall ativadas</span>
                    <span className="text-lg font-bold text-blue-600">15</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}