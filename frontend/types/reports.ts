export interface SavedReport {
  id: number;
  clinic_id: number;
  user_id: number;
  name: string;
  description?: string;
  report_type: 'administrative' | 'financial' | 'clinical' | 'bi';
  report_config: Record<string, any>;
  is_public: boolean;
  is_scheduled: boolean;
  schedule_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SavedReportCreate {
  name: string;
  description?: string;
  report_type: 'administrative' | 'financial' | 'clinical' | 'bi';
  report_config: Record<string, any>;
  is_public?: boolean;
  is_scheduled?: boolean;
  schedule_config?: Record<string, any>;
}

export interface SavedReportUpdate {
  name?: string;
  description?: string;
  report_type?: 'administrative' | 'financial' | 'clinical' | 'bi';
  report_config?: Record<string, any>;
  is_public?: boolean;
  is_scheduled?: boolean;
  schedule_config?: Record<string, any>;
}

export interface ReportExecution {
  id: number;
  saved_report_id: number;
  executed_by?: number;
  execution_date: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  file_path?: string;
  file_size?: number;
  execution_time_ms?: number;
  error_message?: string;
  parameters?: Record<string, any>;
}

export interface ReportExecutionCreate {
  saved_report_id: number;
  parameters?: Record<string, any>;
}

export interface CustomDashboard {
  id: number;
  clinic_id: number;
  user_id: number;
  name: string;
  description?: string;
  layout_config: Record<string, any>;
  is_default: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomDashboardCreate {
  name: string;
  description?: string;
  layout_config: Record<string, any>;
  is_default?: boolean;
  is_public?: boolean;
}

export interface CustomDashboardUpdate {
  name?: string;
  description?: string;
  layout_config?: Record<string, any>;
  is_default?: boolean;
  is_public?: boolean;
}

export interface DashboardWidget {
  id: number;
  dashboard_id: number;
  widget_type: 'chart' | 'kpi' | 'table' | 'gauge';
  title: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: Record<string, any>;
  data_source?: string;
  refresh_interval: number;
  is_active: boolean;
  created_at: string;
}

export interface DashboardWidgetCreate {
  dashboard_id: number;
  widget_type: 'chart' | 'kpi' | 'table' | 'gauge';
  title: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  config: Record<string, any>;
  data_source?: string;
  refresh_interval?: number;
  is_active?: boolean;
}

export interface DashboardWidgetUpdate {
  widget_type?: 'chart' | 'kpi' | 'table' | 'gauge';
  title?: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  config?: Record<string, any>;
  data_source?: string;
  refresh_interval?: number;
  is_active?: boolean;
}

export interface PerformanceMetric {
  id: number;
  clinic_id: number;
  metric_date: string;
  metric_type: 'daily' | 'weekly' | 'monthly';
  
  // Métricas de Atendimento
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  average_wait_time: number;
  average_consultation_time: number;
  
  // Métricas de Pacientes
  new_patients: number;
  returning_patients: number;
  total_active_patients: number;
  
  // Métricas Financeiras
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  accounts_receivable: number;
  accounts_payable: number;
  
  // Métricas por Convênio
  revenue_by_insurance?: Record<string, number>;
  procedures_by_insurance?: Record<string, number>;
  
  // Métricas por Especialidade
  revenue_by_specialty?: Record<string, number>;
  appointments_by_specialty?: Record<string, number>;
  
  // Métricas por Profissional
  revenue_by_doctor?: Record<string, number>;
  appointments_by_doctor?: Record<string, number>;
  
  created_at: string;
}

export interface PerformanceMetricCreate {
  metric_date: string;
  metric_type: 'daily' | 'weekly' | 'monthly';
  total_appointments?: number;
  completed_appointments?: number;
  cancelled_appointments?: number;
  no_show_appointments?: number;
  average_wait_time?: number;
  average_consultation_time?: number;
  new_patients?: number;
  returning_patients?: number;
  total_active_patients?: number;
  total_revenue?: number;
  total_expenses?: number;
  net_profit?: number;
  accounts_receivable?: number;
  accounts_payable?: number;
  revenue_by_insurance?: Record<string, number>;
  procedures_by_insurance?: Record<string, number>;
  revenue_by_specialty?: Record<string, number>;
  appointments_by_specialty?: Record<string, number>;
  revenue_by_doctor?: Record<string, number>;
  appointments_by_doctor?: Record<string, number>;
}

export interface BIAlert {
  id: number;
  clinic_id: number;
  alert_type: 'performance' | 'financial' | 'operational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric_value?: number;
  threshold_value?: number;
  comparison_operator?: '>' | '<' | '>=' | '<=' | '=' | '!=';
  is_active: boolean;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: number;
  created_at: string;
}

export interface BIAlertCreate {
  alert_type: 'performance' | 'financial' | 'operational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric_value?: number;
  threshold_value?: number;
  comparison_operator?: '>' | '<' | '>=' | '<=' | '=' | '!=';
  is_active?: boolean;
  is_resolved?: boolean;
}

export interface AlertConfiguration {
  id: number;
  clinic_id: number;
  user_id: number;
  alert_name: string;
  metric_type: string;
  threshold_value: number;
  comparison_operator: string;
  notification_method: 'dashboard' | 'email' | 'sms';
  is_active: boolean;
  created_at: string;
}

export interface AlertConfigurationCreate {
  alert_name: string;
  metric_type: string;
  threshold_value: number;
  comparison_operator: string;
  notification_method?: 'dashboard' | 'email' | 'sms';
  is_active?: boolean;
}

export interface ReportRequest {
  report_type: 'administrative' | 'financial' | 'clinical' | 'bi';
  start_date?: string;
  end_date?: string;
  filters?: Record<string, any>;
  format?: 'pdf' | 'excel' | 'csv';
  include_charts?: boolean;
}

export interface DashboardData {
  widgets: Record<string, any>[];
  last_updated: string;
  refresh_interval: number;
}

export interface KPIValue {
  name: string;
  value: number;
  previous_value?: number;
  change_percentage?: number;
  trend: 'up' | 'down' | 'stable';
  format_type: 'number' | 'currency' | 'percentage';
  unit?: string;
  description?: string;
}

// Tipos para filtros de relatórios
export interface ReportFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  reportType?: 'administrative' | 'financial' | 'clinical' | 'bi';
  department?: string;
  doctor?: string;
  specialty?: string;
  insurance?: string;
  status?: string;
}

// Tipos para configuração de gráficos
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options?: Record<string, any>;
}

// Tipos para exportação
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  filename?: string;
  includeCharts?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: ReportFilters;
}

// Tipos para relatórios financeiros específicos
export interface FinancialReport {
  period: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  revenue_by_category: Record<string, number>;
  expenses_by_category: Record<string, number>;
  monthly_trend: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
}

// Tipos para relatórios operacionais específicos
export interface OperationalReport {
  period: string;
  bed_occupancy_rate: number;
  average_length_of_stay: number;
  total_admissions: number;
  total_discharges: number;
  prescription_count: number;
  inventory_turnover: number;
  staff_utilization: Record<string, number>;
}

// Tipos para relatórios de pacientes específicos
export interface PatientReport {
  period: string;
  total_patients: number;
  new_patients: number;
  returning_patients: number;
  patient_satisfaction: number;
  demographics: {
    age_groups: Record<string, number>;
    gender_distribution: Record<string, number>;
    insurance_distribution: Record<string, number>;
  };
  top_diagnoses: {
    diagnosis: string;
    count: number;
    percentage: number;
  }[];
}