import { Metadata } from 'next'
import { Suspense } from 'react'
import { BedsDashboard } from '@/src/components/beds/BedsDashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata: Metadata = {
  title: 'Leitos - DataClínica',
  description: 'Gestão de leitos e internações hospitalares'
}

function BedsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

export default function BedsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestão de Leitos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitore e gerencie todos os leitos da instituição
        </p>
      </div>
      
      <Suspense fallback={<BedsPageSkeleton />}>
        <BedsDashboard />
      </Suspense>
    </div>
  )
}