import {
  AuditLog,
  SecurityEvent,
  ComplianceReport,
  AuditFilters,
  AuditStatistics,
  AuditExportRequest,
  AuditExportResult,
  SecurityAlert,
  AuditTimelineEvent,
  ActionType,
  SeverityLevel,
  EventCategory,
  ComplianceStandard,
  AuditStatus,
  AuditApiResponse,
  AuditLogsResponse,
  SecurityEventsResponse,
  ComplianceReportsResponse
} from '@/types/audit'

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const AUDIT_ENDPOINT = `${API_BASE_URL}/audit`

// Utilitário para requisições HTTP
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${AUDIT_ENDPOINT}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      // Adicionar token de autenticação quando disponível
      // 'Authorization': `Bearer ${getAuthToken()}`
    }
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    }
    
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || 
          `HTTP ${response.status}: ${response.statusText}`
        )
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API Error [${config.method || 'GET'} ${url}]:`, error)
      throw error
    }
  }
  
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url)
  }
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE'
    })
  }
}

const apiClient = new ApiClient()

// Serviço de Auditoria
export class AuditService {
  // ===== LOGS DE AUDITORIA =====
  
  /**
   * Buscar logs de auditoria com filtros
   */
  async getAuditLogs(filters?: AuditFilters): Promise<AuditLogsResponse> {
    const params: Record<string, string> = {}
    
    if (filters) {
      if (filters.userId) params.userId = filters.userId
      if (filters.action) params.action = filters.action.join(',')
      if (filters.category) params.category = filters.category.join(',')
      if (filters.severity) params.severity = filters.severity.join(',')
      if (filters.startDate) params.startDate = filters.startDate.toISOString()
      if (filters.endDate) params.endDate = filters.endDate.toISOString()
      if (filters.search) params.search = filters.search
      if (filters.ipAddress) params.ipAddress = filters.ipAddress
      if (filters.module) params.module = filters.module
      if (filters.limit) params.limit = filters.limit.toString()
      if (filters.offset) params.offset = filters.offset.toString()
    }
    
    return apiClient.get<AuditLogsResponse>('/logs', params)
  }
  
  /**
   * Buscar log específico por ID
   */
  async getAuditLog(logId: string): Promise<AuditApiResponse<AuditLog>> {
    return apiClient.get<AuditApiResponse<AuditLog>>(`/logs/${logId}`)
  }
  
  /**
   * Criar novo log de auditoria
   */
  async createAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditApiResponse<AuditLog>> {
    return apiClient.post<AuditApiResponse<AuditLog>>('/logs', logData)
  }
  
  /**
   * Buscar estatísticas de auditoria
   */
  async getAuditStatistics(period?: {
    startDate: Date
    endDate: Date
  }): Promise<AuditApiResponse<AuditStatistics>> {
    const params: Record<string, string> = {}
    
    if (period) {
      params.startDate = period.startDate.toISOString()
      params.endDate = period.endDate.toISOString()
    }
    
    return apiClient.get<AuditApiResponse<AuditStatistics>>('/statistics', params)
  }
  
  /**
   * Buscar timeline de eventos
   */
  async getAuditTimeline(filters?: {
    userId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<AuditApiResponse<AuditTimelineEvent[]>> {
    const params: Record<string, string> = {}
    
    if (filters) {
      if (filters.userId) params.userId = filters.userId
      if (filters.startDate) params.startDate = filters.startDate.toISOString()
      if (filters.endDate) params.endDate = filters.endDate.toISOString()
      if (filters.limit) params.limit = filters.limit.toString()
    }
    
    return apiClient.get<AuditApiResponse<AuditTimelineEvent[]>>('/timeline', params)
  }
  
  // ===== EVENTOS DE SEGURANÇA =====
  
  /**
   * Buscar eventos de segurança
   */
  async getSecurityEvents(filters?: {
    severity?: SeverityLevel[]
    type?: string[]
    status?: string[]
    dateRange?: { startDate: Date; endDate: Date }
    limit?: number
    offset?: number
  }): Promise<SecurityEventsResponse> {
    const params: Record<string, string> = {}
    
    if (filters) {
      if (filters.severity) params.severity = filters.severity.join(',')
      if (filters.type) params.type = filters.type.join(',')
      if (filters.status) params.status = filters.status.join(',')
      if (filters.dateRange) {
        params.startDate = filters.dateRange.startDate.toISOString()
        params.endDate = filters.dateRange.endDate.toISOString()
      }
      if (filters.limit) params.limit = filters.limit.toString()
      if (filters.offset) params.offset = filters.offset.toString()
    }
    
    return apiClient.get<SecurityEventsResponse>('/security/events', params)
  }
  
  /**
   * Buscar evento de segurança específico
   */
  async getSecurityEvent(eventId: string): Promise<AuditApiResponse<SecurityEvent>> {
    return apiClient.get<AuditApiResponse<SecurityEvent>>(`/security/events/${eventId}`)
  }
  
  /**
   * Criar evento de segurança
   */
  async createSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<AuditApiResponse<SecurityEvent>> {
    return apiClient.post<AuditApiResponse<SecurityEvent>>('/security/events', eventData)
  }
  
  /**
   * Atualizar investigação de evento de segurança
   */
  async updateSecurityInvestigation(eventId: string, updates: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE'
    assignedTo?: string
    notes?: string
    resolution?: string
  }): Promise<AuditApiResponse<SecurityEvent>> {
    return apiClient.patch<AuditApiResponse<SecurityEvent>>(`/security/events/${eventId}/investigation`, updates)
  }
  
  /**
   * Buscar alertas de segurança
   */
  async getSecurityAlerts(filters?: {
    status?: string[]
    severity?: SeverityLevel[]
    limit?: number
  }): Promise<AuditApiResponse<SecurityAlert[]>> {
    const params: Record<string, string> = {}
    
    if (filters) {
      if (filters.status) params.status = filters.status.join(',')
      if (filters.severity) params.severity = filters.severity.join(',')
      if (filters.limit) params.limit = filters.limit.toString()
    }
    
    return apiClient.get<AuditApiResponse<SecurityAlert[]>>('/security/alerts', params)
  }
  
  /**
   * Reconhecer alerta de segurança
   */
  async acknowledgeSecurityAlert(alertId: string, userId: string): Promise<AuditApiResponse<SecurityAlert>> {
    return apiClient.patch<AuditApiResponse<SecurityAlert>>(`/security/alerts/${alertId}/acknowledge`, {
      userId,
      acknowledgedAt: new Date().toISOString()
    })
  }
  
  /**
   * Bloquear endereço IP
   */
  async blockIP(ipAddress: string, reason: string, duration?: number): Promise<AuditApiResponse<void>> {
    return apiClient.post<AuditApiResponse<void>>('/security/block-ip', {
      ipAddress,
      reason,
      duration
    })
  }
  
  /**
   * Buscar métricas de segurança
   */
  async getSecurityMetrics(): Promise<AuditApiResponse<{
    realTimeThreats: {
      active: number
      blocked: number
      investigating: number
    }
    riskScore: {
      current: number
      trend: 'increasing' | 'decreasing' | 'stable'
      history: Array<{ timestamp: Date; score: number }>
    }
    failedLogins: {
      last24h: number
      trend: 'increasing' | 'decreasing' | 'stable'
      topIPs: Array<{ ip: string; attempts: number; blocked: boolean }>
    }
    suspiciousActivities: {
      last24h: number
      categories: Record<string, number>
    }
  }>> {
    return apiClient.get<AuditApiResponse<any>>('/security/metrics')
  }
  
  // ===== COMPLIANCE =====
  
  /**
   * Buscar relatórios de compliance
   */
  async getComplianceReports(filters?: {
    standard?: ComplianceStandard[]
    status?: AuditStatus[]
    dateRange?: { startDate: Date; endDate: Date }
    limit?: number
    offset?: number
  }): Promise<ComplianceReportsResponse> {
    const params: Record<string, string> = {}
    
    if (filters) {
      if (filters.standard) params.standard = filters.standard.join(',')
      if (filters.status) params.status = filters.status.join(',')
      if (filters.dateRange) {
        params.startDate = filters.dateRange.startDate.toISOString()
        params.endDate = filters.dateRange.endDate.toISOString()
      }
      if (filters.limit) params.limit = filters.limit.toString()
      if (filters.offset) params.offset = filters.offset.toString()
    }
    
    return apiClient.get<ComplianceReportsResponse>('/compliance/reports', params)
  }
  
  /**
   * Buscar relatório de compliance específico
   */
  async getComplianceReport(reportId: string): Promise<AuditApiResponse<ComplianceReport>> {
    return apiClient.get<AuditApiResponse<ComplianceReport>>(`/compliance/reports/${reportId}`)
  }
  
  /**
   * Gerar novo relatório de compliance
   */
  async generateComplianceReport(params: {
    templateId: string
    title: string
    period: { startDate: Date; endDate: Date }
    includeRecommendations: boolean
    includeEvidence: boolean
  }): Promise<AuditApiResponse<{ reportId: string; estimatedCompletion: Date }>> {
    return apiClient.post<AuditApiResponse<{ reportId: string; estimatedCompletion: Date }>>('/compliance/reports/generate', params)
  }
  
  /**
   * Buscar templates de compliance
   */
  async getComplianceTemplates(): Promise<AuditApiResponse<Array<{
    id: string
    name: string
    standard: ComplianceStandard
    description: string
    sections: string[]
    requirements: number
    estimatedDuration: string
  }>>> {
    return apiClient.get<AuditApiResponse<any>>('/compliance/templates')
  }
  
  /**
   * Atualizar status de requisito de compliance
   */
  async updateComplianceRequirement(reportId: string, requirementId: string, updates: {
    status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT'
    evidence?: string[]
    notes?: string
  }): Promise<AuditApiResponse<void>> {
    return apiClient.patch<AuditApiResponse<void>>(`/compliance/reports/${reportId}/requirements/${requirementId}`, updates)
  }
  
  /**
   * Adicionar recomendação a relatório de compliance
   */
  async addComplianceRecommendation(reportId: string, sectionId: string, recommendation: {
    title: string
    description: string
    priority: SeverityLevel
    estimatedEffort: string
    dueDate: Date
    assignedTo: string
  }): Promise<AuditApiResponse<void>> {
    return apiClient.post<AuditApiResponse<void>>(`/compliance/reports/${reportId}/sections/${sectionId}/recommendations`, recommendation)
  }
  
  /**
   * Agendar relatório de compliance
   */
  async scheduleComplianceReport(params: {
    templateId: string
    title: string
    frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
    nextRun: Date
    recipients: string[]
  }): Promise<AuditApiResponse<void>> {
    return apiClient.post<AuditApiResponse<void>>('/compliance/reports/schedule', params)
  }
  
  // ===== EXPORTAÇÃO =====
  
  /**
   * Exportar logs de auditoria
   */
  async exportAuditLogs(request: AuditExportRequest): Promise<AuditApiResponse<AuditExportResult>> {
    return apiClient.post<AuditApiResponse<AuditExportResult>>('/export/logs', request)
  }
  
  /**
   * Exportar eventos de segurança
   */
  async exportSecurityEvents(request: AuditExportRequest): Promise<AuditApiResponse<AuditExportResult>> {
    return apiClient.post<AuditApiResponse<AuditExportResult>>('/export/security-events', request)
  }
  
  /**
   * Exportar relatório de compliance
   */
  async exportComplianceReport(reportId: string, format: 'PDF' | 'EXCEL' | 'CSV'): Promise<AuditApiResponse<{
    downloadUrl: string
    expiresAt: Date
  }>> {
    return apiClient.post<AuditApiResponse<{ downloadUrl: string; expiresAt: Date }>>(`/compliance/reports/${reportId}/export`, {
      format
    })
  }
  
  /**
   * Buscar status de exportação
   */
  async getExportStatus(exportId: string): Promise<AuditApiResponse<{
    id: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
    progress: number
    downloadUrl?: string
    error?: string
    createdAt: Date
    completedAt?: Date
  }>> {
    return apiClient.get<AuditApiResponse<any>>(`/export/status/${exportId}`)
  }
  
  // ===== CONFIGURAÇÕES =====
  
  /**
   * Buscar configurações de auditoria
   */
  async getAuditSettings(): Promise<AuditApiResponse<{
    retentionPeriod: number
    enableRealTimeMonitoring: boolean
    alertThresholds: {
      failedLogins: number
      suspiciousActivity: number
      dataAccess: number
    }
    notificationSettings: {
      email: boolean
      sms: boolean
      inApp: boolean
      recipients: string[]
    }
    complianceStandards: ComplianceStandard[]
    autoReportGeneration: boolean
  }>> {
    return apiClient.get<AuditApiResponse<any>>('/settings')
  }
  
  /**
   * Atualizar configurações de auditoria
   */
  async updateAuditSettings(settings: {
    retentionPeriod?: number
    enableRealTimeMonitoring?: boolean
    alertThresholds?: {
      failedLogins?: number
      suspiciousActivity?: number
      dataAccess?: number
    }
    notificationSettings?: {
      email?: boolean
      sms?: boolean
      inApp?: boolean
      recipients?: string[]
    }
    complianceStandards?: ComplianceStandard[]
    autoReportGeneration?: boolean
  }): Promise<AuditApiResponse<void>> {
    return apiClient.patch<AuditApiResponse<void>>('/settings', settings)
  }
  
  // ===== REGRAS DE SEGURANÇA =====
  
  /**
   * Criar regra de segurança personalizada
   */
  async createSecurityRule(rule: {
    name: string
    description: string
    conditions: Record<string, any>
    actions: string[]
    severity: SeverityLevel
    enabled: boolean
  }): Promise<AuditApiResponse<void>> {
    return apiClient.post<AuditApiResponse<void>>('/security/rules', rule)
  }
  
  /**
   * Buscar regras de segurança
   */
  async getSecurityRules(): Promise<AuditApiResponse<Array<{
    id: string
    name: string
    description: string
    conditions: Record<string, any>
    actions: string[]
    severity: SeverityLevel
    enabled: boolean
    createdAt: Date
    lastTriggered?: Date
    triggerCount: number
  }>>> {
    return apiClient.get<AuditApiResponse<any>>('/security/rules')
  }
  
  /**
   * Atualizar regra de segurança
   */
  async updateSecurityRule(ruleId: string, updates: {
    name?: string
    description?: string
    conditions?: Record<string, any>
    actions?: string[]
    severity?: SeverityLevel
    enabled?: boolean
  }): Promise<AuditApiResponse<void>> {
    return apiClient.patch<AuditApiResponse<void>>(`/security/rules/${ruleId}`, updates)
  }
  
  /**
   * Deletar regra de segurança
   */
  async deleteSecurityRule(ruleId: string): Promise<AuditApiResponse<void>> {
    return apiClient.delete<AuditApiResponse<void>>(`/security/rules/${ruleId}`)
  }
  
  // ===== UTILITÁRIOS =====
  
  /**
   * Verificar integridade dos logs
   */
  async verifyLogIntegrity(logIds: string[]): Promise<AuditApiResponse<{
    verified: string[]
    corrupted: string[]
    missing: string[]
  }>> {
    return apiClient.post<AuditApiResponse<any>>('/logs/verify-integrity', { logIds })
  }
  
  /**
   * Buscar atividade de usuário específico
   */
  async getUserActivity(userId: string, filters?: {
    startDate?: Date
    endDate?: Date
    actions?: ActionType[]
    limit?: number
  }): Promise<AuditApiResponse<AuditLog[]>> {
    const params: Record<string, string> = {}
    
    if (filters) {
      if (filters.startDate) params.startDate = filters.startDate.toISOString()
      if (filters.endDate) params.endDate = filters.endDate.toISOString()
      if (filters.actions) params.actions = filters.actions.join(',')
      if (filters.limit) params.limit = filters.limit.toString()
    }
    
    return apiClient.get<AuditApiResponse<AuditLog[]>>(`/users/${userId}/activity`, params)
  }
  
  /**
   * Buscar logs por sessão
   */
  async getSessionLogs(sessionId: string): Promise<AuditApiResponse<AuditLog[]>> {
    return apiClient.get<AuditApiResponse<AuditLog[]>>(`/sessions/${sessionId}/logs`)
  }
  
  /**
   * Buscar padrões suspeitos
   */
  async getSuspiciousPatterns(filters?: {
    timeframe?: '1h' | '24h' | '7d' | '30d'
    minOccurrences?: number
    severity?: SeverityLevel[]
  }): Promise<AuditApiResponse<Array<{
    pattern: string
    description: string
    occurrences: number
    severity: SeverityLevel
    firstSeen: Date
    lastSeen: Date
    affectedUsers: string[]
    affectedIPs: string[]
  }>>> {
    const params: Record<string, string> = {}
    
    if (filters) {
      if (filters.timeframe) params.timeframe = filters.timeframe
      if (filters.minOccurrences) params.minOccurrences = filters.minOccurrences.toString()
      if (filters.severity) params.severity = filters.severity.join(',')
    }
    
    return apiClient.get<AuditApiResponse<any>>('/security/suspicious-patterns', params)
  }
}

// Instância singleton do serviço
export const auditService = new AuditService()

// Export default para compatibilidade
export default auditService