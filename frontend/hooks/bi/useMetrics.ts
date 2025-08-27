// Hook para gerenciamento de métricas de Business Intelligence

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { metricsService } from '@/services/bi/metricsService';
import type {
  Metric,
  MetricHistory,
  MetricComparison,
  MetricTarget,
  MetricAlert,
  MetricDashboard,
  MetricFilter,
  MetricAnalysis,
  TrendAnalysis,
  Anomaly,
  Forecast,
  MetricCategory,
  MetricType,
  ComparisonPeriod,
  TrendDirection,
  ClinicalMetrics,
  FinancialMetrics,
  OperationalMetrics
} from '@/types/bi/metrics';

export interface UseMetricsOptions {
  category?: MetricCategory;
  type?: MetricType;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableAlerts?: boolean;
  enableRealtime?: boolean;
}

export interface UseMetricsReturn {
  // Metrics State
  metrics: Metric[];
  selectedMetric: Metric | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // History and Analysis
  history: MetricHistory[];
  analysis: MetricAnalysis | null;
  trends: TrendAnalysis | null;
  anomalies: Anomaly[];
  forecasts: Forecast[];
  
  // Comparisons
  comparisons: MetricComparison[];
  
  // Targets and Alerts
  targets: MetricTarget[];
  alerts: MetricAlert[];
  activeAlerts: MetricAlert[];
  
  // Dashboards
  dashboards: MetricDashboard[];
  
  // Filters
  filters: MetricFilter[];
  activeFilters: Record<string, any>;
  
  // Specialized Metrics
  clinicalMetrics: ClinicalMetrics | null;
  financialMetrics: FinancialMetrics | null;
  operationalMetrics: OperationalMetrics | null;
  
  // Metric Actions
  createMetric: (data: Partial<Metric>) => Promise<Metric>;
  updateMetric: (id: string, data: Partial<Metric>) => Promise<Metric>;
  deleteMetric: (id: string) => Promise<void>;
  calculateMetric: (id: string, parameters?: Record<string, any>) => Promise<any>;
  calculateBulkMetrics: (ids: string[], parameters?: Record<string, any>) => Promise<Record<string, any>>;
  recalculateMetric: (id: string) => Promise<void>;
  selectMetric: (metric: Metric | null) => void;
  
  // History Actions
  getHistory: (metricId: string, period?: string) => Promise<MetricHistory[]>;
  clearHistory: (metricId: string) => Promise<void>;
  
  // Analysis Actions
  analyzeMetric: (metricId: string, options?: any) => Promise<MetricAnalysis>;
  analyzeTrends: (metricId: string, period?: string) => Promise<TrendAnalysis>;
  detectAnomalies: (metricId: string, sensitivity?: number) => Promise<Anomaly[]>;
  generateForecast: (metricId: string, periods?: number) => Promise<Forecast[]>;
  
  // Comparison Actions
  compareMetrics: (metricIds: string[], period: ComparisonPeriod) => Promise<MetricComparison[]>;
  comparePeriods: (metricId: string, periods: string[]) => Promise<MetricComparison>;
  
  // Target Actions
  setTarget: (metricId: string, target: Partial<MetricTarget>) => Promise<MetricTarget>;
  updateTarget: (targetId: string, data: Partial<MetricTarget>) => Promise<MetricTarget>;
  deleteTarget: (targetId: string) => Promise<void>;
  
