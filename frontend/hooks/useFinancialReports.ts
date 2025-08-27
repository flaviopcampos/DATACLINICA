import { useState, useEffect, useCallback } from 'react';
import { AdmissionBilling, PaymentType } from '@/types/beds';

export interface FinancialSummary {
  total_revenue: number;
  pending_amount: number;
  paid_amount: number;
  overdue_amount: number;
  total_admissions: number;
  average_daily_rate: number;
  occupancy_revenue: number;
}

export interface RevenueByPaymentType {
  payment_type: PaymentType;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  total_revenue: number;
  admissions_count: number;
  average_stay: number;
}

export interface PaymentStatus {
  id: string;
  patient_name: string;
  admission_date: string;
  discharge_date?: string;
  payment_type: PaymentType;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  due_date?: string;
  days_overdue?: number;
}

export interface FinancialFilters {
  start_date?: string;
  end_date?: string;
  payment_type?: PaymentType;
  status?: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  department_id?: string;
}

// Mock data para desenvolvimento
const mockFinancialSummary: FinancialSummary = {
  total_revenue: 125000.00,
  pending_amount: 35000.00,
  paid_amount: 90000.00,
  overdue_amount: 15000.00,
  total_admissions: 45,
  average_daily_rate: 320.50,
  occupancy_revenue: 125000.00
};

const mockRevenueByPaymentType: RevenueByPaymentType[] = [
  {
    payment_type: 'PRIVATE',
    total_amount: 75000.00,
    paid_amount: 60000.00,
    pending_amount: 15000.00,
    count: 20,
    percentage: 60.0
  },
  {
    payment_type: 'INSURANCE',
    total_amount: 40000.00,
    paid_amount: 25000.00,
    pending_amount: 15000.00,
    count: 18,
    percentage: 32.0
  },
  {
    payment_type: 'SUS',
    total_amount: 10000.00,
    paid_amount: 5000.00,
    pending_amount: 5000.00,
    count: 7,
    percentage: 8.0
  }
];

const mockMonthlyRevenue: MonthlyRevenue[] = [
  {
    month: 'Janeiro',
    year: 2024,
    total_revenue: 95000.00,
    admissions_count: 32,
    average_stay: 18.5
  },
  {
    month: 'Fevereiro',
    year: 2024,
    total_revenue: 110000.00,
    admissions_count: 38,
    average_stay: 21.2
  },
  {
    month: 'Março',
    year: 2024,
    total_revenue: 125000.00,
    admissions_count: 45,
    average_stay: 19.8
  },
  {
    month: 'Abril',
    year: 2024,
    total_revenue: 135000.00,
    admissions_count: 42,
    average_stay: 22.1
  },
  {
    month: 'Maio',
    year: 2024,
    total_revenue: 118000.00,
    admissions_count: 39,
    average_stay: 20.3
  },
  {
    month: 'Junho',
    year: 2024,
    total_revenue: 142000.00,
    admissions_count: 48,
    average_stay: 18.9
  }
];

const mockPaymentStatus: PaymentStatus[] = [
  {
    id: '1',
    patient_name: 'João Silva Santos',
    admission_date: '2024-01-15',
    discharge_date: '2024-02-10',
    payment_type: 'PRIVATE',
    total_amount: 8750.00,
    paid_amount: 8750.00,
    pending_amount: 0,
    status: 'PAID'
  },
  {
    id: '2',
    patient_name: 'Maria Oliveira Costa',
    admission_date: '2024-02-01',
    discharge_date: '2024-02-28',
    payment_type: 'INSURANCE',
    total_amount: 7560.00,
    paid_amount: 3000.00,
    pending_amount: 4560.00,
    status: 'PARTIAL',
    due_date: '2024-03-15'
  },
  {
    id: '3',
    patient_name: 'Carlos Eduardo Lima',
    admission_date: '2024-01-20',
    discharge_date: '2024-03-05',
    payment_type: 'PRIVATE',
    total_amount: 15400.00,
    paid_amount: 0,
    pending_amount: 15400.00,
    status: 'OVERDUE',
    due_date: '2024-03-20',
    days_overdue: 25
  },
  {
    id: '4',
    patient_name: 'Ana Paula Ferreira',
    admission_date: '2024-03-01',
    payment_type: 'SUS',
    total_amount: 5400.00,
    paid_amount: 0,
    pending_amount: 5400.00,
    status: 'PENDING',
    due_date: '2024-04-01'
  },
  {
    id: '5',
    patient_name: 'Roberto Almeida',
    admission_date: '2024-02-15',
    discharge_date: '2024-03-20',
    payment_type: 'INSURANCE',
    total_amount: 9240.00,
    paid_amount: 9240.00,
    pending_amount: 0,
    status: 'PAID'
  }
];

