import api from '@/lib/api'
import { 
  BackupSettings, 
  BackupSettingsUpdate, 
  BackupJob, 
  BackupHistory, 
  BackupStatistics,
  StorageProvider,
  BackupSchedule
} from '@/types/backup'

class BackupService {
  private readonly baseUrl = '/api/backup'

  /**
   * Buscar configurações de backup
   */
  async getBackupSettings(): Promise<BackupSettings> {
    try {
      const response = await api.get<BackupSettings>(`${this.baseUrl}/settings`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar configurações de backup')
    }
  }

  /**
   * Atualizar configurações de backup
   */
  async updateBackupSettings(data: BackupSettingsUpdate): Promise<BackupSettings> {
    try {
      const response = await api.put<BackupSettings>(`${this.baseUrl}/settings`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar configurações de backup')
    }
  }

  /**
   * Iniciar backup manual
   */
  async startBackup(options?: {
    type?: 'full' | 'incremental' | 'differential'
    description?: string
    includePaths?: string[]
    excludePaths?: string[]
  }): Promise<{
    jobId: string
    status: 'started'
    estimatedDuration: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/start`, options)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao iniciar backup')
    }
  }

  /**
   * Cancelar backup em andamento
   */
  async cancelBackup(jobId: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/jobs/${jobId}/cancel`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao cancelar backup')
    }
  }

  /**
   * Buscar jobs de backup ativos
   */
  async getActiveJobs(): Promise<BackupJob[]> {
    try {
      const response = await api.get<BackupJob[]>(`${this.baseUrl}/jobs/active`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar jobs ativos')
    }
  }

  /**
   * Buscar status de um job específico
   */
  async getJobStatus(jobId: string): Promise<BackupJob> {
    try {
      const response = await api.get<BackupJob>(`${this.baseUrl}/jobs/${jobId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar status do job')
    }
  }

  /**
   * Buscar histórico de backups
   */
  async getBackupHistory(params?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
    status?: 'success' | 'failed' | 'cancelled' | 'running'
    type?: 'full' | 'incremental' | 'differential'
  }): Promise<{
    backups: BackupHistory[]
    total: number
    hasMore: boolean
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/history`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar histórico de backups')
    }
  }

  /**
   * Buscar estatísticas de backup
   */
  async getBackupStatistics(): Promise<BackupStatistics> {
    try {
      const response = await api.get<BackupStatistics>(`${this.baseUrl}/statistics`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar estatísticas de backup')
    }
  }

  /**
   * Restaurar backup
   */
  async restoreBackup(backupId: string, options?: {
    targetPath?: string
    overwrite?: boolean
    selectedFiles?: string[]
    restorePermissions?: boolean
  }): Promise<{
    jobId: string
    status: 'started'
    estimatedDuration: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/restore/${backupId}`, options)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao restaurar backup')
    }
  }

  /**
   * Deletar backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${backupId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao deletar backup')
    }
  }

  /**
   * Verificar integridade do backup
   */
  async verifyBackup(backupId: string): Promise<{
    jobId: string
    status: 'started'
    estimatedDuration: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/${backupId}/verify`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao verificar integridade do backup')
    }
  }

  /**
   * Testar conexão com armazenamento
   */
  async testStorageConnection(provider: StorageProvider): Promise<{
    success: boolean
    message: string
    latency?: number
    availableSpace?: number
    error?: string
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/test-storage`, provider)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao testar conexão com armazenamento')
    }
  }

  /**
   * Configurar política de retenção
   */
  async configureRetentionPolicy(policy: {
    type: 'time' | 'count'
    value: number
    unit?: 'days' | 'weeks' | 'months' | 'years'
    archiveOldBackups: boolean
    archiveAfter?: number
    archiveUnit?: 'days' | 'weeks' | 'months'
    deleteAfterArchive: boolean
    deleteAfter?: number
    deleteUnit?: 'days' | 'weeks' | 'months' | 'years'
  }): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/retention-policy`, policy)
    } catch (error) {
      throw this.handleError(error, 'Erro ao configurar política de retenção')
    }
  }

  /**
   * Buscar política de retenção
   */
  async getRetentionPolicy(): Promise<{
    type: 'time' | 'count'
    value: number
    unit?: 'days' | 'weeks' | 'months' | 'years'
    archiveOldBackups: boolean
    archiveAfter?: number
    archiveUnit?: 'days' | 'weeks' | 'months'
    deleteAfterArchive: boolean
    deleteAfter?: number
    deleteUnit?: 'days' | 'weeks' | 'months' | 'years'
    nextCleanup?: string
    affectedBackups: number
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/retention-policy`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar política de retenção')
    }
  }

  /**
   * Limpar backups antigos
   */
  async cleanupOldBackups(options?: {
    dryRun?: boolean
    force?: boolean
  }): Promise<{
    deletedBackups: Array<{
      id: string
      name: string
      size: number
      createdAt: string
    }>
    freedSpace: number
    totalDeleted: number
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/cleanup`, options)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao limpar backups antigos')
    }
  }

  /**
   * Agendar backup
   */
  async scheduleBackup(schedule: BackupSchedule): Promise<{
    scheduleId: string
    nextRun: string
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/schedule`, schedule)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao agendar backup')
    }
  }

  /**
   * Buscar agendamentos de backup
   */
  async getBackupSchedules(): Promise<Array<BackupSchedule & {
    id: string
    nextRun: string
    lastRun?: string
    status: 'active' | 'paused' | 'disabled'
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/schedules`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar agendamentos')
    }
  }

  /**
   * Atualizar agendamento de backup
   */
  async updateBackupSchedule(scheduleId: string, schedule: Partial<BackupSchedule>): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/schedules/${scheduleId}`, schedule)
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar agendamento')
    }
  }

  /**
   * Deletar agendamento de backup
   */
  async deleteBackupSchedule(scheduleId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/schedules/${scheduleId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao deletar agendamento')
    }
  }

  /**
   * Pausar/retomar agendamento
   */
  async toggleSchedule(scheduleId: string, action: 'pause' | 'resume'): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/schedules/${scheduleId}/${action}`)
    } catch (error) {
      throw this.handleError(error, `Erro ao ${action === 'pause' ? 'pausar' : 'retomar'} agendamento`)
    }
  }

  /**
   * Exportar configurações de backup
   */
  async exportBackupSettings(): Promise<{
    settings: BackupSettings
    schedules: BackupSchedule[]
    exportedAt: string
    version: string
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/export`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao exportar configurações')
    }
  }

  /**
   * Importar configurações de backup
   */
  async importBackupSettings(data: {
    settings: BackupSettings
    schedules?: BackupSchedule[]
    overwrite?: boolean
  }): Promise<{
    imported: {
      settings: boolean
      schedules: number
    }
    warnings: string[]
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/import`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao importar configurações')
    }
  }

  /**
   * Buscar provedores de armazenamento disponíveis
   */
  async getStorageProviders(): Promise<Array<{
    id: string
    name: string
    type: 'local' | 'aws' | 'gcp' | 'azure' | 'dropbox' | 'ftp' | 'sftp'
    description: string
    features: string[]
    configFields: Array<{
      name: string
      label: string
      type: 'text' | 'password' | 'number' | 'select'
      required: boolean
      options?: Array<{ value: string; label: string }>
      placeholder?: string
      description?: string
    }>
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/storage-providers`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar provedores de armazenamento')
    }
  }

  /**
   * Buscar logs de backup
   */
  async getBackupLogs(params?: {
    jobId?: string
    backupId?: string
    level?: 'debug' | 'info' | 'warn' | 'error'
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }): Promise<{
    logs: Array<{
      id: string
      jobId?: string
      backupId?: string
      level: 'debug' | 'info' | 'warn' | 'error'
      message: string
      details?: any
      timestamp: string
    }>
    total: number
    hasMore: boolean
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/logs`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar logs de backup')
    }
  }

  /**
   * Limpar logs de backup
   */
  async clearBackupLogs(options?: {
    olderThan?: string // ISO date
    level?: 'debug' | 'info' | 'warn' | 'error'
  }): Promise<{
    deletedLogs: number
  }> {
    try {
      const response = await api.delete(`${this.baseUrl}/logs`, { data: options })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao limpar logs')
    }
  }

  /**
   * Buscar métricas de performance
   */
  async getPerformanceMetrics(params?: {
    period?: '1h' | '24h' | '7d' | '30d'
    jobId?: string
  }): Promise<{
    averageSpeed: number // MB/s
    averageDuration: number // seconds
    successRate: number // percentage
    compressionRatio: number // percentage
    storageEfficiency: number // percentage
    timeline: Array<{
      timestamp: string
      speed: number
      duration: number
      size: number
      compressionRatio: number
    }>
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/metrics`, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar métricas de performance')
    }
  }

  /**
   * Executar diagnóstico do sistema de backup
   */
  async runDiagnostics(): Promise<{
    overall: 'healthy' | 'warning' | 'critical'
    checks: Array<{
      name: string
      status: 'pass' | 'warning' | 'fail'
      message: string
      details?: any
      recommendation?: string
    }>
    runAt: string
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/diagnostics`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Erro ao executar diagnóstico')
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

export const backupService = new BackupService()