'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter, usePathname } from 'next/navigation'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Provider de autenticação que gerencia o estado global de auth
 * e verifica a autenticação ao carregar a aplicação
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const { checkAuth, isAuthenticated, isLoading, requiresTwoFactor } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  // Rotas que não requerem autenticação
  const publicRoutes = [
    '/',
    '/auth/login',
    
    '/auth/forgot-password',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ]

  // Rotas de 2FA que requerem sessionToken mas não autenticação completa
  const twoFactorRoutes = [
    '/auth/2fa/verify',
    '/auth/2fa/setup'
  ]

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route => pathname === route)
  
  // Verificar se é rota de 2FA
  const isTwoFactorRoute = twoFactorRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initAuth()
  }, [])

  // Mostrar loading enquanto verifica autenticação
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado e tentando acessar rota protegida
  if (!isAuthenticated && !isPublicRoute && !isTwoFactorRoute) {
    router.push('/auth/login')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para dashboard se autenticado e tentando acessar rota de auth (exceto 2FA)
  if (isAuthenticated && pathname.startsWith('/auth/') && !isTwoFactorRoute) {
    router.push('/dashboard')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Se está em processo de 2FA mas tentando acessar rota protegida
  if (requiresTwoFactor && !isPublicRoute && !isTwoFactorRoute) {
    router.push('/auth/2fa/verify')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para verificação...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Hook para usar o AuthProvider
 */
export function useAuthProvider() {
  const authStore = useAuthStore()
  return authStore
}