import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { patientsBIService, PatientDemographics, PatientTrends, PatientsBySpecialty, PatientMedicalStats } from '@/services/bi/patientsBIService';
import { BiMetric, KPI, ChartData, TimeRange } from '@/types/bi';

export interface UsePatientBIReturn {
  // Métricas
  metrics: BiMetric[];
  isLoadingMetrics: boolean;
  metricsError: Error | null;
  
  // Demografia
  demographics: PatientDemographics | undefined;
  isLoadingDemographics: boolean;
  demographicsError: Error | null;
  
  // Tendências
  trends: PatientTrends | undefined;
  isLoadingTrends: boolean;
  trendsError: Error | null;
  
  // Especialidades
  specialties: PatientsBySpecialty[];
  isLoadingSpecialties: boolean;
  specialtiesError: Error | null;
  
  // Estatísticas médicas
  medicalStats: PatientMedicalStats | undefined;
  isLoadingMedicalStats: boolean;
  medicalStatsError: Error | null;
  
  // KPIs
  kpis: KPI[];
  isLoadingKPIs: boolean;
  kpisError: Error | null;
  
  // Gráficos
  ageChart: ChartData[];
  isLoadingAgeChart: boolean;
  ageChartError: Error | null;
  
  monthlyGrowthChart: ChartData[];
  isLoadingMonthlyGrowth: boolean;
  monthlyGrowthError: Error | null;
  
  // Estados gerais
  isLoading: boolean;
  hasError: boolean;
  
  // Funções de refresh
  refetchAll: () => void;
  refetchMetrics: () => void;
  refetchDemographics: () => void;
  refetchTrends: () => void;
}

export function usePatientBI(timeRange: TimeRange = 'month'): UsePatientBIReturn {
  const metricsQuery = useQuery({
    queryKey: ['patient-bi-metrics', timeRange],
    queryFn: () => patientsBIService.getMetrics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const demographicsQuery = useQuery({
    queryKey: ['patient-demographics', timeRange],
    queryFn: () => patientsBIService.getDemographicsData(timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const trendsQuery = useQuery({
    queryKey: ['patient-trends', timeRange],
    queryFn: () => patientsBIService.getTrendsData(timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const specialtiesQuery = useQuery({
    queryKey: ['patient-specialties', timeRange],
    queryFn: () => patientsBIService.getPatientsBySpecialty(timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const medicalStatsQuery = useQuery({
    queryKey: ['patient-medical-stats', timeRange],
    queryFn: () => patientsBIService.getMedicalStatistics(timeRange),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const kpisQuery = useQuery({
    queryKey: ['patient-kpis', timeRange],
    queryFn: () => patientsBIService.getKPIs(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const ageChartQuery = useQuery({
    queryKey: ['patient-age-chart', timeRange],
    queryFn: () => patientsBIService.getAgeDistributionChart(timeRange),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const growthChartQuery = useQuery({
    queryKey: ['patient-growth-chart', timeRange],
    queryFn: () => patientsBIService.getMonthlyGrowthChart(timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const refetchAll = () => {
    metricsQuery.refetch();
    demographicsQuery.refetch();
    trendsQuery.refetch();
    specialtiesQuery.refetch();
    medicalStatsQuery.refetch();
    kpisQuery.refetch();
    ageChartQuery.refetch();
    growthChartQuery.refetch();
  };

  const isLoading = metricsQuery.isLoading || demographicsQuery.isLoading || trendsQuery.isLoading || specialtiesQuery.isLoading ||
                   medicalStatsQuery.isLoading || kpisQuery.isLoading || ageChartQuery.isLoading || growthChartQuery.isLoading;

  const hasError = !!(metricsQuery.error || demographicsQuery.error || trendsQuery.error || 
                     specialtiesQuery.error || medicalStatsQuery.error || kpisQuery.error ||
                     ageChartQuery.error || growthChartQuery.error);

  return {
    // Data
    metrics: metricsQuery.data || [],
    demographics: demographicsQuery.data,
    trends: trendsQuery.data,
    specialties: specialtiesQuery.data || [],
    medicalStats: medicalStatsQuery.data,
    kpis: kpisQuery.data || [],
    ageChart: ageChartQuery.data || [],
    monthlyGrowthChart: growthChartQuery.data || [],

    // Loading states
    isLoading,
    isLoadingMetrics: metricsQuery.isLoading,
    isLoadingDemographics: demographicsQuery.isLoading,
    isLoadingTrends: trendsQuery.isLoading,
    isLoadingSpecialties: specialtiesQuery.isLoading,
    isLoadingMedicalStats: medicalStatsQuery.isLoading,
    isLoadingKPIs: kpisQuery.isLoading,
    isLoadingAgeChart: ageChartQuery.isLoading,
    isLoadingMonthlyGrowth: growthChartQuery.isLoading,

    // Error states
    metricsError: metricsQuery.error as Error | null,
    demographicsError: demographicsQuery.error as Error | null,
    trendsError: trendsQuery.error as Error | null,
    specialtiesError: specialtiesQuery.error as Error | null,
    medicalStatsError: medicalStatsQuery.error as Error | null,
    kpisError: kpisQuery.error as Error | null,
    ageChartError: ageChartQuery.error as Error | null,
    monthlyGrowthError: growthChartQuery.error as Error | null,

    // Estados gerais
    hasError,
    
    // Refetch functions
    refetchAll,
    refetchMetrics: metricsQuery.refetch,
    refetchDemographics: demographicsQuery.refetch,
    refetchTrends: trendsQuery.refetch
  };
}

// Hook específico para métricas de pacientes
export function usePatientMetrics(timeRange: TimeRange = 'month') {
  return useQuery({
    queryKey: ['patient-bi-metrics', timeRange],
    queryFn: () => patientsBIService.getMetrics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook específico para KPIs de pacientes
export function usePatientKPIs(timeRange: TimeRange = 'month') {
  return useQuery({
    queryKey: ['patient-kpis', timeRange],
    queryFn: () => patientsBIService.getKPIs(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook específico para dados demográficos
export function usePatientDemographics(timeRange: TimeRange = 'month') {
  return useQuery({
    queryKey: ['patient-demographics', timeRange],
    queryFn: () => patientsBIService.getDemographicsData(timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook específico para relatório completo
export function usePatientReport(timeRange: TimeRange = 'month') {
  return useQuery({
    queryKey: ['patient-report', timeRange],
    queryFn: () => patientsBIService.getPatientReport(timeRange),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}