import api from '@/lib/api'
import { 
  Integration, 
  IntegrationCreate, 
  IntegrationUpdate, 
  IntegrationStats, 
  IntegrationLog, 
  IntegrationTest,
  IntegrationSync
} from '@/types/integrations'

class IntegrationService {
  private readonly baseUrl = '/api/integrations'

  /**
   * Listar todas as integrações
   */
  async getIntegrations(params?: {
    category?: string
    status?: 'active' | 'inactive' | 'error'
    provider?: string
    limit?: number
    offset?: number
  }): Promise<{
    integrations: Integration[]
    total: number
    hasMore: boolean
  }> {
    try {
      const response = await api.get(this.baseUrl, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar integrações')
    }
  }

  /**
   * Buscar integração por ID
   */
  async getIntegration(id: string): Promise<Integration> {
    try {
      const response = await api.get<Integration>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar integração')
    }
  }

  /**
   * Criar nova integração
   */
  async createIntegration(data: IntegrationCreate): Promise<Integration> {
    try {
      const response = await api.post<Integration>(this.baseUrl, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar integração')
    }
  }

  /**
   * Atualizar integração
   */
  async updateIntegration(id: string, data: IntegrationUpdate): Promise<Integration> {
    try {
      const response = await api.put<Integration>(`${this.baseUrl}/${id}`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar integração')
    }
  }

  /**
   * Deletar integração
   */
  async deleteIntegration(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao deletar integração')
    }
  }

  /**
   * Testar conexão da integração
   */
  async testIntegration(id: string, testData?: IntegrationTest): Promise<{
    success: boolean
    message: string
    details?: any
    responseTime?: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/test`, testData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao testar integração')
    }
  }

  /**
   * Ativar/desativar integração
   */
  async toggleIntegration(id: string, active: boolean): Promise<Integration> {
    try {
      const response = await api.patch<Integration>(`${this.baseUrl}/${id}/toggle`, {
        active
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao alterar status da integração')
    }
  }

  /**
   * Sincronizar integração específica
   */
  async syncIntegration(id: string, options?: {
    fullSync?: boolean
    force?: boolean
  }): Promise<IntegrationSync> {
    try {
      const response = await api.post<IntegrationSync>(`${this.baseUrl}/${id}/sync`, options)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao sincronizar integração')
    }
  }

  /**
   * Sincronizar todas as integrações ativas
   */
  async syncAllIntegrations(options?: {
    category?: string
    force?: boolean
  }): Promise<{
    syncJobs: IntegrationSync[]
    totalStarted: number
    totalSkipped: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/sync-all`, options)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao sincronizar todas as integrações')
    }
  }

  /**
   * Buscar estatísticas das integrações
   */
  async getStats(params?: {
    startDate?: string
    endDate?: string
    integrationId?: string
  }): Promise<IntegrationStats> {
    try {
      const response = await api.get<IntegrationStats>(`${this.baseUrl}/stats`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar estatísticas')
    }
  }

  /**
   * Buscar logs de integração
   */
  async getLogs(params?: {
    integrationId?: string
    level?: 'info' | 'warning' | 'error'
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<{
    logs: IntegrationLog[]
    total: number
    hasMore: boolean
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/logs`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar logs')
    }
  }

  /**
   * Limpar logs antigos
   */
  async clearLogs(params?: {
    integrationId?: string
    olderThan?: string
    level?: 'info' | 'warning' | 'error'
  }): Promise<{
    deletedCount: number
  }> {
    try {
      const response = await api.delete(`${this.baseUrl}/logs`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao limpar logs')
    }
  }

  /**
   * Configurar integração
   */
  async configureIntegration(id: string, config: {
    credentials?: Record<string, any>
    settings?: Record<string, any>
    webhooks?: Array<{
      url: string
      events: string[]
      secret?: string
    }>
    rateLimits?: {
      requestsPerMinute?: number
      requestsPerHour?: number
      requestsPerDay?: number
    }
    timeout?: number
    retryAttempts?: number
    retryDelay?: number
  }): Promise<Integration> {
    try {
      const response = await api.put<Integration>(`${this.baseUrl}/${id}/configure`, config)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar integração')
    }
  }

  /**
   * Validar configuração da integração
   */
  async validateConfiguration(id: string, config: any): Promise<{
    valid: boolean
    errors: Array<{
      field: string
      message: string
    }>
    warnings: Array<{
      field: string
      message: string
    }>
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/validate`, config)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao validar configuração')
    }
  }

  /**
   * Buscar provedores disponíveis
   */
  async getProviders(): Promise<Array<{
    id: string
    name: string
    description: string
    category: string
    icon?: string
    website?: string
    documentation?: string
    supportedFeatures: string[]
    configurationSchema: any
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/providers`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar provedores')
    }
  }

  /**
   * Buscar templates de integração
   */
  async getTemplates(providerId?: string): Promise<Array<{
    id: string
    name: string
    description: string
    providerId: string
    category: string
    configuration: any
    isPopular: boolean
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`, {
        params: { providerId }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar templates')
    }
  }

  /**
   * Criar integração a partir de template
   */
  async createFromTemplate(templateId: string, data: {
    name: string
    description?: string
    configuration: any
  }): Promise<Integration> {
    try {
      const response = await api.post<Integration>(`${this.baseUrl}/templates/${templateId}/create`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar integração do template')
    }
  }

  /**
   * Exportar configurações de integração
   */
  async exportConfiguration(id: string): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/export`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao exportar configuração')
    }
  }

  /**
   * Importar configurações de integração
   */
  async importConfiguration(id: string, config: any): Promise<Integration> {
    try {
      const response = await api.post<Integration>(`${this.baseUrl}/${id}/import`, config)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao importar configuração')
    }
  }

  /**
   * Buscar status de saúde das integrações
   */
  async getHealthStatus(): Promise<{
    overall: 'healthy' | 'warning' | 'critical'
    integrations: Array<{
      id: string
      name: string
      status: 'healthy' | 'warning' | 'critical' | 'offline'
      lastCheck: string
      responseTime?: number
      errorCount: number
      uptime: number
    }>
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/health`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar status de saúde')
    }
  }

  /**
   * Executar verificação de saúde
   */
  async runHealthCheck(id?: string): Promise<{
    results: Array<{
      integrationId: string
      status: 'healthy' | 'warning' | 'critical' | 'offline'
      responseTime: number
      errors: string[]
      timestamp: string
    }>
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/health/check`, { integrationId: id })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao executar verificação de saúde')
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

export const integrationService = new IntegrationService()