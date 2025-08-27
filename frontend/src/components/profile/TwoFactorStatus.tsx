'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Key, Shield, Smartphone, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { use2FA } from '@/hooks/use2FA'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TwoFactorStatusProps {
  className?: string
}

export function TwoFactorStatus({ className }: TwoFactorStatusProps) {
  const { 
    config, 
    isLoading, 
    disable2FA, 
    generateBackupCodes,
    getTrustedDevices,
    getAuthLogs 
  } = use2FA()
  
  const [isDisabling, setIsDisabling] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [trustedDevicesCount, setTrustedDevicesCount] = useState(0)
  const [lastLogin, setLastLogin] = useState<Date | null>(null)

  useEffect(() => {
    if (config?.enabled) {
      // Carregar dispositivos confiáveis
      getTrustedDevices().then(devices => {
        setTrustedDevicesCount(devices.length)
      })

      // Carregar último login
      getAuthLogs({ limit: 1, action: 'LOGIN_SUCCESS' }).then(logs => {
        if (logs.length > 0) {
          setLastLogin(new Date(logs[0].created_at))
        }
      })
    }
  }, [config, getTrustedDevices, getAuthLogs])

  const handleDisable2FA = async () => {
    setIsDisabling(true)
    try {
      await disable2FA()
      setShowDisableDialog(false)
    } catch (error) {
      console.error('Erro ao desabilitar 2FA:', error)
    } finally {
      setIsDisabling(false)
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Autenticação de Dois Fatores (2FA)
        </CardTitle>
        <CardDescription>
          {config?.enabled 
            ? 'Sua conta está protegida com autenticação de dois fatores'
            : 'Adicione uma camada extra de segurança à sua conta'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Status do 2FA
            </h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant={config?.enabled ? "default" : "outline"} 
                className={config?.enabled 
                  ? "text-green-600 bg-green-50 border-green-600" 
                  : "text-red-600 border-red-600"
                }
              >
                {config?.enabled ? 'Habilitado' : 'Desabilitado'}
              </Badge>
              {config?.enabled && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  desde {format(new Date(config.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config?.enabled ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/security/2fa">
                    Gerenciar
                  </Link>
                </Button>
                <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                      Desabilitar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Desabilitar Autenticação 2FA
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja desabilitar a autenticação de dois fatores? 
                        Isso tornará sua conta menos segura.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDisable2FA}
                        disabled={isDisabling}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDisabling ? 'Desabilitando...' : 'Desabilitar 2FA'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth/2fa/setup">
                  Configurar 2FA
                </Link>
              </Button>
            )}
          </div>
        </div>

        {config?.enabled && (
          <>
            <Separator />
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Smartphone className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{trustedDevicesCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Dispositivos Confiáveis
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{config.backup_codes_count || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Códigos de Backup
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">
                  {lastLogin ? format(lastLogin, 'dd/MM HH:mm', { locale: ptBR }) : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Último Login
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                Ações Rápidas
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/security/2fa">
                    Ver Dispositivos
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateBackupCodes()}
                >
                  Gerar Novos Códigos
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/security/2fa">
                    Ver Logs
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}