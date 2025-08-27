import api from '@/lib/api'
import { 
  NotificationSettings, 
  NotificationSettingsUpdate, 
  NotificationChannel, 
  NotificationType, 
  NotificationTest,
  NotificationHistory,
  NotificationTemplate
} from '@/types/notifications'

class NotificationService {
  private readonly baseUrl = '/api/notifications'

  /**
   * Buscar configurações de notificação
   */
  async getSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get<NotificationSettings>(`${this.baseUrl}/settings`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar configurações de notificação')
    }
  }

  /**
   * Atualizar configurações de notificação
   */
  async updateSettings(data: NotificationSettingsUpdate): Promise<NotificationSettings> {
    try {
      const response = await api.put<NotificationSettings>(`${this.baseUrl}/settings`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar configurações de notificação')
    }
  }

  /**
   * Buscar canais de notificação disponíveis
   */
  async getChannels(): Promise<NotificationChannel[]> {
    try {
      const response = await api.get<NotificationChannel[]>(`${this.baseUrl}/channels`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar canais de notificação')
    }
  }

  /**
   * Testar canal de notificação
   */
  async testChannel(channelId: string, testData?: NotificationTest): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/channels/${channelId}/test`, testData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao testar canal de notificação')
    }
  }

  /**
   * Ativar/desativar canal de notificação
   */
  async toggleChannel(channelId: string, enabled: boolean): Promise<NotificationChannel> {
    try {
      const response = await api.patch<NotificationChannel>(`${this.baseUrl}/channels/${channelId}`, {
        enabled
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao alterar status do canal')
    }
  }

  /**
   * Configurar canal de notificação
   */
  async configureChannel(channelId: string, config: any): Promise<NotificationChannel> {
    try {
      const response = await api.put<NotificationChannel>(`${this.baseUrl}/channels/${channelId}`, config)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar canal')
    }
  }

  /**
   * Buscar tipos de notificação
   */
  async getNotificationTypes(): Promise<NotificationType[]> {
    try {
      const response = await api.get<NotificationType[]>(`${this.baseUrl}/types`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar tipos de notificação')
    }
  }

  /**
   * Configurar tipo de notificação
   */
  async configureNotificationType(typeId: string, config: {
    enabled: boolean
    channels: string[]
    priority: 'low' | 'medium' | 'high' | 'urgent'
    frequency?: 'immediate' | 'batched' | 'daily' | 'weekly'
    template?: string
  }): Promise<NotificationType> {
    try {
      const response = await api.put<NotificationType>(`${this.baseUrl}/types/${typeId}`, config)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar tipo de notificação')
    }
  }

  /**
   * Enviar notificação de teste
   */
  async sendTestNotification(data: {
    type: string
    channels: string[]
    title: string
    message: string
    recipients?: string[]
    data?: any
  }): Promise<{
    success: boolean
    results: Array<{
      channel: string
      success: boolean
      message: string
      messageId?: string
    }>
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/test`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao enviar notificação de teste')
    }
  }

  /**
   * Verificar permissões de notificação
   */
  async checkPermissions(): Promise<{
    browser: boolean
    push: boolean
    email: boolean
    sms: boolean
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/permissions`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao verificar permissões')
    }
  }

  /**
   * Solicitar permissões de notificação
   */
  async requestPermissions(types: string[]): Promise<{
    granted: string[]
    denied: string[]
    pending: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/permissions/request`, { types })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao solicitar permissões')
    }
  }

  /**
   * Buscar histórico de notificações
   */
  async getHistory(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
    type?: string
    channel?: string
    status?: 'sent' | 'failed' | 'pending'
  }): Promise<{
    notifications: NotificationHistory[]
    total: number
    hasMore: boolean
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/history`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar histórico de notificações')
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/history/${notificationId}/read`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao marcar notificação como lida')
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/history/read-all`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao marcar todas as notificações como lidas')
    }
  }

  /**
   * Buscar templates de notificação
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await api.get<NotificationTemplate[]>(`${this.baseUrl}/templates`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar templates')
    }
  }

  /**
   * Criar template de notificação
   */
  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    try {
      const response = await api.post<NotificationTemplate>(`${this.baseUrl}/templates`, template)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar template')
    }
  }

  /**
   * Atualizar template de notificação
   */
  async updateTemplate(templateId: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    try {
      const response = await api.put<NotificationTemplate>(`${this.baseUrl}/templates/${templateId}`, template)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar template')
    }
  }

  /**
   * Deletar template de notificação
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/templates/${templateId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao deletar template')
    }
  }

  /**
   * Buscar estatísticas de notificações
   */
  async getStats(params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<{
    totalSent: number
    totalFailed: number
    successRate: number
    byChannel: Record<string, {
      sent: number
      failed: number
      successRate: number
    }>
    byType: Record<string, {
      sent: number
      failed: number
      successRate: number
    }>
    timeline: Array<{
      date: string
      sent: number
      failed: number
    }>
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar estatísticas')
    }
  }

  /**
   * Resetar configurações de notificação
   */
  async resetSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.post<NotificationSettings>(`${this.baseUrl}/settings/reset`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao resetar configurações')
    }
  }

  /**
   * Exportar configurações de notificação
   */
  async exportSettings(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/settings/export`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao exportar configurações')
    }
  }

  /**
   * Importar configurações de notificação
   */
  async importSettings(data: any): Promise<NotificationSettings> {
    try {
      const response = await api.post<NotificationSettings>(`${this.baseUrl}/settings/import`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao importar configurações')
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

export const notificationService = new NotificationService()