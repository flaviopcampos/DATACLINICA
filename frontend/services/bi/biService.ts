// Serviço principal de Business Intelligence

import api from '@/lib/api';
import type {
  Dashboard,
  DashboardWidget,
  DashboardLayout,
  GlobalFilter,
  DashboardTemplate,
  DashboardComment,
  DashboardShare,
  WidgetConfig,
  DataSourceConfig,
  VisualizationConfig,
  DashboardType,
  DashboardCategory,
  WidgetType,
  FilterType,
  ExportFormat
} from '@/types/bi/dashboard';

export interface DashboardListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: DashboardType;
  category?: DashboardCategory;
  ownerId?: string;
  tags?: string[];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardCreateData {
  name: string;
  description?: string;
  type: DashboardType;
  category: DashboardCategory;
  layout?: Partial<DashboardLayout>;
  isPublic?: boolean;
  tags?: string[];
}

export interface DashboardUpdateData extends Partial<DashboardCreateData> {
  widgets?: DashboardWidget[];
  filters?: GlobalFilter[];
  settings?: any;
}

export interface WidgetCreateData {
  type: WidgetType;
  title: string;
  description?: string;
  position: { x: number; y: number; w: number; h: number };
  config: WidgetConfig;
  dataSource: DataSourceConfig;
  visualization: VisualizationConfig;
}

export interface WidgetUpdateData extends Partial<WidgetCreateData> {}

export interface DashboardExportOptions {
  format: ExportFormat;
  includeData?: boolean;
  includeFilters?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class BIService {
  private baseUrl = '/api/bi';

  // Dashboard CRUD
  async getDashboards(params: DashboardListParams = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`${this.baseUrl}/dashboards?${searchParams}`);
    return response.data;
  }

  async getDashboard(id: string) {
    const response = await api.get(`${this.baseUrl}/dashboards/${id}`);
    return response.data as Dashboard;
  }

  async createDashboard(data: DashboardCreateData) {
    const response = await api.post(`${this.baseUrl}/dashboards`, data);
    return response.data as Dashboard;
  }

  async updateDashboard(id: string, data: DashboardUpdateData) {
    const response = await api.put(`${this.baseUrl}/dashboards/${id}`, data);
    return response.data as Dashboard;
  }

  async deleteDashboard(id: string) {
    await api.delete(`${this.baseUrl}/dashboards/${id}`);
  }

  async duplicateDashboard(id: string, name?: string) {
    const response = await api.post(`${this.baseUrl}/dashboards/${id}/duplicate`, {
      name: name || `Copy of Dashboard`
    });
    return response.data as Dashboard;
  }

