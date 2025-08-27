import { api } from './api';
import {
  Transfer,
  CreateTransferForm,
  UpdateTransferForm,
  TransferApprovalForm,
  TransferExecutionForm,
  TransferSearchForm,
  TransferFilters,
  TransferStats,
  TransferReport,
  TransferValidation,
  BedAvailability,
  TransferNotification,
  TransferType,
  UrgencyLevel,
  PatientCondition,
  TransportMethod,
  EscortType,
  TransferStatus,
  ApiResponse,
  PaginatedResponse
} from '../types/transfers';

// Serviço de Transferências de Pacientes
export class TransfersService {
  private static baseUrl = '/transfers';

  // ============================================================================
  // CRUD BÁSICO DE TRANSFERÊNCIAS
  // ============================================================================

  static async getAll(filters?: TransferFilters): Promise<PaginatedResponse<Transfer>> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  static async getById(id: string): Promise<ApiResponse<Transfer>> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async create(data: CreateTransferForm): Promise<ApiResponse<Transfer>> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  static async update(id: string, data: UpdateTransferForm): Promise<ApiResponse<Transfer>> {
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

  static async search(searchForm: TransferSearchForm): Promise<PaginatedResponse<Transfer>> {
    const response = await api.post(`${this.baseUrl}/search`, searchForm);
    return response.data;
  }

  static async getByPatient(patientId: string): Promise<ApiResponse<Transfer[]>> {
    const response = await api.get(`${this.baseUrl}/patient/${patientId}`);
    return response.data;
  }

  static async getBySourceBed(bedId: string): Promise<ApiResponse<Transfer[]>> {
    const response = await api.get(`${this.baseUrl}/source-bed/${bedId}`);
    return response.data;
  }

  static async getByDestinationBed(bedId: string): Promise<ApiResponse<Transfer[]>> {
    const response = await api.get(`${this.baseUrl}/destination-bed/${bedId}`);
    return response.data;
  }

  static async getByDepartment(departmentId: string): Promise<ApiResponse<Transfer[]>> {
    const response = await api.get(`${this.baseUrl}/department/${departmentId}`);
    return response.data;
  }

  static async getByStatus(status: TransferStatus): Promise<ApiResponse<Transfer[]>> {
    const response = await api.get(`${this.baseUrl}/status/${status}`);
    return response.data;
  }

  static async getPending(): Promise<ApiResponse<Transfer[]>> {
    const response = await api.get(`${this.baseUrl}/pending`);
    return response.data;
  }

  static async getUrgent(): Promise<ApiResponse<Transfer[]>> {
    const response = await api.get(`${this.baseUrl}/urgent`);
    return response.data;
  }

  static async getScheduled(): Promise<ApiResponse<Transfer[]>> {
    const response = await api.get(`${this.baseUrl}/scheduled`);
    return response.data;
  }

  // ============================================================================
  // GESTÃO DE STATUS
  // ============================================================================

  static async updateStatus(
    id: string, 
    status: TransferStatus, 
    notes?: string
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${id}/status`, {
      status,
      notes
    });
    return response.data;
  }

  static async requestTransfer(
    data: CreateTransferForm
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.post(`${this.baseUrl}/request`, data);
    return response.data;
  }

  static async approveTransfer(
    id: string, 
    approvalData: TransferApprovalForm
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${id}/approve`, approvalData);
    return response.data;
  }

