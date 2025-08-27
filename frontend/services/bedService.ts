import axios from 'axios';
import {
  Bed,
  Room,
  Department,
  BedStatusHistory,
  PatientAdmission,
  BedTransfer,
  DailyRateConfig,
  AdmissionBilling,
  BedOccupancyStats,
  FinancialSummary,
  CreateBedRequest,
  CreateRoomRequest,
  CreateDepartmentRequest,
  CreateAdmissionRequest,
  UpdateBedStatusRequest,
  BedFilters,
  AdmissionFilters,
  BedStatus,
  PaymentType
} from '@/types/beds';

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de Departamentos
export const departmentService = {
  async getAll(): Promise<Department[]> {
    const response = await api.get('/departments');
    return response.data;
  },

  async getById(id: string): Promise<Department> {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  async create(data: CreateDepartmentRequest): Promise<Department> {
    const response = await api.post('/departments', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateDepartmentRequest>): Promise<Department> {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  },
};

// Serviços de Quartos
export const roomService = {
  async getAll(departmentId?: string): Promise<Room[]> {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  async getById(id: string): Promise<Room> {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  async create(data: CreateRoomRequest): Promise<Room> {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateRoomRequest>): Promise<Room> {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },
};

// Serviços de Leitos
export const bedService = {
  async getAll(filters?: BedFilters): Promise<Bed[]> {
    const response = await api.get('/beds', { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Bed> {
    const response = await api.get(`/beds/${id}`);
    return response.data;
  },

  async create(data: CreateBedRequest): Promise<Bed> {
    const response = await api.post('/beds', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateBedRequest>): Promise<Bed> {
    const response = await api.put(`/beds/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/beds/${id}`);
  },

  async updateStatus(id: string, data: UpdateBedStatusRequest): Promise<Bed> {
    const response = await api.patch(`/beds/${id}/status`, data);
    return response.data;
  },

  async getAvailable(departmentId?: string, bedType?: string): Promise<Bed[]> {
    const params = {
      status: 'AVAILABLE',
      ...(departmentId && { department_id: departmentId }),
      ...(bedType && { bed_type: bedType }),
    };
    const response = await api.get('/beds', { params });
    return response.data;
  },

  async getStatusHistory(id: string, days?: number): Promise<BedStatusHistory[]> {
    const params = days ? { days } : {};
    const response = await api.get(`/beds/${id}/status-history`, { params });
    return response.data;
  },

  async getOccupancyStats(departmentId?: string): Promise<BedOccupancyStats> {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await api.get('/beds/occupancy-stats', { params });
    return response.data;
  },
};

// Serviços de Internações
export const admissionService = {
  async getAll(filters?: AdmissionFilters): Promise<PatientAdmission[]> {
    const response = await api.get('/admissions', { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<PatientAdmission> {
    const response = await api.get(`/admissions/${id}`);
    return response.data;
  },

  async create(data: CreateAdmissionRequest): Promise<PatientAdmission> {
    const response = await api.post('/admissions', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAdmissionRequest>): Promise<PatientAdmission> {
    const response = await api.put(`/admissions/${id}`, data);
    return response.data;
  },

  async discharge(id: string, data: {
    discharge_date: string;
    discharge_reason?: string;
    discharge_notes?: string;
  }): Promise<PatientAdmission> {
    const response = await api.patch(`/admissions/${id}/discharge`, data);
    return response.data;
  },

  async transfer(id: string, data: {
    new_bed_id: string;
    transfer_reason?: string;
    transfer_notes?: string;
  }): Promise<BedTransfer> {
    const response = await api.post(`/admissions/${id}/transfer`, data);
    return response.data;
  },

  async getTransfers(admissionId: string): Promise<BedTransfer[]> {
    const response = await api.get(`/admissions/${admissionId}/transfers`);
    return response.data;
  },

  async getActive(): Promise<PatientAdmission[]> {
    const response = await api.get('/admissions', { 
      params: { status: 'ACTIVE' } 
    });
    return response.data;
  },

  async getByPatient(patientId: string): Promise<PatientAdmission[]> {
    const response = await api.get('/admissions', { 
      params: { patient_id: patientId } 
    });
    return response.data;
  },
};

// Serviços de Configuração de Diárias
export const dailyRateService = {
  async getAll(): Promise<DailyRateConfig[]> {
    const response = await api.get('/daily-rates');
    return response.data;
  },

  async getById(id: string): Promise<DailyRateConfig> {
    const response = await api.get(`/daily-rates/${id}`);
    return response.data;
  },

  async create(data: Omit<DailyRateConfig, 'id' | 'created_at' | 'updated_at'>): Promise<DailyRateConfig> {
    const response = await api.post('/daily-rates', data);
    return response.data;
  },

  async update(id: string, data: Partial<DailyRateConfig>): Promise<DailyRateConfig> {
    const response = await api.put(`/daily-rates/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/daily-rates/${id}`);
  },

  async calculate(data: {
    payment_type: PaymentType;
    bed_type: string;
    days: number;
    admission_date?: string;
  }): Promise<{
    base_rate: number;
    tier_adjustment: number;
    total_amount: number;
    tier_info: {
      tier_name: string;
      days_range: string;
      adjustment_percentage: number;
    };
  }> {
    const response = await api.post('/daily-rates/calculate', data);
    return response.data;
  },

  async simulate(data: {
    payment_type: PaymentType;
    bed_type: string;
    days: number;
  }): Promise<{
    scenarios: Array<{
      payment_type: PaymentType;
      base_rate: number;
      tier_adjustment: number;
      total_amount: number;
    }>;
  }> {
    const response = await api.post('/daily-rates/simulate', data);
    return response.data;
  },
};

// Serviços de Faturamento
export const billingService = {
  async getAdmissionBilling(admissionId: string): Promise<AdmissionBilling> {
    const response = await api.get(`/admissions/${admissionId}/billing`);
    return response.data;
  },

  async updateBilling(admissionId: string, data: Partial<AdmissionBilling>): Promise<AdmissionBilling> {
    const response = await api.put(`/admissions/${admissionId}/billing`, data);
    return response.data;
  },

  async markAsPaid(admissionId: string, data: {
    payment_date: string;
    payment_method?: string;
    payment_reference?: string;
    notes?: string;
  }): Promise<AdmissionBilling> {
    const response = await api.patch(`/admissions/${admissionId}/billing/mark-paid`, data);
    return response.data;
  },

  async addPayment(admissionId: string, data: {
    amount: number;
    payment_date: string;
    payment_method?: string;
    payment_reference?: string;
    notes?: string;
  }): Promise<AdmissionBilling> {
    const response = await api.post(`/admissions/${admissionId}/billing/payments`, data);
    return response.data;
  },

  async sendReminder(admissionId: string, data: {
    reminder_type: 'EMAIL' | 'SMS' | 'WHATSAPP';
    message?: string;
  }): Promise<void> {
    await api.post(`/admissions/${admissionId}/billing/send-reminder`, data);
  },
};

// Serviços de Relatórios Financeiros
export const financialReportService = {
  async getSummary(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    payment_type?: PaymentType;
  }): Promise<FinancialSummary> {
    const response = await api.get('/reports/financial-summary', { params: filters });
    return response.data;
  },

  async getRevenueByPaymentType(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
  }): Promise<Array<{
    payment_type: PaymentType;
    amount: number;
    count: number;
    percentage: number;
  }>> {
    const response = await api.get('/reports/revenue-by-payment-type', { params: filters });
    return response.data;
  },

  async getMonthlyRevenue(filters?: {
    year?: number;
    department_id?: string;
  }): Promise<Array<{
    month: string;
    amount: number;
    admissions: number;
    growth_percentage: number;
  }>> {
    const response = await api.get('/reports/monthly-revenue', { params: filters });
    return response.data;
  },

  async exportReport(type: 'financial-summary' | 'revenue-by-payment' | 'monthly-revenue', filters?: any): Promise<Blob> {
    const response = await api.get(`/reports/export/${type}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  async getPendingPayments(filters?: {
    department_id?: string;
    overdue_only?: boolean;
  }): Promise<PatientAdmission[]> {
    const response = await api.get('/reports/pending-payments', { params: filters });
    return response.data;
  },
};

// Serviços de Dashboard
export const dashboardService = {
  async getOccupancyTrends(days: number = 30): Promise<Array<{
    date: string;
    occupied_beds: number;
    available_beds: number;
    occupancy_rate: number;
  }>> {
    const response = await api.get('/dashboard/occupancy-trends', {
      params: { days }
    });
    return response.data;
  },

  async getDepartmentStats(): Promise<Array<{
    department_id: string;
    department_name: string;
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
    occupancy_rate: number;
    revenue_current_month: number;
  }>> {
    const response = await api.get('/dashboard/department-stats');
    return response.data;
  },

  async getRecentActivity(): Promise<Array<{
    id: string;
    type: 'ADMISSION' | 'DISCHARGE' | 'TRANSFER' | 'STATUS_CHANGE';
    description: string;
    timestamp: string;
    user_name?: string;
    bed_number?: string;
    patient_name?: string;
  }>> {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },
};

// Função utilitária para tratamento de erros
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Erro desconhecido. Tente novamente.';
};

// Função para download de arquivos
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default {
  departmentService,
  roomService,
  bedService,
  admissionService,
  dailyRateService,
  billingService,
  financialReportService,
  dashboardService,
  handleApiError,
  downloadFile,
};