'use client'

import { useState } from 'react'
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { twoFactorService } from '@/services/twoFactorService'
import type { TwoFactorVerificationProps } from '@/types/twoFactor'

export function TwoFactorVerification({
  onVerified,
  onBack,
  userEmail,
  rememberDevice = false
}: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)

  const maxAttempts = 5
  const blockDuration = 300 // 5 minutos em segundos

  const handleVerification = async () => {
    const code = useBackupCode ? backupCode.trim() : verificationCode.trim()
    
    if (!code) {
      toast.error('Digite o código de verificação')
      return
    }

    if (!useBackupCode && code.length !== 6) {
      toast.error('O código deve ter 6 dígitos')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await twoFactorService.verify({
        code,
        backup_code: useBackupCode ? code : undefined,
        remember_device: rememberDevice
      })

      if (response.success) {
        toast.success('Verificação realizada com sucesso!')
        onVerified?.(response)
      } else {
        throw new Error(response.message || 'Código inválido')
      }
    } catch (error: any) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= maxAttempts) {
        setIsBlocked(true)
        setBlockTimeRemaining(blockDuration)
        startBlockTimer()
        toast.error('Muitas tentativas incorretas. Tente novamente em 5 minutos.')
      } else {
        const remainingAttempts = maxAttempts - newAttempts
        toast.error(`${error.message}. ${remainingAttempts} tentativas restantes.`)
      }
      
      // Limpar campos após erro
      setVerificationCode('')
      setBackupCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const startBlockTimer = () => {
    const timer = setInterval(() => {
      setBlockTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsBlocked(false)
          setAttempts(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isBlocked) {
      handleVerification()
    }
  }

  const resetForm = () => {
    setVerificationCode('')
    setBackupCode('')
    setUseBackupCode(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Verificação 2FA</CardTitle>
        <CardDescription>
          {userEmail && (
            <span className="block mb-2 font-medium">{userEmail}</span>
          )}
          {useBackupCode 
            ? 'Digite um dos seus códigos de backup'
            : 'Digite o código do seu app autenticador'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isBlocked ? (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="text-center">
                <div className="font-medium mb-2">Conta temporariamente bloqueada</div>
                <div className="text-2xl font-mono mb-2">{formatTime(blockTimeRemaining)}</div>
                <div className="text-sm">Tente novamente após o tempo expirar</div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Campo de Verificação */}
            <div className="space-y-2">
              <Label htmlFor={useBackupCode ? 'backup-code' : 'verification-code'}>
                {useBackupCode ? 'Código de Backup:' : 'Código de Verificação:'}
              </Label>
              
              {useBackupCode ? (
                <Input
                  id="backup-code"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="XXXXXXXX"
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={8}
                  disabled={isLoading}
                />
              ) : (
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  placeholder="000000"
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
              )}
            </div>

            {/* Informações sobre tentativas */}
            {attempts > 0 && (
              <Alert variant={attempts >= 3 ? 'destructive' : 'default'}>
                <AlertDescription>
                  {attempts >= 3 
                    ? `⚠️ ${maxAttempts - attempts} tentativas restantes antes do bloqueio`
                    : `${attempts} tentativa${attempts > 1 ? 's' : ''} incorreta${attempts > 1 ? 's' : ''}`
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Botão de Verificação */}
            <Button
              onClick={handleVerification}
              disabled={isLoading || (!useBackupCode && verificationCode.length !== 6) || (useBackupCode && !backupCode.trim())}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>

            <Separator />

            {/* Alternar entre código normal e backup */}
            <div className="text-center space-y-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setUseBackupCode(!useBackupCode)
                  resetForm()
                }}
                className="text-sm"
              >
                {useBackupCode 
                  ? 'Usar código do app autenticador'
                  : 'Usar código de backup'
                }
              </Button>
              
              {!useBackupCode && (
                <p className="text-xs text-muted-foreground">
                  O código muda a cada 30 segundos
                </p>
              )}
            </div>
          </>
        )}

        {/* Botão Voltar */}
        {onBack && (
          <>
            <Separator />
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}