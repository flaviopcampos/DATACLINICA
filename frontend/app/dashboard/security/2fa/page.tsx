import { Metadata } from 'next'
import { Suspense } from 'react'
import { TwoFactorManagement } from '@/components/auth/TwoFactorManagement'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gerenciar 2FA | DataClínica',
  description: 'Gerencie suas configurações de autenticação de dois fatores',
}

function ManagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Status Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-6 w-6" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Devices Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TwoFactorManagementPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/security">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Autenticação 2FA
            </h1>
            <p className="text-gray-600">
              Gerencie suas configurações de autenticação de dois fatores
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
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
                Autenticação 2FA
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Content */}
      <Suspense fallback={<ManagementSkeleton />}>
        <TwoFactorManagement />
      </Suspense>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <h3 className="text-lg font-semibold">Precisa de Ajuda?</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Apps Recomendados:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Google Authenticator</li>
                <li>• Microsoft Authenticator</li>
                <li>• Authy</li>
                <li>• 1Password</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Dicas de Segurança:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Mantenha seus códigos de backup seguros</li>
                <li>• Use um app autenticador confiável</li>
                <li>• Revise dispositivos confiáveis regularmente</li>
                <li>• Monitore os logs de autenticação</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Em caso de problemas, entre em contato com o suporte técnico através do{' '}
              <Link href="/support" className="text-blue-600 hover:text-blue-700 underline">
                centro de ajuda
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}