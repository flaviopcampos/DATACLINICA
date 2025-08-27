import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'

// Lazy loading dos componentes de relatórios
const Reports = lazy(() => import('../pages/Reports'))
const FinancialReports = lazy(() => import('../pages/FinancialReports'))
const OperationalReports = lazy(() => import('../pages/OperationalReports'))
const PatientReports = lazy(() => import('../pages/PatientReports'))

export const reportRoutes: RouteObject[] = [
  {
    path: '/reports',
    element: <Reports />,
  },
  {
    path: '/reports/financial',
    element: <FinancialReports />,
  },
  {
    path: '/reports/operational',
    element: <OperationalReports />,
  },
  {
    path: '/reports/patients',
    element: <PatientReports />,
  },
]