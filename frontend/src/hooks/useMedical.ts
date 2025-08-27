import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MedicalSpecialty,
  MedicalSpecialtyCreate,
  MedicalSpecialtyUpdate,
  ConsultationType,
  ConsultationTypeCreate,
  ConsultationTypeUpdate,
  SpecialtyFilters,
  ConsultationTypeFilters,
  DoctorSpecialtyConfig,
  ConsultationTypeSettings
} from '../types/medical';
import { medicalService } from '../services/medicalService';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const medicalKeys = {
  all: ['medical'] as const,
  specialties: () => [...medicalKeys.all, 'specialties'] as const,
  specialtiesList: (filters?: SpecialtyFilters) => [...medicalKeys.specialties(), 'list', { filters }] as const,
  specialty: (id: string) => [...medicalKeys.specialties(), 'detail', id] as const,
  specialtyStats: (id: string, period?: { start: string; end: string }) => 
    [...medicalKeys.specialty(id), 'stats', { period }] as const,
  consultationTypes: () => [...medicalKeys.all, 'consultation-types'] as const,
  consultationTypesList: (filters?: ConsultationTypeFilters) => 
    [...medicalKeys.consultationTypes(), 'list', { filters }] as const,
  consultationType: (id: string) => [...medicalKeys.consultationTypes(), 'detail', id] as const,
  doctorConfig: (doctorId: string) => [...medicalKeys.all, 'doctor-config', doctorId] as const,
  doctorConsultationTypes: (doctorId: string, specialtyId?: string) => 
    [...medicalKeys.all, 'doctor-consultation-types', doctorId, { specialtyId }] as const,
  settings: () => [...medicalKeys.all, 'settings'] as const,
  stats: (period?: { start: string; end: string }) => [...medicalKeys.all, 'stats', { period }] as const,
};

// ============================================================================
// ESPECIALIDADES MÉDICAS
// ============================================================================

// Hook para buscar especialidades
export function useSpecialties(params?: {
  page?: number;
  per_page?: number;
  filters?: SpecialtyFilters;
}) {
  return useQuery({
    queryKey: medicalKeys.specialtiesList(params?.filters),
    queryFn: () => medicalService.getSpecialties(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar especialidades ativas
export function useActiveSpecialties() {
  return useQuery({
    queryKey: medicalKeys.specialtiesList({ is_active: true }),
    queryFn: () => medicalService.getActiveSpecialties(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para buscar uma especialidade específica
export function useSpecialty(id: string, enabled = true) {
  return useQuery({
    queryKey: medicalKeys.specialty(id),
    queryFn: () => medicalService.getSpecialtyById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para buscar estatísticas de especialidade
export function useSpecialtyStats(id: string, period?: { start: string; end: string }) {
  return useQuery({
    queryKey: medicalKeys.specialtyStats(id, period),
    queryFn: () => medicalService.getSpecialtyStats(id, period),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para criar especialidade
export function useCreateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MedicalSpecialtyCreate) => medicalService.createSpecialty(data),
    onSuccess: (newSpecialty) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.specialties() });
      
      toast.success('Especialidade criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar especialidade');
    },
  });
}

// Hook para atualizar especialidade
export function useUpdateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedicalSpecialtyUpdate }) => 
      medicalService.updateSpecialty(id, data),
    onSuccess: (updatedSpecialty) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.specialties() });
      queryClient.invalidateQueries({ queryKey: medicalKeys.specialty(updatedSpecialty.id) });
      
      toast.success('Especialidade atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar especialidade');
    },
  });
}

// Hook para deletar especialidade
export function useDeleteSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicalService.deleteSpecialty(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.specialties() });
      
      toast.success('Especialidade removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover especialidade');
    },
  });
}

// ============================================================================
// TIPOS DE CONSULTA
// ============================================================================

