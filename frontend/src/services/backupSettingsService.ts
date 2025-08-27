import { api } from './api';
import type {
  BackupSettings,
  AutomaticBackupSettings,
  StorageSettings,
  CloudCredentials,
  RetentionSettings,
  DataSelectionSettings,
  BackupNotificationSettings,
  BackupMonitoringSettings,
  BackupJob,
  BackupJobStats,
  BackupHistory,
  BackupRestore,
  StorageUsage,
  BackupSettingsUpdateRequest,
  BackupSettingsResponse,
  BackupJobResponse,
  BackupHistoryResponse,
  BackupRestoreResponse,
  StorageUsageResponse
} from '@/types/backupSettings';

class BackupSettingsService {
  private baseUrl = '/api/backup';

  // Obter todas as configurações de backup
  async getSettings(): Promise<BackupSettings> {
    try {
      const response = await api.get<BackupSettingsResponse>(`${this.baseUrl}/settings`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de backup');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de backup:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de backup
  async updateSettings(data: BackupSettingsUpdateRequest): Promise<BackupSettings> {
    try {
      const response = await api.put<BackupSettingsResponse>(`${this.baseUrl}/settings`, data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de backup');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de backup:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de backup automático
  async getAutomaticBackupSettings(): Promise<AutomaticBackupSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: AutomaticBackupSettings; message?: string }>(
        `${this.baseUrl}/automatic`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de backup automático');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de backup automático:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de backup automático
  async updateAutomaticBackupSettings(data: Partial<AutomaticBackupSettings>): Promise<AutomaticBackupSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: AutomaticBackupSettings; message?: string }>(
        `${this.baseUrl}/automatic`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de backup automático');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de backup automático:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de armazenamento
  async getStorageSettings(): Promise<StorageSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: StorageSettings; message?: string }>(
        `${this.baseUrl}/storage`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de armazenamento');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de armazenamento:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de armazenamento
  async updateStorageSettings(data: Partial<StorageSettings>): Promise<StorageSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: StorageSettings; message?: string }>(
        `${this.baseUrl}/storage`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de armazenamento');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de armazenamento:', error);
      throw this.handleError(error);
    }
  }

  // Testar conexão de armazenamento
  async testStorageConnection(provider: string, credentials: CloudCredentials): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post<{
        success: boolean;
        data?: { success: boolean; message?: string };
        message?: string;
      }>(`${this.baseUrl}/storage/test`, { provider, credentials });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao testar conexão de armazenamento');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao testar conexão de armazenamento:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de retenção
  async getRetentionSettings(): Promise<RetentionSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: RetentionSettings; message?: string }>(
        `${this.baseUrl}/retention`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de retenção');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de retenção:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de retenção
  async updateRetentionSettings(data: Partial<RetentionSettings>): Promise<RetentionSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: RetentionSettings; message?: string }>(
        `${this.baseUrl}/retention`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de retenção');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de retenção:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de seleção de dados
  async getDataSelectionSettings(): Promise<DataSelectionSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: DataSelectionSettings; message?: string }>(
        `${this.baseUrl}/data-selection`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de seleção de dados');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de seleção de dados:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de seleção de dados
  async updateDataSelectionSettings(data: Partial<DataSelectionSettings>): Promise<DataSelectionSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: DataSelectionSettings; message?: string }>(
        `${this.baseUrl}/data-selection`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de seleção de dados');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de seleção de dados:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de notificação de backup
  async getNotificationSettings(): Promise<BackupNotificationSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: BackupNotificationSettings; message?: string }>(
        `${this.baseUrl}/notifications`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de notificação');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de notificação:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de notificação de backup
  async updateNotificationSettings(data: Partial<BackupNotificationSettings>): Promise<BackupNotificationSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: BackupNotificationSettings; message?: string }>(
        `${this.baseUrl}/notifications`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de notificação');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de monitoramento de backup
  async getMonitoringSettings(): Promise<BackupMonitoringSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: BackupMonitoringSettings; message?: string }>(
        `${this.baseUrl}/monitoring`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de monitoramento');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de monitoramento:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de monitoramento de backup
  async updateMonitoringSettings(data: Partial<BackupMonitoringSettings>): Promise<BackupMonitoringSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: BackupMonitoringSettings; message?: string }>(
        `${this.baseUrl}/monitoring`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de monitoramento');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de monitoramento:', error);
      throw this.handleError(error);
    }
  }

