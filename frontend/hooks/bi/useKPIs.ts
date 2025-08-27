// Hook para gerenciamento de KPIs (Key Performance Indicators)

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { kpiService } from '@/services/bi/kpiService';
import type {
  KPI,
  KPIThresholds,
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

export interface UseKPIsOptions {
  category?: KPICategory;
  type?: KPIType;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableAlerts?: boolean;
  enableRealtime?: boolean;
  includeInactive?: boolean;
}

export interface UseKPIsReturn {
  // KPIs State
  kpis: KPI[];
  selectedKPI: KPI | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Performance and Analysis
  performance: KPIPerformance[];
  analysis: KPIAnalysis | null;
  trends: KPITrendAnalysis | null;
  benchmarks: KPIBenchmark[];
  recommendations: KPIRecommendation[];
  riskAssessment: KPIRiskAssessment | null;
  
  // History and Targets
  history: KPIHistory[];
  targets: KPITarget[];
  alerts: KPIAlert[];
  activeAlerts: KPIAlert[];
  
  // Dashboards and Scorecards
  dashboards: KPIDashboard[];
  scorecards: any[];
  executiveSummary: any;
  
  // Filters
  filters: KPIFilter[];
  activeFilters: Record<string, any>;
  
  // Specialized KPIs
  clinicalKPIs: ClinicalKPIs | null;
  financialKPIs: FinancialKPIs | null;
  operationalKPIs: OperationalKPIs | null;
  staffKPIs: StaffKPIs | null;
  
  // KPI Actions
  createKPI: (data: Partial<KPI>) => Promise<KPI>;
  updateKPI: (id: string, data: Partial<KPI>) => Promise<KPI>;
  deleteKPI: (id: string) => Promise<void>;
  calculateKPI: (id: string, parameters?: Record<string, any>) => Promise<any>;
  calculateBulkKPIs: (ids: string[], parameters?: Record<string, any>) => Promise<Record<string, any>>;
  selectKPI: (kpi: KPI | null) => void;
  
  // Performance Actions
  analyzePerformance: (kpiId: string, period?: string) => Promise<KPIPerformance>;
  getPerformanceScore: (kpiId: string) => Promise<number>;
  comparePerformance: (kpiIds: string[], period: ComparisonPeriod) => Promise<KPIPerformance[]>;
  
  // Analysis Actions
  analyzeKPI: (kpiId: string, options?: any) => Promise<KPIAnalysis>;
  analyzeTrends: (kpiId: string, period?: string) => Promise<KPITrendAnalysis>;
  generateInsights: (kpiId: string) => Promise<string[]>;
  
  // Benchmark Actions
  getBenchmarks: (kpiId: string, type?: BenchmarkType) => Promise<KPIBenchmark[]>;
  compareToBenchmark: (kpiId: string, benchmarkId: string) => Promise<any>;
  
  // Recommendation Actions
  getRecommendations: (kpiId: string) => Promise<KPIRecommendation[]>;
  implementRecommendation: (recommendationId: string) => Promise<void>;
  dismissRecommendation: (recommendationId: string) => Promise<void>;
  
  // Risk Assessment Actions
  assessRisk: (kpiId: string) => Promise<KPIRiskAssessment>;
  updateRiskMitigation: (kpiId: string, strategies: any[]) => Promise<void>;
  
  // Target Actions
  setTarget: (kpiId: string, target: Partial<KPITarget>) => Promise<KPITarget>;
  updateTarget: (targetId: string, data: Partial<KPITarget>) => Promise<KPITarget>;
  deleteTarget: (targetId: string) => Promise<void>;
  
  // Alert Actions
  createAlert: (kpiId: string, alert: Partial<KPIAlert>) => Promise<KPIAlert>;
  updateAlert: (alertId: string, data: Partial<KPIAlert>) => Promise<KPIAlert>;
  deleteAlert: (alertId: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  
  // Dashboard Actions
  createDashboard: (data: Partial<KPIDashboard>) => Promise<KPIDashboard>;
  updateDashboard: (id: string, data: Partial<KPIDashboard>) => Promise<KPIDashboard>;
  deleteDashboard: (id: string) => Promise<void>;
  
  // Scorecard Actions
  createScorecard: (data: any) => Promise<any>;
  updateScorecard: (id: string, data: any) => Promise<any>;
  getExecutiveSummary: (period?: string) => Promise<any>;
  
  // Filter Actions
  applyFilter: (filterId: string, value: any) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  
  // Data Actions
  refreshData: () => Promise<void>;
  exportKPIs: (format: 'csv' | 'xlsx' | 'json', kpiIds?: string[]) => Promise<void>;
  importKPIs: (file: File) => Promise<void>;
  
  // Real-time Actions
  getRealTimeKPIs: (kpiIds: string[]) => Promise<Record<string, any>>;
  subscribeToKPI: (kpiId: string, callback: (data: any) => void) => () => void;
  
  // Utility
  getKPIValue: (kpiId: string) => any;
  getKPIStatus: (kpiId: string) => KPIStatus;
  getKPITrend: (kpiId: string) => TrendDirection;
  getKPIColor: (kpiId: string) => string;
  formatKPIValue: (value: any, kpi: KPI) => string;
  calculateScore: (kpiId: string) => number;
}

const QUERY_KEYS = {
  kpis: (category?: KPICategory, type?: KPIType, includeInactive?: boolean) => 
    ['bi', 'kpis', { category, type, includeInactive }],
  kpi: (id: string) => ['bi', 'kpi', id],
  performance: (kpiId: string, period?: string) => 
    ['bi', 'kpi-performance', kpiId, period],
  analysis: (kpiId: string) => ['bi', 'kpi-analysis', kpiId],
  trends: (kpiId: string, period?: string) => 
    ['bi', 'kpi-trends', kpiId, period],
  benchmarks: (kpiId: string, type?: BenchmarkType) => 
    ['bi', 'kpi-benchmarks', kpiId, type],
  recommendations: (kpiId: string) => ['bi', 'kpi-recommendations', kpiId],
  riskAssessment: (kpiId: string) => ['bi', 'kpi-risk-assessment', kpiId],
  history: (kpiId: string, period?: string) => 
    ['bi', 'kpi-history', kpiId, period],
  targets: (kpiId: string) => ['bi', 'kpi-targets', kpiId],
  alerts: (kpiId?: string) => ['bi', 'kpi-alerts', kpiId],
  dashboards: ['bi', 'kpi-dashboards'],
  scorecards: ['bi', 'kpi-scorecards'],
  executiveSummary: (period?: string) => ['bi', 'executive-summary', period],
  clinicalKPIs: ['bi', 'clinical-kpis'],
  financialKPIs: ['bi', 'financial-kpis'],
  operationalKPIs: ['bi', 'operational-kpis'],
  staffKPIs: ['bi', 'staff-kpis'],
  realTimeKPIs: (kpiIds: string[]) => ['bi', 'realtime-kpis', kpiIds]
};

export function useKPIs(options: UseKPIsOptions = {}): UseKPIsReturn {
  const {
    category,
    type,
    autoRefresh = false,
    refreshInterval = 30000,
    enableAlerts = true,
    enableRealtime = false,
    includeInactive = false
  } = options;

  const queryClient = useQueryClient();
  
  // Local State
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [realtimeSubscriptions, setRealtimeSubscriptions] = useState<Map<string, () => void>>(new Map());

  // Queries
  const {
    data: kpis = [],
    isLoading: isKPIsLoading,
    error: kpisError,
    refetch: refetchKPIs
  } = useQuery({
    queryKey: QUERY_KEYS.kpis(category, type, includeInactive),
    queryFn: () => kpiService.getKPIs({ category, type, includeInactive, filters: activeFilters }),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: autoRefresh ? 0 : 5 * 60 * 1000
  });

  const {
    data: performance = [],
    isLoading: isPerformanceLoading
  } = useQuery({
    queryKey: QUERY_KEYS.performance(selectedKPI?.id || '', '30d'),
    queryFn: () => kpiService.analyzePerformance(selectedKPI!.id, '30d'),
    enabled: !!selectedKPI,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const {
    data: analysis,
    isLoading: isAnalysisLoading
  } = useQuery({
    queryKey: QUERY_KEYS.analysis(selectedKPI?.id || ''),
    queryFn: () => kpiService.analyzeKPI(selectedKPI!.id),
    enabled: !!selectedKPI,
    staleTime: 10 * 60 * 1000
  });

  const {
    data: trends,
    isLoading: isTrendsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.trends(selectedKPI?.id || '', '30d'),
    queryFn: () => kpiService.analyzeTrends(selectedKPI!.id, '30d'),
    enabled: !!selectedKPI,
    staleTime: 10 * 60 * 1000
  });

  const {
    data: benchmarks = [],
    isLoading: isBenchmarksLoading
  } = useQuery({
    queryKey: QUERY_KEYS.benchmarks(selectedKPI?.id || ''),
    queryFn: () => kpiService.getBenchmarks(selectedKPI!.id),
    enabled: !!selectedKPI,
    staleTime: 30 * 60 * 1000
  });

  const {
    data: recommendations = [],
    isLoading: isRecommendationsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.recommendations(selectedKPI?.id || ''),
    queryFn: () => kpiService.getRecommendations(selectedKPI!.id),
    enabled: !!selectedKPI,
    staleTime: 15 * 60 * 1000
  });

  const {
    data: riskAssessment,
    isLoading: isRiskLoading
  } = useQuery({
    queryKey: QUERY_KEYS.riskAssessment(selectedKPI?.id || ''),
    queryFn: () => kpiService.assessRisk(selectedKPI!.id),
    enabled: !!selectedKPI,
    staleTime: 20 * 60 * 1000
  });

  const {
    data: history = [],
    isLoading: isHistoryLoading
  } = useQuery({
    queryKey: QUERY_KEYS.history(selectedKPI?.id || '', '30d'),
    queryFn: () => kpiService.getKPIHistory(selectedKPI!.id, '30d'),
    enabled: !!selectedKPI,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const {
    data: targets = [],
    isLoading: isTargetsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.targets(selectedKPI?.id || ''),
    queryFn: () => kpiService.getKPITargets(selectedKPI!.id),
    enabled: !!selectedKPI
  });

  const {
    data: alerts = [],
    isLoading: isAlertsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.alerts(selectedKPI?.id),
    queryFn: () => kpiService.getKPIAlerts(selectedKPI?.id),
    enabled: enableAlerts,
    refetchInterval: 60000
  });

  const {
    data: dashboards = [],
    isLoading: isDashboardsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.dashboards,
    queryFn: () => kpiService.getKPIDashboards(),
    staleTime: 10 * 60 * 1000
  });

  const {
    data: scorecards = [],
    isLoading: isScorecardsLoading
  } = useQuery({
    queryKey: QUERY_KEYS.scorecards,
    queryFn: () => kpiService.getScorecards(),
    staleTime: 15 * 60 * 1000
  });

  const {
    data: executiveSummary,
    isLoading: isExecutiveLoading
  } = useQuery({
    queryKey: QUERY_KEYS.executiveSummary('current'),
    queryFn: () => kpiService.getExecutiveSummary('current'),
    staleTime: 30 * 60 * 1000
  });

  const {
    data: clinicalKPIs,
    isLoading: isClinicalLoading
  } = useQuery({
    queryKey: QUERY_KEYS.clinicalKPIs,
    queryFn: () => kpiService.getClinicalKPIs(),
    enabled: category === 'clinical' || !category,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const {
    data: financialKPIs,
    isLoading: isFinancialLoading
  } = useQuery({
    queryKey: QUERY_KEYS.financialKPIs,
    queryFn: () => kpiService.getFinancialKPIs(),
    enabled: category === 'financial' || !category,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const {
    data: operationalKPIs,
    isLoading: isOperationalLoading
  } = useQuery({
    queryKey: QUERY_KEYS.operationalKPIs,
    queryFn: () => kpiService.getOperationalKPIs(),
    enabled: category === 'operational' || !category,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const {
    data: staffKPIs,
    isLoading: isStaffLoading
  } = useQuery({
    queryKey: QUERY_KEYS.staffKPIs,
    queryFn: () => kpiService.getStaffKPIs(),
    enabled: category === 'staff' || !category,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Computed State
  const isLoading = isKPIsLoading || isPerformanceLoading || isAnalysisLoading || 
    isTrendsLoading || isBenchmarksLoading || isRecommendationsLoading || isRiskLoading ||
    isHistoryLoading || isTargetsLoading || isAlertsLoading || isDashboardsLoading ||
    isScorecardsLoading || isExecutiveLoading || isClinicalLoading || isFinancialLoading ||
    isOperationalLoading || isStaffLoading;
    
  const error = kpisError;
  const isError = !!error;
  
  const filters = useMemo(() => {
    const categoryFilters = [...new Set(kpis.map(k => k.category))];
    const typeFilters = [...new Set(kpis.map(k => k.type))];
    const statusFilters = [...new Set(kpis.map(k => k.status))];
    
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
        id: 'status',
        name: 'Status',
        type: 'select' as const,
        options: statusFilters.map(status => ({ label: status, value: status }))
      },
      {
        id: 'dateRange',
        name: 'Período',
        type: 'dateRange' as const
      }
    ];
  }, [kpis]);
  
  const activeAlerts = useMemo(() => {
    return alerts.filter(alert => alert.isActive && !alert.isAcknowledged);
  }, [alerts]);

  // Mutations
  const createKPIMutation = useMutation({
    mutationFn: kpiService.createKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kpis(category, type, includeInactive) });
      toast.success('KPI criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar KPI: ' + error.message);
    }
  });

  const updateKPIMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<KPI> }) => 
      kpiService.updateKPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kpis(category, type, includeInactive) });
      if (selectedKPI) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kpi(selectedKPI.id) });
      }
      toast.success('KPI atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar KPI: ' + error.message);
    }
  });

  const deleteKPIMutation = useMutation({
    mutationFn: kpiService.deleteKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kpis(category, type, includeInactive) });
      setSelectedKPI(null);
      toast.success('KPI excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir KPI: ' + error.message);
    }
  });

  // Actions
  const createKPI = useCallback(async (data: Partial<KPI>) => {
    return createKPIMutation.mutateAsync(data);
  }, [createKPIMutation]);

  const updateKPI = useCallback(async (id: string, data: Partial<KPI>) => {
    return updateKPIMutation.mutateAsync({ id, data });
  }, [updateKPIMutation]);

  const deleteKPI = useCallback(async (id: string) => {
    await deleteKPIMutation.mutateAsync(id);
  }, [deleteKPIMutation]);

  const calculateKPI = useCallback(async (id: string, parameters?: Record<string, any>) => {
    try {
      const result = await kpiService.calculateKPI(id, parameters);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kpi(id) });
      return result;
    } catch (error: any) {
      toast.error('Erro ao calcular KPI: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const calculateBulkKPIs = useCallback(async (ids: string[], parameters?: Record<string, any>) => {
    try {
      const results = await kpiService.calculateBulkKPIs(ids, parameters);
      ids.forEach(id => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kpi(id) });
      });
      return results;
    } catch (error: any) {
      toast.error('Erro ao calcular KPIs: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const selectKPI = useCallback((kpi: KPI | null) => {
    setSelectedKPI(kpi);
  }, []);

  const analyzePerformance = useCallback(async (kpiId: string, period = '30d') => {
    try {
      const result = await kpiService.analyzePerformance(kpiId, period);
      queryClient.setQueryData(QUERY_KEYS.performance(kpiId, period), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao analisar performance: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const getPerformanceScore = useCallback(async (kpiId: string) => {
    try {
      return await kpiService.getPerformanceScore(kpiId);
    } catch (error: any) {
      toast.error('Erro ao obter score de performance: ' + error.message);
      throw error;
    }
  }, []);

  const comparePerformance = useCallback(async (kpiIds: string[], period: ComparisonPeriod) => {
    try {
      return await kpiService.comparePerformance(kpiIds, period);
    } catch (error: any) {
      toast.error('Erro ao comparar performance: ' + error.message);
      throw error;
    }
  }, []);

  const analyzeKPI = useCallback(async (kpiId: string, options?: any) => {
    try {
      const result = await kpiService.analyzeKPI(kpiId, options);
      queryClient.setQueryData(QUERY_KEYS.analysis(kpiId), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao analisar KPI: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const analyzeTrends = useCallback(async (kpiId: string, period = '30d') => {
    try {
      const result = await kpiService.analyzeTrends(kpiId, period);
      queryClient.setQueryData(QUERY_KEYS.trends(kpiId, period), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao analisar tendências: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const generateInsights = useCallback(async (kpiId: string) => {
    try {
      return await kpiService.generateInsights(kpiId);
    } catch (error: any) {
      toast.error('Erro ao gerar insights: ' + error.message);
      throw error;
    }
  }, []);

  const getBenchmarks = useCallback(async (kpiId: string, type?: BenchmarkType) => {
    try {
      const result = await kpiService.getBenchmarks(kpiId, type);
      queryClient.setQueryData(QUERY_KEYS.benchmarks(kpiId, type), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao obter benchmarks: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const compareToBenchmark = useCallback(async (kpiId: string, benchmarkId: string) => {
    try {
      return await kpiService.compareToBenchmark(kpiId, benchmarkId);
    } catch (error: any) {
      toast.error('Erro ao comparar com benchmark: ' + error.message);
      throw error;
    }
  }, []);

  const getRecommendations = useCallback(async (kpiId: string) => {
    try {
      const result = await kpiService.getRecommendations(kpiId);
      queryClient.setQueryData(QUERY_KEYS.recommendations(kpiId), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao obter recomendações: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const implementRecommendation = useCallback(async (recommendationId: string) => {
    try {
      await kpiService.implementRecommendation(recommendationId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recommendations(selectedKPI?.id || '') });
      toast.success('Recomendação implementada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao implementar recomendação: ' + error.message);
    }
  }, [queryClient, selectedKPI]);

  const dismissRecommendation = useCallback(async (recommendationId: string) => {
    try {
      await kpiService.dismissRecommendation(recommendationId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recommendations(selectedKPI?.id || '') });
      toast.success('Recomendação dispensada!');
    } catch (error: any) {
      toast.error('Erro ao dispensar recomendação: ' + error.message);
    }
  }, [queryClient, selectedKPI]);

  const assessRisk = useCallback(async (kpiId: string) => {
    try {
      const result = await kpiService.assessRisk(kpiId);
      queryClient.setQueryData(QUERY_KEYS.riskAssessment(kpiId), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao avaliar risco: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const updateRiskMitigation = useCallback(async (kpiId: string, strategies: any[]) => {
    try {
      await kpiService.updateRiskMitigation(kpiId, strategies);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.riskAssessment(kpiId) });
      toast.success('Estratégias de mitigação atualizadas!');
    } catch (error: any) {
      toast.error('Erro ao atualizar mitigação: ' + error.message);
    }
  }, [queryClient]);

  const setTarget = useCallback(async (kpiId: string, target: Partial<KPITarget>) => {
    try {
      const result = await kpiService.setKPITarget(kpiId, target);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.targets(kpiId) });
      toast.success('Meta definida com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao definir meta: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const updateTarget = useCallback(async (targetId: string, data: Partial<KPITarget>) => {
    try {
      const result = await kpiService.updateKPITarget(targetId, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.targets(selectedKPI?.id || '') });
      toast.success('Meta atualizada com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao atualizar meta: ' + error.message);
      throw error;
    }
  }, [queryClient, selectedKPI]);

  const deleteTarget = useCallback(async (targetId: string) => {
    try {
      await kpiService.deleteKPITarget(targetId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.targets(selectedKPI?.id || '') });
      toast.success('Meta excluída com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir meta: ' + error.message);
    }
  }, [queryClient, selectedKPI]);

  const createAlert = useCallback(async (kpiId: string, alert: Partial<KPIAlert>) => {
    try {
      const result = await kpiService.createKPIAlert(kpiId, alert);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts(kpiId) });
      toast.success('Alerta criado com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao criar alerta: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const updateAlert = useCallback(async (alertId: string, data: Partial<KPIAlert>) => {
    try {
      const result = await kpiService.updateKPIAlert(alertId, data);
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
      await kpiService.deleteKPIAlert(alertId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
      toast.success('Alerta excluído com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir alerta: ' + error.message);
    }
  }, [queryClient]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await kpiService.acknowledgeAlert(alertId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
      toast.success('Alerta reconhecido!');
    } catch (error: any) {
      toast.error('Erro ao reconhecer alerta: ' + error.message);
    }
  }, [queryClient]);

  const createDashboard = useCallback(async (data: Partial<KPIDashboard>) => {
    try {
      const result = await kpiService.createKPIDashboard(data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard criado com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao criar dashboard: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const updateDashboard = useCallback(async (id: string, data: Partial<KPIDashboard>) => {
    try {
      const result = await kpiService.updateKPIDashboard(id, data);
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
      await kpiService.deleteKPIDashboard(id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard excluído com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir dashboard: ' + error.message);
    }
  }, [queryClient]);

  const createScorecard = useCallback(async (data: any) => {
    try {
      const result = await kpiService.createScorecard(data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scorecards });
      toast.success('Scorecard criado com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao criar scorecard: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const updateScorecard = useCallback(async (id: string, data: any) => {
    try {
      const result = await kpiService.updateScorecard(id, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scorecards });
      toast.success('Scorecard atualizado com sucesso!');
      return result;
    } catch (error: any) {
      toast.error('Erro ao atualizar scorecard: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const getExecutiveSummary = useCallback(async (period = 'current') => {
    try {
      const result = await kpiService.getExecutiveSummary(period);
      queryClient.setQueryData(QUERY_KEYS.executiveSummary(period), result);
      return result;
    } catch (error: any) {
      toast.error('Erro ao obter resumo executivo: ' + error.message);
      throw error;
    }
  }, [queryClient]);

  const applyFilter = useCallback((filterId: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
    refetchKPIs();
  }, [refetchKPIs]);

  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
    refetchKPIs();
  }, [refetchKPIs]);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    refetchKPIs();
  }, [refetchKPIs]);

  const refreshData = useCallback(async () => {
    try {
      await refetchKPIs();
      if (selectedKPI) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance(selectedKPI.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analysis(selectedKPI.id) });
      }
      toast.success('Dados atualizados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar dados: ' + error.message);
    }
  }, [refetchKPIs, selectedKPI, queryClient]);

  const exportKPIs = useCallback(async (format: 'csv' | 'xlsx' | 'json', kpiIds?: string[]) => {
    try {
      const ids = kpiIds || kpis.map(k => k.id);
      const blob = await kpiService.exportKPIs(ids, format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kpis-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('KPIs exportados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao exportar KPIs: ' + error.message);
    }
  }, [kpis]);

  const importKPIs = useCallback(async (file: File) => {
    try {
      await kpiService.importKPIs(file);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kpis(category, type, includeInactive) });
      toast.success('KPIs importados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao importar KPIs: ' + error.message);
    }
  }, [queryClient, category, type, includeInactive]);

  const getRealTimeKPIs = useCallback(async (kpiIds: string[]) => {
    try {
      return await kpiService.getRealTimeKPIs(kpiIds);
    } catch (error: any) {
      toast.error('Erro ao obter KPIs em tempo real: ' + error.message);
      throw error;
    }
  }, []);

  const subscribeToKPI = useCallback((kpiId: string, callback: (data: any) => void) => {
    if (!enableRealtime) {
      console.warn('Real-time updates are disabled');
      return () => {};
    }

    const unsubscribe = kpiService.subscribeToKPIUpdates(kpiId, callback);
    
    setRealtimeSubscriptions(prev => {
      const newMap = new Map(prev);
      newMap.set(kpiId, unsubscribe);
      return newMap;
    });

    return () => {
      unsubscribe();
      setRealtimeSubscriptions(prev => {
        const newMap = new Map(prev);
        newMap.delete(kpiId);
        return newMap;
      });
    };
  }, [enableRealtime]);

  const getKPIValue = useCallback((kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    return kpi?.currentValue || null;
  }, [kpis]);

  const getKPIStatus = useCallback((kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    if (!kpi) return 'unknown' as KPIStatus;
    
    return kpiService.getKPIStatus(kpi);
  }, [kpis]);

  const getKPITrend = useCallback((kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    if (!kpi) return 'stable' as TrendDirection;
    
    return kpiService.getTrendDirection(kpi);
  }, [kpis]);

  const getKPIColor = useCallback((kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    if (!kpi) return '#gray';
    
    return kpiService.getKPIColor(kpi);
  }, [kpis]);

  const formatKPIValue = useCallback((value: any, kpi: KPI) => {
    return kpiService.formatValue(value, kpi.unit, kpi.precision);
  }, []);

  const calculateScore = useCallback((kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId);
    if (!kpi) return 0;
    
    return kpiService.calculateScore(kpi);
  }, [kpis]);

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
    kpis,
    selectedKPI,
    isLoading,
    isError,
    error: error as Error | null,
    performance,
    analysis: analysis || null,
    trends: trends || null,
    benchmarks,
    recommendations,
    riskAssessment: riskAssessment || null,
    history,
    targets,
    alerts,
    activeAlerts,
    dashboards,
    scorecards,
    executiveSummary,
    filters,
    activeFilters,
    clinicalKPIs: clinicalKPIs || null,
    financialKPIs: financialKPIs || null,
    operationalKPIs: operationalKPIs || null,
    staffKPIs: staffKPIs || null,
    
    // Actions
    createKPI,
    updateKPI,
    deleteKPI,
    calculateKPI,
    calculateBulkKPIs,
    selectKPI,
    analyzePerformance,
    getPerformanceScore,
    comparePerformance,
    analyzeKPI,
    analyzeTrends,
    generateInsights,
    getBenchmarks,
    compareToBenchmark,
    getRecommendations,
    implementRecommendation,
    dismissRecommendation,
    assessRisk,
    updateRiskMitigation,
    setTarget,
    updateTarget,
    deleteTarget,
    createAlert,
    updateAlert,
    deleteAlert,
    acknowledgeAlert,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    createScorecard,
    updateScorecard,
    getExecutiveSummary,
    applyFilter,
    removeFilter,
    clearFilters,
    refreshData,
    exportKPIs,
    importKPIs,
    getRealTimeKPIs,
    subscribeToKPI,
    getKPIValue,
    getKPIStatus,
    getKPITrend,
    getKPIColor,
    formatKPIValue,
    calculateScore
  };
}

export default useKPIs;