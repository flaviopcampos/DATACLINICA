import { api } from './api';
import {
  Admission,
  Patient,
  AdmissionTransfer,
  AdmissionBilling,
  MedicalRecord,
  VitalSigns,
  AdmissionMedication,
  AdmissionProcedure,
  CreateAdmissionForm,
  UpdateAdmissionForm,
  AdmissionSearchForm,
  AdmissionFilters,
  AdmissionStats,
  AdmissionReport,
  AdmissionType,
  AdmissionStatus,
  PaymentType,
  AdmissionReportType,
  ApiResponse,
  PaginatedResponse
} from '../types/admissions';

// Serviço de Internações
export class AdmissionsService {
  private static baseUrl = '/admissions';

  // ============================================================================
  // CRUD BÁSICO DE INTERNAÇÕES
  // ============================================================================

  static async getAll(filters?: AdmissionFilters): Promise<PaginatedResponse<Admission>> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  static async getById(id: string): Promise<ApiResponse<Admission>> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async create(data: CreateAdmissionForm): Promise<ApiResponse<Admission>> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  static async update(id: string, data: UpdateAdmissionForm): Promise<ApiResponse<Admission>> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // ============================================================================
  // BUSCA E FILTROS
  // ============================================================================

  static async search(searchForm: AdmissionSearchForm): Promise<PaginatedResponse<Admission>> {
    const response = await api.post(`${this.baseUrl}/search`, searchForm);
    return response.data;
  }

  static async getByPatient(patientId: string): Promise<ApiResponse<Admission[]>> {
    const response = await api.get(`${this.baseUrl}/patient/${patientId}`);
    return response.data;
  }

  static async getByBed(bedId: string): Promise<ApiResponse<Admission[]>> {
    const response = await api.get(`${this.baseUrl}/bed/${bedId}`);
    return response.data;
  }

  static async getByDepartment(departmentId: string): Promise<ApiResponse<Admission[]>> {
    const response = await api.get(`${this.baseUrl}/department/${departmentId}`);
    return response.data;
  }

  static async getByStatus(status: AdmissionStatus): Promise<ApiResponse<Admission[]>> {
    const response = await api.get(`${this.baseUrl}/status/${status}`);
    return response.data;
  }

  static async getActive(): Promise<ApiResponse<Admission[]>> {
    const response = await api.get(`${this.baseUrl}/active`);
    return response.data;
  }

  // ============================================================================
  // GESTÃO DE STATUS
  // ============================================================================

  static async updateStatus(
    id: string, 
    status: AdmissionStatus, 
    notes?: string
  ): Promise<ApiResponse<Admission>> {
    const response = await api.patch(`${this.baseUrl}/${id}/status`, {
      status,
      notes
    });
    return response.data;
  }

  static async admit(id: string, notes?: string): Promise<ApiResponse<Admission>> {
    return this.updateStatus(id, 'ADMITTED', notes);
  }

  static async discharge(
    id: string, 
    data: {
      discharge_date: string;
      discharge_reason?: string;
      discharge_notes?: string;
      discharge_destination?: string;
    }
  ): Promise<ApiResponse<Admission>> {
    const response = await api.patch(`${this.baseUrl}/${id}/discharge`, data);
    return response.data;
  }

  static async cancel(id: string, reason?: string): Promise<ApiResponse<Admission>> {
    const response = await api.patch(`${this.baseUrl}/${id}/cancel`, { reason });
    return response.data;
  }

  // ============================================================================
  // TRANSFERÊNCIAS
  // ============================================================================

  static async getTransfers(admissionId: string): Promise<ApiResponse<AdmissionTransfer[]>> {
    const response = await api.get(`${this.baseUrl}/${admissionId}/transfers`);
    return response.data;
  }

  static async createTransfer(
    admissionId: string,
    data: {
      target_bed_id: string;
      transfer_reason: string;
      transfer_notes?: string;
      scheduled_date?: string;
    }
  ): Promise<ApiResponse<AdmissionTransfer>> {
    const response = await api.post(`${this.baseUrl}/${admissionId}/transfers`, data);
    return response.data;
  }

  static async approveTransfer(transferId: string, notes?: string): Promise<ApiResponse<AdmissionTransfer>> {
    const response = await api.patch(`/transfers/${transferId}/approve`, { notes });
    return response.data;
  }

  static async rejectTransfer(transferId: string, reason: string): Promise<ApiResponse<AdmissionTransfer>> {
    const response = await api.patch(`/transfers/${transferId}/reject`, { reason });
    return response.data;
  }

  static async executeTransfer(transferId: string, notes?: string): Promise<ApiResponse<AdmissionTransfer>> {
    const response = await api.patch(`/transfers/${transferId}/execute`, { notes });
    return response.data;
  }

  // ============================================================================
  // FATURAMENTO
  // ============================================================================

  static async getBilling(admissionId: string): Promise<ApiResponse<AdmissionBilling>> {
    const response = await api.get(`${this.baseUrl}/${admissionId}/billing`);
    return response.data;
  }

  static async updateBilling(
    admissionId: string, 
    data: Partial<AdmissionBilling>
  ): Promise<ApiResponse<AdmissionBilling>> {
    const response = await api.put(`${this.baseUrl}/${admissionId}/billing`, data);
    return response.data;
  }

  static async addBillingItem(
    admissionId: string,
    item: {
      description: string;
      quantity: number;
      unit_price: number;
      item_type: string;
      date?: string;
    }
  ): Promise<ApiResponse<AdmissionBilling>> {
    const response = await api.post(`${this.baseUrl}/${admissionId}/billing/items`, item);
    return response.data;
  }

