import { api } from './api';
import type {
  Session,
  SessionActivity,
  SessionSettings,
  SessionAlert,
  SessionFilters,
  SessionStats,
  CreateSessionRequest,
  UpdateSessionSettingsRequest,
  TerminateSessionRequest,
  SessionsResponse,
  SessionActivitiesResponse,
  SessionAlertsResponse
} from '@/types/sessions';

class SessionService {
  private baseUrl = '/sessions';

  // Session Management
  async getSessions(filters?: SessionFilters, page = 1, limit = 10): Promise<SessionsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (filters) {
      if (filters.status?.length) {
        params.append('status', filters.status.join(','));
      }
      if (filters.device_type?.length) {
        params.append('device_type', filters.device_type.join(','));
      }
      if (filters.location) {
        params.append('location', filters.location);
      }
      if (filters.date_range) {
        params.append('start_date', filters.date_range.start);
        params.append('end_date', filters.date_range.end);
      }
      if (filters.is_trusted !== undefined) {
        params.append('is_trusted', filters.is_trusted.toString());
      }
      if (filters.security_level?.length) {
        params.append('security_level', filters.security_level.join(','));
      }
    }

    const response = await api.get(`${this.baseUrl}?${params}`);
    return response.data;
  }

  async getSession(sessionId: string): Promise<Session> {
    const response = await api.get(`${this.baseUrl}/${sessionId}`);
    return response.data;
  }

  async getCurrentSession(): Promise<Session> {
    const response = await api.get(`${this.baseUrl}/current`);
    return response.data;
  }

  async createSession(data: CreateSessionRequest): Promise<Session> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async terminateSession(data: TerminateSessionRequest): Promise<void> {
    await api.delete(`${this.baseUrl}/${data.session_id}`, {
      data: { reason: data.reason }
    });
  }

  async terminateAllOtherSessions(): Promise<void> {
    await api.delete(`${this.baseUrl}/others`);
  }

  async refreshSession(sessionId: string): Promise<Session> {
    const response = await api.post(`${this.baseUrl}/${sessionId}/refresh`);
    return response.data;
  }

  async extendSession(sessionId: string, minutes: number): Promise<Session> {
    const response = await api.post(`${this.baseUrl}/${sessionId}/extend`, {
      minutes
    });
    return response.data;
  }

  // Session Activities
  async getSessionActivities(
    sessionId: string,
    page = 1,
    limit = 20
  ): Promise<SessionActivitiesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await api.get(`${this.baseUrl}/${sessionId}/activities?${params}`);
    return response.data;
  }

  async getUserActivities(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<SessionActivitiesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await api.get(`/users/${userId}/activities?${params}`);
    return response.data;
  }

  async logActivity(sessionId: string, activity: Omit<SessionActivity, 'id' | 'timestamp'>): Promise<void> {
    await api.post(`${this.baseUrl}/${sessionId}/activities`, activity);
  }

  // Session Settings
  async getSessionSettings(): Promise<SessionSettings> {
    const response = await api.get(`${this.baseUrl}/settings`);
    return response.data;
  }

  async updateSessionSettings(data: UpdateSessionSettingsRequest): Promise<SessionSettings> {
    const response = await api.put(`${this.baseUrl}/settings`, data);
    return response.data;
  }

  async resetSessionSettings(): Promise<SessionSettings> {
    const response = await api.post(`${this.baseUrl}/settings/reset`);
    return response.data;
  }

  // Session Alerts
  async getSessionAlerts(page = 1, limit = 10): Promise<SessionAlertsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await api.get(`${this.baseUrl}/alerts?${params}`);
    return response.data;
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await api.patch(`${this.baseUrl}/alerts/${alertId}/read`);
  }

  async markAllAlertsAsRead(): Promise<void> {
    await api.patch(`${this.baseUrl}/alerts/read-all`);
  }

  async dismissAlert(alertId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/alerts/${alertId}`);
  }

  // Session Statistics
  async getSessionStats(): Promise<SessionStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async getSessionStatsByDateRange(startDate: string, endDate: string): Promise<SessionStats> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });

    const response = await api.get(`${this.baseUrl}/stats?${params}`);
    return response.data;
  }

  // Device Management
  async trustDevice(sessionId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${sessionId}/trust-device`);
  }

  async untrustDevice(sessionId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${sessionId}/trust-device`);
  }

  async getTrustedDevices(): Promise<Session[]> {
    const response = await api.get(`${this.baseUrl}/trusted-devices`);
    return response.data;
  }

  async removeTrustedDevice(deviceFingerprint: string): Promise<void> {
    await api.delete(`${this.baseUrl}/trusted-devices/${deviceFingerprint}`);
  }

  // Security Actions
  async reportSuspiciousActivity(sessionId: string, reason: string): Promise<void> {
    await api.post(`${this.baseUrl}/${sessionId}/report-suspicious`, {
      reason
    });
  }

  async blockSession(sessionId: string, reason: string): Promise<void> {
    await api.post(`${this.baseUrl}/${sessionId}/block`, {
      reason
    });
  }

  async unblockSession(sessionId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${sessionId}/block`);
  }

  async forceLogout(userId: string, reason: string): Promise<void> {
    await api.post(`/users/${userId}/force-logout`, {
      reason
    });
  }

  // Real-time Updates
  async subscribeToSessionUpdates(sessionId: string, callback: (session: Session) => void): Promise<() => void> {
    // Implementation would depend on WebSocket or SSE setup
    // For now, return a mock unsubscribe function
    return () => {};
  }

  async subscribeToActivityUpdates(sessionId: string, callback: (activity: SessionActivity) => void): Promise<() => void> {
    // Implementation would depend on WebSocket or SSE setup
    // For now, return a mock unsubscribe function
    return () => {};
  }

  // Utility Methods
  async validateSession(sessionToken: string): Promise<boolean> {
    try {
      const response = await api.post(`${this.baseUrl}/validate`, {
        session_token: sessionToken
      });
      return response.data.valid;
    } catch {
      return false;
    }
  }

  async getDeviceFingerprint(): Promise<string> {
    // Generate device fingerprint based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }

  async detectLocation(): Promise<Partial<LocationInfo>> {
    try {
      // This would typically use a geolocation service
      const response = await api.get('/location/detect');
      return response.data;
    } catch {
      return {};
    }
  }
}

export const sessionService = new SessionService();
export default sessionService;