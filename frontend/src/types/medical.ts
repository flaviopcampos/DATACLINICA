// Tipos para especialidades médicas e tipos de consulta

// Especialidades médicas disponíveis
export interface MedicalSpecialty {
  id: string;
  name: string;
  description?: string;
  code?: string; // Código da especialidade (ex: CFM)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalSpecialtyCreate extends Omit<MedicalSpecialty, 'id' | 'created_at' | 'updated_at'> {}

export interface MedicalSpecialtyUpdate extends Partial<MedicalSpecialtyCreate> {
  id: string;
}

// Lista padrão de especialidades médicas brasileiras
export const DEFAULT_MEDICAL_SPECIALTIES = [
  { code: '001', name: 'Clínica Médica', description: 'Medicina interna geral' },
  { code: '002', name: 'Cardiologia', description: 'Doenças do coração e sistema cardiovascular' },
  { code: '003', name: 'Dermatologia', description: 'Doenças da pele, cabelos e unhas' },
  { code: '004', name: 'Endocrinologia', description: 'Distúrbios hormonais e metabólicos' },
  { code: '005', name: 'Gastroenterologia', description: 'Doenças do sistema digestivo' },
  { code: '006', name: 'Ginecologia', description: 'Saúde reprodutiva feminina' },
  { code: '007', name: 'Neurologia', description: 'Doenças do sistema nervoso' },
  { code: '008', name: 'Oftalmologia', description: 'Doenças dos olhos e visão' },
  { code: '009', name: 'Ortopedia', description: 'Doenças do sistema musculoesquelético' },
  { code: '010', name: 'Otorrinolaringologia', description: 'Doenças do ouvido, nariz e garganta' },
  { code: '011', name: 'Pediatria', description: 'Medicina infantil' },
  { code: '012', name: 'Pneumologia', description: 'Doenças do sistema respiratório' },
  { code: '013', name: 'Psiquiatria', description: 'Transtornos mentais e comportamentais' },
  { code: '014', name: 'Urologia', description: 'Doenças do sistema urinário e reprodutor masculino' },
  { code: '015', name: 'Anestesiologia', description: 'Anestesia e cuidados perioperatórios' },
  { code: '016', name: 'Cirurgia Geral', description: 'Procedimentos cirúrgicos gerais' },
  { code: '017', name: 'Medicina de Família', description: 'Cuidados primários de saúde' },
  { code: '018', name: 'Geriatria', description: 'Medicina do idoso' },
  { code: '019', name: 'Oncologia', description: 'Tratamento de câncer' },
  { code: '020', name: 'Radiologia', description: 'Diagnóstico por imagem' }
] as const;

// Tipos de consulta
export interface ConsultationType {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  price?: number;
  color: string; // cor para exibição no calendário
  icon?: string; // ícone para exibição
  requires_preparation?: boolean;
  preparation_instructions?: string;
  is_telemedicine_compatible: boolean;
  is_active: boolean;
  specialty_id?: string; // relacionado a uma especialidade específica
  created_at: string;
  updated_at: string;
}

export interface ConsultationTypeCreate extends Omit<ConsultationType, 'id' | 'created_at' | 'updated_at'> {}

export interface ConsultationTypeUpdate extends Partial<ConsultationTypeCreate> {
  id: string;
}

// Tipos de consulta padrão
export const DEFAULT_CONSULTATION_TYPES = [
  {
    name: 'Consulta Inicial',
    description: 'Primeira consulta com o paciente',
    duration: 60,
    color: '#3B82F6',
    icon: 'user-plus',
    requires_preparation: false,
    is_telemedicine_compatible: true
  },
  {
    name: 'Consulta de Retorno',
    description: 'Consulta de acompanhamento',
    duration: 30,
    color: '#10B981',
    icon: 'repeat',
    requires_preparation: false,
    is_telemedicine_compatible: true
  },
  {
    name: 'Consulta de Urgência',
    description: 'Atendimento de urgência',
    duration: 45,
    color: '#EF4444',
    icon: 'alert-triangle',
    requires_preparation: false,
    is_telemedicine_compatible: false
  },
  {
    name: 'Procedimento',
    description: 'Realização de procedimento médico',
    duration: 90,
    color: '#8B5CF6',
    icon: 'activity',
    requires_preparation: true,
    preparation_instructions: 'Jejum de 8 horas se necessário',
    is_telemedicine_compatible: false
  },
  {
    name: 'Exame',
    description: 'Realização de exame médico',
    duration: 30,
    color: '#F59E0B',
    icon: 'search',
    requires_preparation: true,
    is_telemedicine_compatible: false
  },
  {
    name: 'Teleconsulta',
    description: 'Consulta por videoconferência',
    duration: 30,
    color: '#06B6D4',
    icon: 'video',
    requires_preparation: false,
    is_telemedicine_compatible: true
  },
  {
    name: 'Check-up',
    description: 'Avaliação médica preventiva',
    duration: 45,
    color: '#84CC16',
    icon: 'heart',
    requires_preparation: true,
    preparation_instructions: 'Trazer exames recentes',
    is_telemedicine_compatible: false
  }
] as const;

// Filtros para especialidades
export interface SpecialtyFilters {
  search?: string;
  is_active?: boolean;
  code?: string;
}

// Filtros para tipos de consulta
export interface ConsultationTypeFilters {
  search?: string;
  is_active?: boolean;
  specialty_id?: string;
  is_telemedicine_compatible?: boolean;
  min_duration?: number;
  max_duration?: number;
}

// Resposta da API para especialidades
export interface SpecialtiesResponse {
  specialties: MedicalSpecialty[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Resposta da API para tipos de consulta
export interface ConsultationTypesResponse {
  consultation_types: ConsultationType[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Configurações de especialidade para médico
export interface DoctorSpecialtyConfig {
  doctor_id: string;
  specialty_id: string;
  is_primary: boolean; // especialidade principal
  consultation_types: string[]; // tipos de consulta que o médico oferece nesta especialidade
  working_hours?: {
    [key: string]: { // dia da semana
      start: string;
      end: string;
      break_start?: string;
      break_end?: string;
    };
  };
  price_override?: { // preços específicos para este médico
    [consultation_type_id: string]: number;
  };
}

// Estatísticas de especialidades
export interface SpecialtyStats {
  specialty_id: string;
  specialty_name: string;
  total_doctors: number;
  active_doctors: number;
  total_appointments: number;
  appointments_this_month: number;
  average_consultation_duration: number;
  most_common_consultation_type: string;
  revenue_this_month: number;
}

// Configurações globais de tipos de consulta
export interface ConsultationTypeSettings {
  allow_custom_duration: boolean;
  require_specialty_match: boolean; // tipo de consulta deve ser compatível com especialidade do médico
  auto_assign_price: boolean; // atribuir preço automaticamente baseado no tipo
  enable_preparation_reminders: boolean;
  default_reminder_time: number; // horas antes da consulta
}

// ============================================================================
// SCHEDULE BLOCKS TYPES
// ============================================================================

export interface ScheduleBlock {
  id: string;
  doctor_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string; // Para bloqueios em horários específicos
  end_time?: string;
  block_type: 'vacation' | 'sick_leave' | 'training' | 'meeting' | 'maintenance' | 'personal' | 'other';
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_end_date?: string;
  recurrence_days?: number[]; // Para recorrência semanal (0-6)
  is_all_day: boolean;
  affects_availability: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ScheduleBlockCreate extends Omit<ScheduleBlock, 'id' | 'created_at' | 'updated_at'> {}

export interface ScheduleBlockUpdate extends Partial<ScheduleBlockCreate> {
  id: string;
}

export interface ScheduleBlockFilters {
  doctor_id?: string;
  block_type?: ScheduleBlock['block_type'][];
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  affects_availability?: boolean;
  search?: string;
}

export interface ScheduleBlocksResponse {
  data: ScheduleBlock[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ScheduleBlockStats {
  total_blocks: number;
  active_blocks: number;
  by_type: Record<ScheduleBlock['block_type'], number>;
  upcoming_blocks: number;
  current_blocks: number;
  total_blocked_hours: number;
}

export interface ScheduleBlockConflict {
  type: 'appointment_overlap' | 'block_overlap' | 'availability_conflict';
  message: string;
  conflicting_item?: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
  };
  suggested_alternatives?: {
    start_date: string;
    end_date: string;
    reason: string;
  }[];
}

export interface ScheduleBlockValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: ScheduleBlockConflict[];
}

// Tipos para templates de bloqueios
export interface ScheduleBlockTemplate {
  id: string;
  name: string;
  description?: string;
  block_type: ScheduleBlock['block_type'];
  default_duration_hours: number;
  is_all_day: boolean;
  affects_availability: boolean;
  recurrence_type?: ScheduleBlock['recurrence_type'];
  is_active: boolean;
  created_at: string;
}

export interface ScheduleBlockTemplateCreate extends Omit<ScheduleBlockTemplate, 'id' | 'created_at'> {}

export interface ScheduleBlockTemplateUpdate extends Partial<ScheduleBlockTemplateCreate> {
  id: string;
}

export type SpecialtyCode = typeof DEFAULT_MEDICAL_SPECIALTIES[number]['code'];
export type ConsultationTypeName = typeof DEFAULT_CONSULTATION_TYPES[number]['name'];