  static async removeBillingItem(
    admissionId: string, 
    itemId: string
  ): Promise<ApiResponse<AdmissionBilling>> {
    const response = await api.delete(`${this.baseUrl}/${admissionId}/billing/items/${itemId}`);
    return response.data;
  }

  static async addPayment(
    admissionId: string,
    payment: {
      amount: number;
      payment_date: string;
      payment_method: string;
      reference?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<AdmissionBilling>> {
    const response = await api.post(`${this.baseUrl}/${admissionId}/billing/payments`, payment);
    return response.data;
  }

  // ============================================================================
  // PRONTUÁRIO MÉDICO
  // ============================================================================

  static async getMedicalRecords(admissionId: string): Promise<ApiResponse<MedicalRecord[]>> {
    const response = await api.get(`${this.baseUrl}/${admissionId}/medical-records`);
    return response.data;
  }

  static async addMedicalRecord(
    admissionId: string,
    record: {
      record_type: string;
      title: string;
      content: string;
      doctor_id?: string;
    }
  ): Promise<ApiResponse<MedicalRecord>> {
    const response = await api.post(`${this.baseUrl}/${admissionId}/medical-records`, record);
    return response.data;
  }

  static async updateMedicalRecord(
    recordId: string,
    data: Partial<MedicalRecord>
  ): Promise<ApiResponse<MedicalRecord>> {
    const response = await api.put(`/medical-records/${recordId}`, data);
    return response.data;
  }

  // ============================================================================
  // SINAIS VITAIS
  // ============================================================================

  static async getVitalSigns(admissionId: string): Promise<ApiResponse<VitalSigns[]>> {
    const response = await api.get(`${this.baseUrl}/${admissionId}/vital-signs`);
    return response.data;
  }

  static async addVitalSigns(
    admissionId: string,
    vitalSigns: {
      temperature?: number;
      blood_pressure_systolic?: number;
      blood_pressure_diastolic?: number;
      heart_rate?: number;
      respiratory_rate?: number;
      oxygen_saturation?: number;
      weight?: number;
      height?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<VitalSigns>> {
    const response = await api.post(`${this.baseUrl}/${admissionId}/vital-signs`, vitalSigns);
    return response.data;
  }

  // ============================================================================
  // MEDICAÇÕES
  // ============================================================================

  static async getMedications(admissionId: string): Promise<ApiResponse<AdmissionMedication[]>> {
    const response = await api.get(`${this.baseUrl}/${admissionId}/medications`);
    return response.data;
  }

  static async addMedication(
    admissionId: string,
    medication: {
      medication_name: string;
      dosage: string;
      frequency: string;
      route: string;
      start_date: string;
      end_date?: string;
      instructions?: string;
      prescribed_by?: string;
    }
  ): Promise<ApiResponse<AdmissionMedication>> {
    const response = await api.post(`${this.baseUrl}/${admissionId}/medications`, medication);
    return response.data;
  }

  static async updateMedicationStatus(
    medicationId: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<AdmissionMedication>> {
    const response = await api.patch(`/admission-medications/${medicationId}/status`, {
      status,
      notes
    });
    return response.data;
  }

  // ============================================================================
  // PROCEDIMENTOS
  // ============================================================================

  static async getProcedures(admissionId: string): Promise<ApiResponse<AdmissionProcedure[]>> {
    const response = await api.get(`${this.baseUrl}/${admissionId}/procedures`);
    return response.data;
  }

  static async addProcedure(
    admissionId: string,
    procedure: {
      procedure_name: string;
      procedure_code?: string;
      scheduled_date: string;
      estimated_duration?: number;
      doctor_id?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<AdmissionProcedure>> {
    const response = await api.post(`${this.baseUrl}/${admissionId}/procedures`, procedure);
    return response.data;
  }

  static async updateProcedureStatus(
    procedureId: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<AdmissionProcedure>> {
    const response = await api.patch(`/admission-procedures/${procedureId}/status`, {
      status,
      notes
    });
    return response.data;
  }

  // ============================================================================
  // ESTATÍSTICAS E RELATÓRIOS
  // ============================================================================

  static async getStats(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    admission_type?: AdmissionType;
  }): Promise<ApiResponse<AdmissionStats>> {
    const response = await api.get(`${this.baseUrl}/stats`, { params: filters });
    return response.data;
  }

  static async generateReport(
    reportType: AdmissionReportType,
    filters?: {
      start_date?: string;
      end_date?: string;
      department_id?: string;
      admission_type?: AdmissionType;
      payment_type?: PaymentType;
    }
  ): Promise<ApiResponse<AdmissionReport>> {
    const response = await api.post(`${this.baseUrl}/reports`, {
      report_type: reportType,
      filters
    });
    return response.data;
  }

  static async exportReport(
    reportId: string,
    format: 'PDF' | 'EXCEL' | 'CSV'
  ): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  static async validateAdmission(data: CreateAdmissionForm): Promise<ApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    const response = await api.post(`${this.baseUrl}/validate`, data);
    return response.data;
  }

  static async checkBedAvailability(
    bedId: string,
    startDate: string,
    endDate?: string
  ): Promise<ApiResponse<{
    available: boolean;
    conflicts: Admission[];
  }>> {
    const response = await api.get(`/beds/${bedId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }

  static async getAdmissionHistory(patientId: string): Promise<ApiResponse<Admission[]>> {
    const response = await api.get(`/patients/${patientId}/admission-history`);
    return response.data;
  }
}

export default AdmissionsService;