export interface UseFinancialReportsReturn {
  summary: FinancialSummary | null;
  revenueByPaymentType: RevenueByPaymentType[];
  monthlyRevenue: MonthlyRevenue[];
  paymentStatus: PaymentStatus[];
  isLoading: boolean;
  error: string | null;
  filters: FinancialFilters;
  setFilters: (filters: FinancialFilters) => void;
  exportReport: (format: 'PDF' | 'EXCEL', type: 'SUMMARY' | 'DETAILED') => Promise<void>;
  markAsPaid: (billingId: string, amount: number) => Promise<void>;
  sendPaymentReminder: (billingId: string) => Promise<void>;
  refetch: () => void;
}

export function useFinancialReports(): UseFinancialReportsReturn {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [revenueByPaymentType, setRevenueByPaymentType] = useState<RevenueByPaymentType[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FinancialFilters>({});

  const fetchFinancialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // TODO: Substituir por chamadas reais da API
      // const summaryResponse = await fetch('/api/financial/summary', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters)
      // });
      // const summaryData = await summaryResponse.json();
      
      // const revenueResponse = await fetch('/api/financial/revenue-by-payment-type', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters)
      // });
      // const revenueData = await revenueResponse.json();
      
      // const monthlyResponse = await fetch('/api/financial/monthly-revenue', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters)
      // });
      // const monthlyData = await monthlyResponse.json();
      
      // const statusResponse = await fetch('/api/financial/payment-status', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters)
      // });
      // const statusData = await statusResponse.json();
      
      setSummary(mockFinancialSummary);
      setRevenueByPaymentType(mockRevenueByPaymentType);
      setMonthlyRevenue(mockMonthlyRevenue);
      setPaymentStatus(mockPaymentStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados financeiros');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const exportReport = useCallback(async (format: 'PDF' | 'EXCEL', type: 'SUMMARY' | 'DETAILED') => {
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/financial/export', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ format, type, filters })
      // });
      // 
      // if (response.ok) {
      //   const blob = await response.blob();
      //   const url = window.URL.createObjectURL(blob);
      //   const a = document.createElement('a');
      //   a.href = url;
      //   a.download = `relatorio-financeiro-${type.toLowerCase()}.${format.toLowerCase()}`;
      //   document.body.appendChild(a);
      //   a.click();
      //   window.URL.revokeObjectURL(url);
      //   document.body.removeChild(a);
      // }
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Exportando relatório ${type} em formato ${format}`);
      alert(`Relatório ${type} exportado em formato ${format} com sucesso!`);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao exportar relatório');
    }
  }, [filters]);

  const markAsPaid = useCallback(async (billingId: string, amount: number) => {
    try {
      // TODO: Substituir por chamada real da API
      // await fetch(`/api/financial/mark-paid/${billingId}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount })
      // });
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setPaymentStatus(prevStatus => 
        prevStatus.map(payment => {
          if (payment.id === billingId) {
            const newPaidAmount = payment.paid_amount + amount;
            const newPendingAmount = payment.total_amount - newPaidAmount;
            
            let newStatus: PaymentStatus['status'] = 'PENDING';
            if (newPendingAmount <= 0) {
              newStatus = 'PAID';
            } else if (newPaidAmount > 0) {
              newStatus = 'PARTIAL';
            }
            
            return {
              ...payment,
              paid_amount: newPaidAmount,
              pending_amount: Math.max(0, newPendingAmount),
              status: newStatus
            };
          }
          return payment;
        })
      );
      
      // Atualizar resumo
      if (summary) {
        setSummary(prev => prev ? {
          ...prev,
          paid_amount: prev.paid_amount + amount,
          pending_amount: Math.max(0, prev.pending_amount - amount)
        } : null);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao marcar pagamento');
    }
  }, [summary]);

  const sendPaymentReminder = useCallback(async (billingId: string) => {
    try {
      // TODO: Substituir por chamada real da API
      // await fetch(`/api/financial/send-reminder/${billingId}`, {
      //   method: 'POST'
      // });
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log(`Lembrete de pagamento enviado para cobrança ${billingId}`);
      alert('Lembrete de pagamento enviado com sucesso!');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao enviar lembrete');
    }
  }, []);

  const refetch = useCallback(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  return {
    summary,
    revenueByPaymentType,
    monthlyRevenue,
    paymentStatus,
    isLoading,
    error,
    filters,
    setFilters,
    exportReport,
    markAsPaid,
    sendPaymentReminder,
    refetch
  };
}