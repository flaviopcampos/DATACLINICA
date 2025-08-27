'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { twoFactorService } from '@/services/twoFactorService'
import type {
  TwoFactorConfig,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  TwoFactorDisableRequest,
  TrustedDevice,
  AuthLog,
  TwoFactorStats,
  Use2FAReturn,
  TwoFactorStatus
} from '@/types/twoFactor'

const QUERY_KEYS = {
  config: ['2fa', 'config'],
  trustedDevices: ['2fa', 'trusted-devices'],
  authLogs: ['2fa', 'auth-logs'],
  stats: ['2fa', 'stats']
} as const

export function use2FA(): Use2FAReturn {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  // Query para configuração 2FA
  const {
    data: config,
    isLoading: isLoadingConfig,
    error: configError
  } = useQuery({
    queryKey: QUERY_KEYS.config,
    queryFn: () => twoFactorService.getConfig(),
    retry: false
  })

  // Query para dispositivos confiáveis
  const {
    data: trustedDevices = [],
    isLoading: isLoadingDevices
  } = useQuery({
    queryKey: QUERY_KEYS.trustedDevices,
    queryFn: () => twoFactorService.getTrustedDevices(),
    enabled: !!config && config.status === TwoFactorStatus.ENABLED
  })

  // Query para logs de autenticação
  const {
    data: authLogs = [],
    isLoading: isLoadingLogs
  } = useQuery({
    queryKey: QUERY_KEYS.authLogs,
    queryFn: () => twoFactorService.getAuthLogs(50),
    enabled: !!config && config.status === TwoFactorStatus.ENABLED
  })

  // Query para estatísticas
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: () => twoFactorService.getStats(),
    enabled: !!config && config.status === TwoFactorStatus.ENABLED
  })

  const isLoading = isLoadingConfig || isLoadingDevices || isLoadingLogs || isLoadingStats

  // Mutation para configurar 2FA
  const setupMutation = useMutation({
    mutationFn: (request: TwoFactorSetupRequest) => 
      twoFactorService.setupTwoFactor(request),
    onSuccess: () => {
      toast.success('2FA configurado com sucesso!')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.config })
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    }
  })

  // Mutation para verificar 2FA
  const verifyMutation = useMutation({
    mutationFn: (request: TwoFactorVerifyRequest) => 
      twoFactorService.verifyTwoFactor(request),
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    }
  })

  // Mutation para desabilitar 2FA
  const disableMutation = useMutation({
    mutationFn: (request: TwoFactorDisableRequest) => 
      twoFactorService.disableTwoFactor(request),
    onSuccess: () => {
      toast.success('2FA desabilitado com sucesso!')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.config })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.trustedDevices })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.authLogs })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.stats })
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    }
  })

  // Mutation para regenerar códigos de backup
  const regenerateBackupCodesMutation = useMutation({
    mutationFn: () => twoFactorService.regenerateBackupCodes(),
    onSuccess: () => {
      toast.success('Códigos de backup regenerados!')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.config })
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    }
  })

  // Mutation para remover dispositivo confiável
  const removeTrustedDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => 
      twoFactorService.removeTrustedDevice(deviceId),
    onSuccess: () => {
      toast.success('Dispositivo removido com sucesso!')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trustedDevices })
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
    }
  })

  // Funções do hook
  const setupTwoFactor = useCallback(async (request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> => {
    setError(null)
    return setupMutation.mutateAsync(request)
  }, [setupMutation])

  const verifyTwoFactor = useCallback(async (request: TwoFactorVerifyRequest): Promise<TwoFactorVerifyResponse> => {
    setError(null)
    return verifyMutation.mutateAsync(request)
  }, [verifyMutation])

  const disableTwoFactor = useCallback(async (request: TwoFactorDisableRequest): Promise<void> => {
    setError(null)
    return disableMutation.mutateAsync(request)
  }, [disableMutation])

  const regenerateBackupCodes = useCallback(async (): Promise<string[]> => {
    setError(null)
    return regenerateBackupCodesMutation.mutateAsync()
  }, [regenerateBackupCodesMutation])

  const removeTrustedDevice = useCallback(async (deviceId: string): Promise<void> => {
    setError(null)
    return removeTrustedDeviceMutation.mutateAsync(deviceId)
  }, [removeTrustedDeviceMutation])

  const refreshConfig = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.config })
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trustedDevices })
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authLogs })
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats })
  }, [queryClient])

  // Limpar erro quando configuração muda
  useEffect(() => {
    if (configError) {
      setError(configError.message)
    } else {
      setError(null)
    }
  }, [configError])

  return {
    config: config || null,
    trustedDevices,
    authLogs,
    stats: stats || null,
    isLoading,
    error,
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    regenerateBackupCodes,
    removeTrustedDevice,
    refreshConfig
  }
}

// Hook para verificar se 2FA é obrigatório
export function use2FARequired() {
  const { config } = use2FA()
  
  return {
    isSetupRequired: !config || config.status === TwoFactorStatus.PENDING_SETUP,
    isVerificationRequired: config?.status === TwoFactorStatus.ENABLED,
    config
  }
}

// Hook para verificar dispositivo confiável
export function useTrustedDevice() {
  const [isChecking, setIsChecking] = useState(false)
  const [isTrusted, setIsTrusted] = useState<boolean | null>(null)

  const checkDevice = useCallback(async () => {
    setIsChecking(true)
    try {
      const deviceInfo = twoFactorService.getCurrentDeviceInfo()
      const trusted = await twoFactorService.checkTrustedDevice(deviceInfo.fingerprint)
      setIsTrusted(trusted)
      return trusted
    } catch (error) {
      setIsTrusted(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    checkDevice()
  }, [])

  return {
    isTrusted,
    isChecking,
    checkDevice,
    deviceInfo: twoFactorService.getCurrentDeviceInfo()
  }
}