  // Alert Actions
  createAlert: (metricId: string, alert: Partial<MetricAlert>) => Promise<MetricAlert>;
  updateAlert: (alertId: string, data: Partial<MetricAlert>) => Promise<MetricAlert>;
  deleteAlert: (alertId: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  snoozeAlert: (alertId: string, duration: number) => Promise<void>;
  
  // Dashboard Actions
  createDashboard: (data: Partial<MetricDashboard>) => Promise<MetricDashboard>;
  updateDashboard: (id: string, data: Partial<MetricDashboard>) => Promise<MetricDashboard>;
  deleteDashboard: (id: string) => Promise<void>;
  
  // Filter Actions
  applyFilter: (filterId: string, value: any) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  
  // Data Actions
  refreshData: () => Promise<void>;
  exportMetrics: (format: 'csv' | 'xlsx' | 'json', metricIds?: string[]) => Promise<void>;
  
  // Real-time Actions
  getRealTimeMetrics: (metricIds: string[]) => Promise<Record<string, any>>;
  subscribeToMetric: (metricId: string, callback: (data: any) => void) => () => void;
  
  // Utility
  getMetricValue: (metricId: string) => any;
  getMetricStatus: (metricId: string) => 'healthy' | 'warning' | 'critical' | 'unknown';
  getMetricTrend: (metricId: string) => TrendDirection;
  formatMetricValue: (value: any, metric: Metric) => string;
}

const QUERY_KEYS = {
  metrics: (category?: MetricCategory, type?: MetricType) => 
    ['bi', 'metrics', { category, type }],
  metric: (id: string) => ['bi', 'metric', id],
  history: (metricId: string, period?: string) => 
    ['bi', 'metric-history', metricId, period],
  analysis: (metricId: string) => ['bi', 'metric-analysis', metricId],
  trends: (metricId: string, period?: string) => 
    ['bi', 'metric-trends', metricId, period],
  anomalies: (metricId: string) => ['bi', 'metric-anomalies', metricId],
  forecasts: (metricId: string) => ['bi', 'metric-forecasts', metricId],
  comparisons: (metricIds: string[], period: ComparisonPeriod) => 
    ['bi', 'metric-comparisons', metricIds, period],
  targets: (metricId: string) => ['bi', 'metric-targets', metricId],
  alerts: (metricId?: string) => ['bi', 'metric-alerts', metricId],
  dashboards: ['bi', 'metric-dashboards'],
  clinicalMetrics: ['bi', 'clinical-metrics'],
  financialMetrics: ['bi', 'financial-metrics'],
  operationalMetrics: ['bi', 'operational-metrics'],
  realTimeMetrics: (metricIds: string[]) => ['bi', 'realtime-metrics', metricIds]
};

export function useMetrics(options: UseMetricsOptions = {}): UseMetricsReturn {
  const {
    category,
    type,
    autoRefresh = false,
    refreshInterval = 30000,
    enableAlerts = true,
    enableRealtime = false
  } = options;

  const queryClient = useQueryClient();
  
  // Local State
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [realtimeSubscriptions, setRealtimeSubscriptions] = useState<Map<string, () => void>>(new Map());

  // Queries
  const {
    data: metrics = [],
    isLoading: isMetricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: QUERY_KEYS.metrics(category, type),
    queryFn: () => metricsService.getMetrics({ category, type, filters: activeFilters }),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: autoRefresh ? 0 : 5 * 60 * 1000
  });

