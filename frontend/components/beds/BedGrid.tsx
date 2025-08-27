import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Grid3X3,
  List,
  Search,
  Filter,
  RefreshCw,
  Users,
  Bed as BedIcon,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';
import { Bed, BedStatus, BedType, Department } from '@/types/beds';
import BedCard from './BedCard';

interface BedGridProps {
  beds: Bed[];
  departments: Department[];
  onStatusChange: (bedId: string, status: BedStatus) => void;
  onAssignPatient?: (bedId: string) => void;
  onViewHistory?: (bedId: string) => void;
  isLoading?: boolean;
  className?: string;
}

interface GridFilters {
  search: string;
  department: string;
  status: BedStatus | 'ALL';
  bedType: BedType | 'ALL';
  floor: string;
  showOccupiedOnly: boolean;
}

const statusOptions = [
  { value: 'ALL', label: 'Todos os Status' },
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'OCCUPIED', label: 'Ocupado' },
  { value: 'MAINTENANCE', label: 'Manutenção' },
  { value: 'BLOCKED', label: 'Bloqueado' },
  { value: 'CLEANING', label: 'Limpeza' }
];

const bedTypeOptions = [
  { value: 'ALL', label: 'Todos os Tipos' },
  { value: 'STANDARD', label: 'Padrão' },
  { value: 'ICU', label: 'UTI' },
  { value: 'SEMI_ICU', label: 'Semi-UTI' },
  { value: 'ISOLATION', label: 'Isolamento' }
];

export default function BedGrid({
  beds,
  departments,
  onStatusChange,
  onAssignPatient,
  onViewHistory,
  isLoading = false,
  className = ''
}: BedGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<GridFilters>({
    search: '',
    department: 'ALL',
    status: 'ALL',
    bedType: 'ALL',
    floor: 'ALL',
    showOccupiedOnly: false
  });

  // Extrair andares únicos dos leitos
  const floors = useMemo(() => {
    const uniqueFloors = [...new Set(beds.map(bed => bed.room.floor))].sort((a, b) => a - b);
    return uniqueFloors;
  }, [beds]);

  // Filtrar leitos
  const filteredBeds = useMemo(() => {
    return beds.filter(bed => {
      const matchesSearch = filters.search === '' || 
        bed.number.toLowerCase().includes(filters.search.toLowerCase()) ||
        bed.room.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        bed.room.department.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (bed.current_patient?.name.toLowerCase().includes(filters.search.toLowerCase()) ?? false);
      
      const matchesDepartment = filters.department === 'ALL' || bed.room.department.id === filters.department;
      const matchesStatus = filters.status === 'ALL' || bed.status === filters.status;
      const matchesBedType = filters.bedType === 'ALL' || bed.bed_type === filters.bedType;
      const matchesFloor = filters.floor === 'ALL' || bed.room.floor.toString() === filters.floor;
      const matchesOccupied = !filters.showOccupiedOnly || bed.status === 'OCCUPIED';
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesBedType && matchesFloor && matchesOccupied;
    });
  }, [beds, filters]);

  // Estatísticas dos leitos filtrados
  const stats = useMemo(() => {
    const total = filteredBeds.length;
    const available = filteredBeds.filter(bed => bed.status === 'AVAILABLE').length;
    const occupied = filteredBeds.filter(bed => bed.status === 'OCCUPIED').length;
    const maintenance = filteredBeds.filter(bed => bed.status === 'MAINTENANCE').length;
    const blocked = filteredBeds.filter(bed => bed.status === 'BLOCKED').length;
    const cleaning = filteredBeds.filter(bed => bed.status === 'CLEANING').length;
    
    return {
      total,
      available,
      occupied,
      maintenance,
      blocked,
      cleaning,
      occupancyRate: total > 0 ? (occupied / total) * 100 : 0
    };
  }, [filteredBeds]);

  const clearFilters = () => {
    setFilters({
      search: '',
      department: 'ALL',
      status: 'ALL',
      bedType: 'ALL',
      floor: 'ALL',
      showOccupiedOnly: false
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando leitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros
              </CardTitle>
              <CardDescription>
                Filtre os leitos por diferentes critérios
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Leito, quarto, paciente..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label>Departamento</Label>
              <Select 
                value={filters.department} 
                onValueChange={(value) => setFilters({ ...filters, department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Departamentos</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({ ...filters, status: value as BedStatus | 'ALL' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tipo de Leito</Label>
              <Select 
                value={filters.bedType} 
                onValueChange={(value) => setFilters({ ...filters, bedType: value as BedType | 'ALL' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bedTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Andar</Label>
              <Select 
                value={filters.floor} 
                onValueChange={(value) => setFilters({ ...filters, floor: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Andares</SelectItem>
                  {floors.map(floor => (
                    <SelectItem key={floor} value={floor.toString()}>
                      {floor}º Andar
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col justify-end space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, showOccupiedOnly: !filters.showOccupiedOnly })}
                className={filters.showOccupiedOnly ? 'bg-blue-50 border-blue-200' : ''}
              >
                {filters.showOccupiedOnly ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                Só Ocupados
              </Button>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BedIcon className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                <p className="text-xs text-muted-foreground">Disponível</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
                <p className="text-xs text-muted-foreground">Ocupado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.cleaning}</p>
                <p className="text-xs text-muted-foreground">Limpeza</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
                <p className="text-xs text-muted-foreground">Manutenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-500 mr-2" />
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.blocked}</p>
                <p className="text-xs text-muted-foreground">Bloqueado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.occupancyRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Ocupação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Leitos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BedIcon className="h-5 w-5 mr-2" />
                Leitos ({filteredBeds.length})
              </CardTitle>
              <CardDescription>
                {filters.search || filters.department !== 'ALL' || filters.status !== 'ALL' || 
                 filters.bedType !== 'ALL' || filters.floor !== 'ALL' || filters.showOccupiedOnly
                  ? 'Resultados filtrados'
                  : 'Todos os leitos disponíveis'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBeds.length === 0 ? (
            <div className="text-center py-12">
              <BedIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum leito encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não há leitos que correspondam aos filtros selecionados.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-4'
            }`}>
              {filteredBeds.map((bed) => (
                <BedCard
                  key={bed.id}
                  bed={bed}
                  onStatusChange={onStatusChange}
                  onAssignPatient={onAssignPatient}
                  onViewHistory={onViewHistory}
                  className={viewMode === 'list' ? 'max-w-none' : ''}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}