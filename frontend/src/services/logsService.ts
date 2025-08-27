import { api } from './api'
import type {
  SystemLog,
  LogFilter,
  LogPagination,
  LogSearchResult,
  LogAggregations,
  LogConfiguration,
  LogStatistics,
  LogExport,
  LogAnalysis,
  LogStream,
  LogAlert,
  LogDashboard,
  LogAudit,
  LogMetrics
} from '@/types/logs'

class LogsService {
  private readonly baseUrl = '/api/logs'

  // Buscar logs do sistema
  async getLogs(filter?: LogFilter, pagination?: LogPagination): Promise<LogSearchResult> {
    try {
      const params = new URLSearchParams()
      
      if (filter) {
        if (filter.levels && filter.levels.length > 0) {
          filter.levels.forEach(level => params.append('level', level))
        }
        if (filter.sources && filter.sources.length > 0) {
          filter.sources.forEach(source => params.append('source', source))
        }
        if (filter.categories && filter.categories.length > 0) {
          filter.categories.forEach(category => params.append('category', category))
        }
        if (filter.search?.query) {
          params.append('message', filter.search.query)
        }
        if (filter.userId) {
          params.append('userId', filter.userId)
        }
        if (filter.sessionId) {
          params.append('sessionId', filter.sessionId)
        }
        if (filter.correlationId) {
          params.append('correlationId', filter.correlationId)
        }
        if (filter.traceId) {
          params.append('traceId', filter.traceId)
        }
        if (filter.ip) {
          params.append('ipAddress', filter.ip)
        }
        if (filter.timeRange?.start) {
          params.append('startTime', filter.timeRange.start)
        }
        if (filter.timeRange?.end) {
          params.append('endTime', filter.timeRange.end)
        }
        if (filter.tags && filter.tags.length > 0) {
          filter.tags.forEach(tag => params.append('tags', tag))
        }
        if (filter.hasError !== undefined) {
          params.append('hasError', String(filter.hasError))
        }
        if (filter.duration?.min !== undefined) {
          params.append('minDuration', String(filter.duration.min))
        }
        if (filter.duration?.max !== undefined) {
          params.append('maxDuration', String(filter.duration.max))
        }
        if (filter.status && filter.status.length > 0) {
          filter.status.forEach(status => params.append('status', String(status)))
        }
      }

      if (pagination) {
        if (pagination.page !== undefined) {
          params.append('page', String(pagination.page))
        }
        if (pagination.limit !== undefined) {
          params.append('limit', String(pagination.limit))
        }
        if (pagination.sortBy) {
          params.append('sortBy', pagination.sortBy)
        }
        if (pagination.sortOrder) {
          params.append('sortOrder', pagination.sortOrder)
        }
      }

      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl
      
      const response = await api.get<LogSearchResult>(url)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      throw new Error('Falha ao carregar logs do sistema')
    }
  }

  // Buscar log específico por ID
  async getLogById(id: string): Promise<SystemLog> {
    try {
      const response = await api.get<SystemLog>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar log por ID:', error)
      throw new Error('Falha ao carregar log específico')
    }
  }

