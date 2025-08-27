import { api } from './api';
import {
  Discharge,
  CreateDischargeForm,
  CreateDischargeMedicationForm,
  UpdateDischargeForm,
  DischargeSearchForm,
  DischargeFilters,
  DischargeStats,
  DischargeReport,
  DischargeValidation,
  DischargeChecklist,
  DischargeType,
  DischargeCondition,
  DischargeDestination,
  DischargeStatus,
  PaymentStatus,
  DischargeDocumentType,
  ApiResponse,
  PaginatedResponse
} from '../types/discharges';

// Serviço de Altas Hospitalares
export class DischargesService {
  private static baseUrl = '/discharges';

  // ============================================================================
  // CRUD BÁSICO DE ALTAS
  // ============================================================================

  static async getAll(filters?: DischargeFilters): Promise<PaginatedResponse<Discharge>> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  static async getById(id: string): Promise<ApiResponse<Discharge>> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async create(data: CreateDischargeForm): Promise<ApiResponse<Discharge>> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  static async update(id: string, data: UpdateDischargeForm): Promise<ApiResponse<Discharge>> {
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

  static async search(searchForm: DischargeSearchForm): Promise<PaginatedResponse<Discharge>> {
    const response = await api.post(`${this.baseUrl}/search`, searchForm);
    return response.data;
  }

  static async getByPatient(patientId: string): Promise<ApiResponse<Discharge[]>> {
    const response = await api.get(`${this.baseUrl}/patient/${patientId}`);
    return response.data;
  }

  static async getByAdmission(admissionId: string): Promise<ApiResponse<Discharge>> {
    const response = await api.get(`${this.baseUrl}/admission/${admissionId}`);
    return response.data;
  }

  static async getByDepartment(departmentId: string): Promise<ApiResponse<Discharge[]>> {
    const response = await api.get(`${this.baseUrl}/department/${departmentId}`);
    return response.data;
  }

  static async getByStatus(status: DischargeStatus): Promise<ApiResponse<Discharge[]>> {
    const response = await api.get(`${this.baseUrl}/status/${status}`);
    return response.data;
  }

  static async getPending(): Promise<ApiResponse<Discharge[]>> {
    const response = await api.get(`${this.baseUrl}/pending`);
    return response.data;
  }

  static async getCompleted(): Promise<ApiResponse<Discharge[]>> {
    const response = await api.get(`${this.baseUrl}/completed`);
    return response.data;
  }

  // ============================================================================
  // GESTÃO DE STATUS
  // ============================================================================

  static async updateStatus(
    id: string, 
    status: DischargeStatus, 
    notes?: string
  ): Promise<ApiResponse<Discharge>> {
    const response = await api.patch(`${this.baseUrl}/${id}/status`, {
      status,
      notes
    });
    return response.data;
  }

  static async approve(id: string, notes?: string): Promise<ApiResponse<Discharge>> {
    return this.updateStatus(id, 'APPROVED', notes);
  }

  static async reject(id: string, reason: string): Promise<ApiResponse<Discharge>> {
    const response = await api.patch(`${this.baseUrl}/${id}/reject`, { reason });
    return response.data;
  }

  static async complete(id: string, notes?: string): Promise<ApiResponse<Discharge>> {
    return this.updateStatus(id, 'COMPLETED', notes);
  }

  static async cancel(id: string, reason: string): Promise<ApiResponse<Discharge>> {
    const response = await api.patch(`${this.baseUrl}/${id}/cancel`, { reason });
    return response.data;
  }

  // ============================================================================
  // PROCESSO DE ALTA
  // ============================================================================

  static async initiateDischargePlanning(
    admissionId: string,
    data: {
      estimated_discharge_date: string;
      discharge_type: DischargeType;
      discharge_destination?: DischargeDestination;
      notes?: string;
    }
  ): Promise<ApiResponse<Discharge>> {
    const response = await api.post(`/admissions/${admissionId}/discharge-planning`, data);
    return response.data;
  }

  static async updateDischargePlanning(
    id: string,
    data: {
      estimated_discharge_date?: string;
      discharge_type?: DischargeType;
      discharge_destination?: DischargeDestination;
      medical_summary?: string;
      discharge_instructions?: string;
      follow_up_instructions?: string;
    }
  ): Promise<ApiResponse<Discharge>> {
    const response = await api.patch(`${this.baseUrl}/${id}/planning`, data);
    return response.data;
  }

  static async executeDischarge(
    id: string,
    data: {
      actual_discharge_date: string;
      discharge_condition: DischargeCondition;
      final_notes?: string;
    }
  ): Promise<ApiResponse<Discharge>> {
    const response = await api.patch(`${this.baseUrl}/${id}/execute`, data);
    return response.data;
  }

  // ============================================================================
  // MEDICAÇÕES DE ALTA
  // ============================================================================

  static async getDischargeMedications(dischargeId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`${this.baseUrl}/${dischargeId}/medications`);
    return response.data;
  }

