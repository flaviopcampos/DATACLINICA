// Serviço de Relatórios de Business Intelligence

import api from '@/lib/api';
import type {
  BIReport as Report,
  ReportTemplate,
  ReportDataSource,
  ReportParameter,
  ReportFilter,
  ReportSection,
  ReportSchedule,
  ReportDistribution,
  ReportExecution,
  ReportMetadata,
  ReportType,
  ReportCategory,
  ReportStatus,
  ExecutionStatus,
} from '@/types/unified-reports';
import type {
  ExportFormat,
  ScheduleFrequency,
  DistributionChannel
} from '@/types/bi/reports';

export interface ReportListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ReportType;
  category?: ReportCategory;
  status?: ReportStatus;
  ownerId?: string;
  templateId?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastExecuted' | 'executionCount';
  sortOrder?: 'asc' | 'desc';
  includeTemplates?: boolean;
}

export interface ReportCreateData {
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  templateId?: string;
  dataSources: Omit<ReportDataSource, 'id'>[];
  parameters?: Omit<ReportParameter, 'id'>[];
  filters?: Omit<ReportFilter, 'id'>[];
  sections: Omit<ReportSection, 'id'>[];
  layout?: any;
  formatting?: any;
  schedule?: Omit<ReportSchedule, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>;
  distribution?: Omit<ReportDistribution, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>;
  tags?: string[];
  isActive?: boolean;
}

export interface ReportUpdateData extends Partial<ReportCreateData> {}

export interface ReportExecutionParams {
  reportId: string;
  parameters?: Record<string, any>;
  filters?: Record<string, any>;
  exportFormat?: ExportFormat;
  includeCharts?: boolean;
  includeData?: boolean;
  emailRecipients?: string[];
}

export interface BulkReportExecutionParams {
  reportIds: string[];
  parameters?: Record<string, any>;
  filters?: Record<string, any>;
  exportFormat?: ExportFormat;
  scheduleTime?: Date;
}

export interface ReportTemplateCreateData {
  name: string;
  description?: string;
  category: ReportCategory;
  complexity: 'simple' | 'medium' | 'complex';
  structure: any;
  defaultParameters?: Record<string, any>;
  previewImage?: string;
  tags?: string[];
  isPublic?: boolean;
}

class ReportsService {
  private baseUrl = '/api/bi/reports';

