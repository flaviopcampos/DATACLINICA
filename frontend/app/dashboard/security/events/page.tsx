'use client'

import { Metadata } from 'next'
import { Suspense, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  Monitor,
  User,
  Key,
  Lock,
  Unlock,
  UserX,
  Settings,
  Database,
  FileText
} from 'lucide-react'
import Link from 'next/link'

// Metadata removido pois este é um Client Component

function SecurityEventsSkeleton() {
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
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SecurityEventsManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  // Mock data - em produção viria de um hook/API
  const securityEvents = [
    {
      id: '1',
      type: 'login_failed',
      severity: 'high',
      title: 'Múltiplas tentativas de login falharam',
      description: 'Usuário admin@dataclinica.com teve 5 tentativas de login falhadas consecutivas',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'admin@dataclinica.com',
      ip: '192.168.1.100',
      location: 'São Paulo, SP, Brasil',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resolved: false,
      actions: ['Conta temporariamente bloqueada', 'Notificação enviada por email']
    },
    {
      id: '2',
      type: 'login_success',
      severity: 'low',
      title: 'Login bem-sucedido de novo dispositivo',
      description: 'Login realizado com sucesso de um dispositivo não reconhecido',
      timestamp: '2024-01-15T09:15:00Z',
      user: 'medico@dataclinica.com',
      ip: '192.168.1.101',
      location: 'Rio de Janeiro, RJ, Brasil',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      resolved: true,
      actions: ['Dispositivo adicionado como confiável']
    },
    {
      id: '3',
      type: 'password_change',
      severity: 'medium',
      title: 'Senha alterada',
      description: 'Usuário alterou sua senha com sucesso',
      timestamp: '2024-01-15T08:45:00Z',
      user: 'enfermeiro@dataclinica.com',
      ip: '192.168.1.102',
      location: 'São Paulo, SP, Brasil',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resolved: true,
      actions: ['Todos os dispositivos confiáveis foram removidos']
    },
    {
      id: '4',
      type: 'permission_change',
      severity: 'high',
      title: 'Permissões de usuário alteradas',
      description: 'Permissões administrativas foram concedidas ao usuário',
      timestamp: '2024-01-15T07:30:00Z',
      user: 'admin@dataclinica.com',
      ip: '192.168.1.100',
      location: 'São Paulo, SP, Brasil',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resolved: true,
      actions: ['Auditoria de permissões iniciada']
    },
    {
      id: '5',
      type: 'data_access',
      severity: 'medium',
      title: 'Acesso a dados sensíveis',
      description: 'Usuário acessou dados de pacientes fora do horário normal',
      timestamp: '2024-01-14T23:15:00Z',
      user: 'medico@dataclinica.com',
      ip: '192.168.1.103',
      location: 'São Paulo, SP, Brasil',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resolved: false,
      actions: ['Notificação enviada ao supervisor']
    }
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'login_success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'password_change':
        return <Key className="h-5 w-5 text-blue-600" />
      case 'permission_change':
        return <Settings className="h-5 w-5 text-orange-600" />
      case 'data_access':
        return <Database className="h-5 w-5 text-purple-600" />
      case 'account_locked':
        return <Lock className="h-5 w-5 text-red-600" />
      case 'account_unlocked':
        return <Unlock className="h-5 w-5 text-green-600" />
      case 'user_created':
        return <User className="h-5 w-5 text-blue-600" />
      case 'user_deleted':
        return <UserX className="h-5 w-5 text-red-600" />
      default:
        return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Baixa</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecida</Badge>
    }
  }

  const getEventTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'login_failed': 'Login Falhado',
      'login_success': 'Login Bem-sucedido',
      'password_change': 'Alteração de Senha',
      'permission_change': 'Alteração de Permissões',
      'data_access': 'Acesso a Dados',
      'account_locked': 'Conta Bloqueada',
      'account_unlocked': 'Conta Desbloqueada',
      'user_created': 'Usuário Criado',
      'user_deleted': 'Usuário Excluído'
    }
    return types[type] || type
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return formatDate(dateString)
  }

  const handleExportEvents = () => {
    // Implementar lógica para exportar eventos
    console.log('Exporting security events')
  }

  const handleRefresh = () => {
    // Implementar lógica para atualizar eventos
    console.log('Refreshing security events')
  }

  const handleMarkResolved = (eventId: string) => {
    // Implementar lógica para marcar evento como resolvido
    console.log('Marking event as resolved:', eventId)
  }

  // Filtrar eventos
  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = selectedSeverity === 'all' || event.severity === selectedSeverity
    const matchesType = selectedType === 'all' || event.type === selectedType
    
    return matchesSearch && matchesSeverity && matchesType
  })

  // Estatísticas
  const totalEvents = securityEvents.length
  const highSeverityEvents = securityEvents.filter(e => e.severity === 'high').length
  const unresolvedEvents = securityEvents.filter(e => !e.resolved).length
  const recentEvents = securityEvents.filter(e => {
    const eventDate = new Date(e.timestamp)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return eventDate > oneDayAgo
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/security">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Eventos de Segurança</h1>
          <p className="text-gray-600 mt-2">
            Monitore e analise eventos de segurança do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleExportEvents}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link 
                href="/dashboard/security" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Segurança
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500">
                Eventos de Segurança
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Alerta para eventos críticos */}
      {unresolvedEvents > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você tem {unresolvedEvents} evento(s) de segurança não resolvido(s) que requer(em) atenção.
          </AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-gray-600">Últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Eventos Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">{highSeverityEvents}</div>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Não Resolvidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unresolvedEvents}</div>
            <p className="text-xs text-gray-600">Requer atenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Últimas 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEvents}</div>
            <p className="text-xs text-gray-600">Eventos recentes</p>
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
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Severidade</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="login_failed">Login Falhado</SelectItem>
                  <SelectItem value="login_success">Login Bem-sucedido</SelectItem>
                  <SelectItem value="password_change">Alteração de Senha</SelectItem>
                  <SelectItem value="permission_change">Alteração de Permissões</SelectItem>
                  <SelectItem value="data_access">Acesso a Dados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Último dia</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Eventos de Segurança ({filteredEvents.length})
          </h2>
        </div>
        
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-gray-600">
                  Não há eventos de segurança que correspondam aos filtros selecionados
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className={!event.resolved ? 'border-l-4 border-l-orange-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        {getSeverityBadge(event.severity)}
                        <Badge variant="outline">
                          {getEventTypeLabel(event.type)}
                        </Badge>
                        {!event.resolved && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Não Resolvido
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">
                        {event.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!event.resolved && (
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkResolved(event.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolver
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Usuário:</span>
                      <span>{event.user}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Localização:</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">IP:</span>
                      <span>{event.ip}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Data/Hora:</span>
                      <span>{formatDate(event.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Há:</span>
                      <span>{getTimeAgo(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                {event.actions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Ações Tomadas:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {event.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Informações sobre Eventos de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sobre os Eventos de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Tipos de eventos monitorados:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><strong>Login Falhado:</strong> Tentativas de login malsucedidas</li>
                <li><strong>Login Bem-sucedido:</strong> Acessos realizados com sucesso</li>
                <li><strong>Alteração de Senha:</strong> Mudanças de credenciais</li>
                <li><strong>Alteração de Permissões:</strong> Modificações em níveis de acesso</li>
                <li><strong>Acesso a Dados:</strong> Visualização de informações sensíveis</li>
                <li><strong>Conta Bloqueada/Desbloqueada:</strong> Alterações no status da conta</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Níveis de severidade:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><strong>Alta:</strong> Eventos que requerem ação imediata</li>
                <li><strong>Média:</strong> Eventos que devem ser monitorados</li>
                <li><strong>Baixa:</strong> Eventos informativos para auditoria</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Retenção de dados:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Eventos são mantidos por 90 dias por padrão</li>
                <li>Eventos críticos são arquivados por 1 ano</li>
                <li>Logs podem ser exportados para análise externa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SecurityEventsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <Suspense fallback={<SecurityEventsSkeleton />}>
        <SecurityEventsManagement />
      </Suspense>
    </div>
  )
}