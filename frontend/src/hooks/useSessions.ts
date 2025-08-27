'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService';
import type {
  Session,
  SessionFilters,
  SessionSettings,
  SessionAlert,
  SessionStats,
  UpdateSessionSettingsRequest,
  TerminateSessionRequest
} from '@/types/sessions';

interface UseSessionsOptions {
  filters?: SessionFilters;
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useSessions(options: UseSessionsOptions = {}) {
  const {
    filters,
    page = 1,
    limit = 10,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const queryClient = useQueryClient();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  // Get sessions
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions
  } = useQuery({
    queryKey: ['sessions', filters, page, limit],
    queryFn: () => sessionService.getSessions(filters, page, limit),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000 // 10 seconds
  });

  // Get current session
  const {
    data: currentSession,
    isLoading: isLoadingCurrentSession
  } = useQuery({
    queryKey: ['sessions', 'current'],
    queryFn: () => sessionService.getCurrentSession(),
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Get session settings
  const {
    data: sessionSettings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ['sessions', 'settings'],
    queryFn: () => sessionService.getSessionSettings()
  });

  // Get session stats
  const {
    data: sessionStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['sessions', 'stats'],
    queryFn: () => sessionService.getSessionStats(),
    refetchInterval: autoRefresh ? refreshInterval * 2 : false // Less frequent updates
  });

  // Get session alerts
  const {
    data: sessionAlerts,
    isLoading: isLoadingAlerts
  } = useQuery({
    queryKey: ['sessions', 'alerts'],
    queryFn: () => sessionService.getSessionAlerts(),
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Terminate session mutation
  const terminateSessionMutation = useMutation({
    mutationFn: (data: TerminateSessionRequest) => sessionService.terminateSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Sessão encerrada com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao encerrar sessão');
    }
  });

  // Terminate all other sessions mutation
  const terminateAllOtherSessionsMutation = useMutation({
    mutationFn: () => sessionService.terminateAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Todas as outras sessões foram encerradas');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao encerrar sessões');
    }
  });

  // Update session settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: UpdateSessionSettingsRequest) => sessionService.updateSessionSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'settings'] });
      toast.success('Configurações atualizadas com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar configurações');
    }
  });

  // Trust device mutation
  const trustDeviceMutation = useMutation({
    mutationFn: (sessionId: string) => sessionService.trustDevice(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Dispositivo marcado como confiável');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao marcar dispositivo como confiável');
    }
  });

  // Untrust device mutation
  const untrustDeviceMutation = useMutation({
    mutationFn: (sessionId: string) => sessionService.untrustDevice(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Dispositivo removido da lista de confiáveis');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover confiança do dispositivo');
    }
  });

  // Report suspicious activity mutation
  const reportSuspiciousMutation = useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason: string }) => 
      sessionService.reportSuspiciousActivity(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Atividade suspeita reportada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao reportar atividade suspeita');
    }
  });

  // Mark alert as read mutation
  const markAlertAsReadMutation = useMutation({
    mutationFn: (alertId: string) => sessionService.markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'alerts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao marcar alerta como lido');
    }
  });

  // Helper functions
  const terminateSession = useCallback((sessionId: string, reason?: string) => {
    terminateSessionMutation.mutate({ session_id: sessionId, reason });
  }, [terminateSessionMutation]);

  const terminateAllOtherSessions = useCallback(() => {
    terminateAllOtherSessionsMutation.mutate();
  }, [terminateAllOtherSessionsMutation]);

  const updateSettings = useCallback((settings: UpdateSessionSettingsRequest) => {
    updateSettingsMutation.mutate(settings);
  }, [updateSettingsMutation]);

  const trustDevice = useCallback((sessionId: string) => {
    trustDeviceMutation.mutate(sessionId);
  }, [trustDeviceMutation]);

  const untrustDevice = useCallback((sessionId: string) => {
    untrustDeviceMutation.mutate(sessionId);
  }, [untrustDeviceMutation]);

  const reportSuspicious = useCallback((sessionId: string, reason: string) => {
    reportSuspiciousMutation.mutate({ sessionId, reason });
  }, [reportSuspiciousMutation]);

  const markAlertAsRead = useCallback((alertId: string) => {
    markAlertAsReadMutation.mutate(alertId);
  }, [markAlertAsReadMutation]);

  const toggleSessionSelection = useCallback((sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  }, []);

  const selectAllSessions = useCallback(() => {
    if (sessionsData?.sessions) {
      setSelectedSessions(sessionsData.sessions.map(s => s.id));
    }
  }, [sessionsData]);

  const clearSelection = useCallback(() => {
    setSelectedSessions([]);
  }, []);

  const terminateSelectedSessions = useCallback((reason?: string) => {
    selectedSessions.forEach(sessionId => {
      terminateSession(sessionId, reason);
    });
    clearSelection();
  }, [selectedSessions, terminateSession, clearSelection]);

  const refresh = useCallback(() => {
    refetchSessions();
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
  }, [refetchSessions, queryClient]);

  return {
    // Data
    data: sessionsData?.sessions || [],
    sessions: sessionsData?.sessions || [],
    totalSessions: sessionsData?.total || 0,
    currentPage: sessionsData?.current_page || 1,
    totalPages: sessionsData?.total_pages || 1,
    currentSession,
    sessionSettings,
    sessionStats,
    sessionAlerts: sessionAlerts?.alerts || [],
    unreadAlertsCount: sessionAlerts?.unread_count || 0,
    selectedSessions,

    // Loading states
    isLoading: isLoadingSessions,
    isLoadingCurrentSession,
    isLoadingSettings,
    isLoadingStats,
    isLoadingAlerts,
    isTerminating: terminateSessionMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,

    // Error states
    error: sessionsError,

    // Actions
    terminateSession,
    terminateAllOtherSessions,
    updateSettings,
    trustDevice,
    untrustDevice,
    reportSuspicious,
    markAlertAsRead,
    toggleSessionSelection,
    selectAllSessions,
    clearSelection,
    terminateSelectedSessions,
    refresh
  };
}

export default useSessions;