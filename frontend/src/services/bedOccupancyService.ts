import { api } from './api';
import {
  BedOccupancy,
  OccupancyStats,
  OccupancyForecast,
  OccupancyReport,
  OccupancyFilters,
  OccupancySearchForm,
  OccupancySettings,
  PerformanceMetrics,
  TrendAnalysis,
  ApiResponse,
  PaginatedResponse
} from '../types/bedOccupancy';

// Serviço de Ocupação de Leitos
export class BedOccupancyService {
  private static baseUrl = '/bed-occupancy';

  // ============================================================================
  // DADOS DE OCUPAÇÃO ATUAL
  // ============================================================================

  static async getCurrentOccupancy(filters?: OccupancyFilters): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/current`, { params: filters });
    return response.data;
  }

  static async getOccupancyByDepartment(departmentId: string): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/department/${departmentId}`);
    return response.data;
  }

  static async getOccupancyByBedType(bedType: string): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/bed-type/${bedType}`);
    return response.data;
  }

  static async getOccupancyByFloor(floor: number): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/floor/${floor}`);
    return response.data;
  }

  static async getBedOccupancyDetails(bedId: string): Promise<ApiResponse<BedOccupancy>> {
    const response = await api.get(`${this.baseUrl}/bed/${bedId}`);
    return response.data;
  }

  // ============================================================================
  // BUSCA E FILTROS
  // ============================================================================

  static async searchOccupancy(searchForm: OccupancySearchForm): Promise<PaginatedResponse<BedOccupancy>> {
    const response = await api.post(`${this.baseUrl}/search`, searchForm);
    return response.data;
  }

  static async getAvailableBeds(filters?: {
    department_id?: string;
    bed_type?: string;
    floor?: number;
    min_capacity?: number;
    required_equipment?: string[];
  }): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/available`, { params: filters });
    return response.data;
  }

  static async getOccupiedBeds(filters?: {
    department_id?: string;
    bed_type?: string;
    admission_type?: string;
    patient_condition?: string;
  }): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/occupied`, { params: filters });
    return response.data;
  }

  static async getBedsUnderMaintenance(): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/maintenance`);
    return response.data;
  }

  static async getBedsBeingCleaned(): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/cleaning`);
    return response.data;
  }

  static async getReservedBeds(): Promise<ApiResponse<BedOccupancy[]>> {
    const response = await api.get(`${this.baseUrl}/reserved`);
    return response.data;
  }

  // ============================================================================
  // ESTATÍSTICAS DE OCUPAÇÃO
  // ============================================================================

  static async getOccupancyStats(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    bed_type?: string;
  }): Promise<ApiResponse<OccupancyStats>> {
    const response = await api.get(`${this.baseUrl}/stats`, { params: filters });
    return response.data;
  }

  static async getDepartmentOccupancyStats(departmentId?: string): Promise<ApiResponse<{
    department_id: string;
    department_name: string;
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
    maintenance_beds: number;
    cleaning_beds: number;
    reserved_beds: number;
    occupancy_rate: number;
    average_length_of_stay: number;
    turnover_rate: number;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/stats/departments`, {
      params: departmentId ? { department_id: departmentId } : {}
    });
    return response.data;
  }

  static async getBedTypeOccupancyStats(): Promise<ApiResponse<{
    bed_type: string;
    total_beds: number;
    occupied_beds: number;
    occupancy_rate: number;
    average_daily_rate: number;
    revenue_per_bed: number;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/stats/bed-types`);
    return response.data;
  }

  static async getHourlyOccupancyStats(date?: string): Promise<ApiResponse<{
    hour: number;
    occupied_beds: number;
    available_beds: number;
    occupancy_rate: number;
    admissions: number;
    discharges: number;
    transfers_in: number;
    transfers_out: number;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/stats/hourly`, {
      params: date ? { date } : {}
    });
    return response.data;
  }

  static async getDailyOccupancyStats(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
  }): Promise<ApiResponse<{
    date: string;
    total_beds: number;
    occupied_beds: number;
    occupancy_rate: number;
    admissions: number;
    discharges: number;
    transfers: number;
    average_length_of_stay: number;
    revenue: number;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/stats/daily`, { params: filters });
    return response.data;
  }

  // ============================================================================
  // PREVISÕES E ANÁLISES
  // ============================================================================

  static async getOccupancyForecast(days: number = 7): Promise<ApiResponse<OccupancyForecast>> {
    const response = await api.get(`${this.baseUrl}/forecast`, {
      params: { days }
    });
    return response.data;
  }

  static async getDepartmentForecast(
    departmentId: string,
    days: number = 7
  ): Promise<ApiResponse<{
    department_id: string;
    forecasts: {
      date: string;
      predicted_occupancy_rate: number;
      predicted_available_beds: number;
      confidence_level: number;
      capacity_alerts: string[];
    }[];
  }>> {
    const response = await api.get(`${this.baseUrl}/forecast/department/${departmentId}`, {
      params: { days }
    });
    return response.data;
  }

  static async getTrendAnalysis(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    analysis_type?: 'OCCUPANCY' | 'REVENUE' | 'EFFICIENCY' | 'PATIENT_FLOW';
  }): Promise<ApiResponse<TrendAnalysis>> {
    const response = await api.get(`${this.baseUrl}/trends`, { params: filters });
    return response.data;
  }

  static async getSeasonalPatterns(year?: number): Promise<ApiResponse<{
    month: number;
    month_name: string;
    average_occupancy_rate: number;
    peak_occupancy_rate: number;
    lowest_occupancy_rate: number;
    total_admissions: number;
    average_length_of_stay: number;
    seasonal_factors: string[];
  }[]>> {
    const response = await api.get(`${this.baseUrl}/seasonal-patterns`, {
      params: year ? { year } : {}
    });
    return response.data;
  }

  // ============================================================================
  // ALERTAS E NOTIFICAÇÕES
  // ============================================================================

  static async getCapacityAlerts(): Promise<ApiResponse<{
    alert_id: string;
    alert_type: 'HIGH_OCCUPANCY' | 'LOW_AVAILABILITY' | 'CRITICAL_CAPACITY' | 'MAINTENANCE_OVERDUE';
    department_id: string;
    department_name: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    current_occupancy_rate: number;
    threshold: number;
    created_at: string;
    acknowledged: boolean;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/alerts`);
    return response.data;
  }

  static async acknowledgeAlert(alertId: string): Promise<ApiResponse<void>> {
    const response = await api.patch(`${this.baseUrl}/alerts/${alertId}/acknowledge`);
    return response.data;
  }

  static async getOccupancyThresholds(): Promise<ApiResponse<{
    department_id: string;
    department_name: string;
    high_occupancy_threshold: number;
    critical_occupancy_threshold: number;
    low_availability_threshold: number;
    alert_enabled: boolean;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/thresholds`);
    return response.data;
  }

  static async updateOccupancyThresholds(
    departmentId: string,
    thresholds: {
      high_occupancy_threshold?: number;
      critical_occupancy_threshold?: number;
      low_availability_threshold?: number;
      alert_enabled?: boolean;
    }
  ): Promise<ApiResponse<void>> {
    const response = await api.put(`${this.baseUrl}/thresholds/${departmentId}`, thresholds);
    return response.data;
  }

  // ============================================================================
  // HISTÓRICO DE OCUPAÇÃO
  // ============================================================================

  static async getOccupancyHistory(
    bedId: string,
    filters?: {
      start_date?: string;
      end_date?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<{
    bed_id: string;
    history: {
      period_start: string;
      period_end: string;
      patient_id?: string;
      patient_name?: string;
      admission_id?: string;
      status: string;
      duration_hours: number;
      notes?: string;
    }[];
  }>> {
    const response = await api.get(`${this.baseUrl}/history/bed/${bedId}`, { params: filters });
    return response.data;
  }

  static async getDepartmentOccupancyHistory(
    departmentId: string,
    filters?: {
      start_date?: string;
      end_date?: string;
      granularity?: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    }
  ): Promise<ApiResponse<{
    department_id: string;
    history: {
      period: string;
      total_beds: number;
      occupied_beds: number;
      occupancy_rate: number;
      admissions: number;
      discharges: number;
      transfers_in: number;
      transfers_out: number;
    }[];
  }>> {
    const response = await api.get(`${this.baseUrl}/history/department/${departmentId}`, { params: filters });
    return response.data;
  }

  // ============================================================================
  // MÉTRICAS DE PERFORMANCE
  // ============================================================================

  static async getPerformanceMetrics(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
  }): Promise<ApiResponse<PerformanceMetrics>> {
    const response = await api.get(`${this.baseUrl}/performance`, { params: filters });
    return response.data;
  }

  static async getBedTurnoverMetrics(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    bed_type?: string;
  }): Promise<ApiResponse<{
    total_turnovers: number;
    average_turnover_time: number;
    fastest_turnover_time: number;
    slowest_turnover_time: number;
    turnover_efficiency_rate: number;
    bed_utilization_rate: number;
    cleaning_time_average: number;
    maintenance_time_average: number;
  }>> {
    const response = await api.get(`${this.baseUrl}/turnover-metrics`, { params: filters });
    return response.data;
  }

  static async getRevenuePerBed(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    bed_type?: string;
  }): Promise<ApiResponse<{
    bed_id: string;
    bed_number: string;
    department_name: string;
    bed_type: string;
    total_revenue: number;
    occupied_days: number;
    revenue_per_day: number;
    occupancy_rate: number;
    utilization_efficiency: number;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/revenue-per-bed`, { params: filters });
    return response.data;
  }

  // ============================================================================
  // RELATÓRIOS
  // ============================================================================

  static async generateOccupancyReport(
    reportType: 'SUMMARY' | 'DETAILED' | 'TRENDS' | 'FORECAST' | 'PERFORMANCE',
    filters?: {
      start_date?: string;
      end_date?: string;
      department_id?: string;
      bed_type?: string;
      include_charts?: boolean;
    }
  ): Promise<ApiResponse<OccupancyReport>> {
    const response = await api.post(`${this.baseUrl}/reports`, {
      report_type: reportType,
      filters
    });
    return response.data;
  }

  static async exportOccupancyReport(
    reportId: string,
    format: 'PDF' | 'EXCEL' | 'CSV'
  ): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  static async getScheduledReports(): Promise<ApiResponse<{
    report_id: string;
    report_name: string;
    report_type: string;
    schedule: string;
    recipients: string[];
    last_generated: string;
    next_generation: string;
    active: boolean;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/reports/scheduled`);
    return response.data;
  }

  // ============================================================================
  // CONFIGURAÇÕES
  // ============================================================================

  static async getOccupancySettings(): Promise<ApiResponse<OccupancySettings>> {
    const response = await api.get(`${this.baseUrl}/settings`);
    return response.data;
  }

  static async updateOccupancySettings(
    settings: Partial<OccupancySettings>
  ): Promise<ApiResponse<OccupancySettings>> {
    const response = await api.put(`${this.baseUrl}/settings`, settings);
    return response.data;
  }

  static async resetOccupancySettings(): Promise<ApiResponse<OccupancySettings>> {
    const response = await api.post(`${this.baseUrl}/settings/reset`);
    return response.data;
  }

  // ============================================================================
  // RESERVAS E BLOQUEIOS
  // ============================================================================

  static async createBedReservation(data: {
    bed_id: string;
    patient_id?: string;
    reservation_start: string;
    reservation_end: string;
    reservation_type: 'ADMISSION' | 'TRANSFER' | 'MAINTENANCE' | 'CLEANING';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    notes?: string;
  }): Promise<ApiResponse<{
    reservation_id: string;
    expires_at: string;
  }>> {
    const response = await api.post(`${this.baseUrl}/reservations`, data);
    return response.data;
  }

  static async getBedReservations(bedId?: string): Promise<ApiResponse<{
    reservation_id: string;
    bed_id: string;
    bed_number: string;
    patient_id?: string;
    patient_name?: string;
    reservation_start: string;
    reservation_end: string;
    reservation_type: string;
    priority: string;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FULFILLED';
    created_by: string;
    created_at: string;
    notes?: string;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/reservations`, {
      params: bedId ? { bed_id: bedId } : {}
    });
    return response.data;
  }

  static async cancelBedReservation(reservationId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/reservations/${reservationId}`);
    return response.data;
  }

  static async extendBedReservation(
    reservationId: string,
    newEndTime: string
  ): Promise<ApiResponse<void>> {
    const response = await api.patch(`${this.baseUrl}/reservations/${reservationId}/extend`, {
      new_end_time: newEndTime
    });
    return response.data;
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  static async getOccupancySummary(): Promise<ApiResponse<{
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
    maintenance_beds: number;
    cleaning_beds: number;
    reserved_beds: number;
    overall_occupancy_rate: number;
    departments: {
      department_id: string;
      department_name: string;
      occupancy_rate: number;
      available_beds: number;
      status: 'NORMAL' | 'HIGH' | 'CRITICAL';
    }[];
    recent_activities: {
      activity_type: 'ADMISSION' | 'DISCHARGE' | 'TRANSFER' | 'MAINTENANCE';
      bed_number: string;
      department_name: string;
      timestamp: string;
      description: string;
    }[];
  }>> {
    const response = await api.get(`${this.baseUrl}/summary`);
    return response.data;
  }

  static async refreshOccupancyData(): Promise<ApiResponse<void>> {
    const response = await api.post(`${this.baseUrl}/refresh`);
    return response.data;
  }

  static async validateOccupancyData(): Promise<ApiResponse<{
    valid: boolean;
    inconsistencies: {
      bed_id: string;
      issue_type: string;
      description: string;
      suggested_fix: string;
    }[];
  }>> {
    const response = await api.post(`${this.baseUrl}/validate`);
    return response.data;
  }
}

export default BedOccupancyService;