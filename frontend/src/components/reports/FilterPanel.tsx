import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportFilters } from '../../types/reports';

interface FilterPanelProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  availableTypes?: Array<{ value: string; label: string }>;
  availableCategories?: Array<{ value: string; label: string }>;
  availableStatuses?: Array<{ value: string; label: string }>;
  className?: string;
}

const PRESET_RANGES = [
  {
    label: 'Hoje',
    getValue: () => ({
      startDate: new Date(),
      endDate: new Date()
    })
  },
  {
    label: 'Últimos 7 dias',
    getValue: () => ({
      startDate: subDays(new Date(), 6),
      endDate: new Date()
    })
  },
  {
    label: 'Últimos 30 dias',
    getValue: () => ({
      startDate: subDays(new Date(), 29),
      endDate: new Date()
    })
  },
  {
    label: 'Este mês',
    getValue: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    })
  },
  {
    label: 'Este ano',
    getValue: () => ({
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date())
    })
  }
];

const DEFAULT_TYPES = [
  { value: 'financial', label: 'Financeiro' },
  { value: 'operational', label: 'Operacional' },
  { value: 'patient', label: 'Pacientes' },
  { value: 'inventory', label: 'Estoque' },
  { value: 'hr', label: 'Recursos Humanos' }
];

const DEFAULT_CATEGORIES = [
  { value: 'revenue', label: 'Receitas' },
  { value: 'expenses', label: 'Despesas' },
  { value: 'billing', label: 'Faturamento' },
  { value: 'beds', label: 'Leitos' },
  { value: 'prescriptions', label: 'Prescrições' },
  { value: 'appointments', label: 'Consultas' }
];

const DEFAULT_STATUSES = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' }
];

function FilterPanel({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading = false,
  collapsed = false,
  onToggleCollapse,
  availableTypes = DEFAULT_TYPES,
  availableCategories = DEFAULT_CATEGORIES,
  availableStatuses = DEFAULT_STATUSES,
  className = ''
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof ReportFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const applyPresetRange = (preset: typeof PRESET_RANGES[0]) => {
    const range = preset.getValue();
    const newFilters = {
      ...localFilters,
      startDate: range.startDate,
      endDate: range.endDate
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: ReportFilters = {
      startDate: undefined,
      endDate: undefined,
      type: undefined,
      category: undefined,
      status: undefined,
      search: '',
      tags: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = localFilters.tags?.filter(tag => tag !== tagToRemove) || [];
    updateFilter('tags', newTags);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !localFilters.tags?.includes(tag.trim())) {
      const newTags = [...(localFilters.tags || []), tag.trim()];
      updateFilter('tags', newTags);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.startDate) count++;
    if (localFilters.endDate) count++;
    if (localFilters.type) count++;
    if (localFilters.category) count++;
    if (localFilters.status) count++;
    if (localFilters.search) count++;
    if (localFilters.tags && localFilters.tags.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (collapsed) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-base">Filtros</CardTitle>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {onToggleCollapse && (
              <Button size="sm" variant="ghost" onClick={onToggleCollapse}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-base">Filtros Avançados</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            {activeFiltersCount > 0 && (
              <Button size="sm" variant="ghost" onClick={clearAllFilters}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            {onToggleCollapse && (
              <Button size="sm" variant="ghost" onClick={onToggleCollapse}>
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca por texto */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Buscar relatórios..."
              value={localFilters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Período */}
        <div className="space-y-3">
          <Label>Período</Label>
          
          {/* Presets de período */}
          <div className="flex flex-wrap gap-2">
            {PRESET_RANGES.map((preset) => (
              <Button
                key={preset.label}
                size="sm"
                variant="outline"
                onClick={() => applyPresetRange(preset)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Seleção de datas customizada */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data inicial</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.startDate ? (
                      format(localFilters.startDate, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span className="text-gray-500">Selecionar</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.startDate}
                    onSelect={(date) => {
                      updateFilter('startDate', date);
                      setStartDateOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || (localFilters.endDate && date > localFilters.endDate)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Data final</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.endDate ? (
                      format(localFilters.endDate, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span className="text-gray-500">Selecionar</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.endDate}
                    onSelect={(date) => {
                      updateFilter('endDate', date);
                      setEndDateOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || (localFilters.startDate && date < localFilters.startDate)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Filtros por categoria */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={localFilters.type || ''}
              onValueChange={(value) => updateFilter('type', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {availableTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={localFilters.category || ''}
              onValueChange={(value) => updateFilter('category', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || ''}
              onValueChange={(value) => updateFilter('status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="space-y-2">
            <Input
              placeholder="Adicionar tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            {localFilters.tags && localFilters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {localFilters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={onApplyFilters} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Aplicando...' : 'Aplicar Filtros'}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={clearAllFilters}>
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FilterPanel;