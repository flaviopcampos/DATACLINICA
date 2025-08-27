// Serviço de KPIs (Key Performance Indicators)

import api from '@/lib/api';
import type {
  KPI,
  KPIHistory,
  KPITarget,
  KPIAlert,
  KPIDashboard,
  KPIFilter,
  KPIAnalysis,
  KPIPerformance,
  KPITrendAnalysis,
  KPIBenchmark,
  KPIRecommendation,
  KPIRiskAssessment,
  ClinicalKPIs,
  FinancialKPIs,
  OperationalKPIs,
  StaffKPIs,
  KPICategory,
  KPIType,
  KPIStatus,
  TrendDirection,
  ComparisonPeriod,
  BenchmarkType,
  RiskLevel
} from '@/types/bi/kpis';

export interface KPIListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: KPICategory;
  type?: KPIType;
  status?: KPIStatus;
  departmentId?: string;
  ownerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'name' | 'value' | 'performance' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
}

export interface KPICreateData {
  name: string;
  description?: string;
  category: KPICategory;
  type: KPIType;
  unit: string;
  formula?: string;
  dataSource: string;
  refreshInterval: number;
  thresholds: {
    excellent: number;
    good: number;
    warning: number;
    critical: number;
  };
  targets?: Omit<KPITarget, 'id' | 'createdAt' | 'updatedAt'>[];
  alerts?: Omit<KPIAlert, 'id' | 'createdAt' | 'updatedAt'>[];
  weight?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  isActive?: boolean;
}

export interface KPIUpdateData extends Partial<KPICreateData> {}

export interface KPICalculationParams {
  kpiId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters?: Record<string, any>;
  groupBy?: string[];
}

export interface KPIBenchmarkParams {
  kpiId: string;
  benchmarkType: BenchmarkType;
  dateRange: {
    start: Date;
    end: Date;
  };
  comparisonPeriod?: ComparisonPeriod;
}

export interface KPIPerformanceParams {
  kpiIds: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  includeTargets?: boolean;
  includeBenchmarks?: boolean;
  includeForecasts?: boolean;
}

export interface KPIRecommendationParams {
  kpiId: string;
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
  includeActionItems?: boolean;
  includeRiskAssessment?: boolean;
}

class KPIService {
  private baseUrl = '/api/bi/kpis';

