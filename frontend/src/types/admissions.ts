// Tipos para o sistema de internações

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birth_date: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_info?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  created_at: string;
  updated_at: string;
}

export interface Admission {
  id: string;
  patient_id: string;
  patient?: Patient;
  bed_id: string;
  bed?: {
    id: string;
    number: string;
    bed_type: string;
    room?: {
      id: string;
      number: string;
      name: string;
      department?: {
        id: string;
        name: string;
      };
    };
  };
  admission_date: string;
  admission_time?: string;
  expected_discharge_date?: string;
  actual_discharge_date?: string;
  admission_reason: string;
  admission_type: AdmissionType;
  payment_type: PaymentType;
  status: AdmissionStatus;
  daily_rate: number;
  estimated_days?: number;
  total_days?: number;
  total_amount?: number;
  medical_notes?: string;
  discharge_reason?: string;
  discharge_notes?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_info?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  transfers?: AdmissionTransfer[];
  billing?: AdmissionBilling;
  medical_records?: MedicalRecord[];
  vital_signs?: VitalSigns[];
  medications?: AdmissionMedication[];
  procedures?: AdmissionProcedure[];
}

export type AdmissionType = 'EMERGENCY' | 'SCHEDULED' | 'TRANSFER' | 'ELECTIVE' | 'URGENT';
export type AdmissionStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED' | 'DECEASED' | 'CANCELLED';
export type PaymentType = 'PRIVATE' | 'INSURANCE' | 'SUS' | 'AGREEMENT' | 'CASH' | 'CARD';

export interface AdmissionTransfer {
  id: string;
  admission_id: string;
  from_bed_id: string;
  from_bed?: {
    id: string;
    number: string;
    room?: {
      number: string;
      name: string;
      department?: {
        name: string;
      };
    };
  };
  to_bed_id: string;
  to_bed?: {
    id: string;
    number: string;
    room?: {
      number: string;
      name: string;
      department?: {
        name: string;
      };
    };
  };
  transfer_date: string;
  transfer_time?: string;
  reason: string;
  notes?: string;
  transferred_by: string;
  approved_by?: string;
  status: TransferStatus;
  created_at: string;
}

export type TransferStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface AdmissionBilling {
  id: string;
  admission_id: string;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  additional_charges: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  due_date?: string;
  paid_date?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: BillingItem[];
  payments?: BillingPayment[];
}

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface BillingItem {
  id: string;
  billing_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: BillingItemType;
  date: string;
  created_at: string;
}

export type BillingItemType = 'DAILY_RATE' | 'MEDICATION' | 'PROCEDURE' | 'EXAM' | 'EXTRA' | 'EQUIPMENT' | 'NURSING';

export interface BillingPayment {
  id: string;
  billing_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  admission_id: string;
  record_date: string;
  record_time: string;
  record_type: MedicalRecordType;
  title: string;
  description: string;
  doctor_id: string;
  doctor_name?: string;
  attachments?: string[];
  created_at: string;
}

export type MedicalRecordType = 'EVOLUTION' | 'PRESCRIPTION' | 'EXAM_REQUEST' | 'EXAM_RESULT' | 'PROCEDURE' | 'DISCHARGE_SUMMARY';