  // Buscar logs relacionados
  async getRelatedLogs(id: string, type: 'correlation' | 'trace' | 'session' | 'user' = 'correlation'): Promise<SystemLog[]> {
    try {
      const response = await api.get<SystemLog[]>(`${this.baseUrl}/${id}/related?type=${type}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar logs relacionados:', error)
      throw new Error('Falha ao carregar logs relacionados')
    }
  }

  // Buscar agregações de logs
  async getLogAggregations(filter?: LogFilter): Promise<LogAggregations> {
    try {
      const params = new URLSearchParams()
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, String(v)))
            } else {
              params.append(key, String(value))
            }
          }
        })
      }

      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}/aggregations?${queryString}` : `${this.baseUrl}/aggregations`
      
      const response = await api.get<LogAggregations>(url)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar agregações de logs:', error)
      throw new Error('Falha ao carregar agregações de logs')
    }
  }

  // Buscar estatísticas de logs
  async getLogStatistics(filter?: LogFilter): Promise<LogStatistics> {
    try {
      const params = new URLSearchParams()
      if (filter?.timeRange?.start) {
        params.append('startTime', filter.timeRange.start)
      }
      if (filter?.timeRange?.end) {
        params.append('endTime', filter.timeRange.end)
      }
      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}/statistics?${queryString}` : `${this.baseUrl}/statistics`
      const response = await api.get<LogStatistics>(url)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas de logs:', error)
      throw new Error('Falha ao carregar estatísticas de logs')
    }
  }

  // Buscar análise de logs
  async getLogAnalysis(config: {
    timeRange: string
    analysisType: 'errors' | 'performance' | 'patterns' | 'anomalies'
    filters?: LogFilter
  }): Promise<LogAnalysis> {
    try {
      const response = await api.post<LogAnalysis>(`${this.baseUrl}/analysis`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar análise de logs:', error)
      throw new Error('Falha ao analisar logs')
    }
  }

  // Exportar logs
  async exportLogs(config: {
    filter?: LogFilter
    format: 'csv' | 'json' | 'txt'
    includeMetadata?: boolean
    maxRecords?: number
  }): Promise<LogExport> {
    try {
      const response = await api.post<LogExport>(`${this.baseUrl}/export`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      throw new Error('Falha ao exportar logs')
    }
  }

  // Importar logs
  async importLogs(file: File, options?: {
    format?: 'json' | 'csv' | 'syslog'
    overwrite?: boolean
    validate?: boolean
    batchSize?: number
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
      console.error('Erro ao importar logs:', error)
      throw new Error('Falha ao importar logs')
    }
  }

  // Gerenciar streams de logs
  async getLogStreams(): Promise<LogStream[]> {
    try {
      const response = await api.get<LogStream[]>(`${this.baseUrl}/streams`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar streams de logs:', error)
      throw new Error('Falha ao carregar streams de logs')
    }
  }

  async createLogStream(stream: Omit<LogStream, 'id' | 'createdAt' | 'updatedAt'>): Promise<LogStream> {
    try {
      const response = await api.post<LogStream>(`${this.baseUrl}/streams`, stream)
      return response.data
    } catch (error) {
      console.error('Erro ao criar stream de logs:', error)
      throw new Error('Falha ao criar stream de logs')
    }
  }

  async updateLogStream(id: string, updates: Partial<LogStream>): Promise<LogStream> {
    try {
      const response = await api.put<LogStream>(`${this.baseUrl}/streams/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar stream de logs:', error)
      throw new Error('Falha ao atualizar stream de logs')
    }
  }

