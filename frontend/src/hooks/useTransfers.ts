import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { transfersService } from '../services/transfersService';
import type {
  Transfer,
  CreateTransferForm,
  UpdateTransferForm,
  TransferFilters,
  TransferStats,
  TransferValidation,
  BedAvailability,
  UseTransfersReturn,
  UseTransferDetailsReturn
} from '../types/transfers';

// Hook principal para gerenciar transferências
export function useTransfers(filters?: TransferFilters): UseTransfersReturn {
  const queryClient = useQueryClient();

  // Query para listar transferências
  const {
    data: transfers = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transfers', filters],
    queryFn: () => transfersService.getTransfers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar transferência
  const createTransferMutation = useMutation({
    mutationFn: (data: CreateTransferForm) => transfersService.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Transferência criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar transferência');
    }
  });

  // Mutation para atualizar transferência
  const updateTransferMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransferForm }) => 
      transfersService.updateTransfer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-details'] });
      toast.success('Transferência atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar transferência');
    }
  });

  // Mutation para aprovar transferência
  const approveTransferMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => 
      transfersService.approveTransfer(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-details'] });
      toast.success('Transferência aprovada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao aprovar transferência');
    }
  });

  // Mutation para rejeitar transferência
  const rejectTransferMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      transfersService.rejectTransfer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-details'] });
      toast.success('Transferência rejeitada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao rejeitar transferência');
    }
  });

  // Mutation para iniciar transferência
  const startTransferMutation = useMutation({
    mutationFn: (id: string) => transfersService.startTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-details'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      toast.success('Transferência iniciada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao iniciar transferência');
    }
  });

  // Mutation para completar transferência
  const completeTransferMutation = useMutation({
    mutationFn: (id: string) => transfersService.completeTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Transferência completada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao completar transferência');
    }
  });

  // Mutation para cancelar transferência
  const cancelTransferMutation = useMutation({
    mutationFn: (id: string) => transfersService.cancelTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-details'] });
      toast.success('Transferência cancelada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar transferência');
    }
  });

  return {
    transfers,
    isLoading,
    error: error?.message || null,
    refetch,
    createTransfer: createTransferMutation.mutateAsync,
    updateTransfer: updateTransferMutation.mutateAsync,
    approveTransfer: approveTransferMutation.mutateAsync,
    rejectTransfer: rejectTransferMutation.mutateAsync,
    startTransfer: startTransferMutation.mutateAsync,
    completeTransfer: completeTransferMutation.mutateAsync,
    cancelTransfer: cancelTransferMutation.mutateAsync,
    isCreating: createTransferMutation.isPending,
    isUpdating: updateTransferMutation.isPending,
    isApproving: approveTransferMutation.isPending,
    isRejecting: rejectTransferMutation.isPending,
    isStarting: startTransferMutation.isPending,
    isCompleting: completeTransferMutation.isPending,
    isCanceling: cancelTransferMutation.isPending
  };
}

// Hook para detalhes de uma transferência específica
export function useTransferDetails(id: string): UseTransferDetailsReturn {
  const queryClient = useQueryClient();

  const {
    data: transfer,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transfer-details', id],
    queryFn: () => transfersService.getTransferById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para adicionar nota
  const addNoteMutation = useMutation({
    mutationFn: (note: string) => transfersService.addTransferNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-details', id] });
      toast.success('Nota adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar nota');
    }
  });

  // Mutation para atualizar status de transporte
  const updateTransportStatusMutation = useMutation({
    mutationFn: (status: string) => transfersService.updateTransportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-details', id] });
      toast.success('Status de transporte atualizado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar status de transporte');
    }
  });

  return {
    transfer: transfer || null,
    isLoading,
    error: error?.message || null,
    refetch,
    addNote: addNoteMutation.mutateAsync,
    updateTransportStatus: updateTransportStatusMutation.mutateAsync,
    isAddingNote: addNoteMutation.isPending,
    isUpdatingTransportStatus: updateTransportStatusMutation.isPending
  };
}

