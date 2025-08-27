import { api } from './api';
import {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
  AppointmentFilters,
  AppointmentsResponse,
  AppointmentStats,
  DoctorAvailability,
  AvailabilityResponse,
  TimeSlot,
  WaitingListEntry,
  AppointmentNotification,
  RescheduleRequest,
  AppointmentValidation,
  AppointmentExportOptions,
  Procedure,
  Room,
  ConsultationType,
  CalendarEvent
} from '../types/appointments';

class AppointmentsService {
  private baseUrl = '/appointments';

  // CRUD de Agendamentos
  async getAppointments(filters?: AppointmentFilters, page = 1, perPage = 20): Promise<AppointmentsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
      if (filters.patient_id) params.append('patient_id', filters.patient_id.toString());
      if (filters.status?.length) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters.appointment_type) params.append('appointment_type', filters.appointment_type);
      if (filters.room) params.append('room', filters.room);
      if (filters.search) params.append('search', filters.search);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    const response = await api.get(`${this.baseUrl}/?${params.toString()}`);
    return response.data;
  }

  async getAppointment(id: number): Promise<Appointment> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createAppointment(appointment: AppointmentCreate): Promise<Appointment> {
    const response = await api.post(this.baseUrl, appointment);
    return response.data;
  }

  async updateAppointment(id: number, appointment: Partial<AppointmentUpdate>): Promise<Appointment> {
    const response = await api.put(`${this.baseUrl}/${id}`, appointment);
    return response.data;
  }

  async deleteAppointment(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async cancelAppointment(id: number, reason?: string): Promise<Appointment> {
    const response = await api.patch(`${this.baseUrl}/${id}/cancel`, { 
      cancellation_reason: reason 
    });
    return response.data;
  }

  async confirmAppointment(id: number): Promise<Appointment> {
    const response = await api.patch(`${this.baseUrl}/${id}/confirm`);
    return response.data;
  }

  async startAppointment(id: number): Promise<Appointment> {
    const response = await api.patch(`${this.baseUrl}/${id}/start`);
    return response.data;
  }

  async completeAppointment(id: number): Promise<Appointment> {
    const response = await api.patch(`${this.baseUrl}/${id}/complete`);
    return response.data;
  }

  async markNoShow(id: number): Promise<Appointment> {
    const response = await api.patch(`${this.baseUrl}/${id}/no-show`);
    return response.data;
  }

  // Estatísticas
  async getStats(filters?: AppointmentFilters): Promise<AppointmentStats> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await api.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data;
  }

  async getMonthlyStats(
    year: number, 
    month: number, 
    filters?: AppointmentFilters
  ): Promise<AppointmentStats> {
    const params = new URLSearchParams({
      year: year.toString(),
      month: month.toString()
    });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await api.get(`${this.baseUrl}/stats/monthly?${params.toString()}`);
    return response.data;
  }

  // Disponibilidade de Médicos
  async getDoctorAvailability(doctorId: number, date: string): Promise<AvailabilityResponse> {
    const response = await api.get(`/doctors/${doctorId}/availability?date=${date}`);
    return response.data;
  }

  async getAvailableSlots(
    doctorId: number, 
    date: string, 
    duration = 30,
    procedureId?: number
  ): Promise<TimeSlot[]> {
    const params = new URLSearchParams({
      date,
      duration: duration.toString()
    });
    
    if (procedureId) {
      params.append('procedure_id', procedureId.toString());
    }
    
    const response = await api.get(`/doctors/${doctorId}/available-slots?${params.toString()}`);
    return response.data;
  }

  async updateDoctorAvailability(
    doctorId: number, 
    availability: Partial<DoctorAvailability>[]
  ): Promise<DoctorAvailability[]> {
    const response = await api.put(`/doctors/${doctorId}/availability`, availability);
    return response.data;
  }

  // Validação de Agendamentos
  async validateAppointment(appointment: AppointmentCreate): Promise<AppointmentValidation> {
    const response = await api.post(`${this.baseUrl}/validate`, appointment);
    return response.data;
  }

  async checkConflicts(
    doctorId: number, 
    date: string, 
    startTime: string, 
    duration: number,
    excludeAppointmentId?: number
  ): Promise<AppointmentValidation> {
    const params = new URLSearchParams({
      doctor_id: doctorId.toString(),
      date,
      start_time: startTime,
      duration: duration.toString()
    });
    
    if (excludeAppointmentId) {
      params.append('exclude_id', excludeAppointmentId.toString());
    }
    
    const response = await api.get(`${this.baseUrl}/check-conflicts?${params.toString()}`);
    return response.data;
  }

  // Reagendamento
  async rescheduleAppointment(request: RescheduleRequest): Promise<Appointment> {
    const response = await api.post(`${this.baseUrl}/${request.appointment_id}/reschedule`, {
      new_date: request.new_date,
      new_time: request.new_time,
      reason: request.reason,
      notify_patient: request.notify_patient
    });
    return response.data;
  }

  async suggestRescheduleOptions(
    appointmentId: number, 
    preferredDates?: string[]
  ): Promise<{ date: string; slots: TimeSlot[] }[]> {
    const params = new URLSearchParams();
    if (preferredDates?.length) {
      preferredDates.forEach(date => params.append('preferred_dates', date));
    }
    
    const response = await api.get(
      `${this.baseUrl}/${appointmentId}/reschedule-options?${params.toString()}`
    );
    return response.data;
  }

  // Lista de Espera
  async getWaitingList(doctorId?: number): Promise<WaitingListEntry[]> {
    const params = doctorId ? `?doctor_id=${doctorId}` : '';
    const response = await api.get(`/waiting-list${params}`);
    return response.data;
  }

  async addToWaitingList(entry: Omit<WaitingListEntry, 'id' | 'created_at'>): Promise<WaitingListEntry> {
    const response = await api.post('/waiting-list', entry);
    return response.data;
  }

  async removeFromWaitingList(id: number): Promise<void> {
    await api.delete(`/waiting-list/${id}`);
  }

  async notifyWaitingList(doctorId: number, availableSlot: TimeSlot): Promise<void> {
    await api.post('/waiting-list/notify', {
      doctor_id: doctorId,
      available_slot: availableSlot
    });
  }

  // Notificações
  async getNotifications({
    userId,
    clinicId,
    status,
    types,
    priority,
    dateRange,
    limit = 50
  }: {
    userId?: number;
    clinicId?: number;
    status?: string[];
    types?: string[];
    priority?: string[];
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<AppointmentNotification[]> {
    const params = new URLSearchParams();
    
    if (userId) params.append('user_id', userId.toString());
    if (clinicId) params.append('clinic_id', clinicId.toString());
    if (limit) params.append('limit', limit.toString());
    
    if (status && status.length > 0) {
      status.forEach(s => params.append('status', s));
    }
    
    if (types && types.length > 0) {
      types.forEach(t => params.append('type', t));
    }
    
    if (priority && priority.length > 0) {
      priority.forEach(p => params.append('priority', p));
    }
    
    if (dateRange) {
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
    }
    
    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  }

  async getNotificationSettings(userId: number): Promise<any> {
    const response = await api.get(`/notifications/settings/${userId}`);
    return response.data;
  }

  async getNotificationStats(userId?: number, clinicId?: number): Promise<any> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());
    if (clinicId) params.append('clinic_id', clinicId.toString());
    
    const response = await api.get(`/notifications/stats?${params.toString()}`);
    return response.data;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  }

  async updateNotificationSettings(userId: number, settings: any): Promise<any> {
    const response = await api.put(`/notifications/settings/${userId}`, settings);
    return response.data;
  }

  async sendNotification(
    notificationData: Partial<AppointmentNotification>
  ): Promise<AppointmentNotification> {
    const response = await api.post('/notifications/appointments', notificationData);
    return response.data;
  }

  async markNotificationsAsRead(notificationIds: number[]): Promise<void> {
    await api.patch('/notifications/mark-read', {
      notification_ids: notificationIds
    });
  }

  async deleteNotifications(notificationIds: number[]): Promise<void> {
    await api.delete('/notifications', {
      data: { notification_ids: notificationIds }
    });
  }

  async createAppointmentReminder(
    appointmentId: number,
    reminderTime: string,
    message?: string
  ): Promise<AppointmentNotification> {
    const response = await api.post('/notifications/reminders', {
      appointment_id: appointmentId,
      reminder_time: reminderTime,
      message
    });
    return response.data;
  }

  async cancelReminder(reminderId: number): Promise<void> {
    await api.delete(`/notifications/reminders/${reminderId}`);
  }

  async sendReminders(appointmentIds: number[]): Promise<AppointmentNotification[]> {
    const response = await api.post('/notifications/appointments/reminders', {
      appointment_ids: appointmentIds
    });
    return response.data;
  }

  // Calendário
  async getCalendarEvents({
    startDate, 
    endDate, 
    doctorIds,
    clinicIds,
    status,
    appointmentTypes,
    showCanceled = false,
    showCompleted = true
  }: {
    startDate: string;
    endDate: string;
    doctorIds?: number[];
    clinicIds?: number[];
    status?: string[];
    appointmentTypes?: string[];
    showCanceled?: boolean;
    showCompleted?: boolean;
  }): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    
    if (doctorIds && doctorIds.length > 0) {
      doctorIds.forEach(id => params.append('doctor_id', id.toString()));
    }
    
    if (clinicIds && clinicIds.length > 0) {
      clinicIds.forEach(id => params.append('clinic_id', id.toString()));
    }
    
    if (status && status.length > 0) {
      status.forEach(s => params.append('status', s));
    }
    
    if (appointmentTypes && appointmentTypes.length > 0) {
      appointmentTypes.forEach(type => params.append('appointment_type', type));
    }
    
    params.append('show_canceled', showCanceled.toString());
    params.append('show_completed', showCompleted.toString());
    
    const response = await api.get(`${this.baseUrl}/calendar?${params.toString()}`);
    const appointments: Appointment[] = response.data;
    
    // Transformar Appointment[] em CalendarEvent[]
    return appointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.patient?.name || 'Paciente'} - ${appointment.procedure?.name || 'Consulta'}`,
      start: `${appointment.appointment_date}T${appointment.start_time || '08:00'}`,
      end: `${appointment.appointment_date}T${appointment.end_time || this.calculateEndTime(appointment.start_time || '08:00', appointment.duration || 30)}`,
      appointment: appointment,
      color: this.getAppointmentColor(appointment.status),
      textColor: '#ffffff'
    }));
  }
  
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + durationMinutes);
    
    return `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
  }
  
  private getAppointmentColor(status: string): string {
    const colors = {
      scheduled: '#3b82f6', // blue
      confirmed: '#10b981', // green
      in_progress: '#f59e0b', // amber
      completed: '#6b7280', // gray
      cancelled: '#ef4444', // red
      no_show: '#dc2626', // red-600
      rescheduled: '#8b5cf6' // purple
    };
    
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  // Procedimentos
  async getProcedures(): Promise<Procedure[]> {
    const response = await api.get('/procedures');
    return response.data;
  }

  async getProcedure(id: number): Promise<Procedure> {
    const response = await api.get(`/procedures/${id}`);
    return response.data;
  }

  // Salas
  async getRooms(): Promise<Room[]> {
    const response = await api.get('/rooms');
    return response.data;
  }

  async getAvailableRooms(date: string, startTime: string, endTime: string): Promise<Room[]> {
    const params = new URLSearchParams({
      date,
      start_time: startTime,
      end_time: endTime
    });
    
    const response = await api.get(`/rooms/available?${params.toString()}`);
    return response.data;
  }

  // Tipos de Consulta
  async getConsultationTypes(): Promise<ConsultationType[]> {
    const response = await api.get('/consultation-types');
    return response.data;
  }

  // Relatórios e Exportação
  async exportAppointments(options: AppointmentExportOptions): Promise<Blob> {
    const response = await api.post('/appointments/export', options, {
      responseType: 'blob'
    });
    return response.data;
  }

  async generateReport(
    startDate: string, 
    endDate: string, 
    doctorId?: number
  ): Promise<Blob> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    
    if (doctorId) {
      params.append('doctor_id', doctorId.toString());
    }
    
    const response = await api.get(`${this.baseUrl}/report?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Busca e Filtros Avançados
  async searchAppointments(query: string, filters?: AppointmentFilters): Promise<Appointment[]> {
    const params = new URLSearchParams({ search: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await api.get(`${this.baseUrl}/search?${params.toString()}`);
    return response.data;
  }

  // Agendamento Rápido
  async quickBooking(data: {
    patient_id: number;
    doctor_id: number;
    date: string;
    time: string;
    duration?: number;
    notes?: string;
  }): Promise<Appointment> {
    const response = await api.post(`${this.baseUrl}/quick-booking`, data);
    return response.data;
  }

  // Agendamento em Lote
  async bulkCreate(appointments: AppointmentCreate[]): Promise<Appointment[]> {
    const response = await api.post(`${this.baseUrl}/bulk`, appointments);
    return response.data;
  }

  async bulkUpdate(
    appointmentIds: number[], 
    updates: Partial<AppointmentUpdate>
  ): Promise<Appointment[]> {
    const response = await api.patch(`${this.baseUrl}/bulk`, {
      appointment_ids: appointmentIds,
      updates
    });
    return response.data;
  }

  async bulkCancel(
    appointmentIds: number[], 
    reason?: string
  ): Promise<Appointment[]> {
    const response = await api.patch(`${this.baseUrl}/bulk/cancel`, {
      appointment_ids: appointmentIds,
      cancellation_reason: reason
    });
    return response.data;
  }

  // Integração com Telemedicina
  async createTelemedicineAppointment(data: {
    appointment_id: number;
    platform: string;
    meeting_url?: string;
  }): Promise<{ meeting_url: string; meeting_id: string }> {
    const response = await api.post('/telemedicine/appointments', data);
    return response.data;
  }

  async getTelemedicineLink(appointmentId: number): Promise<{ meeting_url: string }> {
    const response = await api.get(`/telemedicine/appointments/${appointmentId}/link`);
    return response.data;
  }

  // Métricas e Analytics
  async getMetrics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    no_show_rate: number;
    average_duration: number;
    revenue: number;
    busiest_hours: { hour: number; count: number }[];
    doctor_performance: { doctor_id: number; appointments: number; rating: number }[];
  }> {
    const response = await api.get(`${this.baseUrl}/metrics?period=${period}`);
    return response.data;
  }

  // Integração com Faturamento
  async getBillableAppointments(filters?: {
    date_from?: string;
    date_to?: string;
    doctor_id?: number;
    patient_id?: number;
    status?: string[];
  }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
      if (filters.patient_id) params.append('patient_id', filters.patient_id.toString());
      if (filters.status?.length) {
        filters.status.forEach(status => params.append('status', status));
      }
    }
    
    const response = await api.get(`${this.baseUrl}/billable?${params.toString()}`);
    return response.data;
  }

  async getUnbilledAppointments(filters?: {
    date_from?: string;
    date_to?: string;
    doctor_id?: number;
    patient_id?: number;
  }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
      if (filters.patient_id) params.append('patient_id', filters.patient_id.toString());
    }
    
    const response = await api.get(`${this.baseUrl}/unbilled?${params.toString()}`);
    return response.data;
  }

  async markAsBilled(appointmentId: number, invoiceId: number): Promise<Appointment> {
    const response = await api.patch(`${this.baseUrl}/${appointmentId}/mark-billed`, {
      invoice_id: invoiceId
    });
    return response.data;
  }

  async markAsNonBillable(appointmentId: number, reason?: string): Promise<Appointment> {
    const response = await api.patch(`${this.baseUrl}/${appointmentId}/mark-non-billable`, {
      reason
    });
    return response.data;
  }

  async getBillingStats(filters?: {
    date_from?: string;
    date_to?: string;
    doctor_id?: number;
  }): Promise<{
    total_appointments: number;
    billable_appointments: number;
    billed_appointments: number;
    unbilled_appointments: number;
    non_billable_appointments: number;
    total_revenue: number;
    pending_revenue: number;
    billing_rate: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    }
    
    const response = await api.get(`${this.baseUrl}/billing-stats?${params.toString()}`);
    return response.data;
  }

  async getAppointmentInvoice(appointmentId: number): Promise<{ invoice_id: number; invoice_number: string } | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${appointmentId}/invoice`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getPatientBillingHistory(patientId: number, limit = 10): Promise<{
    appointments: Appointment[];
    total_billed: number;
    total_pending: number;
    last_billing_date?: string;
  }> {
    const response = await api.get(`/patients/${patientId}/billing-history?limit=${limit}`);
    return response.data;
  }
}

export const appointmentsService = new AppointmentsService();
export default appointmentsService;