import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'

// Lazy loading dos componentes de agendamentos
const Appointments = lazy(() => import('../pages/Appointments'))
const AppointmentsList = lazy(() => import('../pages/AppointmentsList'))
const CreateAppointment = lazy(() => import('../pages/CreateAppointment'))
const AppointmentDetails = lazy(() => import('../pages/AppointmentDetails'))
const EditAppointment = lazy(() => import('../pages/EditAppointment'))

export const appointmentRoutes: RouteObject[] = [
  {
    path: '/appointments',
    element: <Appointments />,
  },
  {
    path: '/appointments/list',
    element: <AppointmentsList />,
  },
  {
    path: '/appointments/create',
    element: <CreateAppointment />,
  },
  {
    path: '/appointments/:id',
    element: <AppointmentDetails />,
  },
  {
    path: '/appointments/:id/edit',
    element: <EditAppointment />,
  },
]