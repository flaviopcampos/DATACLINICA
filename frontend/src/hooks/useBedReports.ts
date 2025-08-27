import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import BedOccupancyService from '../services/bedOccupancyService';
import { admissionsService } from '../services/admissionsService';
import { dischargesService } from '../services/dischargesService';
import { transfersService } from '../services/transfersService';
import type {
  BedReport,
  ReportFilters,
  ReportSchedule,
  UseBedReportsReturn,
  UseReportGenerationReturn,
  UseReportSchedulingReturn
} from '../types/bedOccupancy';

// Hook principal para relatórios de leitos
export function useBedReports(filters?: ReportFilters): UseBedReportsReturn {
  const queryClient = useQueryClient();

  // Query para relatórios disponíveis
  const {
    data: reports = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bed-reports', filters],
    queryFn: () => BedOccupancyService.getOccupancyReports(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para templates de relatórios
  const {
    data: templates = [],
    isLoading: isLoadingTemplates
  } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => BedOccupancyService.getReportTemplates(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  // Mutation para deletar relatório
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => BedOccupancyService.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-reports'] });
      toast.success('Relatório excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir relatório');
    }
  });

  return {
    reports,
    templates,
    isLoading: isLoading || isLoadingTemplates,
    error: error?.message || null,
    refetch,
    deleteReport: deleteReportMutation.mutateAsync,
    isDeleting: deleteReportMutation.isPending
  };
}

// Hook para geração de relatórios
export function useReportGeneration(): UseReportGenerationReturn {
  const queryClient = useQueryClient();

  // Mutation para gerar relatório de ocupação
  const generateOccupancyReportMutation = useMutation({
    mutationFn: ({ type, filters }: { type: string; filters?: any }) => 
      BedOccupancyService.generateOccupancyReport(type, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-reports'] });
      toast.success('Relatório de ocupação gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar relatório de ocupação');
    }
  });

  // Mutation para gerar relatório de internações
  const generateAdmissionsReportMutation = useMutation({
    mutationFn: ({ filters }: { filters?: any }) => 
      admissionsService.generateReport(filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-reports'] });
      toast.success('Relatório de internações gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar relatório de internações');
    }
  });

  // Mutation para gerar relatório de altas
  const generateDischargesReportMutation = useMutation({
    mutationFn: ({ filters }: { filters?: any }) => 
      dischargesService.generateReport(filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-reports'] });
      toast.success('Relatório de altas gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar relatório de altas');
    }
  });

  // Mutation para gerar relatório de transferências
  const generateTransfersReportMutation = useMutation({
    mutationFn: ({ filters }: { filters?: any }) => 
      transfersService.generateReport(filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-reports'] });
      toast.success('Relatório de transferências gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar relatório de transferências');
    }
  });

  // Mutation para gerar relatório personalizado
  const generateCustomReportMutation = useMutation({
    mutationFn: ({ config }: { config: any }) => 
      BedOccupancyService.generateCustomReport(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-reports'] });
      toast.success('Relatório personalizado gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar relatório personalizado');
    }
  });

  return {
    generateOccupancyReport: generateOccupancyReportMutation.mutateAsync,
    generateAdmissionsReport: generateAdmissionsReportMutation.mutateAsync,
    generateDischargesReport: generateDischargesReportMutation.mutateAsync,
    generateTransfersReport: generateTransfersReportMutation.mutateAsync,
    generateCustomReport: generateCustomReportMutation.mutateAsync,
    isGeneratingOccupancy: generateOccupancyReportMutation.isPending,
    isGeneratingAdmissions: generateAdmissionsReportMutation.isPending,
    isGeneratingDischarges: generateDischargesReportMutation.isPending,
    isGeneratingTransfers: generateTransfersReportMutation.isPending,
    isGeneratingCustom: generateCustomReportMutation.isPending,
    isGenerating: (
      generateOccupancyReportMutation.isPending ||
      generateAdmissionsReportMutation.isPending ||
      generateDischargesReportMutation.isPending ||
      generateTransfersReportMutation.isPending ||
      generateCustomReportMutation.isPending
    )
  };
}

