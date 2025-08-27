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
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
  AlertCircle,
  Calculator,
  Receipt,
  User,
  Building,
  Hash,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { 
  CreatePaymentRequest, 
  UpdatePaymentRequest, 
  Payment, 
  Invoice,
  PaymentMethod,
  PaymentStatus
} from '@/types/billing';
import { usePaymentManagement } from '@/hooks/usePayments';

// Schema de validação
const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Fatura é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  method: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check', 'insurance']),
  paymentDate: z.string().min(1, 'Data do pagamento é obrigatória'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  // Campos específicos para cartão
  cardLastFourDigits: z.string().optional(),
  cardBrand: z.string().optional(),
  // Campos específicos para transferência/PIX
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  // Campos específicos para cheque
  checkNumber: z.string().optional(),
  checkBank: z.string().optional(),
  // Campos específicos para convênio
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional()
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  payment?: Payment;
  invoice?: Invoice;
  onSuccess?: (payment: Payment) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  className?: string;
}

function PaymentForm({
  payment,
  invoice,
  onSuccess,
  onCancel,
  mode = 'create',
  className = ''
}: PaymentFormProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [maxAmount, setMaxAmount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  
  const paymentManagement = usePaymentManagement();
  const isEditing = mode === 'edit' && payment;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: invoice?.id || payment?.invoiceId || '',
      amount: payment?.amount || 0,
      method: payment?.method || 'cash',
      paymentDate: payment?.paymentDate ? payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0],
      reference: payment?.reference || '',
      notes: payment?.notes || '',
      cardLastFourDigits: payment?.cardLastFourDigits || '',
      cardBrand: payment?.cardBrand || '',
      bankName: payment?.bankName || '',
      accountNumber: payment?.accountNumber || '',
      checkNumber: payment?.checkNumber || '',
      checkBank: payment?.checkBank || '',
      insuranceProvider: payment?.insuranceProvider || '',
      insuranceNumber: payment?.insuranceNumber || ''
    }
  });

  // Calcular valor máximo permitido
  useEffect(() => {
    if (invoice) {
      const remainingAmount = invoice.totalAmount - invoice.paidAmount;
      setMaxAmount(remainingAmount);
      
      if (!isEditing && remainingAmount > 0) {
        form.setValue('amount', remainingAmount);
      }
    }
  }, [invoice, isEditing, form]);

  // Detectar mudanças no formulário
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Atualizar método selecionado
  useEffect(() => {
    const method = form.watch('method');
    setSelectedMethod(method);
  }, [form.watch('method')]);

  // Funções de utilidade
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getMethodLabel = (method: PaymentMethod) => {
    const methods = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      bank_transfer: 'Transferência Bancária',
      pix: 'PIX',
      check: 'Cheque',
      insurance: 'Convênio'
    };
    return methods[method] || method;
  };

  const getMethodIcon = (method: PaymentMethod) => {
    const icons = {
      cash: DollarSign,
      credit_card: CreditCard,
      debit_card: CreditCard,
      bank_transfer: Building,
      pix: Hash,
      check: Receipt,
      insurance: FileText
    };
    return icons[method] || DollarSign;
  };

  const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PAY-${timestamp}-${random}`;
  };

  // Handlers
  const onSubmit = async (data: PaymentFormData) => {
    try {
      let result: Payment;
      
      if (isEditing && payment) {
        const updateData: UpdatePaymentRequest = {
          amount: data.amount,
          method: data.method,
          paymentDate: data.paymentDate,
          reference: data.reference || generateReference(),
          notes: data.notes,
          cardLastFourDigits: data.cardLastFourDigits,
          cardBrand: data.cardBrand,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          checkNumber: data.checkNumber,
          checkBank: data.checkBank,
          insuranceProvider: data.insuranceProvider,
          insuranceNumber: data.insuranceNumber
        };
        result = await paymentManagement.updatePayment(payment.id, updateData);
      } else {
        const createData: CreatePaymentRequest = {
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          paymentDate: data.paymentDate,
          reference: data.reference || generateReference(),
          notes: data.notes,
          cardLastFourDigits: data.cardLastFourDigits,
          cardBrand: data.cardBrand,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          checkNumber: data.checkNumber,
          checkBank: data.checkBank,
          insuranceProvider: data.insuranceProvider,
          insuranceNumber: data.insuranceNumber
        };
        result = await paymentManagement.createPayment(createData);
      }
      
      onSuccess?.(result);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
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

  const handleGenerateReference = () => {
    form.setValue('reference', generateReference());
  };

  const MethodIcon = getMethodIcon(selectedMethod);
  const isSubmitting = paymentManagement.isCreatingPayment || paymentManagement.isUpdatingPayment;

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MethodIcon className="h-5 w-5" />
            <span>{isEditing ? 'Editar Pagamento' : 'Novo Pagamento'}</span>
          </CardTitle>
          {invoice && (
            <CardDescription>
              Fatura #{invoice.invoiceNumber} - {formatCurrency(invoice.totalAmount)}
              {invoice.paidAmount > 0 && (
                <span className="ml-2 text-green-600">
                  (Pago: {formatCurrency(invoice.paidAmount)})
                </span>
              )}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Valor *</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0.01"
                          max={maxAmount}
                          step="0.01"
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      {maxAmount > 0 && (
                        <FormDescription>
                          Valor máximo: {formatCurrency(maxAmount)}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Método de Pagamento *</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">💵 Dinheiro</SelectItem>
                          <SelectItem value="credit_card">💳 Cartão de Crédito</SelectItem>
                          <SelectItem value="debit_card">💳 Cartão de Débito</SelectItem>
                          <SelectItem value="bank_transfer">🏦 Transferência Bancária</SelectItem>
                          <SelectItem value="pix">📱 PIX</SelectItem>
                          <SelectItem value="check">📄 Cheque</SelectItem>
                          <SelectItem value="insurance">🏥 Convênio</SelectItem>
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
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Data do Pagamento *</span>
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
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span>Referência</span>
                      </FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input placeholder="Referência do pagamento" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateReference}
                        >
                          Gerar
                        </Button>
                      </div>
                      <FormDescription>
                        Identificador único para este pagamento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campos específicos por método */}
              {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
                <Card className="p-4 bg-blue-50/50">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Informações do Cartão</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cardLastFourDigits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Últimos 4 dígitos</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="1234"
                              maxLength={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cardBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bandeira</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a bandeira" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="visa">Visa</SelectItem>
                              <SelectItem value="mastercard">Mastercard</SelectItem>
                              <SelectItem value="elo">Elo</SelectItem>
                              <SelectItem value="amex">American Express</SelectItem>
                              <SelectItem value="hipercard">Hipercard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              )}

              {(selectedMethod === 'bank_transfer' || selectedMethod === 'pix') && (
                <Card className="p-4 bg-green-50/50">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Informações Bancárias</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banco</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do banco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {selectedMethod === 'bank_transfer' && (
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conta</FormLabel>
                            <FormControl>
                              <Input placeholder="Número da conta" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </Card>
              )}

              {selectedMethod === 'check' && (
                <Card className="p-4 bg-yellow-50/50">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Receipt className="h-4 w-4" />
                    <span>Informações do Cheque</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Cheque</FormLabel>
                          <FormControl>
                            <Input placeholder="000001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkBank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banco Emissor</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do banco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              )}

              {selectedMethod === 'insurance' && (
                <Card className="p-4 bg-purple-50/50">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Informações do Convênio</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="insuranceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Convênio</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do convênio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="insuranceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da Carteirinha</FormLabel>
                          <FormControl>
                            <Input placeholder="Número da carteirinha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              )}

              {/* Observações */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais sobre o pagamento..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Resumo */}
              {form.watch('amount') > 0 && (
                <Card className="p-4 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      <span className="font-medium">Resumo do Pagamento</span>
                    </div>
                    <Badge variant="secondary">
                      {getMethodLabel(selectedMethod)}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Valor:</span>
                      <span className="font-semibold text-lg text-primary">
                        {formatCurrency(form.watch('amount'))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Data:</span>
                      <span className="text-sm">
                        {form.watch('paymentDate') ? 
                          new Date(form.watch('paymentDate')).toLocaleDateString('pt-BR') : 
                          'Não definida'
                        }
                      </span>
                    </div>
                    {form.watch('reference') && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Referência:</span>
                        <span className="text-sm font-mono">{form.watch('reference')}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Ações */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Atualizando...' : 'Processando...'}
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      {isEditing ? 'Atualizar Pagamento' : 'Registrar Pagamento'}
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

export default PaymentForm;