import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { appointmentsBIService } from '@/services/bi/appointmentsBIService';
import type {
  AppointmentMetrics,
  AppointmentTrends,
  DoctorPerformance,
  AppointmentAnalytics
} from '@/services/bi/appointmentsBIService';
import type {
  KPIData,
  ChartData
} from '@/types/bi/metrics';
import type { AppointmentFilters } from '@/types/appointments';

// Hook para métricas de agendamentos
export function useAppointmentMetrics(filters?: AppointmentFilters): UseQueryResult<AppointmentMetrics> {
  return useQuery({
    queryKey: ['bi', 'appointments', 'metrics', filters],
    queryFn: () => appointmentsBIService.getAppointmentMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualiza a cada 10 minutos
  });
}

// Hook para tendências de agendamentos
export function useAppointmentTrends(
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  filters?: AppointmentFilters
): UseQueryResult<AppointmentTrends> {
  return useQuery({
    queryKey: ['bi', 'appointments', 'trends', period, filters],
    queryFn: () => appointmentsBIService.getAppointmentTrends(period, filters),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000, // Atualiza a cada 15 minutos
  });
}

// Hook para performance dos médicos
export function useDoctorPerformance(filters?: AppointmentFilters): UseQueryResult<DoctorPerformance[]> {
  return useQuery({
    queryKey: ['bi', 'appointments', 'doctor-performance', filters],
    queryFn: () => appointmentsBIService.getDoctorPerformance(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 30 * 60 * 1000, // Atualiza a cada 30 minutos
  });
}

// Hook para análise completa de agendamentos
export function useAppointmentAnalytics(filters?: AppointmentFilters): UseQueryResult<AppointmentAnalytics> {
  return useQuery({
    queryKey: ['bi', 'appointments', 'analytics', filters],
    queryFn: () => appointmentsBIService.getAppointmentAnalytics(filters),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook para KPIs de agendamentos
export function useAppointmentKPIs(filters?: AppointmentFilters): UseQueryResult<KPIData[]> {
  return useQuery({
    queryKey: ['bi', 'appointments', 'kpis', filters],
    queryFn: () => appointmentsBIService.getAppointmentKPIs(filters),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook para dados de gráficos específicos
export function useAppointmentChartData(
  chartType: 'status' | 'trends' | 'doctors' | 'hours',
  filters?: AppointmentFilters
): UseQueryResult<ChartData> {
  return useQuery({
    queryKey: ['bi', 'appointments', 'chart', chartType, filters],
    queryFn: () => appointmentsBIService.getAppointmentChartData(chartType, filters),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
}

// Hook combinado para dashboard de agendamentos
export function useAppointmentsDashboard(filters?: AppointmentFilters) {
  const metrics = useAppointmentMetrics(filters);
  const trends = useAppointmentTrends('daily', filters);
  const kpis = useAppointmentKPIs(filters);
  const doctorPerformance = useDoctorPerformance(filters);

  return {
    metrics: {
      data: metrics.data,
      isLoading: metrics.isLoading,
      error: metrics.error,
      refetch: metrics.refetch
    },
    trends: {
      data: trends.data,
      isLoading: trends.isLoading,
      error: trends.error,
      refetch: trends.refetch
    },
    kpis: {
      data: kpis.data,
      isLoading: kpis.isLoading,
      error: kpis.error,
      refetch: kpis.refetch
    },
    doctorPerformance: {
      data: doctorPerformance.data,
      isLoading: doctorPerformance.isLoading,
      error: doctorPerformance.error,
      refetch: doctorPerformance.refetch
    },
    // Estados combinados
    isLoading: metrics.isLoading || trends.isLoading || kpis.isLoading || doctorPerformance.isLoading,
    hasError: !!(metrics.error || trends.error || kpis.error || doctorPerformance.error),
    refetchAll: () => {
      metrics.refetch();
      trends.refetch();
      kpis.refetch();
      doctorPerformance.refetch();
    }
  };
}

// Hook para estatísticas em tempo real
export function useAppointmentRealTimeStats(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: ['bi', 'appointments', 'realtime', filters],
    queryFn: () => appointmentsBIService.getAppointmentMetrics(filters),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Atualiza a cada minuto
    refetchIntervalInBackground: true,
  });
}

// Hook para comparação de períodos
export function useAppointmentComparison(
  currentFilters?: AppointmentFilters,
  previousFilters?: AppointmentFilters
) {
  const currentData = useAppointmentMetrics(currentFilters);
  const previousData = useAppointmentMetrics(previousFilters);

  const comparison = {
    current: currentData.data,
    previous: previousData.data,
    changes: currentData.data && previousData.data ? {
      totalAppointments: {
        value: currentData.data.totalAppointments - previousData.data.totalAppointments,
        percentage: ((currentData.data.totalAppointments - previousData.data.totalAppointments) / previousData.data.totalAppointments) * 100
      },
      occupancyRate: {
        value: currentData.data.occupancyRate - previousData.data.occupancyRate,
        percentage: ((currentData.data.occupancyRate - previousData.data.occupancyRate) / previousData.data.occupancyRate) * 100
      },
      completedAppointments: {
        value: currentData.data.completedAppointments - previousData.data.completedAppointments,
        percentage: ((currentData.data.completedAppointments - previousData.data.completedAppointments) / previousData.data.completedAppointments) * 100
      },
      noShowAppointments: {
        value: currentData.data.noShowAppointments - previousData.data.noShowAppointments,
        percentage: ((currentData.data.noShowAppointments - previousData.data.noShowAppointments) / previousData.data.noShowAppointments) * 100
      }
    } : null,
    isLoading: currentData.isLoading || previousData.isLoading,
    hasError: !!(currentData.error || previousData.error)
  };

  return comparison;
}

// Hook para alertas baseados em métricas
export function useAppointmentAlerts(filters?: AppointmentFilters) {
  const { data: metrics } = useAppointmentMetrics(filters);

  const alerts = [];

  if (metrics) {
    // Alerta de baixa ocupação
    if (metrics.occupancyRate < 60) {
      alerts.push({
        id: 'low-occupancy',
        type: 'warning' as const,
        title: 'Taxa de Ocupação Baixa',
        message: `A taxa de ocupação está em ${metrics.occupancyRate.toFixed(1)}%, abaixo do ideal de 80%.`,
        priority: 'medium' as const
      });
    }

    // Alerta de alta taxa de faltas
    const noShowRate = (metrics.noShowAppointments / metrics.totalAppointments) * 100;
    if (noShowRate > 10) {
      alerts.push({
        id: 'high-no-show',
        type: 'critical' as const,
        title: 'Alta Taxa de Faltas',
        message: `A taxa de faltas está em ${noShowRate.toFixed(1)}%, acima do aceitável de 5%.`,
        priority: 'high' as const
      });
    }

    // Alerta de baixa satisfação
    if (metrics.patientSatisfaction < 4.0) {
      alerts.push({
        id: 'low-satisfaction',
        type: 'warning' as const,
        title: 'Baixa Satisfação dos Pacientes',
        message: `A satisfação média está em ${metrics.patientSatisfaction.toFixed(1)}, abaixo do esperado de 4.5.`,
        priority: 'medium' as const
      });
    }
  }

  return alerts;
}