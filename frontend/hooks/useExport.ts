import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportsService } from '../services/reportsService';
import { ExportOptions, SavedReport, CustomDashboard } from '../types/unified-reports';

interface ExportProgress {
  isExporting: boolean;
  progress: number;
  currentStep: string;
}

interface UseExportOptions {
  onExportStart?: () => void;
  onExportComplete?: (filename: string) => void;
  onExportError?: (error: string) => void;
}

export function useExport(options: UseExportOptions = {}) {
  const { onExportStart, onExportComplete, onExportError } = options;
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    currentStep: ''
  });

  // Função para fazer download do blob
  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  // Função para gerar nome do arquivo
  const generateFilename = useCallback((baseName: string, format: string, timestamp?: boolean) => {
    const cleanName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = timestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
    return `${cleanName}${dateStr}.${format}`;
  }, []);

  // Mutation para exportar relatório
  const exportReportMutation = useMutation({
    mutationFn: async ({ reportId, options }: { reportId: number; options: ExportOptions }) => {
      setExportProgress({
        isExporting: true,
        progress: 10,
        currentStep: 'Preparando exportação...'
      });
      
      onExportStart?.();
      
      setExportProgress(prev => ({
        ...prev,
        progress: 30,
        currentStep: 'Gerando relatório...'
      }));
      
      const blob = await reportsService.exportReport(reportId, options);
      
      setExportProgress(prev => ({
        ...prev,
        progress: 80,
        currentStep: 'Finalizando download...'
      }));
      
      return { blob, options };
    },
    onSuccess: ({ blob, options }, { reportId }) => {
      const filename = generateFilename(
        options.filename || `relatorio_${reportId}`,
        options.format,
        options.includeTimestamp
      );
      
      downloadBlob(blob, filename);
      
      setExportProgress({
        isExporting: false,
        progress: 100,
        currentStep: 'Concluído'
      });
      
      toast.success(`Relatório exportado como ${filename}`);
      onExportComplete?.(filename);
      
      // Reset progress after a delay
      setTimeout(() => {
        setExportProgress({
          isExporting: false,
          progress: 0,
          currentStep: ''
        });
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erro ao exportar relatório';
      
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentStep: 'Erro na exportação'
      });
      
      toast.error(errorMessage);
      onExportError?.(errorMessage);
      
      // Reset progress after a delay
      setTimeout(() => {
        setExportProgress({
          isExporting: false,
          progress: 0,
          currentStep: ''
        });
      }, 2000);
    }
  });

  // Mutation para exportar dashboard
  const exportDashboardMutation = useMutation({
    mutationFn: async ({ dashboardId, options }: { dashboardId: number; options: ExportOptions }) => {
      setExportProgress({
        isExporting: true,
        progress: 10,
        currentStep: 'Preparando exportação do dashboard...'
      });
      
      onExportStart?.();
      
      setExportProgress(prev => ({
        ...prev,
        progress: 30,
        currentStep: 'Gerando dashboard...'
      }));
      
      const blob = await reportsService.exportDashboard(dashboardId, options);
      
      setExportProgress(prev => ({
        ...prev,
        progress: 80,
        currentStep: 'Finalizando download...'
      }));
      
      return { blob, options };
    },
    onSuccess: ({ blob, options }, { dashboardId }) => {
      const filename = generateFilename(
        options.filename || `dashboard_${dashboardId}`,
        options.format,
        options.includeTimestamp
      );
      
      downloadBlob(blob, filename);
      
      setExportProgress({
        isExporting: false,
        progress: 100,
        currentStep: 'Concluído'
      });
      
      toast.success(`Dashboard exportado como ${filename}`);
      onExportComplete?.(filename);
      
      // Reset progress after a delay
      setTimeout(() => {
        setExportProgress({
          isExporting: false,
          progress: 0,
          currentStep: ''
        });
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erro ao exportar dashboard';
      
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentStep: 'Erro na exportação'
      });
      
      toast.error(errorMessage);
      onExportError?.(errorMessage);
      
      // Reset progress after a delay
      setTimeout(() => {
        setExportProgress({
          isExporting: false,
          progress: 0,
          currentStep: ''
        });
      }, 2000);
    }
  });

  // Função para exportar relatório em PDF
  const exportToPDF = useCallback((reportId: number, filename?: string) => {
    const options: ExportOptions = {
      format: 'pdf',
      filename,
      includeTimestamp: true,
      includeCharts: true,
      includeData: true
    };
    
    exportReportMutation.mutate({ reportId, options });
  }, [exportReportMutation]);

  // Função para exportar relatório em Excel
  const exportToExcel = useCallback((reportId: number, filename?: string) => {
    const options: ExportOptions = {
      format: 'xlsx',
      filename,
      includeTimestamp: true,
      includeCharts: false,
      includeData: true
    };
    
    exportReportMutation.mutate({ reportId, options });
  }, [exportReportMutation]);

  // Função para exportar relatório em CSV
  const exportToCSV = useCallback((reportId: number, filename?: string) => {
    const options: ExportOptions = {
      format: 'csv',
      filename,
      includeTimestamp: true,
      includeCharts: false,
      includeData: true
    };
    
    exportReportMutation.mutate({ reportId, options });
  }, [exportReportMutation]);

  // Função para exportar dashboard em PDF
  const exportDashboardToPDF = useCallback((dashboardId: number, filename?: string) => {
    const options: ExportOptions = {
      format: 'pdf',
      filename,
      includeTimestamp: true,
      includeCharts: true,
      includeData: true
    };
    
    exportDashboardMutation.mutate({ dashboardId, options });
  }, [exportDashboardMutation]);

  // Função para exportar dashboard em PNG
  const exportDashboardToPNG = useCallback((dashboardId: number, filename?: string) => {
    const options: ExportOptions = {
      format: 'png',
      filename,
      includeTimestamp: true,
      includeCharts: true,
      includeData: false
    };
    
    exportDashboardMutation.mutate({ dashboardId, options });
  }, [exportDashboardMutation]);

  // Função para exportar com opções customizadas
  const exportWithOptions = useCallback((reportId: number, options: ExportOptions) => {
    exportReportMutation.mutate({ reportId, options });
  }, [exportReportMutation]);

  // Função para exportar dashboard com opções customizadas
  const exportDashboardWithOptions = useCallback((dashboardId: number, options: ExportOptions) => {
    exportDashboardMutation.mutate({ dashboardId, options });
  }, [exportDashboardMutation]);

  // Função para cancelar exportação (se possível)
  const cancelExport = useCallback(() => {
    // Note: This would require backend support for cancellation
    setExportProgress({
      isExporting: false,
      progress: 0,
      currentStep: 'Cancelado'
    });
    
    toast.info('Exportação cancelada');
    
    setTimeout(() => {
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentStep: ''
      });
    }, 1000);
  }, []);

  // Função para exportar múltiplos relatórios
  const exportMultipleReports = useCallback(async (
    reports: { id: number; name: string }[],
    format: 'pdf' | 'xlsx' | 'csv' = 'pdf'
  ) => {
    setExportProgress({
      isExporting: true,
      progress: 0,
      currentStep: 'Iniciando exportação múltipla...'
    });
    
    try {
      for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        const progress = Math.round(((i + 1) / reports.length) * 100);
        
        setExportProgress({
          isExporting: true,
          progress,
          currentStep: `Exportando ${report.name}... (${i + 1}/${reports.length})`
        });
        
        const options: ExportOptions = {
          format,
          filename: report.name,
          includeTimestamp: true,
          includeCharts: format === 'pdf',
          includeData: true
        };
        
        await new Promise((resolve, reject) => {
          exportReportMutation.mutate(
            { reportId: report.id, options },
            {
              onSuccess: resolve,
              onError: reject
            }
          );
        });
        
        // Small delay between exports
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setExportProgress({
        isExporting: false,
        progress: 100,
        currentStep: 'Todos os relatórios exportados'
      });
      
      toast.success(`${reports.length} relatórios exportados com sucesso!`);
      
    } catch (error) {
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentStep: 'Erro na exportação múltipla'
      });
      
      toast.error('Erro ao exportar múltiplos relatórios');
    }
    
    // Reset progress after a delay
    setTimeout(() => {
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentStep: ''
      });
    }, 3000);
  }, [exportReportMutation]);

  return {
    // State
    exportProgress,
    isExporting: exportProgress.isExporting,
    
    // Export functions
    exportToPDF,
    exportToExcel,
    exportToCSV,
    exportDashboardToPDF,
    exportDashboardToPNG,
    exportWithOptions,
    exportDashboardWithOptions,
    exportMultipleReports,
    
    // Utility functions
    cancelExport,
    downloadBlob,
    generateFilename
  };
}

export default useExport;