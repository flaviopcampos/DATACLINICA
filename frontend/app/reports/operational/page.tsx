import { Suspense } from 'react'
import OperationalReports from '@/src/pages/OperationalReports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Relatórios Operacionais - DataClínica',
  description: 'Relatórios de ocupação de leitos, prescrições e estoque',
}

export default function OperationalReportsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OperationalReports />
    </Suspense>
  )
}