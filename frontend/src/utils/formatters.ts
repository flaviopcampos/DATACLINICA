/**
 * Utilitários de formatação - Alias para format.ts
 * Este arquivo resolve problemas de importação mantendo compatibilidade
 */

// Re-exporta todas as funções do arquivo format.ts
export * from './format';

// Funções adicionais específicas para formatação de dados médicos/clínicos

/**
 * Formata valor monetário em Real brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

/**
 * Formata CEP
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return cep;
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata horário (HH:MM)
 */
export function formatTime(time: string | Date): string {
  if (time instanceof Date) {
    return time.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Se for string no formato HH:MM ou HH:MM:SS
  const timeParts = time.split(':');
  if (timeParts.length >= 2) {
    return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
  }
  
  return time;
}

/**
 * Formata data e hora para exibição em formulários
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Formata idade
 */
export function formatAge(birthDate: Date | string): string {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return `${age - 1} anos`;
  }
  
  return `${age} anos`;
}

/**
 * Formata status de consulta/agendamento
 */
export function formatAppointmentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'scheduled': 'Agendado',
    'confirmed': 'Confirmado',
    'in_progress': 'Em andamento',
    'completed': 'Concluído',
    'cancelled': 'Cancelado',
    'no_show': 'Faltou',
    'rescheduled': 'Reagendado'
  };
  
  return statusMap[status] || status;
}

/**
 * Formata tipo de consulta
 */
export function formatAppointmentType(type: string): string {
  const typeMap: Record<string, string> = {
    'consultation': 'Consulta',
    'followup': 'Retorno',
    'exam': 'Exame',
    'procedure': 'Procedimento',
    'emergency': 'Emergência',
    'routine': 'Rotina'
  };
  
  return typeMap[type] || type;
}