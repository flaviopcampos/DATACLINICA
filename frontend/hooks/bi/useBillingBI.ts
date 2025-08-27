import { useQuery, useQueries } from '@tanstack/react-query';
import { billingBIService } from '../../services/bi/billingBIService';
import type {
  BillingMetrics,
  BillingTrends,
  PaymentAnalytics,
  OverdueAnalytics,
  BillingAnalytics
} from '../../services/bi/billingBIService';

// Keys para cache do React Query
export const billingBIKeys = {
  all: ['billing-bi'] as const,
  metrics: (period?: string) => [...billingBIKeys.all, 'metrics', period] as const,
  trends: (period?: string) => [...billingBIKeys.all, 'trends', period] as const,
  payments: (period?: string) => [...billingBIKeys.all, 'payments', period] as const,
  overdue: (period?: string) => [...billingBIKeys.all, 'overdue', period] as const,
  analytics: (period?: string) => [...billingBIKeys.all, 'analytics', period] as const,
  kpis: (period?: string) => [...billingBIKeys.all, 'kpis', period] as const,
  chartData: (chartType: string, period?: string) => [...billingBIKeys.all, 'chart', chartType, period] as const
};

// Hook para métricas de faturamento
export function useBillingMetrics(period?: string) {
  return useQuery({
    queryKey: billingBIKeys.metrics(period),
    queryFn: () => billingBIService.getMetrics(period),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook para tendências de faturamento
export function useBillingTrends(period?: string) {
  return useQuery({
    queryKey: billingBIKeys.trends(period),
    queryFn: () => billingBIService.getTrends(period),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook para análise de pagamentos
export function usePaymentAnalytics(period?: string) {
  return useQuery({
    queryKey: billingBIKeys.payments(period),
    queryFn: () => billingBIService.getPaymentAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook para análise de inadimplência
export function useOverdueAnalytics(period?: string) {
  return useQuery({
    queryKey: billingBIKeys.overdue(period),
    queryFn: () => billingBIService.getOverdueAnalytics(period),
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook para análise completa de faturamento
export function useBillingAnalytics(period?: string) {
  return useQuery({
    queryKey: billingBIKeys.analytics(period),
    queryFn: () => billingBIService.getAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook para KPIs de faturamento
export function useBillingKPIs(period?: string) {
  return useQuery({
    queryKey: billingBIKeys.kpis(period),
    queryFn: () => billingBIService.getKPIs(period),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook para dados de gráficos
export function useBillingChartData(chartType: string, period?: string) {
  return useQuery({
    queryKey: billingBIKeys.chartData(chartType, period),
    queryFn: () => billingBIService.getChartData(chartType, period),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!chartType
  });
}

// Hook consolidado para dashboard de faturamento
export function useBillingDashboard(period?: string) {
  const queries = useQueries({
    queries: [
      {
        queryKey: billingBIKeys.metrics(period),
        queryFn: () => billingBIService.getMetrics(period),
        staleTime: 5 * 60 * 1000
      },
      {
        queryKey: billingBIKeys.trends(period),
        queryFn: () => billingBIService.getTrends(period),
        staleTime: 10 * 60 * 1000
      },
      {
        queryKey: billingBIKeys.kpis(period),
        queryFn: () => billingBIService.getKPIs(period),
        staleTime: 5 * 60 * 1000
      }
    ]
  });

  const [metricsQuery, trendsQuery, kpisQuery] = queries;

  return {
    metrics: metricsQuery.data,
    trends: trendsQuery.data,
    kpis: kpisQuery.data,
    isLoading: queries.some(query => query.isLoading),
    isError: queries.some(query => query.isError),
    error: queries.find(query => query.error)?.error,
    refetch: () => queries.forEach(query => query.refetch())
  };
}

// Hook para estatísticas em tempo real de faturamento
export function useBillingRealTimeStats(period?: string) {
  return useQuery({
    queryKey: billingBIKeys.metrics(period),
    queryFn: () => billingBIService.getMetrics(period),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Atualiza a cada minuto
    refetchOnWindowFocus: true,
    retry: 3
  });
}

// Hook para comparação de períodos de faturamento
export function useBillingComparison(currentPeriod?: string, previousPeriod?: string) {
  const queries = useQueries({
    queries: [
      {
        queryKey: billingBIKeys.metrics(currentPeriod),
        queryFn: () => billingBIService.getMetrics(currentPeriod),
        staleTime: 10 * 60 * 1000
      },
      {
        queryKey: billingBIKeys.metrics(previousPeriod),
        queryFn: () => billingBIService.getMetrics(previousPeriod),
        staleTime: 10 * 60 * 1000
      }
    ]
  });

  const [currentQuery, previousQuery] = queries;

  const comparison = {
    current: currentQuery.data,
    previous: previousQuery.data,
    changes: currentQuery.data && previousQuery.data ? {
      revenue: {
        value: currentQuery.data.totalRevenue - previousQuery.data.totalRevenue,
        percentage: ((currentQuery.data.totalRevenue - previousQuery.data.totalRevenue) / previousQuery.data.totalRevenue) * 100
      },
      paymentRate: {
        value: currentQuery.data.paymentRate - previousQuery.data.paymentRate,
        percentage: ((currentQuery.data.paymentRate - previousQuery.data.paymentRate) / previousQuery.data.paymentRate) * 100
      },
      overdueRate: {
        value: currentQuery.data.overdueRate - previousQuery.data.overdueRate,
        percentage: ((currentQuery.data.overdueRate - previousQuery.data.overdueRate) / previousQuery.data.overdueRate) * 100
      },
      averageInvoiceValue: {
        value: currentQuery.data.averageInvoiceValue - previousQuery.data.averageInvoiceValue,
        percentage: ((currentQuery.data.averageInvoiceValue - previousQuery.data.averageInvoiceValue) / previousQuery.data.averageInvoiceValue) * 100
      }
    } : null
  };

  return {
    ...comparison,
    isLoading: queries.some(query => query.isLoading),
    isError: queries.some(query => query.isError),
    error: queries.find(query => query.error)?.error
  };
}

// Hook para alertas de faturamento
export function useBillingAlerts(period?: string) {
  const { data: metrics } = useBillingMetrics(period);
  const { data: overdue } = useOverdueAnalytics(period);

  const alerts = [];

  if (metrics) {
    // Alerta de taxa de inadimplência alta
    if (metrics.overdueRate > 10) {
      alerts.push({
        id: 'high-overdue-rate',
        type: 'warning' as const,
        title: 'Taxa de Inadimplência Alta',
        message: `A taxa de inadimplência está em ${metrics.overdueRate.toFixed(1)}%, acima do limite recomendado de 10%.`,
        value: metrics.overdueRate,
        threshold: 10
      });
    }

    // Alerta de baixa taxa de cobrança
    if (metrics.paymentRate < 85) {
      alerts.push({
        id: 'low-payment-rate',
        type: 'error' as const,
        title: 'Taxa de Cobrança Baixa',
        message: `A taxa de cobrança está em ${metrics.paymentRate.toFixed(1)}%, abaixo do mínimo recomendado de 85%.`,
        value: metrics.paymentRate,
        threshold: 85
      });
    }

    // Alerta de valor médio de fatura baixo
    if (metrics.averageInvoiceValue < 200) {
      alerts.push({
        id: 'low-average-invoice',
        type: 'info' as const,
        title: 'Valor Médio de Fatura Baixo',
        message: `O valor médio das faturas está em R$ ${metrics.averageInvoiceValue.toFixed(2)}, considerado baixo.`,
        value: metrics.averageInvoiceValue,
        threshold: 200
      });
    }
  }

  if (overdue) {
    // Alerta de muitas faturas vencidas
    if (overdue.overdueInvoicesCount > 50) {
      alerts.push({
        id: 'high-overdue-count',
        type: 'warning' as const,
        title: 'Muitas Faturas Vencidas',
        message: `Existem ${overdue.overdueInvoicesCount} faturas vencidas, totalizando R$ ${overdue.totalOverdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
        value: overdue.overdueInvoicesCount,
        threshold: 50
      });
    }

    // Alerta de tempo médio de vencimento alto
    if (overdue.averageOverdueDays > 30) {
      alerts.push({
        id: 'high-overdue-days',
        type: 'error' as const,
        title: 'Tempo de Vencimento Alto',
        message: `O tempo médio de vencimento é de ${overdue.averageOverdueDays.toFixed(1)} dias, muito acima do aceitável.`,
        value: overdue.averageOverdueDays,
        threshold: 30
      });
    }
  }

  return {
    alerts,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(alert => alert.type === 'error'),
    warningAlerts: alerts.filter(alert => alert.type === 'warning'),
    infoAlerts: alerts.filter(alert => alert.type === 'info')
  };
}