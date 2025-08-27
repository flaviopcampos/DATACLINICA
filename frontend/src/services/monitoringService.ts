import { api } from './api'
import type {
  SystemMonitoring,
  SystemHealth,
  HealthCheck,
  UptimeMetrics,
  PerformanceMonitoring,
  ResourceMonitoring,
  ServiceMonitoring,
  EndpointMonitoring,
  DependencyMonitoring,
  MonitoringAlert,
  Incident,
  MaintenanceWindow,
  SLAMetrics,
  MonitoringConfiguration,
  TimeSeriesData,
  ResourceAlert,
  ServiceAlert,
  EndpointAlert,
  DependencyAlert,
  MonitoringDashboard,
  MonitoringReport
} from '@/types/monitoring'

class MonitoringService {
  private readonly baseUrl = '/api/monitoring'

  // Monitoramento geral do sistema
  async getSystemMonitoring(): Promise<SystemMonitoring> {
    try {
      const response = await api.get<SystemMonitoring>(`${this.baseUrl}/system`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar monitoramento do sistema:', error)
      throw new Error('Falha ao carregar dados de monitoramento do sistema')
    }
  }

  // Saúde do sistema
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await api.get<SystemHealth>(`${this.baseUrl}/health`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar saúde do sistema:', error)
      throw new Error('Falha ao carregar dados de saúde do sistema')
    }
  }

