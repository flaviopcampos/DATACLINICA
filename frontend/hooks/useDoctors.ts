import { useQuery } from '@tanstack/react-query';
import { User, UserFilters } from '@/types/users';
import { userService } from '@/services/userService';

// Query keys específicas para médicos
export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters?: DoctorFilters) => [...doctorKeys.lists(), { filters }] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: number) => [...doctorKeys.details(), id] as const,
  available: (date: string) => [...doctorKeys.all, 'available', date] as const,
  schedule: (id: number, date: string) => [...doctorKeys.all, 'schedule', id, date] as const,
};

// Filtros específicos para médicos
export interface DoctorFilters extends UserFilters {
  specialty?: string;
  has_license?: boolean;
  is_available?: boolean;
}

// Interface para médico (baseada em User)
export interface Doctor extends User {
  professional_license: string;
  specialty: string;
}

// Hook para buscar todos os médicos
export function useDoctors(params?: {
  page?: number;
  per_page?: number;
  filters?: DoctorFilters;
}) {
  const doctorFilters: UserFilters = {
    ...params?.filters,
    role: 'doctor', // Assumindo que médicos têm role 'doctor'
  };

  return useQuery({
    queryKey: doctorKeys.list(params?.filters),
    queryFn: () => userService.getUsers({ 
      ...params, 
      filters: doctorFilters 
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    select: (data) => ({
      ...data,
      data: data.data.filter((user: User) => 
        user.professional_license && user.specialty
      ) as Doctor[]
    })
  });
}

// Hook para buscar um médico específico
export function useDoctor(id: number, enabled = true) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (user: User) => {
      // Verifica se é realmente um médico
      if (!user.professional_license || !user.specialty) {
        throw new Error('Usuário não é um médico válido');
      }
      return user as Doctor;
    }
  });
}

// Hook para buscar médicos disponíveis em uma data específica
export function useAvailableDoctors(date: string, specialty?: string) {
  const filters: DoctorFilters = {
    is_active: true,
    is_available: true,
    ...(specialty && { specialty })
  };

  return useQuery({
    queryKey: doctorKeys.available(date),
    queryFn: () => userService.getUsers({ filters: { ...filters, role: 'doctor' } }),
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    select: (data) => ({
      ...data,
      data: data.data.filter((user: User) => 
        user.professional_license && user.specialty && user.is_active
      ) as Doctor[]
    })
  });
}

// Hook para buscar médicos por especialidade
export function useDoctorsBySpecialty(specialty: string) {
  const filters: DoctorFilters = {
    specialty,
    is_active: true,
  };

  return useQuery({
    queryKey: [...doctorKeys.lists(), 'specialty', specialty],
    queryFn: () => userService.getUsers({ filters: { ...filters, role: 'doctor' } }),
    enabled: !!specialty,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    select: (data) => ({
      ...data,
      data: data.data.filter((user: User) => 
        user.professional_license && user.specialty === specialty
      ) as Doctor[]
    })
  });
}

// Hook para buscar especialidades disponíveis
export function useSpecialties() {
  return useQuery({
    queryKey: [...doctorKeys.all, 'specialties'],
    queryFn: async () => {
      const response = await userService.getUsers({ 
        filters: { role: 'doctor', is_active: true },
        per_page: 1000 // Buscar todos os médicos para extrair especialidades
      });
      
      const specialties = [...new Set(
        response.data
          .filter((user: User) => user.specialty)
          .map((user: User) => user.specialty)
      )].sort();
      
      return specialties;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  });
}

// Hook para buscar médicos com busca por texto
export function useSearchDoctors(searchTerm: string) {
  const filters: DoctorFilters = {
    search: searchTerm,
    is_active: true,
  };

  return useQuery({
    queryKey: [...doctorKeys.lists(), 'search', searchTerm],
    queryFn: () => userService.getUsers({ filters: { ...filters, role: 'doctor' } }),
    enabled: searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    select: (data) => ({
      ...data,
      data: data.data.filter((user: User) => 
        user.professional_license && user.specialty
      ) as Doctor[]
    })
  });
}

export default {
  useDoctors,
  useDoctor,
  useAvailableDoctors,
  useDoctorsBySpecialty,
  useSpecialties,
  useSearchDoctors,
  doctorKeys,
};