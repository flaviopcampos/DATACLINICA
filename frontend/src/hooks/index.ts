/**
 * Exportações dos Hooks - DataClínica
 * 
 * Este arquivo centraliza todas as exportações dos hooks personalizados
 * do sistema de gestão de sessões.
 */

export { default as useSessions } from './useSessions'
export { default as useSessionActivity } from './useSessionActivity'
export { default as useSecurity } from './useSecurity'
export { default as useIntegration } from './useIntegration'

// Re-exportar tipos relacionados aos hooks
export type {
  UseSessionsOptions,
  UseSessionActivityOptions
} from './useSessions'

export type {
  UseSecurityOptions
} from './useSecurity'

export type {
  UseIntegrationOptions
} from './useIntegration'