// Hook para buscar tipos de consulta
export function useConsultationTypes(params?: {
  page?: number;
  per_page?: number;
  filters?: ConsultationTypeFilters;
}) {
  return useQuery({
    queryKey: medicalKeys.consultationTypesList(params?.filters),
    queryFn: () => medicalService.getConsultationTypes(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar tipos de consulta ativos
export function useActiveConsultationTypes(specialtyId?: string) {
  return useQuery({
    queryKey: medicalKeys.consultationTypesList({ is_active: true, specialty_id: specialtyId }),
    queryFn: () => medicalService.getActiveConsultationTypes(specialtyId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para buscar tipos de consulta compatíveis com telemedicina
export function useTelemedicineConsultationTypes() {
  return useQuery({
    queryKey: medicalKeys.consultationTypesList({ is_active: true, is_telemedicine_compatible: true }),
    queryFn: () => medicalService.getTelemedicineCompatibleTypes(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Hook para buscar um tipo de consulta específico
export function useConsultationType(id: string, enabled = true) {
  return useQuery({
    queryKey: medicalKeys.consultationType(id),
    queryFn: () => medicalService.getConsultationTypeById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para criar tipo de consulta
export function useCreateConsultationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConsultationTypeCreate) => medicalService.createConsultationType(data),
    onSuccess: (newType) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.consultationTypes() });
      
      toast.success('Tipo de consulta criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar tipo de consulta');
    },
  });
}

// Hook para atualizar tipo de consulta
export function useUpdateConsultationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConsultationTypeUpdate }) => 
      medicalService.updateConsultationType(id, data),
    onSuccess: (updatedType) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.consultationTypes() });
      queryClient.invalidateQueries({ queryKey: medicalKeys.consultationType(updatedType.id) });
      
      toast.success('Tipo de consulta atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar tipo de consulta');
    },
  });
}

// Hook para deletar tipo de consulta
export function useDeleteConsultationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicalService.deleteConsultationType(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.consultationTypes() });
      
      toast.success('Tipo de consulta removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover tipo de consulta');
    },
  });
}

// ============================================================================
// CONFIGURAÇÕES DE MÉDICO
// ============================================================================

// Hook para buscar configuração de especialidades do médico
export function useDoctorSpecialtyConfig(doctorId: string) {
  return useQuery({
    queryKey: medicalKeys.doctorConfig(doctorId),
    queryFn: () => medicalService.getDoctorSpecialtyConfig(doctorId),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para buscar tipos de consulta do médico
export function useDoctorConsultationTypes(doctorId: string, specialtyId?: string) {
  return useQuery({
    queryKey: medicalKeys.doctorConsultationTypes(doctorId, specialtyId),
    queryFn: () => medicalService.getDoctorConsultationTypes(doctorId, specialtyId),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para atualizar configuração de especialidades do médico
export function useUpdateDoctorSpecialtyConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, config }: { doctorId: string; config: DoctorSpecialtyConfig[] }) => 
      medicalService.updateDoctorSpecialtyConfig(doctorId, config),
    onSuccess: (_, { doctorId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.doctorConfig(doctorId) });
      queryClient.invalidateQueries({ queryKey: medicalKeys.doctorConsultationTypes(doctorId) });
      
      toast.success('Configuração atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configuração');
    },
  });
}

// ============================================================================
// CONFIGURAÇÕES GLOBAIS
// ============================================================================

// Hook para buscar configurações de tipos de consulta
export function useConsultationTypeSettings() {
  return useQuery({
    queryKey: medicalKeys.settings(),
    queryFn: () => medicalService.getConsultationTypeSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para atualizar configurações de tipos de consulta
export function useUpdateConsultationTypeSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: ConsultationTypeSettings) => 
      medicalService.updateConsultationTypeSettings(settings),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.settings() });
      
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configurações');
    },
  });
}

// ============================================================================
// ESTATÍSTICAS E UTILITÁRIOS
// ============================================================================

// Hook para buscar estatísticas gerais
export function useMedicalStats(period?: { start: string; end: string }) {
  return useQuery({
    queryKey: medicalKeys.stats(period),
    queryFn: () => medicalService.getMedicalStats(period),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para validar tipo de consulta com especialidade
export function useValidateConsultationSpecialty() {
  return useMutation({
    mutationFn: ({ consultationTypeId, specialtyId }: { 
      consultationTypeId: string; 
      specialtyId: string; 
    }) => medicalService.validateConsultationTypeForSpecialty(consultationTypeId, specialtyId),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro na validação');
    },
  });
}

// Hook para obter preço sugerido
export function useSuggestedPrice() {
  return useMutation({
    mutationFn: ({ consultationTypeId, doctorId, specialtyId }: {
      consultationTypeId: string;
      doctorId?: string;
      specialtyId?: string;
    }) => medicalService.getSuggestedPrice(consultationTypeId, doctorId, specialtyId),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao obter preço sugerido');
    },
  });
}

// Hook para inicializar dados padrão
export function useInitializeDefaultData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const [specialties, consultationTypes] = await Promise.all([
        medicalService.initializeDefaultSpecialties(),
        medicalService.initializeDefaultConsultationTypes()
      ]);
      return { specialties, consultationTypes };
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: medicalKeys.specialties() });
      queryClient.invalidateQueries({ queryKey: medicalKeys.consultationTypes() });
      
      toast.success('Dados padrão inicializados com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao inicializar dados padrão');
    },
  });
}