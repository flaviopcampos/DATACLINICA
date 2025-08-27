import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dischargesService } from '../services/dischargesService';
import type {
  Discharge,
  CreateDischargeForm,
  UpdateDischargeForm,
  DischargeFilters,
  DischargeStats,
  DischargeValidation,
  DischargeChecklist,
  UseDischargesReturn,
  UseDischargeDetailsReturn
} from '../types/discharges';

// Hook principal para gerenciar altas
export function useDischarges(filters?: DischargeFilters): UseDischargesReturn {
  const queryClient = useQueryClient();

  // Query para listar altas
  const {
    data: discharges = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['discharges', filters],
    queryFn: () => dischargesService.getDischarges(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar alta
  const createDischargeMutation = useMutation({
    mutationFn: (data: CreateDischargeForm) => dischargesService.createDischarge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      toast.success('Alta criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar alta');
    }
  });

  // Mutation para atualizar alta
  const updateDischargeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDischargeForm }) => 
      dischargesService.updateDischarge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['discharge-details'] });
      toast.success('Alta atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar alta');
    }
  });

  // Mutation para aprovar alta
  const approveDischargeMutation = useMutation({
    mutationFn: (id: string) => dischargesService.approveDischarge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['discharge-details'] });
      toast.success('Alta aprovada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao aprovar alta');
    }
  });

  // Mutation para rejeitar alta
  const rejectDischargeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      dischargesService.rejectDischarge(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['discharge-details'] });
      toast.success('Alta rejeitada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao rejeitar alta');
    }
  });

  // Mutation para completar alta
  const completeDischargeMutation = useMutation({
    mutationFn: (id: string) => dischargesService.completeDischarge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Alta completada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao completar alta');
    }
  });

  // Mutation para cancelar alta
  const cancelDischargeMutation = useMutation({
    mutationFn: (id: string) => dischargesService.cancelDischarge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['discharge-details'] });
      toast.success('Alta cancelada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar alta');
    }
  });

  return {
    discharges,
    isLoading,
    error: error?.message || null,
    refetch,
    createDischarge: createDischargeMutation.mutateAsync,
    updateDischarge: updateDischargeMutation.mutateAsync,
    approveDischarge: approveDischargeMutation.mutateAsync,
    rejectDischarge: rejectDischargeMutation.mutateAsync,
    completeDischarge: completeDischargeMutation.mutateAsync,
    cancelDischarge: cancelDischargeMutation.mutateAsync,
    isCreating: createDischargeMutation.isPending,
    isUpdating: updateDischargeMutation.isPending,
    isApproving: approveDischargeMutation.isPending,
    isRejecting: rejectDischargeMutation.isPending,
    isCompleting: completeDischargeMutation.isPending,
    isCanceling: cancelDischargeMutation.isPending
  };
}

// Hook para detalhes de uma alta específica
export function useDischargeDetails(id: string): UseDischargeDetailsReturn {
  const queryClient = useQueryClient();

  const {
    data: discharge,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['discharge-details', id],
    queryFn: () => dischargesService.getDischargeById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para adicionar medicação
  const addMedicationMutation = useMutation({
    mutationFn: (medication: any) => dischargesService.addDischargeMedication(id, medication),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharge-details', id] });
      toast.success('Medicação adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar medicação');
    }
  });

  // Mutation para adicionar diagnóstico
  const addDiagnosisMutation = useMutation({
    mutationFn: (diagnosis: any) => dischargesService.addDischargeDiagnosis(id, diagnosis),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharge-details', id] });
      toast.success('Diagnóstico adicionado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar diagnóstico');
    }
  });

  // Mutation para adicionar documento
  const addDocumentMutation = useMutation({
    mutationFn: (document: any) => dischargesService.addDischargeDocument(id, document),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharge-details', id] });
      toast.success('Documento adicionado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar documento');
    }
  });

  return {
    discharge: discharge || null,
    isLoading,
    error: error?.message || null,
    refetch,
    addMedication: addMedicationMutation.mutateAsync,
    addDiagnosis: addDiagnosisMutation.mutateAsync,
    addDocument: addDocumentMutation.mutateAsync,
    isAddingMedication: addMedicationMutation.isPending,
    isAddingDiagnosis: addDiagnosisMutation.isPending,
    isAddingDocument: addDocumentMutation.isPending
  };
}

// Hook para estatísticas de altas
export function useDischargeStats(filters?: DischargeFilters) {
  return useQuery({
    queryKey: ['discharge-stats', filters],
    queryFn: () => dischargesService.getDischargeStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para validação de alta
export function useDischargeValidation(dischargeId: string) {
  return useQuery({
    queryKey: ['discharge-validation', dischargeId],
    queryFn: () => dischargesService.validateDischarge(dischargeId),
    enabled: !!dischargeId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para checklist de alta
export function useDischargeChecklist(dischargeId: string) {
  const queryClient = useQueryClient();

  const {
    data: checklist,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['discharge-checklist', dischargeId],
    queryFn: () => dischargesService.getDischargeChecklist(dischargeId),
    enabled: !!dischargeId,
    staleTime: 2 * 60 * 1000,
  });

  // Mutation para atualizar item do checklist
  const updateChecklistItemMutation = useMutation({
    mutationFn: ({ itemId, completed, notes }: { itemId: string; completed: boolean; notes?: string }) => 
      dischargesService.updateDischargeChecklistItem(dischargeId, itemId, completed, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharge-checklist', dischargeId] });
      toast.success('Checklist atualizado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar checklist');
    }
  });

  return {
    checklist: checklist || null,
    isLoading,
    error: error?.message || null,
    refetch,
    updateChecklistItem: updateChecklistItemMutation.mutateAsync,
    isUpdatingItem: updateChecklistItemMutation.isPending
  };
}

// Hook para buscar altas por paciente
export function usePatientDischarges(patientId: string) {
  return useQuery({
    queryKey: ['patient-discharges', patientId],
    queryFn: () => dischargesService.getDischargesByPatient(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar altas por departamento
export function useDepartmentDischarges(departmentId: string) {
  return useQuery({
    queryKey: ['department-discharges', departmentId],
    queryFn: () => dischargesService.getDischargesByDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para planejamento de alta
export function useDischargePlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (admissionId: string) => dischargesService.planDischarge(admissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      toast.success('Planejamento de alta iniciado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao planejar alta');
    }
  });
}

// Hook para execução de alta
export function useDischargeExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dischargeId: string) => dischargesService.executeDischarge(dischargeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Alta executada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao executar alta');
    }
  });
}

// Hook para templates de alta
export function useDischargeTemplates() {
  return useQuery({
    queryKey: ['discharge-templates'],
    queryFn: () => dischargesService.getDischargeTemplates(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para avaliação de risco de readmissão
export function useReadmissionRisk(patientId: string) {
  return useQuery({
    queryKey: ['readmission-risk', patientId],
    queryFn: () => dischargesService.assessReadmissionRisk(patientId),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });
}