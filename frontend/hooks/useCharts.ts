import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportsService } from '../services/reportsService';
import {
  ChartConfig,
  DashboardData,
  KPIValue,
  ReportFilters
} from '../types/unified-reports';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface TimeSeriesDataPoint {
  date: string;
  value: number;
  category?: string;
}

interface ChartOptions {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  title?: string;
  subtitle?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
  height?: number;
  width?: number;
}

interface UseChartsOptions {
  dashboardId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useCharts(options: UseChartsOptions = {}) {
  const { dashboardId, autoRefresh = false, refreshInterval = 60000 } = options;
  const [chartConfigs, setChartConfigs] = useState<Record<string, ChartConfig>>({});
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [chartFilters, setChartFilters] = useState<ReportFilters>({});

  // Query para buscar dados do dashboard
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['dashboard-data', dashboardId, chartFilters],
    queryFn: () => reportsService.getDashboardData(dashboardId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Query para buscar KPIs financeiros
  const {
    data: financialKPIs = [],
    isLoading: isLoadingKPIs,
    refetch: refetchKPIs
  } = useQuery({
    queryKey: ['financial-kpis', chartFilters],
    queryFn: () => reportsService.getFinancialKPIs({
      start_date: chartFilters.startDate,
      end_date: chartFilters.endDate
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar projeção de fluxo de caixa
  const {
    data: cashFlowProjection,
    isLoading: isLoadingCashFlow,
    refetch: refetchCashFlow
  } = useQuery({
    queryKey: ['cash-flow-projection', chartFilters],
    queryFn: () => reportsService.getCashFlowProjection({
      months: chartFilters.months || 12
    }),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Função para processar dados para gráfico de linha
  const processLineChartData = useCallback((data: any[], xField: string, yField: string) => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      date: item[xField],
      value: Number(item[yField]) || 0
    }));
  }, []);

  // Função para processar dados para gráfico de barras
  const processBarChartData = useCallback((data: any[], labelField: string, valueField: string) => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      label: item[labelField],
      value: Number(item[valueField]) || 0
    }));
  }, []);

