export interface AppointmentBase {
  clinic_id?: number;
  patient_id: number;
  doctor_id: number;
  procedure_id?: number;
  appointment_number?: string;
  appointment_date: string;
  duration?: number;
  appointment_type?: string;
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'faltou';
  arrival_time?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
  authorization_number?: string;
  price?: number;
  copayment?: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  cancellation_reason?: string;
  created_by?: number;
}

export interface Appointment extends AppointmentBase {
  id: number;
  created_at: string;
  updated_at: string;
  // Relacionamentos populados
  patient?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    cpf?: string;
  };
  doctor?: {
    id: number;
    name: string;
    specialty?: string;
    crm?: string;
  };
  procedure?: {
    id: number;
    name: string;
    duration?: number;
    price?: number;
  };
}

export interface AppointmentCreate extends Omit<AppointmentBase, 'status' | 'payment_status'> {
  status?: AppointmentBase['status'];
  payment_status?: AppointmentBase['payment_status'];
}

export interface AppointmentUpdate extends Partial<AppointmentBase> {
  id: number;
}

// Tipos para disponibilidade de médicos
export interface DoctorAvailability {
  id: number;
  doctor_id: number;
  day_of_week: number; // 0-6 (domingo-sábado)
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  is_available: boolean;
  break_start?: string;
  break_end?: string;
  max_appointments?: number;
}

export interface TimeSlot {
  id?: string;
  time: string;
  available: boolean;
  appointment_id?: number;
  duration: number;
  // Propriedades adicionais para compatibilidade com TimeSlotPicker
  date?: string;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  doctorId?: string;
  doctorName?: string;
  period?: 'morning' | 'afternoon' | 'evening';
}

export interface DaySchedule {
  date: string;
  slots: TimeSlot[];
  total_slots: number;
  available_slots: number;
  booked_slots: number;
}

// Tipos para calendário
export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  color?: string;
  appointment: Appointment;
}

export interface CalendarView {
  view: 'month' | 'week' | 'day';
  date: string;
}

// Tipos para filtros e busca
export interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  doctor_id?: number;
  patient_id?: number;
  status?: AppointmentBase['status'][];
  appointment_type?: string;
  room?: string;
  search?: string;
}

export interface AppointmentStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  by_status: Record<AppointmentBase['status'], number>;
  by_type: Record<string, number>;
  revenue: {
    today: number;
    this_week: number;
    this_month: number;
  };
}

// Tipos para notificações
export interface AppointmentNotification {
  id: number;
  appointment_id: number;
  type: 'reminder' | 'confirmation' | 'cancellation' | 'rescheduling';
  recipient: 'patient' | 'doctor' | 'both';
  method: 'email' | 'sms' | 'whatsapp' | 'push';
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  message: string;
}

// Tipos para lista de espera
export interface WaitingListEntry {
  id: number;
  patient_id: number;
  doctor_id: number;
  procedure_id?: number;
  preferred_date?: string;
  preferred_time?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  created_at: string;
  notified_at?: string;
  patient?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
  doctor?: {
    id: number;
    name: string;
    specialty?: string;
  };
}

// Tipos para conflitos de horário
export interface ScheduleConflict {
  type: 'overlap' | 'unavailable' | 'break_time' | 'outside_hours';
  message: string;
  conflicting_appointment?: Appointment;
  suggested_times?: string[];
}

// Tipos para reagendamento
export interface RescheduleRequest {
  appointment_id: number;
  new_date: string;
  new_time?: string;
  reason?: string;
  notify_patient: boolean;
}

// Tipos para relatórios de agendamentos
export interface AppointmentReport {
  period: {
    start: string;
    end: string;
  };
  stats: AppointmentStats;
  appointments: Appointment[];
  doctors_performance: {
    doctor_id: number;
    doctor_name: string;
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    no_show_appointments: number;
    revenue: number;
  }[];
  busiest_hours: {
    hour: number;
    count: number;
  }[];
  busiest_days: {
    day: string;
    count: number;
  }[];
}

// Tipos para configurações de agendamento
export interface AppointmentSettings {
  default_duration: number;
  min_advance_booking: number; // horas
  max_advance_booking: number; // dias
  allow_same_day_booking: boolean;
  require_confirmation: boolean;
  auto_confirm_time: number; // horas
  cancellation_deadline: number; // horas
  reminder_times: number[]; // horas antes do agendamento
  working_hours: {
    start: string;
    end: string;
  };
  working_days: number[]; // 0-6
  break_time?: {
    start: string;
    end: string;
  };
}

// Tipos para procedimentos/serviços
export interface Procedure {
  id: number;
  name: string;
  description?: string;
  duration: number; // minutos
  price?: number;
  category?: string;
  requires_authorization: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ProcedureCreate extends Omit<Procedure, 'id' | 'created_at'> {}

export interface ProcedureUpdate extends Partial<ProcedureCreate> {
  id: number;
}

// Tipos para salas/consultórios
export interface Room {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  equipment?: string[];
  is_active: boolean;
}

// Tipos para tipos de consulta
export interface ConsultationType {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  color?: string;
  is_active: boolean;
}

// Tipos para respostas da API
export interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface AvailabilityResponse {
  date: string;
  doctor_id: number;
  available_slots: TimeSlot[];
  unavailable_periods: {
    start: string;
    end: string;
    reason: string;
  }[];
}

// Tipos para hooks
export interface UseAppointmentsOptions {
  filters?: AppointmentFilters;
  page?: number;
  per_page?: number;
  auto_refresh?: boolean;
  refresh_interval?: number;
}

export interface UseAvailabilityOptions {
  doctor_id: number;
  date: string;
  procedure_id?: number;
}

export interface UseCalendarOptions {
  view: CalendarView['view'];
  date: string;
  doctor_id?: number;
  filters?: AppointmentFilters;
}

// Tipos para formulários
export interface AppointmentFormData {
  patient_id: number;
  doctor_id: number;
  procedure_id?: number;
  appointment_date: string;
  appointment_time: string;
  duration?: number;
  appointment_type?: string;
  room?: string;
  notes?: string;
  send_confirmation?: boolean;
  send_reminder?: boolean;
}

export interface QuickAppointmentData {
  patient_name: string;
  patient_phone: string;
  doctor_id: number;
  date: string;
  time: string;
  notes?: string;
}

// Tipos para validação
export interface AppointmentValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: ScheduleConflict[];
}

// Tipos para exportação
export interface AppointmentExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  filters?: AppointmentFilters;
  include_patient_data: boolean;
  include_financial_data: boolean;
  date_range: {
    start: string;
    end: string;
  };
}