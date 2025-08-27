// Serviço de Métricas e KPIs

import api from '@/lib/api';
import type {
  Metric,
  MetricHistory,
  MetricComparison,
  MetricTarget,
  MetricAlert,
  MetricDashboard,
  MetricFilter,
  MetricAnalysis,
  MetricStatistics,
  TrendAnalysis,
  Anomaly,
  Forecast,
  ClinicalMetrics,
  FinancialMetrics,
  OperationalMetrics,
  MetricCategory,
  MetricType,
  ComparisonPeriod,
  TrendDirection,
  AnalysisPeriod
} from '@/types/bi/metrics';

export interface MetricListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: MetricCategory;
  type?: MetricType;
  departmentId?: string;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'name' | 'value' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
}

export interface MetricCreateData {
  name: string;
  description?: string;
  category: MetricCategory;
  type: MetricType;
  unit: string;
  formula?: string;
  dataSource: string;
  refreshInterval: number;
  targets?: MetricTarget[];
  alerts?: Omit<MetricAlert, 'id' | 'createdAt' | 'updatedAt'>[];
  tags?: string[];
  isActive?: boolean;
}

export interface MetricUpdateData extends Partial<MetricCreateData> {}

export interface MetricCalculationParams {
  metricId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters?: Record<string, any>;
  groupBy?: string[];
}

export interface BulkMetricCalculationParams {
  metricIds: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters?: Record<string, any>;
}

export interface MetricComparisonParams {
  metricId: string;
  basePeriod: {
    start: Date;
    end: Date;
  };
  comparisonPeriod: {
    start: Date;
    end: Date;
  };
  comparisonType: ComparisonPeriod;
}

export interface TrendAnalysisParams {
  metricId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  analysisPeriod: AnalysisPeriod;
  includeSeasonality?: boolean;
  includeCycles?: boolean;
}

export interface AnomalyDetectionParams {
  metricId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  sensitivity?: 'low' | 'medium' | 'high';
  algorithm?: 'statistical' | 'ml' | 'hybrid';
}

export interface ForecastParams {
  metricId: string;
  historicalPeriod: {
    start: Date;
    end: Date;
  };
  forecastPeriod: number; // dias
  confidence?: number; // 0.8, 0.9, 0.95
  includeSeasonality?: boolean;
  includeExternalFactors?: boolean;
}

class MetricsService {
  private baseUrl = '/api/bi/metrics';

