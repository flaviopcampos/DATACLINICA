import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Calculator,
  User,
  Calendar,
  FileText,
  DollarSign,
  Percent,
  AlertCircle
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInvoiceManagement } from '@/hooks/useInvoices';
import type { CreateInvoiceRequest, InvoiceItem } from '@/types/billing';

// Schema de validação
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  unitPrice: z.number().min(0, 'Preço unitário deve ser maior ou igual a 0'),
  discount: z.number().min(0).max(100, 'Desconto deve estar entre 0 e 100').optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  serviceCode: z.string().optional(),
  notes: z.string().optional()
});

const createInvoiceSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  appointmentId: z.string().optional(),
  type: z.enum(['consultation', 'procedure', 'hospitalization', 'medication', 'exam', 'other']),
  description: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  notes: z.string().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  taxPercentage: z.number().min(0).max(100).optional()
});

type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>;

function CreateInvoice() {
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const invoiceManagement = useInvoiceManagement();

  const form = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      type: 'consultation',
      items: [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        category: '',
        serviceCode: '',
        notes: ''
      }],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
      discountPercentage: 0,
      taxPercentage: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  // Funções de utilidade
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const calculateItemTotal = (quantity: number, unitPrice: number, discount: number = 0) => {
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const calculateTotals = () => {
    setIsCalculating(true);
    
    const items = form.getValues('items');
    const discountPercentage = form.getValues('discountPercentage') || 0;
    const taxPercentage = form.getValues('taxPercentage') || 0;

    // Calcular subtotal
    const newSubtotal = items.reduce((sum, item) => {
      return sum + calculateItemTotal(item.quantity, item.unitPrice, item.discount);
    }, 0);

    // Calcular desconto geral
    const newDiscountAmount = (newSubtotal * discountPercentage) / 100;
    
    // Calcular base para impostos (subtotal - desconto)
    const taxBase = newSubtotal - newDiscountAmount;
    
    // Calcular impostos
    const newTaxAmount = (taxBase * taxPercentage) / 100;
    
    // Calcular total final
    const newTotalAmount = taxBase + newTaxAmount;

    setSubtotal(newSubtotal);
    setDiscountAmount(newDiscountAmount);
    setTaxAmount(newTaxAmount);
    setTotalAmount(newTotalAmount);
    
    setTimeout(() => setIsCalculating(false), 300);
  };

  // Recalcular totais quando os itens ou percentuais mudarem
  useEffect(() => {
    calculateTotals();
  }, [form.watch('items'), form.watch('discountPercentage'), form.watch('taxPercentage')]);

  // Handlers
  const handleAddItem = () => {
    append({
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      category: '',
      serviceCode: '',
      notes: ''
    });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const currentItems = form.getValues('items');
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    form.setValue('items', updatedItems);
  };

  const onSubmit = async (data: CreateInvoiceForm) => {
    try {
      const invoiceData: CreateInvoiceRequest = {
        ...data,
        items: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          category: item.category,
          serviceCode: item.serviceCode,
          notes: item.notes
        })),
        discountAmount: discountAmount,
        discountPercentage: data.discountPercentage
      };

      await invoiceManagement.createInvoice(invoiceData);
      navigate('/invoices');
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
    }
  };

  const handleCancel = () => {
    if (form.formState.isDirty) {
      setShowCancelDialog(true);
    } else {
      navigate('/invoices');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/invoices');
  };

  const getTypeLabel = (type: string) => {
    const types = {
      consultation: 'Consulta',
      procedure: 'Procedimento',
      hospitalization: 'Internação',
      medication: 'Medicamento',
      exam: 'Exame',
      other: 'Outros'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Fatura</h1>
            <p className="text-muted-foreground">
              Crie uma nova fatura para o paciente
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={invoiceManagement.isCreatingInvoice || !form.formState.isValid}
          >
            <Save className="h-4 w-4 mr-2" />
            {invoiceManagement.isCreatingInvoice ? 'Salvando...' : 'Salvar Fatura'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Informações Básicas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Paciente *</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o paciente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="patient1">João Silva</SelectItem>
                              <SelectItem value="patient2">Maria Santos</SelectItem>
                              <SelectItem value="patient3">Pedro Oliveira</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Fatura *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="consultation">Consulta</SelectItem>
                              <SelectItem value="procedure">Procedimento</SelectItem>
                              <SelectItem value="hospitalization">Internação</SelectItem>
                              <SelectItem value="medication">Medicamento</SelectItem>
                              <SelectItem value="exam">Exame</SelectItem>
                              <SelectItem value="other">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="appointmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agendamento (Opcional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Vincular a um agendamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apt1">Consulta - 15/01/2024</SelectItem>
                              <SelectItem value="apt2">Exame - 20/01/2024</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Data de Vencimento *</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição adicional da fatura..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Itens da Fatura */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Itens da Fatura</span>
                    </CardTitle>
                    <Button type="button" variant="outline" onClick={handleAddItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Item {index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="md:col-span-2">
                            <Label>Descrição *</Label>
                            <Input
                              placeholder="Descrição do item"
                              value={form.watch(`items.${index}.description`)}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Categoria *</Label>
                            <Select
                              value={form.watch(`items.${index}.category`)}
                              onValueChange={(value) => handleItemChange(index, 'category', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="consultation">Consulta</SelectItem>
                                <SelectItem value="procedure">Procedimento</SelectItem>
                                <SelectItem value="medication">Medicamento</SelectItem>
                                <SelectItem value="exam">Exame</SelectItem>
                                <SelectItem value="material">Material</SelectItem>
                                <SelectItem value="other">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Quantidade *</Label>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={form.watch(`items.${index}.quantity`)}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <Label>Preço Unitário *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={form.watch(`items.${index}.unitPrice`)}
                              onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div>
                            <Label>Desconto (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={form.watch(`items.${index}.discount`) || 0}
                              onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Total do Item</Label>
                            <div className="text-lg font-semibold text-primary">
                              {formatCurrency(calculateItemTotal(
                                form.watch(`items.${index}.quantity`),
                                form.watch(`items.${index}.unitPrice`),
                                form.watch(`items.${index}.discount`)
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Observações adicionais, termos de pagamento, etc..."
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Resumo Financeiro */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Resumo Financeiro</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Percentuais */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Percent className="h-4 w-4" />
                            <span>Desconto Geral (%)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Percent className="h-4 w-4" />
                            <span>Impostos (%)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Cálculos */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-red-600">
                        <span className="text-sm">Desconto:</span>
                        <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    
                    {taxAmount > 0 && (
                      <div className="flex justify-between items-center text-blue-600">
                        <span className="text-sm">Impostos:</span>
                        <span className="font-medium">+{formatCurrency(taxAmount)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className={`text-primary ${isCalculating ? 'animate-pulse' : ''}`}>
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="pt-4">
                    <Badge variant="secondary" className="w-full justify-center">
                      {getTypeLabel(form.watch('type'))}
                    </Badge>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-3 w-3" />
                      <span>A fatura será criada com status "Pendente"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>Vencimento: {form.watch('dueDate') ? new Date(form.watch('dueDate')).toLocaleDateString('pt-BR') : 'Não definido'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Criação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar? Todas as informações inseridas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CreateInvoice;