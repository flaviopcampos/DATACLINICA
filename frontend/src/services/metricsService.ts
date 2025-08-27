import { api } from './api'
import type {
  SystemMetrics,
  MetricsFilter,
  MetricsAggregation,
  MetricsQuery,
  MetricsExport,
  MetricsComparison,
  MetricsAnomaly,
  MetricsDashboard,
  MetricsAlert,
  MetricsConfiguration
} from '@/types/metrics'

class MetricsService {
  private readonly baseUrl = '/api/metrics'

  // Buscar métricas do sistema
  async getSystemMetrics(filter?: MetricsFilter): Promise<SystemMetrics> {
    try {
      const params = new URLSearchParams()
      
      if (filter) {
        if (filter.timeRange) {
          params.append('timeRange', filter.timeRange)
        }
        if (filter.startDate) {
          params.append('startDate', filter.startDate)
        }
        if (filter.endDate) {
          params.append('endDate', filter.endDate)
        }
        if (filter.metrics && filter.metrics.length > 0) {
          filter.metrics.forEach(metric => params.append('metrics', metric))
        }
        if (filter.sources && filter.sources.length > 0) {
          filter.sources.forEach(source => params.append('sources', source))
        }
        if (filter.tags && Object.keys(filter.tags).length > 0) {
          Object.entries(filter.tags).forEach(([key, value]) => {
            params.append(`tags[${key}]`, value)
          })
        }
        if (filter.aggregation) {
          params.append('aggregation', filter.aggregation)
        }
        if (filter.interval) {
          params.append('interval', filter.interval)
        }
        if (filter.groupBy && filter.groupBy.length > 0) {
          filter.groupBy.forEach(group => params.append('groupBy', group))
        }
      }

      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl
      
      const response = await api.get<SystemMetrics>(url)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar métricas do sistema:', error)
      throw new Error('Falha ao carregar métricas do sistema')
    }
  }

  // Buscar métricas específicas por IDs
  async getMetricsByIds(ids: string[], timeRange?: string): Promise<SystemMetrics[]> {
    try {
      const params = new URLSearchParams()
      ids.forEach(id => params.append('ids', id))
      if (timeRange) {
        params.append('timeRange', timeRange)
      }

      const response = await api.get<SystemMetrics[]>(`${this.baseUrl}/batch?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar métricas por IDs:', error)
      throw new Error('Falha ao carregar métricas específicas')
    }
  }

  // Executar query personalizada de métricas
  async queryMetrics(query: MetricsQuery): Promise<any> {
    try {
      const response = await api.post<any>(`${this.baseUrl}/query`, query)
      return response.data
    } catch (error) {
      console.error('Erro ao executar query de métricas:', error)
      throw new Error('Falha ao executar consulta de métricas')
    }
  }

  // Buscar agregações de métricas
  async getMetricsAggregation(config: {
    metrics: string[]
    timeRange: string
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count'
    groupBy?: string[]
    interval?: string
  }): Promise<MetricsAggregation> {
    try {
      const response = await api.post<MetricsAggregation>(`${this.baseUrl}/aggregate`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar agregações de métricas:', error)
      throw new Error('Falha ao calcular agregações de métricas')
    }
  }

  // Comparar métricas entre períodos
  async compareMetrics(comparison: {
    metrics: string[]
    currentPeriod: { start: string; end: string }
    previousPeriod: { start: string; end: string }
    groupBy?: string[]
  }): Promise<MetricsComparison> {
    try {
      const response = await api.post<MetricsComparison>(`${this.baseUrl}/compare`, comparison)
      return response.data
    } catch (error) {
      console.error('Erro ao comparar métricas:', error)
      throw new Error('Falha ao comparar métricas entre períodos')
    }
  }

  // Detectar anomalias nas métricas
  async detectAnomalies(config: {
    metrics: string[]
    timeRange: string
    sensitivity: 'low' | 'medium' | 'high'
    algorithm?: 'statistical' | 'ml' | 'threshold'
  }): Promise<MetricsAnomaly[]> {
    try {
      const response = await api.post<MetricsAnomaly[]>(`${this.baseUrl}/anomalies`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao detectar anomalias:', error)
      throw new Error('Falha ao detectar anomalias nas métricas')
    }
  }

  // Buscar métricas em tempo real
  async getRealTimeMetrics(metrics: string[]): Promise<SystemMetrics> {
    try {
      const params = new URLSearchParams()
      metrics.forEach(metric => params.append('metrics', metric))
      
      const response = await api.get<SystemMetrics>(`${this.baseUrl}/realtime?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar métricas em tempo real:', error)
      throw new Error('Falha ao carregar métricas em tempo real')
    }
  }

  // Buscar estatísticas de métricas
  async getMetricsStatistics(timeRange: string): Promise<{
    totalMetrics: number
    activeMetrics: number
    dataPoints: number
    storage: {
      used: number
      total: number
      retention: number
    }
    performance: {
      avgQueryTime: number
      throughput: number
      errorRate: number
    }
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/statistics?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas de métricas:', error)
      throw new Error('Falha ao carregar estatísticas de métricas')
    }
  }