  // Função para processar dados para gráfico de pizza
  const processPieChartData = useCallback((data: any[], labelField: string, valueField: string) => {
    if (!Array.isArray(data)) return [];
    
    const total = data.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);
    
    return data.map(item => {
      const value = Number(item[valueField]) || 0;
      return {
        label: item[labelField],
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0
      };
    });
  }, []);

  // Função para gerar cores automáticas para gráficos
  const generateChartColors = useCallback((count: number) => {
    const baseColors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#6366F1'  // indigo-500
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  }, []);

  // Função para criar configuração de gráfico
  const createChartConfig = useCallback((chartId: string, options: ChartOptions): ChartConfig => {
    const config: ChartConfig = {
      id: chartId,
      type: options.type,
      title: options.title || '',
      options: {
        responsive: options.responsive ?? true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: options.showLegend ?? true,
            position: 'top' as const
          },
          tooltip: {
            enabled: options.showTooltip ?? true
          },
          title: {
            display: !!options.title,
            text: options.title
          }
        },
        scales: options.type !== 'pie' && options.type !== 'doughnut' ? {
          x: {
            display: true,
            grid: {
              display: options.showGrid ?? true
            }
          },
          y: {
            display: true,
            grid: {
              display: options.showGrid ?? true
            }
          }
        } : undefined
      },
      data: {
        labels: [],
        datasets: []
      }
    };
    
    setChartConfigs(prev => ({ ...prev, [chartId]: config }));
    return config;
  }, []);

  // Função para atualizar dados do gráfico
  const updateChartData = useCallback((chartId: string, data: ChartDataPoint[] | TimeSeriesDataPoint[]) => {
    setChartConfigs(prev => {
      const config = prev[chartId];
      if (!config) return prev;
      
      const isTimeSeries = data.length > 0 && 'date' in data[0];
      
      if (isTimeSeries) {
        const timeSeriesData = data as TimeSeriesDataPoint[];
        config.data = {
          labels: timeSeriesData.map(d => d.date),
          datasets: [{
            label: config.title || 'Dados',
            data: timeSeriesData.map(d => d.value),
            borderColor: '#3B82F6',
            backgroundColor: config.type === 'area' ? 'rgba(59, 130, 246, 0.1)' : '#3B82F6',
            fill: config.type === 'area'
          }]
        };
      } else {
        const chartData = data as ChartDataPoint[];
        const colors = generateChartColors(chartData.length);
        
        config.data = {
          labels: chartData.map(d => d.label),
          datasets: [{
            label: config.title || 'Dados',
            data: chartData.map(d => d.value),
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }]
        };
      }
      
      return { ...prev, [chartId]: { ...config } };
    });
  }, [generateChartColors]);

  // Função para remover gráfico
  const removeChart = useCallback((chartId: string) => {
    setChartConfigs(prev => {
      const { [chartId]: removed, ...rest } = prev;
      return rest;
    });
    
    if (selectedChart === chartId) {
      setSelectedChart(null);
    }
  }, [selectedChart]);

  // Função para aplicar filtros aos gráficos
  const applyChartFilters = useCallback((filters: ReportFilters) => {
    setChartFilters(prev => ({ ...prev, ...filters }));
  }, []);

  // Função para limpar filtros
  const clearChartFilters = useCallback(() => {
    setChartFilters({});
  }, []);

  // Função para exportar gráfico como imagem
  const exportChartAsImage = useCallback(async (chartId: string, format: 'png' | 'jpeg' = 'png') => {
    try {
      const canvas = document.querySelector(`#chart-${chartId} canvas`) as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Gráfico não encontrado');
      }
      
      const url = canvas.toDataURL(`image/${format}`);
      const link = document.createElement('a');
      link.download = `chart-${chartId}.${format}`;
      link.href = url;
      link.click();
      
      toast.success('Gráfico exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar gráfico');
    }
  }, []);

  // Dados processados para diferentes tipos de gráficos
  const processedKPIs = useMemo(() => {
    return financialKPIs.map(kpi => ({
      label: kpi.name,
      value: kpi.value,
      target: kpi.target,
      unit: kpi.unit,
      trend: kpi.trend
    }));
  }, [financialKPIs]);

  // Função para criar gráfico de KPIs
  const createKPIChart = useCallback((kpis: KPIValue[]) => {
    const chartId = 'kpi-chart';
    const config = createChartConfig(chartId, {
      type: 'bar',
      title: 'KPIs Financeiros',
      showLegend: false
    });
    
    const data = kpis.map(kpi => ({
      label: kpi.name,
      value: kpi.value
    }));
    
    updateChartData(chartId, data);
    return chartId;
  }, [createChartConfig, updateChartData]);

  // Função para criar gráfico de fluxo de caixa
  const createCashFlowChart = useCallback((cashFlowData: any) => {
    if (!cashFlowData?.projections) return null;
    
    const chartId = 'cash-flow-chart';
    const config = createChartConfig(chartId, {
      type: 'line',
      title: 'Projeção de Fluxo de Caixa',
      showGrid: true
    });
    
    const data = cashFlowData.projections.map((projection: any) => ({
      date: projection.month,
      value: projection.projected_balance
    }));
    
    updateChartData(chartId, data);
    return chartId;
  }, [createChartConfig, updateChartData]);

  return {
    // Data
    dashboardData,
    financialKPIs,
    cashFlowProjection,
    chartConfigs,
    selectedChart,
    chartFilters,
    processedKPIs,
    
    // Loading states
    isLoadingDashboard,
    isLoadingKPIs,
    isLoadingCashFlow,
    
    // Error states
    dashboardError,
    
    // Chart management
    createChartConfig,
    updateChartData,
    removeChart,
    setSelectedChart,
    
    // Data processing
    processLineChartData,
    processBarChartData,
    processPieChartData,
    generateChartColors,
    
    // Filters
    applyChartFilters,
    clearChartFilters,
    
    // Export
    exportChartAsImage,
    
    // Specialized charts
    createKPIChart,
    createCashFlowChart,
    
    // Refresh functions
    refetchDashboard,
    refetchKPIs,
    refetchCashFlow
  };
}

export default useCharts;