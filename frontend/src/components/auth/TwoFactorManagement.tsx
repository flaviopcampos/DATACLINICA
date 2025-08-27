'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Shield,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { use2FA } from '@/hooks/use2FA'
import { twoFactorService } from '@/services/twoFactorService'
import { TwoFactorSetup } from './TwoFactorSetup'
import type { TwoFactorManagementProps, TrustedDevice, AuthLog } from '@/types/twoFactor'

const deviceIcons = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
  unknown: Monitor
}

export function TwoFactorManagement({ className }: TwoFactorManagementProps) {
  const {
    config,
    trustedDevices,
    authLogs,
    stats,
    isLoading,
    disableTwoFactor,
    regenerateBackupCodes,
    removeTrustedDevice
  } = use2FA()

  const [showSetup, setShowSetup] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showAuthLogs, setShowAuthLogs] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [isDisabling, setIsDisabling] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])

  const handleDisable2FA = async () => {
    if (!disableCode.trim()) {
      toast.error('Digite o código de verificação')
      return
    }

    setIsDisabling(true)
    try {
      await disableTwoFactor({ verification_code: disableCode })
      toast.success('2FA desabilitado com sucesso')
      setShowDisableDialog(false)
      setDisableCode('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsDisabling(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    setIsRegenerating(true)
    try {
      const response = await regenerateBackupCodes()
      setNewBackupCodes(response.backup_codes)
      setShowBackupCodes(true)
      toast.success('Novos códigos de backup gerados')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      await removeTrustedDevice({ device_id: deviceId })
      toast.success('Dispositivo removido com sucesso')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const downloadBackupCodes = (codes: string[]) => {
    const content = [
      'NOVOS CÓDIGOS DE BACKUP - DATACLINICA 2FA',
      '==========================================',
      '',
      'IMPORTANTE: Guarde estes códigos em local seguro!',
      'Cada código pode ser usado apenas uma vez.',
      'Os códigos anteriores foram invalidados.',
      '',
      ...codes.map((code, index) => `${index + 1}. ${code}`),
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
  }

  const getDeviceIcon = (deviceType: string) => {
    const IconComponent = deviceIcons[deviceType as keyof typeof deviceIcons] || deviceIcons.unknown
    return <IconComponent className="h-4 w-4" />
  }

  const getStatusBadge = (enabled: boolean) => {
    return enabled ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Autenticação 2FA</CardTitle>
                <CardDescription>
                  Gerencie sua autenticação de dois fatores
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(config?.enabled || false)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {config?.enabled ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.total_logins || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Logins</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {trustedDevices?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Dispositivos Confiáveis</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {config?.backup_codes_remaining || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Códigos de Backup</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleRegenerateBackupCodes}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Gerar Novos Códigos
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowAuthLogs(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Logs
                </Button>
                
                <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Desabilitar 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Desabilitar Autenticação 2FA</DialogTitle>
                      <DialogDescription>
                        Esta ação removerá a proteção adicional da sua conta. Digite o código do seu app autenticador para confirmar.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="disable-code">Código de Verificação:</Label>
                        <Input
                          id="disable-code"
                          value={disableCode}
                          onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="text-center text-lg font-mono tracking-widest"
                          maxLength={6}
                        />
                      </div>
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Ao desabilitar o 2FA, sua conta ficará menos segura.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowDisableDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDisable2FA}
                        disabled={isDisabling || disableCode.length !== 6}
                      >
                        {isDisabling ? 'Desabilitando...' : 'Desabilitar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">2FA não configurado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione uma camada extra de segurança à sua conta
              </p>
              <Button onClick={() => setShowSetup(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configurar 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispositivos Confiáveis */}
      {config?.enabled && trustedDevices && trustedDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos Confiáveis</CardTitle>
            <CardDescription>
              Dispositivos que não precisam de verificação 2FA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trustedDevices.map((device: TrustedDevice) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.device_type)}
                    <div>
                      <div className="font-medium">{device.device_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {device.location} • Último acesso: {format(new Date(device.last_used), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(device.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Setup */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-2xl">
          <TwoFactorSetup
            onComplete={() => setShowSetup(false)}
            onCancel={() => setShowSetup(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Novos Códigos de Backup */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novos Códigos de Backup</DialogTitle>
            <DialogDescription>
              Salve estes novos códigos em local seguro. Os códigos anteriores foram invalidados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {newBackupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-background rounded border text-center">
                  {code}
                </div>
              ))}
            </div>
            <Button
              onClick={() => downloadBackupCodes(newBackupCodes)}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Códigos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Logs de Autenticação */}
      <Dialog open={showAuthLogs} onOpenChange={setShowAuthLogs}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Logs de Autenticação</DialogTitle>
            <DialogDescription>
              Histórico das últimas tentativas de autenticação
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Dispositivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authLogs?.map((log: AuthLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                    <TableCell>{log.user_agent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}