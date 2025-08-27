'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Package, DollarSign, Hash, FileText } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useInventory';
import { Product, ProductCategory } from '@/types/inventory';
import { cn } from '@/lib/utils';

const productFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  code: z.string().min(1, 'Código é obrigatório').max(50, 'Código muito longo'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  unit_price: z.number().min(0, 'Preço deve ser positivo'),
  minimum_stock: z.number().min(0, 'Estoque mínimo deve ser positivo'),
  maximum_stock: z.number().min(0, 'Estoque máximo deve ser positivo'),
  unit_of_measure: z.string().min(1, 'Unidade de medida é obrigatória'),
  manufacturer: z.string().optional(),
  supplier: z.string().optional(),
  barcode: z.string().optional(),
  location: z.string().optional(),
  requires_prescription: z.boolean().default(false),
  controlled_substance: z.boolean().default(false),
  is_active: z.boolean().default(true),
}).refine((data) => data.maximum_stock >= data.minimum_stock, {
  message: 'Estoque máximo deve ser maior ou igual ao mínimo',
  path: ['maximum_stock'],
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  categories: ProductCategory[];
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

export function ProductForm({ product, categories, onSuccess, onCancel, className }: ProductFormProps) {
  const isEditing = !!product;
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
      name: product.name,
      code: product.code,
      description: product.description || '',
      category_id: product.category_id,
      unit_price: product.unit_price,
      minimum_stock: product.minimum_stock,
      maximum_stock: product.maximum_stock || product.minimum_stock,
      unit_of_measure: product.unit_of_measure,
      manufacturer: product.manufacturer || '',
      supplier: product.supplier || '',
      barcode: product.barcode || '',
      location: product.location || '',
      requires_prescription: product.requires_prescription || false,
      controlled_substance: product.controlled_substance || false,
      is_active: product.is_active ?? true,
    } : {
      name: '',
      code: '',
      description: '',
      category_id: '',
      unit_price: 0,
      minimum_stock: 0,
      maximum_stock: 0,
      unit_of_measure: 'UN',
      manufacturer: '',
      supplier: '',
      barcode: '',
      location: '',
      requires_prescription: false,
      controlled_substance: false,
      is_active: true,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing && product) {
        await updateProductMutation.mutateAsync({
          id: product.id,
          ...data,
        });
      } else {
        await createProductMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const unitOptions = [
    { value: 'UN', label: 'Unidade' },
    { value: 'CX', label: 'Caixa' },
    { value: 'FR', label: 'Frasco' },
    { value: 'CP', label: 'Comprimido' },
    { value: 'ML', label: 'Mililitro' },
    { value: 'MG', label: 'Miligrama' },
    { value: 'G', label: 'Grama' },
    { value: 'KG', label: 'Quilograma' },
    { value: 'L', label: 'Litro' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Paracetamol 500mg"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código do Produto *</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="Ex: PAR500"
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.code.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição detalhada do produto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <Select
                value={watchedValues.category_id}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_of_measure">Unidade de Medida *</Label>
              <Select
                value={watchedValues.unit_of_measure}
                onValueChange={(value) => setValue('unit_of_measure', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing and Stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preço e Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price">Preço Unitário *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                {...register('unit_price', { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.unit_price ? 'border-red-500' : ''}
              />
              {errors.unit_price && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.unit_price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                {...register('minimum_stock', { valueAsNumber: true })}
                placeholder="0"
                className={errors.minimum_stock ? 'border-red-500' : ''}
              />
              {errors.minimum_stock && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.minimum_stock.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximum_stock">Estoque Máximo *</Label>
              <Input
                id="maximum_stock"
                type="number"
                min="0"
                {...register('maximum_stock', { valueAsNumber: true })}
                placeholder="0"
                className={errors.maximum_stock ? 'border-red-500' : ''}
              />
              {errors.maximum_stock && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.maximum_stock.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                {...register('manufacturer')}
                placeholder="Nome do fabricante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                {...register('supplier')}
                placeholder="Nome do fornecedor"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder="Código de barras do produto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ex: Prateleira A1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Requer Prescrição</Label>
              <p className="text-sm text-gray-600">
                Produto controlado que requer prescrição médica
              </p>
            </div>
            <Switch
              checked={watchedValues.requires_prescription}
              onCheckedChange={(checked) => setValue('requires_prescription', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Substância Controlada</Label>
              <p className="text-sm text-gray-600">
                Produto sujeito a controle especial
              </p>
            </div>
            <Switch
              checked={watchedValues.controlled_substance}
              onCheckedChange={(checked) => setValue('controlled_substance', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Produto Ativo</Label>
              <p className="text-sm text-gray-600">
                Produto disponível para uso no sistema
              </p>
            </div>
            <Switch
              checked={watchedValues.is_active}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {watchedValues.name && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{watchedValues.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{watchedValues.code}</p>
                {watchedValues.description && (
                  <p className="text-gray-700 text-sm mb-3">{watchedValues.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {watchedValues.requires_prescription && (
                    <Badge variant="destructive">Requer Prescrição</Badge>
                  )}
                  {watchedValues.controlled_substance && (
                    <Badge variant="outline">Controlado</Badge>
                  )}
                  {!watchedValues.is_active && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  R$ {watchedValues.unit_price?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">
                  por {watchedValues.unit_of_measure}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'} Produto
        </Button>
      </div>
    </form>
  );
}