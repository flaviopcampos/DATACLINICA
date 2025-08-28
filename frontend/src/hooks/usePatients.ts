import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipos básicos para pacientes
export interface Patient {
  id: number;
  name: string;
  full_name: string;
  email: string;
  phone?: string;
  cpf: string;
  birth_date: string;
  gender: 'M' | 'F' | 'O';
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_number?: string;
  insurance_provider?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientFilters {
  is_active?: boolean;
  search?: string;
  insurance_provider?: string;
  city?: string;
}

export interface PatientsResponse {
  data: Patient[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Query keys
export const patientsKeys = {
  all: ['patients'] as const,
  lists: () => [...patientsKeys.all, 'list'] as const,
  list: (filters?: PatientFilters) => [...patientsKeys.lists(), { filters }] as const,
  details: () => [...patientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientsKeys.details(), id] as const,
};

// Serviço mock para pacientes
const patientsService = {
  async getPatients(params?: {
    page?: number;
    per_page?: number;
    filters?: PatientFilters;
  }): Promise<PatientsResponse> {
    // Mock data - em produção, isso seria uma chamada à API
    const mockPatients: Patient[] = [
      {
        id: 1,
        name: 'Ana Silva',
        full_name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '(11) 99999-1111',
        cpf: '123.456.789-01',
        birth_date: '1985-03-15',
        gender: 'F',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        emergency_contact: 'João Silva',
        emergency_phone: '(11) 88888-1111',
        insurance_number: 'UNIMED123456',
        insurance_provider: 'Unimed',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Carlos Santos',
        full_name: 'Carlos Santos',
        email: 'carlos.santos@email.com',
        phone: '(11) 77777-2222',
        cpf: '987.654.321-09',
        birth_date: '1978-07-22',
        gender: 'M',
        address: 'Av. Paulista, 456',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01310-100',
        emergency_contact: 'Maria Santos',
        emergency_phone: '(11) 66666-2222',
        insurance_number: 'BRADESCO789',
        insurance_provider: 'Bradesco Saúde',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Mariana Oliveira',
        full_name: 'Mariana Oliveira',
        email: 'mariana.oliveira@email.com',
        phone: '(11) 55555-3333',
        cpf: '456.789.123-45',
        birth_date: '1992-11-08',
        gender: 'F',
        address: 'Rua Augusta, 789',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01305-000',
        emergency_contact: 'Pedro Oliveira',
        emergency_phone: '(11) 44444-3333',
        insurance_number: 'AMIL456789',
        insurance_provider: 'Amil',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        name: 'Roberto Costa',
        full_name: 'Roberto Costa',
        email: 'roberto.costa@email.com',
        phone: '(11) 33333-4444',
        cpf: '789.123.456-78',
        birth_date: '1965-12-03',
        gender: 'M',
        address: 'Rua da Consolação, 321',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01302-907',
        emergency_contact: 'Lucia Costa',
        emergency_phone: '(11) 22222-4444',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Simular filtros
    let filteredPatients = mockPatients;
    if (params?.filters?.is_active !== undefined) {
      filteredPatients = filteredPatients.filter(patient => patient.is_active === params.filters!.is_active);
    }
    if (params?.filters?.search) {
      const search = params.filters.search.toLowerCase();
      filteredPatients = filteredPatients.filter(patient => 
        patient.name.toLowerCase().includes(search) ||
        patient.cpf.includes(search) ||
        patient.email.toLowerCase().includes(search) ||
        patient.phone?.includes(search)
      );
    }
    if (params?.filters?.insurance_provider) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.insurance_provider?.toLowerCase().includes(params.filters!.insurance_provider!.toLowerCase())
      );
    }

    return {
      data: filteredPatients,
      total: filteredPatients.length,
      page: params?.page || 1,
      per_page: params?.per_page || 10,
      total_pages: Math.ceil(filteredPatients.length / (params?.per_page || 10)),
    };
  },

  async getPatientById(id: string): Promise<Patient> {
    const patients = await this.getPatients();
    const patient = patients.data.find(p => p.id.toString() === id);
    if (!patient) {
      throw new Error('Paciente não encontrado');
    }
    return patient;
  },
};

// Hook para buscar pacientes
export function usePatients(params?: {
  page?: number;
  per_page?: number;
  filters?: PatientFilters;
}) {
  return useQuery({
    queryKey: patientsKeys.list(params?.filters),
    queryFn: () => patientsService.getPatients(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar pacientes ativos
export function useActivePatients() {
  return usePatients({
    filters: { is_active: true }
  });
}

// Hook para buscar um paciente específico
export function usePatient(id: string, enabled = true) {
  return useQuery({
    queryKey: patientsKeys.detail(id),
    queryFn: () => patientsService.getPatientById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para buscar pacientes por convênio
export function usePatientsByInsurance(insuranceProvider: string) {
  return usePatients({
    filters: { insurance_provider: insuranceProvider, is_active: true }
  });
}