  // Iniciar backup manual
  async startManualBackup(options?: {
    includeDatabase?: boolean;
    includeFiles?: boolean;
    includeConfigurations?: boolean;
    includeLogs?: boolean;
    includeUserUploads?: boolean;
    customPaths?: string[];
    description?: string;
  }): Promise<BackupJob> {
    try {
      const response = await api.post<BackupJobResponse>(`${this.baseUrl}/start`, options || {});
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao iniciar backup manual');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao iniciar backup manual:', error);
      throw this.handleError(error);
    }
  }

  // Obter status do backup
  async getBackupStatus(jobId: string): Promise<BackupJob> {
    try {
      const response = await api.get<BackupJobResponse>(`${this.baseUrl}/jobs/${jobId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao obter status do backup');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter status do backup:', error);
      throw this.handleError(error);
    }
  }

  // Cancelar backup
  async cancelBackup(jobId: string): Promise<void> {
    try {
      const response = await api.post<{ success: boolean; message?: string }>(
        `${this.baseUrl}/jobs/${jobId}/cancel`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao cancelar backup');
      }
    } catch (error) {
      console.error('Erro ao cancelar backup:', error);
      throw this.handleError(error);
    }
  }

  // Obter histórico de backups
  async getBackupHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ backups: BackupHistory[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.get<BackupHistoryResponse>(`${this.baseUrl}/history`, { params });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar histórico de backups');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar histórico de backups:', error);
      throw this.handleError(error);
    }
  }

  // Excluir backup
  async deleteBackup(backupId: string): Promise<void> {
    try {
      const response = await api.delete<{ success: boolean; message?: string }>(
        `${this.baseUrl}/history/${backupId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir backup');
      }
    } catch (error) {
      console.error('Erro ao excluir backup:', error);
      throw this.handleError(error);
    }
  }

  // Restaurar backup
  async restoreBackup(backupId: string, options?: {
    restoreDatabase?: boolean;
    restoreFiles?: boolean;
    restoreConfigurations?: boolean;
    restoreLogs?: boolean;
    restoreUserUploads?: boolean;
    customPaths?: string[];
    targetLocation?: string;
  }): Promise<BackupRestore> {
    try {
      const response = await api.post<BackupRestoreResponse>(
        `${this.baseUrl}/restore/${backupId}`,
        options || {}
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao restaurar backup');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw this.handleError(error);
    }
  }

  // Obter status da restauração
  async getRestoreStatus(restoreId: string): Promise<BackupRestore> {
    try {
      const response = await api.get<BackupRestoreResponse>(`${this.baseUrl}/restore/status/${restoreId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao obter status da restauração');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter status da restauração:', error);
      throw this.handleError(error);
    }
  }

  // Cancelar restauração
  async cancelRestore(restoreId: string): Promise<void> {
    try {
      const response = await api.post<{ success: boolean; message?: string }>(
        `${this.baseUrl}/restore/${restoreId}/cancel`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao cancelar restauração');
      }
    } catch (error) {
      console.error('Erro ao cancelar restauração:', error);
      throw this.handleError(error);
    }
  }

  // Obter uso de armazenamento
  async getStorageUsage(): Promise<StorageUsage> {
    try {
      const response = await api.get<StorageUsageResponse>(`${this.baseUrl}/storage/usage`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar uso de armazenamento');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar uso de armazenamento:', error);
      throw this.handleError(error);
    }
  }

  // Limpar backups antigos
  async cleanupOldBackups(options?: {
    olderThanDays?: number;
    keepMinimum?: number;
    dryRun?: boolean;
  }): Promise<{ deletedCount: number; freedSpace: number; deletedBackups: string[] }> {
    try {
      const response = await api.post<{
        success: boolean;
        data?: { deletedCount: number; freedSpace: number; deletedBackups: string[] };
        message?: string;
      }>(`${this.baseUrl}/cleanup`, options || {});
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao limpar backups antigos');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
      throw this.handleError(error);
    }
  }

  // Verificar integridade do backup
  async verifyBackupIntegrity(backupId: string): Promise<{ valid: boolean; issues: string[]; details: Record<string, any> }> {
    try {
      const response = await api.post<{
        success: boolean;
        data?: { valid: boolean; issues: string[]; details: Record<string, any> };
        message?: string;
      }>(`${this.baseUrl}/verify/${backupId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao verificar integridade do backup');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao verificar integridade do backup:', error);
      throw this.handleError(error);
    }
  }

  // Exportar configurações de backup
  async exportBackupSettings(): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/settings/export`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar configurações de backup:', error);
      throw this.handleError(error);
    }
  }

  // Importar configurações de backup
  async importBackupSettings(file: File): Promise<BackupSettings> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<BackupSettingsResponse>(
        `${this.baseUrl}/settings/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao importar configurações de backup');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao importar configurações de backup:', error);
      throw this.handleError(error);
    }
  }

  // Restaurar configurações padrão de backup
  async resetBackupSettings(): Promise<BackupSettings> {
    try {
      const response = await api.post<BackupSettingsResponse>(`${this.baseUrl}/settings/reset`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao restaurar configurações de backup');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao restaurar configurações de backup:', error);
      throw this.handleError(error);
    }
  }

  // Testar configurações de backup
  async testBackupSettings(): Promise<{ success: boolean; issues: string[]; warnings: string[] }> {
    try {
      const response = await api.post<{
        success: boolean;
        data?: { success: boolean; issues: string[]; warnings: string[] };
        message?: string;
      }>(`${this.baseUrl}/settings/test`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao testar configurações de backup');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao testar configurações de backup:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Erro interno do servidor');
  }
}

export const backupSettingsService = new BackupSettingsService();