  // KPI CRUD
  async getKPIs(params: KPIListParams = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'dateRange' && typeof value === 'object') {
          searchParams.append('startDate', value.start.toISOString());
          searchParams.append('endDate', value.end.toISOString());
        } else if (!Array.isArray(value)) {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`${this.baseUrl}?${searchParams}`);
    return response.data;
  }

  async getKPI(id: string) {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data as KPI;
  }

  async createKPI(data: KPICreateData) {
    const response = await api.post(this.baseUrl, data);
    return response.data as KPI;
  }

  async updateKPI(id: string, data: KPIUpdateData) {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data as KPI;
  }

  async deleteKPI(id: string) {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async duplicateKPI(id: string, name?: string) {
    const response = await api.post(`${this.baseUrl}/${id}/duplicate`, {
      name: name || `Copy of KPI`
    });
    return response.data as KPI;
  }

  async activateKPI(id: string) {
    const response = await api.post(`${this.baseUrl}/${id}/activate`);
    return response.data as KPI;
  }

  async deactivateKPI(id: string) {
    const response = await api.post(`${this.baseUrl}/${id}/deactivate`);
    return response.data as KPI;
  }

  // KPI Calculation and Values
  async calculateKPI(params: KPICalculationParams) {
    const response = await api.post(`${this.baseUrl}/${params.kpiId}/calculate`, {
      dateRange: params.dateRange,
      granularity: params.granularity,
      filters: params.filters,
      groupBy: params.groupBy
    });
    return response.data;
  }

  async recalculateKPI(id: string, dateRange?: { start: Date; end: Date }) {
    const response = await api.post(`${this.baseUrl}/${id}/recalculate`, {
      dateRange
    });
    return response.data;
  }

  async getKPIValue(id: string, date?: Date) {
    const params = date ? `?date=${date.toISOString()}` : '';
    const response = await api.get(`${this.baseUrl}/${id}/value${params}`);
    return response.data;
  }

  async getKPIHistory(id: string, dateRange: { start: Date; end: Date }, granularity = 'day') {
    const response = await api.get(`${this.baseUrl}/${id}/history`, {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        granularity
      }
    });
    return response.data as KPIHistory[];
  }

  async getKPISnapshot(id: string) {
    const response = await api.get(`${this.baseUrl}/${id}/snapshot`);
    return response.data;
  }

  // Targets and Thresholds
  async setTarget(kpiId: string, target: Omit<KPITarget, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post(`${this.baseUrl}/${kpiId}/targets`, target);
    return response.data as KPITarget;
  }

  async updateTarget(kpiId: string, targetId: string, data: Partial<KPITarget>) {
    const response = await api.put(`${this.baseUrl}/${kpiId}/targets/${targetId}`, data);
    return response.data as KPITarget;
  }

  async deleteTarget(kpiId: string, targetId: string) {
    await api.delete(`${this.baseUrl}/${kpiId}/targets/${targetId}`);
  }

  async getTargetProgress(kpiId: string, targetId: string) {
    const response = await api.get(`${this.baseUrl}/${kpiId}/targets/${targetId}/progress`);
    return response.data;
  }

  async updateThresholds(kpiId: string, thresholds: KPI['thresholds']) {
    const response = await api.put(`${this.baseUrl}/${kpiId}/thresholds`, thresholds);
    return response.data as KPI;
  }

  // Alerts and Notifications
  async createAlert(kpiId: string, alert: Omit<KPIAlert, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post(`${this.baseUrl}/${kpiId}/alerts`, alert);
    return response.data as KPIAlert;
  }

  async updateAlert(kpiId: string, alertId: string, data: Partial<KPIAlert>) {
    const response = await api.put(`${this.baseUrl}/${kpiId}/alerts/${alertId}`, data);
    return response.data as KPIAlert;
  }

  async deleteAlert(kpiId: string, alertId: string) {
    await api.delete(`${this.baseUrl}/${kpiId}/alerts/${alertId}`);
  }

  async getActiveAlerts(kpiId?: string) {
    const url = kpiId ? `${this.baseUrl}/${kpiId}/alerts/active` : `${this.baseUrl}/alerts/active`;
    const response = await api.get(url);
    return response.data as KPIAlert[];
  }

  async acknowledgeAlert(kpiId: string, alertId: string) {
    const response = await api.post(`${this.baseUrl}/${kpiId}/alerts/${alertId}/acknowledge`);
    return response.data;
  }

  async snoozeAlert(kpiId: string, alertId: string, duration: number) {
    const response = await api.post(`${this.baseUrl}/${kpiId}/alerts/${alertId}/snooze`, {
      duration
    });
    return response.data;
  }

  // Performance Analysis
  async analyzeKPI(id: string, analysisDepth: 'basic' | 'detailed' | 'comprehensive' = 'basic') {
    const response = await api.post(`${this.baseUrl}/${id}/analyze`, {
      analysisDepth
    });
    return response.data as KPIAnalysis;
  }

  async getKPIPerformance(params: KPIPerformanceParams) {
    const response = await api.post(`${this.baseUrl}/performance`, params);
    return response.data as KPIPerformance;
  }

  async getTrendAnalysis(id: string, dateRange: { start: Date; end: Date }) {
    const response = await api.post(`${this.baseUrl}/${id}/trend`, {
      dateRange
    });
    return response.data as KPITrendAnalysis;
  }

  async getCorrelationAnalysis(kpiIds: string[], dateRange: { start: Date; end: Date }) {
    const response = await api.post(`${this.baseUrl}/correlation`, {
      kpiIds,
      dateRange
    });
    return response.data;
  }

  // Benchmarking
  async getBenchmark(params: KPIBenchmarkParams) {
    const response = await api.post(`${this.baseUrl}/${params.kpiId}/benchmark`, {
      benchmarkType: params.benchmarkType,
      dateRange: params.dateRange,
      comparisonPeriod: params.comparisonPeriod
    });
    return response.data as KPIBenchmark;
  }

  async getIndustryBenchmarks(category: KPICategory) {
    const response = await api.get(`${this.baseUrl}/benchmarks/industry/${category}`);
    return response.data;
  }

  async getPeerBenchmarks(kpiId: string) {
    const response = await api.get(`${this.baseUrl}/${kpiId}/benchmarks/peer`);
    return response.data;
  }

  // Recommendations and Insights
  async getRecommendations(params: KPIRecommendationParams) {
    const response = await api.post(`${this.baseUrl}/${params.kpiId}/recommendations`, {
      analysisDepth: params.analysisDepth,
      includeActionItems: params.includeActionItems,
      includeRiskAssessment: params.includeRiskAssessment
    });
    return response.data as KPIRecommendation[];
  }

  async getRiskAssessment(kpiId: string) {
    const response = await api.get(`${this.baseUrl}/${kpiId}/risk-assessment`);
    return response.data as KPIRiskAssessment;
  }

  async getActionItems(kpiId: string, status?: 'pending' | 'in_progress' | 'completed') {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`${this.baseUrl}/${kpiId}/action-items${params}`);
    return response.data;
  }

  async updateActionItem(kpiId: string, actionItemId: string, data: any) {
    const response = await api.put(`${this.baseUrl}/${kpiId}/action-items/${actionItemId}`, data);
    return response.data;
  }

  // Dashboards
  async getKPIDashboards() {
    const response = await api.get(`${this.baseUrl}/dashboards`);
    return response.data as KPIDashboard[];
  }

  async createKPIDashboard(dashboard: Omit<KPIDashboard, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post(`${this.baseUrl}/dashboards`, dashboard);
    return response.data as KPIDashboard;
  }

  async updateKPIDashboard(id: string, data: Partial<KPIDashboard>) {
    const response = await api.put(`${this.baseUrl}/dashboards/${id}`, data);
    return response.data as KPIDashboard;
  }

  async deleteKPIDashboard(id: string) {
    await api.delete(`${this.baseUrl}/dashboards/${id}`);
  }

  // Specialized KPIs
  async getClinicalKPIs(dateRange?: { start: Date; end: Date }) {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};
    
    const response = await api.get(`${this.baseUrl}/clinical`, { params });
    return response.data as ClinicalKPIs;
  }

  async getFinancialKPIs(dateRange?: { start: Date; end: Date }) {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};
    
    const response = await api.get(`${this.baseUrl}/financial`, { params });
    return response.data as FinancialKPIs;
  }

  async getOperationalKPIs(dateRange?: { start: Date; end: Date }) {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};
    
    const response = await api.get(`${this.baseUrl}/operational`, { params });
    return response.data as OperationalKPIs;
  }

  async getStaffKPIs(dateRange?: { start: Date; end: Date }) {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};
    
    const response = await api.get(`${this.baseUrl}/staff`, { params });
    return response.data as StaffKPIs;
  }

  // Scorecard and Summary
  async getKPIScorecard(kpiIds: string[], dateRange: { start: Date; end: Date }) {
    const response = await api.post(`${this.baseUrl}/scorecard`, {
      kpiIds,
      dateRange
    });
    return response.data;
  }

  async getExecutiveSummary(dateRange: { start: Date; end: Date }) {
    const response = await api.get(`${this.baseUrl}/executive-summary`, {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      }
    });
    return response.data;
  }

  async getDepartmentSummary(departmentId: string, dateRange: { start: Date; end: Date }) {
    const response = await api.get(`${this.baseUrl}/department-summary/${departmentId}`, {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      }
    });
    return response.data;
  }

  // Real-time KPIs
  async getRealTimeKPIs(kpiIds: string[]) {
    const response = await api.post(`${this.baseUrl}/real-time`, { kpiIds });
    return response.data;
  }

  async subscribeToKPIUpdates(kpiId: string, callback: (data: any) => void) {
    // Implementação WebSocket ou Server-Sent Events
    // Por enquanto, retorna uma função de cleanup mock
    return () => {
      console.log(`Unsubscribed from KPI ${kpiId} updates`);
    };
  }

  // Export and Import
  async exportKPIs(kpiIds: string[], format: 'csv' | 'excel' | 'pdf' | 'json' = 'csv') {
    const response = await api.post(`${this.baseUrl}/export`, {
      kpiIds,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportKPIReport(kpiId: string, dateRange: { start: Date; end: Date }, format: 'pdf' | 'excel' = 'pdf') {
    const response = await api.post(`${this.baseUrl}/${kpiId}/export-report`, {
      dateRange,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  async importKPIs(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Utility Methods
  getKPIStatus(kpi: KPI, currentValue: number): KPIStatus {
    const { thresholds } = kpi;
    
    if (currentValue >= thresholds.excellent) return 'excellent';
    if (currentValue >= thresholds.good) return 'good';
    if (currentValue >= thresholds.warning) return 'warning';
    return 'critical';
  }

  getKPIColor(status: KPIStatus): string {
    const colors = {
      excellent: '#10B981', // green
      good: '#3B82F6',      // blue
      warning: '#F59E0B',   // yellow
      critical: '#EF4444',  // red
      inactive: '#6B7280'   // gray
    };
    return colors[status] || colors.inactive;
  }

  formatKPIValue(value: number, unit: string, precision = 2): string {
    const formattedValue = value.toFixed(precision);
    
    switch (unit) {
      case 'percentage':
        return `${formattedValue}%`;
      case 'currency':
        return `R$ ${formattedValue}`;
      case 'count':
        return Math.round(value).toString();
      case 'time':
        return `${formattedValue}h`;
      case 'rate':
        return `${formattedValue}/min`;
      case 'ratio':
        return `${formattedValue}:1`;
      default:
        return `${formattedValue} ${unit}`;
    }
  }

  calculateKPIScore(kpis: KPI[], values: Record<string, number>): number {
    let totalWeight = 0;
    let weightedScore = 0;
    
    kpis.forEach(kpi => {
      const value = values[kpi.id];
      if (value !== undefined) {
        const weight = kpi.weight || 1;
        const status = this.getKPIStatus(kpi, value);
        const score = this.getStatusScore(status);
        
        totalWeight += weight;
        weightedScore += score * weight;
      }
    });
    
    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  private getStatusScore(status: KPIStatus): number {
    const scores = {
      excellent: 100,
      good: 80,
      warning: 60,
      critical: 40,
      inactive: 0
    };
    return scores[status] || 0;
  }

  getTrendDirection(current: number, previous: number): TrendDirection {
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 1) return 'stable';
    return change > 0 ? 'up' : 'down';
  }

  getRiskLevel(kpi: KPI, currentValue: number): RiskLevel {
    const status = this.getKPIStatus(kpi, currentValue);
    
    switch (status) {
      case 'critical':
        return 'high';
      case 'warning':
        return 'medium';
      case 'good':
      case 'excellent':
        return 'low';
      default:
        return 'medium';
    }
  }

  generateKPIId(): string {
    return `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateKPIConfig(kpi: Partial<KPI>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!kpi.name || kpi.name.trim().length === 0) {
      errors.push('Nome do KPI é obrigatório');
    }

    if (!kpi.category) {
      errors.push('Categoria do KPI é obrigatória');
    }

    if (!kpi.type) {
      errors.push('Tipo do KPI é obrigatório');
    }

    if (!kpi.unit || kpi.unit.trim().length === 0) {
      errors.push('Unidade do KPI é obrigatória');
    }

    if (!kpi.dataSource || kpi.dataSource.trim().length === 0) {
      errors.push('Fonte de dados é obrigatória');
    }

    if (!kpi.thresholds) {
      errors.push('Thresholds são obrigatórios');
    } else {
      const { excellent, good, warning, critical } = kpi.thresholds;
      if (excellent <= good || good <= warning || warning <= critical) {
        errors.push('Thresholds devem estar em ordem decrescente: excellent > good > warning > critical');
      }
    }

    if (kpi.refreshInterval && kpi.refreshInterval < 60) {
      errors.push('Intervalo de atualização deve ser pelo menos 60 segundos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const kpiService = new KPIService();
export default kpiService;