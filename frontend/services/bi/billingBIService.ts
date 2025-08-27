import api from '../api';
import type {
  Invoice,
  Payment,
  BillingStats,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus
} from '../../types/billing';

// Interfaces específicas para BI de Faturamento
export interface BillingMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  paymentRate: number;
  overdueRate: number;
  collectionEfficiency: number;
  daysToPayment: number;
}

export interface BillingTrends {
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    invoices: number;
    payments: number;
  }>;
  paymentMethodDistribution: Array<{
    method: PaymentMethod;
    amount: number;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: InvoiceStatus;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface PaymentAnalytics {
  averagePaymentTime: number;
  paymentSuccessRate: number;
  refundRate: number;
  partialPaymentRate: number;
  paymentsByDay: Array<{
    day: string;
    amount: number;
    count: number;
  }>;
  topPaymentMethods: Array<{
    method: PaymentMethod;
    usage: number;
    amount: number;
  }>;
}

export interface OverdueAnalytics {
  totalOverdueAmount: number;
  overdueInvoicesCount: number;
  averageOverdueDays: number;
  overdueByAgeGroup: Array<{
    ageGroup: string;
    count: number;
    amount: number;
  }>;
  overdueByPatient: Array<{
    patientId: string;
    patientName: string;
    overdueAmount: number;
    overdueCount: number;
    oldestOverdueDays: number;
  }>;
}

export interface BillingAnalytics {
  metrics: BillingMetrics;
  trends: BillingTrends;
  payments: PaymentAnalytics;
  overdue: OverdueAnalytics;
  forecast: {
    nextMonthRevenue: number;
    expectedCollections: number;
    riskAmount: number;
  };
}

// Serviço de BI para Faturamento
export const billingBIService = {
  // Buscar métricas principais de faturamento
  async getMetrics(period?: string): Promise<BillingMetrics> {
    try {
      const response = await api.get('/billing/bi/metrics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas de faturamento:', error);
      // Dados mock para desenvolvimento
      return {
        totalRevenue: 125000,
        monthlyRevenue: 45000,
        pendingAmount: 18500,
        overdueAmount: 7200,
        totalInvoices: 342,
        paidInvoices: 298,
        overdueInvoices: 23,
        averageInvoiceValue: 365.50,
        paymentRate: 87.1,
        overdueRate: 6.7,
        collectionEfficiency: 92.3,
        daysToPayment: 12.5
      };
    }
  },

  // Buscar tendências de faturamento
  async getTrends(period?: string): Promise<BillingTrends> {
    try {
      const response = await api.get('/billing/bi/trends', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tendências de faturamento:', error);
      // Dados mock para desenvolvimento
      return {
        revenueByMonth: [
          { month: '2024-01', revenue: 38000, invoices: 95, payments: 88 },
          { month: '2024-02', revenue: 42000, invoices: 108, payments: 102 },
          { month: '2024-03', revenue: 45000, invoices: 123, payments: 115 }
        ],
        paymentMethodDistribution: [
          { method: 'CREDIT_CARD' as PaymentMethod, amount: 65000, count: 180, percentage: 52.0 },
          { method: 'CASH' as PaymentMethod, amount: 35000, count: 95, percentage: 28.0 },
          { method: 'BANK_TRANSFER' as PaymentMethod, amount: 25000, count: 67, percentage: 20.0 }
        ],
        statusDistribution: [
          { status: InvoiceStatus.PAID, count: 298, amount: 108800, percentage: 87.1 },
          { status: InvoiceStatus.PENDING, count: 21, amount: 7700, percentage: 6.1 },
          { status: InvoiceStatus.OVERDUE, count: 23, amount: 8500, percentage: 6.7 }
        ]
      };
    }
  },

  // Buscar análise de pagamentos
  async getPaymentAnalytics(period?: string): Promise<PaymentAnalytics> {
    try {
      const response = await api.get('/billing/bi/payments', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise de pagamentos:', error);
      // Dados mock para desenvolvimento
      return {
        averagePaymentTime: 12.5,
        paymentSuccessRate: 94.2,
        refundRate: 2.1,
        partialPaymentRate: 8.3,
        paymentsByDay: [
          { day: '2024-03-01', amount: 1500, count: 4 },
          { day: '2024-03-02', amount: 2200, count: 6 },
          { day: '2024-03-03', amount: 1800, count: 5 }
        ],
        topPaymentMethods: [
          { method: 'CREDIT_CARD' as PaymentMethod, usage: 52.0, amount: 65000 },
          { method: 'CASH' as PaymentMethod, usage: 28.0, amount: 35000 },
          { method: 'BANK_TRANSFER' as PaymentMethod, usage: 20.0, amount: 25000 }
        ]
      };
    }
  },

  // Buscar análise de inadimplência
  async getOverdueAnalytics(period?: string): Promise<OverdueAnalytics> {
    try {
      const response = await api.get('/billing/bi/overdue', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise de inadimplência:', error);
      // Dados mock para desenvolvimento
      return {
        totalOverdueAmount: 7200,
        overdueInvoicesCount: 23,
        averageOverdueDays: 18.5,
        overdueByAgeGroup: [
          { ageGroup: '1-30 dias', count: 12, amount: 3200 },
          { ageGroup: '31-60 dias', count: 7, amount: 2500 },
          { ageGroup: '60+ dias', count: 4, amount: 1500 }
        ],
        overdueByPatient: [
          { patientId: '1', patientName: 'João Silva', overdueAmount: 850, overdueCount: 2, oldestOverdueDays: 45 },
          { patientId: '2', patientName: 'Maria Santos', overdueAmount: 620, overdueCount: 1, oldestOverdueDays: 32 }
        ]
      };
    }
  },

  // Buscar análise completa de faturamento
  async getAnalytics(period?: string): Promise<BillingAnalytics> {
    try {
      const [metrics, trends, payments, overdue] = await Promise.all([
        this.getMetrics(period),
        this.getTrends(period),
        this.getPaymentAnalytics(period),
        this.getOverdueAnalytics(period)
      ]);

      return {
        metrics,
        trends,
        payments,
        overdue,
        forecast: {
          nextMonthRevenue: metrics.monthlyRevenue * 1.08,
          expectedCollections: metrics.pendingAmount * 0.85,
          riskAmount: metrics.overdueAmount * 0.3
        }
      };
    } catch (error) {
      console.error('Erro ao buscar análise completa de faturamento:', error);
      throw error;
    }
  },

  // Buscar KPIs de faturamento
  async getKPIs(period?: string) {
    const metrics = await this.getMetrics(period);
    
    return {
      revenue: {
        current: metrics.totalRevenue,
        target: 150000,
        trend: 8.5
      },
      collectionRate: {
        current: metrics.paymentRate,
        target: 90,
        trend: 2.1
      },
      overdueRate: {
        current: metrics.overdueRate,
        target: 5,
        trend: -1.2
      },
      averagePaymentTime: {
        current: metrics.daysToPayment,
        target: 10,
        trend: -0.8
      }
    };
  },

  // Buscar dados para gráficos
  async getChartData(chartType: string, period?: string) {
    switch (chartType) {
      case 'revenue-trend':
        const trends = await this.getTrends(period);
        return trends.revenueByMonth.map(item => ({
          name: item.month,
          value: item.revenue,
          invoices: item.invoices
        }));
      
      case 'payment-methods':
        const paymentTrends = await this.getTrends(period);
        return paymentTrends.paymentMethodDistribution.map(item => ({
          name: item.method,
          value: item.amount,
          percentage: item.percentage
        }));
      
      case 'invoice-status':
        const statusTrends = await this.getTrends(period);
        return statusTrends.statusDistribution.map(item => ({
          name: item.status,
          value: item.count,
          amount: item.amount
        }));
      
      default:
        return [];
    }
  }
};