'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = 'Selecione um período',
  disabled = false,
  className
}: DateRangePickerProps) {
  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, 'PPP', { locale: ptBR });
    return `${format(range.from, 'PPP', { locale: ptBR })} - ${format(range.to, 'PPP', { locale: ptBR })}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !dateRange?.from && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(dateRange)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          initialFocus
          locale={ptBR}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

// Alias para compatibilidade
export const DatePickerWithRange = DateRangePicker;