import api from '@/lib/api'
import { Settings, SettingsUpdate, SettingsValidation, SettingsExport } from '@/types/settings'

class SettingsService {
  private readonly baseUrl = '/api/settings'

  /**
   * Buscar todas as configurações do sistema
   */
  async getSettings(): Promise<Settings> {
    try {
      const response = await api.get<Settings>(this.baseUrl)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar configurações')
    }
  }

  /**
   * Atualizar configurações do sistema
   */
  async updateSettings(data: SettingsUpdate): Promise<Settings> {
    try {
      const response = await api.put<Settings>(this.baseUrl, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar configurações')
    }
  }

  /**
   * Redefinir configurações para os valores padrão
   */
  async resetSettings(): Promise<Settings> {
    try {
      const response = await api.post<Settings>(`${this.baseUrl}/reset`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao redefinir configurações')
    }
  }

  /**
   * Validar configurações antes de salvar
   */
  async validateSettings(data: SettingsUpdate): Promise<SettingsValidation> {
    try {
      const response = await api.post<SettingsValidation>(`${this.baseUrl}/validate`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao validar configurações')
    }
  }

  /**
   * Exportar configurações
   */
  async exportSettings(): Promise<SettingsExport> {
    try {
      const response = await api.get<SettingsExport>(`${this.baseUrl}/export`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao exportar configurações')
    }
  }

  /**
   * Importar configurações
   */
  async importSettings(data: SettingsExport): Promise<Settings> {
    try {
      const response = await api.post<Settings>(`${this.baseUrl}/import`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao importar configurações')
    }
  }

  /**
   * Buscar configuração específica por chave
   */
  async getSetting(key: string): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/${key}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, `Erro ao buscar configuração: ${key}`)
    }
  }

  /**
   * Atualizar configuração específica
   */
  async updateSetting(key: string, value: any): Promise<any> {
    try {
      const response = await api.put(`${this.baseUrl}/${key}`, { value })
      return response.data
    } catch (error) {
      throw this.handleError(error, `Erro ao atualizar configuração: ${key}`)
    }
  }

  /**
   * Buscar configurações por categoria
   */
  async getSettingsByCategory(category: string): Promise<Partial<Settings>> {
    try {
      const response = await api.get<Partial<Settings>>(`${this.baseUrl}/category/${category}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, `Erro ao buscar configurações da categoria: ${category}`)
    }
  }

  /**
   * Atualizar configurações por categoria
   */
  async updateSettingsByCategory(category: string, data: any): Promise<Partial<Settings>> {
    try {
      const response = await api.put<Partial<Settings>>(`${this.baseUrl}/category/${category}`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, `Erro ao atualizar configurações da categoria: ${category}`)
    }
  }

  /**
   * Buscar histórico de alterações das configurações
   */
  async getSettingsHistory(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
    userId?: string
  }): Promise<{
    history: Array<{
      id: string
      userId: string
      userName: string
      action: 'create' | 'update' | 'delete' | 'reset' | 'import'
      category: string
      key: string
      oldValue: any
      newValue: any
      timestamp: string
      ipAddress: string
      userAgent: string
    }>
    total: number
    hasMore: boolean
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/history`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar histórico de configurações')
    }
  }

  /**
   * Buscar configurações padrão do sistema
   */
  async getDefaultSettings(): Promise<Settings> {
    try {
      const response = await api.get<Settings>(`${this.baseUrl}/defaults`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar configurações padrão')
    }
  }

  /**
   * Verificar se há atualizações de configuração disponíveis
   */
  async checkForUpdates(): Promise<{
    hasUpdates: boolean
    updates: Array<{
      key: string
      category: string
      currentValue: any
      recommendedValue: any
      reason: string
      priority: 'low' | 'medium' | 'high'
    }>
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/check-updates`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao verificar atualizações')
    }
  }

  /**
   * Aplicar atualizações recomendadas
   */
  async applyRecommendedUpdates(updates: string[]): Promise<Settings> {
    try {
      const response = await api.post<Settings>(`${this.baseUrl}/apply-updates`, { updates })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao aplicar atualizações')
    }
  }

  /**
   * Fazer backup das configurações atuais
   */
  async backupSettings(): Promise<{
    backupId: string
    timestamp: string
    size: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/backup`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao fazer backup das configurações')
    }
  }

  /**
   * Restaurar configurações de um backup
   */
  async restoreSettings(backupId: string): Promise<Settings> {
    try {
      const response = await api.post<Settings>(`${this.baseUrl}/restore`, { backupId })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao restaurar configurações')
    }
  }

  /**
   * Listar backups disponíveis
   */
  async listBackups(): Promise<Array<{
    id: string
    timestamp: string
    size: number
    description?: string
    userId: string
    userName: string
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/backups`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao listar backups')
    }
  }

  /**
   * Deletar backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/backups/${backupId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao deletar backup')
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

export const settingsService = new SettingsService()