import { api } from './api'
import type {
  TwoFactorConfig,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  TwoFactorDisableRequest,
  TrustedDevice,
  AuthLog,
  TwoFactorStats
} from '@/types/twoFactor'

class TwoFactorService {
  private readonly baseUrl = '/auth/2fa'

  /**
   * Obter configuração 2FA do usuário atual
   */
  async getConfig(): Promise<TwoFactorConfig | null> {
    try {
      const response = await api.get(`${this.baseUrl}/config`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw new Error(error.response?.data?.message || 'Erro ao obter configuração 2FA')
    }
  }

  /**
   * Iniciar configuração do 2FA
   */
  async setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/setup`, request)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao configurar 2FA')
    }
  }

  /**
   * Confirmar configuração do 2FA com código de verificação
   */
  async confirmSetup(code: string): Promise<TwoFactorConfig> {
    try {
      const response = await api.post(`${this.baseUrl}/confirm-setup`, { code })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Código inválido')
    }
  }

  /**
   * Verificar código 2FA durante login
   */
  async verifyTwoFactor(request: TwoFactorVerifyRequest): Promise<TwoFactorVerifyResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/verify`, request)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Código inválido')
    }
  }

  /**
   * Desabilitar 2FA
   */
  async disableTwoFactor(request: TwoFactorDisableRequest): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/disable`, request)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao desabilitar 2FA')
    }
  }

  /**
   * Regenerar códigos de backup
   */
  async regenerateBackupCodes(): Promise<string[]> {
    try {
      const response = await api.post(`${this.baseUrl}/regenerate-backup-codes`)
      return response.data.backup_codes
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao regenerar códigos de backup')
    }
  }

  /**
   * Obter dispositivos confiáveis
   */
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    try {
      const response = await api.get(`${this.baseUrl}/trusted-devices`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao obter dispositivos confiáveis')
    }
  }

  /**
   * Remover dispositivo confiável
   */
  async removeTrustedDevice(deviceId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/trusted-devices/${deviceId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao remover dispositivo')
    }
  }

  /**
   * Obter logs de autenticação
   */
  async getAuthLogs(limit = 50): Promise<AuthLog[]> {
    try {
      const response = await api.get(`${this.baseUrl}/auth-logs`, {
        params: { limit }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao obter logs de autenticação')
    }
  }

  /**
   * Obter estatísticas 2FA
   */
  async getStats(): Promise<TwoFactorStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas')
    }
  }

  /**
   * Verificar se dispositivo é confiável
   */
  async checkTrustedDevice(deviceFingerprint: string): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/check-trusted-device`, {
        device_fingerprint: deviceFingerprint
      })
      return response.data.is_trusted
    } catch (error: any) {
      return false
    }
  }

  /**
   * Gerar fingerprint do dispositivo
   */
  generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint', 2, 2)
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 0,
      navigator.deviceMemory || 0
    ].join('|')

    // Simples hash do fingerprint
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36)
  }

  /**
   * Obter informações do dispositivo atual
   */
  getCurrentDeviceInfo(): {
    name: string
    fingerprint: string
    userAgent: string
  } {
    const userAgent = navigator.userAgent
    let deviceName = 'Dispositivo Desconhecido'

    // Detectar tipo de dispositivo
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPhone/.test(userAgent)) deviceName = 'iPhone'
      else if (/iPad/.test(userAgent)) deviceName = 'iPad'
      else if (/Android/.test(userAgent)) deviceName = 'Android'
      else deviceName = 'Mobile'
    } else {
      if (/Windows/.test(userAgent)) deviceName = 'Windows PC'
      else if (/Mac/.test(userAgent)) deviceName = 'Mac'
      else if (/Linux/.test(userAgent)) deviceName = 'Linux'
      else deviceName = 'Desktop'
    }

    // Adicionar navegador
    if (/Chrome/.test(userAgent)) deviceName += ' - Chrome'
    else if (/Firefox/.test(userAgent)) deviceName += ' - Firefox'
    else if (/Safari/.test(userAgent)) deviceName += ' - Safari'
    else if (/Edge/.test(userAgent)) deviceName += ' - Edge'

    return {
      name: deviceName,
      fingerprint: this.generateDeviceFingerprint(),
      userAgent
    }
  }
}

export const twoFactorService = new TwoFactorService()
export default twoFactorService