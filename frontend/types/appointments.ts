export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number; // em minutos
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  cpf?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  email?: string;
  phone?: string;
}

export interface AppointmentAvailability {
  doctor_id: string;
  date: string;
  available_slots: TimeSlot[];
  unavailable_slots: TimeSlot[];
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  appointment_id?: string;
}

export interface AppointmentConflict {
  id: string;
  appointment_id: string;
  conflicting_appointment_id: string;
  conflict_type: ConflictType;
  resolved: boolean;
  resolution_action?: ResolutionAction;
}

export interface WaitingListEntry {
  id: string;
  patient_id: string;
  doctor_id?: string;
  preferred_date?: string;
  preferred_time?: string;
  appointment_type: AppointmentType;
  priority: Priority;
  created_at: string;
  notified: boolean;
}

export interface AppointmentNotification {
  id: string;
  appointment_id: string;
  patient_id: string;
  type: NotificationType;
  message: string;
  sent_at?: string;
  delivery_method: DeliveryMethod;
  status: NotificationStatus;
}

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type AppointmentType = 
  | 'consultation'
  | 'follow_up'
  | 'procedure'
  | 'emergency'
  | 'routine_checkup'
  | 'specialist_consultation';

export type ConflictType = 
  | 'time_overlap'
  | 'double_booking'
  | 'doctor_unavailable'
  | 'resource_conflict';

export type ResolutionAction = 
  | 'reschedule_first'
  | 'reschedule_second'
  | 'cancel_first'
  | 'cancel_second'
  | 'extend_duration'
  | 'manual_resolution';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType = 
  | 'appointment_created'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'waiting_list_available'
  | 'conflict_detected';

export type DeliveryMethod = 'email' | 'sms' | 'push' | 'in_app';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

// Interfaces para formulários
export interface CreateAppointmentData {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  type: AppointmentType;
  notes?: string;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  status?: AppointmentStatus;
}

export interface AppointmentFilters {
  doctor_id?: string;
  patient_id?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  appointment?: Appointment;
}

export interface AvailabilityRule {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0-6 (domingo-sábado)
  start_time: string;
  end_time: string;
  is_available: boolean;
  break_start?: string;
  break_end?: string;
}

export interface DoctorSchedule {
  doctor_id: string;
  date: string;
  working_hours: {
    start: string;
    end: string;
  };
  breaks: {
    start: string;
    end: string;
  }[];
  appointments: Appointment[];
  available_slots: TimeSlot[];
}