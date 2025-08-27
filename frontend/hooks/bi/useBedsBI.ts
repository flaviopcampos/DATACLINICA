import { useQuery, useQueries } from '@tanstack/react-query';
import { bedsBIService } from '@/services/bi/bedsBIService';
import type {
  BedMetrics,
  BedOccupancyTrends,
  DepartmentBedAnalytics,
  BedTypeAnalytics,
  BedAnalytics
} from '@/services/bi/bedsBIService';

// Hook para métricas de leitos
export function useBedMetrics(filters?: any) {
  return useQuery({
    queryKey: ['bed-metrics', filters],
    queryFn: () => bedsBIService.getBedMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000 // Atualizar a cada 5 minutos
  });
}

// Hook para tendências de ocupação de leitos
export function useBedOccupancyTrends(filters?: any) {
  return useQuery({
    queryKey: ['bed-occupancy-trends', filters],
    queryFn: () => bedsBIService.getBedOccupancyTrends(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 10 * 60 * 1000
  });
}

// Hook para análise por departamento
export function useDepartmentBedAnalytics(filters?: any) {
  return useQuery({
    queryKey: ['department-bed-analytics', filters],
    queryFn: () => bedsBIService.getDepartmentBedAnalytics(filters),
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchInterval: 15 * 60 * 1000
  });
}

// Hook para análise por tipo de leito
export function useBedTypeAnalytics(filters?: any) {
  return useQuery({
    queryKey: ['bed-type-analytics', filters],
    queryFn: () => bedsBIService.getBedTypeAnalytics(filters),
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchInterval: 15 * 60 * 1000
  });
}

// Hook para análise completa de leitos
export function useBedAnalytics(filters?: any) {
  return useQuery({
    queryKey: ['bed-analytics', filters],
    queryFn: () => bedsBIService.getBedAnalytics(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 10 * 60 * 1000
  });
}

// Hook para KPIs de leitos
export function useBedKPIs(filters?: any) {
  return useQuery({
    queryKey: ['bed-kpis', filters],
    queryFn: () => bedsBIService.getBedKPIs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000
  });
}

// Hook para dados de gráficos de leitos
export function useBedChartData(chartType: string, filters?: any) {
  return useQuery({
    queryKey: ['bed-chart-data', chartType, filters],
    queryFn: () => bedsBIService.getBedChartData(chartType, filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 10 * 60 * 1000,
    enabled: !!chartType
  });
}

// Hook combinado para dashboard de leitos
export function useBedsDashboard(filters?: any) {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['bed-metrics', filters],
        queryFn: () => bedsBIService.getBedMetrics(filters),
        staleTime: 5 * 60 * 1000
      },
      {
        queryKey: ['bed-occupancy-trends', filters],
        queryFn: () => bedsBIService.getBedOccupancyTrends(filters),
        staleTime: 10 * 60 * 1000
      },
      {
        queryKey: ['department-bed-analytics', filters],
        queryFn: () => bedsBIService.getDepartmentBedAnalytics(filters),
        staleTime: 15 * 60 * 1000
      },
      {
        queryKey: ['bed-type-analytics', filters],
        queryFn: () => bedsBIService.getBedTypeAnalytics(filters),
        staleTime: 15 * 60 * 1000
      }
    ]
  });

  const [metricsQuery, trendsQuery, departmentQuery, bedTypeQuery] = queries;

  return {
    metrics: metricsQuery.data,
    trends: trendsQuery.data,
    departmentAnalytics: departmentQuery.data,
    bedTypeAnalytics: bedTypeQuery.data,
    isLoading: queries.some(query => query.isLoading),
    isError: queries.some(query => query.isError),
    error: queries.find(query => query.error)?.error,
    refetch: () => queries.forEach(query => query.refetch())
  };
}

// Hook para estatísticas em tempo real de leitos
export function useBedRealTimeStats(filters?: any) {
  return useQuery({
    queryKey: ['bed-realtime-stats', filters],
    queryFn: () => bedsBIService.getBedMetrics(filters),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Atualizar a cada 30 segundos
    refetchIntervalInBackground: true
  });
}

// Hook para comparação de períodos de leitos
export function useBedComparison(currentFilters?: any, previousFilters?: any) {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['bed-metrics-current', currentFilters],
        queryFn: () => bedsBIService.getBedMetrics(currentFilters),
        staleTime: 10 * 60 * 1000
      },
      {
        queryKey: ['bed-metrics-previous', previousFilters],
        queryFn: () => bedsBIService.getBedMetrics(previousFilters),
        staleTime: 10 * 60 * 1000,
        enabled: !!previousFilters
      }
    ]
  });

  const [currentQuery, previousQuery] = queries;

  return {
    current: currentQuery.data,
    previous: previousQuery.data,
    comparison: currentQuery.data && previousQuery.data ? {
      occupancyRateChange: currentQuery.data.occupancyRate - previousQuery.data.occupancyRate,
      averageStayChange: currentQuery.data.averageStayDuration - previousQuery.data.averageStayDuration,
      turnoverRateChange: currentQuery.data.turnoverRate - previousQuery.data.turnoverRate,
      revenueChange: currentQuery.data.revenuePerBed - previousQuery.data.revenuePerBed
    } : null,
    isLoading: queries.some(query => query.isLoading),
    isError: queries.some(query => query.isError)
  };
}

// Hook para alertas de leitos
export function useBedAlerts(filters?: any) {
  const { data: analytics } = useBedAnalytics(filters);
  
  const alerts = [];
  
  if (analytics?.alerts.highOccupancy) {
    alerts.push({
      id: 'high-occupancy',
      type: 'warning' as const,
      title: 'Alta Taxa de Ocupação',
      message: `Taxa de ocupação atual: ${analytics.metrics.occupancyRate.toFixed(1)}%`,
      priority: 'high' as const,
      timestamp: new Date().toISOString()
    });
  }
  
  if (analytics?.alerts.maintenanceNeeded) {
    alerts.push({
      id: 'maintenance-needed',
      type: 'error' as const,
      title: 'Leitos em Manutenção',
      message: `${analytics.metrics.maintenanceBeds} leitos precisam de manutenção`,
      priority: 'high' as const,
      timestamp: new Date().toISOString()
    });
  }
  
  if (analytics?.alerts.lowTurnover) {
    alerts.push({
      id: 'low-turnover',
      type: 'warning' as const,
      title: 'Baixa Rotatividade',
      message: `Taxa de rotatividade: ${analytics.metrics.turnoverRate.toFixed(1)}`,
      priority: 'medium' as const,
      timestamp: new Date().toISOString()
    });
  }
  
  if (analytics?.alerts.revenueDecline) {
    alerts.push({
      id: 'revenue-decline',
      type: 'error' as const,
      title: 'Queda na Receita por Leito',
      message: `Receita por leito: R$ ${analytics.metrics.revenuePerBed.toFixed(2)}`,
      priority: 'high' as const,
      timestamp: new Date().toISOString()
    });
  }
  
  return {
    alerts,
    hasAlerts: alerts.length > 0,
    highPriorityAlerts: alerts.filter(alert => alert.priority === 'high'),
    isLoading: !analytics
  };
}