  async deleteLogStream(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/streams/${id}`)
    } catch (error) {
      console.error('Erro ao deletar stream de logs:', error)
      throw new Error('Falha ao deletar stream de logs')
    }
  }

  // Gerenciar alertas de logs
  async getLogAlerts(): Promise<LogAlert[]> {
    try {
      const response = await api.get<LogAlert[]>(`${this.baseUrl}/alerts`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alertas de logs:', error)
      throw new Error('Falha ao carregar alertas de logs')
    }
  }

  async createLogAlert(alert: Omit<LogAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<LogAlert> {
    try {
      const response = await api.post<LogAlert>(`${this.baseUrl}/alerts`, alert)
      return response.data
    } catch (error) {
      console.error('Erro ao criar alerta de logs:', error)
      throw new Error('Falha ao criar alerta de logs')
    }
  }

  async updateLogAlert(id: string, updates: Partial<LogAlert>): Promise<LogAlert> {
    try {
      const response = await api.put<LogAlert>(`${this.baseUrl}/alerts/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar alerta de logs:', error)
      throw new Error('Falha ao atualizar alerta de logs')
    }
  }

  async deleteLogAlert(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/alerts/${id}`)
    } catch (error) {
      console.error('Erro ao deletar alerta de logs:', error)
      throw new Error('Falha ao deletar alerta de logs')
    }
  }

  // Gerenciar dashboards de logs
  async getLogDashboards(): Promise<LogDashboard[]> {
    try {
      const response = await api.get<LogDashboard[]>(`${this.baseUrl}/dashboards`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dashboards de logs:', error)
      throw new Error('Falha ao carregar dashboards de logs')
    }
  }

  async getLogDashboard(id: string): Promise<LogDashboard> {
    try {
      const response = await api.get<LogDashboard>(`${this.baseUrl}/dashboards/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dashboard de logs:', error)
      throw new Error('Falha ao carregar dashboard de logs')
    }
  }

  async createLogDashboard(dashboard: Omit<LogDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<LogDashboard> {
    try {
      const response = await api.post<LogDashboard>(`${this.baseUrl}/dashboards`, dashboard)
      return response.data
    } catch (error) {
      console.error('Erro ao criar dashboard de logs:', error)
      throw new Error('Falha ao criar dashboard de logs')
    }
  }

  async updateLogDashboard(id: string, updates: Partial<LogDashboard>): Promise<LogDashboard> {
    try {
      const response = await api.put<LogDashboard>(`${this.baseUrl}/dashboards/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar dashboard de logs:', error)
      throw new Error('Falha ao atualizar dashboard de logs')
    }
  }

  async deleteLogDashboard(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/dashboards/${id}`)
    } catch (error) {
      console.error('Erro ao deletar dashboard de logs:', error)
      throw new Error('Falha ao deletar dashboard de logs')
    }
  }

  // Configurações de logs
  async getLogConfiguration(): Promise<LogConfiguration> {
    try {
      const response = await api.get<LogConfiguration>(`${this.baseUrl}/config`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar configuração de logs:', error)
      throw new Error('Falha ao carregar configuração de logs')
    }
  }

  async updateLogConfiguration(config: Partial<LogConfiguration>): Promise<LogConfiguration> {
    try {
      const response = await api.put<LogConfiguration>(`${this.baseUrl}/config`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar configuração de logs:', error)
      throw new Error('Falha ao atualizar configuração de logs')
    }
  }

  // Validar configuração
  async validateLogConfiguration(config: LogConfiguration): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/config/validate`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao validar configuração de logs:', error)
      throw new Error('Falha ao validar configuração de logs')
    }
  }

  // Auditoria de logs
  async getLogAudit(timeRange: string): Promise<LogAudit> {
    try {
      const response = await api.get<LogAudit>(`${this.baseUrl}/audit?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar auditoria de logs:', error)
      throw new Error('Falha ao carregar auditoria de logs')
    }
  }

  // Métricas de logs
  async getLogMetrics(timeRange: string): Promise<LogMetrics> {
    try {
      const response = await api.get<LogMetrics>(`${this.baseUrl}/metrics?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar métricas de logs:', error)
      throw new Error('Falha ao carregar métricas de logs')
    }
  }

  // Limpar logs antigos
  async cleanupLogs(config: {
    olderThan: string // ISO date
    level?: string[]
    source?: string[]
    dryRun?: boolean
  }): Promise<{
    deleted: number
    freed: number // bytes
    errors: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/cleanup`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
      throw new Error('Falha ao limpar logs antigos')
    }
  }

  // Reindexar logs
  async reindexLogs(config?: {
    startDate?: string
    endDate?: string
    force?: boolean
  }): Promise<{
    status: 'started' | 'completed' | 'error'
    jobId?: string
    message: string
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/reindex`, config || {})
      return response.data
    } catch (error) {
      console.error('Erro ao reindexar logs:', error)
      throw new Error('Falha ao reindexar logs')
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
        message: 'Falha na conexão com o serviço de logs'
      }
    }
  }

  // Buscar fontes de logs disponíveis
  async getLogSources(): Promise<Array<{
    name: string
    type: string
    status: 'active' | 'inactive' | 'error'
    lastUpdate: string
    logsCount: number
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/sources`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar fontes de logs:', error)
      throw new Error('Falha ao carregar fontes de logs')
    }
  }

  // Buscar categorias de logs disponíveis
  async getLogCategories(): Promise<Array<{
    name: string
    description: string
    count: number
    lastUpdate: string
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/categories`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar categorias de logs:', error)
      throw new Error('Falha ao carregar categorias de logs')
    }
  }
}

export const logsService = new LogsService()
export default logsService