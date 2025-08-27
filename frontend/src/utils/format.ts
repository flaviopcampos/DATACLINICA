/**
 * Utilitários para formatação de dados
 */

/**
 * Formata bytes em uma string legível (KB, MB, GB, etc.)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formata duração em segundos para uma string legível
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days}d`;
}

/**
 * Formata um número como porcentagem
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata um número com separadores de milhares
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Formata uma data para exibição
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj);
    
    case 'long':
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    
    case 'time':
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(dateObj);
    
    default:
      return dateObj.toLocaleDateString('pt-BR');
  }
}

/**
 * Formata tempo relativo (ex: "há 2 horas")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `há ${diffInMonths} mês${diffInMonths > 1 ? 'es' : ''}`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `há ${diffInYears} ano${diffInYears > 1 ? 's' : ''}`;
}

/**
 * Trunca texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formata status para exibição
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pendente',
    'running': 'Em execução',
    'completed': 'Concluído',
    'failed': 'Falhou',
    'cancelled': 'Cancelado',
    'scheduled': 'Agendado',
    'active': 'Ativo',
    'inactive': 'Inativo',
    'paused': 'Pausado'
  };

  return statusMap[status] || status;
}

/**
 * Formata prioridade para exibição
 */
export function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'critical': 'Crítica'
  };

  return priorityMap[priority] || priority;
}

/**
 * Formata tipo de backup para exibição
 */
export function formatBackupType(type: string): string {
  const typeMap: Record<string, string> = {
    'full': 'Completo',
    'incremental': 'Incremental',
    'differential': 'Diferencial',
    'manual': 'Manual',
    'scheduled': 'Agendado'
  };

  return typeMap[type] || type;
}