'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { PrescriptionFilters, PRESCRIPTION_STATUS, PRESCRIPTION_TYPES } from '@/types/prescription';
import { cn } from '@/lib/utils';

interface PrescriptionFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PrescriptionFilters;
  onFiltersChange: (filters: PrescriptionFilters) => void;
}

export function PrescriptionFiltersDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: PrescriptionFiltersDialogProps) {
  const [localFilters, setLocalFilters] = useState<PrescriptionFilters>(filters);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof PrescriptionFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onOpenChange(false);
  };

  const removeFilter = (key: keyof PrescriptionFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key as keyof PrescriptionFilters];
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtrar Prescrições</DialogTitle>
          <DialogDescription>
            Use os filtros abaixo para refinar sua busca por prescrições.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros Ativos</Label>
              <div className="flex flex-wrap gap-2">
                {localFilters.status && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {localFilters.status}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('status')}
                    />
                  </Badge>
                )}
                {localFilters.prescription_type && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Tipo: {localFilters.prescription_type}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('prescription_type')}
                    />
                  </Badge>
                )}
                {localFilters.is_controlled !== undefined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {localFilters.is_controlled ? 'Controlada' : 'Não Controlada'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('is_controlled')}
                    />
                  </Badge>
                )}
                {localFilters.date_from && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    De: {formatDateForDisplay(localFilters.date_from)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('date_from')}
                    />
                  </Badge>
                )}
                {localFilters.date_to && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Até: {formatDateForDisplay(localFilters.date_to)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('date_to')}
                    />
                  </Badge>
                )}
                {localFilters.patient_id && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Paciente ID: {localFilters.patient_id}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('patient_id')}
                    />
                  </Badge>
                )}
                {localFilters.doctor_id && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Médico ID: {localFilters.doctor_id}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('doctor_id')}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || ''}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value={PRESCRIPTION_STATUS.ACTIVE}>Ativa</SelectItem>
                <SelectItem value={PRESCRIPTION_STATUS.EXPIRED}>Expirada</SelectItem>
                <SelectItem value={PRESCRIPTION_STATUS.CANCELLED}>Cancelada</SelectItem>
                <SelectItem value={PRESCRIPTION_STATUS.DISPENSED}>Dispensada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prescription Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="prescription_type">Tipo de Prescrição</Label>
            <Select
              value={localFilters.prescription_type || ''}
              onValueChange={(value) => handleFilterChange('prescription_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value={PRESCRIPTION_TYPES.SIMPLE}>Simples</SelectItem>
                <SelectItem value={PRESCRIPTION_TYPES.CONTROLLED}>Controlada</SelectItem>
                <SelectItem value={PRESCRIPTION_TYPES.SPECIAL}>Especial</SelectItem>
                <SelectItem value={PRESCRIPTION_TYPES.DIGITAL}>Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Controlled Medication Filter */}
          <div className="space-y-2">
            <Label htmlFor="is_controlled">Medicamento Controlado</Label>
            <Select
              value={localFilters.is_controlled?.toString() || ''}
              onValueChange={(value) => 
                handleFilterChange('is_controlled', value === '' ? undefined : value === 'true')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="true">Apenas controlados</SelectItem>
                <SelectItem value="false">Apenas não controlados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.date_from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.date_from ? (
                      formatDateForDisplay(localFilters.date_from)
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.date_from ? new Date(localFilters.date_from) : undefined}
                    onSelect={(date) => {
                      handleFilterChange('date_from', date ? format(date, 'yyyy-MM-dd') : undefined);
                      setDateFromOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.date_to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.date_to ? (
                      formatDateForDisplay(localFilters.date_to)
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.date_to ? new Date(localFilters.date_to) : undefined}
                    onSelect={(date) => {
                      handleFilterChange('date_to', date ? format(date, 'yyyy-MM-dd') : undefined);
                      setDateToOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={handleApplyFilters}>
            Aplicar Filtros
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}