  // Verificações de saúde
  async getHealthChecks(): Promise<HealthCheck[]> {
    try {
      const response = await api.get<HealthCheck[]>(`${this.baseUrl}/health/checks`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar verificações de saúde:', error)
      throw new Error('Falha ao carregar verificações de saúde')
    }
  }

  async runHealthCheck(checkId: string): Promise<HealthCheck> {
    try {
      const response = await api.post<HealthCheck>(`${this.baseUrl}/health/checks/${checkId}/run`)
      return response.data
    } catch (error) {
      console.error('Erro ao executar verificação de saúde:', error)
      throw new Error('Falha ao executar verificação de saúde')
    }
  }

  async createHealthCheck(check: Omit<HealthCheck, 'id' | 'lastRun' | 'status' | 'message' | 'duration'>): Promise<HealthCheck> {
    try {
      const response = await api.post<HealthCheck>(`${this.baseUrl}/health/checks`, check)
      return response.data
    } catch (error) {
      console.error('Erro ao criar verificação de saúde:', error)
      throw new Error('Falha ao criar verificação de saúde')
    }
  }

  async updateHealthCheck(id: string, updates: Partial<HealthCheck>): Promise<HealthCheck> {
    try {
      const response = await api.put<HealthCheck>(`${this.baseUrl}/health/checks/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar verificação de saúde:', error)
      throw new Error('Falha ao atualizar verificação de saúde')
    }
  }

  async deleteHealthCheck(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/health/checks/${id}`)
    } catch (error) {
      console.error('Erro ao deletar verificação de saúde:', error)
      throw new Error('Falha ao deletar verificação de saúde')
    }
  }

  // Métricas de uptime
  async getUptimeMetrics(timeRange: string): Promise<UptimeMetrics> {
    try {
      const response = await api.get<UptimeMetrics>(`${this.baseUrl}/uptime?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar métricas de uptime:', error)
      throw new Error('Falha ao carregar métricas de uptime')
    }
  }

  // Monitoramento de performance
  async getPerformanceMonitoring(timeRange: string): Promise<PerformanceMonitoring> {
    try {
      const response = await api.get<PerformanceMonitoring>(`${this.baseUrl}/performance?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar monitoramento de performance:', error)
      throw new Error('Falha ao carregar dados de performance')
    }
  }

  // Monitoramento de recursos
  async getResourceMonitoring(timeRange: string): Promise<ResourceMonitoring> {
    try {
      const response = await api.get<ResourceMonitoring>(`${this.baseUrl}/resources?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar monitoramento de recursos:', error)
      throw new Error('Falha ao carregar dados de recursos')
    }
  }

  // Monitoramento de serviços
  async getServiceMonitoring(): Promise<ServiceMonitoring[]> {
    try {
      const response = await api.get<ServiceMonitoring[]>(`${this.baseUrl}/services`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar monitoramento de serviços:', error)
      throw new Error('Falha ao carregar dados de serviços')
    }
  }

  async getServiceById(id: string): Promise<ServiceMonitoring> {
    try {
      const response = await api.get<ServiceMonitoring>(`${this.baseUrl}/services/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar serviço por ID:', error)
      throw new Error('Falha ao carregar dados do serviço')
    }
  }

  async createService(service: Omit<ServiceMonitoring, 'id' | 'status' | 'lastCheck' | 'uptime' | 'responseTime' | 'errorRate'>): Promise<ServiceMonitoring> {
    try {
      const response = await api.post<ServiceMonitoring>(`${this.baseUrl}/services`, service)
      return response.data
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
      throw new Error('Falha ao criar monitoramento de serviço')
    }
  }

  async updateService(id: string, updates: Partial<ServiceMonitoring>): Promise<ServiceMonitoring> {
    try {
      const response = await api.put<ServiceMonitoring>(`${this.baseUrl}/services/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      throw new Error('Falha ao atualizar monitoramento de serviço')
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/services/${id}`)
    } catch (error) {
      console.error('Erro ao deletar serviço:', error)
      throw new Error('Falha ao deletar monitoramento de serviço')
    }
  }

  // Monitoramento de endpoints
  async getEndpointMonitoring(): Promise<EndpointMonitoring[]> {
    try {
      const response = await api.get<EndpointMonitoring[]>(`${this.baseUrl}/endpoints`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar monitoramento de endpoints:', error)
      throw new Error('Falha ao carregar dados de endpoints')
    }
  }

  async getEndpointById(id: string): Promise<EndpointMonitoring> {
    try {
      const response = await api.get<EndpointMonitoring>(`${this.baseUrl}/endpoints/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar endpoint por ID:', error)
      throw new Error('Falha ao carregar dados do endpoint')
    }
  }

  async createEndpoint(endpoint: Omit<EndpointMonitoring, 'id' | 'status' | 'lastCheck' | 'responseTime' | 'statusCode' | 'uptime' | 'errorRate'>): Promise<EndpointMonitoring> {
    try {
      const response = await api.post<EndpointMonitoring>(`${this.baseUrl}/endpoints`, endpoint)
      return response.data
    } catch (error) {
      console.error('Erro ao criar endpoint:', error)
      throw new Error('Falha ao criar monitoramento de endpoint')
    }
  }

  async updateEndpoint(id: string, updates: Partial<EndpointMonitoring>): Promise<EndpointMonitoring> {
    try {
      const response = await api.put<EndpointMonitoring>(`${this.baseUrl}/endpoints/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar endpoint:', error)
      throw new Error('Falha ao atualizar monitoramento de endpoint')
    }
  }

  async deleteEndpoint(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/endpoints/${id}`)
    } catch (error) {
      console.error('Erro ao deletar endpoint:', error)
      throw new Error('Falha ao deletar monitoramento de endpoint')
    }
  }

  // Monitoramento de dependências
  async getDependencyMonitoring(): Promise<DependencyMonitoring[]> {
    try {
      const response = await api.get<DependencyMonitoring[]>(`${this.baseUrl}/dependencies`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar monitoramento de dependências:', error)
      throw new Error('Falha ao carregar dados de dependências')
    }
  }

  async getDependencyById(id: string): Promise<DependencyMonitoring> {
    try {
      const response = await api.get<DependencyMonitoring>(`${this.baseUrl}/dependencies/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dependência por ID:', error)
      throw new Error('Falha ao carregar dados da dependência')
    }
  }

  async createDependency(dependency: Omit<DependencyMonitoring, 'id' | 'status' | 'lastCheck' | 'responseTime' | 'uptime' | 'errorRate'>): Promise<DependencyMonitoring> {
    try {
      const response = await api.post<DependencyMonitoring>(`${this.baseUrl}/dependencies`, dependency)
      return response.data
    } catch (error) {
      console.error('Erro ao criar dependência:', error)
      throw new Error('Falha ao criar monitoramento de dependência')
    }
  }

  async updateDependency(id: string, updates: Partial<DependencyMonitoring>): Promise<DependencyMonitoring> {
    try {
      const response = await api.put<DependencyMonitoring>(`${this.baseUrl}/dependencies/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar dependência:', error)
      throw new Error('Falha ao atualizar monitoramento de dependência')
    }
  }

  async deleteDependency(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/dependencies/${id}`)
    } catch (error) {
      console.error('Erro ao deletar dependência:', error)
      throw new Error('Falha ao deletar monitoramento de dependência')
    }
  }

  // Alertas de monitoramento
  async getMonitoringAlerts(status?: 'active' | 'resolved' | 'suppressed'): Promise<MonitoringAlert[]> {
    try {
      const params = status ? `?status=${status}` : ''
      const response = await api.get<MonitoringAlert[]>(`${this.baseUrl}/alerts${params}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alertas de monitoramento:', error)
      throw new Error('Falha ao carregar alertas de monitoramento')
    }
  }

  async getAlertById(id: string): Promise<MonitoringAlert> {
    try {
      const response = await api.get<MonitoringAlert>(`${this.baseUrl}/alerts/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alerta por ID:', error)
      throw new Error('Falha ao carregar dados do alerta')
    }
  }

  async acknowledgeAlert(id: string, userId: string, note?: string): Promise<MonitoringAlert> {
    try {
      const response = await api.post<MonitoringAlert>(`${this.baseUrl}/alerts/${id}/acknowledge`, {
        userId,
        note
      })
      return response.data
    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error)
      throw new Error('Falha ao reconhecer alerta')
    }
  }

  async resolveAlert(id: string, userId: string, resolution: string): Promise<MonitoringAlert> {
    try {
      const response = await api.post<MonitoringAlert>(`${this.baseUrl}/alerts/${id}/resolve`, {
        userId,
        resolution
      })
      return response.data
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
      throw new Error('Falha ao resolver alerta')
    }
  }

  async suppressAlert(id: string, userId: string, duration: number, reason: string): Promise<MonitoringAlert> {
    try {
      const response = await api.post<MonitoringAlert>(`${this.baseUrl}/alerts/${id}/suppress`, {
        userId,
        duration,
        reason
      })
      return response.data
    } catch (error) {
      console.error('Erro ao suprimir alerta:', error)
      throw new Error('Falha ao suprimir alerta')
    }
  }

  // Incidentes
  async getIncidents(status?: 'open' | 'investigating' | 'resolved' | 'closed'): Promise<Incident[]> {
    try {
      const params = status ? `?status=${status}` : ''
      const response = await api.get<Incident[]>(`${this.baseUrl}/incidents${params}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar incidentes:', error)
      throw new Error('Falha ao carregar incidentes')
    }
  }

  async getIncidentById(id: string): Promise<Incident> {
    try {
      const response = await api.get<Incident>(`${this.baseUrl}/incidents/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar incidente por ID:', error)
      throw new Error('Falha ao carregar dados do incidente')
    }
  }

  async createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt'>): Promise<Incident> {
    try {
      const response = await api.post<Incident>(`${this.baseUrl}/incidents`, incident)
      return response.data
    } catch (error) {
      console.error('Erro ao criar incidente:', error)
      throw new Error('Falha ao criar incidente')
    }
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    try {
      const response = await api.put<Incident>(`${this.baseUrl}/incidents/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar incidente:', error)
      throw new Error('Falha ao atualizar incidente')
    }
  }

  async resolveIncident(id: string, resolution: string): Promise<Incident> {
    try {
      const response = await api.post<Incident>(`${this.baseUrl}/incidents/${id}/resolve`, {
        resolution
      })
      return response.data
    } catch (error) {
      console.error('Erro ao resolver incidente:', error)
      throw new Error('Falha ao resolver incidente')
    }
  }

  // Janelas de manutenção
  async getMaintenanceWindows(status?: 'scheduled' | 'active' | 'completed' | 'cancelled'): Promise<MaintenanceWindow[]> {
    try {
      const params = status ? `?status=${status}` : ''
      const response = await api.get<MaintenanceWindow[]>(`${this.baseUrl}/maintenance${params}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar janelas de manutenção:', error)
      throw new Error('Falha ao carregar janelas de manutenção')
    }
  }

  async getMaintenanceWindowById(id: string): Promise<MaintenanceWindow> {
    try {
      const response = await api.get<MaintenanceWindow>(`${this.baseUrl}/maintenance/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar janela de manutenção por ID:', error)
      throw new Error('Falha ao carregar dados da janela de manutenção')
    }
  }

  async createMaintenanceWindow(window: Omit<MaintenanceWindow, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceWindow> {
    try {
      const response = await api.post<MaintenanceWindow>(`${this.baseUrl}/maintenance`, window)
      return response.data
    } catch (error) {
      console.error('Erro ao criar janela de manutenção:', error)
      throw new Error('Falha ao criar janela de manutenção')
    }
  }

  async updateMaintenanceWindow(id: string, updates: Partial<MaintenanceWindow>): Promise<MaintenanceWindow> {
    try {
      const response = await api.put<MaintenanceWindow>(`${this.baseUrl}/maintenance/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar janela de manutenção:', error)
      throw new Error('Falha ao atualizar janela de manutenção')
    }
  }

  async cancelMaintenanceWindow(id: string, reason: string): Promise<MaintenanceWindow> {
    try {
      const response = await api.post<MaintenanceWindow>(`${this.baseUrl}/maintenance/${id}/cancel`, {
        reason
      })
      return response.data
    } catch (error) {
      console.error('Erro ao cancelar janela de manutenção:', error)
      throw new Error('Falha ao cancelar janela de manutenção')
    }
  }

  // Métricas de SLA
  async getSLAMetrics(timeRange: string): Promise<SLAMetrics> {
    try {
      const response = await api.get<SLAMetrics>(`${this.baseUrl}/sla?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar métricas de SLA:', error)
      throw new Error('Falha ao carregar métricas de SLA')
    }
  }

  // Configuração de monitoramento
  async getMonitoringConfiguration(): Promise<MonitoringConfiguration> {
    try {
      const response = await api.get<MonitoringConfiguration>(`${this.baseUrl}/config`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar configuração de monitoramento:', error)
      throw new Error('Falha ao carregar configuração de monitoramento')
    }
  }

  async updateMonitoringConfiguration(config: Partial<MonitoringConfiguration>): Promise<MonitoringConfiguration> {
    try {
      const response = await api.put<MonitoringConfiguration>(`${this.baseUrl}/config`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar configuração de monitoramento:', error)
      throw new Error('Falha ao atualizar configuração de monitoramento')
    }
  }

  // Dados de série temporal
  async getTimeSeriesData(config: {
    metric: string
    timeRange: string
    granularity: 'minute' | 'hour' | 'day'
    filters?: Record<string, any>
  }): Promise<TimeSeriesData[]> {
    try {
      const response = await api.post<TimeSeriesData[]>(`${this.baseUrl}/timeseries`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dados de série temporal:', error)
      throw new Error('Falha ao carregar dados de série temporal')
    }
  }

  // Dashboards de monitoramento
  async getMonitoringDashboards(): Promise<MonitoringDashboard[]> {
    try {
      const response = await api.get<MonitoringDashboard[]>(`${this.baseUrl}/dashboards`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dashboards de monitoramento:', error)
      throw new Error('Falha ao carregar dashboards de monitoramento')
    }
  }

  async getMonitoringDashboard(id: string): Promise<MonitoringDashboard> {
    try {
      const response = await api.get<MonitoringDashboard>(`${this.baseUrl}/dashboards/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dashboard de monitoramento:', error)
      throw new Error('Falha ao carregar dashboard de monitoramento')
    }
  }

  async createMonitoringDashboard(dashboard: Omit<MonitoringDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonitoringDashboard> {
    try {
      const response = await api.post<MonitoringDashboard>(`${this.baseUrl}/dashboards`, dashboard)
      return response.data
    } catch (error) {
      console.error('Erro ao criar dashboard de monitoramento:', error)
      throw new Error('Falha ao criar dashboard de monitoramento')
    }
  }

  async updateMonitoringDashboard(id: string, updates: Partial<MonitoringDashboard>): Promise<MonitoringDashboard> {
    try {
      const response = await api.put<MonitoringDashboard>(`${this.baseUrl}/dashboards/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar dashboard de monitoramento:', error)
      throw new Error('Falha ao atualizar dashboard de monitoramento')
    }
  }

  async deleteMonitoringDashboard(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/dashboards/${id}`)
    } catch (error) {
      console.error('Erro ao deletar dashboard de monitoramento:', error)
      throw new Error('Falha ao deletar dashboard de monitoramento')
    }
  }

  // Relatórios de monitoramento
  async generateMonitoringReport(config: {
    type: 'uptime' | 'performance' | 'sla' | 'incidents'
    timeRange: string
    format: 'pdf' | 'csv' | 'json'
    includeCharts?: boolean
    filters?: Record<string, any>
  }): Promise<MonitoringReport> {
    try {
      const response = await api.post<MonitoringReport>(`${this.baseUrl}/reports`, config)
      return response.data
    } catch (error) {
      console.error('Erro ao gerar relatório de monitoramento:', error)
      throw new Error('Falha ao gerar relatório de monitoramento')
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
        message: 'Falha na conexão com o serviço de monitoramento'
      }
    }
  }
}

export const monitoringService = new MonitoringService()
export default monitoringService