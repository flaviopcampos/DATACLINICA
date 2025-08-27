// Hook para gerenciamento de configurações de dashboard

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { biService } from '@/services/bi/biService';
import type {
  Dashboard,
  DashboardLayout,
  DashboardWidget,
  WidgetPosition,
  WidgetSize,
  WidgetConfig,
  GlobalFilter,
  DashboardSettings,
  DashboardPermissions,
  DashboardTemplate,
  DashboardTheme,
  LayoutType,
  WidgetType,
  FilterType,
  RefreshInterval
} from '@/types/bi/dashboard';

export interface UseDashboardConfigOptions {
  dashboardId?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
  enableDragDrop?: boolean;
  enableResize?: boolean;
  enableFilters?: boolean;
  enableExport?: boolean;
  enableSharing?: boolean;
  defaultLayout?: LayoutType;
  defaultTheme?: DashboardTheme;
  maxWidgets?: number;
  gridSize?: number;
  snapToGrid?: boolean;
}

export interface UseDashboardConfigReturn {
  // Configuration State
  config: DashboardSettings | null;
  layout: DashboardLayout | null;
  widgets: DashboardWidget[];
  filters: GlobalFilter[];
  permissions: DashboardPermissions | null;
  templates: DashboardTemplate[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isDirty: boolean;
  isEditMode: boolean;
  
  // Layout State
  selectedWidget: DashboardWidget | null;
  draggedWidget: DashboardWidget | null;
  resizingWidget: DashboardWidget | null;
  gridEnabled: boolean;
  snapEnabled: boolean;
  
  // Theme and Appearance
  theme: DashboardTheme;
  availableThemes: DashboardTheme[];
  customColors: Record<string, string>;
  
  // Configuration Actions
  updateConfig: (config: Partial<DashboardSettings>) => Promise<void>;
  resetConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
  loadConfig: (dashboardId: string) => Promise<void>;
  
  // Layout Actions
  updateLayout: (layout: Partial<DashboardLayout>) => void;
  resetLayout: () => void;
  saveLayout: () => Promise<void>;
  loadLayout: (layoutId: string) => Promise<void>;
  
  // Widget Actions
  addWidget: (widget: Partial<DashboardWidget>) => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (widgetId: string) => void;
  duplicateWidget: (widgetId: string) => void;
  moveWidget: (widgetId: string, position: WidgetPosition) => void;
  resizeWidget: (widgetId: string, size: WidgetSize) => void;
  selectWidget: (widget: DashboardWidget | null) => void;
  
  // Widget Configuration
  configureWidget: (widgetId: string, config: Partial<WidgetConfig>) => void;
  updateWidgetData: (widgetId: string, dataConfig: any) => void;
  refreshWidget: (widgetId: string) => Promise<void>;
  refreshAllWidgets: () => Promise<void>;
  
  // Filter Actions
  addFilter: (filter: Partial<GlobalFilter>) => void;
  updateFilter: (filterId: string, updates: Partial<GlobalFilter>) => void;
  removeFilter: (filterId: string) => void;
  applyFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  
  // Theme Actions
  setTheme: (theme: DashboardTheme) => void;
  updateCustomColors: (colors: Record<string, string>) => void;
  resetTheme: () => void;
  
  // Template Actions
  saveAsTemplate: (name: string, description?: string) => Promise<DashboardTemplate>;
  loadFromTemplate: (templateId: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  
  // Permission Actions
  updatePermissions: (permissions: Partial<DashboardPermissions>) => Promise<void>;
  shareConfig: (userIds: string[], permissions: string[]) => Promise<void>;
  
  // Mode Actions
  enterEditMode: () => void;
  exitEditMode: () => void;
  toggleEditMode: () => void;
  
  // Grid Actions
  toggleGrid: () => void;
  toggleSnap: () => void;
  setGridSize: (size: number) => void;
  
  // Export/Import Actions
  exportConfig: (format: 'json' | 'yaml') => Promise<void>;
  importConfig: (file: File) => Promise<void>;
  
  // Validation
  validateConfig: () => boolean;
  validateWidget: (widget: DashboardWidget) => boolean;
  
  // Utilities
  getWidgetById: (widgetId: string) => DashboardWidget | undefined;
  getAvailablePositions: () => WidgetPosition[];
  calculateOptimalLayout: () => DashboardLayout;
  previewLayout: (layout: DashboardLayout) => void;
}

const QUERY_KEYS = {
  config: (dashboardId?: string) => ['bi', 'dashboard-config', dashboardId],
  layout: (dashboardId?: string) => ['bi', 'dashboard-layout', dashboardId],
  templates: ['bi', 'dashboard-templates'],
  permissions: (dashboardId?: string) => ['bi', 'dashboard-permissions', dashboardId]
};

const DEFAULT_CONFIG: Partial<DashboardSettings> = {
  theme: 'light',
  layout: 'grid',
  autoRefresh: {
    enabled: true,
    interval: 300000 // 5 minutes
  },
  performance: {
    enableVirtualization: true,
    maxConcurrentRequests: 5,
    cacheTimeout: 300000
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false
  }
};

const DEFAULT_LAYOUT: DashboardLayout = {
  id: 'default',
  type: 'grid',
  columns: 12,
  rows: 'auto',
  gap: 16,
  padding: 16,
  responsive: true,
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
  }
};

const AVAILABLE_THEMES: DashboardTheme[] = [
  'light',
  'dark',
  'auto',
  'high-contrast',
  'blue',
  'green',
  'purple',
  'custom'
];

export function useDashboardConfig(options: UseDashboardConfigOptions = {}): UseDashboardConfigReturn {
  const {
    dashboardId,
    autoSave = true,
    autoSaveDelay = 2000,
    enableDragDrop = true,
    enableResize = true,
    enableFilters = true,
    enableExport = true,
    enableSharing = true,
    defaultLayout = 'grid',
    defaultTheme = 'light',
    maxWidgets = 20,
    gridSize = 8,
    snapToGrid = true
  } = options;

  const queryClient = useQueryClient();
  
  // Local State
  const [config, setConfig] = useState<DashboardSettings | null>(null);
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [filters, setFilters] = useState<GlobalFilter[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<DashboardWidget | null>(null);
  const [resizingWidget, setResizingWidget] = useState<DashboardWidget | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(snapToGrid);
  const [theme, setThemeState] = useState<DashboardTheme>(defaultTheme);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Queries
  const {
    data: configData,
    isLoading: isConfigLoading,
    error: configError,
    refetch: refetchConfig
  } = useQuery({
    queryKey: QUERY_KEYS.config(dashboardId),
    queryFn: () => dashboardId ? biService.getDashboardSettings(dashboardId) : Promise.resolve(DEFAULT_CONFIG),
    enabled: !!dashboardId,
    staleTime: 5 * 60 * 1000
  });

  const {
    data: layoutData,
    isLoading: isLayoutLoading,
    refetch: refetchLayout
  } = useQuery({
    queryKey: QUERY_KEYS.layout(dashboardId),
    queryFn: () => dashboardId ? biService.getDashboardLayout(dashboardId) : Promise.resolve(DEFAULT_LAYOUT),
    enabled: !!dashboardId,
    staleTime: 5 * 60 * 1000
  });

  const {
    data: templates = [],
    isLoading: isTemplatesLoading
  } = useQuery({
    queryKey: QUERY_KEYS.templates,
    queryFn: () => biService.getDashboardTemplates(),
    staleTime: 10 * 60 * 1000
  });

  const {
    data: permissions,
    isLoading: isPermissionsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.permissions(dashboardId),
    queryFn: () => dashboardId ? biService.getDashboardPermissions(dashboardId) : Promise.resolve(null),
    enabled: !!dashboardId && enableSharing,
    staleTime: 5 * 60 * 1000
  });

  // Computed State
  const isLoading = isConfigLoading || isLayoutLoading || isTemplatesLoading || isPermissionsLoading;
  const error = configError;
  const isError = !!error;
  const availableThemes = AVAILABLE_THEMES;

  // Mutations
  const updateConfigMutation = useMutation({
    mutationFn: ({ dashboardId, config }: { dashboardId: string; config: Partial<DashboardSettings> }) =>
      biService.updateDashboardSettings(dashboardId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.config(dashboardId) });
      setIsDirty(false);
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar configurações: ' + error.message);
    }
  });

  const updateLayoutMutation = useMutation({
    mutationFn: ({ dashboardId, layout }: { dashboardId: string; layout: DashboardLayout }) =>
      biService.updateDashboardLayout(dashboardId, layout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.layout(dashboardId) });
      setIsDirty(false);
      toast.success('Layout salvo com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar layout: ' + error.message);
    }
  });

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !isDirty || !dashboardId) return;

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      saveConfig();
    }, autoSaveDelay);

    setAutoSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isDirty, autoSave, autoSaveDelay, dashboardId]);

  // Initialize state from queries
  useEffect(() => {
    if (configData) {
      setConfig(configData as DashboardSettings);
      if (configData.theme) {
        setThemeState(configData.theme);
      }
    }
  }, [configData]);

  useEffect(() => {
    if (layoutData) {
      setLayout(layoutData);
      if (layoutData.widgets) {
        setWidgets(layoutData.widgets);
      }
    }
  }, [layoutData]);

  // Actions
  const updateConfig = useCallback(async (newConfig: Partial<DashboardSettings>) => {
    if (!dashboardId) {
      setConfig(prev => ({ ...prev, ...newConfig } as DashboardSettings));
      setIsDirty(true);
      return;
    }

    try {
      await updateConfigMutation.mutateAsync({ dashboardId, config: newConfig });
      setConfig(prev => ({ ...prev, ...newConfig } as DashboardSettings));
    } catch (error) {
      // Error handled by mutation
    }
  }, [dashboardId, updateConfigMutation]);

  const resetConfig = useCallback(async () => {
    setConfig(DEFAULT_CONFIG as DashboardSettings);
    setIsDirty(true);
    toast.success('Configurações resetadas!');
  }, []);

  const saveConfig = useCallback(async () => {
    if (!dashboardId || !config) return;

    try {
      await updateConfigMutation.mutateAsync({ dashboardId, config });
    } catch (error) {
      // Error handled by mutation
    }
  }, [dashboardId, config, updateConfigMutation]);

  const loadConfig = useCallback(async (newDashboardId: string) => {
    try {
      const newConfig = await biService.getDashboardSettings(newDashboardId);
      setConfig(newConfig);
      queryClient.setQueryData(QUERY_KEYS.config(newDashboardId), newConfig);
      toast.success('Configurações carregadas!');
    } catch (error: any) {
      toast.error('Erro ao carregar configurações: ' + error.message);
    }
  }, [queryClient]);

  const updateLayout = useCallback((newLayout: Partial<DashboardLayout>) => {
    setLayout(prev => ({ ...prev, ...newLayout } as DashboardLayout));
    setIsDirty(true);
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    setWidgets([]);
    setIsDirty(true);
    toast.success('Layout resetado!');
  }, []);

  const saveLayout = useCallback(async () => {
    if (!dashboardId || !layout) return;

    try {
      const layoutWithWidgets = { ...layout, widgets };
      await updateLayoutMutation.mutateAsync({ dashboardId, layout: layoutWithWidgets });
    } catch (error) {
      // Error handled by mutation
    }
  }, [dashboardId, layout, widgets, updateLayoutMutation]);

  const loadLayout = useCallback(async (layoutId: string) => {
    try {
      const newLayout = await biService.getDashboardLayout(layoutId);
      setLayout(newLayout);
      if (newLayout.widgets) {
        setWidgets(newLayout.widgets);
      }
      queryClient.setQueryData(QUERY_KEYS.layout(layoutId), newLayout);
      toast.success('Layout carregado!');
    } catch (error: any) {
      toast.error('Erro ao carregar layout: ' + error.message);
    }
  }, [queryClient]);

  const addWidget = useCallback((widget: Partial<DashboardWidget>) => {
    if (widgets.length >= maxWidgets) {
      toast.error(`Máximo de ${maxWidgets} widgets permitidos`);
      return;
    }

    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: 'metric' as WidgetType,
      title: 'Novo Widget',
      position: { x: 0, y: 0, z: 0 },
      size: { width: 4, height: 3 },
      config: {},
      dataSource: { type: 'api', config: {} },
      visualization: { type: 'card', config: {} },
      isVisible: true,
      isResizable: enableResize,
      isDraggable: enableDragDrop,
      ...widget
    };

    setWidgets(prev => [...prev, newWidget]);
    setIsDirty(true);
    toast.success('Widget adicionado!');
  }, [widgets.length, maxWidgets, enableResize, enableDragDrop]);

  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, ...updates } : w));
    setIsDirty(true);
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(null);
    }
    setIsDirty(true);
    toast.success('Widget removido!');
  }, [selectedWidget]);

  const duplicateWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const duplicatedWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (Cópia)`,
      position: {
        ...widget.position,
        x: widget.position.x + 1,
        y: widget.position.y + 1
      }
    };

    setWidgets(prev => [...prev, duplicatedWidget]);
    setIsDirty(true);
    toast.success('Widget duplicado!');
  }, [widgets]);

  const moveWidget = useCallback((widgetId: string, position: WidgetPosition) => {
    updateWidget(widgetId, { position });
  }, [updateWidget]);

  const resizeWidget = useCallback((widgetId: string, size: WidgetSize) => {
    updateWidget(widgetId, { size });
  }, [updateWidget]);

  const selectWidget = useCallback((widget: DashboardWidget | null) => {
    setSelectedWidget(widget);
  }, []);

  const configureWidget = useCallback((widgetId: string, config: Partial<WidgetConfig>) => {
    updateWidget(widgetId, { config: { ...widgets.find(w => w.id === widgetId)?.config, ...config } });
  }, [updateWidget, widgets]);

  const updateWidgetData = useCallback((widgetId: string, dataConfig: any) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    updateWidget(widgetId, {
      dataSource: { ...widget.dataSource, config: { ...widget.dataSource.config, ...dataConfig } }
    });
  }, [updateWidget, widgets]);

  const refreshWidget = useCallback(async (widgetId: string) => {
    try {
      await biService.refreshWidget(widgetId);
      toast.success('Widget atualizado!');
    } catch (error: any) {
      toast.error('Erro ao atualizar widget: ' + error.message);
    }
  }, []);

  const refreshAllWidgets = useCallback(async () => {
    try {
      await Promise.all(widgets.map(w => biService.refreshWidget(w.id)));
      toast.success('Todos os widgets foram atualizados!');
    } catch (error: any) {
      toast.error('Erro ao atualizar widgets: ' + error.message);
    }
  }, [widgets]);

  const addFilter = useCallback((filter: Partial<GlobalFilter>) => {
    const newFilter: GlobalFilter = {
      id: `filter-${Date.now()}`,
      name: 'Novo Filtro',
      type: 'select' as FilterType,
      options: [],
      isRequired: false,
      isVisible: true,
      ...filter
    };

    setFilters(prev => [...prev, newFilter]);
    setIsDirty(true);
    toast.success('Filtro adicionado!');
  }, []);

  const updateFilter = useCallback((filterId: string, updates: Partial<GlobalFilter>) => {
    setFilters(prev => prev.map(f => f.id === filterId ? { ...f, ...updates } : f));
    setIsDirty(true);
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
    setIsDirty(true);
    toast.success('Filtro removido!');
  }, []);

  const applyFilters = useCallback((filterValues: Record<string, any>) => {
    // Apply filters to all widgets
    widgets.forEach(widget => {
      biService.applyFiltersToWidget(widget.id, filterValues);
    });
    toast.success('Filtros aplicados!');
  }, [widgets]);

  const clearFilters = useCallback(() => {
    widgets.forEach(widget => {
      biService.clearWidgetFilters(widget.id);
    });
    toast.success('Filtros limpos!');
  }, [widgets]);

  const setTheme = useCallback((newTheme: DashboardTheme) => {
    setThemeState(newTheme);
    updateConfig({ theme: newTheme });
  }, [updateConfig]);

  const updateCustomColors = useCallback((colors: Record<string, string>) => {
    setCustomColors(colors);
    updateConfig({ customColors: colors });
  }, [updateConfig]);

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
    setCustomColors({});
  }, [setTheme, defaultTheme]);

  const saveAsTemplate = useCallback(async (name: string, description = '') => {
    if (!layout || !config) {
      throw new Error('Nenhuma configuração para salvar');
    }

    try {
      const template: Partial<DashboardTemplate> = {
        name,
        description,
        layout,
        settings: config,
        widgets,
        filters,
        category: 'custom',
        difficulty: 'intermediate',
        tags: []
      };

      const result = await biService.createDashboardTemplate(template);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates });
      toast.success('Template salvo com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao salvar template: ' + error.message);
      throw error;
    }
  }, [layout, config, widgets, filters, queryClient]);

  const loadFromTemplate = useCallback(async (templateId: string) => {
    try {
      const template = await biService.getDashboardTemplate(templateId);
      
      if (template.layout) setLayout(template.layout);
      if (template.settings) setConfig(template.settings);
      if (template.widgets) setWidgets(template.widgets);
      if (template.filters) setFilters(template.filters);
      
      setIsDirty(true);
      toast.success('Template carregado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao carregar template: ' + error.message);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      await biService.deleteDashboardTemplate(templateId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates });
      toast.success('Template excluído com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir template: ' + error.message);
    }
  }, [queryClient]);

  const updatePermissions = useCallback(async (newPermissions: Partial<DashboardPermissions>) => {
    if (!dashboardId) return;

    try {
      await biService.updateDashboardPermissions(dashboardId, newPermissions);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions(dashboardId) });
      toast.success('Permissões atualizadas!');
    } catch (error: any) {
      toast.error('Erro ao atualizar permissões: ' + error.message);
    }
  }, [dashboardId, queryClient]);

  const shareConfig = useCallback(async (userIds: string[], permissionsList: string[]) => {
    if (!dashboardId) return;

    try {
      await biService.shareDashboard(dashboardId, userIds, permissionsList);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions(dashboardId) });
      toast.success('Dashboard compartilhado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao compartilhar dashboard: ' + error.message);
    }
  }, [dashboardId, queryClient]);

  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setSelectedWidget(null);
    setDraggedWidget(null);
    setResizingWidget(null);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    if (isEditMode) {
      exitEditMode();
    }
  }, [isEditMode, exitEditMode]);

  const toggleGrid = useCallback(() => {
    setGridEnabled(prev => !prev);
  }, []);

  const toggleSnap = useCallback(() => {
    setSnapEnabled(prev => !prev);
  }, []);

  const setGridSize = useCallback((size: number) => {
    updateLayout({ gap: size });
  }, [updateLayout]);

  const exportConfig = useCallback(async (format: 'json' | 'yaml') => {
    if (!config || !layout) {
      toast.error('Nenhuma configuração para exportar');
      return;
    }

    try {
      const exportData = {
        config,
        layout,
        widgets,
        filters,
        theme,
        customColors,
        exportedAt: new Date().toISOString()
      };

      const blob = await biService.exportDashboardConfig(exportData, format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-config.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Configuração exportada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao exportar configuração: ' + error.message);
    }
  }, [config, layout, widgets, filters, theme, customColors]);

  const importConfig = useCallback(async (file: File) => {
    try {
      const importData = await biService.importDashboardConfig(file);
      
      if (importData.config) setConfig(importData.config);
      if (importData.layout) setLayout(importData.layout);
      if (importData.widgets) setWidgets(importData.widgets);
      if (importData.filters) setFilters(importData.filters);
      if (importData.theme) setThemeState(importData.theme);
      if (importData.customColors) setCustomColors(importData.customColors);
      
      setIsDirty(true);
      toast.success('Configuração importada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao importar configuração: ' + error.message);
    }
  }, []);

  const validateConfig = useCallback(() => {
    if (!config || !layout) return false;
    
    // Validate required fields
    if (!layout.type || !layout.columns) return false;
    if (widgets.length === 0) return false;
    
    // Validate widgets
    return widgets.every(validateWidget);
  }, [config, layout, widgets]);

  const validateWidget = useCallback((widget: DashboardWidget) => {
    if (!widget.id || !widget.type || !widget.title) return false;
    if (!widget.position || !widget.size) return false;
    if (!widget.dataSource || !widget.visualization) return false;
    
    return true;
  }, []);

  const getWidgetById = useCallback((widgetId: string) => {
    return widgets.find(w => w.id === widgetId);
  }, [widgets]);

  const getAvailablePositions = useCallback(() => {
    if (!layout) return [];
    
    const positions: WidgetPosition[] = [];
    const occupiedPositions = widgets.map(w => w.position);
    
    for (let x = 0; x < layout.columns; x++) {
      for (let y = 0; y < 10; y++) { // Assume max 10 rows
        const position = { x, y, z: 0 };
        const isOccupied = occupiedPositions.some(p => p.x === x && p.y === y);
        if (!isOccupied) {
          positions.push(position);
        }
      }
    }
    
    return positions;
  }, [layout, widgets]);

  const calculateOptimalLayout = useCallback(() => {
    if (!layout) return DEFAULT_LAYOUT;
    
    // Simple algorithm to optimize widget positions
    const optimizedWidgets = [...widgets].sort((a, b) => {
      // Sort by size (larger widgets first)
      const aSize = a.size.width * a.size.height;
      const bSize = b.size.width * b.size.height;
      return bSize - aSize;
    });
    
    let currentX = 0;
    let currentY = 0;
    const maxColumns = layout.columns;
    
    optimizedWidgets.forEach(widget => {
      if (currentX + widget.size.width > maxColumns) {
        currentX = 0;
        currentY += 1;
      }
      
      widget.position = { x: currentX, y: currentY, z: 0 };
      currentX += widget.size.width;
    });
    
    return {
      ...layout,
      widgets: optimizedWidgets
    };
  }, [layout, widgets]);

  const previewLayout = useCallback((previewLayout: DashboardLayout) => {
    // This would typically show a preview modal or overlay
    console.log('Preview layout:', previewLayout);
    toast.success('Visualizando layout...');
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    // State
    config,
    layout,
    widgets,
    filters,
    permissions,
    templates,
    isLoading,
    isError,
    error: error as Error | null,
    isDirty,
    isEditMode,
    selectedWidget,
    draggedWidget,
    resizingWidget,
    gridEnabled,
    snapEnabled,
    theme,
    availableThemes,
    customColors,
    
    // Actions
    updateConfig,
    resetConfig,
    saveConfig,
    loadConfig,
    updateLayout,
    resetLayout,
    saveLayout,
    loadLayout,
    addWidget,
    updateWidget,
    removeWidget,
    duplicateWidget,
    moveWidget,
    resizeWidget,
    selectWidget,
    configureWidget,
    updateWidgetData,
    refreshWidget,
    refreshAllWidgets,
    addFilter,
    updateFilter,
    removeFilter,
    applyFilters,
    clearFilters,
    setTheme,
    updateCustomColors,
    resetTheme,
    saveAsTemplate,
    loadFromTemplate,
    deleteTemplate,
    updatePermissions,
    shareConfig,
    enterEditMode,
    exitEditMode,
    toggleEditMode,
    toggleGrid,
    toggleSnap,
    setGridSize,
    exportConfig,
    importConfig,
    validateConfig,
    validateWidget,
    getWidgetById,
    getAvailablePositions,
    calculateOptimalLayout,
    previewLayout
  };
}

export default useDashboardConfig;