"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { z } from 'zod'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Schema de validação para reset de senha
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password')

  // Verificar se há uma sessão válida para reset de senha
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { authService } = await import('@/lib/supabase')
        const { data: { session } } = await authService.getSession()
        
        // Verificar se há um token de acesso válido ou parâmetros de reset
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        
        if (session || accessToken) {
          setIsValidSession(true)
        } else {
          setIsValidSession(false)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        setIsValidSession(false)
      }
    }

    checkSession()
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    
    try {
      const { authService } = await import('@/lib/supabase')
      
      const { error } = await authService.updatePassword(data.password)
      
      if (error) {
        if (error.message.includes('session')) {
          setError('root', {
            message: 'Sessão expirada. Solicite um novo link de recuperação.'
          })
        } else {
          setError('root', {
            message: error.message || 'Erro ao atualizar senha'
          })
        }
      } else {
        setIsSuccess(true)
      }
      
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      setError('root', {
        message: 'Erro interno do servidor. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para avaliar a força da senha
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    
    if (score <= 2) return { score, label: 'Fraca', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Média', color: 'bg-yellow-500' }
    if (score <= 4) return { score, label: 'Forte', color: 'bg-green-500' }
    return { score, label: 'Muito Forte', color: 'bg-green-600' }
  }

  const passwordStrength = getPasswordStrength(password || '')

  // Loading state enquanto verifica a sessão
  if (isValidSession === null) {
    return (
      <AuthLayout
        title="Verificando sessão..."
        subtitle="Aguarde um momento"
        showBackButton={false}
      >
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    )
  }

  // Sessão inválida
  if (!isValidSession) {
    return (
      <AuthLayout
        title="Link inválido ou expirado"
        subtitle="Não foi possível verificar sua identidade"
        showBackButton={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              O link de recuperação de senha é inválido ou expirou.
            </p>
            <p className="text-sm text-muted-foreground">
              Links de recuperação expiram em 1 hora por segurança.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/forgot-password" className="block">
              <Button className="w-full">
                Solicitar novo link
              </Button>
            </Link>

            <Link href="/auth/login" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // Sucesso
  if (isSuccess) {
    return (
      <AuthLayout
        title="Senha atualizada!"
        subtitle="Sua senha foi alterada com sucesso"
        showBackButton={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              Sua senha foi alterada com sucesso.
            </p>
            <p className="text-sm text-muted-foreground">
              Agora você pode fazer login com sua nova senha.
            </p>
          </div>

          <Link href="/auth/login" className="block">
            <Button className="w-full">
              Fazer login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Digite sua nova senha"
      showBackButton={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nova senha */}
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua nova senha"
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
          
          {/* Indicador de força da senha */}
          {password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirmar senha */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Digite novamente sua nova senha"
              {...register('confirmPassword')}
              className={cn(
                errors.confirmPassword && 'border-destructive',
                'pr-10'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Requisitos da senha */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Requisitos da senha:</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className={password?.length >= 8 ? 'text-green-700' : ''}>
              • Pelo menos 8 caracteres
            </li>
            <li className={/[A-Z]/.test(password || '') ? 'text-green-700' : ''}>
              • Uma letra maiúscula
            </li>
            <li className={/[a-z]/.test(password || '') ? 'text-green-700' : ''}>
              • Uma letra minúscula
            </li>
            <li className={/[0-9]/.test(password || '') ? 'text-green-700' : ''}>
              • Um número
            </li>
          </ul>
        </div>

        {/* Erro geral */}
        {errors.root && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {errors.root.message}
          </div>
        )}

        {/* Botão de envio */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando senha...
            </>
          ) : (
            'Atualizar senha'
          )}
        </Button>

        {/* Links de navegação */}
        <div className="text-center space-y-2">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar ao login
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}