'use client'

import { Suspense } from 'react'
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function SetupSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function TwoFactorSetupPage() {
  const handleComplete = () => {
    // Redirecionar para dashboard ou página anterior
    window.location.href = '/dashboard/security/2fa'
  }

  const handleCancel = () => {
    // Voltar para página anterior ou dashboard
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurar Autenticação 2FA
          </h1>
          <p className="text-gray-600">
            Adicione uma camada extra de segurança à sua conta DataClínica
          </p>
        </div>

        <Suspense fallback={<SetupSkeleton />}>
          <TwoFactorSetup
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </Suspense>
      </div>
    </div>
  )
}