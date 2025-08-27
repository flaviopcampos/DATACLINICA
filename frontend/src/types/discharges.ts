// Tipos para o sistema de altas hospitalares

export interface Discharge {
  id: string;
  admission_id: string;
  admission?: {
    id: string;
    patient?: {
      id: string;
      name: string;
      cpf: string;
    };
    bed?: {
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
    admission_date: string;
    admission_reason: string;
  };
  discharge_date: string;
  discharge_time?: string;
  discharge_type: DischargeType;
  discharge_reason: string;
  discharge_condition: DischargeCondition;
  discharge_destination: DischargeDestination;
  medical_summary: string;
  discharge_instructions?: string;
  follow_up_instructions?: string;
  medications_prescribed?: DischargeMedication[];
  next_appointment_date?: string;
  next_appointment_notes?: string;
  discharge_notes?: string;
  complications?: string;
  final_diagnosis?: string;
  secondary_diagnoses?: string[];
  procedures_performed?: string[];
  total_stay_days: number;
  discharged_by: string;
  doctor_name?: string;
  doctor_crm?: string;
  approved_by?: string;
  status: DischargeStatus;
  created_at: string;
  updated_at: string;
  billing?: DischargeBilling;
  documents?: DischargeDocument[];
}

export type DischargeType = 'MEDICAL' | 'ADMINISTRATIVE' | 'TRANSFER' | 'DEATH' | 'EVASION' | 'REQUEST';
export type DischargeCondition = 'CURED' | 'IMPROVED' | 'STABLE' | 'WORSENED' | 'UNCHANGED' | 'DECEASED';
export type DischargeDestination = 'HOME' | 'ANOTHER_HOSPITAL' | 'NURSING_HOME' | 'REHABILITATION' | 'MORGUE' | 'OTHER';
export type DischargeStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface DischargeMedication {
  id: string;
  discharge_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity?: number;
  prescribed: boolean;
  notes?: string;
}

export interface DischargeBilling {
  id: string;
  discharge_id: string;
  total_days: number;
  daily_rate: number;
  accommodation_cost: number;
  medical_procedures_cost: number;
  medications_cost: number;
  exams_cost: number;
  other_costs: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  insurance_coverage?: number;
  patient_responsibility?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface DischargeDocument {
  id: string;
  discharge_id: string;
  document_type: DischargeDocumentType;
  document_name: string;
  file_path?: string;
  file_url?: string;
  generated_at: string;
  generated_by: string;
  notes?: string;
}

export type DischargeDocumentType = 'DISCHARGE_SUMMARY' | 'PRESCRIPTION' | 'MEDICAL_CERTIFICATE' | 'EXAM_RESULTS' | 'INVOICE' | 'OTHER';

// Tipos para formulários
export interface CreateDischargeForm {
  admission_id: string;
  discharge_date: string;
  discharge_time?: string;
  discharge_type: DischargeType;
  discharge_reason: string;
  discharge_condition: DischargeCondition;
  discharge_destination: DischargeDestination;
  medical_summary: string;
  discharge_instructions?: string;
  follow_up_instructions?: string;
  next_appointment_date?: string;
  next_appointment_notes?: string;
  discharge_notes?: string;
  complications?: string;
  final_diagnosis?: string;
  secondary_diagnoses?: string[];
  procedures_performed?: string[];
  medications?: CreateDischargeMedicationForm[];
}

export interface CreateDischargeMedicationForm {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity?: number;
  prescribed: boolean;
  notes?: string;
}

export interface UpdateDischargeForm {
  discharge_date?: string;
  discharge_time?: string;
  discharge_type?: DischargeType;
  discharge_reason?: string;
  discharge_condition?: DischargeCondition;
  discharge_destination?: DischargeDestination;
  medical_summary?: string;
  discharge_instructions?: string;
  follow_up_instructions?: string;
  next_appointment_date?: string;
  next_appointment_notes?: string;
  discharge_notes?: string;
  complications?: string;
  final_diagnosis?: string;
  secondary_diagnoses?: string[];
  procedures_performed?: string[];
}

export interface DischargeSearchForm {
  patient_name?: string;
  cpf?: string;
  discharge_type?: DischargeType[];
  discharge_condition?: DischargeCondition[];
  discharge_destination?: DischargeDestination[];
  status?: DischargeStatus[];
  date_from?: string;
  date_to?: string;
  doctor_name?: string;
  department_id?: string;
}

// Tipos para filtros
export interface DischargeFilters {
  discharge_type?: DischargeType[];
  discharge_condition?: DischargeCondition[];
  discharge_destination?: DischargeDestination[];
  status?: DischargeStatus[];
  date_from?: string;
  date_to?: string;
  department_id?: string;
  doctor_id?: string;
  patient_name?: string;
  cpf?: string;
}

// Tipos para estatísticas
export interface DischargeStats {
  total_discharges: number;
  discharges_today: number;
  discharges_this_week: number;
  discharges_this_month: number;
  average_stay_days: number;
  readmission_rate: number;
  discharge_types: DischargeTypeStats[];
  discharge_conditions: DischargeConditionStats[];
  discharge_destinations: DischargeDestinationStats[];
  department_stats: DepartmentDischargeStats[];
  monthly_trends: MonthlyDischargeStats[];
}

export interface DischargeTypeStats {
  type: DischargeType;
  count: number;
  percentage: number;
  average_stay: number;
}

export interface DischargeConditionStats {
  condition: DischargeCondition;
  count: number;
  percentage: number;
  average_stay: number;
}

export interface DischargeDestinationStats {
  destination: DischargeDestination;
  count: number;
  percentage: number;
}

export interface DepartmentDischargeStats {
  department_id: string;
  department_name: string;
  total_discharges: number;
  average_stay: number;
  readmission_rate: number;
  most_common_condition: DischargeCondition;
}

export interface MonthlyDischargeStats {
  month: string;
  year: number;
  total_discharges: number;
  average_stay: number;
  readmission_rate: number;
}

// Tipos para relatórios
export interface DischargeReport {
  id: string;
  title: string;
  type: DischargeReportType;
  period: {
    start_date: string;
    end_date: string;
  };
  filters?: DischargeFilters;
  data: any;
  generated_at: string;
  generated_by: string;
}

export type DischargeReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL' | 'CUSTOM' | 'READMISSION' | 'QUALITY';

// Tipos para validação de alta
export interface DischargeValidation {
  can_discharge: boolean;
  validation_errors: DischargeValidationError[];
  warnings: DischargeValidationWarning[];
  pending_items: DischargePendingItem[];
}

export interface DischargeValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface DischargeValidationWarning {
  message: string;
  type: 'BILLING' | 'MEDICAL' | 'ADMINISTRATIVE';
}

export interface DischargePendingItem {
  item: string;
  description: string;
  required: boolean;
  completed: boolean;
}

// Tipos para checklist de alta
export interface DischargeChecklist {
  id: string;
  discharge_id: string;
  medical_clearance: boolean;
  billing_cleared: boolean;
  medications_prescribed: boolean;
  follow_up_scheduled: boolean;
  patient_education_completed: boolean;
  discharge_summary_completed: boolean;
  transportation_arranged: boolean;
  belongings_returned: boolean;
  family_notified: boolean;
  completed_by?: string;
  completed_at?: string;
  notes?: string;
}

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
export interface UseDischargesReturn {
  discharges: Discharge[];
  isLoading: boolean;
  error: string | null;
  stats: DischargeStats | null;
  createDischarge: (data: CreateDischargeForm) => Promise<Discharge>;
  updateDischarge: (id: string, data: UpdateDischargeForm) => Promise<Discharge>;
  getDischarge: (id: string) => Promise<Discharge>;
  searchDischarges: (filters: DischargeSearchForm) => Promise<Discharge[]>;
  validateDischarge: (admissionId: string) => Promise<DischargeValidation>;
  approveDischarge: (id: string) => Promise<Discharge>;
  cancelDischarge: (id: string, reason: string) => Promise<Discharge>;
  generateDocument: (id: string, type: DischargeDocumentType) => Promise<DischargeDocument>;
  refetch: () => void;
}

export interface UseDischargeDetailsReturn {
  discharge: Discharge | null;
  isLoading: boolean;
  error: string | null;
  checklist: DischargeChecklist | null;
  validation: DischargeValidation | null;
  updateChecklist: (data: Partial<DischargeChecklist>) => Promise<void>;
  addMedication: (data: CreateDischargeMedicationForm) => Promise<void>;
  removeMedication: (medicationId: string) => Promise<void>;
  refetch: () => void;
}