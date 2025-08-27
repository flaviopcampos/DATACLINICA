'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Eye, EyeOff, Shield, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { use2FA } from '@/hooks/use2FA'
import { twoFactorService } from '@/services/twoFactorService'
import type { TwoFactorSetupProps, TwoFactorMethod } from '@/types/twoFactor'

interface SetupData {
  secret: string
  qr_code_url: string
  backup_codes: string[]
  manual_entry_key: string
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const { setupTwoFactor } = use2FA()
  const [step, setStep] = useState<'method' | 'setup' | 'verify' | 'backup'>('method')
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod>('totp')
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [savedBackupCodes, setSavedBackupCodes] = useState(false)

  const handleMethodSelect = async (method: TwoFactorMethod) => {
    setSelectedMethod(method)
    setIsLoading(true)

    try {
      const response = await setupTwoFactor({ method })
      setSetupData(response)
      setStep('setup')
    } catch (error) {
      console.error('Erro ao iniciar configuração:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      toast.error('Digite o código de verificação')
      return
    }

    setIsLoading(true)
    try {
      await twoFactorService.confirmSetup(verificationCode)
      setStep('backup')
      toast.success('2FA configurado com sucesso!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    if (!savedBackupCodes) {
      toast.error('Por favor, salve os códigos de backup antes de continuar')
      return
    }
    onComplete?.()
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado para a área de transferência`)
  }

  const downloadBackupCodes = () => {
    if (!setupData?.backup_codes) return

    const content = [
      'CÓDIGOS DE BACKUP - DATACLINICA 2FA',
      '=====================================',
      '',
      'IMPORTANTE: Guarde estes códigos em local seguro!',
      'Cada código pode ser usado apenas uma vez.',
      '',
      ...setupData.backup_codes.map((code, index) => `${index + 1}. ${code}`),
      '',
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dataclinica-2fa-backup-codes-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setSavedBackupCodes(true)
    toast.success('Códigos de backup baixados com sucesso!')
  }

  if (step === 'method') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Configurar Autenticação 2FA</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto p-4 justify-start"
              onClick={() => handleMethodSelect('totp')}
              disabled={isLoading}
            >
              <Smartphone className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">App Autenticador</div>
                <div className="text-sm text-muted-foreground">
                  Google Authenticator, Authy, etc.
                </div>
              </div>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'setup' && setupData) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Configurar App Autenticador</CardTitle>
          <CardDescription>
            Escaneie o QR Code ou digite a chave manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <QRCodeSVG
                value={setupData.qr_code_url}
                size={200}
                level="M"
                includeMargin
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Escaneie este código com seu app autenticador
            </p>
          </div>

          <Separator />

          {/* Chave Manual */}
          <div className="space-y-2">
            <Label>Ou digite a chave manualmente:</Label>
            <div className="flex gap-2">
              <Input
                value={showSecret ? setupData.manual_entry_key : '••••••••••••••••'}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(setupData.manual_entry_key, 'Chave')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Verificação */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">
                Digite o código do seu app autenticador:
              </Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            <Alert>
              <AlertDescription>
                O código muda a cada 30 segundos. Digite o código atual exibido no seu app.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('method')} className="flex-1">
              Voltar
            </Button>
            <Button
              onClick={handleVerification}
              disabled={isLoading || verificationCode.length !== 6}
              className="flex-1"
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'backup' && setupData) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">2FA Configurado!</CardTitle>
          <CardDescription>
            Salve seus códigos de backup em local seguro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Importante:</strong> Estes códigos de backup podem ser usados para acessar sua conta se você perder acesso ao seu app autenticador. Cada código pode ser usado apenas uma vez.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Códigos de Backup:</Label>
              <Badge variant="secondary">
                {setupData.backup_codes.length} códigos
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {setupData.backup_codes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, `Código ${index + 1}`)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={downloadBackupCodes}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Códigos de Backup
          </Button>

          {savedBackupCodes && (
            <Alert>
              <AlertDescription className="text-green-600">
                ✓ Códigos de backup salvos com sucesso!
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleComplete}
            disabled={!savedBackupCodes}
            className="w-full"
          >
            Concluir Configuração
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}