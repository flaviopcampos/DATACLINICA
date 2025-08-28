import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipos básicos para médicos
export interface Doctor {
  id: number;
  name: string;
  full_name: string;
  email: string;
  phone?: string;
  specialty?: string;
  professional_license: string;
  crm?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorFilters {
  specialty_id?: string;
  is_active?: boolean;
  search?: string;
}

export interface DoctorsResponse {
  data: Doctor[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Query keys
export const doctorsKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorsKeys.all, 'list'] as const,
  list: (filters?: DoctorFilters) => [...doctorsKeys.lists(), { filters }] as const,
  details: () => [...doctorsKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorsKeys.details(), id] as const,
};

// Serviço mock para médicos
const doctorsService = {
  async getDoctors(params?: {
    page?: number;
    per_page?: number;
    filters?: DoctorFilters;
  }): Promise<DoctorsResponse> {
    // Mock data - em produção, isso seria uma chamada à API
    const mockDoctors: Doctor[] = [
      {
        id: 1,
        name: 'Dr. João Silva',
        full_name: 'Dr. João Silva',
        email: 'joao.silva@dataclinica.com',
        phone: '(11) 99999-9999',
        specialty: 'Cardiologia',
        professional_license: 'CRM-SP 123456',
        crm: 'CRM-SP 123456',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Dra. Maria Santos',
        full_name: 'Dra. Maria Santos',
        email: 'maria.santos@dataclinica.com',
        phone: '(11) 88888-8888',
        specialty: 'Pediatria',
        professional_license: 'CRM-SP 654321',
        crm: 'CRM-SP 654321',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Dr. Carlos Oliveira',
        full_name: 'Dr. Carlos Oliveira',
        email: 'carlos.oliveira@dataclinica.com',
        phone: '(11) 77777-7777',
        specialty: 'Ortopedia',
        professional_license: 'CRM-SP 789123',
        crm: 'CRM-SP 789123',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Simular filtros
    let filteredDoctors = mockDoctors;
    if (params?.filters?.is_active !== undefined) {
      filteredDoctors = filteredDoctors.filter(doctor => doctor.is_active === params.filters!.is_active);
    }
    if (params?.filters?.search) {
      const search = params.filters.search.toLowerCase();
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.name.toLowerCase().includes(search) ||
        doctor.specialty?.toLowerCase().includes(search) ||
        doctor.professional_license.toLowerCase().includes(search)
      );
    }

    return {
      data: filteredDoctors,
      total: filteredDoctors.length,
      page: params?.page || 1,
      per_page: params?.per_page || 10,
      total_pages: Math.ceil(filteredDoctors.length / (params?.per_page || 10)),
    };
  },

  async getDoctorById(id: string): Promise<Doctor> {
    const doctors = await this.getDoctors();
    const doctor = doctors.data.find(d => d.id.toString() === id);
    if (!doctor) {
      throw new Error('Médico não encontrado');
    }
    return doctor;
  },
};

// Hook para buscar médicos
export function useDoctors(params?: {
  page?: number;
  per_page?: number;
  filters?: DoctorFilters;
}) {
  return useQuery({
    queryKey: doctorsKeys.list(params?.filters),
    queryFn: () => doctorsService.getDoctors(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar médicos ativos
export function useActiveDoctors() {
  return useDoctors({
    filters: { is_active: true }
  });
}

// Hook para buscar um médico específico
export function useDoctor(id: string, enabled = true) {
  return useQuery({
    queryKey: doctorsKeys.detail(id),
    queryFn: () => doctorsService.getDoctorById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para buscar médicos por especialidade
export function useDoctorsBySpecialty(specialtyId: string) {
  return useDoctors({
    filters: { specialty_id: specialtyId, is_active: true }
  });
}