// Tipos e interfaces para o sistema de prescrições médicas

export interface PrescriptionBase {
  medical_record_id: number;
  patient_id: number;
  doctor_id: number;
  prescription_number?: string;
  prescription_type: string;
  content: string;
  validity_days: number;
  digital_signature?: string;
  signature_certificate?: string;
  is_controlled: boolean;
  status: 'active' | 'expired' | 'cancelled' | 'dispensed';
  expires_at?: string;
}

export interface PrescriptionCreate extends PrescriptionBase {}

export interface PrescriptionUpdate {
  medical_record_id?: number;
  patient_id?: number;
  doctor_id?: number;
  prescription_number?: string;
  prescription_type?: string;
  content?: string;
  validity_days?: number;
  digital_signature?: string;
  signature_certificate?: string;
  is_controlled?: boolean;
  status?: 'active' | 'expired' | 'cancelled' | 'dispensed';
  expires_at?: string;
}

export interface Prescription extends PrescriptionBase {
  id: number;
  issued_at: string;
  medications?: PrescriptionMedication[];
  patient?: {
    id: number;
    name: string;
    cpf: string;
    birth_date: string;
  };
  doctor?: {
    id: number;
    name: string;
    crm: string;
    specialty: string;
  };
}

// Medicamentos da prescrição
export interface PrescriptionMedicationBase {
  prescription_id: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity?: number;
  instructions?: string;
  is_controlled: boolean;
  generic_allowed: boolean;
}

export interface PrescriptionMedicationCreate extends PrescriptionMedicationBase {}

export interface PrescriptionMedicationUpdate {
  prescription_id?: number;
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  instructions?: string;
  is_controlled?: boolean;
  generic_allowed?: boolean;
}

export interface PrescriptionMedication extends PrescriptionMedicationBase {
  id: number;
  created_at: string;
}

// Tipos para formulários
export interface PrescriptionFormData {
  patient_id: number;
  doctor_id: number;
  medical_record_id: number;
  prescription_type: 'simple' | 'controlled' | 'special' | 'digital';
  validity_days: number;
  content?: string;
  is_controlled?: boolean;
  medications: MedicationFormData[];
}

export interface MedicationFormData {
  id?: number;
  medication_id: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  is_controlled?: boolean;
  generic_allowed?: boolean;
}

// Tipos para filtros e busca
export interface PrescriptionFilters {
  patient_id?: number;
  doctor_id?: number;
  status?: string;
  prescription_type?: string;
  is_controlled?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Tipos para listagem paginada
export interface PrescriptionListResponse {
  prescriptions: Prescription[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Tipos para estatísticas
export interface PrescriptionStats {
  total_prescriptions: number;
  active_prescriptions: number;
  expired_prescriptions: number;
  controlled_prescriptions: number;
  prescriptions_this_month: number;
  most_prescribed_medications: {
    medication_name: string;
    count: number;
  }[];
}

// Tipos para validação
export interface PrescriptionValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// Tipos para impressão/exportação
export interface PrescriptionPrintData {
  prescription: Prescription;
  clinic_info: {
    name: string;
    address: string;
    phone: string;
    cnpj: string;
  };
  qr_code?: string;
}

// Constantes
export const PRESCRIPTION_TYPES = {
  SIMPLE: 'simple',
  CONTROLLED: 'controlled',
  SPECIAL: 'special',
  DIGITAL: 'digital'
} as const;

export const PRESCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  DISPENSED: 'dispensed'
} as const;

// Tipos para opções de select
export interface SelectOption {
  value: string;
  label: string;
}

export const MEDICATION_FREQUENCIES: SelectOption[] = [
  { value: '1x ao dia', label: '1x ao dia' },
  { value: '2x ao dia', label: '2x ao dia' },
  { value: '3x ao dia', label: '3x ao dia' },
  { value: '4x ao dia', label: '4x ao dia' },
  { value: '6x ao dia', label: '6x ao dia' },
  { value: '8x ao dia', label: '8x ao dia' },
  { value: '12x ao dia', label: '12x ao dia' },
  { value: 'A cada 4 horas', label: 'A cada 4 horas' },
  { value: 'A cada 6 horas', label: 'A cada 6 horas' },
  { value: 'A cada 8 horas', label: 'A cada 8 horas' },
  { value: 'A cada 12 horas', label: 'A cada 12 horas' },
  { value: 'Quando necessário', label: 'Quando necessário' },
  { value: 'Uso contínuo', label: 'Uso contínuo' }
];

export const MEDICATION_DURATIONS: SelectOption[] = [
  { value: '1 dia', label: '1 dia' },
  { value: '3 dias', label: '3 dias' },
  { value: '5 dias', label: '5 dias' },
  { value: '7 dias', label: '7 dias' },
  { value: '10 dias', label: '10 dias' },
  { value: '14 dias', label: '14 dias' },
  { value: '21 dias', label: '21 dias' },
  { value: '30 dias', label: '30 dias' },
  { value: '60 dias', label: '60 dias' },
  { value: '90 dias', label: '90 dias' },
  { value: 'Uso contínuo', label: 'Uso contínuo' }
];