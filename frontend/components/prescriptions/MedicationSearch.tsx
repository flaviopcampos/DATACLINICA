'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchMedications } from '@/hooks/usePrescriptions';
import { useDebounce } from '@/hooks/useDebounce';
import type { MedicationFormData } from '@/types/prescription';

interface MedicationSearchResult {
  id: string;
  name: string;
  active_ingredient: string;
  concentration: string;
  pharmaceutical_form: string;
  manufacturer: string;
  is_controlled: boolean;
  generic_available: boolean;
}

interface MedicationSearchProps {
  onSelect: (medication: Partial<MedicationFormData>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MedicationSearch({ 
  onSelect, 
  placeholder = "Buscar medicamento...", 
  disabled = false,
  className = ""
}: MedicationSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    data: medications = [], 
    isLoading, 
    error 
  } = useSearchMedications(debouncedSearchTerm, {
    enabled: debouncedSearchTerm.length >= 2
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || medications.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < medications.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : medications.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < medications.length) {
          handleSelectMedication(medications[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectMedication = (medication: MedicationSearchResult) => {
    const medicationData: Partial<MedicationFormData> = {
      medication_name: medication.name,
      is_controlled: medication.is_controlled,
      generic_allowed: medication.generic_available,
      instructions: `${medication.active_ingredient} - ${medication.concentration} - ${medication.pharmaceutical_form}`,
    };
    
    onSelect(medicationData);
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {isLoading && searchTerm.length >= 2 && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Buscando medicamentos...</span>
              </div>
            )}

            {error && (
              <div className="p-4 text-center">
                <p className="text-sm text-red-600">Erro ao buscar medicamentos</p>
                <p className="text-xs text-gray-500 mt-1">Tente novamente</p>
              </div>
            )}

            {!isLoading && !error && searchTerm.length >= 2 && medications.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600">Nenhum medicamento encontrado</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tente buscar com termos diferentes
                </p>
              </div>
            )}

            {!isLoading && medications.length > 0 && (
              <div className="py-2">
                {medications.map((medication, index) => (
                  <div
                    key={medication.id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50 border-l-2 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectMedication(medication)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {medication.name}
                          </h4>
                          {medication.is_controlled && (
                            <Badge variant="destructive" className="text-xs">
                              Controlado
                            </Badge>
                          )}
                          {medication.generic_available && (
                            <Badge variant="secondary" className="text-xs">
                              Genérico
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Princípio Ativo:</span> {medication.active_ingredient}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Concentração:</span> {medication.concentration}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Forma:</span> {medication.pharmaceutical_form}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Fabricante:</span> {medication.manufacturer}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-8 w-8 p-0 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMedication(medication);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm.length > 0 && searchTerm.length < 2 && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600">Digite pelo menos 2 caracteres para buscar</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook personalizado para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default MedicationSearch;