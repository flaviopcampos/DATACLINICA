'use client'

import { useAuthStore } from '@/store/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook personalizado para gerenciar autenticação
 * Fornece acesso ao estado de autenticação e métodos relacionados
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    requiresTwoFactor,
    sessionToken,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    forgotPassword,
    resetPassword,
    clearTwoFactorState,
  } = useAuthStore()

  const router = useRouter()
  const pathname = usePathname()

  // Verificar autenticação ao montar o componente, mas não nas páginas de auth
  useEffect(() => {
    // Não verificar auth nas páginas de login, registro ou reset de senha
    const isAuthPage = pathname?.startsWith('/auth/')
    if (!isAuthPage) {
      checkAuth()
    }
  }, [pathname])

  // Função para redirecionar após login com suporte ao 2FA
  const loginAndRedirect = async (credentials: Parameters<typeof login>[0], redirectTo = '/dashboard') => {
    const result = await login(credentials)
    
    if (result.success) {
      if (result.requiresTwoFactor) {
        // Redirecionar para página de verificação 2FA
        router.push(`/auth/2fa/verify?sessionToken=${result.sessionToken}`)
        return result
      } else {
        // Login completo, redirecionar para dashboard
        router.push(redirectTo)
        return result
      }
    }
    
    return result
  }

  // Função para redirecionar após registro
  const registerAndRedirect = async (data: Parameters<typeof register>[0], redirectTo = '/dashboard') => {
    const success = await register(data)
    if (success) {
      router.push(redirectTo)
    }
    return success
  }

  // Função para logout com redirecionamento
  const logoutAndRedirect = () => {
    logout()
    router.push('/auth/login')
  }

  // Verificar se o usuário tem uma role específica
  const hasRole = (role: string | string[]) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  // Verificar se é admin
  const isAdmin = () => hasRole('admin')

  // Verificar se é médico
  const isDoctor = () => hasRole('doctor')

  // Verificar se é recepcionista
  const isReceptionist = () => hasRole('receptionist')

  return {
    // Estado
    user,
    token,
    isAuthenticated,
    isLoading,
    requiresTwoFactor,
    sessionToken,
    
    // Métodos básicos
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    forgotPassword,
    resetPassword,
    clearTwoFactorState,
    
    // Métodos com redirecionamento
    loginAndRedirect,
    registerAndRedirect,
    logoutAndRedirect,
    
    // Verificações de role
    hasRole,
    isAdmin,
    isDoctor,
    isReceptionist,
  }
}

/**
 * Hook para proteger rotas que requerem autenticação
 * Redireciona para login se não estiver autenticado
 */
export function useRequireAuth(redirectTo = '/auth/login') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}

/**
 * Hook para proteger rotas que requerem roles específicas
 * Redireciona se não tiver a role necessária
 */
export function useRequireRole(requiredRole: string | string[], redirectTo = '/dashboard') {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !hasRole(requiredRole)) {
      router.push(redirectTo)
    }
  }, [user, isAuthenticated, isLoading, hasRole, requiredRole, router, redirectTo])

  return { 
    isAuthenticated, 
    isLoading, 
    hasRequiredRole: user ? hasRole(requiredRole) : false 
  }
}