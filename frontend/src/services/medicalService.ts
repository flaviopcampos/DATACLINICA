import { api } from './api';
import {
  MedicalSpecialty,
  MedicalSpecialtyCreate,
  MedicalSpecialtyUpdate,
  ConsultationType,
  ConsultationTypeCreate,
  ConsultationTypeUpdate,
  SpecialtiesResponse,
  ConsultationTypesResponse,
  SpecialtyFilters,
  ConsultationTypeFilters,
  DoctorSpecialtyConfig,
  SpecialtyStats,
  ConsultationTypeSettings,
  DEFAULT_MEDICAL_SPECIALTIES,
  DEFAULT_CONSULTATION_TYPES
} from '../types/medical';

class MedicalService {
  // ============================================================================
  // ESPECIALIDADES MÉDICAS
  // ============================================================================

  async getSpecialties(params?: {
    page?: number;
    per_page?: number;
    filters?: SpecialtyFilters;
  }): Promise<SpecialtiesResponse> {
    const response = await api.get('/medical/specialties', { params });
    return response.data;
  }

  async getSpecialtyById(id: string): Promise<MedicalSpecialty> {
    const response = await api.get(`/medical/specialties/${id}`);
    return response.data;
  }

  async createSpecialty(data: MedicalSpecialtyCreate): Promise<MedicalSpecialty> {
    const response = await api.post('/medical/specialties', data);
    return response.data;
  }

  async updateSpecialty(id: string, data: MedicalSpecialtyUpdate): Promise<MedicalSpecialty> {
    const response = await api.put(`/medical/specialties/${id}`, data);
    return response.data;
  }

  async deleteSpecialty(id: string): Promise<void> {
    await api.delete(`/medical/specialties/${id}`);
  }

  async getSpecialtyStats(id: string, period?: { start: string; end: string }): Promise<SpecialtyStats> {
    const response = await api.get(`/medical/specialties/${id}/stats`, { params: period });
    return response.data;
  }

  // Inicializar especialidades padrão
  async initializeDefaultSpecialties(): Promise<MedicalSpecialty[]> {
    const specialtiesToCreate = DEFAULT_MEDICAL_SPECIALTIES.map(specialty => ({
      ...specialty,
      is_active: true
    }));

    const response = await api.post('/medical/specialties/bulk', {
      specialties: specialtiesToCreate
    });
    return response.data;
  }

  // ============================================================================
  // TIPOS DE CONSULTA
  // ============================================================================

  async getConsultationTypes(params?: {
    page?: number;
    per_page?: number;
    filters?: ConsultationTypeFilters;
  }): Promise<ConsultationTypesResponse> {
    const response = await api.get('/medical/consultation-types', { params });
    return response.data;
  }

  async getConsultationTypeById(id: string): Promise<ConsultationType> {
    const response = await api.get(`/medical/consultation-types/${id}`);
    return response.data;
  }

  async createConsultationType(data: ConsultationTypeCreate): Promise<ConsultationType> {
    const response = await api.post('/medical/consultation-types', data);
    return response.data;
  }

  async updateConsultationType(id: string, data: ConsultationTypeUpdate): Promise<ConsultationType> {
    const response = await api.put(`/medical/consultation-types/${id}`, data);
    return response.data;
  }

  async deleteConsultationType(id: string): Promise<void> {
    await api.delete(`/medical/consultation-types/${id}`);
  }

  // Inicializar tipos de consulta padrão
  async initializeDefaultConsultationTypes(): Promise<ConsultationType[]> {
    const typesToCreate = DEFAULT_CONSULTATION_TYPES.map(type => ({
      ...type,
      is_active: true
    }));

    const response = await api.post('/medical/consultation-types/bulk', {
      consultation_types: typesToCreate
    });
    return response.data;
  }

  // ============================================================================
  // CONFIGURAÇÕES DE MÉDICO
  // ============================================================================

  async getDoctorSpecialtyConfig(doctorId: string): Promise<DoctorSpecialtyConfig[]> {
    const response = await api.get(`/doctors/${doctorId}/specialty-config`);
    return response.data;
  }

  async updateDoctorSpecialtyConfig(
    doctorId: string, 
    config: DoctorSpecialtyConfig[]
  ): Promise<DoctorSpecialtyConfig[]> {
    const response = await api.put(`/doctors/${doctorId}/specialty-config`, { config });
    return response.data;
  }

  async getDoctorConsultationTypes(doctorId: string, specialtyId?: string): Promise<ConsultationType[]> {
    const params = specialtyId ? { specialty_id: specialtyId } : {};
    const response = await api.get(`/doctors/${doctorId}/consultation-types`, { params });
    return response.data;
  }

  // ============================================================================
  // CONFIGURAÇÕES GLOBAIS
  // ============================================================================

  async getConsultationTypeSettings(): Promise<ConsultationTypeSettings> {
    const response = await api.get('/medical/consultation-type-settings');
    return response.data;
  }

  async updateConsultationTypeSettings(settings: ConsultationTypeSettings): Promise<ConsultationTypeSettings> {
    const response = await api.put('/medical/consultation-type-settings', settings);
    return response.data;
  }

  // ============================================================================
  // MÉTODOS UTILITÁRIOS
  // ============================================================================

  // Buscar especialidades ativas
  async getActiveSpecialties(): Promise<MedicalSpecialty[]> {
    const response = await this.getSpecialties({
      filters: { is_active: true },
      per_page: 1000
    });
    return response.specialties;
  }

  // Buscar tipos de consulta ativos
  async getActiveConsultationTypes(specialtyId?: string): Promise<ConsultationType[]> {
    const filters: ConsultationTypeFilters = { is_active: true };
    if (specialtyId) {
      filters.specialty_id = specialtyId;
    }

    const response = await this.getConsultationTypes({
      filters,
      per_page: 1000
    });
    return response.consultation_types;
  }

  // Buscar tipos de consulta compatíveis com telemedicina
  async getTelemedicineCompatibleTypes(): Promise<ConsultationType[]> {
    const response = await this.getConsultationTypes({
      filters: { 
        is_active: true, 
        is_telemedicine_compatible: true 
      },
      per_page: 1000
    });
    return response.consultation_types;
  }

  // Validar se um tipo de consulta é compatível com uma especialidade
  async validateConsultationTypeForSpecialty(
    consultationTypeId: string, 
    specialtyId: string
  ): Promise<{ valid: boolean; message?: string }> {
    const response = await api.post('/medical/validate-consultation-specialty', {
      consultation_type_id: consultationTypeId,
      specialty_id: specialtyId
    });
    return response.data;
  }

  // Obter preço sugerido para um tipo de consulta
  async getSuggestedPrice(
    consultationTypeId: string, 
    doctorId?: string, 
    specialtyId?: string
  ): Promise<{ price: number; currency: string }> {
    const params: any = { consultation_type_id: consultationTypeId };
    if (doctorId) params.doctor_id = doctorId;
    if (specialtyId) params.specialty_id = specialtyId;

    const response = await api.get('/medical/suggested-price', { params });
    return response.data;
  }

  // Buscar estatísticas gerais
  async getMedicalStats(period?: { start: string; end: string }): Promise<{
    total_specialties: number;
    active_specialties: number;
    total_consultation_types: number;
    active_consultation_types: number;
    most_popular_specialty: string;
    most_popular_consultation_type: string;
    average_consultation_duration: number;
  }> {
    const response = await api.get('/medical/stats', { params: period });
    return response.data;
  }
}

export const medicalService = new MedicalService();
export default medicalService;