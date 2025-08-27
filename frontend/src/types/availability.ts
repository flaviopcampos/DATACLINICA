// Tipos para sistema de disponibilidade de médicos

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0 = Domingo, 1 = Segunda, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  break_start?: string; // HH:MM format
  break_end?: string; // HH:MM format
  max_appointments_per_slot: number;
  slot_duration: number; // em minutos
  created_at: string;
  updated_at: string;
}

export interface DoctorAvailabilityCreate {
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
  break_start?: string;
  break_end?: string;
  max_appointments_per_slot?: number;
  slot_duration?: number;
}

export interface DoctorAvailabilityUpdate {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  break_start?: string;
  break_end?: string;
  max_appointments_per_slot?: number;
  slot_duration?: number;
}

export interface TimeSlot {
  id: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  is_booked: boolean;
  appointment_id?: string;
  max_appointments: number;
  current_appointments: number;
  slot_type: 'regular' | 'emergency' | 'follow_up' | 'consultation';
  created_at: string;
  updated_at: string;
}

export interface TimeSlotCreate {
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available?: boolean;
  max_appointments?: number;
  slot_type?: 'regular' | 'emergency' | 'follow_up' | 'consultation';
}

export interface TimeSlotUpdate {
  is_available?: boolean;
  max_appointments?: number;
  slot_type?: 'regular' | 'emergency' | 'follow_up' | 'consultation';
}

export interface ConsultationType {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  price: number;
  color: string; // hex color for calendar display
  is_active: boolean;
  requires_preparation: boolean;
  preparation_time?: number; // em minutos
  follow_up_required: boolean;
  follow_up_days?: number;
  specialty_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationTypeCreate {
  name: string;
  description?: string;
  duration: number;
  price: number;
  color?: string;
  is_active?: boolean;
  requires_preparation?: boolean;
  preparation_time?: number;
  follow_up_required?: boolean;
  follow_up_days?: number;
  specialty_id?: string;
}

export interface ConsultationTypeUpdate {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  color?: string;
  is_active?: boolean;
  requires_preparation?: boolean;
  preparation_time?: number;
  follow_up_required?: boolean;
  follow_up_days?: number;
  specialty_id?: string;
}

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpecialtyCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface SpecialtyUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface AvailabilityPattern {
  id: string;
  name: string;
  description?: string;
  doctor_id: string;
  pattern_type: 'weekly' | 'monthly' | 'custom';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  availability_rules: DoctorAvailability[];
  created_at: string;
  updated_at: string;
}

export interface AvailabilityPatternCreate {
  name: string;
  description?: string;
  doctor_id: string;
  pattern_type: 'weekly' | 'monthly' | 'custom';
  start_date: string;
  end_date?: string;
  is_active?: boolean;
  availability_rules: DoctorAvailabilityCreate[];
}

export interface AvailabilityConflict {
  id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  conflict_type: 'vacation' | 'sick_leave' | 'meeting' | 'emergency' | 'other';
  reason?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityConflictCreate {
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  conflict_type: 'vacation' | 'sick_leave' | 'meeting' | 'emergency' | 'other';
  reason?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export interface AvailabilityStats {
  doctor_id: string;
  date_range: {
    start: string;
    end: string;
  };
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  blocked_slots: number;
  utilization_rate: number; // percentage
  peak_hours: {
    start_time: string;
    end_time: string;
    booking_rate: number;
  }[];
  consultation_types_distribution: {
    type_id: string;
    type_name: string;
    count: number;
    percentage: number;
  }[];
}