  const {
    data: history = [],
    isLoading: isHistoryLoading
  } = useQuery({
    queryKey: QUERY_KEYS.history(selectedMetric?.id || '', '30d'),
    queryFn: () => metricsService.getMetricHistory(selectedMetric!.id, '30d'),
    enabled: !!selectedMetric,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const {
    data: analysis,
    isLoading: isAnalysisLoading
  } = useQuery({
    queryKey: QUERY_KEYS.analysis(selectedMetric?.id || ''),
    queryFn: () => metricsService.analyzeMetric(selectedMetric!.id),
    enabled: !!selectedMetric,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  const {
    data: trends,
    isLoading: isTrendsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.trends(selectedMetric?.id || '', '30d'),
    queryFn: () => metricsService.analyzeTrends(selectedMetric!.id, '30d'),
    enabled: !!selectedMetric,
    staleTime: 10 * 60 * 1000
  });

  const {
    data: anomalies = [],
    isLoading: isAnomaliesLoading
  } = useQuery({
    queryKey: QUERY_KEYS.anomalies(selectedMetric?.id || ''),
    queryFn: () => metricsService.detectAnomalies(selectedMetric!.id),
    enabled: !!selectedMetric,
    staleTime: 15 * 60 * 1000 // 15 minutes
  });

  const {
    data: forecasts = [],
    isLoading: isForecastsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.forecasts(selectedMetric?.id || ''),
    queryFn: () => metricsService.generateForecast(selectedMetric!.id, 30),
    enabled: !!selectedMetric,
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  const {
    data: targets = [],
    isLoading: isTargetsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.targets(selectedMetric?.id || ''),
    queryFn: () => metricsService.getMetricTargets(selectedMetric!.id),
    enabled: !!selectedMetric
  });

  const {
    data: alerts = [],
    isLoading: isAlertsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.alerts(selectedMetric?.id),
    queryFn: () => metricsService.getMetricAlerts(selectedMetric?.id),
    enabled: enableAlerts,
    refetchInterval: 60000 // 1 minute for alerts
  });

  const {
    data: dashboards = [],
    isLoading: isDashboardsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.dashboards,
    queryFn: () => metricsService.getMetricDashboards(),
    staleTime: 10 * 60 * 1000
  });

  const {
    data: clinicalMetrics,
    isLoading: isClinicalLoading
  } = useQuery({
    queryKey: QUERY_KEYS.clinicalMetrics,
    queryFn: () => metricsService.getClinicalMetrics(),
    enabled: category === 'clinical' || !category,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const {
    data: financialMetrics,
    isLoading: isFinancialLoading
  } = useQuery({
    queryKey: QUERY_KEYS.financialMetrics,
    queryFn: () => metricsService.getFinancialMetrics(),
    enabled: category === 'financial' || !category,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const {
    data: operationalMetrics,
    isLoading: isOperationalLoading
  } = useQuery({
    queryKey: QUERY_KEYS.operationalMetrics,
    queryFn: () => metricsService.getOperationalMetrics(),
    enabled: category === 'operational' || !category,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Computed State
  const isLoading = isMetricsLoading || isHistoryLoading || isAnalysisLoading || 
    isTrendsLoading || isAnomaliesLoading || isForecastsLoading || isTargetsLoading || 
    isAlertsLoading || isDashboardsLoading || isClinicalLoading || isFinancialLoading || 
    isOperationalLoading;
    
  const error = metricsError;
  const isError = !!error;
  
  const comparisons = useMemo(() => {
    // This would be populated by comparison queries
    return [];
  }, []);
  
  const filters = useMemo(() => {
    // Generate filters based on available metrics
    const categoryFilters = [...new Set(metrics.map(m => m.category))];
    const typeFilters = [...new Set(metrics.map(m => m.type))];
    
    return [
      {
        id: 'category',
        name: 'Categoria',
        type: 'select' as const,
        options: categoryFilters.map(cat => ({ label: cat, value: cat }))
      },
      {
        id: 'type',
        name: 'Tipo',
        type: 'select' as const,
        options: typeFilters.map(type => ({ label: type, value: type }))
      },
      {
        id: 'dateRange',
        name: 'Período',
        type: 'dateRange' as const
      }
    ];
  }, [metrics]);
  
  const activeAlerts = useMemo(() => {
    return alerts.filter(alert => alert.isActive && !alert.isAcknowledged);
  }, [alerts]);

  // Mutations
  const createMetricMutation = useMutation({
    mutationFn: metricsService.createMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metrics(category, type) });
      toast.success('Métrica criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar métrica: ' + error.message);
    }
  });

  const updateMetricMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Metric> }) => 
      metricsService.updateMetric(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metrics(category, type) });
      if (selectedMetric) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metric(selectedMetric.id) });
      }
      toast.success('Métrica atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar métrica: ' + error.message);
    }
  });

  const deleteMetricMutation = useMutation({
    mutationFn: metricsService.deleteMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metrics(category, type) });
      setSelectedMetric(null);
      toast.success('Métrica excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir métrica: ' + error.message);
    }
  });

  // Actions
  const createMetric = useCallback(async (data: Partial<Metric>) => {
    return createMetricMutation.mutateAsync(data);
  }, [createMetricMutation]);

  const updateMetric = useCallback(async (id: string, data: Partial<Metric>) => {
    return updateMetricMutation.mutateAsync({ id, data });
  }, [updateMetricMutation]);

  const deleteMetric = useCallback(async (id: string) => {
    await deleteMetricMutation.mutateAsync(id);
  }, [deleteMetricMutation]);

  const calculateMetric = useCallback(async (id: string, parameters?: Record<string, any>) => {
    try {
      const result = await metricsService.calculateMetric(id, parameters);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metric(id) });
      return result;
    } catch (error: any) {
      toast.error('Erro ao calcular métrica: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const calculateBulkMetrics = useCallback(async (ids: string[], parameters?: Record<string, any>) => {
    try {
      const results = await metricsService.calculateBulkMetrics(ids, parameters);
      ids.forEach(id => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metric(id) });
      });
      return results;
    } catch (error: any) {
      toast.error('Erro ao calcular métricas: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const recalculateMetric = useCallback(async (id: string) => {
    try {
      await metricsService.recalculateMetric(id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metric(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.history(id) });
      toast.success('Métrica recalculada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao recalcular métrica: ' + error.message);
    }
  }, [queryClient]);

  const selectMetric = useCallback((metric: Metric | null) => {
    setSelectedMetric(metric);
  }, []);

  const getHistory = useCallback(async (metricId: string, period = '30d') => {
    try {
      return await metricsService.getMetricHistory(metricId, period);
    } catch (error: any) {
      toast.error('Erro ao obter histórico: ' + error.message);
      throw error;
    }
  }, []);

  const clearHistory = useCallback(async (metricId: string) => {
    try {
      await metricsService.clearMetricHistory(metricId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.history(metricId) });
      toast.success('Histórico limpo com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao limpar histórico: ' + error.message);
    }
  }, [queryClient]);

  const analyzeMetric = useCallback(async (metricId: string, options?: any) => {
    try {
      const result = await metricsService.analyzeMetric(metricId, options);
      queryClient.setQueryData(QUERY_KEYS.analysis(metricId), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao analisar métrica: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const analyzeTrends = useCallback(async (metricId: string, period = '30d') => {
    try {
      const result = await metricsService.analyzeTrends(metricId, period);
      queryClient.setQueryData(QUERY_KEYS.trends(metricId, period), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao analisar tendências: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const detectAnomalies = useCallback(async (metricId: string, sensitivity = 0.8) => {
    try {
      const result = await metricsService.detectAnomalies(metricId, sensitivity);
      queryClient.setQueryData(QUERY_KEYS.anomalies(metricId), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao detectar anomalias: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const generateForecast = useCallback(async (metricId: string, periods = 30) => {
    try {
      const result = await metricsService.generateForecast(metricId, periods);
      queryClient.setQueryData(QUERY_KEYS.forecasts(metricId), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao gerar previsão: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const compareMetrics = useCallback(async (metricIds: string[], period: ComparisonPeriod) => {
    try {
      return await metricsService.compareMetrics(metricIds, period);
    } catch (error: any) {
      toast.error('Erro ao comparar métricas: ' + error.message);
      throw error;
    }
  }, []);

  const comparePeriods = useCallback(async (metricId: string, periods: string[]) => {
    try {
      return await metricsService.comparePeriods(metricId, periods);
    } catch (error: any) {
      toast.error('Erro ao comparar períodos: ' + error.message);
      throw error;
    }
  }, []);

  const setTarget = useCallback(async (metricId: string, target: Partial<MetricTarget>) => {
    try {
      const result = await metricsService.setMetricTarget(metricId, target);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.targets(metricId) });
      toast.success('Meta definida com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao definir meta: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const updateTarget = useCallback(async (targetId: string, data: Partial<MetricTarget>) => {
    try {
      const result = await metricsService.updateMetricTarget(targetId, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.targets(selectedMetric?.id || '') });
      toast.success('Meta atualizada com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao atualizar meta: ' + error.message);
      throw error;
    }
  }, [queryClient, selectedMetric]);

  const deleteTarget = useCallback(async (targetId: string) => {
    try {
      await metricsService.deleteMetricTarget(targetId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.targets(selectedMetric?.id || '') });
      toast.success('Meta excluída com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir meta: ' + error.message);
    }
  }, [queryClient, selectedMetric]);

  const createAlert = useCallback(async (metricId: string, alert: Partial<MetricAlert>) => {
    try {
      const result = await metricsService.createMetricAlert(metricId, alert);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts(metricId) });
      toast.success('Alerta criado com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao criar alerta: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const updateAlert = useCallback(async (alertId: string, data: Partial<MetricAlert>) => {
    try {
      const result = await metricsService.updateMetricAlert(alertId, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
      toast.success('Alerta atualizado com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao atualizar alerta: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      await metricsService.deleteMetricAlert(alertId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
      toast.success('Alerta excluído com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir alerta: ' + error.message);
    }
  }, [queryClient]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await metricsService.acknowledgeAlert(alertId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
      toast.success('Alerta reconhecido!');
    } catch (error: any) {
      toast.error('Erro ao reconhecer alerta: ' + error.message);
    }
  }, [queryClient]);

  const snoozeAlert = useCallback(async (alertId: string, duration: number) => {
    try {
      await metricsService.snoozeAlert(alertId, duration);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
      toast.success('Alerta adiado!');
    } catch (error: any) {
      toast.error('Erro ao adiar alerta: ' + error.message);
    }
  }, [queryClient]);

  const createDashboard = useCallback(async (data: Partial<MetricDashboard>) => {
    try {
      const result = await metricsService.createMetricDashboard(data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard criado com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao criar dashboard: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const updateDashboard = useCallback(async (id: string, data: Partial<MetricDashboard>) => {
    try {
      const result = await metricsService.updateMetricDashboard(id, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard atualizado com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao atualizar dashboard: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const deleteDashboard = useCallback(async (id: string) => {
    try {
      await metricsService.deleteMetricDashboard(id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard excluído com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir dashboard: ' + error.message);
    }
  }, [queryClient]);

  const applyFilter = useCallback((filterId: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
    refetchMetrics();
  }, [refetchMetrics]);

  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
    refetchMetrics();
  }, [refetchMetrics]);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    refetchMetrics();
  }, [refetchMetrics]);

  const refreshData = useCallback(async () => {
    try {
      await refetchMetrics();
      if (selectedMetric) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.history(selectedMetric.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analysis(selectedMetric.id) });
      }
      toast.success('Dados atualizados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar dados: ' + error.message);
    }
  }, [refetchMetrics, selectedMetric, queryClient]);

  const exportMetrics = useCallback(async (format: 'csv' | 'xlsx' | 'json', metricIds?: string[]) => {
    try {
      const ids = metricIds || metrics.map(m => m.id);
      const blob = await metricsService.exportMetrics(ids, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `metrics-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Métricas exportadas com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao exportar métricas: ' + error.message);
    }
  }, [metrics]);

  const getRealTimeMetrics = useCallback(async (metricIds: string[]) => {
    try {
      return await metricsService.getRealTimeMetrics(metricIds);
    } catch (error: any) {
      toast.error('Erro ao obter métricas em tempo real: ' + error.message);
      throw error;
    }
  }, []);

  const subscribeToMetric = useCallback((metricId: string, callback: (data: any) => void) => {
    if (!enableRealtime) {
      console.warn('Real-time updates are disabled');
      return () => {};
    }

    // Setup real-time subscription (WebSocket, SSE, etc.)
    const unsubscribe = metricsService.subscribeToMetricUpdates(metricId, callback);
    
    setRealtimeSubscriptions(prev => {
      const newMap = new Map(prev);
      newMap.set(metricId, unsubscribe);
      return newMap;
    });

    return () => {
      unsubscribe();
      setRealtimeSubscriptions(prev => {
        const newMap = new Map(prev);
        newMap.delete(metricId);
        return newMap;
      });
    };
  }, [enableRealtime]);

  const getMetricValue = useCallback((metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric?.currentValue || null;
  }, [metrics]);

  const getMetricStatus = useCallback((metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    if (!metric) return 'unknown';
    
    return metricsService.getMetricHealthStatus(metric);
  }, [metrics]);

  const getMetricTrend = useCallback((metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    if (!metric) return 'stable' as TrendDirection;
    
    return metricsService.getTrendDirection(metric);
  }, [metrics]);

  const formatMetricValue = useCallback((value: any, metric: Metric) => {
    return metricsService.formatValue(value, metric.unit, metric.precision);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Cleanup real-time subscriptions
  useEffect(() => {
    return () => {
      realtimeSubscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [realtimeSubscriptions]);

  return {
    // State
    metrics,
    selectedMetric,
    isLoading,
    isError,
    error: error as Error | null,
    history,
    analysis: analysis || null,
    trends: trends || null,
    anomalies,
    forecasts,
    comparisons,
    targets,
    alerts,
    activeAlerts,
    dashboards,
    filters,
    activeFilters,
    clinicalMetrics: clinicalMetrics || null,
    financialMetrics: financialMetrics || null,
    operationalMetrics: operationalMetrics || null,
    
    // Actions
    createMetric,
    updateMetric,
    deleteMetric,
    calculateMetric,
    calculateBulkMetrics,
    recalculateMetric,
    selectMetric,
    getHistory,
    clearHistory,
    analyzeMetric,
    analyzeTrends,
    detectAnomalies,
    generateForecast,
    compareMetrics,
    comparePeriods,
    setTarget,
    updateTarget,
    deleteTarget,
    createAlert,
    updateAlert,
    deleteAlert,
    acknowledgeAlert,
    snoozeAlert,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    applyFilter,
    removeFilter,
    clearFilters,
    refreshData,
    exportMetrics,
    getRealTimeMetrics,
    subscribeToMetric,
    getMetricValue,
    getMetricStatus,
    getMetricTrend,
    formatMetricValue
  };
}

export default useMetrics;