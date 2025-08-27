"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const credentials = {
        username: data.username,
        password: data.password
      }
      
      const result = await login(credentials)
      
      if (result.success) {
        if (result.requiresTwoFactor && result.sessionToken) {
          // Redirecionar para verificação 2FA
          router.push(`/auth/2fa/verify?sessionToken=${result.sessionToken}`)
        } else {
          // Login completo, redirecionar para dashboard
          router.push('/dashboard')
        }
      } else {
        setError('root', {
          type: 'manual',
          message: 'Nome de usuário ou senha incorretos'
        })
      }
      
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      // Tratar diferentes tipos de erro
      if (error?.response?.status === 401) {
        setError('root', {
          type: 'manual',
          message: 'Nome de usuário ou senha incorretos'
        })
      } else if (error?.response?.status === 429) {
        setError('root', {
          type: 'manual',
          message: 'Muitas tentativas. Tente novamente em alguns minutos.'
        })
      } else {
        setError('root', {
          type: 'manual',
          message: 'Erro interno do servidor. Tente novamente.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sistema de gestão Data Clínica"
      subtitle="Acesso Restrito"
      showBackButton
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nome de usuário */}
        <div className="space-y-2">
          <Label htmlFor="username">Nome de usuário</Label>
          <Input
            id="username"
            type="text"
            placeholder="Digite seu nome de usuário"
            autoComplete="username"
            {...register('username')}
            className={cn(errors.username && 'border-destructive')}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              {...register('password')}
              className={cn(
                errors.password && 'border-destructive',
                'pr-10'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Erro geral */}
        {errors.root && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {errors.root.message}
          </div>
        )}

        {/* Link para recuperar senha */}
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        {/* Botão de login */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>

        {/* Informação sobre credenciais */}
        <div className="text-center text-sm space-y-2">
          <p className="text-muted-foreground">
            Sistema privado da clínica de saúde mental
          </p>
          <p className="text-xs text-muted-foreground">
            Suas credenciais de acesso são fornecidas pelo administrador do sistema.
            Entre em contato com a administração caso tenha problemas para acessar.
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}