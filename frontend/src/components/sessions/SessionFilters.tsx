'use client';

import { useState, useEffect } from 'react';
import {
  Filter,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Shield,
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import type { DeviceType, SessionStatus, SecurityLevel } from '@/types/sessions';

export interface SessionFiltersState {
  search: string;
  deviceTypes: DeviceType[];
  statuses: SessionStatus[];
  securityLevels: SecurityLevel[];
  countries: string[];
  cities: string[];
  dateRange: 'today' | 'week' | 'month' | 'all';
  showCurrentSession: boolean;
  showSuspiciousOnly: boolean;
}

interface SessionFiltersProps {
  filters: SessionFiltersState;
  onFiltersChange: (filters: SessionFiltersState) => void;
  availableCountries?: string[];
  availableCities?: string[];
  className?: string;
  compact?: boolean;
}

const defaultFilters: SessionFiltersState = {
  search: '',
  deviceTypes: [],
  statuses: [],
  securityLevels: [],
  countries: [],
  cities: [],
  dateRange: 'all',
  showCurrentSession: true,
  showSuspiciousOnly: false
};

const deviceTypeOptions = [
  { value: DeviceType.DESKTOP, label: 'Desktop', icon: Monitor },
  { value: DeviceType.MOBILE, label: 'Mobile', icon: Smartphone },
  { value: DeviceType.TABLET, label: 'Tablet', icon: Tablet },
];

const statusOptions = [
  { value: SessionStatus.ACTIVE, label: 'Ativa', color: 'bg-green-100 text-green-800' },
  { value: SessionStatus.SUSPENDED, label: 'Suspensa', color: 'bg-yellow-100 text-yellow-800' },
  { value: SessionStatus.EXPIRED, label: 'Expirada', color: 'bg-red-100 text-red-800' },
  { value: SessionStatus.TERMINATED, label: 'Encerrada', color: 'bg-gray-100 text-gray-800' },
];

const securityLevelOptions = [
  { value: SecurityLevel.LOW, label: 'Baixo', color: 'bg-red-100 text-red-800' },
  { value: SecurityLevel.MEDIUM, label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
  { value: SecurityLevel.HIGH, label: 'Alto', color: 'bg-green-100 text-green-800' },
];

const dateRangeOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Última Semana' },
  { value: 'month', label: 'Último Mês' },
  { value: 'all', label: 'Todos os Períodos' },
];

export function SessionFilters({
  filters,
  onFiltersChange,
  availableCountries = [],
  availableCities = [],
  className = '',
  compact = false
}: SessionFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateFilters = (updates: Partial<SessionFiltersState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const toggleDeviceType = (deviceType: DeviceType) => {
    const newDeviceTypes = filters.deviceTypes.includes(deviceType)
      ? filters.deviceTypes.filter(type => type !== deviceType)
      : [...filters.deviceTypes, deviceType];
    updateFilters({ deviceTypes: newDeviceTypes });
  };

  const toggleStatus = (status: SessionStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    updateFilters({ statuses: newStatuses });
  };

  const toggleSecurityLevel = (level: SecurityLevel) => {
    const newLevels = filters.securityLevels.includes(level)
      ? filters.securityLevels.filter(l => l !== level)
      : [...filters.securityLevels, level];
    updateFilters({ securityLevels: newLevels });
  };

  const toggleCountry = (country: string) => {
    const newCountries = filters.countries.includes(country)
      ? filters.countries.filter(c => c !== country)
      : [...filters.countries, country];
    updateFilters({ countries: newCountries });
  };

  const toggleCity = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter(c => c !== city)
      : [...filters.cities, city];
    updateFilters({ cities: newCities });
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.deviceTypes.length > 0 ||
      filters.statuses.length > 0 ||
      filters.securityLevels.length > 0 ||
      filters.countries.length > 0 ||
      filters.cities.length > 0 ||
      filters.dateRange !== 'all' ||
      !filters.showCurrentSession ||
      filters.showSuspiciousOnly
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.deviceTypes.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.securityLevels.length > 0) count++;
    if (filters.countries.length > 0) count++;
    if (filters.cities.length > 0) count++;
    if (filters.dateRange !== 'all') count++;
    if (!filters.showCurrentSession) count++;
    if (filters.showSuspiciousOnly) count++;
    return count;
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar sessões..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Advanced Filters */}
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {getActiveFiltersCount() > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Filtros Avançados</h4>
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>

              {/* Quick filters */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-current"
                    checked={filters.showCurrentSession}
                    onCheckedChange={(checked) => 
                      updateFilters({ showCurrentSession: checked as boolean })
                    }
                  />
                  <label htmlFor="show-current" className="text-sm cursor-pointer">
                    Mostrar sessão atual
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="suspicious-only"
                    checked={filters.showSuspiciousOnly}
                    onCheckedChange={(checked) => 
                      updateFilters({ showSuspiciousOnly: checked as boolean })
                    }
                  />
                  <label htmlFor="suspicious-only" className="text-sm cursor-pointer">
                    Apenas atividades suspeitas
                  </label>
                </div>
              </div>

              <Separator />

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Período
                </label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => 
                    updateFilters({ dateRange: value as 'today' | 'week' | 'month' | 'all' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Device Types */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tipos de Dispositivo
                </label>
                <div className="flex flex-wrap gap-2">
                  {deviceTypeOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = filters.deviceTypes.includes(option.value);
                    return (
                      <Button
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDeviceType(option.value)}
                        className="text-xs"
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Status da Sessão
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(option => {
                    const isSelected = filters.statuses.includes(option.value);
                    return (
                      <Button
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleStatus(option.value)}
                        className="text-xs"
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Security Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Nível de Segurança
                </label>
                <div className="flex flex-wrap gap-2">
                  {securityLevelOptions.map(option => {
                    const isSelected = filters.securityLevels.includes(option.value);
                    return (
                      <Button
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSecurityLevel(option.value)}
                        className="text-xs"
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Countries */}
              {availableCountries.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Países
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {availableCountries.map(country => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox
                          id={`country-${country}`}
                          checked={filters.countries.includes(country)}
                          onCheckedChange={() => toggleCountry(country)}
                        />
                        <label 
                          htmlFor={`country-${country}`} 
                          className="text-sm cursor-pointer flex-1"
                        >
                          {country}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cities */}
              {availableCities.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Cidades
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {availableCities.map(city => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={`city-${city}`}
                          checked={filters.cities.includes(city)}
                          onCheckedChange={() => toggleCity(city)}
                        />
                        <label 
                          htmlFor={`city-${city}`} 
                          className="text-sm cursor-pointer flex-1"
                        >
                          {city}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear filters */}
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Full filters layout (non-compact)
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros de Sessão</span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFiltersCount()} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
                </Badge>
              )}
            </h3>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpar Todos
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por IP, dispositivo, localização..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Quick Options */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-current-full"
                checked={filters.showCurrentSession}
                onCheckedChange={(checked) => 
                  updateFilters({ showCurrentSession: checked as boolean })
                }
              />
              <label htmlFor="show-current-full" className="text-sm cursor-pointer">
                Mostrar sessão atual
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="suspicious-only-full"
                checked={filters.showSuspiciousOnly}
                onCheckedChange={(checked) => 
                  updateFilters({ showSuspiciousOnly: checked as boolean })
                }
              />
              <label htmlFor="suspicious-only-full" className="text-sm cursor-pointer">
                Apenas atividades suspeitas
              </label>
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Calendar className="h-4 w-4 inline mr-1" />
                Período
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => 
                  updateFilters({ dateRange: value as 'today' | 'week' | 'month' | 'all' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Device Types */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipos de Dispositivo
              </label>
              <div className="flex flex-wrap gap-1">
                {deviceTypeOptions.map(option => {
                  const Icon = option.icon;
                  const isSelected = filters.deviceTypes.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDeviceType(option.value)}
                      className="text-xs"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-1">
                {statusOptions.map(option => {
                  const isSelected = filters.statuses.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleStatus(option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Busca: "{filters.search}"
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilters({ search: '' })}
                  />
                </Badge>
              )}
              
              {filters.deviceTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {deviceTypeOptions.find(opt => opt.value === type)?.label}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleDeviceType(type)}
                  />
                </Badge>
              ))}
              
              {filters.statuses.map(status => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {statusOptions.find(opt => opt.value === status)?.label}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleStatus(status)}
                  />
                </Badge>
              ))}
              
              {filters.countries.map(country => (
                <Badge key={country} variant="secondary" className="text-xs">
                  {country}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleCountry(country)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SessionFilters;