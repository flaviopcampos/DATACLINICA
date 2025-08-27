'use client'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Clock, 
  Monitor, 
  Smartphone, 
  Tablet,
  MapPin,
  CheckCircle,
  AlertTriangle,
  X,
  Search,
  Filter,
  Download,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

// Metadata moved to layout.tsx since this is now a Client Component

function LoginHistorySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function LoginHistoryManagement() {
  // Mock data - em produção viria de um hook/API
  const loginHistory = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      device: 'Windows PC',
      browser: 'Chrome 120.0',
      location: 'São Paulo, SP, Brasil',
      ip: '192.168.1.100',
      status: 'success',
      deviceType: 'desktop',
      method: '2FA'
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:15:00Z',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'São Paulo, SP, Brasil',
      ip: '192.168.1.101',
      status: 'success',
      deviceType: 'mobile',
      method: 'Password'
    },
    {
      id: '3',
      timestamp: '2024-01-14T16:45:00Z',
      device: 'iPad Pro',
      browser: 'Safari',
      location: 'Rio de Janeiro, RJ, Brasil',
      ip: '201.23.45.67',
      status: 'success',
      deviceType: 'tablet',
      method: '2FA'
    },
    {
      id: '4',
      timestamp: '2024-01-14T14:20:00Z',
      device: 'Unknown Device',
      browser: 'Chrome 119.0',
      location: 'Brasília, DF, Brasil',
      ip: '189.45.67.89',
      status: 'failed',
      deviceType: 'desktop',
      method: 'Password'
    },
    {
      id: '5',
      timestamp: '2024-01-13T11:30:00Z',
      device: 'Windows PC',
      browser: 'Chrome 120.0',
      location: 'São Paulo, SP, Brasil',
      ip: '192.168.1.100',
      status: 'success',
      deviceType: 'desktop',
      method: '2FA'
    }
  ]

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />
      case 'tablet':
        return <Tablet className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleExport = () => {
    // Implementar lógica para exportar histórico
    console.log('Exporting login history')
  }

  const successfulLogins = loginHistory.filter(login => login.status === 'success').length
  const failedLogins = loginHistory.filter(login => login.status === 'failed').length
  const uniqueDevices = new Set(loginHistory.map(login => login.device)).size
  const uniqueLocations = new Set(loginHistory.map(login => login.location)).size

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
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Login</h1>
          <p className="text-gray-600 mt-2">
            Visualize todos os acessos à sua conta nos últimos 90 dias
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
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
                Histórico de Login
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Acessos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loginHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Acessos Bem-sucedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">{successfulLogins}</div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tentativas Falhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">{failedLogins}</div>
              <X className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dispositivos Únicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueDevices}</div>
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
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar por dispositivo, localização ou IP..." 
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falha</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Dispositivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Histórico */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Histórico Detalhado</h2>
        
        {loginHistory.map((login) => (
          <Card key={login.id} className={login.status === 'failed' ? 'border-red-200' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getDeviceIcon(login.deviceType)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{login.device}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{login.browser}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimestamp(login.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{login.location}</span>
                      </div>
                      <span>IP: {login.ip}</span>
                      <span>Método: {login.method}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(login.status)}
                  <Badge className={getStatusColor(login.status)}>
                    {login.status === 'success' ? 'Sucesso' : 'Falha'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando 1-{loginHistory.length} de {loginHistory.length} registros
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próximo
          </Button>
        </div>
      </div>

      {/* Informações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Histórico de Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">O que monitoramos:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Data e hora de cada tentativa de login</li>
                <li>Dispositivo e navegador utilizados</li>
                <li>Localização geográfica aproximada</li>
                <li>Endereço IP de origem</li>
                <li>Método de autenticação utilizado</li>
                <li>Status da tentativa (sucesso ou falha)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Retenção de dados:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Mantemos o histórico por 90 dias</li>
                <li>Dados mais antigos são automaticamente removidos</li>
                <li>Você pode exportar seus dados a qualquer momento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sinais de alerta:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Múltiplas tentativas de login falhadas</li>
                <li>Acessos de localizações desconhecidas</li>
                <li>Dispositivos não reconhecidos</li>
                <li>Horários incomuns de acesso</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginHistoryPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <Suspense fallback={<LoginHistorySkeleton />}>
        <LoginHistoryManagement />
      </Suspense>
    </div>
  )
}