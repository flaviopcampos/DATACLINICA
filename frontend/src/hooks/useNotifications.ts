import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { appointmentsService } from '../services/appointmentsService';
import {
  AppointmentNotification,
  NotificationSettings,
  NotificationFilters,
  UseNotificationsOptions,
  NotificationStats
} from '../types/appointments';

const QUERY_KEYS = {
  notifications: 'appointment-notifications',
  settings: 'notification-settings',
  stats: 'notification-stats'
} as const;

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    userId,
    clinicId,
    autoRefresh = true,
    refreshInterval = 30000, // 30 segundos
    enableRealTime = true,
    maxNotifications = 50
  } = options;

  const queryClient = useQueryClient();
  
  // Estados locais
  const [filters, setFilters] = useState<NotificationFilters>({
    status: ['pending', 'sent'],
    types: ['reminder', 'confirmation', 'cancellation'],
    priority: ['high', 'medium', 'low'],
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 dias
    }
  });
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Query para notificações
  const {
    data: notifications,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: [QUERY_KEYS.notifications, userId, clinicId, filters],
    queryFn: () => appointmentsService.getNotifications({
      userId,
      clinicId,
      ...filters,
      limit: maxNotifications
    }),
    enabled: !!userId || !!clinicId,
    staleTime: autoRefresh ? refreshInterval : 2 * 60 * 1000,
    refetchInterval: autoRefresh ? refreshInterval : false,
    gcTime: 5 * 60 * 1000
  });

  // Query para configurações de notificação
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError
  } = useQuery({
    queryKey: [QUERY_KEYS.settings, userId],
    queryFn: () => appointmentsService.getNotificationSettings(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000
  });

  // Query para estatísticas de notificações
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: [QUERY_KEYS.stats, userId, clinicId],
    queryFn: () => appointmentsService.getNotificationStats(userId, clinicId),
    enabled: !!userId || !!clinicId,
    staleTime: 5 * 60 * 1000
  });

  // Mutation para marcar notificação como lida
  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds: number[]) =>
      appointmentsService.markNotificationsAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.notifications] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.stats] 
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao marcar notificação como lida';
      toast.error(message);
    }
  });

  // Mutation para excluir notificação
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationIds: number[]) =>
      appointmentsService.deleteNotifications(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.notifications] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.stats] 
      });
      toast.success('Notificação(ões) excluída(s) com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao excluir notificação';
      toast.error(message);
    }
  });

  // Mutation para atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<NotificationSettings>) =>
      appointmentsService.updateNotificationSettings(userId, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.settings, userId] 
      });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao atualizar configurações';
      toast.error(message);
    }
  });

  // Mutation para enviar notificação manual
  const sendNotificationMutation = useMutation({
    mutationFn: (notificationData: Partial<AppointmentNotification>) =>
      appointmentsService.sendNotification(notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.notifications] 
      });
      toast.success('Notificação enviada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao enviar notificação';
      toast.error(message);
    }
  });

  // Atualizar contador de não lidas
  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  // Configurar WebSocket para notificações em tempo real (simulado)
  useEffect(() => {
    if (!enableRealTime || !userId) return;

    // Simular conexão WebSocket
    const connectWebSocket = () => {
      setIsConnected(true);
      
      // Simular recebimento de notificações
      const interval = setInterval(() => {
        // Invalidar queries para buscar novas notificações
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.notifications] 
        });
      }, refreshInterval);

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, [enableRealTime, userId, refreshInterval, queryClient]);

  // Funções de ação
  const markAsRead = useCallback((notificationIds: number[]) => {
    markAsReadMutation.mutate(notificationIds);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    if (!notifications) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  }, [notifications, markAsReadMutation]);

  const deleteNotification = useCallback((notificationIds: number[]) => {
    deleteNotificationMutation.mutate(notificationIds);
  }, [deleteNotificationMutation]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    updateSettingsMutation.mutate(newSettings);
  }, [updateSettingsMutation]);

  const sendNotification = useCallback((notificationData: Partial<AppointmentNotification>) => {
    sendNotificationMutation.mutate(notificationData);
  }, [sendNotificationMutation]);

  // Funções de filtro
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: ['pending', 'sent'],
      types: ['reminder', 'confirmation', 'cancellation'],
      priority: ['high', 'medium', 'low'],
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });
  }, []);

  // Funções utilitárias
  const getNotificationsByType = useCallback((type: string): AppointmentNotification[] => {
    if (!notifications) return [];
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: string): AppointmentNotification[] => {
    if (!notifications) return [];
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  const getUnreadNotifications = useCallback((): AppointmentNotification[] => {
    if (!notifications) return [];
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const getRecentNotifications = useCallback((hours: number = 24): AppointmentNotification[] => {
    if (!notifications) return [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return notifications.filter(n => new Date(n.createdAt) > cutoff);
  }, [notifications]);

  const hasUnreadNotifications = useCallback((): boolean => {
    return unreadCount > 0;
  }, [unreadCount]);

  // Função para criar notificação de lembrete
  const createReminder = useCallback(async (
    appointmentId: number,
    reminderTime: string,
    message?: string
  ) => {
    try {
      await appointmentsService.createAppointmentReminder(
        appointmentId,
        reminderTime,
        message
      );
      
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.notifications] 
      });
      
      toast.success('Lembrete criado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erro ao criar lembrete';
      toast.error(message);
    }
  }, [queryClient]);

  // Função para cancelar lembrete
  const cancelReminder = useCallback(async (reminderId: number) => {
    try {
      await appointmentsService.cancelAppointmentReminder(reminderId);
      
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.notifications] 
      });
      
      toast.success('Lembrete cancelado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erro ao cancelar lembrete';
      toast.error(message);
    }
  }, [queryClient]);

  // Função para refresh manual
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.notifications] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.stats] 
    });
  }, [queryClient]);

  // Função para testar notificação
  const testNotification = useCallback((type: 'email' | 'sms' | 'push' = 'push') => {
    const testData: Partial<AppointmentNotification> = {
      type: 'test',
      title: 'Notificação de Teste',
      message: 'Esta é uma notificação de teste do sistema.',
      priority: 'low',
      userId,
      clinicId
    };
    
    sendNotification(testData);
  }, [userId, clinicId, sendNotification]);

  return {
    // Dados
    notifications: notifications || [],
    settings,
    stats,
    unreadCount,
    filters,
    
    // Estados de conexão
    isConnected,
    
    // Estados de loading
    isLoadingNotifications,
    isLoadingSettings,
    isLoadingStats,
    isLoading: isLoadingNotifications || isLoadingSettings || isLoadingStats,
    
    // Estados de mutation
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
    isSending: sendNotificationMutation.isPending,
    
    // Erros
    notificationsError,
    settingsError,
    error: notificationsError || settingsError,
    
    // Ações
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    sendNotification,
    createReminder,
    cancelReminder,
    testNotification,
    
    // Filtros
    updateFilters,
    clearFilters,
    
    // Utilitários
    getNotificationsByType,
    getNotificationsByPriority,
    getUnreadNotifications,
    getRecentNotifications,
    hasUnreadNotifications,
    
    // Ações de sistema
    refresh,
    refetchNotifications
  };
}

export default useNotifications;