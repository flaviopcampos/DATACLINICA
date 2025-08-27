// Tipos para o sistema de leitos e internações

export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  department_id: string;
  department?: Department;
  number: string;
  name: string;
  room_type: 'STANDARD' | 'SUITE' | 'ICU' | 'ISOLATION';
  capacity: number;
  floor: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: string;
  room_id: string;
  room?: Room;
  number: string;
  bed_type: 'STANDARD' | 'ICU' | 'PEDIATRIC' | 'MATERNITY';
  status: BedStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  current_admission?: PatientAdmission;
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'BLOCKED' | 'CLEANING';

export interface BedStatusHistory {
  id: string;
  bed_id: string;
  bed?: Bed;
  previous_status: BedStatus;
  new_status: BedStatus;
  reason?: string;
  changed_by: string;
  changed_at: string;
}

export interface PatientAdmission {
  id: string;
  patient_id: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birth_date: string;
    phone?: string;
  };
  bed_id: string;
  bed?: Bed;
  admission_date: string;
  expected_discharge_date?: string;
  actual_discharge_date?: string;
  admission_reason: string;
  admission_type: 'EMERGENCY' | 'SCHEDULED' | 'TRANSFER';
  payment_type: PaymentType;
  status: AdmissionStatus;
  daily_rate: number;
  total_days?: number;
  total_amount?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  transfers?: BedTransfer[];
  billing?: AdmissionBilling;
}

export type AdmissionStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED' | 'DECEASED';
export type PaymentType = 'PRIVATE' | 'INSURANCE' | 'SUS' | 'AGREEMENT';

export interface BedTransfer {
  id: string;
  admission_id: string;
  admission?: PatientAdmission;
  from_bed_id: string;
  from_bed?: Bed;
  to_bed_id: string;
  to_bed?: Bed;
  transfer_date: string;
  reason: string;
  transferred_by: string;
  created_at: string;
}

export interface DailyRateConfig {
  id: string;
  payment_type: PaymentType;
  bed_type: string;
  base_rate: number;
  base_value: number; // Alias para base_rate para compatibilidade
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tiers?: DailyRateTier[];
}

export interface DailyRateTier {
  id: string;
  config_id: string;
  config?: DailyRateConfig;
  min_days: number;
  max_days?: number;
  rate: number;
  value: number; // Alias para rate para compatibilidade
  discount_percentage?: number;
  created_at: string;
}

export interface AdmissionBilling {
  id: string;
  admission_id: string;
  admission?: PatientAdmission;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  due_date?: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: BillingItem[];
}

export interface BillingItem {
  id: string;
  billing_id: string;
  billing?: AdmissionBilling;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'DAILY_RATE' | 'MEDICATION' | 'PROCEDURE' | 'EXTRA';
  created_at: string;
}

// Tipos para estatísticas e relatórios
export interface BedOccupancyStats {
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  maintenance_beds: number;
  blocked_beds: number;
  occupancy_rate: number;
  department_stats: DepartmentStats[];
}

export interface DepartmentStats {
  department_id: string;
  department_name: string;
  total_beds: number;
  occupied_beds: number;
  occupancy_rate: number;
}

export interface OccupancyTrend {
  date: string;
  occupancy_rate: number;
  total_beds: number;
  occupied_beds: number;
}

export interface FinancialSummary {
  total_revenue: number;
  pending_amount: number;
  paid_amount: number;
  overdue_amount: number;
  active_admissions: number;
  average_daily_rate: number;
  payment_type_breakdown: PaymentTypeBreakdown[];
}

export interface PaymentTypeBreakdown {
  payment_type: PaymentType;
  count: number;
  total_amount: number;
  percentage: number;
}

// Tipos para formulários
export interface CreateDepartmentForm {
  name: string;
  description?: string;
}

// Alias para compatibilidade com o bedService
export interface CreateDepartmentRequest extends CreateDepartmentForm {}

export interface CreateRoomForm {
  department_id: string;
  number: string;
  name: string;
  room_type: Room['room_type'];
  capacity: number;
}

// Alias para compatibilidade com o bedService
export interface CreateRoomRequest extends CreateRoomForm {}

export interface CreateBedForm {
  room_id: string;
  number: string;
  bed_type: Bed['bed_type'];
}

// Alias para compatibilidade com o bedService
export interface CreateBedRequest extends CreateBedForm {}

export interface CreateAdmissionForm {
  patient_id: string;
  bed_id: string;
  admission_date: string;
  admission_time?: string;
  expected_discharge_date?: string;
  admission_reason: string;
  admission_type?: PatientAdmission['admission_type'];
  payment_type: PaymentType;
  daily_rate?: number;
  estimated_days?: number;
  medical_notes?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_info?: string;
  notes?: string;
}

export interface DischargeForm {
  discharge_date: string;
  discharge_reason: string;
  notes?: string;
}

export interface TransferForm {
  to_bed_id: string;
  transfer_date: string;
  reason: string;
}

export interface UpdateBedStatusRequest {
  status: BedStatus;
  reason?: string;
}

export interface CreateAdmissionRequest {
  patient_id: string;
  bed_id: string;
  admission_date: string;
  expected_discharge_date?: string;
  admission_reason: string;
  admission_type: PatientAdmission['admission_type'];
  payment_type: PaymentType;
  daily_rate: number;
  notes?: string;
}

export interface DailyRateConfigForm {
  payment_type: PaymentType;
  bed_type: string;
  base_rate: number;
  tiers: {
    min_days: number;
    max_days?: number;
    rate: number;
    discount_percentage?: number;
  }[];
}

// Tipos para filtros
export interface BedFilters {
  department_id?: string;
  room_id?: string;
  status?: BedStatus[];
  bed_type?: Bed['bed_type'][];
}

export interface AdmissionFilters {
  status?: AdmissionStatus[];
  payment_type?: PaymentType[];
  admission_type?: PatientAdmission['admission_type'][];
  date_from?: string;
  date_to?: string;
  department_id?: string;
}

export interface FinancialFilters {
  payment_type?: PaymentType[];
  payment_status?: AdmissionBilling['payment_status'][];
  date_from?: string;
  date_to?: string;
  department_id?: string;
}

// Tipos para API responses
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
export interface UseBedOccupancyReturn {
  stats: BedOccupancyStats | null;
  trends: OccupancyTrend[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseAdmissionsReturn {
  admissions: PatientAdmission[];
  isLoading: boolean;
  error: string | null;
  createAdmission: (data: CreateAdmissionForm) => Promise<void>;
  dischargePatient: (id: string, data: DischargeForm) => Promise<void>;
  transferPatient: (id: string, data: TransferForm) => Promise<void>;
  refetch: () => void;
}

export interface UseBedsReturn {
  beds: Bed[];
  isLoading: boolean;
  error: string | null;
  updateBedStatus: (id: string, status: BedStatus, reason?: string) => Promise<void>;
  createBed: (data: CreateBedForm) => Promise<void>;
  refetch: () => void;
}