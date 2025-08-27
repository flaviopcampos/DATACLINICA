import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportsService } from '../services/reportsService';
import {
  SavedReport,
  SavedReportCreate,
  SavedReportUpdate,
  ReportExecution,
  ReportExecutionCreate,
  ReportFilters,
  ReportRequest,
  FinancialReport,
  OperationalReport,
  PatientReport
} from '../types/unified-reports';

interface UseReportsOptions {
  reportType?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useReports(options: UseReportsOptions = {}) {
  const { reportType, autoRefresh = false, refreshInterval = 30000 } = options;
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

  // Query para buscar relatórios salvos
  const {
    data: savedReports = [],
    isLoading: isLoadingReports,
    error: reportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: ['saved-reports', reportType, filters],
    queryFn: () => reportsService.getSavedReports({
      report_type: reportType,
      ...filters
    }),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar execuções de relatórios
  const {
    data: reportExecutions = [],
    isLoading: isLoadingExecutions,
    refetch: refetchExecutions
  } = useQuery({
    queryKey: ['report-executions', selectedReport?.id],
    queryFn: () => reportsService.getReportExecutions({
      saved_report_id: selectedReport?.id
    }),
    enabled: !!selectedReport?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Query para buscar tipos de relatórios disponíveis
  const {
    data: reportTypes = [],
    isLoading: isLoadingTypes
  } = useQuery({
    queryKey: ['report-types'],
    queryFn: () => reportsService.getReportTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para buscar relatórios populares
  const {
    data: popularReports = [],
    isLoading: isLoadingPopular
  } = useQuery({
    queryKey: ['popular-reports'],
    queryFn: () => reportsService.getPopularReports(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar relatório
  const createReportMutation = useMutation({
    mutationFn: (report: SavedReportCreate) => reportsService.createSavedReport(report),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Relatório criado com sucesso!');
      setSelectedReport(newReport);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar relatório');
    }
  });

  // Mutation para atualizar relatório
  const updateReportMutation = useMutation({
    mutationFn: ({ id, report }: { id: number; report: SavedReportUpdate }) => 
      reportsService.updateSavedReport(id, report),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Relatório atualizado com sucesso!');
      setSelectedReport(updatedReport);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar relatório');
    }
  });

  // Mutation para deletar relatório
  const deleteReportMutation = useMutation({
    mutationFn: (id: number) => reportsService.deleteSavedReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Relatório excluído com sucesso!');
      if (selectedReport?.id === deleteReportMutation.variables) {
        setSelectedReport(null);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir relatório');
    }
  });

  // Mutation para executar relatório
  const executeReportMutation = useMutation({
    mutationFn: (execution: ReportExecutionCreate) => reportsService.executeReport(execution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-executions'] });
      toast.success('Relatório executado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao executar relatório');
    }
  });

  // Mutation para gerar relatório financeiro
  const generateFinancialReportMutation = useMutation({
    mutationFn: (filters: ReportFilters) => reportsService.generateFinancialReport(filters),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar relatório financeiro');
    }
  });

  // Mutation para gerar relatório operacional
  const generateOperationalReportMutation = useMutation({
    mutationFn: (filters: ReportFilters) => reportsService.generateOperationalReport(filters),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar relatório operacional');
    }
  });

  // Mutation para gerar relatório de pacientes
  const generatePatientReportMutation = useMutation({
    mutationFn: (filters: ReportFilters) => reportsService.generatePatientReport(filters),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar relatório de pacientes');
    }
  });

  // Função para buscar relatórios com filtros
  const searchReports = useCallback(async (query: string, searchFilters?: ReportFilters) => {
    try {
      const results = await reportsService.searchReports(query, searchFilters);
      return results;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao buscar relatórios');
      return [];
    }
  }, []);

  // Função para aplicar filtros
  const applyFilters = useCallback((newFilters: ReportFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Função para selecionar relatório
  const selectReport = useCallback((report: SavedReport | null) => {
    setSelectedReport(report);
  }, []);

  // Função para duplicar relatório
  const duplicateReport = useCallback(async (report: SavedReport) => {
    const duplicatedReport: SavedReportCreate = {
      name: `${report.name} (Cópia)`,
      description: report.description,
      report_type: report.report_type,
      query_config: report.query_config,
      visualization_config: report.visualization_config,
      is_public: false
    };
    
    createReportMutation.mutate(duplicatedReport);
  }, [createReportMutation]);

  // Função para agendar relatório
  const scheduleReport = useCallback(async (reportId: number, scheduleConfig: Record<string, any>) => {
    try {
      await reportsService.scheduleReport(reportId, scheduleConfig);
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Relatório agendado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao agendar relatório');
    }
  }, [queryClient]);

  return {
    // Data
    savedReports,
    reportExecutions,
    reportTypes,
    popularReports,
    selectedReport,
    filters,
    
    // Loading states
    isLoadingReports,
    isLoadingExecutions,
    isLoadingTypes,
    isLoadingPopular,
    isCreating: createReportMutation.isPending,
    isUpdating: updateReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
    isExecuting: executeReportMutation.isPending,
    isGeneratingFinancial: generateFinancialReportMutation.isPending,
    isGeneratingOperational: generateOperationalReportMutation.isPending,
    isGeneratingPatient: generatePatientReportMutation.isPending,
    
    // Error states
    reportsError,
    
    // Generated reports data
    financialReport: generateFinancialReportMutation.data,
    operationalReport: generateOperationalReportMutation.data,
    patientReport: generatePatientReportMutation.data,
    
    // Actions
    createReport: createReportMutation.mutate,
    updateReport: updateReportMutation.mutate,
    deleteReport: deleteReportMutation.mutate,
    executeReport: executeReportMutation.mutate,
    generateFinancialReport: generateFinancialReportMutation.mutate,
    generateOperationalReport: generateOperationalReportMutation.mutate,
    generatePatientReport: generatePatientReportMutation.mutate,
    
    // Utility functions
    searchReports,
    applyFilters,
    clearFilters,
    selectReport,
    duplicateReport,
    scheduleReport,
    refetchReports,
    refetchExecutions
  };
}

export default useReports;