  static async addDischargeMedication(
    dischargeId: string,
    medication: CreateDischargeMedicationForm
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/medications`, medication);
    return response.data;
  }

  static async updateDischargeMedication(
    dischargeId: string,
    medicationId: string,
    data: Partial<CreateDischargeMedicationForm>
  ): Promise<ApiResponse<any>> {
    const response = await api.put(`${this.baseUrl}/${dischargeId}/medications/${medicationId}`, data);
    return response.data;
  }

  static async removeDischargeMedication(
    dischargeId: string,
    medicationId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/${dischargeId}/medications/${medicationId}`);
    return response.data;
  }

  // ============================================================================
  // DIAGNÓSTICOS
  // ============================================================================

  static async getDischargeDiagnoses(dischargeId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`${this.baseUrl}/${dischargeId}/diagnoses`);
    return response.data;
  }

  static async addDischargeDiagnosis(
    dischargeId: string,
    diagnosis: {
      diagnosis_code: string;
      diagnosis_description: string;
      is_primary: boolean;
      notes?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/diagnoses`, diagnosis);
    return response.data;
  }

  static async updateDischargeDiagnosis(
    dischargeId: string,
    diagnosisId: string,
    data: {
      diagnosis_code?: string;
      diagnosis_description?: string;
      is_primary?: boolean;
      notes?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.put(`${this.baseUrl}/${dischargeId}/diagnoses/${diagnosisId}`, data);
    return response.data;
  }

  static async removeDischargeDiagnosis(
    dischargeId: string,
    diagnosisId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/${dischargeId}/diagnoses/${diagnosisId}`);
    return response.data;
  }

  // ============================================================================
  // PROCEDIMENTOS
  // ============================================================================

  static async getDischargeProcedures(dischargeId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`${this.baseUrl}/${dischargeId}/procedures`);
    return response.data;
  }

  static async addDischargeProcedure(
    dischargeId: string,
    procedure: {
      procedure_code: string;
      procedure_description: string;
      performed_date: string;
      performed_by?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/procedures`, procedure);
    return response.data;
  }

  // ============================================================================
  // DOCUMENTOS
  // ============================================================================

  static async getDischargeDocuments(dischargeId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`${this.baseUrl}/${dischargeId}/documents`);
    return response.data;
  }

  static async uploadDischargeDocument(
    dischargeId: string,
    file: File,
    documentType: DischargeDocumentType,
    description?: string
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post(`${this.baseUrl}/${dischargeId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  static async deleteDischargeDocument(
    dischargeId: string,
    documentId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/${dischargeId}/documents/${documentId}`);
    return response.data;
  }

  static async downloadDischargeDocument(
    dischargeId: string,
    documentId: string
  ): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/${dischargeId}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // ============================================================================
  // CHECKLIST DE ALTA
  // ============================================================================

  static async getDischargeChecklist(dischargeId: string): Promise<ApiResponse<DischargeChecklist>> {
    const response = await api.get(`${this.baseUrl}/${dischargeId}/checklist`);
    return response.data;
  }

  static async updateChecklistItem(
    dischargeId: string,
    itemId: string,
    data: {
      completed: boolean;
      completed_by?: string;
      completed_at?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<DischargeChecklist>> {
    const response = await api.patch(`${this.baseUrl}/${dischargeId}/checklist/${itemId}`, data);
    return response.data;
  }

  static async addChecklistItem(
    dischargeId: string,
    item: {
      description: string;
      category: string;
      required: boolean;
      order_index?: number;
    }
  ): Promise<ApiResponse<DischargeChecklist>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/checklist`, item);
    return response.data;
  }

  // ============================================================================
  // VALIDAÇÃO DE ALTA
  // ============================================================================

  static async validateDischarge(dischargeId: string): Promise<ApiResponse<DischargeValidation>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/validate`);
    return response.data;
  }

  static async validateDischargeData(data: CreateDischargeForm): Promise<ApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    const response = await api.post(`${this.baseUrl}/validate-data`, data);
    return response.data;
  }

  // ============================================================================
  // FATURAMENTO
  // ============================================================================

  static async getDischargeFinancialSummary(dischargeId: string): Promise<ApiResponse<{
    total_cost: number;
    insurance_coverage: number;
    patient_responsibility: number;
    payment_status: PaymentStatus;
    pending_amount: number;
    payment_history: any[];
  }>> {
    const response = await api.get(`${this.baseUrl}/${dischargeId}/financial-summary`);
    return response.data;
  }

  static async processDischargePayment(
    dischargeId: string,
    payment: {
      amount: number;
      payment_method: string;
      payment_date: string;
      reference?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/payments`, payment);
    return response.data;
  }

  // ============================================================================
  // ESTATÍSTICAS E RELATÓRIOS
  // ============================================================================

  static async getStats(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    discharge_type?: DischargeType;
  }): Promise<ApiResponse<DischargeStats>> {
    const response = await api.get(`${this.baseUrl}/stats`, { params: filters });
    return response.data;
  }

  static async generateReport(
    reportType: 'SUMMARY' | 'DETAILED' | 'FINANCIAL' | 'READMISSION',
    filters?: {
      start_date?: string;
      end_date?: string;
      department_id?: string;
      discharge_type?: DischargeType;
    }
  ): Promise<ApiResponse<DischargeReport>> {
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
  // NOTIFICAÇÕES E COMUNICAÇÃO
  // ============================================================================

  static async sendDischargeNotification(
    dischargeId: string,
    data: {
      recipient_type: 'PATIENT' | 'FAMILY' | 'DOCTOR' | 'INSURANCE';
      message?: string;
      notification_method: 'EMAIL' | 'SMS' | 'WHATSAPP';
    }
  ): Promise<ApiResponse<void>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/notifications`, data);
    return response.data;
  }

  static async generateDischargeSummary(dischargeId: string): Promise<ApiResponse<{
    summary_text: string;
    key_points: string[];
    recommendations: string[];
  }>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/generate-summary`);
    return response.data;
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  static async getDischargeTemplates(): Promise<ApiResponse<any[]>> {
    const response = await api.get(`${this.baseUrl}/templates`);
    return response.data;
  }

  static async applyDischargeTemplate(
    dischargeId: string,
    templateId: string
  ): Promise<ApiResponse<Discharge>> {
    const response = await api.post(`${this.baseUrl}/${dischargeId}/apply-template`, {
      template_id: templateId
    });
    return response.data;
  }

  static async getReadmissionRisk(patientId: string): Promise<ApiResponse<{
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    risk_factors: string[];
    recommendations: string[];
  }>> {
    const response = await api.get(`/patients/${patientId}/readmission-risk`);
    return response.data;
  }
}

export default DischargesService;