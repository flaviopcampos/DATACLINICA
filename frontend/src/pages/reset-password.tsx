import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { authService } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há uma sessão válida para redefinição de senha
    const checkSession = async () => {
      const { session } = await authService.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        // Se não há sessão, redirecionar para forgot-password
        router.push('/forgot-password')
      }
    }
    
    checkSession()
  }, [])

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8
    const hasUpperCase = /[A-Z]/.test(pwd)
    const hasLowerCase = /[a-z]/.test(pwd)
    const hasNumbers = /\d/.test(pwd)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers
    }
  }

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password === confirmPassword && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordValidation.isValid) {
      setError('A senha não atende aos critérios de segurança')
      return
    }
    
    if (!passwordsMatch) {
      setError('As senhas não coincidem')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error } = await authService.updatePassword(password)
      
      if (error) {
        setError(error.message || 'Erro ao redefinir senha')
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sessão Inválida
            </CardTitle>
            <CardDescription className="text-gray-600">
              O link de redefinição de senha expirou ou é inválido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/forgot-password')} 
              className="w-full"
            >
              Solicitar Novo Link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Senha Redefinida!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sua senha foi alterada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Nova Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Critérios de senha */}
              {password && (
                <div className="text-xs space-y-1 mt-2">
                  <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-2">{passwordValidation.minLength ? '✓' : '✗'}</span>
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-2">{passwordValidation.hasUpperCase ? '✓' : '✗'}</span>
                    Pelo menos uma letra maiúscula
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-2">{passwordValidation.hasLowerCase ? '✓' : '✗'}</span>
                    Pelo menos uma letra minúscula
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-2">{passwordValidation.hasNumbers ? '✓' : '✗'}</span>
                    Pelo menos um número
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {confirmPassword && (
                <div className={`text-xs flex items-center ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordsMatch ? '✓' : '✗'}</span>
                  As senhas coincidem
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
              className="w-full"
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}