  // Report CRUD
  async getReports(params: ReportListParams = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'dateRange' && typeof value === 'object') {
          searchParams.append('startDate', value.start.toISOString());
          searchParams.append('endDate', value.end.toISOString());
        } else if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`${this.baseUrl}?${searchParams}`);
    return response.data;
  }

  async getReport(id: string) {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data as Report;
  }

  async createReport(data: ReportCreateData) {
    const response = await api.post(this.baseUrl, data);
    return response.data as Report;
  }

  async updateReport(id: string, data: ReportUpdateData) {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data as Report;
  }

  async deleteReport(id: string) {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async duplicateReport(id: string, name?: string) {
    const response = await api.post(`${this.baseUrl}/${id}/duplicate`, {
      name: name || `Copy of Report`
    });
    return response.data as Report;
  }

  async activateReport(id: string) {
    const response = await api.post(`${this.baseUrl}/${id}/activate`);
    return response.data as Report;
  }

  async deactivateReport(id: string) {
    const response = await api.post(`${this.baseUrl}/${id}/deactivate`);
    return response.data as Report;
  }

  // Report Execution
  async executeReport(params: ReportExecutionParams) {
    const response = await api.post(`${this.baseUrl}/${params.reportId}/execute`, {
      parameters: params.parameters,
      filters: params.filters,
      exportFormat: params.exportFormat,
      includeCharts: params.includeCharts,
      includeData: params.includeData,
      emailRecipients: params.emailRecipients
    });
    return response.data as ReportExecution;
  }

  async executeBulkReports(params: BulkReportExecutionParams) {
    const response = await api.post(`${this.baseUrl}/execute-bulk`, params);
    return response.data;
  }

  async getExecutionStatus(executionId: string) {
    const response = await api.get(`${this.baseUrl}/executions/${executionId}`);
    return response.data as ReportExecution;
  }

  async getExecutionResult(executionId: string, format?: ExportFormat) {
    const params = format ? `?format=${format}` : '';
    const response = await api.get(`${this.baseUrl}/executions/${executionId}/result${params}`, {
      responseType: format ? 'blob' : 'json'
    });
    return response.data;
  }

  async cancelExecution(executionId: string) {
    const response = await api.post(`${this.baseUrl}/executions/${executionId}/cancel`);
    return response.data;
  }

  async getExecutionHistory(reportId: string, limit = 50) {
    const response = await api.get(`${this.baseUrl}/${reportId}/executions?limit=${limit}`);
    return response.data as ReportExecution[];
  }

  async retryExecution(executionId: string) {
    const response = await api.post(`${this.baseUrl}/executions/${executionId}/retry`);
    return response.data as ReportExecution;
  }

  // Report Preview and Validation
  async previewReport(id: string, parameters?: Record<string, any>, sampleSize = 10) {
    const response = await api.post(`${this.baseUrl}/${id}/preview`, {
      parameters,
      sampleSize
    });
    return response.data;
  }

  async validateReport(id: string) {
    const response = await api.post(`${this.baseUrl}/${id}/validate`);
    return response.data;
  }

  async testDataSources(reportId: string) {
    const response = await api.post(`${this.baseUrl}/${reportId}/test-data-sources`);
    return response.data;
  }

  // Data Sources
  async getAvailableDataSources() {
    const response = await api.get(`${this.baseUrl}/data-sources`);
    return response.data;
  }

  async testDataSource(dataSource: Omit<ReportDataSource, 'id'>) {
    const response = await api.post(`${this.baseUrl}/data-sources/test`, dataSource);
    return response.data;
  }

  async getDataSourceSchema(dataSource: Omit<ReportDataSource, 'id'>) {
    const response = await api.post(`${this.baseUrl}/data-sources/schema`, dataSource);
    return response.data;
  }

  async previewDataSource(dataSource: Omit<ReportDataSource, 'id'>, limit = 10) {
    const response = await api.post(`${this.baseUrl}/data-sources/preview`, {
      ...dataSource,
      limit
    });
    return response.data;
  }

  // Parameters and Filters
  async getParameterOptions(reportId: string, parameterId: string, filters?: Record<string, any>) {
    const response = await api.post(`${this.baseUrl}/${reportId}/parameters/${parameterId}/options`, {
      filters
    });
    return response.data;
  }

  async getFilterOptions(reportId: string, filterId: string, parameters?: Record<string, any>) {
    const response = await api.post(`${this.baseUrl}/${reportId}/filters/${filterId}/options`, {
      parameters
    });
    return response.data;
  }

  async validateParameters(reportId: string, parameters: Record<string, any>) {
    const response = await api.post(`${this.baseUrl}/${reportId}/validate-parameters`, {
      parameters
    });
    return response.data;
  }

  // Templates
  async getTemplates(category?: ReportCategory) {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`${this.baseUrl}/templates${params}`);
    return response.data as ReportTemplate[];
  }

  async getTemplate(id: string) {
    const response = await api.get(`${this.baseUrl}/templates/${id}`);
    return response.data as ReportTemplate;
  }

  async createTemplate(data: ReportTemplateCreateData) {
    const response = await api.post(`${this.baseUrl}/templates`, data);
    return response.data as ReportTemplate;
  }

  async updateTemplate(id: string, data: Partial<ReportTemplateCreateData>) {
    const response = await api.put(`${this.baseUrl}/templates/${id}`, data);
    return response.data as ReportTemplate;
  }

  async deleteTemplate(id: string) {
    await api.delete(`${this.baseUrl}/templates/${id}`);
  }

  async createFromTemplate(templateId: string, reportData: Partial<ReportCreateData>) {
    const response = await api.post(`${this.baseUrl}/templates/${templateId}/create`, reportData);
    return response.data as Report;
  }

  async saveAsTemplate(reportId: string, templateData: Partial<ReportTemplateCreateData>) {
    const response = await api.post(`${this.baseUrl}/${reportId}/save-as-template`, templateData);
    return response.data as ReportTemplate;
  }

  // Scheduling
  async scheduleReport(reportId: string, schedule: Omit<ReportSchedule, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post(`${this.baseUrl}/${reportId}/schedule`, schedule);
    return response.data as ReportSchedule;
  }

  async updateSchedule(reportId: string, scheduleId: string, data: Partial<ReportSchedule>) {
    const response = await api.put(`${this.baseUrl}/${reportId}/schedule/${scheduleId}`, data);
    return response.data as ReportSchedule;
  }

  async deleteSchedule(reportId: string, scheduleId: string) {
    await api.delete(`${this.baseUrl}/${reportId}/schedule/${scheduleId}`);
  }

  async pauseSchedule(reportId: string, scheduleId: string) {
    const response = await api.post(`${this.baseUrl}/${reportId}/schedule/${scheduleId}/pause`);
    return response.data;
  }

  async resumeSchedule(reportId: string, scheduleId: string) {
    const response = await api.post(`${this.baseUrl}/${reportId}/schedule/${scheduleId}/resume`);
    return response.data;
  }

  async getScheduledReports() {
    const response = await api.get(`${this.baseUrl}/scheduled`);
    return response.data;
  }

  async getScheduleHistory(reportId: string, scheduleId: string, limit = 50) {
    const response = await api.get(`${this.baseUrl}/${reportId}/schedule/${scheduleId}/history?limit=${limit}`);
    return response.data;
  }

  // Distribution
  async setupDistribution(reportId: string, distribution: Omit<ReportDistribution, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post(`${this.baseUrl}/${reportId}/distribution`, distribution);
    return response.data as ReportDistribution;
  }

  async updateDistribution(reportId: string, distributionId: string, data: Partial<ReportDistribution>) {
    const response = await api.put(`${this.baseUrl}/${reportId}/distribution/${distributionId}`, data);
    return response.data as ReportDistribution;
  }

  async deleteDistribution(reportId: string, distributionId: string) {
    await api.delete(`${this.baseUrl}/${reportId}/distribution/${distributionId}`);
  }

  async testDistribution(reportId: string, distributionId: string) {
    const response = await api.post(`${this.baseUrl}/${reportId}/distribution/${distributionId}/test`);
    return response.data;
  }

  async getDistributionHistory(reportId: string, distributionId: string, limit = 50) {
    const response = await api.get(`${this.baseUrl}/${reportId}/distribution/${distributionId}/history?limit=${limit}`);
    return response.data;
  }

  // Export and Import
  async exportReport(reportId: string, format: ExportFormat, parameters?: Record<string, any>) {
    const response = await api.post(`${this.baseUrl}/${reportId}/export`, {
      format,
      parameters
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportReportDefinition(reportId: string) {
    const response = await api.get(`${this.baseUrl}/${reportId}/export-definition`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async importReport(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data as Report;
  }

  async importTemplate(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`${this.baseUrl}/templates/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data as ReportTemplate;
  }

  // Analytics and Usage
  async getReportAnalytics(reportId: string, period = '30d') {
    const response = await api.get(`${this.baseUrl}/${reportId}/analytics?period=${period}`);
    return response.data;
  }

  async getPopularReports(limit = 10) {
    const response = await api.get(`${this.baseUrl}/popular?limit=${limit}`);
    return response.data;
  }

  async getRecentReports(limit = 10) {
    const response = await api.get(`${this.baseUrl}/recent?limit=${limit}`);
    return response.data;
  }

  async getUsageStatistics(dateRange?: { start: Date; end: Date }) {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};
    
    const response = await api.get(`${this.baseUrl}/usage-statistics`, { params });
    return response.data;
  }

  // Collaboration and Sharing
  async shareReport(reportId: string, shareData: { emails: string[]; permissions: string[]; message?: string }) {
    const response = await api.post(`${this.baseUrl}/${reportId}/share`, shareData);
    return response.data;
  }

  async getSharedReports() {
    const response = await api.get(`${this.baseUrl}/shared`);
    return response.data;
  }

  async revokeShare(reportId: string, shareId: string) {
    await api.delete(`${this.baseUrl}/${reportId}/share/${shareId}`);
  }

  async addComment(reportId: string, comment: { content: string; section?: string }) {
    const response = await api.post(`${this.baseUrl}/${reportId}/comments`, comment);
    return response.data;
  }

  async getComments(reportId: string) {
    const response = await api.get(`${this.baseUrl}/${reportId}/comments`);
    return response.data;
  }

  async updateComment(reportId: string, commentId: string, content: string) {
    const response = await api.put(`${this.baseUrl}/${reportId}/comments/${commentId}`, { content });
    return response.data;
  }

  async deleteComment(reportId: string, commentId: string) {
    await api.delete(`${this.baseUrl}/${reportId}/comments/${commentId}`);
  }

  // Performance and Optimization
  async getPerformanceMetrics(reportId: string) {
    const response = await api.get(`${this.baseUrl}/${reportId}/performance`);
    return response.data;
  }

  async optimizeReport(reportId: string) {
    const response = await api.post(`${this.baseUrl}/${reportId}/optimize`);
    return response.data;
  }

  async getOptimizationSuggestions(reportId: string) {
    const response = await api.get(`${this.baseUrl}/${reportId}/optimization-suggestions`);
    return response.data;
  }

  async clearCache(reportId?: string) {
    const url = reportId ? `${this.baseUrl}/${reportId}/cache` : `${this.baseUrl}/cache`;
    await api.delete(url);
  }

  // Utility Methods
  formatReportUrl(reportId: string): string {
    return `/bi/reports/${reportId}`;
  }

  formatExecutionUrl(executionId: string): string {
    return `/bi/reports/executions/${executionId}`;
  }

  getStatusColor(status: ReportStatus | ExecutionStatus): string {
    const colors = {
      // Report Status
      draft: '#6B7280',      // gray
      active: '#10B981',     // green
      inactive: '#9CA3AF',   // light gray
      archived: '#374151',   // dark gray
      // Execution Status
      pending: '#F59E0B',    // yellow
      running: '#3B82F6',    // blue
      completed: '#10B981',  // green
      failed: '#EF4444',     // red
      cancelled: '#6B7280'   // gray
    };
    return colors[status as keyof typeof colors] || colors.draft;
  }

  getStatusIcon(status: ReportStatus | ExecutionStatus): string {
    const icons = {
      // Report Status
      draft: 'FileText',
      active: 'CheckCircle',
      inactive: 'Pause',
      archived: 'Archive',
      // Execution Status
      pending: 'Clock',
      running: 'Play',
      completed: 'CheckCircle',
      failed: 'XCircle',
      cancelled: 'StopCircle'
    };
    return icons[status as keyof typeof icons] || 'FileText';
  }

  estimateExecutionTime(reportId: string, parameters?: Record<string, any>): Promise<number> {
    return api.post(`${this.baseUrl}/${reportId}/estimate-time`, { parameters })
      .then(response => response.data.estimatedTime);
  }

  generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateReportConfig(report: Partial<Report>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!report.name || report.name.trim().length === 0) {
      errors.push('Nome do relatório é obrigatório');
    }

    if (!report.type) {
      errors.push('Tipo do relatório é obrigatório');
    }

    if (!report.category) {
      errors.push('Categoria do relatório é obrigatória');
    }

    if (!report.dataSources || report.dataSources.length === 0) {
      errors.push('Pelo menos uma fonte de dados é obrigatória');
    }

    if (!report.sections || report.sections.length === 0) {
      errors.push('Pelo menos uma seção é obrigatória');
    }

    if (report.dataSources) {
      report.dataSources.forEach((ds, index) => {
        if (!ds.name || ds.name.trim().length === 0) {
          errors.push(`Fonte de dados ${index + 1}: Nome é obrigatório`);
        }
        if (!ds.type) {
          errors.push(`Fonte de dados ${index + 1}: Tipo é obrigatório`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Real-time Updates
  async subscribeToExecutionUpdates(executionId: string, callback: (data: any) => void) {
    // Implementação WebSocket ou Server-Sent Events
    // Por enquanto, retorna uma função de cleanup mock
    return () => {
      console.log(`Unsubscribed from execution ${executionId} updates`);
    };
  }

  async subscribeToReportUpdates(reportId: string, callback: (data: any) => void) {
    // Implementação WebSocket ou Server-Sent Events
    // Por enquanto, retorna uma função de cleanup mock
    return () => {
      console.log(`Unsubscribed from report ${reportId} updates`);
    };
  }
}

export const reportsService = new ReportsService();
export default reportsService;