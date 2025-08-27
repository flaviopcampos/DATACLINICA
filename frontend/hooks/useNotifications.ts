import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppointmentsService } from '@/services/appointmentsService';
import type {
  AppointmentNotification,
  WaitingListEntry,
  NotificationType,
  DeliveryMethod
} from '@/types/appointments';

// Hook para notificações de agendamentos
export function useAppointmentNotifications(appointmentId?: string) {
  const queryClient = useQueryClient();

  // Query para buscar notificações
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['appointment-notifications', appointmentId],
    queryFn: () => AppointmentsService.getAppointmentNotifications(appointmentId),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
  });

  // Mutation para enviar lembrete
  const sendReminderMutation = useMutation({
    mutationFn: (appointmentId: string) => 
      AppointmentsService.sendAppointmentReminder(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-notifications'] });
      toast.success('Lembrete enviado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar lembrete');
    }
  });

  // Mutation para enviar notificação customizada
  const sendNotificationMutation = useMutation({
    mutationFn: ({
      appointmentId,
      type,
      message,
      deliveryMethod = 'email'
    }: {
      appointmentId: string;
      type: NotificationType;
      message: string;
      deliveryMethod?: DeliveryMethod;
    }) => AppointmentsService.sendAppointmentNotification(
      appointmentId, 
      type, 
      message, 
      deliveryMethod
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-notifications'] });
      toast.success('Notificação enviada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar notificação');
    }
  });

  return {
    notifications,
    isLoading,
    error,
    refetch,
    sendReminder: sendReminderMutation.mutate,
    sendNotification: sendNotificationMutation.mutate,
    isSendingReminder: sendReminderMutation.isPending,
    isSendingNotification: sendNotificationMutation.isPending,
  };
}

// Hook para lista de espera
export function useWaitingList(filters?: {
  doctor_id?: string;
  appointment_type?: string;
  priority?: string;
}) {
  const queryClient = useQueryClient();

  // Query para buscar lista de espera
  const {
    data: waitingList = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['waiting-list', filters],
    queryFn: () => AppointmentsService.getWaitingList(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000, // Atualiza a cada 10 minutos
  });

  // Mutation para adicionar à lista de espera
  const addToWaitingListMutation = useMutation({
    mutationFn: (data: {
      patient_id: string;
      doctor_id?: string;
      preferred_date?: string;
      preferred_time?: string;
      appointment_type: string;
      priority: string;
    }) => AppointmentsService.addToWaitingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
      toast.success('Paciente adicionado à lista de espera!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao adicionar à lista de espera');
    }
  });

  // Mutation para remover da lista de espera
  const removeFromWaitingListMutation = useMutation({
    mutationFn: (id: string) => AppointmentsService.removeFromWaitingList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
      toast.success('Paciente removido da lista de espera!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover da lista de espera');
    }
  });

  // Mutation para notificar disponibilidade
  const notifyAvailabilityMutation = useMutation({
    mutationFn: (id: string) => AppointmentsService.notifyWaitingListAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
      toast.success('Notificação de disponibilidade enviada!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar notificação');
    }
  });

  return {
    waitingList,
    isLoading,
    error,
    refetch,
    addToWaitingList: addToWaitingListMutation.mutate,
    removeFromWaitingList: removeFromWaitingListMutation.mutate,
    notifyAvailability: notifyAvailabilityMutation.mutate,
    isAdding: addToWaitingListMutation.isPending,
    isRemoving: removeFromWaitingListMutation.isPending,
    isNotifying: notifyAvailabilityMutation.isPending,
  };
}

// Hook para notificações automáticas
export function useAutomaticNotifications() {
  const queryClient = useQueryClient();

  // Função para configurar notificações automáticas
  const setupAutomaticReminders = useMutation({
    mutationFn: async (config: {
      appointmentId: string;
      reminderTimes: number[]; // em horas antes do agendamento
      deliveryMethods: DeliveryMethod[];
    }) => {
      // Implementar lógica para agendar lembretes automáticos
      // Isso pode ser feito via backend ou usando Web Workers/Service Workers
      const { appointmentId, reminderTimes, deliveryMethods } = config;
      
      // Por enquanto, apenas simular a configuração
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      toast.success('Lembretes automáticos configurados!');
    },
    onError: (error: any) => {
      toast.error('Erro ao configurar lembretes automáticos');
    }
  });

  return {
    setupAutomaticReminders: setupAutomaticReminders.mutate,
    isSettingUp: setupAutomaticReminders.isPending,
  };
}

// Hook para notificações em tempo real (usando polling)
export function useRealTimeNotifications(userId?: string) {
  const {
    data: notifications = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['realtime-notifications', userId],
    queryFn: () => AppointmentsService.getAppointmentNotifications(),
    enabled: !!userId,
    staleTime: 0, // Sempre considera stale
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
    refetchIntervalInBackground: true,
  });

  // Filtrar apenas notificações não lidas
  const unreadNotifications = notifications.filter(
    notification => notification.status !== 'delivered'
  );

  return {
    notifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    isLoading,
    refetch,
  };
}

// Hook para gerenciar preferências de notificação
export function useNotificationPreferences(userId: string) {
  const queryClient = useQueryClient();

  // Estado local para preferências (normalmente viria do backend)
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: true,
    reminderTimes: [24, 2], // 24h e 2h antes
    appointmentCreated: true,
    appointmentReminder: true,
    appointmentCancelled: true,
    appointmentRescheduled: true,
    waitingListAvailable: true,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: typeof preferences) => {
      // Implementar chamada para o backend
      // await api.put(`/users/${userId}/notification-preferences`, newPreferences);
      setPreferences(newPreferences);
      return newPreferences;
    },
    onSuccess: () => {
      toast.success('Preferências de notificação atualizadas!');
    },
    onError: () => {
      toast.error('Erro ao atualizar preferências');
    }
  });

  return {
    preferences,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
}

// Hook para estatísticas de notificações
export function useNotificationStats(filters?: {
  date_from?: string;
  date_to?: string;
  type?: NotificationType;
}) {
  return useQuery({
    queryKey: ['notification-stats', filters],
    queryFn: async () => {
      // Implementar chamada para estatísticas de notificações
      // const response = await api.get('/notifications/stats', { params: filters });
      // return response.data;
      
      // Mock data por enquanto
      return {
        total_sent: 150,
        delivered: 142,
        failed: 8,
        delivery_rate: 94.7,
        by_type: {
          appointment_reminder: 80,
          appointment_created: 35,
          appointment_cancelled: 20,
          waiting_list_available: 15,
        },
        by_method: {
          email: 90,
          sms: 35,
          push: 25,
        }
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook principal para notificações (compatibilidade)
export function useNotifications(userId?: string) {
  const appointmentNotifications = useAppointmentNotifications();
  const realTimeNotifications = useRealTimeNotifications(userId);
  const waitingList = useWaitingList();
  const automaticNotifications = useAutomaticNotifications();
  
  return {
    // Notificações de agendamentos
    ...appointmentNotifications,
    
    // Notificações em tempo real
    realTimeNotifications: realTimeNotifications.notifications,
    unreadNotifications: realTimeNotifications.unreadNotifications,
    unreadCount: realTimeNotifications.unreadCount,
    
    // Lista de espera
    waitingList: waitingList.waitingList,
    addToWaitingList: waitingList.addToWaitingList,
    removeFromWaitingList: waitingList.removeFromWaitingList,
    notifyAvailability: waitingList.notifyAvailability,
    
    // Notificações automáticas
    setupAutomaticReminders: automaticNotifications.setupAutomaticReminders,
  };
}