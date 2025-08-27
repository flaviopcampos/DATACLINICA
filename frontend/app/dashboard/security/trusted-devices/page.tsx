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
  Monitor, 
  Smartphone, 
  Tablet,
  MapPin,
  Clock,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// Metadata moved to layout.tsx since this is now a Client Component

function TrustedDevicesSkeleton() {
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

function TrustedDevicesManagement() {
  // Mock data - em produção viria de um hook/API
  const trustedDevices = [
    {
      id: '1',
      name: 'Meu PC Principal',
      device: 'Windows PC',
      browser: 'Chrome 120.0',
      location: 'São Paulo, SP, Brasil',
      ip: '192.168.1.100',
      addedAt: '2024-01-10T14:30:00Z',
      lastUsed: '2024-01-15T10:30:00Z',
      deviceType: 'desktop',
      isActive: true
    },
    {
      id: '2',
      name: 'iPhone Pessoal',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'São Paulo, SP, Brasil',
      ip: '192.168.1.101',
      addedAt: '2024-01-08T09:15:00Z',
      lastUsed: '2024-01-15T09:15:00Z',
      deviceType: 'mobile',
      isActive: true
    },
    {
      id: '3',
      name: 'iPad do Trabalho',
      device: 'iPad Pro',
      browser: 'Safari',
      location: 'São Paulo, SP, Brasil',
      ip: '192.168.1.102',
      addedAt: '2024-01-05T16:45:00Z',
      lastUsed: '2024-01-12T16:45:00Z',
      deviceType: 'tablet',
      isActive: false
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

  const getLastUsedText = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Hoje'
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `${diffInDays} dias atrás`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`
    return `${Math.floor(diffInDays / 30)} meses atrás`
  }

  const handleRemoveDevice = (deviceId: string) => {
    // Implementar lógica para remover dispositivo confiável
    console.log('Removing trusted device:', deviceId)
  }

  const handleRemoveAllInactive = () => {
    // Implementar lógica para remover todos os dispositivos inativos
    console.log('Removing all inactive devices')
  }

  const handleRefresh = () => {
    // Implementar lógica para atualizar lista de dispositivos
    console.log('Refreshing trusted devices')
  }

  const activeDevices = trustedDevices.filter(device => device.isActive).length
  const inactiveDevices = trustedDevices.filter(device => !device.isActive).length

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
          <h1 className="text-3xl font-bold text-gray-900">Dispositivos Confiáveis</h1>
          <p className="text-gray-600 mt-2">
            Gerencie dispositivos autorizados para acesso sem verificação 2FA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleRemoveAllInactive}
            disabled={inactiveDevices === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remover Inativos
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
                Dispositivos Confiáveis
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Alerta Informativo */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Dispositivos confiáveis podem acessar sua conta sem verificação 2FA. 
          Remova dispositivos que você não usa mais ou não reconhece.
        </AlertDescription>
      </Alert>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trustedDevices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dispositivos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">{activeDevices}</div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dispositivos Inativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveDevices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Dispositivos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Seus Dispositivos Confiáveis</h2>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Dispositivo Atual
          </Button>
        </div>
        
        {trustedDevices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum dispositivo confiável
                </h3>
                <p className="text-gray-600 mb-4">
                  Adicione dispositivos confiáveis para facilitar o acesso futuro
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Este Dispositivo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          trustedDevices.map((device) => (
            <Card key={device.id} className={!device.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{device.name}</span>
                        <Badge 
                          className={device.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {device.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 font-normal">
                        {device.device} • {device.browser}
                      </p>
                    </div>
                  </CardTitle>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveDevice(device.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{device.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">IP:</span>
                      <span>{device.ip}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Adicionado: {formatDate(device.addedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Último uso:</span>
                      <span>{getLastUsedText(device.lastUsed)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Informações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Como funcionam os dispositivos confiáveis:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Dispositivos confiáveis não precisam de verificação 2FA para login</li>
                <li>Um dispositivo se torna confiável quando você marca "Lembrar este dispositivo" no login</li>
                <li>A confiança expira automaticamente após 30 dias de inatividade</li>
                <li>Você pode remover a confiança de qualquer dispositivo a qualquer momento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recomendações de segurança:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Apenas marque como confiáveis dispositivos pessoais e seguros</li>
                <li>Nunca marque computadores públicos ou compartilhados como confiáveis</li>
                <li>Revise regularmente sua lista de dispositivos confiáveis</li>
                <li>Remova dispositivos que você não usa mais ou perdeu</li>
                <li>Se suspeitar de atividade suspeita, remova todos os dispositivos confiáveis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Gerenciamento automático:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Dispositivos inativos por mais de 30 dias são automaticamente removidos</li>
                <li>Alterações de senha removem todos os dispositivos confiáveis</li>
                <li>Você pode ter no máximo 10 dispositivos confiáveis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TrustedDevicesPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <Suspense fallback={<TrustedDevicesSkeleton />}>
        <TrustedDevicesManagement />
      </Suspense>
    </div>
  )
}