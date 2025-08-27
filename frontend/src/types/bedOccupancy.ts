// Tipos para o sistema de ocupação de leitos

export interface BedOccupancy {
  id: string;
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
  patient_id?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birth_date: string;
  };
  admission_id?: string;
  status: BedOccupancyStatus;
  occupied_from?: string;
  occupied_until?: string;
  expected_discharge?: string;
  last_updated: string;
  updated_by: string;
  notes?: string;
  cleaning_status?: CleaningStatus;
  maintenance_status?: MaintenanceStatus;
  reservation?: BedReservation;
}

export type BedOccupancyStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_ORDER' | 'BLOCKED';
export type CleaningStatus = 'CLEAN' | 'NEEDS_CLEANING' | 'CLEANING_IN_PROGRESS' | 'DEEP_CLEANING';
export type MaintenanceStatus = 'OPERATIONAL' | 'NEEDS_MAINTENANCE' | 'MAINTENANCE_SCHEDULED' | 'UNDER_MAINTENANCE';

export interface BedReservation {
  id: string;
  bed_id: string;
  patient_id?: string;
  reserved_by: string;
  reserved_from: string;
  reserved_until: string;
  reservation_type: ReservationType;
  priority: ReservationPriority;
  reason: string;
  status: ReservationStatus;
  notes?: string;
  created_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export type ReservationType = 'ADMISSION' | 'TRANSFER' | 'SURGERY' | 'EMERGENCY' | 'MAINTENANCE' | 'CLEANING';
export type ReservationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
export type ReservationStatus = 'ACTIVE' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'FULFILLED';

// Tipos para estatísticas de ocupação
export interface OccupancyStats {
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  reserved_beds: number;
  maintenance_beds: number;
  cleaning_beds: number;
  out_of_order_beds: number;
  occupancy_rate: number;
  availability_rate: number;
  turnover_rate: number;
  average_stay_duration: number;
  peak_occupancy_time?: string;
  lowest_occupancy_time?: string;
  department_stats: DepartmentOccupancyStats[];
  bed_type_stats: BedTypeOccupancyStats[];
  hourly_occupancy: HourlyOccupancyStats[];
  daily_trends: DailyOccupancyTrend[];
}

export interface DepartmentOccupancyStats {
  department_id: string;
  department_name: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  reserved_beds: number;
  occupancy_rate: number;
  average_stay: number;
  turnover_rate: number;
  revenue_per_bed?: number;
}

export interface BedTypeOccupancyStats {
  bed_type: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_rate: number;
  average_daily_rate?: number;
  revenue_contribution?: number;
}

export interface HourlyOccupancyStats {
  hour: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_rate: number;
  admissions: number;
  discharges: number;
  transfers_in: number;
  transfers_out: number;
}

export interface DailyOccupancyTrend {
  date: string;
  total_beds: number;
  occupied_beds: number;
  occupancy_rate: number;
  admissions: number;
  discharges: number;
  transfers: number;
  revenue?: number;
  average_stay?: number;
}

// Tipos para previsões e análises
export interface OccupancyForecast {
  date: string;
  predicted_occupancy_rate: number;
  confidence_level: number;
  expected_admissions: number;
  expected_discharges: number;
  expected_transfers: number;
  capacity_alerts: CapacityAlert[];
}

export interface CapacityAlert {
  id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  department_id?: string;
  bed_type?: string;
  message: string;
  threshold_value: number;
  current_value: number;
  triggered_at: string;
  resolved_at?: string;
  acknowledged_by?: string;
  actions_taken?: string;
}

export type AlertType = 'HIGH_OCCUPANCY' | 'LOW_OCCUPANCY' | 'CAPACITY_SHORTAGE' | 'MAINTENANCE_OVERDUE' | 'CLEANING_BACKLOG' | 'RESERVATION_CONFLICT';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

// Tipos para relatórios de ocupação
export interface OccupancyReport {
  id: string;
  title: string;
  report_type: OccupancyReportType;
  period: {
    start_date: string;
    end_date: string;
  };
  filters?: OccupancyFilters;
  summary: OccupancyReportSummary;
  detailed_data: any;
  charts: OccupancyChart[];
  recommendations: string[];
  generated_at: string;
  generated_by: string;
}

export type OccupancyReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM' | 'REAL_TIME' | 'FORECAST';

export interface OccupancyReportSummary {
  average_occupancy_rate: number;
  peak_occupancy_rate: number;
  lowest_occupancy_rate: number;
  total_patient_days: number;
  average_length_of_stay: number;
  bed_turnover_rate: number;
  revenue_per_available_bed?: number;
  capacity_utilization: number;
}

export interface OccupancyChart {
  id: string;
  title: string;
  chart_type: ChartType;
  data: any;
  config?: any;
}

export type ChartType = 'LINE' | 'BAR' | 'PIE' | 'AREA' | 'SCATTER' | 'HEATMAP' | 'GAUGE';

// Tipos para filtros e busca
export interface OccupancyFilters {
  department_ids?: string[];
  bed_types?: string[];
  status?: BedOccupancyStatus[];
  date_from?: string;
  date_to?: string;
  include_reservations?: boolean;
  include_maintenance?: boolean;
  occupancy_rate_min?: number;
  occupancy_rate_max?: number;
}

export interface OccupancySearchForm {
  department_id?: string;
  bed_type?: string;
  status?: BedOccupancyStatus[];
  patient_name?: string;
  bed_number?: string;
  date_from?: string;
  date_to?: string;
}

// Tipos para configurações
export interface OccupancySettings {
  id: string;
  auto_update_interval: number; // em segundos
  alert_thresholds: {
    high_occupancy: number;
    low_occupancy: number;
    capacity_warning: number;
    capacity_critical: number;
  };
  notification_settings: {
    email_alerts: boolean;
    sms_alerts: boolean;
    dashboard_alerts: boolean;
    alert_recipients: string[];
  };
  display_settings: {
    default_view: 'GRID' | 'LIST' | 'CHART';
    show_patient_names: boolean;
    show_expected_discharge: boolean;
    color_coding: boolean;
  };
  forecast_settings: {
    enabled: boolean;
    forecast_days: number;
    confidence_threshold: number;
  };
  updated_at: string;
  updated_by: string;
}

// Tipos para métricas de performance
export interface PerformanceMetrics {
  bed_utilization_rate: number;
  average_length_of_stay: number;
  bed_turnover_rate: number;
  patient_throughput: number;
  capacity_efficiency: number;
  revenue_per_bed: number;
  cost_per_patient_day: number;
  staff_productivity: number;
  patient_satisfaction_score?: number;
  readmission_rate?: number;
}

// Tipos para análise de tendências
export interface TrendAnalysis {
  metric: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend_direction: TrendDirection;
  significance: TrendSignificance;
  forecast_next_period?: number;
  recommendations: string[];
}

export type TrendDirection = 'INCREASING' | 'DECREASING' | 'STABLE' | 'VOLATILE';
export type TrendSignificance = 'SIGNIFICANT' | 'MODERATE' | 'MINIMAL' | 'NONE';

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
export interface UseBedOccupancyReturn {
  occupancy: BedOccupancy[];
  stats: OccupancyStats | null;
  alerts: CapacityAlert[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  updateBedStatus: (bedId: string, status: BedOccupancyStatus, notes?: string) => Promise<void>;
  createReservation: (data: Omit<BedReservation, 'id' | 'created_at'>) => Promise<BedReservation>;
  cancelReservation: (reservationId: string, reason: string) => Promise<void>;
  getOccupancyStats: (filters?: OccupancyFilters) => Promise<OccupancyStats>;
  getForecast: (days: number) => Promise<OccupancyForecast[]>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  generateReport: (type: OccupancyReportType, filters?: OccupancyFilters) => Promise<OccupancyReport>;
  refetch: () => void;
}

export interface UseOccupancyAnalyticsReturn {
  metrics: PerformanceMetrics | null;
  trends: TrendAnalysis[];
  forecasts: OccupancyForecast[];
  isLoading: boolean;
  error: string | null;
  getTrendAnalysis: (metric: string, period: string) => Promise<TrendAnalysis>;
  getPerformanceMetrics: (period: string) => Promise<PerformanceMetrics>;
  getCapacityForecast: (days: number) => Promise<OccupancyForecast[]>;
  refetch: () => void;
}

export interface UseOccupancyReportsReturn {
  reports: OccupancyReport[];
  isLoading: boolean;
  error: string | null;
  generateReport: (type: OccupancyReportType, filters?: OccupancyFilters) => Promise<OccupancyReport>;
  getReport: (id: string) => Promise<OccupancyReport>;
  deleteReport: (id: string) => Promise<void>;
  scheduleReport: (type: OccupancyReportType, schedule: string, filters?: OccupancyFilters) => Promise<void>;
  refetch: () => void;
}