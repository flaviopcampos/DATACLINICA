'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Filter, 
  Plus, 
  X, 
  Calendar, 
  Hash, 
  Type, 
  ToggleLeft,
  Search,
  RefreshCw,
  Download,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interfaces
interface DynamicFiltersProps {
  filters: FilterDefinition[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
  onSavePreset?: (name: string, filters: ActiveFilter[]) => void;
  presets?: FilterPreset[];
  isLoading?: boolean;
  className?: string;
}

interface FilterDefinition {
  id: string;
  name: string;
  type: FilterType;
  field: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  defaultValue?: any;
  required?: boolean;
  description?: string;
  category?: string;
}

interface FilterOption {
  value: string | number;
  label: string;
  description?: string;
  count?: number;
}

interface ActiveFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: ActiveFilter[];
  isDefault?: boolean;
  createdAt: Date;
}

type FilterType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'range' | 'daterange';
type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between' | 'in' | 'notIn';

// Dados mock
const mockFilters: FilterDefinition[] = [
  {
    id: 'department',
    name: 'Departamento',
    type: 'select',
    field: 'department',
    category: 'Organização',
    options: [
      { value: 'cardiology', label: 'Cardiologia', count: 45 },
      { value: 'neurology', label: 'Neurologia', count: 32 },
      { value: 'orthopedics', label: 'Ortopedia', count: 28 },
      { value: 'pediatrics', label: 'Pediatria', count: 56 },
    ]
  },
  {
    id: 'dateRange',
    name: 'Período',
    type: 'daterange',
    field: 'date',
    category: 'Temporal',
    required: true
  },
  {
    id: 'patientAge',
    name: 'Idade do Paciente',
    type: 'range',
    field: 'patient_age',
    category: 'Demografia',
    min: 0,
    max: 120
  },
  {
    id: 'status',
    name: 'Status',
    type: 'multiselect',
    field: 'status',
    category: 'Estado',
    options: [
      { value: 'active', label: 'Ativo', count: 120 },
      { value: 'pending', label: 'Pendente', count: 45 },
      { value: 'completed', label: 'Concluído', count: 89 },
      { value: 'cancelled', label: 'Cancelado', count: 12 },
    ]
  },
  {
    id: 'revenue',
    name: 'Receita',
    type: 'range',
    field: 'revenue',
    category: 'Financeiro',
    min: 0,
    max: 100000
  },
  {
    id: 'patientName',
    name: 'Nome do Paciente',
    type: 'text',
    field: 'patient_name',
    category: 'Identificação'
  },
  {
    id: 'isUrgent',
    name: 'Urgente',
    type: 'boolean',
    field: 'is_urgent',
    category: 'Prioridade'
  }
];

const mockPresets: FilterPreset[] = [
  {
    id: 'today',
    name: 'Hoje',
    description: 'Dados de hoje',
    filters: [{ id: 'dateRange', field: 'date', operator: 'equals', value: new Date() }],
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 'thisWeek',
    name: 'Esta Semana',
    description: 'Dados da semana atual',
    filters: [{ id: 'dateRange', field: 'date', operator: 'between', value: [new Date(), new Date()] }],
    createdAt: new Date()
  }
];

// Componentes auxiliares
function FilterInput({ filter, value, onChange }: {
  filter: FilterDefinition;
  value: any;
  onChange: (value: any) => void;
}) {
  switch (filter.type) {
    case 'text':
      return (
        <Input
          placeholder={`Filtrar por ${filter.name.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          placeholder={`Valor para ${filter.name.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || null)}
          min={filter.min}
          max={filter.max}
        />
      );

    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Selecione ${filter.name.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {filter.options?.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {option.count && (
                    <Badge variant="secondary" className="ml-2">
                      {option.count}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {filter.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${filter.id}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedValues, option.value]);
                  } else {
                    onChange(selectedValues.filter(v => v !== option.value));
                  }
                }}
              />
              <Label htmlFor={`${filter.id}-${option.value}`} className="flex items-center gap-2">
                {option.label}
                {option.count && (
                  <Badge variant="outline" className="text-xs">
                    {option.count}
                  </Badge>
                )}
              </Label>
            </div>
          ))}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={filter.id}
            checked={value || false}
            onCheckedChange={onChange}
          />
          <Label htmlFor={filter.id}>{filter.name}</Label>
        </div>
      );

    case 'range':
      const rangeValue = Array.isArray(value) ? value : [filter.min || 0, filter.max || 100];
      return (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{rangeValue[0]}</span>
            <span>{rangeValue[1]}</span>
          </div>
          <Slider
            value={rangeValue}
            onValueChange={onChange}
            min={filter.min || 0}
            max={filter.max || 100}
            step={1}
            className="w-full"
          />
        </div>
      );

    case 'date':
      return (
        <DatePicker
          date={value}
          onDateChange={onChange}
          placeholder={`Selecione ${filter.name.toLowerCase()}`}
        />
      );

    case 'daterange':
      const dateRange = Array.isArray(value) ? value : [null, null];
      return (
        <div className="flex gap-2">
          <DatePicker
            date={dateRange[0]}
            onDateChange={(date) => onChange([date, dateRange[1]])}
            placeholder="Data inicial"
          />
          <DatePicker
            date={dateRange[1]}
            onDateChange={(date) => onChange([dateRange[0], date])}
            placeholder="Data final"
          />
        </div>
      );

    default:
      return null;
  }
}

