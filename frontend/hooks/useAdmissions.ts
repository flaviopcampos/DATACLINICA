import { useState, useEffect, useCallback } from 'react';
import { PatientAdmission, BedTransfer, CreateAdmissionData, DischargeData } from '@/types/beds';
import { admissionService, handleApiError } from '@/services/bedService';

interface AdmissionFilters {
  status?: string[];
  payment_type?: string[];
  admission_type?: string[];
  department_id?: string;
  date_from?: string;
  date_to?: string;
}

export function useAdmissions(filters?: AdmissionFilters) {
  const [admissions, setAdmissions] = useState<PatientAdmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await admissionService.getAdmissions();
      let filteredAdmissions = data;
      
      // Aplicar filtros
      if (filters?.status && filters.status.length > 0) {
        filteredAdmissions = filteredAdmissions.filter(admission => 
          filters.status!.includes(admission.status)
        );
      }
      
      if (filters?.payment_type && filters.payment_type.length > 0) {
        filteredAdmissions = filteredAdmissions.filter(admission => 
          filters.payment_type!.includes(admission.payment_type)
        );
      }
      
      if (filters?.admission_type && filters.admission_type.length > 0) {
        filteredAdmissions = filteredAdmissions.filter(admission => 
          filters.admission_type!.includes(admission.admission_type)
        );
      }
      
      if (filters?.department_id) {
        filteredAdmissions = filteredAdmissions.filter(admission => 
          admission.bed?.room?.department?.id === filters.department_id
        );
      }
      
      if (filters?.date_from) {
        filteredAdmissions = filteredAdmissions.filter(admission => 
          new Date(admission.admission_date) >= new Date(filters.date_from!)
        );
      }
      
      if (filters?.date_to) {
        filteredAdmissions = filteredAdmissions.filter(admission => 
          new Date(admission.admission_date) <= new Date(filters.date_to!)
        );
      }
      
      setAdmissions(filteredAdmissions);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Erro ao carregar internações:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Criar nova internação
  const createAdmission = async (data: CreateAdmissionData): Promise<PatientAdmission> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newAdmission = await admissionService.createAdmission(data);
      setAdmissions(prev => [...prev, newAdmission]);
      return newAdmission;
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Dar alta a um paciente
  const dischargePatient = async (admissionId: string, data: DischargeData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await admissionService.dischargePatient(admissionId, data);
      
      setAdmissions(prev => prev.map(admission => 
        admission.id === admissionId 
          ? {
              ...admission,
              status: 'DISCHARGED' as const,
              actual_discharge_date: data.discharge_date,
              discharge_reason: data.discharge_reason,
              total_days: data.total_days,
              total_amount: data.total_cost || admission.total_amount,
              updated_at: new Date().toISOString()
            }
          : admission
      ));
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Transferir paciente para outro leito
  const transferPatient = async (admissionId: string, newBedId: string, reason: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const transferData = await admissionService.transferPatient(admissionId, newBedId, reason);
      
      setAdmissions(prev => prev.map(admission => 
        admission.id === admissionId 
          ? {
              ...admission,
              bed_id: newBedId,
              updated_at: new Date().toISOString()
            }
          : admission
      ));
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = useCallback(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  return {
    admissions,
    isLoading,
    error,
    createAdmission,
    dischargePatient,
    transferPatient,
    refetch
  };
}