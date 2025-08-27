// Tipos para o sistema de transferências de pacientes

export interface Transfer {
  id: string;
  admission_id: string;
  admission?: {
    id: string;
    patient?: {
      id: string;
      name: string;
      cpf: string;
      birth_date: string;
    };
    admission_date: string;
    admission_reason: string;
  };
  from_bed_id: string;
  from_bed?: {
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
  to_bed_id: string;
  to_bed?: {
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
  transfer_date: string;
  transfer_time?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  transfer_type: TransferType;
  transfer_reason: string;
  medical_justification: string;
  urgency_level: UrgencyLevel;
  patient_condition: PatientCondition;
  equipment_needed?: string[];
  special_requirements?: string;
  transport_method?: TransportMethod;
  escort_required: boolean;
  escort_type?: EscortType;
  requested_by: string;
  approved_by?: string;
  executed_by?: string;
  status: TransferStatus;
  approval_notes?: string;
  execution_notes?: string;
  complications?: string;
  duration_minutes?: number;
  cost?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export type TransferType = 'INTERNAL' | 'EXTERNAL' | 'EMERGENCY' | 'SCHEDULED' | 'ICU' | 'STEP_DOWN' | 'DISCHARGE_TRANSFER';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
export type PatientCondition = 'STABLE' | 'UNSTABLE' | 'CRITICAL' | 'IMPROVING' | 'DETERIORATING';
export type TransportMethod = 'WHEELCHAIR' | 'STRETCHER' | 'WALKING' | 'AMBULANCE' | 'HELICOPTER' | 'ICU_TRANSPORT';
export type EscortType = 'NURSE' | 'DOCTOR' | 'TECHNICIAN' | 'FAMILY' | 'SECURITY' | 'NONE';
export type TransferStatus = 'REQUESTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

// Tipos para equipamentos e recursos
export interface TransferEquipment {
  id: string;
  transfer_id: string;
  equipment_name: string;
  equipment_type: string;
  required: boolean;
  available: boolean;
  reserved_at?: string;
  notes?: string;
}

export interface TransferResource {
  id: string;
  transfer_id: string;
  resource_type: ResourceType;
  resource_name: string;
  quantity_needed: number;
  quantity_available: number;
  allocated: boolean;
  notes?: string;
}

export type ResourceType = 'STAFF' | 'EQUIPMENT' | 'MEDICATION' | 'SUPPLIES' | 'TRANSPORT' | 'ROOM';

// Tipos para histórico e auditoria
export interface TransferHistory {
  id: string;
  transfer_id: string;
  action: TransferAction;
  previous_status?: TransferStatus;
  new_status: TransferStatus;
  performed_by: string;
  performed_at: string;
  notes?: string;
  details?: Record<string, any>;
}

export type TransferAction = 'CREATED' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'STARTED' | 'COMPLETED' | 'CANCELLED' | 'MODIFIED';

// Tipos para formulários
export interface CreateTransferForm {
  admission_id: string;
  from_bed_id: string;
  to_bed_id: string;
  transfer_date: string;
  transfer_time?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  transfer_type: TransferType;
  transfer_reason: string;
  medical_justification: string;
  urgency_level: UrgencyLevel;
  patient_condition: PatientCondition;
  equipment_needed?: string[];
  special_requirements?: string;
  transport_method?: TransportMethod;
  escort_required: boolean;
  escort_type?: EscortType;
}

export interface UpdateTransferForm {
  transfer_date?: string;
  transfer_time?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  transfer_reason?: string;
  medical_justification?: string;
  urgency_level?: UrgencyLevel;
  patient_condition?: PatientCondition;
  equipment_needed?: string[];
  special_requirements?: string;
  transport_method?: TransportMethod;
  escort_required?: boolean;
  escort_type?: EscortType;
  approval_notes?: string;
  execution_notes?: string;
}

export interface TransferApprovalForm {
  approved: boolean;
  approval_notes?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  modifications?: {
    field: string;
    old_value: any;
    new_value: any;
    reason: string;
  }[];
}

export interface TransferExecutionForm {
  execution_notes?: string;
  complications?: string;
  duration_minutes?: number;
  equipment_used?: string[];
  escort_present?: boolean;
  patient_condition_on_arrival?: PatientCondition;
}

export interface TransferSearchForm {
  patient_name?: string;
  cpf?: string;
  from_department?: string;
  to_department?: string;
  transfer_type?: TransferType[];
  status?: TransferStatus[];
  urgency_level?: UrgencyLevel[];
  date_from?: string;
  date_to?: string;
  requested_by?: string;
}

// Tipos para filtros
export interface TransferFilters {
  transfer_type?: TransferType[];
  status?: TransferStatus[];
  urgency_level?: UrgencyLevel[];
  patient_condition?: PatientCondition[];
  from_department_id?: string;
  to_department_id?: string;
  date_from?: string;
  date_to?: string;
  requested_by?: string;
  approved_by?: string;
}

// Tipos para estatísticas
export interface TransferStats {
  total_transfers: number;
  pending_transfers: number;
  completed_transfers: number;
  cancelled_transfers: number;
  average_duration_minutes: number;
  success_rate: number;
  transfer_types: TransferTypeStats[];
  urgency_levels: UrgencyLevelStats[];
  department_transfers: DepartmentTransferStats[];
  hourly_distribution: HourlyTransferStats[];
  monthly_trends: MonthlyTransferStats[];
}

export interface TransferTypeStats {
  type: TransferType;
  count: number;
  percentage: number;
  average_duration: number;
  success_rate: number;
}

export interface UrgencyLevelStats {
  level: UrgencyLevel;
  count: number;
  percentage: number;
  average_response_time: number;
}

export interface DepartmentTransferStats {
  department_id: string;
  department_name: string;
  transfers_from: number;
  transfers_to: number;
  net_transfers: number;
  most_common_destination?: string;
  most_common_source?: string;
}

export interface HourlyTransferStats {
  hour: number;
  count: number;
  percentage: number;
}

export interface MonthlyTransferStats {
  month: string;
  year: number;
  total_transfers: number;
  emergency_transfers: number;
  scheduled_transfers: number;
  success_rate: number;
}

// Tipos para relatórios
export interface TransferReport {
  id: string;
  title: string;
  type: TransferReportType;
  period: {
    start_date: string;
    end_date: string;
  };
  filters?: TransferFilters;
  data: any;
  generated_at: string;
  generated_by: string;
}

export type TransferReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM' | 'EFFICIENCY' | 'QUALITY';

// Tipos para validação de transferência
export interface TransferValidation {
  can_transfer: boolean;
  validation_errors: TransferValidationError[];
  warnings: TransferValidationWarning[];
  requirements: TransferRequirement[];
}

export interface TransferValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface TransferValidationWarning {
  message: string;
  type: 'MEDICAL' | 'LOGISTIC' | 'ADMINISTRATIVE';
}

export interface TransferRequirement {
  requirement: string;
  description: string;
  met: boolean;
  required: boolean;
}

// Tipos para disponibilidade de leitos
export interface BedAvailability {
  bed_id: string;
  bed_number: string;
  bed_type: string;
  room: {
    id: string;
    number: string;
    name: string;
    department: {
      id: string;
      name: string;
    };
  };
  available: boolean;
  available_from?: string;
  reserved_until?: string;
  restrictions?: string[];
  suitability_score?: number;
}

// Tipos para notificações
export interface TransferNotification {
  id: string;
  transfer_id: string;
  recipient_type: NotificationRecipientType;
  recipient_id: string;
  notification_type: TransferNotificationType;
  title: string;
  message: string;
  sent_at: string;
  read_at?: string;
  acknowledged_at?: string;
}

export type NotificationRecipientType = 'USER' | 'DEPARTMENT' | 'ROLE' | 'SYSTEM';
export type TransferNotificationType = 'REQUEST' | 'APPROVAL' | 'REJECTION' | 'SCHEDULE' | 'START' | 'COMPLETION' | 'CANCELLATION' | 'DELAY';

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
export interface UseTransfersReturn {
  transfers: Transfer[];
  isLoading: boolean;
  error: string | null;
  stats: TransferStats | null;
  createTransfer: (data: CreateTransferForm) => Promise<Transfer>;
  updateTransfer: (id: string, data: UpdateTransferForm) => Promise<Transfer>;
  approveTransfer: (id: string, data: TransferApprovalForm) => Promise<Transfer>;
  rejectTransfer: (id: string, reason: string) => Promise<Transfer>;
  executeTransfer: (id: string, data: TransferExecutionForm) => Promise<Transfer>;
  cancelTransfer: (id: string, reason: string) => Promise<Transfer>;
  getTransfer: (id: string) => Promise<Transfer>;
  searchTransfers: (filters: TransferSearchForm) => Promise<Transfer[]>;
  validateTransfer: (data: CreateTransferForm) => Promise<TransferValidation>;
  getAvailableBeds: (departmentId?: string, bedType?: string) => Promise<BedAvailability[]>;
  refetch: () => void;
}

export interface UseTransferDetailsReturn {
  transfer: Transfer | null;
  isLoading: boolean;
  error: string | null;
  history: TransferHistory[];
  equipment: TransferEquipment[];
  resources: TransferResource[];
  notifications: TransferNotification[];
  validation: TransferValidation | null;
  addEquipment: (data: Omit<TransferEquipment, 'id' | 'transfer_id'>) => Promise<void>;
  removeEquipment: (equipmentId: string) => Promise<void>;
  allocateResource: (resourceId: string) => Promise<void>;
  sendNotification: (data: Omit<TransferNotification, 'id' | 'transfer_id' | 'sent_at'>) => Promise<void>;
  refetch: () => void;
}