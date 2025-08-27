import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useIntegratedNotifications } from '@/hooks/useIntegratedNotifications';
import { useBackupProgress } from '@/hooks/useBackup';
import { NotificationType, NotificationPriority } from '@/types/notifications';
import { BackupStatus, RestoreStatus } from '@/types/backup';

interface BackupNotificationIntegrationProps {
  userId?: number;
  clinicId?: number;
  enableToasts?: boolean;
  enableRealTime?: boolean;
  includeAppointmentNotifications?: boolean;
}

/**
 * Componente de integração que conecta o sistema de backup
 * com as notificações existentes do sistema
 * Agora utiliza o sistema integrado de notificações
 */
export function BackupNotificationIntegration({
  userId,
  clinicId,
  enableToasts = true,
  enableRealTime = true,
  includeAppointmentNotifications = false
}: BackupNotificationIntegrationProps) {
  const {
    notifications,
    unreadCount,
    isConnected,
    backupNotifications
  } = useIntegratedNotifications({
    userId,
    clinicId,
    includeBackupNotifications: true,
    includeAppointmentNotifications,
    enableRealTime,
    autoRefresh: true,
    refreshInterval: 10000 // 10 segundos para backup
  });

  const { data: backupProgress } = useBackupProgress();

  // Monitorar progresso de backup e disparar notificações
  useEffect(() => {
    if (!backupProgress || !enableToasts || !backupNotifications) return;

    backupProgress.forEach(progress => {
      const { id, status, progress: percentage, error } = progress;

      switch (status) {
        case BackupStatus.RUNNING:
          if (percentage === 0) {
            // Backup iniciado
            backupNotifications.notifyBackupStarted(id);
            toast.info(`Backup ${id} iniciado`, {
              description: 'O processo de backup foi iniciado com sucesso.',
              duration: 3000
            });
          }
          break;

        case BackupStatus.COMPLETED:
          backupNotifications.notifyBackupCompleted(id, progress.size || 0, progress.duration || 0);
          toast.success(`Backup ${id} concluído`, {
            description: `Backup finalizado com sucesso. Tamanho: ${formatFileSize(progress.size || 0)}`,
            duration: 5000
          });
          break;

        case BackupStatus.FAILED:
          backupNotifications.notifyBackupFailed(id, error || 'Erro desconhecido');
          toast.error(`Falha no backup ${id}`, {
            description: error || 'Ocorreu um erro durante o processo de backup.',
            duration: 8000
          });
          break;

        case BackupStatus.CANCELLED:
          // Criar notificação de cancelamento usando o sistema integrado
          if (backupNotifications.createNotification) {
            backupNotifications.createNotification({
              title: 'Backup Cancelado',
              message: `O backup ${id} foi cancelado pelo usuário.`,
              type: NotificationType.SYSTEM_NOTIFICATION,
              priority: NotificationPriority.MEDIUM,
              userId,
              clinicId,
              metadata: {
                backupId: id,
                status: 'cancelled'
              }
            });
          }
          
          toast.warning(`Backup ${id} cancelado`, {
            description: 'O processo de backup foi cancelado pelo usuário.',
            duration: 4000
          });
          break;
      }
    });
  }, [backupProgress, enableToasts, backupNotifications, userId, clinicId]);

  // Monitorar notificações não lidas e exibir toasts
  useEffect(() => {
    if (!notifications || !enableToasts) return;

    const recentNotifications = notifications.filter(notification => {
      const createdAt = new Date(notification.createdAt);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return createdAt > fiveMinutesAgo && notification.status !== 'READ';
    });

    recentNotifications.forEach(notification => {
      const toastOptions = {
        duration: getToastDuration(notification.priority),
        action: {
          label: 'Ver detalhes',
          onClick: () => {
            // Navegar para a página de backup ou abrir modal com detalhes
            window.location.href = '/dashboard/system/backup';
          }
        }
      };

      switch (notification.type) {
        case NotificationType.BACKUP_STARTED:
          toast.info(notification.title, {
            description: notification.message,
            ...toastOptions
          });
          break;

        case NotificationType.BACKUP_COMPLETED:
          toast.success(notification.title, {
            description: notification.message,
            ...toastOptions
          });
          break;

        case NotificationType.BACKUP_FAILED:
        case NotificationType.BACKUP_VERIFICATION_FAILED:
          toast.error(notification.title, {
            description: notification.message,
            ...toastOptions
          });
          break;

        case NotificationType.STORAGE_SPACE_LOW:
          toast.warning(notification.title, {
            description: notification.message,
            ...toastOptions
          });
          break;

        case NotificationType.RESTORE_STARTED:
          toast.info(notification.title, {
            description: notification.message,
            ...toastOptions
          });
          break;

        case NotificationType.RESTORE_COMPLETED:
          toast.success(notification.title, {
            description: notification.message,
            ...toastOptions
          });
          break;

        case NotificationType.RESTORE_FAILED:
          toast.error(notification.title, {
            description: notification.message,
            ...toastOptions
          });
          break;

        default:
          toast(notification.title, {
            description: notification.message,
            ...toastOptions
          });
      }
    });
  }, [notifications, enableToasts]);

  // Exibir status de conexão
  useEffect(() => {
    if (!enableToasts) return;

    if (isConnected) {
      toast.success('Sistema de backup conectado', {
        description: 'Monitoramento em tempo real ativo.',
        duration: 2000
      });
    } else {
      toast.warning('Sistema de backup desconectado', {
        description: 'Tentando reconectar...',
        duration: 3000
      });
    }
  }, [isConnected, enableToasts]);

  // Função para formatar tamanho de arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para determinar duração do toast baseada na prioridade
  const getToastDuration = (priority: NotificationPriority): number => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return 10000; // 10 segundos
      case NotificationPriority.MEDIUM:
        return 6000;  // 6 segundos
      case NotificationPriority.LOW:
        return 4000;  // 4 segundos
      default:
        return 5000;  // 5 segundos
    }
  };

  // Este componente não renderiza nada visualmente
  // Ele apenas gerencia as integrações de notificação
  return null;
}

export default BackupNotificationIntegration;