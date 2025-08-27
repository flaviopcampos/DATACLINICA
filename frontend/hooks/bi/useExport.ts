import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { exportService, ExportData, ExportOptions } from '@/services/bi/exportService';
import { useMetrics } from './useMetrics';
import { useKPIs } from './useKPIs';
import { useAlerts } from './useAlerts';

export interface ExportState {
  isExporting: boolean;
  error: string | null;
}

export function useExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    error: null
  });

  const { metrics } = useMetrics();
  const { kpis } = useKPIs();
  const { notifications } = useAlerts();

  const exportData = useCallback(async (
    data: ExportData,
    options: ExportOptions
  ) => {
    setState(prev => ({ ...prev, isExporting: true, error: null }));

    try {
      await exportService.export(data, options);
      
      toast.success(
        `Relatório exportado com sucesso em formato ${options.format.toUpperCase()}!`,
        {
          description: `Arquivo: ${options.filename || 'relatorio'}.${options.format === 'pdf' ? 'pdf' : 'xlsx'}`
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast.error('Erro ao exportar relatório', {
        description: errorMessage
      });
    } finally {
      setState(prev => ({ ...prev, isExporting: false }));
    }
  }, []);

  const exportMetrics = useCallback(async (
    options: Omit<ExportOptions, 'format'> & { format: 'pdf' | 'excel' },
    filters?: {
      category?: string;
      dateRange?: { start: Date; end: Date };
    }
  ) => {
    let filteredMetrics = metrics;

    // Aplicar filtros se fornecidos
    if (filters?.category) {
      filteredMetrics = metrics.filter(metric => metric.category === filters.category);
    }

    const exportData = exportService.formatMetricsForExport(
      filteredMetrics,
      'Relatório de Métricas',
      filters?.dateRange 
        ? `Período: ${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
        : undefined
    );

    if (filters) {
      exportData.metadata = {
        ...exportData.metadata!,
        filters
      };
    }

    await exportData(exportData, {
      ...options,
      filename: options.filename || `metricas_${new Date().toISOString().split('T')[0]}`
    });
  }, [metrics, exportData]);

  const exportKPIs = useCallback(async (
    options: Omit<ExportOptions, 'format'> & { format: 'pdf' | 'excel' },
    filters?: {
      status?: string;
      category?: string;
    }
  ) => {
    let filteredKPIs = kpis;

    // Aplicar filtros se fornecidos
    if (filters?.status) {
      filteredKPIs = kpis.filter(kpi => kpi.status === filters.status);
    }
    if (filters?.category) {
      filteredKPIs = kpis.filter(kpi => kpi.category === filters.category);
    }

    const exportData = exportService.formatKPIsForExport(
      filteredKPIs,
      'Relatório de KPIs',
      'Indicadores Chave de Performance'
    );

    if (filters) {
      exportData.metadata = {
        ...exportData.metadata!,
        filters
      };
    }

    await exportData(exportData, {
      ...options,
      filename: options.filename || `kpis_${new Date().toISOString().split('T')[0]}`
    });
  }, [kpis, exportData]);

  const exportAlerts = useCallback(async (
    options: Omit<ExportOptions, 'format'> & { format: 'pdf' | 'excel' },
    filters?: {
      severity?: string[];
      isResolved?: boolean;
      dateRange?: { start: Date; end: Date };
    }
  ) => {
    let filteredAlerts = notifications;

    // Aplicar filtros se fornecidos
    if (filters?.severity && filters.severity.length > 0) {
      filteredAlerts = notifications.filter(alert => 
        filters.severity!.includes(alert.severity)
      );
    }
    if (filters?.isResolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.isResolved === filters.isResolved
      );
    }
    if (filters?.dateRange) {
      filteredAlerts = filteredAlerts.filter(alert => {
        const alertDate = new Date(alert.triggeredAt);
        return alertDate >= filters.dateRange!.start && alertDate <= filters.dateRange!.end;
      });
    }

    const exportData = exportService.formatAlertsForExport(
      filteredAlerts,
      'Relatório de Alertas',
      filters?.dateRange 
        ? `Período: ${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
        : undefined
    );

    if (filters) {
      exportData.metadata = {
        ...exportData.metadata!,
        filters
      };
    }

    await exportData(exportData, {
      ...options,
      filename: options.filename || `alertas_${new Date().toISOString().split('T')[0]}`
    });
  }, [notifications, exportData]);

  const exportDashboard = useCallback(async (
    options: Omit<ExportOptions, 'format'> & { format: 'pdf' | 'excel' },
    includeCharts: boolean = false
  ) => {
    // Combinar dados de métricas, KPIs e alertas em um relatório completo
    const dashboardData: ExportData = {
      title: 'Relatório Completo do Dashboard BI',
      subtitle: `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      headers: ['Seção', 'Item', 'Valor', 'Status', 'Observações'],
      data: [],
      metadata: {
        generatedAt: new Date(),
        generatedBy: 'Sistema BI',
        filters: {
          includeCharts,
          sections: ['metrics', 'kpis', 'alerts']
        }
      }
    };

    // Adicionar métricas
    metrics.forEach(metric => {
      dashboardData.data.push([
        'Métricas',
        metric.name || metric.label,
        `${metric.value} ${metric.unit || ''}`,
        'Ativo',
        metric.description || ''
      ]);
    });

    // Adicionar KPIs
    kpis.forEach(kpi => {
      dashboardData.data.push([
        'KPIs',
        kpi.name || kpi.label,
        `${kpi.currentValue} (Meta: ${kpi.target || 'N/A'})`,
        kpi.status || 'N/A',
        kpi.variation ? `Variação: ${kpi.variation > 0 ? '+' : ''}${kpi.variation}%` : ''
      ]);
    });

    // Adicionar alertas ativos
    const activeAlerts = notifications.filter(alert => !alert.isResolved);
    activeAlerts.forEach(alert => {
      dashboardData.data.push([
        'Alertas',
        alert.title,
        alert.severity.toUpperCase(),
        alert.isResolved ? 'Resolvido' : 'Ativo',
        alert.message
      ]);
    });

    await exportData(dashboardData, {
      ...options,
      filename: options.filename || `dashboard_completo_${new Date().toISOString().split('T')[0]}`,
      includeCharts
    });
  }, [metrics, kpis, notifications, exportData]);

  return {
    ...state,
    exportData,
    exportMetrics,
    exportKPIs,
    exportAlerts,
    exportDashboard
  };
}

export default useExport;