// Hook para estatísticas de transferências
export function useTransferStats(filters?: TransferFilters) {
  return useQuery({
    queryKey: ['transfer-stats', filters],
    queryFn: () => transfersService.getTransferStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para disponibilidade de leitos
export function useBedAvailability(filters?: any) {
  return useQuery({
    queryKey: ['bed-availability', filters],
    queryFn: () => transfersService.checkBedAvailability(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });
}

// Hook para reservar leito
export function useBedReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bedId, patientId, reservedUntil }: { bedId: string; patientId: string; reservedUntil: string }) => 
      transfersService.reserveBed(bedId, patientId, reservedUntil),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-availability'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Leito reservado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao reservar leito');
    }
  });
}

// Hook para cancelar reserva de leito
export function useBedReservationCancel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bedId: string) => transfersService.cancelBedReservation(bedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-availability'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Reserva cancelada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar reserva');
    }
  });
}

// Hook para equipamentos de transferência
export function useTransferEquipment(transferId: string) {
  const queryClient = useQueryClient();

  const {
    data: equipment = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transfer-equipment', transferId],
    queryFn: () => transfersService.getTransferEquipment(transferId),
    enabled: !!transferId,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para adicionar equipamento
  const addEquipmentMutation = useMutation({
    mutationFn: (equipment: any) => transfersService.addTransferEquipment(transferId, equipment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-equipment', transferId] });
      toast.success('Equipamento adicionado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar equipamento');
    }
  });

  // Mutation para remover equipamento
  const removeEquipmentMutation = useMutation({
    mutationFn: (equipmentId: string) => transfersService.removeTransferEquipment(transferId, equipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-equipment', transferId] });
      toast.success('Equipamento removido!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover equipamento');
    }
  });

  return {
    equipment,
    isLoading,
    error: error?.message || null,
    refetch,
    addEquipment: addEquipmentMutation.mutateAsync,
    removeEquipment: removeEquipmentMutation.mutateAsync,
    isAddingEquipment: addEquipmentMutation.isPending,
    isRemovingEquipment: removeEquipmentMutation.isPending
  };
}

// Hook para histórico de transferências
export function useTransferHistory(patientId?: string, bedId?: string) {
  return useQuery({
    queryKey: ['transfer-history', patientId, bedId],
    queryFn: () => transfersService.getTransferHistory(patientId, bedId),
    enabled: !!(patientId || bedId),
    staleTime: 10 * 60 * 1000,
  });
}

// Hook para validação de transferência
export function useTransferValidation() {
  return useMutation({
    mutationFn: (transferId: string) => transfersService.validateTransfer(transferId),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao validar transferência');
    }
  });
}

// Hook para verificar conflitos de transferência
export function useTransferConflicts() {
  return useMutation({
    mutationFn: (transferData: any) => transfersService.checkTransferConflicts(transferData),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao verificar conflitos');
    }
  });
}

// Hook para buscar transferências por paciente
export function usePatientTransfers(patientId: string) {
  return useQuery({
    queryKey: ['patient-transfers', patientId],
    queryFn: () => transfersService.getTransfersByPatient(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar transferências por departamento
export function useDepartmentTransfers(departmentId: string) {
  return useQuery({
    queryKey: ['department-transfers', departmentId],
    queryFn: () => transfersService.getTransfersByDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para opções de transporte
export function useTransportOptions() {
  return useQuery({
    queryKey: ['transport-options'],
    queryFn: () => transfersService.getTransportOptions(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para estimativa de custo de transferência
export function useTransferCostEstimate() {
  return useMutation({
    mutationFn: (transferData: any) => transfersService.estimateTransferCost(transferData),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao estimar custo');
    }
  });
}

// Hook para templates de transferência
export function useTransferTemplates() {
  return useQuery({
    queryKey: ['transfer-templates'],
    queryFn: () => transfersService.getTransferTemplates(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}