  // Metric CRUD
  async getMetrics(params: MetricListParams = {}) {
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

  async getMetric(id: string) {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data as Metric;
  }

  async createMetric(data: MetricCreateData) {
    const response = await api.post(this.baseUrl, data);
    return response.data as Metric;
  }

  async updateMetric(id: string, data: MetricUpdateData) {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data as Metric;
  }

  async deleteMetric(id: string) {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async duplicateMetric(id: string, name?: string) {
    const response = await api.post(`${this.baseUrl}/${id}/duplicate`, {
      name: name || `Copy of Metric`
    });
    return response.data as Metric;
  }

  // Metric Calculation
  async calculateMetric(params: MetricCalculationParams) {
    const response = await api.post(`${this.baseUrl}/${params.metricId}/calculate`, {
      dateRange: params.dateRange,
      granularity: params.granularity,
      filters: params.filters,
      groupBy: params.groupBy
    });
    return response.data;
  }

  async calculateMultipleMetrics(params: BulkMetricCalculationParams) {
    const response = await api.post(`${this.baseUrl}/calculate-bulk`, params);
    return response.data;
  }

  async recalculateMetric(id: string, dateRange?: { start: Date; end: Date }) {
    const response = await api.post(`${this.baseUrl}/${id}/recalculate`, {
      dateRange
    });
    return response.data;
  }

  async getMetricValue(id: string, date?: Date) {
    const params = date ? `?date=${date.toISOString()}` : '';
    const response = await api.get(`${this.baseUrl}/${id}/value${params}`);
    return response.data;
  }

  async getMetricHistory(id: string, dateRange: { start: Date; end: Date }, granularity = 'day') {
    const response = await api.get(`${this.baseUrl}/${id}/history`, {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        granularity
      }
    });
    return response.data as MetricHistory[];
  }

  // Comparisons
  async compareMetric(params: MetricComparisonParams) {
    const response = await api.post(`${this.baseUrl}/${params.metricId}/compare`, {
      basePeriod: params.basePeriod,
      comparisonPeriod: params.comparisonPeriod,
      comparisonType: params.comparisonType
    });
    return response.data as MetricComparison;
  }

  async compareMultipleMetrics(metricIds: string[], dateRange: { start: Date; end: Date }) {
    const response = await api.post(`${this.baseUrl}/compare-multiple`, {
      metricIds,
      dateRange
    });
    return response.data;
  }

  async getBenchmarkComparison(id: string, benchmarkType: 'industry' | 'peer' | 'historical') {
    const response = await api.get(`${this.baseUrl}/${id}/benchmark/${benchmarkType}`);
    return response.data;
  }

  // Targets and Goals
  async setTarget(metricId: string, target: Omit<MetricTarget, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post(`${this.baseUrl}/${metricId}/targets`, target);
    return response.data as MetricTarget;
  }

  async updateTarget(metricId: string, targetId: string, data: Partial<MetricTarget>) {
    const response = await api.put(`${this.baseUrl}/${metricId}/targets/${targetId}`, data);
    return response.data as MetricTarget;
  }

  async deleteTarget(metricId: string, targetId: string) {
    await api.delete(`${this.baseUrl}/${metricId}/targets/${targetId}`);
  }

  async getTargetProgress(metricId: string, targetId: string) {
    const response = await api.get(`${this.baseUrl}/${metricId}/targets/${targetId}/progress`);
    return response.data;
  }

  // Alerts
  async createAlert(metricId: string, alert: Omit<MetricAlert, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post(`${this.baseUrl}/${metricId}/alerts`, alert);
    return response.data as MetricAlert;
  }

  async updateAlert(metricId: string, alertId: string, data: Partial<MetricAlert>) {
    const response = await api.put(`${this.baseUrl}/${metricId}/alerts/${alertId}`, data);
    return response.data as MetricAlert;
  }

  async deleteAlert(metricId: string, alertId: string) {
    await api.delete(`${this.baseUrl}/${metricId}/alerts/${alertId}`);
  }

  async getActiveAlerts(metricId?: string) {
    const url = metricId ? `${this.baseUrl}/${metricId}/alerts/active` : `${this.baseUrl}/alerts/active`;
    const response = await api.get(url);
    return response.data as MetricAlert[];
  }

  async acknowledgeAlert(metricId: string, alertId: string) {
    const response = await api.post(`${this.baseUrl}/${metricId}/alerts/${alertId}/acknowledge`);
    return response.data;
  }

  async snoozeAlert(metricId: string, alertId: string, duration: number) {
    const response = await api.post(`${this.baseUrl}/${metricId}/alerts/${alertId}/snooze`, {
      duration
    });
    return response.data;
  }

  // Analysis
  async analyzeMetric(id: string, analysisPeriod: AnalysisPeriod = 'last_30_days') {
    const response = await api.post(`${this.baseUrl}/${id}/analyze`, {
      analysisPeriod
    });
    return response.data as MetricAnalysis;
  }

  async getTrendAnalysis(params: TrendAnalysisParams) {
    const response = await api.post(`${this.baseUrl}/${params.metricId}/trend`, {
      dateRange: params.dateRange,
      analysisPeriod: params.analysisPeriod,
      includeSeasonality: params.includeSeasonality,
      includeCycles: params.includeCycles
    });
    return response.data as TrendAnalysis;
  }

  async getStatistics(id: string, dateRange: { start: Date; end: Date }) {
    const response = await api.get(`${this.baseUrl}/${id}/statistics`, {
      params: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      }
    });
    return response.data as MetricStatistics;
  }

  async detectAnomalies(params: AnomalyDetectionParams) {
    const response = await api.post(`${this.baseUrl}/${params.metricId}/anomalies`, {
      dateRange: params.dateRange,
      sensitivity: params.sensitivity,
      algorithm: params.algorithm
    });
    return response.data as Anomaly[];
  }

  async getForecast(params: ForecastParams) {
    const response = await api.post(`${this.baseUrl}/${params.metricId}/forecast`, {
      historicalPeriod: params.historicalPeriod,
      forecastPeriod: params.forecastPeriod,
      confidence: params.confidence,
      includeSeasonality: params.includeSeasonality,
      includeExternalFactors: params.includeExternalFactors
    });
    return response.data as Forecast;
  }

  // Dashboards
  async getMetricDashboards() {
    const response = await api.get(`${this.baseUrl}/dashboards`);
    return response.data as MetricDashboard[];
  }

  async createMetricDashboard(dashboard: Omit<MetricDashboard, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post(`${this.baseUrl}/dashboards`, dashboard);
    return response.data as MetricDashboard;
  }

