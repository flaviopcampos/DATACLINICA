'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { TwoFactorVerifyResponse } from '@/types/twoFactor'

function VerificationSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function TwoFactorVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Parâmetros da URL
  const email = searchParams.get('email')
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'
  const sessionToken = searchParams.get('sessionToken')

  useEffect(() => {
    // Verificar se temos os parâmetros necessários
    if (!email || !sessionToken) {
      setError('Parâmetros de autenticação inválidos')
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
      return
    }

    setUserEmail(email)
    setIsLoading(false)
  }, [email, sessionToken, router])

  const handleVerified = async (response: TwoFactorVerifyResponse) => {
    try {
      // Completar o processo de login com o token 2FA
      await login({
        sessionToken,
        twoFactorToken: response.token,
        rememberDevice: response.remember_device
      })

      // Redirecionar para a página de destino
      router.push(returnUrl)
    } catch (error: any) {
      setError(error.message || 'Erro ao completar autenticação')
    }
  }

  const handleBack = () => {
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <VerificationSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecionando para a página de login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificação 2FA
          </h1>
          <p className="text-gray-600">
            Digite o código do seu app autenticador para continuar
          </p>
        </div>

        <TwoFactorVerification
          onVerified={handleVerified}
          onBack={handleBack}
          userEmail={userEmail}
          rememberDevice={true}
        />

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Problemas com o acesso?{' '}
            <a 
              href="/auth/recovery" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Usar código de recuperação
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}