  // Exportar métricas
  async exportMetrics(config: {
    metrics: string[]
    timeRange: string
    format: 'csv' | 'json' | 'xlsx'
    includeMetadata?: boolean
  }): Promise<MetricsExport> {
    try {
      const response = await api.post<MetricsExport>(`${this.baseUrl}/export`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao exportar métricas:', error)
      throw new Error('Falha ao exportar métricas')
    }
  }

  // Importar métricas
  async importMetrics(file: File, options?: {
    format?: 'csv' | 'json'
    overwrite?: boolean
    validate?: boolean
  }): Promise<{
    success: boolean
    imported: number
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
      console.error('Erro ao importar métricas:', error)
      throw new Error('Falha ao importar métricas')
    }
  }

  // Gerenciar dashboards de métricas
  async getDashboards(): Promise<MetricsDashboard[]> {
    try {
      const response = await api.get<MetricsDashboard[]>(`${this.baseUrl}/dashboards`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dashboards:', error)
      throw new Error('Falha ao carregar dashboards de métricas')
    }
  }

  async getDashboard(id: string): Promise<MetricsDashboard> {
    try {
      const response = await api.get<MetricsDashboard>(`${this.baseUrl}/dashboards/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error)
      throw new Error('Falha ao carregar dashboard')
    }
  }

  async createDashboard(dashboard: Omit<MetricsDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<MetricsDashboard> {
    try {
      const response = await api.post<MetricsDashboard>(`${this.baseUrl}/dashboards`, dashboard)
      return response.data
    } catch (error) {
      console.error('Erro ao criar dashboard:', error)
      throw new Error('Falha ao criar dashboard de métricas')
    }
  }

  async updateDashboard(id: string, updates: Partial<MetricsDashboard>): Promise<MetricsDashboard> {
    try {
      const response = await api.put<MetricsDashboard>(`${this.baseUrl}/dashboards/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error)
      throw new Error('Falha ao atualizar dashboard')
    }
  }

  async deleteDashboard(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/dashboards/${id}`)
    } catch (error) {
      console.error('Erro ao deletar dashboard:', error)
      throw new Error('Falha ao deletar dashboard')
    }
  }

  // Gerenciar alertas de métricas
  async getMetricsAlerts(): Promise<MetricsAlert[]> {
    try {
      const response = await api.get<MetricsAlert[]>(`${this.baseUrl}/alerts`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alertas de métricas:', error)
      throw new Error('Falha ao carregar alertas de métricas')
    }
  }

  async createMetricsAlert(alert: Omit<MetricsAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<MetricsAlert> {
    try {
      const response = await api.post<MetricsAlert>(`${this.baseUrl}/alerts`, alert)
      return response.data
    } catch (error) {
      console.error('Erro ao criar alerta de métrica:', error)
      throw new Error('Falha ao criar alerta de métrica')
    }
  }

  async updateMetricsAlert(id: string, updates: Partial<MetricsAlert>): Promise<MetricsAlert> {
    try {
      const response = await api.put<MetricsAlert>(`${this.baseUrl}/alerts/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar alerta de métrica:', error)
      throw new Error('Falha ao atualizar alerta de métrica')
    }
  }

  async deleteMetricsAlert(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/alerts/${id}`)
    } catch (error) {
      console.error('Erro ao deletar alerta de métrica:', error)
      throw new Error('Falha ao deletar alerta de métrica')
    }
  }

  // Configurações de métricas
  async getConfiguration(): Promise<MetricsConfiguration> {
    try {
      const response = await api.get<MetricsConfiguration>(`${this.baseUrl}/config`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar configuração de métricas:', error)
      throw new Error('Falha ao carregar configuração de métricas')
    }
  }

  async updateConfiguration(config: Partial<MetricsConfiguration>): Promise<MetricsConfiguration> {
    try {
      const response = await api.put<MetricsConfiguration>(`${this.baseUrl}/config`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar configuração de métricas:', error)
      throw new Error('Falha ao atualizar configuração de métricas')
    }
  }

  // Validar configuração
  async validateConfiguration(config: MetricsConfiguration): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/config/validate`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao validar configuração:', error)
      throw new Error('Falha ao validar configuração de métricas')
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
        message: 'Falha na conexão com o serviço de métricas'
      }
    }
  }

  // Limpar cache de métricas
  async clearCache(pattern?: string): Promise<{
    cleared: number
    message: string
  }> {
    try {
      const params = pattern ? `?pattern=${encodeURIComponent(pattern)}` : ''
      const response = await api.delete(`${this.baseUrl}/cache${params}`)
      return response.data
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
      throw new Error('Falha ao limpar cache de métricas')
    }
  }

  // Buscar métricas disponíveis
  async getAvailableMetrics(): Promise<Array<{
    name: string
    description: string
    type: string
    unit: string
    tags: string[]
    source: string
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/available`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar métricas disponíveis:', error)
      throw new Error('Falha ao carregar métricas disponíveis')
    }
  }

  // Buscar fontes de métricas
  async getMetricsSources(): Promise<Array<{
    name: string
    type: string
    status: 'active' | 'inactive' | 'error'
    lastUpdate: string
    metricsCount: number
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/sources`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar fontes de métricas:', error)
      throw new Error('Falha ao carregar fontes de métricas')
    }
  }
}

export const metricsService = new MetricsService()
export default metricsService