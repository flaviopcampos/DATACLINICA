'use client';

import { Suspense } from 'react';
import CreateAppointment from '@/src/pages/CreateAppointment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component para Suspense
function CreateAppointmentLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Steps indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            {i < 3 && <Skeleton className="h-0.5 w-16 mx-2" />}
          </div>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateAppointmentPage() {
  return (
    <Suspense fallback={<CreateAppointmentLoading />}>
      <CreateAppointment />
    </Suspense>
  );
}