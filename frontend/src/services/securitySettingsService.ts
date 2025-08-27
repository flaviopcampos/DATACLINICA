import { api } from './api';
import type {
  SecuritySettings,
  AuthenticationSettings,
  PasswordPolicy,
  LoginProtection,
  SessionSettings,
  MonitoringSettings,
  SecurityAlerts,
  ActivityTracking,
  AnomalyDetection,
  AuditSettings,
  AccessControlSettings,
  ResourcePermission,
  AccessCondition,
  TrustedDevice,
  SecurityEvent,
  SecurityReport,
  SecurityAuditLog,
  SecuritySettingsUpdateRequest,
  SecuritySettingsResponse
} from '@/types/securitySettings';

class SecuritySettingsService {
  private baseUrl = '/api/security';

  // Obter todas as configurações de segurança
  async getSettings(): Promise<SecuritySettings> {
    try {
      const response = await api.get<SecuritySettingsResponse>(`${this.baseUrl}/settings`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de segurança');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de segurança:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de segurança
  async updateSettings(data: SecuritySettingsUpdateRequest): Promise<SecuritySettings> {
    try {
      const response = await api.put<SecuritySettingsResponse>(`${this.baseUrl}/settings`, data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de segurança');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de segurança:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de autenticação
  async getAuthenticationSettings(): Promise<AuthenticationSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: AuthenticationSettings; message?: string }>(
        `${this.baseUrl}/authentication`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de autenticação');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de autenticação:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de autenticação
  async updateAuthenticationSettings(data: Partial<AuthenticationSettings>): Promise<AuthenticationSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: AuthenticationSettings; message?: string }>(
        `${this.baseUrl}/authentication`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de autenticação');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de autenticação:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de sessão
  async getSessionSettings(): Promise<SessionSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: SessionSettings; message?: string }>(
        `${this.baseUrl}/sessions`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de sessão');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de sessão:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de sessão
  async updateSessionSettings(data: Partial<SessionSettings>): Promise<SessionSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: SessionSettings; message?: string }>(
        `${this.baseUrl}/sessions`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de sessão');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de sessão:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de monitoramento
  async getMonitoringSettings(): Promise<MonitoringSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: MonitoringSettings; message?: string }>(
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

  // Atualizar configurações de monitoramento
  async updateMonitoringSettings(data: Partial<MonitoringSettings>): Promise<MonitoringSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: MonitoringSettings; message?: string }>(
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

  // Obter configurações de auditoria
  async getAuditSettings(): Promise<AuditSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: AuditSettings; message?: string }>(
        `${this.baseUrl}/audit`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de auditoria');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de auditoria:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de auditoria
  async updateAuditSettings(data: Partial<AuditSettings>): Promise<AuditSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: AuditSettings; message?: string }>(
        `${this.baseUrl}/audit`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de auditoria');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de auditoria:', error);
      throw this.handleError(error);
    }
  }

  // Obter configurações de controle de acesso
  async getAccessControlSettings(): Promise<AccessControlSettings> {
    try {
      const response = await api.get<{ success: boolean; data?: AccessControlSettings; message?: string }>(
        `${this.baseUrl}/access-control`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar configurações de controle de acesso');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar configurações de controle de acesso:', error);
      throw this.handleError(error);
    }
  }

  // Atualizar configurações de controle de acesso
  async updateAccessControlSettings(data: Partial<AccessControlSettings>): Promise<AccessControlSettings> {
    try {
      const response = await api.put<{ success: boolean; data?: AccessControlSettings; message?: string }>(
        `${this.baseUrl}/access-control`,
        data
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao atualizar configurações de controle de acesso');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de controle de acesso:', error);
      throw this.handleError(error);
    }
  }

  // Obter dispositivos confiáveis
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    try {
      const response = await api.get<{ success: boolean; data?: TrustedDevice[]; message?: string }>(
        `${this.baseUrl}/trusted-devices`
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar dispositivos confiáveis');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar dispositivos confiáveis:', error);
      throw this.handleError(error);
    }
  }

  // Adicionar dispositivo confiável
  async addTrustedDevice(device: Omit<TrustedDevice, 'id' | 'addedAt'>): Promise<TrustedDevice> {
    try {
      const response = await api.post<{ success: boolean; data?: TrustedDevice; message?: string }>(
        `${this.baseUrl}/trusted-devices`,
        device
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao adicionar dispositivo confiável');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao adicionar dispositivo confiável:', error);
      throw this.handleError(error);
    }
  }

  // Remover dispositivo confiável
  async removeTrustedDevice(deviceId: string): Promise<void> {
    try {
      const response = await api.delete<{ success: boolean; message?: string }>(
        `${this.baseUrl}/trusted-devices/${deviceId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao remover dispositivo confiável');
      }
    } catch (error) {
      console.error('Erro ao remover dispositivo confiável:', error);
      throw this.handleError(error);
    }
  }

  // Obter eventos de segurança
  async getSecurityEvents(params?: {
    page?: number;
    limit?: number;
    type?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    resolved?: boolean;
  }): Promise<{ events: SecurityEvent[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.get<{
        success: boolean;
        data?: { events: SecurityEvent[]; total: number; page: number; limit: number };
        message?: string;
      }>(`${this.baseUrl}/events`, { params });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar eventos de segurança');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar eventos de segurança:', error);
      throw this.handleError(error);
    }
  }

  // Marcar evento como resolvido
  async resolveSecurityEvent(eventId: string, resolution?: string): Promise<void> {
    try {
      const response = await api.patch<{ success: boolean; message?: string }>(
        `${this.baseUrl}/events/${eventId}/resolve`,
        { resolution }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao resolver evento de segurança');
      }
    } catch (error) {
      console.error('Erro ao resolver evento de segurança:', error);
      throw this.handleError(error);
    }
  }

  // Obter logs de auditoria
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    resource?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
  }): Promise<{ logs: SecurityAuditLog[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.get<{
        success: boolean;
        data?: { logs: SecurityAuditLog[]; total: number; page: number; limit: number };
        message?: string;
      }>(`${this.baseUrl}/audit-logs`, { params });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar logs de auditoria');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      throw this.handleError(error);
    }
  }

  // Gerar relatório de segurança
  async generateSecurityReport(params: {
    type: 'summary' | 'detailed' | 'compliance';
    period: string;
    format?: 'pdf' | 'excel' | 'csv';
    includeCharts?: boolean;
    sections?: string[];
  }): Promise<SecurityReport> {
    try {
      const response = await api.post<{ success: boolean; data?: SecurityReport; message?: string }>(
        `${this.baseUrl}/reports/generate`,
        params
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao gerar relatório de segurança');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de segurança:', error);
      throw this.handleError(error);
    }
  }

  // Obter relatórios de segurança
  async getSecurityReports(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<{ reports: SecurityReport[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.get<{
        success: boolean;
        data?: { reports: SecurityReport[]; total: number; page: number; limit: number };
        message?: string;
      }>(`${this.baseUrl}/reports`, { params });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao carregar relatórios de segurança');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar relatórios de segurança:', error);
      throw this.handleError(error);
    }
  }

  // Baixar relatório de segurança
  async downloadSecurityReport(reportId: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar relatório de segurança:', error);
      throw this.handleError(error);
    }
  }

  // Testar configuração de 2FA
  async test2FA(method: string, config: Record<string, any>): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post<{
        success: boolean;
        data?: { success: boolean; message?: string };
        message?: string;
      }>(`${this.baseUrl}/2fa/test`, { method, config });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao testar 2FA');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao testar 2FA:', error);
      throw this.handleError(error);
    }
  }

  // Validar política de senha
  async validatePasswordPolicy(password: string): Promise<{ valid: boolean; violations: string[] }> {
    try {
      const response = await api.post<{
        success: boolean;
        data?: { valid: boolean; violations: string[] };
        message?: string;
      }>(`${this.baseUrl}/password-policy/validate`, { password });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao validar política de senha');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao validar política de senha:', error);
      throw this.handleError(error);
    }
  }

  // Forçar logout de todas as sessões
  async forceLogoutAllSessions(userId?: string): Promise<void> {
    try {
      const data = userId ? { userId } : {};
      const response = await api.post<{ success: boolean; message?: string }>(
        `${this.baseUrl}/sessions/force-logout`,
        data
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao forçar logout');
      }
    } catch (error) {
      console.error('Erro ao forçar logout:', error);
      throw this.handleError(error);
    }
  }

  // Bloquear usuário
  async blockUser(userId: string, reason: string, duration?: number): Promise<void> {
    try {
      const response = await api.post<{ success: boolean; message?: string }>(
        `${this.baseUrl}/users/${userId}/block`,
        { reason, duration }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao bloquear usuário');
      }
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      throw this.handleError(error);
    }
  }

  // Desbloquear usuário
  async unblockUser(userId: string): Promise<void> {
    try {
      const response = await api.post<{ success: boolean; message?: string }>(
        `${this.baseUrl}/users/${userId}/unblock`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao desbloquear usuário');
      }
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      throw this.handleError(error);
    }
  }

  // Restaurar configurações padrão de segurança
  async resetSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await api.post<SecuritySettingsResponse>(`${this.baseUrl}/settings/reset`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erro ao restaurar configurações de segurança');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao restaurar configurações de segurança:', error);
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

export const securitySettingsService = new SecuritySettingsService();