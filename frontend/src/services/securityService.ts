import api from '@/lib/api'
import { 
  SecuritySettings, 
  SecuritySettingsUpdate, 
  TrustedDevice, 
  SecurityEvent, 
  ActiveSession,
  TwoFactorSetup,
  PasswordPolicy,
  SecurityAlert
} from '@/types/security'

class SecurityService {
  private readonly baseUrl = '/api/security'

  /**
   * Buscar configurações de segurança
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await api.get<SecuritySettings>(`${this.baseUrl}/settings`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar configurações de segurança')
    }
  }

  /**
   * Atualizar configurações de segurança
   */
  async updateSecuritySettings(data: SecuritySettingsUpdate): Promise<SecuritySettings> {
    try {
      const response = await api.put<SecuritySettings>(`${this.baseUrl}/settings`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar configurações de segurança')
    }
  }

  /**
   * Ativar autenticação de dois fatores
   */
  async enableTwoFactor(): Promise<TwoFactorSetup> {
    try {
      const response = await api.post<TwoFactorSetup>(`${this.baseUrl}/2fa/enable`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao ativar autenticação de dois fatores')
    }
  }

  /**
   * Desativar autenticação de dois fatores
   */
  async disableTwoFactor(data: {
    password: string
    code?: string
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/2fa/disable`, data)
    } catch (error) {
      throw this.handleError(error, 'Erro ao desativar autenticação de dois fatores')
    }
  }

  /**
   * Gerar QR Code para 2FA
   */
  async generateTwoFactorQR(): Promise<{
    qrCode: string
    secret: string
    backupCodes: string[]
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/2fa/qr`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao gerar QR Code para 2FA')
    }
  }

  /**
   * Verificar código 2FA
   */
  async verifyTwoFactorCode(code: string): Promise<{
    valid: boolean
    backupCodes?: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/2fa/verify`, { code })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao verificar código 2FA')
    }
  }

  /**
   * Regenerar códigos de backup 2FA
   */
  async regenerateBackupCodes(): Promise<{
    backupCodes: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/2fa/backup-codes/regenerate`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao regenerar códigos de backup')
    }
  }

  /**
   * Buscar dispositivos confiáveis
   */
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    try {
      const response = await api.get<TrustedDevice[]>(`${this.baseUrl}/trusted-devices`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar dispositivos confiáveis')
    }
  }

  /**
   * Adicionar dispositivo confiável
   */
  async addTrustedDevice(data: {
    name: string
    description?: string
  }): Promise<TrustedDevice> {
    try {
      const response = await api.post<TrustedDevice>(`${this.baseUrl}/trusted-devices`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao adicionar dispositivo confiável')
    }
  }

  /**
   * Remover dispositivo confiável
   */
  async removeTrustedDevice(deviceId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/trusted-devices/${deviceId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao remover dispositivo confiável')
    }
  }

  /**
   * Atualizar dispositivo confiável
   */
  async updateTrustedDevice(deviceId: string, data: {
    name?: string
    description?: string
  }): Promise<TrustedDevice> {
    try {
      const response = await api.put<TrustedDevice>(`${this.baseUrl}/trusted-devices/${deviceId}`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar dispositivo confiável')
    }
  }

  /**
   * Buscar sessões ativas
   */
  async getActiveSessions(): Promise<ActiveSession[]> {
    try {
      const response = await api.get<ActiveSession[]>(`${this.baseUrl}/sessions`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar sessões ativas')
    }
  }

  /**
   * Encerrar sessão específica
   */
  async terminateSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/sessions/${sessionId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao encerrar sessão')
    }
  }

  /**
   * Encerrar todas as outras sessões
   */
  async terminateAllOtherSessions(): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/sessions/others`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao encerrar outras sessões')
    }
  }

  /**
   * Alterar senha
   */
  async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/password/change`, data)
    } catch (error) {
      throw this.handleError(error, 'Erro ao alterar senha')
    }
  }

