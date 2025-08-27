import { Suspense } from 'react'
import FinancialReports from '@/src/pages/FinancialReports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Relatórios Financeiros - DataClínica',
  description: 'Relatórios detalhados de receitas, despesas e faturamento',
}

export default function FinancialReportsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FinancialReports />
    </Suspense>
  )
}