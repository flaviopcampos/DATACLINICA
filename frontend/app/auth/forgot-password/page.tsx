"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    
    try {
      // Importar o authService do Supabase
      const { authService } = await import('@/lib/supabase')
      
      const { error } = await authService.resetPassword(data.email)
      
      if (error) {
        if (error.message.includes('User not found')) {
          setError('email', {
            message: 'Email não encontrado em nossa base de dados'
          })
        } else if (error.message.includes('rate limit')) {
          setError('root', {
            message: 'Muitas tentativas. Tente novamente em alguns minutos.'
          })
        } else {
          setError('root', {
            message: error.message || 'Erro ao enviar email de recuperação'
          })
        }
      } else {
        setEmail(data.email)
        setIsSuccess(true)
      }
      
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error)
      setError('root', {
        message: 'Erro interno do servidor. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    
    try {
      const { authService } = await import('@/lib/supabase')
      
      const { error } = await authService.resetPassword(email)
      
      if (error) {
        console.error('Erro ao reenviar email:', error)
        // Pode usar toast para mostrar erro
      } else {
        // Pode usar toast para mostrar sucesso
        console.log('Email reenviado com sucesso')
      }
      
    } catch (error) {
      console.error('Erro ao reenviar email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Email enviado"
        subtitle="Verifique sua caixa de entrada"
        showBackButton={false}
      >
        <div className="text-center space-y-6">
          {/* Ícone de sucesso */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Enviamos um link de recuperação de senha para:
            </p>
            <p className="font-medium text-foreground">{email}</p>
          </div>

          {/* Instruções */}
          <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground space-y-2">
            <p className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Verifique sua caixa de entrada e spam
            </p>
            <p>O link expira em 1 hora por segurança</p>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                'Reenviar email'
              )}
            </Button>

            <Link href="/auth/login" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </Link>
          </div>

          {/* Suporte */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Não recebeu o email?</p>
            <Link
              href="/support"
              className="text-primary hover:underline"
            >
              Entre em contato com o suporte
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Digite seu email para receber o link de recuperação"
      showBackButton
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
            className={cn(errors.email && 'border-destructive')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Informações sobre o processo */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Como funciona:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Enviaremos um link seguro para seu email</li>
                <li>• O link expira em 1 hora</li>
                <li>• Você poderá criar uma nova senha</li>
              </ul>
            </div>
          </div>
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
              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
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