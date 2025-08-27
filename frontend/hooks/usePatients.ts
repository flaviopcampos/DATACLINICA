import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, UserFilters, UserCreate, UserUpdate } from '@/types/users';
import { userService } from '@/services/userService';

// Query keys específicas para pacientes
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters?: PatientFilters) => [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: number) => [...patientKeys.details(), id] as const,
  search: (query: string) => [...patientKeys.all, 'search', query] as const,
};

// Filtros específicos para pacientes
export interface PatientFilters extends UserFilters {
  age_min?: number;
  age_max?: number;
  has_appointments?: boolean;
}

// Interface para paciente (baseada em User)
export interface Patient extends User {
  // Pacientes não têm professional_license nem specialty
  professional_license?: never;
  specialty?: never;
  // Campos específicos de pacientes podem ser adicionados aqui
  birth_date?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  insurance_number?: string;
  medical_record_number?: string;
}

// Interface para criação de paciente
export interface PatientCreate extends Omit<UserCreate, 'role' | 'professional_license' | 'specialty'> {
  birth_date?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  insurance_number?: string;
  medical_record_number?: string;
}

// Interface para atualização de paciente
export interface PatientUpdate extends Omit<UserUpdate, 'role' | 'professional_license' | 'specialty'> {
  birth_date?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  insurance_number?: string;
  medical_record_number?: string;
}

// Hook para buscar todos os pacientes
export function usePatients(params?: {
  page?: number;
  per_page?: number;
  filters?: PatientFilters;
}) {
  const patientFilters: UserFilters = {
    ...params?.filters,
    role: 'patient', // Assumindo que pacientes têm role 'patient'
  };

  return useQuery({
    queryKey: patientKeys.list(params?.filters),
    queryFn: () => userService.getUsers({ 
      ...params, 
      filters: patientFilters 
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    select: (data) => ({
      ...data,
      data: data.data.filter((user: User) => 
        !user.professional_license && !user.specialty
      ) as Patient[]
    })
  });
}

// Hook para buscar um paciente específico
export function usePatient(id: number, enabled = true) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (user: User) => {
      // Verifica se é realmente um paciente (não tem professional_license)
      if (user.professional_license || user.specialty) {
        throw new Error('Usuário não é um paciente válido');
      }
      return user as Patient;
    }
  });
}

// Hook para buscar pacientes com busca por texto
export function useSearchPatients(searchTerm: string) {
  const filters: PatientFilters = {
    search: searchTerm,
    is_active: true,
  };

  return useQuery({
    queryKey: patientKeys.search(searchTerm),
    queryFn: () => userService.getUsers({ filters: { ...filters, role: 'patient' } }),
    enabled: searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    select: (data) => ({
      ...data,
      data: data.data.filter((user: User) => 
        !user.professional_license && !user.specialty
      ) as Patient[]
    })
  });
}

// Hook para criar paciente
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientData: PatientCreate) => {
      const userData: UserCreate = {
        ...patientData,
        role: 'patient',
      };
      return userService.createUser(userData);
    },
    onSuccess: (newPatient) => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      // Add the new patient to the cache
      queryClient.setQueryData(patientKeys.detail(newPatient.id), newPatient);
      
      toast.success('Paciente criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao criar paciente';
      toast.error(message);
    },
  });
}

// Hook para atualizar paciente
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patientData }: { id: number; patientData: PatientUpdate }) => {
      const userData: UserUpdate = {
        ...patientData,
        role: 'patient',
      };
      return userService.updateUser(id, userData);
    },
    onSuccess: (updatedPatient) => {
      // Update the patient in the cache
      queryClient.setQueryData(patientKeys.detail(updatedPatient.id), updatedPatient);
      
      // Invalidate patients list to reflect changes
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      toast.success('Paciente atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao atualizar paciente';
      toast.error(message);
    },
  });
}

// Hook para deletar paciente
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove patient from cache
      queryClient.removeQueries({ queryKey: patientKeys.detail(deletedId) });
      
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      toast.success('Paciente removido com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao remover paciente';
      toast.error(message);
    },
  });
}

// Hook para pacientes recentes (últimos cadastrados)
export function useRecentPatients(limit: number = 10) {
  return useQuery({
    queryKey: [...patientKeys.lists(), 'recent', limit],
    queryFn: () => userService.getUsers({ 
      filters: { role: 'patient', is_active: true },
      per_page: limit,
      // Assumindo que há ordenação por data de criação
    }),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    select: (data) => ({
      ...data,
      data: data.data
        .filter((user: User) => !user.professional_license && !user.specialty)
        .slice(0, limit) as Patient[]
    })
  });
}

// Hook para estatísticas de pacientes
export function usePatientStats() {
  return useQuery({
    queryKey: [...patientKeys.all, 'stats'],
    queryFn: async () => {
      const response = await userService.getUsers({ 
        filters: { role: 'patient' },
        per_page: 1000 // Para calcular estatísticas
      });
      
      const patients = response.data.filter((user: User) => 
        !user.professional_license && !user.specialty
      );
      
      return {
        total: patients.length,
        active: patients.filter(p => p.is_active).length,
        inactive: patients.filter(p => !p.is_active).length,
        recent: patients.filter(p => {
          const createdAt = new Date(p.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdAt > thirtyDaysAgo;
        }).length
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

export default {
  usePatients,
  usePatient,
  useSearchPatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  useRecentPatients,
  usePatientStats,
  patientKeys,
};