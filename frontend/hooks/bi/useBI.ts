// Hook principal para Business Intelligence

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { biService } from '@/services/bi/biService';
import type {
  Dashboard,
  DashboardWidget,
  WidgetConfig,
  GlobalFilter,
  DashboardLayout,
  DashboardSettings,
  WidgetType,
  ChartType,
  FilterConfig,
  TimeRange,
  DashboardTemplate
} from '@/types/bi/dashboard';

export interface UseBIOptions {
  dashboardId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
}

export interface UseBIReturn {
  // Dashboard State
  dashboard: Dashboard | null;
  dashboards: Dashboard[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Widget State
  widgets: DashboardWidget[];
  selectedWidget: DashboardWidget | null;
  
  // Filter State
  filters: GlobalFilter[];
  activeFilters: Record<string, any>;
  
  // Layout State
  layout: DashboardLayout | null;
  isEditMode: boolean;
  
  // Dashboard Actions
  createDashboard: (data: Partial<Dashboard>) => Promise<Dashboard>;
  updateDashboard: (id: string, data: Partial<Dashboard>) => Promise<Dashboard>;
  deleteDashboard: (id: string) => Promise<void>;
  duplicateDashboard: (id: string, name?: string) => Promise<Dashboard>;
  loadDashboard: (id: string) => Promise<void>;
  
  // Widget Actions
  addWidget: (config: WidgetConfig) => Promise<DashboardWidget>;
  updateWidget: (id: string, config: Partial<WidgetConfig>) => Promise<DashboardWidget>;
  removeWidget: (id: string) => Promise<void>;
  moveWidget: (id: string, position: { x: number; y: number }) => Promise<void>;
  resizeWidget: (id: string, size: { width: number; height: number }) => Promise<void>;
  refreshWidget: (id: string) => Promise<void>;
  selectWidget: (widget: DashboardWidget | null) => void;
  
  // Layout Actions
  updateLayout: (layout: DashboardLayout) => Promise<void>;
  resetLayout: () => Promise<void>;
  saveLayout: () => Promise<void>;
  
  // Filter Actions
  applyFilter: (filterId: string, value: any) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  updateFilterConfig: (filters: FilterConfig[]) => Promise<void>;
  
  // Mode Actions
  enterEditMode: () => void;
  exitEditMode: () => void;
  toggleEditMode: () => void;
  
  // Data Actions
  refreshData: () => Promise<void>;
  exportDashboard: (format: 'pdf' | 'png' | 'json') => Promise<void>;
  
  // Template Actions
  saveAsTemplate: (name: string, description?: string) => Promise<DashboardTemplate>;
  loadFromTemplate: (templateId: string) => Promise<void>;
  
  // Utility
  getWidgetData: (widgetId: string) => any;
  isWidgetLoading: (widgetId: string) => boolean;
  getFilteredData: () => any;
}

const QUERY_KEYS = {
  dashboards: ['bi', 'dashboards'],
  dashboard: (id: string) => ['bi', 'dashboard', id],
  widgets: (dashboardId: string) => ['bi', 'widgets', dashboardId],
  widgetData: (widgetId: string) => ['bi', 'widget-data', widgetId],
  templates: ['bi', 'templates']
};

export function useBI(options: UseBIOptions = {}): UseBIReturn {
  const {
    dashboardId,
    autoRefresh = false,
    refreshInterval = 30000,
    enableRealtime = false
  } = options;

  const queryClient = useQueryClient();
  
  // Local State
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgetDataCache, setWidgetDataCache] = useState<Record<string, any>>({});
  const [loadingWidgets, setLoadingWidgets] = useState<Set<string>>(new Set());

