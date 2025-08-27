'use client';

import { useState } from 'react';
import { Plus, Search, Filter, FileText, Calendar, User, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrescriptions, usePrescriptionStats } from '@/hooks/usePrescriptions';
import { PrescriptionFilters, PRESCRIPTION_STATUS, Prescription } from '@/types/prescription';
import { PrescriptionCard } from '@/components/prescriptions/PrescriptionCard';
import { PrescriptionFiltersDialog } from '@/components/prescriptions/PrescriptionFiltersDialog';
import { CreatePrescriptionDialog } from '@/components/prescriptions/CreatePrescriptionDialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';

export default function PrescriptionsPage() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [filters, setFilters] = useState<PrescriptionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Queries
  const { data: prescriptionsData, isLoading, error } = usePrescriptions({
    page,
    per_page: perPage,
    filters: {
      ...filters,
      search: searchQuery || undefined,
    },
  });

  const { data: stats } = usePrescriptionStats();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  const handleFiltersChange = (newFilters: PrescriptionFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery;

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Erro ao carregar prescrições: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescrições Médicas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie prescrições médicas digitais e controladas
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Prescrição
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_prescriptions}</div>
              <p className="text-xs text-muted-foreground">prescrições</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active_prescriptions}</div>
              <p className="text-xs text-muted-foreground">em vigor</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Controladas</CardTitle>
              <Stethoscope className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.controlled_prescriptions}</div>
              <p className="text-xs text-muted-foreground">especiais</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.prescriptions_this_month}</div>
              <p className="text-xs text-muted-foreground">novas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por paciente, médico, medicamento..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {Object.keys(filters).length + (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !prescriptionsData?.prescriptions?.length ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma prescrição encontrada"
          description={
            hasActiveFilters
              ? "Não há prescrições que correspondam aos filtros aplicados."
              : "Comece criando sua primeira prescrição médica."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Prescrição
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Results info */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Mostrando {((page - 1) * perPage) + 1} a{' '}
              {Math.min(page * perPage, prescriptionsData?.total || 0)} de{' '}
              {prescriptionsData?.total || 0} prescrições
            </span>
          </div>

          {/* Prescriptions list */}
          <div className="grid gap-4">
            {prescriptionsData?.prescriptions?.map((prescription: Prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
              />
            )) || []}
          </div>

          {/* Pagination */}
          {(prescriptionsData?.total_pages || 0) > 1 && (
            <Pagination
              currentPage={page}
              totalPages={prescriptionsData?.total_pages || 1}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* Dialogs */}
      <PrescriptionFiltersDialog
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <CreatePrescriptionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}