  async updateMetricDashboard(id: string, data: Partial<MetricDashboard>) {
    const response = await api.put(`${this.baseUrl}/dashboards/${id}`, data);
    return response.data as MetricDashboard;
  }

  async deleteMetricDashboard(id: string) {
    await api.delete(`${this.baseUrl}/dashboards/${id}`);
  }

  // Categories and Types
  async getCategories() {
    const response = await api.get(`${this.baseUrl}/categories`);
    return response.data;
  }

  async getMetricTypes(category?: MetricCategory) {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`${this.baseUrl}/types${params}`);
    return response.data;
  }

  // Data Sources
  async getAvailableDataSources() {
    const response = await api.get(`${this.baseUrl}/data-sources`);
    return response.data;
  }

  async validateFormula(formula: string, dataSource: string) {
    const response = await api.post(`${this.baseUrl}/validate-formula`, {
      formula,
      dataSource
    });
    return response.data;
  }

  async testMetricCalculation(metricConfig: Partial<Metric>) {
    const response = await api.post(`${this.baseUrl}/test-calculation`, metricConfig);
    return response.data;
  }

  // Specialized Metrics
  async getClinicalMetrics(dateRange?: { start: Date; end: Date }) {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};
    
    const response = await api.get(`${this.baseUrl}/clinical`, { params });
    return response.data as ClinicalMetrics;
  }

  async getFinancialMetrics(dateRange?: { start: Date; end: Date }) {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};
    
    const response = await api.get(`${this.baseUrl}/financial`, { params });
    return response.data as FinancialMetrics;
  }

  async getOperationalMetrics(dateRange?: { start: Date; end: Date }) {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};
    
    const response = await api.get(`${this.baseUrl}/operational`, { params });
    return response.data as OperationalMetrics;
  }

  // Real-time Metrics
  async getRealTimeMetrics(metricIds: string[]) {
    const response = await api.post(`${this.baseUrl}/real-time`, { metricIds });
    return response.data;
  }

  async subscribeToMetricUpdates(metricId: string, callback: (data: any) => void) {
    // Implementação WebSocket ou Server-Sent Events
    // Por enquanto, retorna uma função de cleanup mock
    return () => {
      console.log(`Unsubscribed from metric ${metricId} updates`);
    };
  }

  // Export and Import
  async exportMetrics(metricIds: string[], format: 'csv' | 'excel' | 'json' = 'csv') {
    const response = await api.post(`${this.baseUrl}/export`, {
      metricIds,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  async importMetrics(file: File) {
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
  formatMetricValue(value: number, unit: string, precision = 2): string {
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
      default:
        return `${formattedValue} ${unit}`;
    }
  }

  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  getTrendDirection(current: number, previous: number): TrendDirection {
    const change = this.calculatePercentageChange(current, previous);
    if (Math.abs(change) < 1) return 'stable';
    return change > 0 ? 'up' : 'down';
  }

  isMetricHealthy(metric: Metric, currentValue: number): boolean {
    if (!metric.targets || metric.targets.length === 0) return true;
    
    const activeTarget = metric.targets.find(t => 
      new Date() >= new Date(t.startDate) && 
      new Date() <= new Date(t.endDate)
    );
    
    if (!activeTarget) return true;
    
    switch (activeTarget.type) {
      case 'minimum':
        return currentValue >= activeTarget.value;
      case 'maximum':
        return currentValue <= activeTarget.value;
      case 'exact':
        return Math.abs(currentValue - activeTarget.value) <= (activeTarget.tolerance || 0);
      case 'range':
        return currentValue >= activeTarget.minValue! && currentValue <= activeTarget.maxValue!;
      default:
        return true;
    }
  }

  generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateMetricConfig(metric: Partial<Metric>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metric.name || metric.name.trim().length === 0) {
      errors.push('Nome da métrica é obrigatório');
    }

    if (!metric.category) {
      errors.push('Categoria da métrica é obrigatória');
    }

    if (!metric.type) {
      errors.push('Tipo da métrica é obrigatório');
    }

    if (!metric.unit || metric.unit.trim().length === 0) {
      errors.push('Unidade da métrica é obrigatória');
    }

    if (!metric.dataSource || metric.dataSource.trim().length === 0) {
      errors.push('Fonte de dados é obrigatória');
    }

    if (metric.refreshInterval && metric.refreshInterval < 60) {
      errors.push('Intervalo de atualização deve ser pelo menos 60 segundos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const metricsService = new MetricsService();
export default metricsService;