  // Queries
  const {
    data: dashboards = [],
    isLoading: isDashboardsLoading,
    error: dashboardsError
  } = useQuery({
    queryKey: QUERY_KEYS.dashboards,
    queryFn: () => biService.getDashboards(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: QUERY_KEYS.dashboard(dashboardId || ''),
    queryFn: () => biService.getDashboard(dashboardId!),
    enabled: !!dashboardId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: autoRefresh ? 0 : 5 * 60 * 1000
  });

  const {
    data: widgets = [],
    isLoading: isWidgetsLoading,
    error: widgetsError
  } = useQuery({
    queryKey: QUERY_KEYS.widgets(dashboardId || ''),
    queryFn: () => biService.getDashboardWidgets(dashboardId!),
    enabled: !!dashboardId,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Computed State
  const isLoading = isDashboardsLoading || isDashboardLoading || isWidgetsLoading;
  const error = dashboardsError || dashboardError || widgetsError;
  const isError = !!error;
  
  const filters = useMemo(() => {
    return dashboard?.settings?.filters || [];
  }, [dashboard]);

  const layout = useMemo(() => {
    return dashboard?.layout || null;
  }, [dashboard]);

  // Mutations
  const createDashboardMutation = useMutation({
    mutationFn: biService.createDashboard,
    onSuccess: (newDashboard) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar dashboard: ' + error.message);
    }
  });

  const updateDashboardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dashboard> }) => 
      biService.updateDashboard(id, data),
    onSuccess: (updatedDashboard) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard(updatedDashboard.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar dashboard: ' + error.message);
    }
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: biService.deleteDashboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir dashboard: ' + error.message);
    }
  });

  const addWidgetMutation = useMutation({
    mutationFn: ({ dashboardId, config }: { dashboardId: string; config: WidgetConfig }) =>
      biService.addWidget(dashboardId, config),
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgets(dashboardId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard(dashboardId) });
      }
      toast.success('Widget adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar widget: ' + error.message);
    }
  });

  const updateWidgetMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: Partial<WidgetConfig> }) =>
      biService.updateWidget(id, config),
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgets(dashboardId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgetData(selectedWidget?.id || '') });
      }
      toast.success('Widget atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar widget: ' + error.message);
    }
  });

  const removeWidgetMutation = useMutation({
    mutationFn: biService.removeWidget,
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgets(dashboardId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard(dashboardId) });
      }
      setSelectedWidget(null);
      toast.success('Widget removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover widget: ' + error.message);
    }
  });

  const updateLayoutMutation = useMutation({
    mutationFn: ({ dashboardId, layout }: { dashboardId: string; layout: DashboardLayout }) =>
      biService.updateDashboardLayout(dashboardId, layout),
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard(dashboardId) });
      }
      toast.success('Layout atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar layout: ' + error.message);
    }
  });

  // Actions
  const createDashboard = useCallback(async (data: Partial<Dashboard>) => {
    return createDashboardMutation.mutateAsync(data);
  }, [createDashboardMutation]);

  const updateDashboard = useCallback(async (id: string, data: Partial<Dashboard>) => {
    return updateDashboardMutation.mutateAsync({ id, data });
  }, [updateDashboardMutation]);

  const deleteDashboard = useCallback(async (id: string) => {
    await deleteDashboardMutation.mutateAsync(id);
  }, [deleteDashboardMutation]);

  const duplicateDashboard = useCallback(async (id: string, name?: string) => {
    try {
      const duplicated = await biService.duplicateDashboard(id, name);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard duplicado com sucesso!');
      return duplicated;
    } catch (error: any) {
      toast.error('Erro ao duplicar dashboard: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const loadDashboard = useCallback(async (id: string) => {
    try {
      await refetchDashboard();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgets(id) });
    } catch (error: any) {
      toast.error('Erro ao carregar dashboard: ' + error.message);
      throw error;
    }
  }, [refetchDashboard, queryClient]);

  const addWidget = useCallback(async (config: WidgetConfig) => {
    if (!dashboardId) throw new Error('Dashboard ID é obrigatório');
    return addWidgetMutation.mutateAsync({ dashboardId, config });
  }, [dashboardId, addWidgetMutation]);

  const updateWidget = useCallback(async (id: string, config: Partial<WidgetConfig>) => {
    return updateWidgetMutation.mutateAsync({ id, config });
  }, [updateWidgetMutation]);

  const removeWidget = useCallback(async (id: string) => {
    await removeWidgetMutation.mutateAsync(id);
  }, [removeWidgetMutation]);

  const moveWidget = useCallback(async (id: string, position: { x: number; y: number }) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;
    
    await updateWidget(id, {
      position: { ...widget.position, ...position }
    });
  }, [widgets, updateWidget]);

  const resizeWidget = useCallback(async (id: string, size: { width: number; height: number }) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;
    
    await updateWidget(id, {
      size: { ...widget.size, ...size }
    });
  }, [widgets, updateWidget]);

  const refreshWidget = useCallback(async (id: string) => {
    setLoadingWidgets(prev => new Set(prev).add(id));
    try {
      const data = await biService.getWidgetData(id, activeFilters);
      setWidgetDataCache(prev => ({ ...prev, [id]: data }));
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.widgetData(id) });
    } catch (error: any) {
      toast.error('Erro ao atualizar widget: ' + error.message);
    } finally {
      setLoadingWidgets(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [activeFilters, queryClient]);

  const selectWidget = useCallback((widget: DashboardWidget | null) => {
    setSelectedWidget(widget);
  }, []);

  const updateLayout = useCallback(async (newLayout: DashboardLayout) => {
    if (!dashboardId) throw new Error('Dashboard ID é obrigatório');
    await updateLayoutMutation.mutateAsync({ dashboardId, layout: newLayout });
  }, [dashboardId, updateLayoutMutation]);

  const resetLayout = useCallback(async () => {
    if (!dashboardId || !dashboard) return;
    
    const defaultLayout: DashboardLayout = {
      type: 'grid',
      columns: 12,
      rowHeight: 100,
      margin: [10, 10],
      containerPadding: [10, 10],
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
    };
    
    await updateLayout(defaultLayout);
  }, [dashboardId, dashboard, updateLayout]);

  const saveLayout = useCallback(async () => {
    if (!dashboardId || !layout) return;
    await updateLayout(layout);
  }, [dashboardId, layout, updateLayout]);

  const applyFilter = useCallback((filterId: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
    
    // Refresh all widgets with new filters
    widgets.forEach(widget => {
      refreshWidget(widget.id);
    });
  }, [widgets, refreshWidget]);

  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
    
    // Refresh all widgets
    widgets.forEach(widget => {
      refreshWidget(widget.id);
    });
  }, [widgets, refreshWidget]);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    
    // Refresh all widgets
    widgets.forEach(widget => {
      refreshWidget(widget.id);
    });
  }, [widgets, refreshWidget]);

  const updateFilterConfig = useCallback(async (filterConfigs: FilterConfig[]) => {
    if (!dashboardId || !dashboard) return;
    
    const updatedSettings: DashboardSettings = {
      ...dashboard.settings,
      filters: filterConfigs
    };
    
    await updateDashboard(dashboardId, { settings: updatedSettings });
  }, [dashboardId, dashboard, updateDashboard]);

  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setSelectedWidget(null);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    if (isEditMode) {
      setSelectedWidget(null);
    }
  }, [isEditMode]);

  const refreshData = useCallback(async () => {
    if (!dashboardId) return;
    
    try {
      // Refresh dashboard
      await refetchDashboard();
      
      // Refresh all widgets
      await Promise.all(widgets.map(widget => refreshWidget(widget.id)));
      
      toast.success('Dados atualizados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar dados: ' + error.message);
    }
  }, [dashboardId, refetchDashboard, widgets, refreshWidget]);

  const exportDashboard = useCallback(async (format: 'pdf' | 'png' | 'json') => {
    if (!dashboardId) throw new Error('Dashboard ID é obrigatório');
    
    try {
      const blob = await biService.exportDashboard(dashboardId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${dashboard?.name || 'export'}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Dashboard exportado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao exportar dashboard: ' + error.message);
    }
  }, [dashboardId, dashboard]);

  const saveAsTemplate = useCallback(async (name: string, description?: string) => {
    if (!dashboardId) throw new Error('Dashboard ID é obrigatório');
    
    try {
      const template = await biService.saveAsTemplate(dashboardId, { name, description });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates });
      toast.success('Template salvo com sucesso!');
      return template;
    } catch (error: any) {
      toast.error('Erro ao salvar template: ' + error.message);
      throw error;
    }
  }, [dashboardId, queryClient]);

  const loadFromTemplate = useCallback(async (templateId: string) => {
    if (!dashboardId) throw new Error('Dashboard ID é obrigatório');
    
    try {
      await biService.loadFromTemplate(dashboardId, templateId);
      await loadDashboard(dashboardId);
      toast.success('Template carregado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao carregar template: ' + error.message);
      throw error;
    }
  }, [dashboardId, loadDashboard]);

  const getWidgetData = useCallback((widgetId: string) => {
    return widgetDataCache[widgetId] || null;
  }, [widgetDataCache]);

  const isWidgetLoading = useCallback((widgetId: string) => {
    return loadingWidgets.has(widgetId);
  }, [loadingWidgets]);

  const getFilteredData = useCallback(() => {
    // Return filtered data based on active filters
    return {
      filters: activeFilters,
      widgets: widgets.map(widget => ({
        ...widget,
        data: getWidgetData(widget.id)
      }))
    };
  }, [activeFilters, widgets, getWidgetData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !dashboardId) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, dashboardId, refreshInterval, refreshData]);

  // Real-time updates effect
  useEffect(() => {
    if (!enableRealtime || !dashboardId) return;
    
    // Setup WebSocket or Server-Sent Events connection
    // This is a placeholder for real-time implementation
    console.log('Setting up real-time updates for dashboard:', dashboardId);
    
    return () => {
      console.log('Cleaning up real-time updates for dashboard:', dashboardId);
    };
  }, [enableRealtime, dashboardId]);

  return {
    // State
    dashboard: dashboard || null,
    dashboards,
    isLoading,
    isError,
    error: error as Error | null,
    widgets,
    selectedWidget,
    filters,
    activeFilters,
    layout,
    isEditMode,
    
    // Dashboard Actions
    createDashboard,
    updateDashboard,
    deleteDashboard,
    duplicateDashboard,
    loadDashboard,
    
    // Widget Actions
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    resizeWidget,
    refreshWidget,
    selectWidget,
    
    // Layout Actions
    updateLayout,
    resetLayout,
    saveLayout,
    
    // Filter Actions
    applyFilter,
    removeFilter,
    clearFilters,
    updateFilterConfig,
    
    // Mode Actions
    enterEditMode,
    exitEditMode,
    toggleEditMode,
    
    // Data Actions
    refreshData,
    exportDashboard,
    
    // Template Actions
    saveAsTemplate,
    loadFromTemplate,
    
    // Utility
    getWidgetData,
    isWidgetLoading,
    getFilteredData
  };
}

export default useBI;