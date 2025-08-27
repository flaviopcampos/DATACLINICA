import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bed, BedStatus, CreateBedForm, UpdateBedForm, BedFilters, UseBedsReturn, UseBedDetailsReturn } from '@/types/beds';
import { bedService } from '@/services/bedService';

// Hook principal para gestão de leitos
export function useBeds(filters?: BedFilters): UseBedsReturn {
  const queryClient = useQueryClient();

  // Query para listar leitos
  const {
    data: beds = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['beds', filters],
    queryFn: () => bedService.getBeds(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualizar a cada 10 minutos
  });

  // Mutation para criar leito
  const createBedMutation = useMutation({
    mutationFn: (data: CreateBedForm) => bedService.createBed(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Leito criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar leito');
    }
  });

  // Mutation para atualizar leito
  const updateBedMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBedForm }) => bedService.updateBed(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Leito atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar leito');
    }
  });

  // Mutation para atualizar status do leito
  const updateBedStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: BedStatus; reason?: string }) => 
      bedService.updateBedStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      toast.success('Status do leito atualizado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar status do leito');
    }
  });

  // Mutation para deletar leito
  const deleteBedMutation = useMutation({
    mutationFn: (id: string) => bedService.deleteBed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      toast.success('Leito excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir leito');
    }
  });

  return {
    beds,
    isLoading,
    error: error?.message || null,
    refetch,
    createBed: createBedMutation.mutateAsync,
    updateBed: updateBedMutation.mutateAsync,
    updateBedStatus: updateBedStatusMutation.mutateAsync,
    deleteBed: deleteBedMutation.mutateAsync,
    isCreating: createBedMutation.isPending,
    isUpdating: updateBedMutation.isPending,
    isUpdatingStatus: updateBedStatusMutation.isPending,
    isDeleting: deleteBedMutation.isPending
  };
}

// Hook para detalhes de um leito específico
export function useBedDetails(bedId: string): UseBedDetailsReturn {
  const queryClient = useQueryClient();

  const {
    data: bed,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bed', bedId],
    queryFn: () => bedService.getBed(bedId),
    enabled: !!bedId,
    staleTime: 2 * 60 * 1000,
  });

  // Query para histórico do leito
  const {
    data: history = [],
    isLoading: isLoadingHistory
  } = useQuery({
    queryKey: ['bed-history', bedId],
    queryFn: () => bedService.getBedHistory(bedId),
    enabled: !!bedId,
    staleTime: 5 * 60 * 1000,
  });

  // Query para estatísticas do leito
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['bed-stats', bedId],
    queryFn: () => bedService.getBedStats(bedId),
    enabled: !!bedId,
    staleTime: 10 * 60 * 1000,
  });

  return {
    bed: bed || null,
    history,
    stats: stats || null,
    isLoading: isLoading || isLoadingHistory || isLoadingStats,
    error: error?.message || null,
    refetch
  };
}

// Hook para leitos por departamento
export function useDepartmentBeds(departmentId: string) {
  return useQuery({
    queryKey: ['department-beds', departmentId],
    queryFn: () => bedService.getBedsByDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para leitos por sala
export function useRoomBeds(roomId: string) {
  return useQuery({
    queryKey: ['room-beds', roomId],
    queryFn: () => bedService.getBedsByRoom(roomId),
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para leitos por status
export function useBedsByStatus(status: BedStatus) {
  return useQuery({
    queryKey: ['beds-by-status', status],
    queryFn: () => bedService.getBedsByStatus(status),
    enabled: !!status,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook para leitos por tipo
export function useBedsByType(bedType: string) {
  return useQuery({
    queryKey: ['beds-by-type', bedType],
    queryFn: () => bedService.getBedsByType(bedType),
    enabled: !!bedType,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para estatísticas gerais de leitos
export function useBedsStats(filters?: any) {
  return useQuery({
    queryKey: ['beds-stats', filters],
    queryFn: () => bedService.getBedsStats(filters),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
}

// Hook para buscar leitos
export function useSearchBeds(searchTerm: string, filters?: any) {
  return useQuery({
    queryKey: ['search-beds', searchTerm, filters],
    queryFn: () => bedService.searchBeds(searchTerm, filters),
    enabled: searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para validar leito
export function useBedValidation() {
  return useMutation({
    mutationFn: (bedData: any) => bedService.validateBed(bedData),
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao validar leito');
    }
  });
}

// Hook para equipamentos do leito
export function useBedEquipment(bedId: string) {
  const queryClient = useQueryClient();

  const {
    data: equipment = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bed-equipment', bedId],
    queryFn: () => bedService.getBedEquipment(bedId),
    enabled: !!bedId,
    staleTime: 10 * 60 * 1000,
  });

  // Mutation para adicionar equipamento
  const addEquipmentMutation = useMutation({
    mutationFn: ({ bedId, equipmentId }: { bedId: string; equipmentId: string }) => 
      bedService.addBedEquipment(bedId, equipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-equipment', bedId] });
      toast.success('Equipamento adicionado ao leito!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar equipamento');
    }
  });

  // Mutation para remover equipamento
  const removeEquipmentMutation = useMutation({
    mutationFn: ({ bedId, equipmentId }: { bedId: string; equipmentId: string }) => 
      bedService.removeBedEquipment(bedId, equipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bed-equipment', bedId] });
      toast.success('Equipamento removido do leito!');
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

// Hook para manutenção de leitos
export function useBedMaintenance() {
  const queryClient = useQueryClient();

  // Mutation para iniciar manutenção
  const startMaintenanceMutation = useMutation({
    mutationFn: ({ bedId, reason, estimatedDuration }: { bedId: string; reason: string; estimatedDuration?: number }) => 
      bedService.startBedMaintenance(bedId, reason, estimatedDuration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      toast.success('Manutenção iniciada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao iniciar manutenção');
    }
  });

  // Mutation para finalizar manutenção
  const finishMaintenanceMutation = useMutation({
    mutationFn: ({ bedId, notes }: { bedId: string; notes?: string }) => 
      bedService.finishBedMaintenance(bedId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      toast.success('Manutenção finalizada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao finalizar manutenção');
    }
  });

  return {
    startMaintenance: startMaintenanceMutation.mutateAsync,
    finishMaintenance: finishMaintenanceMutation.mutateAsync,
    isStartingMaintenance: startMaintenanceMutation.isPending,
    isFinishingMaintenance: finishMaintenanceMutation.isPending
  };
}

// Hook para limpeza de leitos
export function useBedCleaning() {
  const queryClient = useQueryClient();

  // Mutation para iniciar limpeza
  const startCleaningMutation = useMutation({
    mutationFn: ({ bedId, cleaningType }: { bedId: string; cleaningType: string }) => 
      bedService.startBedCleaning(bedId, cleaningType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      toast.success('Limpeza iniciada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao iniciar limpeza');
    }
  });

  // Mutation para finalizar limpeza
  const finishCleaningMutation = useMutation({
    mutationFn: ({ bedId, notes }: { bedId: string; notes?: string }) => 
      bedService.finishBedCleaning(bedId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['bed-occupancy'] });
      toast.success('Limpeza finalizada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao finalizar limpeza');
    }
  });

  return {
    startCleaning: startCleaningMutation.mutateAsync,
    finishCleaning: finishCleaningMutation.mutateAsync,
    isStartingCleaning: startCleaningMutation.isPending,
    isFinishingCleaning: finishCleaningMutation.isPending
  };
}