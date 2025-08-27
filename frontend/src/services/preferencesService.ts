import api from '@/lib/api'
import { 
  SystemPreferences, 
  SystemPreferencesUpdate, 
  ThemeSettings, 
  LocalizationSettings,
  PreferencesExport
} from '@/types/preferences'

class PreferencesService {
  private readonly baseUrl = '/api/preferences'

  /**
   * Buscar todas as preferências do sistema
   */
  async getPreferences(): Promise<SystemPreferences> {
    try {
      const response = await api.get<SystemPreferences>(this.baseUrl)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar preferências')
    }
  }

  /**
   * Atualizar preferências do sistema
   */
  async updatePreferences(data: SystemPreferencesUpdate): Promise<SystemPreferences> {
    try {
      const response = await api.put<SystemPreferences>(this.baseUrl, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar preferências')
    }
  }

  /**
   * Buscar configurações de tema
   */
  async getThemeSettings(): Promise<ThemeSettings> {
    try {
      const response = await api.get<ThemeSettings>(`${this.baseUrl}/theme`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar configurações de tema')
    }
  }

  /**
   * Atualizar configurações de tema
   */
  async updateThemeSettings(data: Partial<ThemeSettings>): Promise<ThemeSettings> {
    try {
      const response = await api.put<ThemeSettings>(`${this.baseUrl}/theme`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar configurações de tema')
    }
  }

  /**
   * Aplicar tema do sistema
   */
  async applySystemTheme(): Promise<ThemeSettings> {
    try {
      const response = await api.post<ThemeSettings>(`${this.baseUrl}/theme/system`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao aplicar tema do sistema')
    }
  }

  /**
   * Buscar configurações de localização
   */
  async getLocalizationSettings(): Promise<LocalizationSettings> {
    try {
      const response = await api.get<LocalizationSettings>(`${this.baseUrl}/localization`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar configurações de localização')
    }
  }

  /**
   * Atualizar configurações de localização
   */
  async updateLocalizationSettings(data: Partial<LocalizationSettings>): Promise<LocalizationSettings> {
    try {
      const response = await api.put<LocalizationSettings>(`${this.baseUrl}/localization`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar configurações de localização')
    }
  }

  /**
   * Detectar configurações do navegador
   */
  async detectBrowserSettings(): Promise<{
    language: string
    timezone: string
    theme: 'light' | 'dark' | 'system'
    dateFormat: string
    timeFormat: '12h' | '24h'
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/detect-browser`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao detectar configurações do navegador')
    }
  }

  /**
   * Aplicar configurações do navegador
   */
  async applyBrowserSettings(): Promise<SystemPreferences> {
    try {
      const response = await api.post<SystemPreferences>(`${this.baseUrl}/apply-browser`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao aplicar configurações do navegador')
    }
  }

  /**
   * Resetar preferências para padrão
   */
  async resetPreferences(): Promise<SystemPreferences> {
    try {
      const response = await api.post<SystemPreferences>(`${this.baseUrl}/reset`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao resetar preferências')
    }
  }

  /**
   * Validar preferências
   */
  async validatePreferences(data: SystemPreferencesUpdate): Promise<{
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
      const response = await api.post(`${this.baseUrl}/validate`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao validar preferências')
    }
  }

  /**
   * Exportar preferências
   */
  async exportPreferences(): Promise<PreferencesExport> {
    try {
      const response = await api.get<PreferencesExport>(`${this.baseUrl}/export`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao exportar preferências')
    }
  }

  /**
   * Importar preferências
   */
  async importPreferences(data: PreferencesExport): Promise<SystemPreferences> {
    try {
      const response = await api.post<SystemPreferences>(`${this.baseUrl}/import`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao importar preferências')
    }
  }

  /**
   * Configurar salvamento automático
   */
  async configureAutoSave(settings: {
    enabled: boolean
    interval: number // em segundos
    onlyOnChange: boolean
  }): Promise<{
    success: boolean
    settings: typeof settings
  }> {
    try {
      const response = await api.put(`${this.baseUrl}/auto-save`, settings)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar salvamento automático')
    }
  }

  /**
   * Buscar idiomas disponíveis
   */
  async getAvailableLanguages(): Promise<Array<{
    code: string
    name: string
    nativeName: string
    flag?: string
    rtl: boolean
    completeness: number // porcentagem de tradução
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/languages`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar idiomas disponíveis')
    }
  }

  /**
   * Buscar fusos horários disponíveis
   */
  async getAvailableTimezones(): Promise<Array<{
    value: string
    label: string
    offset: string
    country?: string
    region?: string
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/timezones`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar fusos horários')
    }
  }

  /**
   * Buscar temas disponíveis
   */
  async getAvailableThemes(): Promise<Array<{
    id: string
    name: string
    description: string
    preview?: string
    colors: {
      primary: string
      secondary: string
      background: string
      surface: string
      text: string
    }
    isCustom: boolean
    isDark: boolean
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/themes`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar temas disponíveis')
    }
  }

  /**
   * Criar tema personalizado
   */
  async createCustomTheme(theme: {
    name: string
    description?: string
    colors: {
      primary: string
      secondary: string
      background: string
      surface: string
      text: string
      [key: string]: string
    }
    isDark: boolean
  }): Promise<{
    id: string
    name: string
    colors: typeof theme.colors
    isDark: boolean
    isCustom: true
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/themes/custom`, theme)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar tema personalizado')
    }
  }

  /**
   * Atualizar tema personalizado
   */
  async updateCustomTheme(themeId: string, theme: Partial<{
    name: string
    description: string
    colors: Record<string, string>
  }>): Promise<any> {
    try {
      const response = await api.put(`${this.baseUrl}/themes/custom/${themeId}`, theme)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar tema personalizado')
    }
  }

  /**
   * Deletar tema personalizado
   */
  async deleteCustomTheme(themeId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/themes/custom/${themeId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao deletar tema personalizado')
    }
  }

  /**
   * Buscar histórico de alterações das preferências
   */
  async getPreferencesHistory(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }): Promise<{
    history: Array<{
      id: string
      userId: string
      userName: string
      action: 'update' | 'reset' | 'import'
      category: string
      changes: Array<{
        field: string
        oldValue: any
        newValue: any
      }>
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
      throw this.handleError(error, 'Erro ao buscar histórico de preferências')
    }
  }

  /**
   * Sincronizar preferências entre dispositivos
   */
  async syncPreferences(): Promise<{
    success: boolean
    lastSync: string
    conflicts: Array<{
      field: string
      localValue: any
      remoteValue: any
      resolution: 'local' | 'remote' | 'manual'
    }>
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/sync`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao sincronizar preferências')
    }
  }

  /**
   * Resolver conflitos de sincronização
   */
  async resolveConflicts(resolutions: Array<{
    field: string
    resolution: 'local' | 'remote'
    value?: any
  }>): Promise<SystemPreferences> {
    try {
      const response = await api.post<SystemPreferences>(`${this.baseUrl}/resolve-conflicts`, {
        resolutions
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao resolver conflitos')
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

export const preferencesService = new PreferencesService()