export interface VitalSigns {
  id: string;
  admission_id: string;
  recorded_date: string;
  recorded_time: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  pain_scale?: number;
  consciousness_level?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

export interface AdmissionMedication {
  id: string;
  admission_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  end_date?: string;
  prescribed_by: string;
  notes?: string;
  status: MedicationStatus;
  created_at: string;
}

export type MedicationStatus = 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'CANCELLED';

export interface AdmissionProcedure {
  id: string;
  admission_id: string;
  procedure_name: string;
  procedure_code?: string;
  scheduled_date: string;
  scheduled_time?: string;
  performed_date?: string;
  performed_time?: string;
  doctor_id: string;
  doctor_name?: string;
  status: ProcedureStatus;
  notes?: string;
  cost?: number;
  created_at: string;
}

export type ProcedureStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';

// Tipos para formulários
export interface CreateAdmissionForm {
  patient_id: string;
  bed_id: string;
  admission_date: string;
  admission_time?: string;
  expected_discharge_date?: string;
  admission_reason: string;
  admission_type: AdmissionType;
  payment_type: PaymentType;
  daily_rate?: number;
  estimated_days?: number;
  medical_notes?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_info?: string;
  notes?: string;
}

export interface UpdateAdmissionForm {
  expected_discharge_date?: string;
  admission_reason?: string;
  payment_type?: PaymentType;
  daily_rate?: number;
  medical_notes?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_info?: string;
  notes?: string;
}

export interface AdmissionSearchForm {
  patient_name?: string;
  cpf?: string;
  bed_number?: string;
  department_id?: string;
  status?: AdmissionStatus[];
  admission_type?: AdmissionType[];
  payment_type?: PaymentType[];
  date_from?: string;
  date_to?: string;
}

// Tipos para filtros
export interface AdmissionFilters {
  status?: AdmissionStatus[];
  admission_type?: AdmissionType[];
  payment_type?: PaymentType[];
  department_id?: string;
  bed_type?: string;
  date_from?: string;
  date_to?: string;
  patient_name?: string;
  cpf?: string;
}

// Tipos para estatísticas
export interface AdmissionStats {
  total_admissions: number;
  active_admissions: number;
  discharged_today: number;
  average_stay_days: number;
  occupancy_rate: number;
  revenue_today: number;
  revenue_month: number;
  admission_types: AdmissionTypeStats[];
  payment_types: PaymentTypeStats[];
  department_stats: DepartmentAdmissionStats[];
}

export interface AdmissionTypeStats {
  type: AdmissionType;
  count: number;
  percentage: number;
}

export interface PaymentTypeStats {
  type: PaymentType;
  count: number;
  total_amount: number;
  percentage: number;
}

export interface DepartmentAdmissionStats {
  department_id: string;
  department_name: string;
  total_admissions: number;
  active_admissions: number;
  occupancy_rate: number;
  average_stay: number;
}

// Tipos para relatórios
export interface AdmissionReport {
  id: string;
  title: string;
  type: AdmissionReportType;
  period: {
    start_date: string;
    end_date: string;
  };
  filters?: AdmissionFilters;
  data: any;
  generated_at: string;
  generated_by: string;
}

export type AdmissionReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' | 'FINANCIAL' | 'OCCUPANCY';

// Tipos para API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Tipos para hooks
export interface UseAdmissionsReturn {
  admissions: Admission[];
  isLoading: boolean;
  error: string | null;
  stats: AdmissionStats | null;
  createAdmission: (data: CreateAdmissionForm) => Promise<Admission>;
  updateAdmission: (id: string, data: UpdateAdmissionForm) => Promise<Admission>;
  getAdmission: (id: string) => Promise<Admission>;
  searchAdmissions: (filters: AdmissionSearchForm) => Promise<Admission[]>;
  refetch: () => void;
}

export interface UseAdmissionDetailsReturn {
  admission: Admission | null;
  isLoading: boolean;
  error: string | null;
  medicalRecords: MedicalRecord[];
  vitalSigns: VitalSigns[];
  medications: AdmissionMedication[];
  procedures: AdmissionProcedure[];
  addMedicalRecord: (data: Omit<MedicalRecord, 'id' | 'created_at'>) => Promise<void>;
  addVitalSigns: (data: Omit<VitalSigns, 'id' | 'created_at'>) => Promise<void>;
  addMedication: (data: Omit<AdmissionMedication, 'id' | 'created_at'>) => Promise<void>;
  addProcedure: (data: Omit<AdmissionProcedure, 'id' | 'created_at'>) => Promise<void>;
  refetch: () => void;
}