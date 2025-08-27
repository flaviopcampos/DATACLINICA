import { apiUtils } from '@/lib/api';
import type {
  Prescription,
  PrescriptionCreate,
  PrescriptionUpdate,
  PrescriptionFilters,
  PrescriptionListResponse,
  PrescriptionStats,
  PrescriptionMedication,
  PrescriptionMedicationCreate,
  PrescriptionMedicationUpdate
} from '@/types/prescription';

const BASE_URL = '/prescriptions';

export const prescriptionService = {
  // Listar prescrições com filtros e paginação
  async getAll(params?: {
    page?: number;
    per_page?: number;
    filters?: PrescriptionFilters;
  }): Promise<PrescriptionListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    
    // Adicionar filtros
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    const response = await apiUtils.get<PrescriptionListResponse>(url);
    return response.data!;
  },

  // Obter prescrição por ID
  async getById(id: number): Promise<Prescription> {
    const response = await apiUtils.get<Prescription>(`${BASE_URL}/${id}`);
    return response.data!;
  },

  // Criar nova prescrição
  async create(data: PrescriptionCreate): Promise<Prescription> {
    const response = await apiUtils.post<Prescription>(BASE_URL, data);
    return response.data!;
  },

  // Atualizar prescrição
  async update(id: number, data: PrescriptionUpdate): Promise<Prescription> {
    const response = await apiUtils.put<Prescription>(`${BASE_URL}/${id}`, data);
    return response.data!;
  },

  // Deletar prescrição
  async delete(id: number): Promise<void> {
    await apiUtils.delete(`${BASE_URL}/${id}`);
  },

  // Obter prescrições por paciente
  async getByPatient(patientId: number, params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PrescriptionListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = queryParams.toString() 
      ? `${BASE_URL}/patient/${patientId}?${queryParams}`
      : `${BASE_URL}/patient/${patientId}`;
    
    const response = await apiUtils.get<PrescriptionListResponse>(url);
    return response.data!;
  },

  // Obter prescrições por médico
  async getByDoctor(doctorId: number, params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PrescriptionListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = queryParams.toString() 
      ? `${BASE_URL}/doctor/${doctorId}?${queryParams}`
      : `${BASE_URL}/doctor/${doctorId}`;
    
    const response = await apiUtils.get<PrescriptionListResponse>(url);
    return response.data!;
  },

  // Obter estatísticas de prescrições
  async getStats(params?: {
    date_from?: string;
    date_to?: string;
    doctor_id?: number;
  }): Promise<PrescriptionStats> {
    const queryParams = new URLSearchParams();
    
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.doctor_id) queryParams.append('doctor_id', params.doctor_id.toString());
    
    const url = queryParams.toString() 
      ? `${BASE_URL}/stats?${queryParams}`
      : `${BASE_URL}/stats`;
    
    const response = await apiUtils.get<PrescriptionStats>(url);
    return response.data!;
  },

  // Cancelar prescrição
  async cancel(id: number, reason?: string): Promise<Prescription> {
    const response = await apiUtils.patch<Prescription>(`${BASE_URL}/${id}/cancel`, { reason });
    return response.data!;
  },

  // Renovar prescrição
  async renew(id: number, validity_days?: number): Promise<Prescription> {
    const response = await apiUtils.post<Prescription>(`${BASE_URL}/${id}/renew`, { validity_days });
    return response.data!;
  },

  // Gerar PDF da prescrição
  async generatePDF(id: number): Promise<Blob> {
    const response = await fetch(`/api${BASE_URL}/${id}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro ao gerar PDF');
    }
    
    return response.blob();
  },

  // Validar prescrição
  async validate(id: number): Promise<{
    is_valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await apiUtils.get<{
      is_valid: boolean;
      errors: string[];
      warnings: string[];
    }>(`${BASE_URL}/${id}/validate`);
    return response.data!;
  },

  // Buscar medicamentos (para autocomplete)
  async searchMedications(query: string): Promise<{
    medications: {
      name: string;
      active_ingredient?: string;
      common_dosages: string[];
      is_controlled: boolean;
    }[];
  }> {
    const response = await apiUtils.get<{
      medications: {
        name: string;
        active_ingredient?: string;
        common_dosages: string[];
        is_controlled: boolean;
      }[];
    }>(`/medications/search?q=${encodeURIComponent(query)}`);
    return response.data!;
  }
};

// Serviços para medicamentos da prescrição
export const prescriptionMedicationService = {
  // Listar medicamentos de uma prescrição
  async getByPrescription(prescriptionId: number): Promise<PrescriptionMedication[]> {
    const response = await apiUtils.get<PrescriptionMedication[]>(`${BASE_URL}/${prescriptionId}/medications`);
    return response.data!;
  },

  // Adicionar medicamento à prescrição
  async create(data: PrescriptionMedicationCreate): Promise<PrescriptionMedication> {
    const response = await apiUtils.post<PrescriptionMedication>(`${BASE_URL}/${data.prescription_id}/medications`, data);
    return response.data!;
  },

  // Atualizar medicamento da prescrição
  async update(prescriptionId: number, medicationId: number, data: PrescriptionMedicationUpdate): Promise<PrescriptionMedication> {
    const response = await apiUtils.put<PrescriptionMedication>(`${BASE_URL}/${prescriptionId}/medications/${medicationId}`, data);
    return response.data!;
  },

  // Remover medicamento da prescrição
  async delete(prescriptionId: number, medicationId: number): Promise<void> {
    await apiUtils.delete(`${BASE_URL}/${prescriptionId}/medications/${medicationId}`);
  }
};