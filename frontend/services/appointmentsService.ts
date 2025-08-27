import api from './api';
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentAvailability,
  WaitingListEntry,
  AppointmentConflict,
  AppointmentNotification,
  DoctorSchedule,
  AvailabilityRule
} from '@/types/appointments';

export class AppointmentsService {
  // CRUD de Agendamentos
  static async getAppointments(filters?: AppointmentFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  }

  static async getAppointment(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  }

  static async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  }

  static async updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  }

  static async cancelAppointment(id: string, reason?: string): Promise<void> {
    await api.patch(`/appointments/${id}/cancel`, { reason });
  }

  static async confirmAppointment(id: string): Promise<void> {
    await api.patch(`/appointments/${id}/confirm`);
  }

  static async rescheduleAppointment(
    id: string, 
    newDate: string, 
    newTime: string
  ): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/reschedule`, {
      appointment_date: newDate,
      appointment_time: newTime
    });
    return response.data;
  }

  // Disponibilidade de Médicos
  static async getDoctorAvailability(
    doctorId: string, 
    date: string
  ): Promise<AppointmentAvailability> {
    const response = await api.get(`/doctors/${doctorId}/availability?date=${date}`);
    return response.data;
  }

  static async getDoctorSchedule(
    doctorId: string, 
    date: string
  ): Promise<DoctorSchedule> {
    const response = await api.get(`/doctors/${doctorId}/schedule?date=${date}`);
    return response.data;
  }

  static async getAvailableSlots(
    doctorId: string, 
    date: string, 
    duration: number = 30
  ): Promise<{ start_time: string; end_time: string }[]> {
    const response = await api.get(
      `/doctors/${doctorId}/available-slots?date=${date}&duration=${duration}`
    );
    return response.data;
  }

  static async setDoctorAvailability(
    doctorId: string, 
    rules: AvailabilityRule[]
  ): Promise<void> {
    await api.post(`/doctors/${doctorId}/availability`, { rules });
  }

  // Lista de Espera
  static async getWaitingList(filters?: {
    doctor_id?: string;
    appointment_type?: string;
    priority?: string;
  }): Promise<WaitingListEntry[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get(`/waiting-list?${params.toString()}`);
    return response.data;
  }

  static async addToWaitingList(data: {
    patient_id: string;
    doctor_id?: string;
    preferred_date?: string;
    preferred_time?: string;
    appointment_type: string;
    priority: string;
  }): Promise<WaitingListEntry> {
    const response = await api.post('/waiting-list', data);
    return response.data;
  }

  static async removeFromWaitingList(id: string): Promise<void> {
    await api.delete(`/waiting-list/${id}`);
  }

  static async notifyWaitingListAvailability(id: string): Promise<void> {
    await api.post(`/waiting-list/${id}/notify`);
  }

  // Conflitos de Agendamentos
  static async getAppointmentConflicts(): Promise<AppointmentConflict[]> {
    const response = await api.get('/appointments/conflicts');
    return response.data;
  }

  static async resolveConflict(
    conflictId: string, 
    resolution: {
      action: string;
      appointment_id?: string;
      new_date?: string;
      new_time?: string;
    }
  ): Promise<void> {
    await api.post(`/appointments/conflicts/${conflictId}/resolve`, resolution);
  }

  static async checkConflicts(
    appointmentData: CreateAppointmentData
  ): Promise<AppointmentConflict[]> {
    const response = await api.post('/appointments/check-conflicts', appointmentData);
    return response.data;
  }

  // Notificações
  static async getAppointmentNotifications(
    appointmentId?: string
  ): Promise<AppointmentNotification[]> {
    const url = appointmentId 
      ? `/notifications/appointments/${appointmentId}`
      : '/notifications/appointments';
    const response = await api.get(url);
    return response.data;
  }

  static async sendAppointmentReminder(appointmentId: string): Promise<void> {
    await api.post(`/appointments/${appointmentId}/remind`);
  }

  static async sendAppointmentNotification(
    appointmentId: string,
    type: string,
    message: string,
    deliveryMethod: string = 'email'
  ): Promise<void> {
    await api.post(`/appointments/${appointmentId}/notify`, {
      type,
      message,
      delivery_method: deliveryMethod
    });
  }

  // Relatórios e Estatísticas
  static async getAppointmentStats(filters?: {
    date_from?: string;
    date_to?: string;
    doctor_id?: string;
  }) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get(`/appointments/stats?${params.toString()}`);
    return response.data;
  }

  static async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const response = await api.get(`/appointments/by-date/${date}`);
    return response.data;
  }

  static async getAppointmentsByDateRange(
    startDate: string, 
    endDate: string
  ): Promise<Appointment[]> {
    const response = await api.get(
      `/appointments/range?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  }

  // Reagendamento Automático
  static async suggestRescheduleOptions(
    appointmentId: string
  ): Promise<{
    date: string;
    time: string;
    doctor_id: string;
    doctor_name: string;
  }[]> {
    const response = await api.get(`/appointments/${appointmentId}/reschedule-options`);
    return response.data;
  }

  static async autoReschedule(
    appointmentId: string,
    preferences?: {
      preferred_dates?: string[];
      preferred_times?: string[];
      same_doctor?: boolean;
    }
  ): Promise<Appointment> {
    const response = await api.post(`/appointments/${appointmentId}/auto-reschedule`, preferences);
    return response.data;
  }

  // Busca e Filtros
  static async searchAppointments(query: string): Promise<Appointment[]> {
    const response = await api.get(`/appointments/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  static async getUpcomingAppointments(
    limit: number = 10
  ): Promise<Appointment[]> {
    const response = await api.get(`/appointments/upcoming?limit=${limit}`);
    return response.data;
  }

  static async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsByDate(today);
  }
}