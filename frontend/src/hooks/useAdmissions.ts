import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { admissionsService } from '../services/admissionsService';
import type {
  PatientAdmission,
  CreateAdmissionForm,
  UpdateAdmissionForm,
  AdmissionFilters,
  AdmissionStats,
  UseAdmissionsReturn,
  UseAdmissionDetailsReturn
} from '../types/admissions';

// Hook principal para gerenciar internações
export function useAdmissions(filters?: AdmissionFilters): UseAdmissionsReturn {
  const queryClient = useQueryClient();

  // Query para listar internações
  const {
    data: admissions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admissions', filters],
    queryFn: () => admissionsService.getAdmissions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar internação
  const createAdmissionMutation = useMutation({
    mutationFn: (data: CreateAdmissionForm) => admissionsService.createAdmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Internação criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar internação');
    }
  });

  // Mutation para atualizar internação
  const updateAdmissionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdmissionForm }) => 
      admissionsService.updateAdmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admission-details'] });
      toast.success('Internação atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar internação');
    }
  });

  // Mutation para dar alta
  const dischargeAdmissionMutation = useMutation({
    mutationFn: (id: string) => admissionsService.dischargeAdmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Alta realizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao realizar alta');
    }
  });

  // Mutation para cancelar internação
  const cancelAdmissionMutation = useMutation({
    mutationFn: (id: string) => admissionsService.cancelAdmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Internação cancelada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar internação');
    }
  });

  return {
    admissions,
    isLoading,
    error: error?.message || null,
    refetch,
    createAdmission: createAdmissionMutation.mutateAsync,
    updateAdmission: updateAdmissionMutation.mutateAsync,
    dischargeAdmission: dischargeAdmissionMutation.mutateAsync,
    cancelAdmission: cancelAdmissionMutation.mutateAsync,
    isCreating: createAdmissionMutation.isPending,
    isUpdating: updateAdmissionMutation.isPending,
    isDischarging: dischargeAdmissionMutation.isPending,
    isCanceling: cancelAdmissionMutation.isPending
  };
}

// Hook para detalhes de uma internação específica
export function useAdmissionDetails(id: string): UseAdmissionDetailsReturn {
  const queryClient = useQueryClient();

  const {
    data: admission,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admission-details', id],
    queryFn: () => admissionsService.getAdmissionById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para adicionar nota médica
  const addMedicalNoteMutation = useMutation({
    mutationFn: (note: string) => admissionsService.addMedicalNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-details', id] });
      toast.success('Nota médica adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar nota médica');
    }
  });

  // Mutation para adicionar sinais vitais
  const addVitalSignsMutation = useMutation({
    mutationFn: (vitalSigns: any) => admissionsService.addVitalSigns(id, vitalSigns),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-details', id] });
      toast.success('Sinais vitais adicionados com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar sinais vitais');
    }
  });

  return {
    admission: admission || null,
    isLoading,
    error: error?.message || null,
    refetch,
    addMedicalNote: addMedicalNoteMutation.mutateAsync,
    addVitalSigns: addVitalSignsMutation.mutateAsync,
    isAddingNote: addMedicalNoteMutation.isPending,
    isAddingVitalSigns: addVitalSignsMutation.isPending
  };
}

// Hook para estatísticas de internações
export function useAdmissionStats(filters?: AdmissionFilters) {
  return useQuery({
    queryKey: ['admission-stats', filters],
    queryFn: () => admissionsService.getAdmissionStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar internações por paciente
export function usePatientAdmissions(patientId: string) {
  return useQuery({
    queryKey: ['patient-admissions', patientId],
    queryFn: () => admissionsService.getAdmissionsByPatient(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar internações por leito
export function useBedAdmissions(bedId: string) {
  return useQuery({
    queryKey: ['bed-admissions', bedId],
    queryFn: () => admissionsService.getAdmissionsByBed(bedId),
    enabled: !!bedId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar internações por departamento
export function useDepartmentAdmissions(departmentId: string) {
  return useQuery({
    queryKey: ['department-admissions', departmentId],
    queryFn: () => admissionsService.getAdmissionsByDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para validar internação
export function useAdmissionValidation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (admissionId: string) => admissionsService.validateAdmission(admissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admission-details'] });
      toast.success('Internação validada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao validar internação');
    }
  });
}

// Hook para verificar disponibilidade de leito
export function useBedAvailability() {
  return useMutation({
    mutationFn: ({ bedId, startDate, endDate }: { bedId: string; startDate: string; endDate?: string }) => 
      admissionsService.checkBedAvailability(bedId, startDate, endDate),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao verificar disponibilidade do leito');
    }
  });
}

// Hook para histórico de internações
export function useAdmissionHistory(patientId?: string, bedId?: string) {
  return useQuery({
    queryKey: ['admission-history', patientId, bedId],
    queryFn: () => admissionsService.getAdmissionHistory(patientId, bedId),
    enabled: !!(patientId || bedId),
    staleTime: 10 * 60 * 1000,
  });
}