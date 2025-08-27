import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CreditCard,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Receipt,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trash2,
  Plus,
  TrendingUp,
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';
import type { Payment, PaymentStatus, PaymentMethod } from '@/types/billing';
import { usePayments, usePaymentManagement } from '@/hooks/usePayments';
import PaymentForm from './PaymentForm';

interface PaymentHistoryProps {
  invoiceId: string;
  invoiceTotal: number;
  className?: string;
}

function PaymentHistory({ invoiceId, invoiceTotal, className = '' }: PaymentHistoryProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const { data: payments = [], isLoading } = usePayments({ invoiceId });
  const paymentManagement = usePaymentManagement();

  // Funções de utilidade
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: PaymentStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: PaymentStatus) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      refunded: 'Estornado'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: PaymentStatus) => {
    const icons = {
      pending: <Clock className="h-3 w-3" />,
      confirmed: <CheckCircle className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />,
      refunded: <RotateCcw className="h-3 w-3" />
    };
    return icons[status] || <AlertCircle className="h-3 w-3" />;
  };

  const getMethodLabel = (method: PaymentMethod) => {
    const labels = {
      cash: 'Dinheiro',
      card: 'Cartão',
      pix: 'PIX',
      transfer: 'Transferência',
      check: 'Cheque',
      insurance: 'Convênio'
    };
    return labels[method] || method;
  };

  const getMethodIcon = (method: PaymentMethod) => {
    const icons = {
      cash: '💵',
      card: '💳',
      pix: '📱',
      transfer: '🏦',
      check: '📝',
      insurance: '🏥'
    };
    return icons[method] || '💰';
  };

  // Cálculos
  const totalPaid = payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const remainingAmount = invoiceTotal - totalPaid;
  const paymentProgress = (totalPaid / invoiceTotal) * 100;

  // Handlers
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  const handleDeletePayment = (payment: Payment) => {
    setPaymentToDelete(payment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (paymentToDelete) {
      try {
        await paymentManagement.deletePayment(paymentToDelete.id);
        setShowDeleteDialog(false);
        setPaymentToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir pagamento:', error);
      }
    }
  };

  const handleConfirmPayment = async (payment: Payment) => {
    try {
      await paymentManagement.confirmPayment(payment.id);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
    }
  };

  const handleCancelPayment = async (payment: Payment) => {
    try {
      await paymentManagement.cancelPayment(payment.id);
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
    }
  };

  const handleRefundPayment = async (payment: Payment) => {
    try {
      await paymentManagement.refundPayment(payment.id);
    } catch (error) {
      console.error('Erro ao estornar pagamento:', error);
    }
  };

  const handleGenerateReceipt = async (payment: Payment) => {
    try {
      await paymentManagement.generateReceipt(payment.id);
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
    }
  };

  const handleNewPayment = () => {
    setSelectedPayment(null);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPayment(null);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando histórico de pagamentos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Histórico de Pagamentos</span>
              </CardTitle>
              <CardDescription>
                {payments.length} pagamento{payments.length !== 1 ? 's' : ''} registrado{payments.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button onClick={handleNewPayment}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Pago</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {formatCurrency(totalPaid)}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Pendente</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900 mt-1">
                {formatCurrency(totalPending)}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Restante</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(remainingAmount)}
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Progresso</span>
              </div>
              <div className="text-2xl font-bold text-primary mt-1">
                {paymentProgress.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso do Pagamento</span>
              <span>{formatCurrency(totalPaid)} de {formatCurrency(invoiceTotal)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
              />
            </div>
          </div>

          <Separator />

          {/* Lista de Pagamentos */}
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pagamento registrado
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione o primeiro pagamento para esta fatura.
              </p>
              <Button onClick={handleNewPayment}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pagamento
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(payment.paymentDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{getMethodIcon(payment.method)}</span>
                          <span>{getMethodLabel(payment.method)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(payment.status)}
                        >
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(payment.status)}
                            <span>{getStatusLabel(payment.status)}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {payment.reference || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPayment(payment)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateReceipt(payment)}>
                              <Receipt className="h-4 w-4 mr-2" />
                              Gerar Recibo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {payment.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleConfirmPayment(payment)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            {payment.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => handleRefundPayment(payment)}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Estornar
                              </DropdownMenuItem>
                            )}
                            {payment.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleCancelPayment(payment)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeletePayment(payment)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPayment ? 'Editar Pagamento' : 'Novo Pagamento'}
            </DialogTitle>
            <DialogDescription>
              {selectedPayment 
                ? 'Atualize as informações do pagamento.' 
                : 'Registre um novo pagamento para esta fatura.'
              }
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            payment={selectedPayment || undefined}
            invoiceId={invoiceId}
            maxAmount={remainingAmount + (selectedPayment?.amount || 0)}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data</Label>
                  <div>{formatDate(selectedPayment.paymentDate)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Método</Label>
                  <div className="flex items-center space-x-2">
                    <span>{getMethodIcon(selectedPayment.method)}</span>
                    <span>{getMethodLabel(selectedPayment.method)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valor</Label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(selectedPayment.amount)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedPayment.status)}
                      <span>{getStatusLabel(selectedPayment.status)}</span>
                    </div>
                  </Badge>
                </div>
              </div>
              {selectedPayment.reference && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Referência</Label>
                  <div>{selectedPayment.reference}</div>
                </div>
              )}
              {selectedPayment.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Observações</Label>
                  <div className="text-sm text-gray-700">{selectedPayment.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default PaymentHistory;