  /**
   * Verificar força da senha
   */
  async checkPasswordStrength(password: string): Promise<{
    score: number // 0-4
    feedback: {
      warning: string
      suggestions: string[]
    }
    crackTime: {
      onlineThrottling: string
      onlineNoThrottling: string
      offlineSlowHashing: string
      offlineFastHashing: string
    }
    isValid: boolean
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/password/strength`, { password })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao verificar força da senha')
    }
  }

  /**
   * Buscar política de senha
   */
  async getPasswordPolicy(): Promise<PasswordPolicy> {
    try {
      const response = await api.get<PasswordPolicy>(`${this.baseUrl}/password/policy`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar política de senha')
    }
  }

  /**
   * Configurar política de senha
   */
  async setPasswordPolicy(policy: Partial<PasswordPolicy>): Promise<PasswordPolicy> {
    try {
      const response = await api.put<PasswordPolicy>(`${this.baseUrl}/password/policy`, policy)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar política de senha')
    }
  }

  /**
   * Buscar eventos de segurança
   */
  async getSecurityEvents(params?: {
    limit?: number
    offset?: number
    type?: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    startDate?: string
    endDate?: string
    read?: boolean
  }): Promise<{
    events: SecurityEvent[]
    total: number
    hasMore: boolean
    unreadCount: number
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/events`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar eventos de segurança')
    }
  }

  /**
   * Marcar evento como lido
   */
  async markEventAsRead(eventId: string): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/events/${eventId}/read`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao marcar evento como lido')
    }
  }

  /**
   * Marcar todos os eventos como lidos
   */
  async markAllEventsAsRead(): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/events/read-all`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao marcar todos os eventos como lidos')
    }
  }

  /**
   * Exportar eventos de segurança
   */
  async exportSecurityEvents(params?: {
    format: 'json' | 'csv' | 'pdf'
    startDate?: string
    endDate?: string
    type?: string
    severity?: string
  }): Promise<{
    downloadUrl: string
    filename: string
    size: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/events/export`, params)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao exportar eventos de segurança')
    }
  }

  /**
   * Configurar alertas de segurança
   */
  async configureSecurityAlerts(alerts: SecurityAlert[]): Promise<SecurityAlert[]> {
    try {
      const response = await api.put<SecurityAlert[]>(`${this.baseUrl}/alerts`, { alerts })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar alertas de segurança')
    }
  }

  /**
   * Buscar alertas de segurança
   */
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
      const response = await api.get<SecurityAlert[]>(`${this.baseUrl}/alerts`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar alertas de segurança')
    }
  }

  /**
   * Testar alerta de segurança
   */
  async testSecurityAlert(alertId: string): Promise<{
    success: boolean
    message: string
    deliveredAt?: string
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/alerts/${alertId}/test`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao testar alerta de segurança')
    }
  }

  /**
   * Verificar vulnerabilidades conhecidas
   */
  async checkVulnerabilities(): Promise<{
    vulnerabilities: Array<{
      id: string
      title: string
      description: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      cve?: string
      affectedComponents: string[]
      recommendation: string
      patchAvailable: boolean
      detectedAt: string
    }>
    lastScan: string
    nextScan: string
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/vulnerabilities`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao verificar vulnerabilidades')
    }
  }

  /**
   * Executar scan de segurança
   */
  async runSecurityScan(): Promise<{
    scanId: string
    status: 'started' | 'running' | 'completed' | 'failed'
    estimatedDuration: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/scan`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao executar scan de segurança')
    }
  }

  /**
   * Buscar status do scan de segurança
   */
  async getScanStatus(scanId: string): Promise<{
    scanId: string
    status: 'started' | 'running' | 'completed' | 'failed'
    progress: number
    startedAt: string
    completedAt?: string
    results?: {
      vulnerabilities: number
      warnings: number
      recommendations: number
    }
    error?: string
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/scan/${scanId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar status do scan')
    }
  }

  /**
   * Configurar IP whitelist
   */
  async configureIPWhitelist(ips: Array<{
    ip: string
    description?: string
    enabled: boolean
  }>): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/ip-whitelist`, { ips })
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar IP whitelist')
    }
  }

  /**
   * Buscar IP whitelist
   */
  async getIPWhitelist(): Promise<Array<{
    id: string
    ip: string
    description?: string
    enabled: boolean
    createdAt: string
    lastUsed?: string
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/ip-whitelist`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar IP whitelist')
    }
  }

  /**
   * Configurar rate limiting
   */
  async configureRateLimit(config: {
    enabled: boolean
    requests: number
    window: number // em segundos
    blockDuration: number // em segundos
    whitelist: string[]
  }): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/rate-limit`, config)
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar rate limiting')
    }
  }

  /**
   * Buscar configuração de rate limiting
   */
  async getRateLimitConfig(): Promise<{
    enabled: boolean
    requests: number
    window: number
    blockDuration: number
    whitelist: string[]
    stats: {
      totalRequests: number
      blockedRequests: number
      topIPs: Array<{
        ip: string
        requests: number
        blocked: number
      }>
    }
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/rate-limit`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar configuração de rate limiting')
    }
  }

  /**
   * Tratamento centralizado de erros
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    
    if (error.message) {
      return new Error(error.message)
    }
    
    return new Error(defaultMessage)
  }
}

export const securityService = new SecurityService()