  static async rejectTransfer(
    id: string, 
    reason: string, 
    notes?: string
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${id}/reject`, {
      reason,
      notes
    });
    return response.data;
  }

  static async scheduleTransfer(
    id: string, 
    scheduledDateTime: string, 
    notes?: string
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${id}/schedule`, {
      scheduled_date_time: scheduledDateTime,
      notes
    });
    return response.data;
  }

  static async startTransfer(
    id: string, 
    executionData: TransferExecutionForm
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${id}/start`, executionData);
    return response.data;
  }

  static async completeTransfer(
    id: string, 
    completionData: {
      actual_end_time: string;
      final_notes?: string;
      complications?: string;
      patient_condition_on_arrival: PatientCondition;
    }
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${id}/complete`, completionData);
    return response.data;
  }

  static async cancelTransfer(
    id: string, 
    reason: string, 
    notes?: string
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${id}/cancel`, {
      reason,
      notes
    });
    return response.data;
  }

  // ============================================================================
  // DISPONIBILIDADE DE LEITOS
  // ============================================================================

  static async checkBedAvailability(
    departmentId?: string,
    bedType?: string,
    urgencyLevel?: UrgencyLevel
  ): Promise<ApiResponse<BedAvailability[]>> {
    const response = await api.get(`${this.baseUrl}/bed-availability`, {
      params: {
        department_id: departmentId,
        bed_type: bedType,
        urgency_level: urgencyLevel
      }
    });
    return response.data;
  }

  static async reserveBedForTransfer(
    transferId: string,
    bedId: string,
    reservationDuration?: number
  ): Promise<ApiResponse<{
    reservation_id: string;
    expires_at: string;
  }>> {
    const response = await api.post(`${this.baseUrl}/${transferId}/reserve-bed`, {
      bed_id: bedId,
      reservation_duration: reservationDuration || 30 // minutos
    });
    return response.data;
  }

  static async cancelBedReservation(
    transferId: string,
    reservationId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/${transferId}/reservations/${reservationId}`);
    return response.data;
  }

  // ============================================================================
  // EQUIPAMENTOS E RECURSOS
  // ============================================================================

  static async getTransferEquipment(transferId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`${this.baseUrl}/${transferId}/equipment`);
    return response.data;
  }

  static async addTransferEquipment(
    transferId: string,
    equipment: {
      equipment_id: string;
      quantity: number;
      required: boolean;
      notes?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`${this.baseUrl}/${transferId}/equipment`, equipment);
    return response.data;
  }

  static async updateTransferEquipment(
    transferId: string,
    equipmentId: string,
    data: {
      quantity?: number;
      required?: boolean;
      notes?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.put(`${this.baseUrl}/${transferId}/equipment/${equipmentId}`, data);
    return response.data;
  }

  static async removeTransferEquipment(
    transferId: string,
    equipmentId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/${transferId}/equipment/${equipmentId}`);
    return response.data;
  }

  static async checkEquipmentAvailability(
    equipmentIds: string[],
    transferDateTime: string
  ): Promise<ApiResponse<{
    equipment_id: string;
    available: boolean;
    available_quantity: number;
    next_available_time?: string;
  }[]>> {
    const response = await api.post(`${this.baseUrl}/equipment-availability`, {
      equipment_ids: equipmentIds,
      transfer_date_time: transferDateTime
    });
    return response.data;
  }

  // ============================================================================
  // TRANSPORTE E LOGÍSTICA
  // ============================================================================

  static async getTransportOptions(
    sourceDepartmentId: string,
    destinationDepartmentId: string,
    patientCondition: PatientCondition,
    urgencyLevel: UrgencyLevel
  ): Promise<ApiResponse<{
    method: TransportMethod;
    estimated_duration: number;
    required_staff: string[];
    required_equipment: string[];
    cost_estimate?: number;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/transport-options`, {
      params: {
        source_department_id: sourceDepartmentId,
        destination_department_id: destinationDepartmentId,
        patient_condition: patientCondition,
        urgency_level: urgencyLevel
      }
    });
    return response.data;
  }

  static async assignTransportTeam(
    transferId: string,
    team: {
      primary_nurse_id: string;
      secondary_nurse_id?: string;
      doctor_id?: string;
      technician_id?: string;
      escort_type: EscortType;
    }
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${transferId}/assign-team`, team);
    return response.data;
  }

  static async updateTransportStatus(
    transferId: string,
    status: 'PREPARING' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED',
    location?: string,
    notes?: string
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.patch(`${this.baseUrl}/${transferId}/transport-status`, {
      transport_status: status,
      current_location: location,
      notes
    });
    return response.data;
  }

  // ============================================================================
  // HISTÓRICO E RASTREAMENTO
  // ============================================================================

  static async getTransferHistory(transferId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`${this.baseUrl}/${transferId}/history`);
    return response.data;
  }

  static async addTransferNote(
    transferId: string,
    note: {
      content: string;
      category: 'GENERAL' | 'MEDICAL' | 'LOGISTICS' | 'SAFETY';
      is_private: boolean;
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`${this.baseUrl}/${transferId}/notes`, note);
    return response.data;
  }

  static async getTransferTimeline(transferId: string): Promise<ApiResponse<{
    event_type: string;
    timestamp: string;
    description: string;
    user_name?: string;
    details?: any;
  }[]>> {
    const response = await api.get(`${this.baseUrl}/${transferId}/timeline`);
    return response.data;
  }

  // ============================================================================
  // VALIDAÇÃO E VERIFICAÇÕES
  // ============================================================================

  static async validateTransfer(transferData: CreateTransferForm): Promise<ApiResponse<TransferValidation>> {
    const response = await api.post(`${this.baseUrl}/validate`, transferData);
    return response.data;
  }

  static async checkTransferConflicts(
    patientId: string,
    proposedDateTime: string,
    destinationBedId: string
  ): Promise<ApiResponse<{
    has_conflicts: boolean;
    conflicts: {
      type: 'BED_OCCUPIED' | 'PATIENT_SCHEDULED' | 'EQUIPMENT_UNAVAILABLE' | 'STAFF_UNAVAILABLE';
      description: string;
      suggested_alternatives?: string[];
    }[];
  }>> {
    const response = await api.post(`${this.baseUrl}/check-conflicts`, {
      patient_id: patientId,
      proposed_date_time: proposedDateTime,
      destination_bed_id: destinationBedId
    });
    return response.data;
  }

  static async getTransferRequirements(
    patientId: string,
    sourceBedId: string,
    destinationBedId: string
  ): Promise<ApiResponse<{
    medical_clearance_required: boolean;
    special_equipment_needed: string[];
    escort_requirements: EscortType;
    estimated_duration: number;
    risk_factors: string[];
    precautions: string[];
  }>> {
    const response = await api.get(`${this.baseUrl}/requirements`, {
      params: {
        patient_id: patientId,
        source_bed_id: sourceBedId,
        destination_bed_id: destinationBedId
      }
    });
    return response.data;
  }

  // ============================================================================
  // NOTIFICAÇÕES
  // ============================================================================

  static async sendTransferNotification(
    transferId: string,
    notification: {
      recipient_type: 'DEPARTMENT' | 'DOCTOR' | 'NURSE' | 'FAMILY';
      recipient_id?: string;
      message?: string;
      notification_type: 'REQUEST' | 'APPROVAL' | 'SCHEDULE' | 'START' | 'COMPLETE' | 'CANCEL';
    }
  ): Promise<ApiResponse<void>> {
    const response = await api.post(`${this.baseUrl}/${transferId}/notifications`, notification);
    return response.data;
  }

  static async getTransferNotifications(
    transferId: string
  ): Promise<ApiResponse<TransferNotification[]>> {
    const response = await api.get(`${this.baseUrl}/${transferId}/notifications`);
    return response.data;
  }

  // ============================================================================
  // ESTATÍSTICAS E RELATÓRIOS
  // ============================================================================

  static async getStats(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
    transfer_type?: TransferType;
    urgency_level?: UrgencyLevel;
  }): Promise<ApiResponse<TransferStats>> {
    const response = await api.get(`${this.baseUrl}/stats`, { params: filters });
    return response.data;
  }

  static async generateReport(
    reportType: 'SUMMARY' | 'DETAILED' | 'PERFORMANCE' | 'EFFICIENCY',
    filters?: {
      start_date?: string;
      end_date?: string;
      department_id?: string;
      transfer_type?: TransferType;
    }
  ): Promise<ApiResponse<TransferReport>> {
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

  static async getTransferMetrics(filters?: {
    start_date?: string;
    end_date?: string;
    department_id?: string;
  }): Promise<ApiResponse<{
    average_transfer_time: number;
    success_rate: number;
    cancellation_rate: number;
    average_waiting_time: number;
    peak_transfer_hours: { hour: number; count: number }[];
    most_common_reasons: { reason: string; count: number }[];
    department_performance: {
      department_id: string;
      department_name: string;
      transfer_count: number;
      average_duration: number;
      success_rate: number;
    }[];
  }>> {
    const response = await api.get(`${this.baseUrl}/metrics`, { params: filters });
    return response.data;
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  static async getTransferTemplates(): Promise<ApiResponse<any[]>> {
    const response = await api.get(`${this.baseUrl}/templates`);
    return response.data;
  }

  static async applyTransferTemplate(
    transferId: string,
    templateId: string
  ): Promise<ApiResponse<Transfer>> {
    const response = await api.post(`${this.baseUrl}/${transferId}/apply-template`, {
      template_id: templateId
    });
    return response.data;
  }

  static async estimateTransferCost(
    transferData: {
      source_bed_id: string;
      destination_bed_id: string;
      transfer_type: TransferType;
      transport_method: TransportMethod;
      urgency_level: UrgencyLevel;
      required_equipment?: string[];
      escort_type: EscortType;
    }
  ): Promise<ApiResponse<{
    base_cost: number;
    equipment_cost: number;
    transport_cost: number;
    staff_cost: number;
    urgency_surcharge: number;
    total_estimated_cost: number;
    cost_breakdown: {
      item: string;
      cost: number;
      description: string;
    }[];
  }>> {
    const response = await api.post(`${this.baseUrl}/estimate-cost`, transferData);
    return response.data;
  }

  static async getBulkTransferStatus(
    transferIds: string[]
  ): Promise<ApiResponse<{
    transfer_id: string;
    status: TransferStatus;
    last_updated: string;
    current_step?: string;
  }[]>> {
    const response = await api.post(`${this.baseUrl}/bulk-status`, {
      transfer_ids: transferIds
    });
    return response.data;
  }
}

export default TransfersService;