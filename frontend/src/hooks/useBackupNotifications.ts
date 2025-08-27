import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BackupNotification,
  RestoreNotification,
  NotificationSettings,
  NotificationFilters,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  UseNotificationsOptions,
  CreateNotificationData,
  UpdateNotificationData
} from '../types/notifications';
import { backupService } from '../services/backupService';

const QUERY_KEYS = {
  backupNotifications: 'backup-notifications',
  restoreNotifications: 'restore-notifications',
  notificationSettings: 'notification-settings',
  notificationStats: 'notification-stats'
} as const;

// Hook principal para notificações de backup
export function useBackupNotifications(options: UseNotificationsOptions = {}) {
  const {
    userId,
    clinicId,
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealTime = true,
    maxNotifications = 50,
    filters
  } = options;

  const queryClient = useQueryClient();
  
  // Estados locais
  const [localFilters, setLocalFilters] = useState<NotificationFilters>({
    types: [
      NotificationType.BACKUP_STARTED,
      NotificationType.BACKUP_COMPLETED,
      NotificationType.BACKUP_FAILED,
      NotificationType.BACKUP_SCHEDULED,
      NotificationType.BACKUP_VERIFICATION_FAILED,
      NotificationType.STORAGE_SPACE_LOW,
      NotificationType.BACKUP_CLEANUP
    ],
    statuses: [NotificationStatus.PENDING, NotificationStatus.SENT],
    priorities: [NotificationPriority.HIGH, NotificationPriority.MEDIUM, NotificationPriority.LOW],
    limit: maxNotifications,
    ...filters
  });
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Query para notificações de backup
  const {
    data: backupNotifications,
    isLoading: isLoadingBackupNotifications,
    error: backupNotificationsError,
    refetch: refetchBackupNotifications
  } = useQuery({
    queryKey: [QUERY_KEYS.backupNotifications, userId, clinicId, localFilters],
    queryFn: () => backupService.getBackupNotifications({
      userId,
      clinicId,
      ...localFilters
    }),
    enabled: !!userId || !!clinicId,
    staleTime: autoRefresh ? refreshInterval : 2 * 60 * 1000,
    refetchInterval: autoRefresh ? refreshInterval : false,
    gcTime: 5 * 60 * 1000
  });

  // Query para notificações de restauração
  const {
    data: restoreNotifications,
    isLoading: isLoadingRestoreNotifications,
    error: restoreNotificationsError,
    refetch: refetchRestoreNotifications
  } = useQuery({
    queryKey: [QUERY_KEYS.restoreNotifications, userId, clinicId, localFilters],
    queryFn: () => backupService.getRestoreNotifications({
      userId,
      clinicId,
      ...localFilters,
      types: [
        NotificationType.RESTORE_STARTED,
        NotificationType.RESTORE_COMPLETED,
        NotificationType.RESTORE_FAILED
      ]
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
    queryKey: [QUERY_KEYS.notificationSettings, userId],
    queryFn: () => backupService.getNotificationSettings(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000
  });

  // Query para estatísticas de notificações
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: [QUERY_KEYS.notificationStats, userId, clinicId],
    queryFn: () => backupService.getNotificationStats(userId, clinicId),
    enabled: !!userId || !!clinicId,
    staleTime: 5 * 60 * 1000
  });

  // Mutation para marcar notificação como lida
  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds: number[]) =>
      backupService.markNotificationsAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.backupNotifications] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.restoreNotifications] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.notificationStats] 
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
      backupService.deleteNotifications(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.backupNotifications] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.restoreNotifications] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.notificationStats] 
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
      backupService.updateNotificationSettings(userId!, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.notificationSettings, userId] 
      });
      toast.success('Configurações de notificação atualizadas com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao atualizar configurações';
      toast.error(message);
    }
  });

  // Mutation para criar notificação manual
  const createNotificationMutation = useMutation({
    mutationFn: (notificationData: CreateNotificationData) =>
      backupService.createNotification(notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.backupNotifications] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.restoreNotifications] 
      });
      toast.success('Notificação criada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao criar notificação';
      toast.error(message);
    }
  });

  // Atualizar contador de não lidas
  useEffect(() => {
    const allNotifications = [
      ...(backupNotifications || []),
      ...(restoreNotifications || [])
    ];
    const unread = allNotifications.filter(n => n.status !== NotificationStatus.READ).length;
    setUnreadCount(unread);
  }, [backupNotifications, restoreNotifications]);

  // Configurar WebSocket para notificações em tempo real
  useEffect(() => {
    if (!enableRealTime || !userId) return;

    // Simular conexão WebSocket para notificações de backup
    const connectWebSocket = () => {
      setIsConnected(true);
      
      // Simular recebimento de notificações
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.backupNotifications] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.restoreNotifications] 
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
    const allNotifications = [
      ...(backupNotifications || []),
      ...(restoreNotifications || [])
    ];
    const unreadIds = allNotifications
      .filter(n => n.status !== NotificationStatus.READ)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  }, [backupNotifications, restoreNotifications, markAsReadMutation]);

  const deleteNotification = useCallback((notificationIds: number[]) => {
    deleteNotificationMutation.mutate(notificationIds);
  }, [deleteNotificationMutation]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    updateSettingsMutation.mutate(newSettings);
  }, [updateSettingsMutation]);

  const createNotification = useCallback((notificationData: CreateNotificationData) => {
    createNotificationMutation.mutate(notificationData);
  }, [createNotificationMutation]);

  // Funções de filtro
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setLocalFilters({
      types: [
        NotificationType.BACKUP_STARTED,
        NotificationType.BACKUP_COMPLETED,
        NotificationType.BACKUP_FAILED,
        NotificationType.BACKUP_SCHEDULED,
        NotificationType.BACKUP_VERIFICATION_FAILED,
        NotificationType.STORAGE_SPACE_LOW,
        NotificationType.BACKUP_CLEANUP
      ],
      statuses: [NotificationStatus.PENDING, NotificationStatus.SENT],
      priorities: [NotificationPriority.HIGH, NotificationPriority.MEDIUM, NotificationPriority.LOW],
      limit: maxNotifications
    });
  }, [maxNotifications]);

  // Funções utilitárias
  const getNotificationsByType = useCallback((type: NotificationType) => {
    const allNotifications = [
      ...(backupNotifications || []),
      ...(restoreNotifications || [])
    ];
    return allNotifications.filter(n => n.type === type);
  }, [backupNotifications, restoreNotifications]);

  const getNotificationsByPriority = useCallback((priority: NotificationPriority) => {
    const allNotifications = [
      ...(backupNotifications || []),
      ...(restoreNotifications || [])
    ];
    return allNotifications.filter(n => n.priority === priority);
  }, [backupNotifications, restoreNotifications]);

  const getUnreadNotifications = useCallback(() => {
    const allNotifications = [
      ...(backupNotifications || []),
      ...(restoreNotifications || [])
    ];
    return allNotifications.filter(n => n.status !== NotificationStatus.READ);
  }, [backupNotifications, restoreNotifications]);

  const getRecentNotifications = useCallback((hours: number = 24) => {
    const allNotifications = [
      ...(backupNotifications || []),
      ...(restoreNotifications || [])
    ];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return allNotifications.filter(n => new Date(n.createdAt) > cutoff);
  }, [backupNotifications, restoreNotifications]);

  const hasUnreadNotifications = useCallback((): boolean => {
    return unreadCount > 0;
  }, [unreadCount]);

  // Funções específicas de backup
  const notifyBackupStarted = useCallback((backupId: string, jobId?: string) => {
    const notification: CreateNotificationData = {
      title: 'Backup Iniciado',
      message: `Backup ${backupId} foi iniciado com sucesso.`,
      type: NotificationType.BACKUP_STARTED,
      priority: NotificationPriority.MEDIUM,
      userId,
      clinicId,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      metadata: { backupId, jobId }
    };
    createNotification(notification);
  }, [userId, clinicId, createNotification]);

  const notifyBackupCompleted = useCallback((backupId: string, size: number, duration: number) => {
    const notification: CreateNotificationData = {
      title: 'Backup Concluído',
      message: `Backup ${backupId} foi concluído com sucesso. Tamanho: ${(size / 1024 / 1024).toFixed(2)} MB, Duração: ${Math.round(duration / 60)} min.`,
      type: NotificationType.BACKUP_COMPLETED,
      priority: NotificationPriority.LOW,
      userId,
      clinicId,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      metadata: { backupId, size, duration }
    };
    createNotification(notification);
  }, [userId, clinicId, createNotification]);

  const notifyBackupFailed = useCallback((backupId: string, error: string) => {
    const notification: CreateNotificationData = {
      title: 'Falha no Backup',
      message: `Backup ${backupId} falhou: ${error}`,
      type: NotificationType.BACKUP_FAILED,
      priority: NotificationPriority.HIGH,
      userId,
      clinicId,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
      metadata: { backupId, error }
    };
    createNotification(notification);
  }, [userId, clinicId, createNotification]);

  // Funções específicas de restauração
  const notifyRestoreStarted = useCallback((restoreId: string, backupId: string) => {
    const notification: CreateNotificationData = {
      title: 'Restauração Iniciada',
      message: `Restauração ${restoreId} do backup ${backupId} foi iniciada.`,
      type: NotificationType.RESTORE_STARTED,
      priority: NotificationPriority.MEDIUM,
      userId,
      clinicId,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      metadata: { restoreId, backupId }
    };
    createNotification(notification);
  }, [userId, clinicId, createNotification]);

  const notifyRestoreCompleted = useCallback((restoreId: string, itemsRestored: number) => {
    const notification: CreateNotificationData = {
      title: 'Restauração Concluída',
      message: `Restauração ${restoreId} foi concluída com sucesso. ${itemsRestored} itens restaurados.`,
      type: NotificationType.RESTORE_COMPLETED,
      priority: NotificationPriority.LOW,
      userId,
      clinicId,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      metadata: { restoreId, itemsRestored }
    };
    createNotification(notification);
  }, [userId, clinicId, createNotification]);

  const notifyRestoreFailed = useCallback((restoreId: string, error: string) => {
    const notification: CreateNotificationData = {
      title: 'Falha na Restauração',
      message: `Restauração ${restoreId} falhou: ${error}`,
      type: NotificationType.RESTORE_FAILED,
      priority: NotificationPriority.HIGH,
      userId,
      clinicId,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
      metadata: { restoreId, error }
    };
    createNotification(notification);
  }, [userId, clinicId, createNotification]);

  // Função para refresh manual
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.backupNotifications] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.restoreNotifications] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.notificationStats] 
    });
  }, [queryClient]);

  // Combinar todas as notificações
  const allNotifications = [
    ...(backupNotifications || []),
    ...(restoreNotifications || [])
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    // Dados
    notifications: allNotifications,
    backupNotifications: backupNotifications || [],
    restoreNotifications: restoreNotifications || [],
    settings,
    stats,
    unreadCount,
    filters: localFilters,
    
    // Estados de conexão
    isConnected,
    
    // Estados de loading
    isLoadingBackupNotifications,
    isLoadingRestoreNotifications,
    isLoadingSettings,
    isLoadingStats,
    isLoading: isLoadingBackupNotifications || isLoadingRestoreNotifications || isLoadingSettings || isLoadingStats,
    
    // Estados de mutation
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
    isCreating: createNotificationMutation.isPending,
    
    // Erros
    backupNotificationsError,
    restoreNotificationsError,
    settingsError,
    error: backupNotificationsError || restoreNotificationsError || settingsError,
    
    // Ações
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    createNotification,
    
    // Filtros
    updateFilters,
    clearFilters,
    
    // Utilitários
    getNotificationsByType,
    getNotificationsByPriority,
    getUnreadNotifications,
    getRecentNotifications,
    hasUnreadNotifications,
    
    // Funções específicas de backup
    notifyBackupStarted,
    notifyBackupCompleted,
    notifyBackupFailed,
    
    // Funções específicas de restauração
    notifyRestoreStarted,
    notifyRestoreCompleted,
    notifyRestoreFailed,
    
    // Ações de sistema
    refresh,
    refetchBackupNotifications,
    refetchRestoreNotifications
  };
}

export default useBackupNotifications;