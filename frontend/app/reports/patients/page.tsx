import { Suspense } from 'react'
import PatientReports from '@/src/pages/PatientReports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Relatórios de Pacientes - DataClínica',
  description: 'Relatórios de histórico, estatísticas e análises de pacientes',
}

export default function PatientReportsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PatientReports />
    </Suspense>
  )
}