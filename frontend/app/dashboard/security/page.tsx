import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Activity,
  Lock,
  Users,
  Eye,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { TwoFactorStatus } from '@/components/profile/TwoFactorStatus'

export const metadata: Metadata = {
  title: 'Segurança | DataClínica',
  description: 'Gerencie as configurações de segurança da sua conta',
}

function SecuritySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SecurityOverview() {
  const securityItems = [
    {
      title: 'Autenticação 2FA',
      description: 'Configure a autenticação de dois fatores para maior segurança',
      icon: Shield,
      status: 'active', // active, inactive, warning
      href: '/dashboard/security/2fa',
      action: 'Gerenciar'
    },
    {
      title: 'Sessões Ativas',
      description: 'Monitore e gerencie suas sessões ativas',
      icon: Activity,
      status: 'active',
      href: '/dashboard/security/sessions',
      action: 'Ver Sessões'
    },
    {
      title: 'Histórico de Login',
      description: 'Visualize o histórico de acessos à sua conta',
      icon: Clock,
      status: 'active',
      href: '/dashboard/security/login-history',
      action: 'Ver Histórico'
    },
    {
      title: 'Dispositivos Confiáveis',
      description: 'Gerencie dispositivos autorizados para acesso',
      icon: Smartphone,
      status: 'active',
      href: '/dashboard/security/trusted-devices',
      action: 'Gerenciar'
    },
    {
      title: 'Alteração de Senha',
      description: 'Altere sua senha de acesso regularmente',
      icon: Key,
      status: 'warning',
      href: '/dashboard/security/change-password',
      action: 'Alterar'
    },
    {
      title: 'Eventos de Segurança',
      description: 'Monitore eventos e alertas de segurança',
      icon: AlertTriangle,
      status: 'active',
      href: '/dashboard/security/events',
      action: 'Ver Eventos'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'inactive':
        return <Lock className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Segurança</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as configurações de segurança da sua conta
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurações Avançadas
        </Button>
      </div>

      {/* Status Geral */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Status de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-medium">Sua conta está segura</p>
              <p className="text-green-600 text-sm">
                Todas as configurações de segurança estão ativas
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Protegido
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Funcionalidades */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {securityItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.title}</span>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(item.status)} flex items-center gap-1`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status === 'active' ? 'Ativo' : 
                         item.status === 'warning' ? 'Atenção' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription>
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={item.href}>
                  <Button className="w-full" variant="outline">
                    {item.action}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Status 2FA Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status da Autenticação 2FA
          </CardTitle>
          <CardDescription>
            Configuração detalhada da autenticação de dois fatores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorStatus />
        </CardContent>
      </Card>

      {/* Dicas de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Dicas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Use senhas fortes</h4>
                <p className="text-sm text-gray-600">
                  Combine letras, números e símbolos especiais
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Ative o 2FA</h4>
                <p className="text-sm text-gray-600">
                  Adicione uma camada extra de proteção
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Monitore acessos</h4>
                <p className="text-sm text-gray-600">
                  Verifique regularmente o histórico de login
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Mantenha atualizado</h4>
                <p className="text-sm text-gray-600">
                  Atualize suas informações de segurança regularmente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Suspense fallback={<SecuritySkeleton />}>
        <SecurityOverview />
      </Suspense>
    </div>
  )
}