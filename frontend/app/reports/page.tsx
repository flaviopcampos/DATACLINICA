import { Suspense } from 'react'
import Reports from '@/src/pages/Reports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Relatórios Avançados - DataClínica',
  description: 'Gerencie e visualize relatórios financeiros, operacionais e de pacientes',
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Reports />
    </Suspense>
  )
}