function FilterIcon({ type }: { type: FilterType }) {
  switch (type) {
    case 'text':
      return <Type className="w-4 h-4" />;
    case 'number':
    case 'range':
      return <Hash className="w-4 h-4" />;
    case 'date':
    case 'daterange':
      return <Calendar className="w-4 h-4" />;
    case 'boolean':
      return <ToggleLeft className="w-4 h-4" />;
    default:
      return <Filter className="w-4 h-4" />;
  }
}

// Componente principal
export default function DynamicFilters({
  filters = mockFilters,
  activeFilters = [],
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  onSavePreset,
  presets = mockPresets,
  isLoading = false,
  className
}: DynamicFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [presetName, setPresetName] = useState('');
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  // Agrupar filtros por categoria
  const categories = Array.from(new Set(filters.map(f => f.category || 'Outros')));
  const filteredFilters = filters.filter(filter => {
    const matchesSearch = filter.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || filter.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateFilter = useCallback((filterId: string, value: any) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    const existingIndex = activeFilters.findIndex(af => af.id === filterId);
    const newActiveFilters = [...activeFilters];

    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      // Remove filter
      if (existingIndex >= 0) {
        newActiveFilters.splice(existingIndex, 1);
      }
    } else {
      // Add or update filter
      const activeFilter: ActiveFilter = {
        id: filterId,
        field: filter.field,
        operator: getDefaultOperator(filter.type),
        value,
        label: filter.name
      };

      if (existingIndex >= 0) {
        newActiveFilters[existingIndex] = activeFilter;
      } else {
        newActiveFilters.push(activeFilter);
      }
    }

    onFiltersChange(newActiveFilters);
  }, [filters, activeFilters, onFiltersChange]);

  const getDefaultOperator = (type: FilterType): FilterOperator => {
    switch (type) {
      case 'text':
        return 'contains';
      case 'number':
        return 'equals';
      case 'select':
        return 'equals';
      case 'multiselect':
        return 'in';
      case 'boolean':
        return 'equals';
      case 'range':
      case 'daterange':
        return 'between';
      case 'date':
        return 'equals';
      default:
        return 'equals';
    }
  };

  const getFilterValue = (filterId: string) => {
    const activeFilter = activeFilters.find(af => af.id === filterId);
    return activeFilter?.value;
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters);
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), activeFilters);
      setPresetName('');
      setShowPresetDialog(false);
    }
  };

  const handleReset = () => {
    onFiltersChange([]);
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
            {activeFilters.length > 0 && (
              <Badge variant="secondary">
                {activeFilters.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Presets */}
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => handleApplyPreset(preset)}
                className={cn(
                  preset.isDefault && 'border-blue-500 text-blue-600'
                )}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Controles de busca e categoria */}
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar filtros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Filtros ativos */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros Ativos:</Label>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter.id} variant="secondary" className="flex items-center gap-1">
                    {filter.label}: {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value?.toString()}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => updateFilter(filter.id, null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lista de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFilters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FilterIcon type={filter.type} />
                  {filter.name}
                  {filter.required && <span className="text-red-500">*</span>}
                </Label>
                <FilterInput
                  filter={filter}
                  value={getFilterValue(filter.id)}
                  onChange={(value) => updateFilter(filter.id, value)}
                />
                {filter.description && (
                  <p className="text-xs text-gray-500">{filter.description}</p>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={onApplyFilters} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>

            <div className="flex gap-2">
              {onSavePreset && activeFilters.length > 0 && (
                <Popover open={showPresetDialog} onOpenChange={setShowPresetDialog}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Salvar Preset
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <Label htmlFor="presetName">Nome do Preset</Label>
                      <Input
                        id="presetName"
                        placeholder="Digite o nome do preset"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSavePreset}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowPresetDialog(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Exportar tipos
export type {
  DynamicFiltersProps,
  FilterDefinition,
  FilterOption,
  ActiveFilter,
  FilterPreset,
  FilterType,
  FilterOperator
};