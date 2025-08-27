import { RouteObject } from 'react-router-dom'
import { reportRoutes } from './reportRoutes'
import { appointmentRoutes } from './appointmentRoutes'
import { billingRoutes } from './billingRoutes'

// Combina todas as rotas do sistema
export const routes: RouteObject[] = [
  ...reportRoutes,
  ...appointmentRoutes,
  ...billingRoutes,
  // Adicione outras rotas aqui conforme necessário
]

export { reportRoutes, appointmentRoutes, billingRoutes }