// Hook para agendamento de relatórios
export function useReportScheduling(): UseReportSchedulingReturn {
  const queryClient = useQueryClient();

  // Query para relatórios agendados
  const {
    data: scheduledReports = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => BedOccupancyService.getScheduledReports(),
    staleTime: 10 * 60 * 1000,
  });

  // Mutation para agendar relatório de ocupação
  const scheduleOccupancyReportMutation = useMutation({
    mutationFn: ({ type, schedule, filters }: { type: string; schedule: ReportSchedule; filters?: any }) => 
      BedOccupancyService.scheduleOccupancyReport(type, schedule, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Relatório de ocupação agendado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao agendar relatório de ocupação');
    }
  });

  // Mutation para agendar relatório de internações
  const scheduleAdmissionsReportMutation = useMutation({
    mutationFn: ({ schedule, filters }: { schedule: ReportSchedule; filters?: any }) => 
      admissionsService.scheduleReport(schedule, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Relatório de internações agendado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao agendar relatório de internações');
    }
  });

  // Mutation para agendar relatório de altas
  const scheduleDischargesReportMutation = useMutation({
    mutationFn: ({ schedule, filters }: { schedule: ReportSchedule; filters?: any }) => 
      dischargesService.scheduleReport(schedule, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Relatório de altas agendado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao agendar relatório de altas');
    }
  });

  // Mutation para agendar relatório de transferências
  const scheduleTransfersReportMutation = useMutation({
    mutationFn: ({ schedule, filters }: { schedule: ReportSchedule; filters?: any }) => 
      transfersService.scheduleReport(schedule, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Relatório de transferências agendado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao agendar relatório de transferências');
    }
  });

  // Mutation para cancelar agendamento
  const cancelScheduleMutation = useMutation({
    mutationFn: (scheduleId: string) => BedOccupancyService.cancelReportSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Agendamento cancelado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar agendamento');
    }
  });

  // Mutation para atualizar agendamento
  const updateScheduleMutation = useMutation({
    mutationFn: ({ scheduleId, schedule }: { scheduleId: string; schedule: ReportSchedule }) => 
      BedOccupancyService.updateReportSchedule(scheduleId, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('Agendamento atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar agendamento');
    }
  });

  return {
    scheduledReports,
    isLoading,
    error: error?.message || null,
    refetch,
    scheduleOccupancyReport: scheduleOccupancyReportMutation.mutateAsync,
    scheduleAdmissionsReport: scheduleAdmissionsReportMutation.mutateAsync,
    scheduleDischargesReport: scheduleDischargesReportMutation.mutateAsync,
    scheduleTransfersReport: scheduleTransfersReportMutation.mutateAsync,
    cancelSchedule: cancelScheduleMutation.mutateAsync,
    updateSchedule: updateScheduleMutation.mutateAsync,
    isSchedulingOccupancy: scheduleOccupancyReportMutation.isPending,
    isSchedulingAdmissions: scheduleAdmissionsReportMutation.isPending,
    isSchedulingDischarges: scheduleDischargesReportMutation.isPending,
    isSchedulingTransfers: scheduleTransfersReportMutation.isPending,
    isCanceling: cancelScheduleMutation.isPending,
    isUpdating: updateScheduleMutation.isPending,
    isScheduling: (
      scheduleOccupancyReportMutation.isPending ||
      scheduleAdmissionsReportMutation.isPending ||
      scheduleDischargesReportMutation.isPending ||
      scheduleTransfersReportMutation.isPending
    )
  };
}

// Hook para exportação de relatórios
export function useReportExport() {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: string }) => 
      BedOccupancyService.exportOccupancyReport(reportId, format),
    onSuccess: () => {
      toast.success('Relatório exportado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao exportar relatório');
    }
  });
}

// Hook para relatório específico
export function useBedReport(reportId: string) {
  return useQuery({
    queryKey: ['bed-report', reportId],
    queryFn: () => BedOccupancyService.getReport(reportId),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para estatísticas de relatórios
export function useReportStats(filters?: any) {
  return useQuery({
    queryKey: ['report-stats', filters],
    queryFn: () => BedOccupancyService.getReportStats(filters),
    staleTime: 10 * 60 * 1000,
  });
}

// Hook para relatórios de ocupação por período
export function useOccupancyPeriodReport(startDate: string, endDate: string, filters?: any) {
  return useQuery({
    queryKey: ['occupancy-period-report', startDate, endDate, filters],
    queryFn: () => BedOccupancyService.getOccupancyPeriodReport(startDate, endDate, filters),
    enabled: !!(startDate && endDate),
    staleTime: 15 * 60 * 1000,
  });
}

// Hook para relatórios de performance de leitos
export function useBedPerformanceReport(filters?: any) {
  return useQuery({
    queryKey: ['bed-performance-report', filters],
    queryFn: () => BedOccupancyService.getBedPerformanceReport(filters),
    staleTime: 15 * 60 * 1000,
  });
}

// Hook para relatórios de rotatividade
export function useBedTurnoverReport(filters?: any) {
  return useQuery({
    queryKey: ['bed-turnover-report', filters],
    queryFn: () => BedOccupancyService.getBedTurnoverReport(filters),
    staleTime: 15 * 60 * 1000,
  });
}

// Hook para relatórios de receita por leito
export function useBedRevenueReport(filters?: any) {
  return useQuery({
    queryKey: ['bed-revenue-report', filters],
    queryFn: () => BedOccupancyService.getBedRevenueReport(filters),
    staleTime: 15 * 60 * 1000,
  });
}

// Hook para relatórios comparativos
export function useComparativeReport(period1: any, period2: any, filters?: any) {
  return useQuery({
    queryKey: ['comparative-report', period1, period2, filters],
    queryFn: () => BedOccupancyService.getComparativeReport(period1, period2, filters),
    enabled: !!(period1 && period2),
    staleTime: 20 * 60 * 1000,
  });
}

// Hook para relatórios de tendências
export function useTrendReport(filters?: any) {
  return useQuery({
    queryKey: ['trend-report', filters],
    queryFn: () => BedOccupancyService.getTrendReport(filters),
    staleTime: 20 * 60 * 1000,
  });
}

// Hook para relatórios de alertas
export function useAlertsReport(filters?: any) {
  return useQuery({
    queryKey: ['alerts-report', filters],
    queryFn: () => BedOccupancyService.getAlertsReport(filters),
    staleTime: 10 * 60 * 1000,
  });
}

// Hook para relatórios de qualidade
export function useQualityReport(filters?: any) {
  return useQuery({
    queryKey: ['quality-report', filters],
    queryFn: () => BedOccupancyService.getQualityReport(filters),
    staleTime: 30 * 60 * 1000,
  });
}

// Hook para dashboard de relatórios
export function useReportsDashboard(filters?: any) {
  return useQuery({
    queryKey: ['reports-dashboard', filters],
    queryFn: () => BedOccupancyService.getReportsDashboard(filters),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}