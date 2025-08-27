import api from './api';
import {
  SavedReport,
  SavedReportCreate,
  SavedReportUpdate,
  ReportExecution,
  ReportExecutionCreate,
  ReportFilters,
  ExportOptions,
  FinancialReport,
  OperationalReport,
  PatientReport,
  CustomDashboard,
  CustomDashboardCreate,
  CustomDashboardUpdate,
  DashboardWidget,
  DashboardWidgetCreate,
  DashboardWidgetUpdate,
  PerformanceMetric,
  PerformanceMetricCreate,
  BIAlert,
  BIAlertCreate,
  AlertConfiguration,
  AlertConfigurationCreate,
  ReportRequest,
  DashboardData,
  KPIValue,
} from '../types/unified-reports';

// ===== SAVED REPORTS =====

export const reportsService = {
  // Saved Reports
  async getSavedReports(params?: {
    skip?: number;
    limit?: number;
    report_type?: string;
  }): Promise<SavedReport[]> {
    const response = await api.get('/saved-reports', { params });
    return response.data;
  },

  async getSavedReport(reportId: number): Promise<SavedReport> {
    const response = await api.get(`/saved-reports/${reportId}`);
    return response.data;
  },

  async createSavedReport(report: SavedReportCreate): Promise<SavedReport> {
    const response = await api.post('/saved-reports', report);
    return response.data;
  },

  async updateSavedReport(reportId: number, report: SavedReportUpdate): Promise<SavedReport> {
    const response = await api.put(`/saved-reports/${reportId}`, report);
    return response.data;
  },

  async deleteSavedReport(reportId: number): Promise<void> {
    await api.delete(`/saved-reports/${reportId}`);
  },

  // Report Executions
  async executeReport(execution: ReportExecutionCreate): Promise<ReportExecution> {
    const response = await api.post('/report-executions', execution);
    return response.data;
  },

  async getReportExecutions(params?: {
    saved_report_id?: number;
    skip?: number;
    limit?: number;
  }): Promise<ReportExecution[]> {
    const response = await api.get('/report-executions', { params });
    return response.data;
  },

  async getReportExecution(executionId: number): Promise<ReportExecution> {
    const response = await api.get(`/report-executions/${executionId}`);
    return response.data;
  },

  // Custom Dashboards
  async getCustomDashboards(params?: {
    skip?: number;
    limit?: number;
  }): Promise<CustomDashboard[]> {
    const response = await api.get('/dashboards', { params });
    return response.data;
  },

  async getCustomDashboard(dashboardId: number): Promise<CustomDashboard> {
    const response = await api.get(`/dashboards/${dashboardId}`);
    return response.data;
  },

  async createCustomDashboard(dashboard: CustomDashboardCreate): Promise<CustomDashboard> {
    const response = await api.post('/dashboards', dashboard);
    return response.data;
  },

  async updateCustomDashboard(dashboardId: number, dashboard: CustomDashboardUpdate): Promise<CustomDashboard> {
    const response = await api.put(`/dashboards/${dashboardId}`, dashboard);
    return response.data;
  },

  async deleteCustomDashboard(dashboardId: number): Promise<void> {
    await api.delete(`/dashboards/${dashboardId}`);
  },

  // Dashboard Widgets
  async getDashboardWidgets(params?: {
    dashboard_id?: number;
    skip?: number;
    limit?: number;
  }): Promise<DashboardWidget[]> {
    const response = await api.get('/dashboard-widgets', { params });
    return response.data;
  },

  async getDashboardWidget(widgetId: number): Promise<DashboardWidget> {
    const response = await api.get(`/dashboard-widgets/${widgetId}`);
    return response.data;
  },

  async createDashboardWidget(widget: DashboardWidgetCreate): Promise<DashboardWidget> {
    const response = await api.post('/dashboard-widgets', widget);
    return response.data;
  },

  async updateDashboardWidget(widgetId: number, widget: DashboardWidgetUpdate): Promise<DashboardWidget> {
    const response = await api.put(`/dashboard-widgets/${widgetId}`, widget);
    return response.data;
  },

  async deleteDashboardWidget(widgetId: number): Promise<void> {
    await api.delete(`/dashboard-widgets/${widgetId}`);
  },

  // Performance Metrics
  async getPerformanceMetrics(params?: {
    metric_type?: string;
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }): Promise<PerformanceMetric[]> {
    const response = await api.get('/performance-metrics', { params });
    return response.data;
  },

  async getPerformanceMetric(metricId: number): Promise<PerformanceMetric> {
    const response = await api.get(`/performance-metrics/${metricId}`);
    return response.data;
  },

  async createPerformanceMetric(metric: PerformanceMetricCreate): Promise<PerformanceMetric> {
    const response = await api.post('/performance-metrics', metric);
    return response.data;
  },

  // BI Alerts
  async getBIAlerts(params?: {
    alert_type?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<BIAlert[]> {
    const response = await api.get('/bi-alerts', { params });
    return response.data;
  },

  async getBIAlert(alertId: number): Promise<BIAlert> {
    const response = await api.get(`/bi-alerts/${alertId}`);
    return response.data;
  },

  async createBIAlert(alert: BIAlertCreate): Promise<BIAlert> {
    const response = await api.post('/bi-alerts', alert);
    return response.data;
  },

  async resolveBIAlert(alertId: number): Promise<BIAlert> {
    const response = await api.put(`/bi-alerts/${alertId}/resolve`);
    return response.data;
  },

  // Alert Configurations
  async getAlertConfigurations(params?: {
    skip?: number;
    limit?: number;
  }): Promise<AlertConfiguration[]> {
    const response = await api.get('/alert-configurations', { params });
    return response.data;
  },

  async createAlertConfiguration(config: AlertConfigurationCreate): Promise<AlertConfiguration> {
    const response = await api.post('/alert-configurations', config);
    return response.data;
  },

  // Financial Reports
  async getFinancialAlerts(): Promise<BIAlert[]> {
    const response = await api.get('/financial/alerts');
    return response.data;
  },

  async getFinancialKPIs(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<KPIValue[]> {
    const response = await api.get('/financial/kpis', { params });
    return response.data;
  },

  async getCashFlowProjection(params?: {
    months?: number;
  }): Promise<any> {
    const response = await api.get('/financial/cash-flow-projection', { params });
    return response.data;
  },

  // Report Generation
  async generateReport(request: ReportRequest): Promise<Blob> {
    const response = await api.post('/reports/generate', request, {
      responseType: 'blob'
    });
    return response.data;
  },

  async generateFinancialReport(filters: ReportFilters): Promise<FinancialReport> {
    const response = await api.post('/reports/financial', filters);
    return response.data;
  },

  async generateOperationalReport(filters: ReportFilters): Promise<OperationalReport> {
    const response = await api.post('/reports/operational', filters);
    return response.data;
  },

  async generatePatientReport(filters: ReportFilters): Promise<PatientReport> {
    const response = await api.post('/reports/patients', filters);
    return response.data;
  },

  // Export Functions
  async exportReport(reportId: number, options: ExportOptions): Promise<Blob> {
    const response = await api.post(`/reports/${reportId}/export`, options, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportDashboard(dashboardId: number, options: ExportOptions): Promise<Blob> {
    const response = await api.post(`/dashboards/${dashboardId}/export`, options, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Dashboard Data
  async getDashboardData(dashboardId?: number): Promise<DashboardData> {
    const endpoint = dashboardId ? `/dashboards/${dashboardId}/data` : '/dashboard/data';
    const response = await api.get(endpoint);
    return response.data;
  },

  async refreshDashboardData(dashboardId: number): Promise<DashboardData> {
    const response = await api.post(`/dashboards/${dashboardId}/refresh`);
    return response.data;
  },

  // Utility Functions
  async getReportTypes(): Promise<string[]> {
    const response = await api.get('/reports/types');
    return response.data;
  },

  async getAvailableMetrics(): Promise<string[]> {
    const response = await api.get('/reports/metrics');
    return response.data;
  },

  async validateReportConfig(config: Record<string, any>): Promise<boolean> {
    const response = await api.post('/reports/validate-config', config);
    return response.data.valid;
  },

  // Search and Filter
  async searchReports(query: string, filters?: ReportFilters): Promise<SavedReport[]> {
    const response = await api.get('/reports/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  async getReportsByType(reportType: string): Promise<SavedReport[]> {
    const response = await api.get('/saved-reports', {
      params: { report_type: reportType }
    });
    return response.data;
  },

  // Analytics
  async getReportUsageStats(): Promise<any> {
    const response = await api.get('/reports/usage-stats');
    return response.data;
  },

  async getPopularReports(): Promise<SavedReport[]> {
    const response = await api.get('/reports/popular');
    return response.data;
  },

  // Scheduling
  async scheduleReport(reportId: number, scheduleConfig: Record<string, any>): Promise<SavedReport> {
    const response = await api.post(`/saved-reports/${reportId}/schedule`, scheduleConfig);
    return response.data;
  },

  async unscheduleReport(reportId: number): Promise<SavedReport> {
    const response = await api.delete(`/saved-reports/${reportId}/schedule`);
    return response.data;
  },

  async getScheduledReports(): Promise<SavedReport[]> {
    const response = await api.get('/saved-reports', {
      params: { is_scheduled: true }
    });
    return response.data;
  }
};

export default reportsService;