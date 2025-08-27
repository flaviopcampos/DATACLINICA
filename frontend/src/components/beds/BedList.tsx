'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Download,
  Plus,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Bed, BedStatus } from '@/types/beds';
import { BedCard } from './BedCard';
import { cn } from '@/lib/utils';

interface BedListProps {
  beds: Bed[];
  loading?: boolean;
  onBedSelect?: (bed: Bed) => void;
  onBedEdit?: (bed: Bed) => void;
  onCreateBed?: () => void;
  onRefresh?: () => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'number' | 'status' | 'type' | 'department' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

const statusOptions = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'available', label: 'Disponível' },
  { value: 'occupied', label: 'Ocupado' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'cleaning', label: 'Limpeza' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'blocked', label: 'Bloqueado' }
];

const typeOptions = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'standard', label: 'Padrão' },
  { value: 'icu', label: 'UTI' },
  { value: 'semi_icu', label: 'Semi-UTI' },
  { value: 'isolation', label: 'Isolamento' },
  { value: 'pediatric', label: 'Pediátrico' },
  { value: 'maternity', label: 'Maternidade' }
];

export function BedList({ 
  beds, 
  loading = false, 
  onBedSelect, 
  onBedEdit, 
  onCreateBed,
  onRefresh,
  className 
}: BedListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('number');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Obter departamentos únicos
  const departments = Array.from(new Set(beds.map(bed => bed.department?.name).filter(Boolean)));
  const departmentOptions = [
    { value: 'all', label: 'Todos os Departamentos' },
    ...departments.map(dept => ({ value: dept, label: dept }))
  ];

  // Filtrar e ordenar leitos
  const filteredAndSortedBeds = React.useMemo(() => {
    let filtered = beds.filter(bed => {
      const matchesSearch = 
        bed.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bed.room?.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bed.currentPatient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bed.currentPatient?.medicalRecord.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || bed.status === statusFilter;
      const matchesType = typeFilter === 'all' || bed.type === typeFilter;
      const matchesDepartment = departmentFilter === 'all' || bed.department?.name === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesDepartment;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'number':
          aValue = a.number;
          bValue = b.number;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'department':
          aValue = a.department?.name || '';
          bValue = b.department?.name || '';
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [beds, searchTerm, statusFilter, typeFilter, departmentFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDepartmentFilter('all');
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return beds.length;
    return beds.filter(bed => bed.status === status).length;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Cabeçalho com controles */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="text-xl font-semibold">Leitos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredAndSortedBeds.length} de {beds.length} leitos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              )}
              {onCreateBed && (
                <Button size="sm" onClick={onCreateBed}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Leito
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Filtros */}
        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar leitos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {getStatusCount(option.value)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Tipo */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Departamento */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Controles de ordenação e ações */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {sortField === 'number' && 'Número'}
                      {sortField === 'status' && 'Status'}
                      {sortField === 'type' && 'Tipo'}
                      {sortField === 'department' && 'Departamento'}
                      {sortField === 'updatedAt' && 'Atualização'}
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSort('number')}>
                      Número do Leito
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('status')}>
                      Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('type')}>
                      Tipo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('department')}>
                      Departamento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('updatedAt')}>
                      Última Atualização
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de leitos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedBeds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Nenhum leito encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {beds.length === 0 
                  ? 'Não há leitos cadastrados no sistema.'
                  : 'Nenhum leito corresponde aos filtros aplicados.'
                }
              </p>
              {beds.length === 0 && onCreateBed && (
                <Button onClick={onCreateBed}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Leito
                </Button>
              )}
              {beds.length > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
        )}>
          {filteredAndSortedBeds.map((bed) => (
            <BedCard
              key={bed.id}
              bed={bed}
              onSelect={onBedSelect}
              onEdit={onBedEdit}
              className={viewMode === 'list' ? 'w-full' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}