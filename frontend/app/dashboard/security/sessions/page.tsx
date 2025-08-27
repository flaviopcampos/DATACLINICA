'use client'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Activity, 
  Monitor, 
  Smartphone, 
  Tablet,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// Metadata moved to layout.tsx since this is now a Client Component

function SessionsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SessionsManagement() {
  // Mock data - em produção viria de um hook/API
  const sessions = [
    {
      id: '1',
      device: 'Windows PC',
      browser: 'Chrome 120.0',
      location: 'São Paulo, SP, Brasil',
      ip: '192.168.1.100',
      lastActivity: '2024-01-15T10:30:00Z',
      isCurrent: true,
      deviceType: 'desktop'
    },
    {
      id: '2',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'São Paulo, SP, Brasil',
      ip: '192.168.1.101',
      lastActivity: '2024-01-15T09:15:00Z',
      isCurrent: false,
      deviceType: 'mobile'
    },
    {
      id: '3',
      device: 'iPad Pro',
      browser: 'Safari',
      location: 'Rio de Janeiro, RJ, Brasil',
      ip: '201.23.45.67',
      lastActivity: '2024-01-14T16:45:00Z',
      isCurrent: false,
      deviceType: 'tablet'
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

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h atrás`
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`
  }

  const handleTerminateSession = (sessionId: string) => {
    // Implementar lógica para terminar sessão
    console.log('Terminating session:', sessionId)
  }

  const handleTerminateAllOthers = () => {
    // Implementar lógica para terminar todas as outras sessões
    console.log('Terminating all other sessions')
  }

  const handleRefresh = () => {
    // Implementar lógica para atualizar lista de sessões
    console.log('Refreshing sessions')
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Sessões Ativas</h1>
          <p className="text-gray-600 mt-2">
            Monitore e gerencie todas as sessões ativas da sua conta
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleTerminateAllOthers}
            disabled={sessions.filter(s => !s.isCurrent).length === 0}
          >
            Terminar Outras Sessões
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
                Sessões Ativas
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Alerta de Segurança */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Se você não reconhece alguma sessão, termine-a imediatamente e altere sua senha.
        </AlertDescription>
      </Alert>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sessão Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Ativa</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Outras Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => !s.isCurrent).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Sessões */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todas as Sessões</h2>
        
        {sessions.map((session) => (
          <Card key={session.id} className={session.isCurrent ? 'border-green-200 bg-green-50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{session.device}</span>
                      {session.isCurrent && (
                        <Badge className="bg-green-100 text-green-800">
                          Sessão Atual
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-normal">
                      {session.browser}
                    </p>
                  </div>
                </CardTitle>
                {!session.isCurrent && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Terminar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <span>IP: {session.ip}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Última atividade: {formatLastActivity(session.lastActivity)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Como proteger sua conta:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Termine sessões que você não reconhece</li>
                <li>Use sempre conexões seguras (HTTPS)</li>
                <li>Evite acessar sua conta em computadores públicos</li>
                <li>Mantenha seu navegador atualizado</li>
                <li>Ative a autenticação de dois fatores</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sobre as sessões:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Sessões expiram automaticamente após 30 dias de inatividade</li>
                <li>Você pode ter até 10 sessões ativas simultaneamente</li>
                <li>Alterações de senha terminam todas as outras sessões</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SessionsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <Suspense fallback={<SessionsSkeleton />}>
        <SessionsManagement />
      </Suspense>
    </div>
  )
}