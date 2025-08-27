import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import BedOccupancyService from '../services/bedOccupancyService';
import type {
  BedOccupancy,
  OccupancyStats,
  OccupancyForecast,
  OccupancyFilters,
  OccupancySettings,
  PerformanceMetrics,
  TrendAnalysis,
  UseBedOccupancyReturn,
  UseOccupancyAnalyticsReturn,
  UseOccupancyReportsReturn
} from '../types/bedOccupancy';

// Hook principal para ocupação de leitos
export function useBedOccupancy(filters?: OccupancyFilters): UseBedOccupancyReturn {
  const queryClient = useQueryClient();

  // Query para dados de ocupação atual
  const {
    data: occupancyData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bed-occupancy', filters],
    queryFn: () => BedOccupancyService.getCurrentOccupancy(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });

  // Query para estatísticas de ocupação
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['occupancy-stats', filters],
    queryFn: () => BedOccupancyService.getOccupancyStats(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Query para tendências
  const {
    data: trends = [],
    isLoading: isLoadingTrends
  } = useQuery({
    queryKey: ['occupancy-trends', filters],
    queryFn: () => BedOccupancyService.getOccupancyTrends(filters),
    staleTime: 10 * 60 * 1000,
  });

  return {
    occupancyData: occupancyData || null,
    stats: stats || null,
    trends,
    isLoading: isLoading || isLoadingStats || isLoadingTrends,
    error: error?.message || null,
    refetch
  };
}

// Hook para análise de ocupação
export function useOccupancyAnalytics(filters?: OccupancyFilters): UseOccupancyAnalyticsReturn {
  // Query para previsões
  const {
    data: forecast,
    isLoading: isLoadingForecast
  } = useQuery({
    queryKey: ['occupancy-forecast', filters],
    queryFn: () => BedOccupancyService.getOccupancyForecast(filters),
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  // Query para análise de tendências
  const {
    data: trendAnalysis,
    isLoading: isLoadingTrendAnalysis
  } = useQuery({
    queryKey: ['trend-analysis', filters],
    queryFn: () => BedOccupancyService.getTrendAnalysis(filters),
    staleTime: 15 * 60 * 1000,
  });

  // Query para métricas de performance
  const {
    data: performanceMetrics,
    isLoading: isLoadingPerformance
  } = useQuery({
    queryKey: ['performance-metrics', filters],
    queryFn: () => BedOccupancyService.getPerformanceMetrics(filters),
    staleTime: 10 * 60 * 1000,
  });

  // Query para padrões sazonais
  const {
    data: seasonalPatterns,
    isLoading: isLoadingSeasonalPatterns
  } = useQuery({
    queryKey: ['seasonal-patterns', filters],
    queryFn: () => BedOccupancyService.getSeasonalPatterns(filters),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  return {
    forecast: forecast || null,
    trendAnalysis: trendAnalysis || null,
    performanceMetrics: performanceMetrics || null,
    seasonalPatterns: seasonalPatterns || null,
    isLoading: isLoadingForecast || isLoadingTrendAnalysis || isLoadingPerformance || isLoadingSeasonalPatterns
  };
}

// Hook para relatórios de ocupação
export function useOccupancyReports(filters?: OccupancyFilters): UseOccupancyReportsReturn {
  const queryClient = useQueryClient();

  // Query para relatórios disponíveis
  const {
    data: availableReports = [],
    isLoading
  } = useQuery({
    queryKey: ['occupancy-reports', filters],
    queryFn: () => BedOccupancyService.getOccupancyReports(filters),
    staleTime: 10 * 60 * 1000,
  });

  // Mutation para gerar relatório
  const generateReportMutation = useMutation({
    mutationFn: ({ type, filters: reportFilters }: { type: string; filters?: any }) => 
      BedOccupancyService.generateOccupancyReport(type, reportFilters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occupancy-reports'] });
      toast.success('Relatório gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar relatório');
    }
  });

  // Mutation para exportar relatório
  const exportReportMutation = useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: string }) => 
      BedOccupancyService.exportOccupancyReport(reportId, format),
    onSuccess: () => {
      toast.success('Relatório exportado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao exportar relatório');
    }
  });

  // Mutation para agendar relatório
  const scheduleReportMutation = useMutation({
    mutationFn: ({ type, schedule, filters: reportFilters }: { type: string; schedule: any; filters?: any }) => 
      BedOccupancyService.scheduleOccupancyReport(type, schedule, reportFilters),
    onSuccess: () => {
      toast.success('Relatório agendado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao agendar relatório');
    }
  });

  return {
    availableReports,
    isLoading,
    generateReport: generateReportMutation.mutateAsync,
    exportReport: exportReportMutation.mutateAsync,
    scheduleReport: scheduleReportMutation.mutateAsync,
    isGenerating: generateReportMutation.isPending,
    isExporting: exportReportMutation.isPending,
    isScheduling: scheduleReportMutation.isPending
  };
}

// Hook para ocupação por departamento
export function useDepartmentOccupancy(departmentId: string) {
  return useQuery({
    queryKey: ['department-occupancy', departmentId],
    queryFn: () => BedOccupancyService.getDepartmentOccupancy(departmentId),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook para ocupação por tipo de leito
export function useBedTypeOccupancy(bedType: string) {
  return useQuery({
    queryKey: ['bed-type-occupancy', bedType],
    queryFn: () => BedOccupancyService.getBedTypeOccupancy(bedType),
    enabled: !!bedType,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook para ocupação por andar
export function useFloorOccupancy(floor: string) {
  return useQuery({
    queryKey: ['floor-occupancy', floor],
    queryFn: () => BedOccupancyService.getFloorOccupancy(floor),
    enabled: !!floor,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook para detalhes de ocupação de um leito específico
export function useBedOccupancyDetails(bedId: string) {
  return useQuery({
    queryKey: ['bed-occupancy-details', bedId],
    queryFn: () => BedOccupancyService.getBedOccupancyDetails(bedId),
    enabled: !!bedId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para buscar leitos disponíveis
export function useAvailableBeds(filters?: any) {
  return useQuery({
    queryKey: ['available-beds', filters],
    queryFn: () => BedOccupancyService.getAvailableBeds(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook para buscar leitos ocupados
export function useOccupiedBeds(filters?: any) {
  return useQuery({
    queryKey: ['occupied-beds', filters],
    queryFn: () => BedOccupancyService.getOccupiedBeds(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook para buscar leitos em manutenção
export function useMaintenanceBeds(filters?: any) {
  return useQuery({
    queryKey: ['maintenance-beds', filters],
    queryFn: () => BedOccupancyService.getMaintenanceBeds(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar leitos em limpeza
export function useCleaningBeds(filters?: any) {
  return useQuery({
    queryKey: ['cleaning-beds', filters],
    queryFn: () => BedOccupancyService.getCleaningBeds(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook para buscar leitos reservados
export function useReservedBeds(filters?: any) {
  return useQuery({
    queryKey: ['reserved-beds', filters],
    queryFn: () => BedOccupancyService.getReservedBeds(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook para alertas de capacidade
export function useCapacityAlerts(filters?: any) {
  const queryClient = useQueryClient();

  const {
    data: alerts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['capacity-alerts', filters],
    queryFn: () => BedOccupancyService.getCapacityAlerts(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // Atualizar a cada 2 minutos
  });

  // Mutation para reconhecer alerta
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: string) => BedOccupancyService.acknowledgeCapacityAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capacity-alerts'] });
      toast.success('Alerta reconhecido!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao reconhecer alerta');
    }
  });

  return {
    alerts,
    isLoading,
    error: error?.message || null,
    refetch,
    acknowledgeAlert: acknowledgeAlertMutation.mutateAsync,
    isAcknowledging: acknowledgeAlertMutation.isPending
  };
}

// Hook para histórico de ocupação
export function useOccupancyHistory(bedId?: string, departmentId?: string, dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['occupancy-history', bedId, departmentId, dateRange],
    queryFn: () => BedOccupancyService.getOccupancyHistory(bedId, departmentId, dateRange),
    enabled: !!(bedId || departmentId),
    staleTime: 10 * 60 * 1000,
  });
}

// Hook para configurações de ocupação
export function useOccupancySettings() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['occupancy-settings'],
    queryFn: () => BedOccupancyService.getOccupancySettings(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  // Mutation para atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: OccupancySettings) => BedOccupancyService.updateOccupancySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occupancy-settings'] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar configurações');
    }
  });

  return {
    settings: settings || null,
    isLoading,
    error: error?.message || null,
    refetch,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending
  };
}

// Hook para reservar leito
export function useBedReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bedId, patientId, reservedUntil, notes }: { bedId: string; patientId: string; reservedUntil: string; notes?: string }) => 
      BedOccupancyService.reserveBed(bedId, patientId, reservedUntil, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['available-beds'] });
      queryClient.invalidateQueries({ queryKey: ['reserved-beds'] });
      toast.success('Leito reservado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao reservar leito');
    }
  });
}

// Hook para bloquear leito
export function useBedBlocking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bedId, reason, blockedUntil }: { bedId: string; reason: string; blockedUntil?: string }) => 
      BedOccupancyService.blockBed(bedId, reason, blockedUntil),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['available-beds'] });
      toast.success('Leito bloqueado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao bloquear leito');
    }
  });
}

// Hook para resumo de ocupação
export function useOccupancySummary(filters?: any) {
  return useQuery({
    queryKey: ['occupancy-summary', filters],
    queryFn: () => BedOccupancyService.getOccupancySummary(filters),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook para atualizar dados de ocupação
export function useOccupancyDataUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => BedOccupancyService.updateOccupancyData(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['occupancy-stats'] });
      toast.success('Dados de ocupação atualizados!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar dados');
    }
  });
}

// Hook para validar dados de ocupação
export function useOccupancyDataValidation() {
  return useMutation({
    mutationFn: (data: any) => BedOccupancyService.validateOccupancyData(data),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao validar dados');
    }
  });
}