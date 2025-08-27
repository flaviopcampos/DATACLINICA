import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Plus,
  Trash2,
  Calculator,
  User,
  Calendar,
  DollarSign,
  Percent,
  Hash,
  Clock,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { 
  CreateInvoiceRequest, 
  UpdateInvoiceRequest, 
  Invoice, 
  InvoiceItem,
  InvoiceType,
  InvoiceStatus
} from '@/types/billing';
import { useInvoiceManagement } from '@/hooks/useInvoices';

// Schema de validação
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
  unitPrice: z.number().min(0.01, 'Preço unitário deve ser maior que zero'),
  discount: z.number().min(0).max(100).optional().default(0),
  total: z.number().min(0)
});

const invoiceSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  appointmentId: z.string().optional(),
  type: z.enum(['consultation', 'procedure', 'exam', 'treatment', 'other']),
  issueDate: z.string().min(1, 'Data de emissão é obrigatória'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  items: z.array(invoiceItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).optional().default(0),
  taxAmount: z.number().min(0).optional().default(0),
  totalAmount: z.number().min(0.01, 'Valor total deve ser maior que zero'),
  notes: z.string().optional(),
  paymentTerms: z.string().optional()
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
  patientId?: string;
  appointmentId?: string;
  onSuccess?: (invoice: Invoice) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  className?: string;
}

function InvoiceForm({
  invoice,
  patientId,
  appointmentId,
  onSuccess,
  onCancel,
  mode = 'create',
  className = ''
}: InvoiceFormProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const invoiceManagement = useInvoiceManagement();
  const isEditing = mode === 'edit' && invoice;

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      patientId: patientId || invoice?.patientId || '',
      appointmentId: appointmentId || invoice?.appointmentId || '',
      type: invoice?.type || 'consultation',
      issueDate: invoice?.issueDate ? invoice.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice?.dueDate ? invoice.dueDate.split('T')[0] : 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
      items: invoice?.items || [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0
      }],
      subtotal: invoice?.subtotal || 0,
      discountAmount: invoice?.discountAmount || 0,
      taxAmount: invoice?.taxAmount || 0,
      totalAmount: invoice?.totalAmount || 0,
      notes: invoice?.notes || '',
      paymentTerms: invoice?.paymentTerms || '30 dias'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  // Detectar mudanças no formulário
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Recalcular totais quando itens mudarem
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('items')) {
        calculateTotals();
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Funções de utilidade
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getTypeLabel = (type: InvoiceType) => {
    const types = {
      consultation: 'Consulta',
      procedure: 'Procedimento',
      exam: 'Exame',
      treatment: 'Tratamento',
      other: 'Outros'
    };
    return types[type] || type;
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    return `${year}${month}${timestamp}`;
  };

  const calculateItemTotal = (quantity: number, unitPrice: number, discount: number = 0) => {
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const calculateTotals = () => {
    const items = form.getValues('items');
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item.quantity, item.unitPrice, item.discount);
      form.setValue(`items.${items.indexOf(item)}.total`, itemTotal);
      return sum + itemTotal;
    }, 0);

    const discountAmount = form.getValues('discountAmount') || 0;
    const taxAmount = form.getValues('taxAmount') || 0;
    const totalAmount = subtotal - discountAmount + taxAmount;

    form.setValue('subtotal', subtotal);
    form.setValue('totalAmount', Math.max(0, totalAmount));
  };

  // Handlers
  const onSubmit = async (data: InvoiceFormData) => {
    try {
      let result: Invoice;
      
      if (isEditing && invoice) {
        const updateData: UpdateInvoiceRequest = {
          patientId: data.patientId,
          appointmentId: data.appointmentId,
          type: data.type,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          items: data.items,
          subtotal: data.subtotal,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          totalAmount: data.totalAmount,
          notes: data.notes,
          paymentTerms: data.paymentTerms
        };
        result = await invoiceManagement.updateInvoice(invoice.id, updateData);
      } else {
        const createData: CreateInvoiceRequest = {
          patientId: data.patientId,
          appointmentId: data.appointmentId,
          invoiceNumber: generateInvoiceNumber(),
          type: data.type,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          items: data.items,
          subtotal: data.subtotal,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          totalAmount: data.totalAmount,
          notes: data.notes,
          paymentTerms: data.paymentTerms
        };
        result = await invoiceManagement.createInvoice(createData);
      }
      
      onSuccess?.(result);
    } catch (error) {
      console.error('Erro ao salvar fatura:', error);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      onCancel?.();
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onCancel?.();
  };

  const addItem = () => {
    append({
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      calculateTotals();
    }
  };

  const isSubmitting = invoiceManagement.isCreatingInvoice || invoiceManagement.isUpdatingInvoice;

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{isEditing ? 'Editar Fatura' : 'Nova Fatura'}</span>
          </CardTitle>
          {invoice && (
            <CardDescription>
              Fatura #{invoice.invoiceNumber} - {getTypeLabel(invoice.type)}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informações Básicas */}
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
                          {/* Aqui você integraria com a lista de pacientes */}
                          <SelectItem value="patient-1">João Silva</SelectItem>
                          <SelectItem value="patient-2">Maria Santos</SelectItem>
                          <SelectItem value="patient-3">Pedro Oliveira</SelectItem>
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
                          <SelectItem value="consultation">🩺 Consulta</SelectItem>
                          <SelectItem value="procedure">⚕️ Procedimento</SelectItem>
                          <SelectItem value="exam">🔬 Exame</SelectItem>
                          <SelectItem value="treatment">💊 Tratamento</SelectItem>
                          <SelectItem value="other">📋 Outros</SelectItem>
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
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Data de Emissão *</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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

              {/* Itens da Fatura */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Itens da Fatura</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-20">Qtd</TableHead>
                        <TableHead className="w-32">Preço Unit.</TableHead>
                        <TableHead className="w-20">Desc. %</TableHead>
                        <TableHead className="w-32">Total</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Descrição do item"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(parseInt(e.target.value) || 1);
                                        calculateTotals();
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(parseFloat(e.target.value) || 0);
                                        calculateTotals();
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.discount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(parseFloat(e.target.value) || 0);
                                        calculateTotals();
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(form.watch(`items.${index}.total`) || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totais */}
              <Card className="p-4 bg-primary/5">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Subtotal</Label>
                      <div className="text-lg font-semibold">
                        {formatCurrency(form.watch('subtotal') || 0)}
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Percent className="h-4 w-4" />
                            <span>Desconto</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value) || 0);
                                calculateTotals();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="taxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impostos/Taxas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value) || 0);
                                calculateTotals();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Geral:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(form.watch('totalAmount') || 0)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condições de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">À vista</SelectItem>
                          <SelectItem value="15 dias">15 dias</SelectItem>
                          <SelectItem value="30 dias">30 dias</SelectItem>
                          <SelectItem value="45 dias">45 dias</SelectItem>
                          <SelectItem value="60 dias">60 dias</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais sobre a fatura..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ações */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Atualizar Fatura' : 'Criar Fatura'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar {isEditing ? 'Edição' : 'Criação'}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar? Todas as informações inseridas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar {isEditing ? 'Editando' : 'Criando'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default InvoiceForm;