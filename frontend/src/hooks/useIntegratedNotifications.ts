import { useCallback, useMemo } from 'react';
import { useNotifications } from './useNotifications';
import { useBackupNotifications } from './useBackupNotifications';
import {
  BaseNotification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationFilters
} from '@/types/notifications';
import { AppointmentNotification } from '@/types/appointments';

interface UseIntegratedNotificationsOptions {
  userId?: number;
  clinicId?: number;
  includeBackupNotifications?: boolean;
  includeAppointmentNotifications?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  maxNotifications?: number;
}

/**
 * Hook que integra todas as notificações do sistema:
 * - Notificações de agendamentos
 * - Notificações de backup e restauração
 * - Notificações do sistema
 */
export function useIntegratedNotifications(options: UseIntegratedNotificationsOptions = {}) {
  const {
    userId,
    clinicId,
    includeBackupNotifications = true,
    includeAppointmentNotifications = true,
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealTime = true,
    maxNotifications = 100
  } = options;

  // Hook de notificações de agendamentos
  const appointmentNotifications = useNotifications({
    userId,
    clinicId,
    autoRefresh: includeAppointmentNotifications ? autoRefresh : false,
    refreshInterval,
    enableRealTime: includeAppointmentNotifications ? enableRealTime : false,
    maxNotifications: Math.floor(maxNotifications / 2)
  });

  // Hook de notificações de backup
  const backupNotifications = useBackupNotifications({
    userId,
    clinicId,
    autoRefresh: includeBackupNotifications ? autoRefresh : false,
    refreshInterval,
    enableRealTime: includeBackupNotifications ? enableRealTime : false,
    maxNotifications: Math.floor(maxNotifications / 2)
  });

  // Combinar todas as notificações
  const allNotifications = useMemo(() => {
    const notifications: BaseNotification[] = [];

    // Adicionar notificações de agendamentos se habilitado
    if (includeAppointmentNotifications && appointmentNotifications.notifications) {
      const mappedAppointmentNotifications = appointmentNotifications.notifications.map(
        (notification: AppointmentNotification): BaseNotification => ({
          id: notification.id,
          title: getAppointmentNotificationTitle(notification),
          message: notification.message || '',
          type: mapAppointmentNotificationType(notification.type),
          priority: mapAppointmentNotificationPriority(notification.priority),
          status: notification.read ? 'delivered' : 'sent',
          userId: notification.appointment_id, // Usando appointment_id como referência
          clinicId,
          createdAt: notification.createdAt || new Date().toISOString(),
          updatedAt: notification.updatedAt || new Date().toISOString(),
          readAt: notification.read ? notification.updatedAt : undefined,
          scheduledFor: notification.scheduled_for,
          channels: ['in_app'], // Assumindo canal padrão
          metadata: {
            appointmentId: notification.appointment_id,
            patientId: notification.patient_id,
            doctorId: notification.doctor_id,
            originalType: notification.type
          }
        })
      );
      notifications.push(...mappedAppointmentNotifications);
    }

    // Adicionar notificações de backup se habilitado
    if (includeBackupNotifications && backupNotifications.notifications) {
      notifications.push(...backupNotifications.notifications);
    }

    // Ordenar por data de criação (mais recentes primeiro)
    return notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [
    includeAppointmentNotifications,
    includeBackupNotifications,
    appointmentNotifications.notifications,
    backupNotifications.notifications,
    clinicId
  ]);

  // Calcular estatísticas combinadas
  const combinedStats = useMemo(() => {
    const appointmentStats = appointmentNotifications.stats;
    const backupStats = backupNotifications.stats;

    return {
      total: allNotifications.length,
      unread: allNotifications.filter(n => n.status !== 'delivered').length,
      byType: {
        appointment: appointmentStats?.total || 0,
        backup: backupStats?.total || 0,
        restore: backupStats?.restore || 0,
        system: 0
      },
      byPriority: {
        high: allNotifications.filter(n => n.priority === 'high').length,
        medium: allNotifications.filter(n => n.priority === 'normal').length,
        low: allNotifications.filter(n => n.priority === 'low').length
      },
      recent24h: allNotifications.filter(n => {
        const createdAt = new Date(n.createdAt);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return createdAt > yesterday;
      }).length
    };
  }, [allNotifications, appointmentNotifications.stats, backupNotifications.stats]);

  // Estados de loading combinados
  const isLoading = useMemo(() => {
    return (
      (includeAppointmentNotifications && appointmentNotifications.isLoading) ||
      (includeBackupNotifications && backupNotifications.isLoading)
    );
  }, [
    includeAppointmentNotifications,
    includeBackupNotifications,
    appointmentNotifications.isLoading,
    backupNotifications.isLoading
  ]);

  // Erros combinados
  const error = useMemo(() => {
    const errors = [];
    if (includeAppointmentNotifications && appointmentNotifications.error) {
      errors.push(appointmentNotifications.error);
    }
    if (includeBackupNotifications && backupNotifications.error) {
      errors.push(backupNotifications.error);
    }
    return errors.length > 0 ? errors : null;
  }, [
    includeAppointmentNotifications,
    includeBackupNotifications,
    appointmentNotifications.error,
    backupNotifications.error
  ]);

  // Funções de ação combinadas
  const markAsRead = useCallback((notificationIds: number[]) => {
    // Separar IDs por tipo de notificação
    const appointmentIds: number[] = [];
    const backupIds: number[] = [];

    notificationIds.forEach(id => {
      const notification = allNotifications.find(n => n.id === id);
      if (notification?.metadata?.appointmentId) {
        appointmentIds.push(id);
      } else {
        backupIds.push(id);
      }
    });

    // Executar ações apropriadas
    if (appointmentIds.length > 0 && includeAppointmentNotifications) {
      appointmentNotifications.markAsRead(appointmentIds);
    }
    if (backupIds.length > 0 && includeBackupNotifications) {
      backupNotifications.markAsRead(backupIds);
    }
  }, [allNotifications, appointmentNotifications, backupNotifications, includeAppointmentNotifications, includeBackupNotifications]);

  const markAllAsRead = useCallback(() => {
    if (includeAppointmentNotifications) {
      appointmentNotifications.markAllAsRead();
    }
    if (includeBackupNotifications) {
      backupNotifications.markAllAsRead();
    }
  }, [appointmentNotifications, backupNotifications, includeAppointmentNotifications, includeBackupNotifications]);

  const deleteNotification = useCallback((notificationIds: number[]) => {
    // Separar IDs por tipo de notificação
    const appointmentIds: number[] = [];
    const backupIds: number[] = [];

    notificationIds.forEach(id => {
      const notification = allNotifications.find(n => n.id === id);
      if (notification?.metadata?.appointmentId) {
        appointmentIds.push(id);
      } else {
        backupIds.push(id);
      }
    });

    // Executar ações apropriadas
    if (appointmentIds.length > 0 && includeAppointmentNotifications) {
      appointmentNotifications.deleteNotification(appointmentIds);
    }
    if (backupIds.length > 0 && includeBackupNotifications) {
      backupNotifications.deleteNotification(backupIds);
    }
  }, [allNotifications, appointmentNotifications, backupNotifications, includeAppointmentNotifications, includeBackupNotifications]);

  // Função para refresh geral
  const refresh = useCallback(() => {
    if (includeAppointmentNotifications) {
      appointmentNotifications.refetchNotifications();
    }
    if (includeBackupNotifications) {
      backupNotifications.refresh();
    }
  }, [appointmentNotifications, backupNotifications, includeAppointmentNotifications, includeBackupNotifications]);

  // Funções de filtro
  const getNotificationsByType = useCallback((type: NotificationType) => {
    return allNotifications.filter(n => n.type === type);
  }, [allNotifications]);

  const getNotificationsByPriority = useCallback((priority: NotificationPriority) => {
    return allNotifications.filter(n => n.priority === priority);
  }, [allNotifications]);

  const getUnreadNotifications = useCallback(() => {
    return allNotifications.filter(n => n.status !== NotificationStatus.read);
  }, [allNotifications]);

  const getRecentNotifications = useCallback((hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return allNotifications.filter(n => new Date(n.createdAt) > cutoff);
  }, [allNotifications]);

  return {
    // Dados
    notifications: allNotifications,
    appointmentNotifications: includeAppointmentNotifications ? appointmentNotifications.notifications : [],
    backupNotifications: includeBackupNotifications ? backupNotifications.notifications : [],
    stats: combinedStats,
    unreadCount: combinedStats.unread,
    
    // Estados
    isLoading,
    error,
    isConnected: (
      (!includeAppointmentNotifications || appointmentNotifications.isConnected) &&
      (!includeBackupNotifications || backupNotifications.isConnected)
    ),
    
    // Ações
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    
    // Filtros
    getNotificationsByType,
    getNotificationsByPriority,
    getUnreadNotifications,
    getRecentNotifications,
    
    // Hooks individuais (para acesso direto se necessário)
    appointmentNotifications: includeAppointmentNotifications ? appointmentNotifications : null,
    backupNotifications: includeBackupNotifications ? backupNotifications : null
  };
}

// Funções auxiliares para mapear tipos de notificação de agendamentos
function getAppointmentNotificationTitle(notification: AppointmentNotification): string {
  switch (notification.type) {
    case 'reminder':
      return 'Lembrete de Consulta';
    case 'confirmation':
      return 'Confirmação de Consulta';
    case 'cancellation':
      return 'Cancelamento de Consulta';
    case 'rescheduling':
      return 'Reagendamento de Consulta';
    default:
      return 'Notificação de Consulta';
  }
}

function mapAppointmentNotificationType(type: string): NotificationType {
  switch (type) {
    case 'reminder':
      return NotificationType.APPOINTMENT_REMINDER;
    case 'confirmation':
      return NotificationType.APPOINTMENT_CONFIRMED;
    case 'cancellation':
      return NotificationType.APPOINTMENT_CANCELLED;
    case 'rescheduling':
      return NotificationType.APPOINTMENT_RESCHEDULED;
    default:
      return NotificationType.SYSTEM_NOTIFICATION;
  }
}

function mapAppointmentNotificationPriority(priority: string): NotificationPriority {
  switch (priority) {
    case 'high':
    case 'urgent':
      return NotificationPriority.HIGH;
    case 'medium':
      return NotificationPriority.MEDIUM;
    case 'low':
      return NotificationPriority.LOW;
    default:
      return NotificationPriority.MEDIUM;
  }
}

export default useIntegratedNotifications;