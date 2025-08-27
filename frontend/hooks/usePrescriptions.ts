import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { prescriptionService, prescriptionMedicationService } from '@/services/prescriptionService';
import type {
  Prescription,
  PrescriptionCreate,
  PrescriptionUpdate,
  PrescriptionFilters,
  PrescriptionMedication,
  PrescriptionMedicationCreate,
  PrescriptionMedicationUpdate
} from '@/types/prescription';

// Query keys
export const prescriptionKeys = {
  all: ['prescriptions'] as const,
  lists: () => [...prescriptionKeys.all, 'list'] as const,
  list: (filters: PrescriptionFilters) => [...prescriptionKeys.lists(), { filters }] as const,
  details: () => [...prescriptionKeys.all, 'detail'] as const,
  detail: (id: number) => [...prescriptionKeys.details(), id] as const,
  patient: (patientId: number) => [...prescriptionKeys.all, 'patient', patientId] as const,
  doctor: (doctorId: number) => [...prescriptionKeys.all, 'doctor', doctorId] as const,
  stats: (params?: any) => [...prescriptionKeys.all, 'stats', params] as const,
  medications: (prescriptionId: number) => [...prescriptionKeys.all, 'medications', prescriptionId] as const,
};

// Hook para listar prescrições
export function usePrescriptions(params?: {
  page?: number;
  per_page?: number;
  filters?: PrescriptionFilters;
}) {
  return useQuery({
    queryKey: prescriptionKeys.list(params?.filters || {}),
    queryFn: () => prescriptionService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obter prescrição por ID
export function usePrescription(id: number) {
  return useQuery({
    queryKey: prescriptionKeys.detail(id),
    queryFn: () => prescriptionService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para prescrições por paciente
export function usePrescriptionsByPatient(patientId: number, params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: prescriptionKeys.patient(patientId),
    queryFn: () => prescriptionService.getByPatient(patientId, params),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para prescrições por médico
export function usePrescriptionsByDoctor(doctorId: number, params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: prescriptionKeys.doctor(doctorId),
    queryFn: () => prescriptionService.getByDoctor(doctorId, params),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para estatísticas
export function usePrescriptionStats(params?: {
  date_from?: string;
  date_to?: string;
  doctor_id?: number;
}) {
  return useQuery({
    queryKey: prescriptionKeys.stats(params),
    queryFn: () => prescriptionService.getStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para medicamentos de uma prescrição
export function usePrescriptionMedications(prescriptionId: number) {
  return useQuery({
    queryKey: prescriptionKeys.medications(prescriptionId),
    queryFn: () => prescriptionMedicationService.getByPrescription(prescriptionId),
    enabled: !!prescriptionId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar medicamentos (autocomplete)
export function useMedicationSearch(query: string) {
  return useQuery({
    queryKey: ['medications', 'search', query],
    queryFn: () => prescriptionService.searchMedications(query),
    enabled: query.length >= 2,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Alias para compatibilidade
export const useSearchMedications = useMedicationSearch;

// Mutations

// Hook para criar prescrição
export function useCreatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PrescriptionCreate) => prescriptionService.create(data),
    onSuccess: (newPrescription) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.patient(newPrescription.patient_id) });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.doctor(newPrescription.doctor_id) });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.stats() });
      
      toast.success('Prescrição criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar prescrição');
    },
  });
}

// Hook para atualizar prescrição
export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PrescriptionUpdate }) => 
      prescriptionService.update(id, data),
    onSuccess: (updatedPrescription) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        prescriptionKeys.detail(updatedPrescription.id),
        updatedPrescription
      );
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.patient(updatedPrescription.patient_id) });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.doctor(updatedPrescription.doctor_id) });
      
      toast.success('Prescrição atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar prescrição');
    },
  });
}

// Hook para deletar prescrição
export function useDeletePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => prescriptionService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: prescriptionKeys.detail(deletedId) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.stats() });
      
      toast.success('Prescrição excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir prescrição');
    },
  });
}

// Hook para cancelar prescrição
export function useCancelPrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => 
      prescriptionService.cancel(id, reason),
    onSuccess: (cancelledPrescription) => {
      // Atualizar cache
      queryClient.setQueryData(
        prescriptionKeys.detail(cancelledPrescription.id),
        cancelledPrescription
      );
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.patient(cancelledPrescription.patient_id) });
      
      toast.success('Prescrição cancelada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar prescrição');
    },
  });
}

// Hook para renovar prescrição
export function useRenewPrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, validity_days }: { id: number; validity_days?: number }) => 
      prescriptionService.renew(id, validity_days),
    onSuccess: (renewedPrescription) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.patient(renewedPrescription.patient_id) });
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.doctor(renewedPrescription.doctor_id) });
      
      toast.success('Prescrição renovada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao renovar prescrição');
    },
  });
}

// Hook para gerar PDF
export function useGeneratePrescriptionPDF() {
  return useMutation({
    mutationFn: (id: number) => prescriptionService.generatePDF(id),
    onSuccess: (blob, id) => {
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescricao-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar PDF');
    },
  });
}

// Mutations para medicamentos

// Hook para adicionar medicamento
export function useAddPrescriptionMedication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PrescriptionMedicationCreate) => 
      prescriptionMedicationService.create(data),
    onSuccess: (newMedication) => {
      // Invalidar medicamentos da prescrição
      queryClient.invalidateQueries({ 
        queryKey: prescriptionKeys.medications(newMedication.prescription_id) 
      });
      
      // Invalidar detalhes da prescrição
      queryClient.invalidateQueries({ 
        queryKey: prescriptionKeys.detail(newMedication.prescription_id) 
      });
      
      toast.success('Medicamento adicionado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar medicamento');
    },
  });
}

// Hook para atualizar medicamento
export function useUpdatePrescriptionMedication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ prescriptionId, medicationId, data }: {
      prescriptionId: number;
      medicationId: number;
      data: PrescriptionMedicationUpdate;
    }) => prescriptionMedicationService.update(prescriptionId, medicationId, data),
    onSuccess: (updatedMedication) => {
      // Invalidar medicamentos da prescrição
      queryClient.invalidateQueries({ 
        queryKey: prescriptionKeys.medications(updatedMedication.prescription_id) 
      });
      
      toast.success('Medicamento atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar medicamento');
    },
  });
}

// Hook para remover medicamento
export function useDeletePrescriptionMedication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ prescriptionId, medicationId }: {
      prescriptionId: number;
      medicationId: number;
    }) => prescriptionMedicationService.delete(prescriptionId, medicationId),
    onSuccess: (_, { prescriptionId }) => {
      // Invalidar medicamentos da prescrição
      queryClient.invalidateQueries({ 
        queryKey: prescriptionKeys.medications(prescriptionId) 
      });
      
      toast.success('Medicamento removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover medicamento');
    },
  });
}

// Alias para compatibilidade
export const useRemovePrescriptionMedication = useDeletePrescriptionMedication;