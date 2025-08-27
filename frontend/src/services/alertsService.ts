import { api } from './api'
import type {
  SystemAlert,
  AlertCondition,
  AlertTrigger,
  AlertTarget,
  AlertNotification,
  AlertAction,
  AlertEscalation,
  AlertSuppression,
  AlertMetrics,
  AlertHistory,
  AlertConfiguration,
  AlertTemplate,
  AlertDashboard,
  AlertReport,
  AlertIntegration,
  AlertCategory,
  AlertSeverity,
  AlertStatus,
  AlertSource,
  AlertOperator,
  AlertChannelType,
  AlertActionType
} from '@/types/systemAlerts'

class AlertsService {
  private readonly baseUrl = '/api/alerts'

  // Gerenciar alertas do sistema
  async getSystemAlerts(filters?: {
    status?: AlertStatus[]
    severity?: AlertSeverity[]
    category?: AlertCategory[]
    source?: AlertSource[]
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<{
    alerts: SystemAlert[]
    total: number
    hasMore: boolean
  }> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          filters.status.forEach(status => params.append('status', status))
        }
        if (filters.severity && filters.severity.length > 0) {
          filters.severity.forEach(severity => params.append('severity', severity))
        }
        if (filters.category && filters.category.length > 0) {
          filters.category.forEach(category => params.append('category', category))
        }
        if (filters.source && filters.source.length > 0) {
          filters.source.forEach(source => params.append('source', source))
        }
        if (filters.startDate) {
          params.append('startDate', filters.startDate)
        }
        if (filters.endDate) {
          params.append('endDate', filters.endDate)
        }
        if (filters.limit !== undefined) {
          params.append('limit', String(filters.limit))
        }
        if (filters.offset !== undefined) {
          params.append('offset', String(filters.offset))
        }
      }

      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl
      
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alertas do sistema:', error)
      throw new Error('Falha ao carregar alertas do sistema')
    }
  }

  // Buscar alerta específico por ID
  async getAlertById(id: string): Promise<SystemAlert> {
    try {
      const response = await api.get<SystemAlert>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alerta por ID:', error)
      throw new Error('Falha ao carregar alerta específico')
    }
  }

  // Criar novo alerta
  async createAlert(alert: Omit<SystemAlert, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggered' | 'triggerCount' | 'metrics' | 'history'>): Promise<SystemAlert> {
    try {
      const response = await api.post<SystemAlert>(this.baseUrl, alert)
      return response.data
    } catch (error) {
      console.error('Erro ao criar alerta:', error)
      throw new Error('Falha ao criar alerta')
    }
  }

  // Atualizar alerta existente
  async updateAlert(id: string, updates: Partial<SystemAlert>): Promise<SystemAlert> {
    try {
      const response = await api.put<SystemAlert>(`${this.baseUrl}/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error)
      throw new Error('Falha ao atualizar alerta')
    }
  }

  // Deletar alerta
  async deleteAlert(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error('Erro ao deletar alerta:', error)
      throw new Error('Falha ao deletar alerta')
    }
  }

  // Ativar/desativar alerta
  async toggleAlert(id: string, enabled: boolean): Promise<SystemAlert> {
    try {
      const response = await api.patch<SystemAlert>(`${this.baseUrl}/${id}/toggle`, { enabled })
      return response.data
    } catch (error) {
      console.error('Erro ao alterar status do alerta:', error)
      throw new Error('Falha ao alterar status do alerta')
    }
  }

  // Reconhecer alerta
  async acknowledgeAlert(id: string, userId: string, note?: string): Promise<SystemAlert> {
    try {
      const response = await api.post<SystemAlert>(`${this.baseUrl}/${id}/acknowledge`, {
        userId,
        note
      })
      return response.data
    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error)
      throw new Error('Falha ao reconhecer alerta')
    }
  }

  // Resolver alerta
  async resolveAlert(id: string, userId: string, resolution: string): Promise<SystemAlert> {
    try {
      const response = await api.post<SystemAlert>(`${this.baseUrl}/${id}/resolve`, {
        userId,
        resolution
      })
      return response.data
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
      throw new Error('Falha ao resolver alerta')
    }
  }

  // Suprimir alerta
  async suppressAlert(id: string, config: {
    userId: string
    duration: number // em minutos
    reason: string
    suppressSimilar?: boolean
  }): Promise<SystemAlert> {
    try {
      const response = await api.post<SystemAlert>(`${this.baseUrl}/${id}/suppress`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao suprimir alerta:', error)
      throw new Error('Falha ao suprimir alerta')
    }
  }

  // Testar alerta
  async testAlert(id: string): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/test`)
      return response.data
    } catch (error) {
      console.error('Erro ao testar alerta:', error)
      throw new Error('Falha ao testar alerta')
    }
  }

  // Duplicar alerta
  async duplicateAlert(id: string, name: string): Promise<SystemAlert> {
    try {
      const response = await api.post<SystemAlert>(`${this.baseUrl}/${id}/duplicate`, { name })
      return response.data
    } catch (error) {
      console.error('Erro ao duplicar alerta:', error)
      throw new Error('Falha ao duplicar alerta')
    }
  }

  // Buscar histórico de alertas
  async getAlertHistory(id: string, limit?: number): Promise<AlertHistory[]> {
    try {
      const params = limit ? `?limit=${limit}` : ''
      const response = await api.get<AlertHistory[]>(`${this.baseUrl}/${id}/history${params}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar histórico de alertas:', error)
      throw new Error('Falha ao carregar histórico de alertas')
    }
  }

  // Buscar métricas de alertas
  async getAlertMetrics(id: string, timeRange: string): Promise<AlertMetrics> {
    try {
      const response = await api.get<AlertMetrics>(`${this.baseUrl}/${id}/metrics?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar métricas de alertas:', error)
      throw new Error('Falha ao carregar métricas de alertas')
    }
  }

  // Gerenciar templates de alertas
  async getAlertTemplates(): Promise<AlertTemplate[]> {
    try {
      const response = await api.get<AlertTemplate[]>(`${this.baseUrl}/templates`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar templates de alertas:', error)
      throw new Error('Falha ao carregar templates de alertas')
    }
  }

  async getAlertTemplate(id: string): Promise<AlertTemplate> {
    try {
      const response = await api.get<AlertTemplate>(`${this.baseUrl}/templates/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar template de alerta:', error)
      throw new Error('Falha ao carregar template de alerta')
    }
  }

  async createAlertTemplate(template: Omit<AlertTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<AlertTemplate> {
    try {
      const response = await api.post<AlertTemplate>(`${this.baseUrl}/templates`, template)
      return response.data
    } catch (error) {
      console.error('Erro ao criar template de alerta:', error)
      throw new Error('Falha ao criar template de alerta')
    }
  }

  async updateAlertTemplate(id: string, updates: Partial<AlertTemplate>): Promise<AlertTemplate> {
    try {
      const response = await api.put<AlertTemplate>(`${this.baseUrl}/templates/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar template de alerta:', error)
      throw new Error('Falha ao atualizar template de alerta')
    }
  }

  async deleteAlertTemplate(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/templates/${id}`)
    } catch (error) {
      console.error('Erro ao deletar template de alerta:', error)
      throw new Error('Falha ao deletar template de alerta')
    }
  }

  // Criar alerta a partir de template
  async createAlertFromTemplate(templateId: string, config: {
    name: string
    description?: string
    overrides?: Partial<SystemAlert>
  }): Promise<SystemAlert> {
    try {
      const response = await api.post<SystemAlert>(`${this.baseUrl}/templates/${templateId}/create`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao criar alerta a partir de template:', error)
      throw new Error('Falha ao criar alerta a partir de template')
    }
  }

  // Configurações de alertas
  async getAlertConfiguration(): Promise<AlertConfiguration> {
    try {
      const response = await api.get<AlertConfiguration>(`${this.baseUrl}/config`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar configuração de alertas:', error)
      throw new Error('Falha ao carregar configuração de alertas')
    }
  }

  async updateAlertConfiguration(config: Partial<AlertConfiguration>): Promise<AlertConfiguration> {
    try {
      const response = await api.put<AlertConfiguration>(`${this.baseUrl}/config`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar configuração de alertas:', error)
      throw new Error('Falha ao atualizar configuração de alertas')
    }
  }

  // Validar configuração de alerta
  async validateAlertConfiguration(alert: Partial<SystemAlert>): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/validate`, alert)
      return response.data
    } catch (error) {
      console.error('Erro ao validar configuração de alerta:', error)
      throw new Error('Falha ao validar configuração de alerta')
    }
  }

  // Dashboards de alertas
  async getAlertDashboards(): Promise<AlertDashboard[]> {
    try {
      const response = await api.get<AlertDashboard[]>(`${this.baseUrl}/dashboards`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dashboards de alertas:', error)
      throw new Error('Falha ao carregar dashboards de alertas')
    }
  }

  async getAlertDashboard(id: string): Promise<AlertDashboard> {
    try {
      const response = await api.get<AlertDashboard>(`${this.baseUrl}/dashboards/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dashboard de alertas:', error)
      throw new Error('Falha ao carregar dashboard de alertas')
    }
  }

  async createAlertDashboard(dashboard: Omit<AlertDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertDashboard> {
    try {
      const response = await api.post<AlertDashboard>(`${this.baseUrl}/dashboards`, dashboard)
      return response.data
    } catch (error) {
      console.error('Erro ao criar dashboard de alertas:', error)
      throw new Error('Falha ao criar dashboard de alertas')
    }
  }

  async updateAlertDashboard(id: string, updates: Partial<AlertDashboard>): Promise<AlertDashboard> {
    try {
      const response = await api.put<AlertDashboard>(`${this.baseUrl}/dashboards/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar dashboard de alertas:', error)
      throw new Error('Falha ao atualizar dashboard de alertas')
    }
  }

  async deleteAlertDashboard(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/dashboards/${id}`)
    } catch (error) {
      console.error('Erro ao deletar dashboard de alertas:', error)
      throw new Error('Falha ao deletar dashboard de alertas')
    }
  }

  // Relatórios de alertas
  async generateAlertReport(config: {
    type: 'summary' | 'detailed' | 'trends' | 'performance'
    timeRange: string
    format: 'pdf' | 'csv' | 'json'
    filters?: {
      severity?: AlertSeverity[]
      category?: AlertCategory[]
      status?: AlertStatus[]
    }
    includeCharts?: boolean
  }): Promise<AlertReport> {
    try {
      const response = await api.post<AlertReport>(`${this.baseUrl}/reports`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao gerar relatório de alertas:', error)
      throw new Error('Falha ao gerar relatório de alertas')
    }
  }

  // Integrações de alertas
  async getAlertIntegrations(): Promise<AlertIntegration[]> {
    try {
      const response = await api.get<AlertIntegration[]>(`${this.baseUrl}/integrations`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar integrações de alertas:', error)
      throw new Error('Falha ao carregar integrações de alertas')
    }
  }

  async getAlertIntegration(id: string): Promise<AlertIntegration> {
    try {
      const response = await api.get<AlertIntegration>(`${this.baseUrl}/integrations/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar integração de alertas:', error)
      throw new Error('Falha ao carregar integração de alertas')
    }
  }

  async createAlertIntegration(integration: Omit<AlertIntegration, 'id' | 'createdAt' | 'updatedAt' | 'lastSync' | 'syncCount'>): Promise<AlertIntegration> {
    try {
      const response = await api.post<AlertIntegration>(`${this.baseUrl}/integrations`, integration)
      return response.data
    } catch (error) {
      console.error('Erro ao criar integração de alertas:', error)
      throw new Error('Falha ao criar integração de alertas')
    }
  }

  async updateAlertIntegration(id: string, updates: Partial<AlertIntegration>): Promise<AlertIntegration> {
    try {
      const response = await api.put<AlertIntegration>(`${this.baseUrl}/integrations/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar integração de alertas:', error)
      throw new Error('Falha ao atualizar integração de alertas')
    }
  }

  async deleteAlertIntegration(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/integrations/${id}`)
    } catch (error) {
      console.error('Erro ao deletar integração de alertas:', error)
      throw new Error('Falha ao deletar integração de alertas')
    }
  }

  // Testar integração
  async testAlertIntegration(id: string): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/integrations/${id}/test`)
      return response.data
    } catch (error) {
      console.error('Erro ao testar integração de alertas:', error)
      throw new Error('Falha ao testar integração de alertas')
    }
  }

  // Sincronizar integração
  async syncAlertIntegration(id: string): Promise<{
    success: boolean
    synced: number
    errors: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/integrations/${id}/sync`)
      return response.data
    } catch (error) {
      console.error('Erro ao sincronizar integração de alertas:', error)
      throw new Error('Falha ao sincronizar integração de alertas')
    }
  }

  // Exportar/Importar alertas
  async exportAlerts(config: {
    filters?: {
      ids?: string[]
      categories?: AlertCategory[]
      severity?: AlertSeverity[]
    }
    format: 'json' | 'yaml'
    includeHistory?: boolean
    includeMetrics?: boolean
  }): Promise<{
    data: string
    filename: string
    count: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/export`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao exportar alertas:', error)
      throw new Error('Falha ao exportar alertas')
    }
  }

  async importAlerts(file: File, options?: {
    overwrite?: boolean
    validate?: boolean
    dryRun?: boolean
  }): Promise<{
    success: boolean
    imported: number
    skipped: number
    errors: string[]
    warnings: string[]
  }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }

      const response = await api.post(`${this.baseUrl}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao importar alertas:', error)
      throw new Error('Falha ao importar alertas')
    }
  }

  // Estatísticas gerais de alertas
  async getAlertStatistics(timeRange: string): Promise<{
    total: number
    active: number
    resolved: number
    suppressed: number
    byCategory: Record<AlertCategory, number>
    bySeverity: Record<AlertSeverity, number>
    bySource: Record<AlertSource, number>
    trends: {
      created: Array<{ date: string; count: number }>
      resolved: Array<{ date: string; count: number }>
    }
    topAlerts: Array<{
      id: string
      name: string
      triggerCount: number
      lastTriggered: string
    }>
    mttr: number // Mean Time To Resolution
    mtbf: number // Mean Time Between Failures
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/statistics?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas de alertas:', error)
      throw new Error('Falha ao carregar estatísticas de alertas')
    }
  }

  // Testar conectividade
  async testConnection(): Promise<{
    status: 'success' | 'error'
    latency: number
    message?: string
  }> {
    try {
      const startTime = Date.now()
      const response = await api.get(`${this.baseUrl}/health`)
      const latency = Date.now() - startTime
      
      return {
        status: 'success',
        latency,
        message: response.data.message
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      return {
        status: 'error',
        latency: 0,
        message: 'Falha na conexão com o serviço de alertas'
      }
    }
  }
}

export const alertsService = new AlertsService()
export default alertsService