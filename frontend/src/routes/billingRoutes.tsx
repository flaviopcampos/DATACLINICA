import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy loading dos componentes de faturamento
const Billing = lazy(() => import('../pages/Billing'));
const InvoicesList = lazy(() => import('../pages/InvoicesList'));
const CreateInvoice = lazy(() => import('../pages/CreateInvoice'));
const ViewInvoice = lazy(() => import('../pages/ViewInvoice'));
const EditInvoice = lazy(() => import('../pages/EditInvoice'));
const Payments = lazy(() => import('../pages/Payments'));
const AppointmentBillingPage = lazy(() => import('../pages/AppointmentBillingPage'));

export const billingRoutes: RouteObject[] = [
  {
    path: '/billing',
    element: <Billing />,
  },
  {
    path: '/billing/invoices',
    element: <InvoicesList />,
  },
  {
    path: '/billing/invoices/create',
    element: <CreateInvoice />,
  },
  {
    path: '/billing/invoices/:id',
    element: <ViewInvoice />,
  },
  {
    path: '/billing/invoices/:id/edit',
    element: <EditInvoice />,
  },
  {
    path: '/billing/payments',
    element: <Payments />,
  },
  {
    path: '/billing/appointments',
    element: <AppointmentBillingPage />,
  },
];