'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Package, Plus, Minus, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Product, StockMovementCreate } from '@/types/inventory';
import { cn } from '@/lib/utils';

const movementSchema = z.object({
  product_id: z.string().min(1, 'Produto é obrigatório'),
  movement_type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    required_error: 'Tipo de movimentação é obrigatório',
  }),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  unit_cost: z.number().min(0, 'Custo unitário deve ser maior ou igual a zero').optional(),
  batch_number: z.string().optional(),
  expiry_date: z.date().optional(),
  supplier_id: z.string().optional(),
  reference_document: z.string().optional(),
  notes: z.string().optional(),
  movement_date: z.date(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  product?: Product;
  onSubmit: (data: StockMovementCreate) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const movementTypes = [
  { value: 'IN', label: 'Entrada', icon: Plus, color: 'text-green-600' },
  { value: 'OUT', label: 'Saída', icon: Minus, color: 'text-red-600' },
  { value: 'ADJUSTMENT', label: 'Ajuste', icon: RotateCcw, color: 'text-blue-600' },
] as const;

export function MovementForm({
  product,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: MovementFormProps) {
  const [selectedMovementType, setSelectedMovementType] = useState<string>('');
  const [showBatchFields, setShowBatchFields] = useState(false);

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      product_id: product?.id || '',
      movement_date: new Date(),
      quantity: 0,
      unit_cost: 0,
    },
  });

  const watchedMovementType = form.watch('movement_type');

  const handleSubmit = (data: MovementFormData) => {
    const submitData: StockMovementCreate = {
      product_id: data.product_id,
      movement_type: data.movement_type,
      quantity: data.quantity,
      movement_date: data.movement_date.toISOString(),
      unit_cost: data.unit_cost,
      batch_number: data.batch_number,
      expiry_date: data.expiry_date?.toISOString(),
      supplier_id: data.supplier_id,
      reference_document: data.reference_document,
      notes: data.notes,
    };
    onSubmit(submitData);
  };

  const selectedType = movementTypes.find(type => type.value === watchedMovementType);

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Registrar Movimentação de Estoque
        </CardTitle>
        {product && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Produto:</span>
            <Badge variant="outline">{product.name}</Badge>
            <span className="text-xs">Estoque atual: {product.current_stock || 0} {product.unit}</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Movement Type */}
            <FormField
              control={form.control}
              name="movement_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação *</FormLabel>
                  <div className="grid grid-cols-3 gap-3">
                    {movementTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = field.value === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            field.onChange(type.value);
                            setSelectedMovementType(type.value);
                          }}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 border rounded-lg transition-all',
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          )}
                        >
                          <Icon className={cn('h-6 w-6', isSelected ? 'text-blue-600' : type.color)} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Cost */}
              {watchedMovementType === 'IN' && (
                <FormField
                  control={form.control}
                  name="unit_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo Unitário</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Movement Date */}
              <FormField
                control={form.control}
                name="movement_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Movimentação *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Batch Information Toggle */}
            {watchedMovementType === 'IN' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-batch"
                  checked={showBatchFields}
                  onChange={(e) => setShowBatchFields(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="show-batch" className="text-sm">
                  Adicionar informações de lote
                </Label>
              </div>
            )}

            {/* Batch Fields */}
            {showBatchFields && watchedMovementType === 'IN' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <FormField
                  control={form.control}
                  name="batch_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Lote</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: L001234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Reference Document */}
            <FormField
              control={form.control}
              name="reference_document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento de Referência</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: NF 12345, Pedido 67890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre a movimentação..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            {selectedType && form.watch('quantity') > 0 && product && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Resumo da Movimentação</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className={selectedType.color}>{selectedType.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantidade:</span>
                    <span>{form.watch('quantity')} {product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estoque atual:</span>
                    <span>{product.current_stock || 0} {product.unit}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Novo estoque:</span>
                    <span className={cn(
                      watchedMovementType === 'IN' ? 'text-green-600' : 
                      watchedMovementType === 'OUT' ? 'text-red-600' : 'text-blue-600'
                    )}>
                      {watchedMovementType === 'IN' 
                        ? (product.current_stock || 0) + form.watch('quantity')
                        : watchedMovementType === 'OUT'
                        ? (product.current_stock || 0) - form.watch('quantity')
                        : form.watch('quantity')
                      } {product.unit}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Registrando...' : 'Registrar Movimentação'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}