  // Widget Management
  async addWidget(dashboardId: string, widget: WidgetCreateData) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/widgets`,
      widget
    );
    return response.data as DashboardWidget;
  }

  async updateWidget(dashboardId: string, widgetId: string, data: WidgetUpdateData) {
    const response = await api.put(
      `${this.baseUrl}/dashboards/${dashboardId}/widgets/${widgetId}`,
      data
    );
    return response.data as DashboardWidget;
  }

  async deleteWidget(dashboardId: string, widgetId: string) {
    await api.delete(`${this.baseUrl}/dashboards/${dashboardId}/widgets/${widgetId}`);
  }

  async moveWidget(dashboardId: string, widgetId: string, position: { x: number; y: number }) {
    const response = await api.patch(
      `${this.baseUrl}/dashboards/${dashboardId}/widgets/${widgetId}/position`,
      position
    );
    return response.data as DashboardWidget;
  }

  async resizeWidget(dashboardId: string, widgetId: string, size: { w: number; h: number }) {
    const response = await api.patch(
      `${this.baseUrl}/dashboards/${dashboardId}/widgets/${widgetId}/size`,
      size
    );
    return response.data as DashboardWidget;
  }

  // Layout Management
  async updateLayout(dashboardId: string, layout: DashboardLayout) {
    const response = await api.put(
      `${this.baseUrl}/dashboards/${dashboardId}/layout`,
      layout
    );
    return response.data as Dashboard;
  }

  async saveLayoutPreset(dashboardId: string, name: string, layout: DashboardLayout) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/layout-presets`,
      { name, layout }
    );
    return response.data;
  }

  async getLayoutPresets(dashboardId: string) {
    const response = await api.get(
      `${this.baseUrl}/dashboards/${dashboardId}/layout-presets`
    );
    return response.data;
  }

  // Filters
  async updateFilters(dashboardId: string, filters: GlobalFilter[]) {
    const response = await api.put(
      `${this.baseUrl}/dashboards/${dashboardId}/filters`,
      { filters }
    );
    return response.data as Dashboard;
  }

  async getFilterOptions(dashboardId: string, filterId: string) {
    const response = await api.get(
      `${this.baseUrl}/dashboards/${dashboardId}/filters/${filterId}/options`
    );
    return response.data;
  }

  // Data Sources
  async getAvailableDataSources() {
    const response = await api.get(`${this.baseUrl}/data-sources`);
    return response.data;
  }

  async testDataSource(config: DataSourceConfig) {
    const response = await api.post(`${this.baseUrl}/data-sources/test`, config);
    return response.data;
  }

  async getDataSourceSchema(config: DataSourceConfig) {
    const response = await api.post(`${this.baseUrl}/data-sources/schema`, config);
    return response.data;
  }

  async previewData(config: DataSourceConfig, limit = 10) {
    const response = await api.post(`${this.baseUrl}/data-sources/preview`, {
      ...config,
      limit
    });
    return response.data;
  }

  // Widget Data
  async getWidgetData(dashboardId: string, widgetId: string, filters?: Record<string, any>) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/widgets/${widgetId}/data`,
      { filters }
    );
    return response.data;
  }

  async refreshWidgetData(dashboardId: string, widgetId: string) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/widgets/${widgetId}/refresh`
    );
    return response.data;
  }

  async refreshAllWidgets(dashboardId: string) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/refresh`
    );
    return response.data;
  }

  // Templates
  async getTemplates(category?: DashboardCategory) {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`${this.baseUrl}/templates${params}`);
    return response.data as DashboardTemplate[];
  }

  async getTemplate(id: string) {
    const response = await api.get(`${this.baseUrl}/templates/${id}`);
    return response.data as DashboardTemplate;
  }

  async createFromTemplate(templateId: string, name: string, customizations?: any) {
    const response = await api.post(`${this.baseUrl}/templates/${templateId}/create`, {
      name,
      customizations
    });
    return response.data as Dashboard;
  }

  async saveAsTemplate(dashboardId: string, templateData: Partial<DashboardTemplate>) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/save-as-template`,
      templateData
    );
    return response.data as DashboardTemplate;
  }

  // Sharing and Collaboration
  async shareDashboard(dashboardId: string, shareData: Omit<DashboardShare, 'id' | 'createdAt'>) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/share`,
      shareData
    );
    return response.data as DashboardShare;
  }

  async getSharedDashboards() {
    const response = await api.get(`${this.baseUrl}/shared`);
    return response.data;
  }

  async revokeShare(dashboardId: string, shareId: string) {
    await api.delete(`${this.baseUrl}/dashboards/${dashboardId}/share/${shareId}`);
  }

  // Comments
  async getComments(dashboardId: string) {
    const response = await api.get(`${this.baseUrl}/dashboards/${dashboardId}/comments`);
    return response.data as DashboardComment[];
  }

  async addComment(dashboardId: string, comment: Omit<DashboardComment, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/comments`,
      comment
    );
    return response.data as DashboardComment;
  }

  async updateComment(dashboardId: string, commentId: string, content: string) {
    const response = await api.put(
      `${this.baseUrl}/dashboards/${dashboardId}/comments/${commentId}`,
      { content }
    );
    return response.data as DashboardComment;
  }

  async deleteComment(dashboardId: string, commentId: string) {
    await api.delete(`${this.baseUrl}/dashboards/${dashboardId}/comments/${commentId}`);
  }

  async resolveComment(dashboardId: string, commentId: string) {
    const response = await api.patch(
      `${this.baseUrl}/dashboards/${dashboardId}/comments/${commentId}/resolve`
    );
    return response.data as DashboardComment;
  }

  // Export and Import
  async exportDashboard(dashboardId: string, options: DashboardExportOptions) {
    const response = await api.post(
      `${this.baseUrl}/dashboards/${dashboardId}/export`,
      options,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async importDashboard(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`${this.baseUrl}/dashboards/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data as Dashboard;
  }

  // Analytics and Usage
  async getDashboardAnalytics(dashboardId: string, period = '30d') {
    const response = await api.get(
      `${this.baseUrl}/dashboards/${dashboardId}/analytics?period=${period}`
    );
    return response.data;
  }

  async getPopularDashboards(limit = 10) {
    const response = await api.get(`${this.baseUrl}/dashboards/popular?limit=${limit}`);
    return response.data;
  }

  async getRecentDashboards(limit = 10) {
    const response = await api.get(`${this.baseUrl}/dashboards/recent?limit=${limit}`);
    return response.data;
  }

  async trackView(dashboardId: string) {
    await api.post(`${this.baseUrl}/dashboards/${dashboardId}/view`);
  }

  // Settings and Configuration
  async getSystemConfig() {
    const response = await api.get(`${this.baseUrl}/config`);
    return response.data;
  }

  async updateSystemConfig(config: any) {
    const response = await api.put(`${this.baseUrl}/config`, config);
    return response.data;
  }

  async getUserPreferences() {
    const response = await api.get(`${this.baseUrl}/preferences`);
    return response.data;
  }

  async updateUserPreferences(preferences: any) {
    const response = await api.put(`${this.baseUrl}/preferences`, preferences);
    return response.data;
  }

  // Cache Management
  async clearCache(dashboardId?: string) {
    const url = dashboardId 
      ? `${this.baseUrl}/dashboards/${dashboardId}/cache`
      : `${this.baseUrl}/cache`;
    await api.delete(url);
  }

  async getCacheStatus(dashboardId: string) {
    const response = await api.get(`${this.baseUrl}/dashboards/${dashboardId}/cache/status`);
    return response.data;
  }

  // Real-time Updates
  async subscribeToUpdates(dashboardId: string, callback: (data: any) => void) {
    // Implementação WebSocket ou Server-Sent Events
    // Por enquanto, retorna uma função de cleanup mock
    return () => {
      console.log(`Unsubscribed from dashboard ${dashboardId} updates`);
    };
  }

  // Utility Methods
  generateWidgetId(): string {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateDashboardId(): string {
    return `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateDashboardConfig(dashboard: Partial<Dashboard>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dashboard.name || dashboard.name.trim().length === 0) {
      errors.push('Nome do dashboard é obrigatório');
    }

    if (!dashboard.type) {
      errors.push('Tipo do dashboard é obrigatório');
    }

    if (!dashboard.category) {
      errors.push('Categoria do dashboard é obrigatória');
    }

    if (dashboard.widgets) {
      dashboard.widgets.forEach((widget, index) => {
        if (!widget.title || widget.title.trim().length === 0) {
          errors.push(`Widget ${index + 1}: Título é obrigatório`);
        }
        if (!widget.type) {
          errors.push(`Widget ${index + 1}: Tipo é obrigatório`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  formatDashboardUrl(dashboardId: string): string {
    return `/bi/dashboard/${dashboardId}`;
  }

  formatShareUrl(shareId: string): string {
    return `/bi/shared/${shareId}`;
  }
}

export const biService = new BIService();
export default biService;