import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  ArrowLeft,
  Edit,
  Download,
  Send,
  Copy,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  DollarSign,
  CreditCard,
  AlertCircle,
  Printer,
  Share2,
  History,
  Eye,
  Settings
} from 'lucide-react';
import { useInvoices, useInvoice, useInvoiceManagement } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import PaymentHistory from '@/components/PaymentHistory';
import { PDFSettings } from '@/components/PDFSettings';
import type { Invoice, InvoiceStatus, InvoiceType } from '@/types/billing';

function ViewInvoice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: invoice, isLoading, error } = useInvoice(id!);
  const { data: paymentsResponse } = usePayments(parseInt(id!));
  const invoiceManagement = useInvoiceManagement();
  const { downloadPDF, previewPDF, isGenerating } = usePDFGenerator();

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

  const getStatusColor = (status: InvoiceStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
      partially_paid: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    const labels = {
      draft: 'Rascunho',
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado',
      partially_paid: 'Parcialmente Pago'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: InvoiceType) => {
    const types = {
      consultation: 'Consulta',
      procedure: 'Procedimento',
      hospitalization: 'Internação',
      medication: 'Medicamento',
      exam: 'Exame',
      other: 'Outros'
    };
    return types[type] || type;
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const calculateDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Handlers
  const handleEdit = () => {
    navigate(`/invoices/${id}/edit`);
  };

  const handleDuplicate = async () => {
    if (invoice) {
      try {
        await invoiceManagement.duplicateInvoice(invoice.id);
        // Navegar para a nova fatura ou mostrar sucesso
      } catch (error) {
        console.error('Erro ao duplicar fatura:', error);
      }
    }
  };

  const handleMarkAsPaid = async () => {
    if (invoice) {
      try {
        await invoiceManagement.markInvoiceAsPaid({ id: invoice.id });
      } catch (error) {
        console.error('Erro ao marcar como pago:', error);
      }
    }
  };

  const handleCancel = async () => {
    if (invoice) {
      try {
        await invoiceManagement.cancelInvoice({ id: invoice.id });
        setShowCancelDialog(false);
      } catch (error) {
        console.error('Erro ao cancelar fatura:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (invoice) {
      try {
        await invoiceManagement.deleteInvoice(invoice.id);
        setShowDeleteDialog(false);
        navigate('/invoices');
      } catch (error) {
        console.error('Erro ao excluir fatura:', error);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (invoice) {
      try {
        await invoiceManagement.generateInvoicePDF({ id: invoice.id });
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
      }
    }
  };

  const handleSendEmail = async () => {
    if (invoice) {
      try {
        await invoiceManagement.sendInvoiceEmail({ id: invoice.id });
      } catch (error) {
        console.error('Erro ao enviar email:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Fatura não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A fatura solicitada não foi encontrada ou você não tem permissão para visualizá-la.
          </p>
          <Button onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Faturas
          </Button>
        </div>
      </div>
    );
  }

  const payments = paymentsResponse?.payments || [];
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = invoice.totalAmount - totalPaid;
  const daysOverdue = invoice.status === 'overdue' ? calculateDaysOverdue(invoice.dueDate) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Fatura #{invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">
              Criada em {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(invoice.status)}>
            {getStatusIcon(invoice.status)}
            <span className="ml-1">{getStatusLabel(invoice.status)}</span>
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Enviar por Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {invoice.status === 'pending' && (
                <DropdownMenuItem onClick={handleMarkAsPaid}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Pago
                </DropdownMenuItem>
              )}
              {['pending', 'overdue'].includes(invoice.status) && (
                <DropdownMenuItem 
                  onClick={() => setShowCancelDialog(true)}
                  className="text-orange-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Fatura
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da Fatura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Informações da Fatura</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paciente</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{invoice.patientName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <div className="mt-1">
                    <Badge variant="secondary">{getTypeLabel(invoice.type)}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Vencimento</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                      {formatDate(invoice.dueDate)}
                      {daysOverdue > 0 && (
                        <span className="text-red-600 text-sm ml-2">
                          ({daysOverdue} dias em atraso)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                {invoice.appointmentId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agendamento</label>
                    <div className="mt-1">
                      <Button variant="link" className="p-0 h-auto">
                        Ver Agendamento #{invoice.appointmentId}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {invoice.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="mt-1 text-sm">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itens da Fatura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Itens da Fatura</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.description}</h4>
                      <span className="font-semibold">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span>Quantidade: </span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      <div>
                        <span>Preço Unit.: </span>
                        <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                      </div>
                      {item.discount && item.discount > 0 && (
                        <div>
                          <span>Desconto: </span>
                          <span className="font-medium text-red-600">{item.discount}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Pagamentos */}
          {payments && payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Histórico de Pagamentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(payment.paymentDate)} • {payment.method}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        className={payment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {payment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">Desconto:</span>
                    <span className="font-medium">-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between items-center text-blue-600">
                    <span className="text-sm">Impostos:</span>
                    <span className="font-medium">+{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                
                {totalPaid > 0 && (
                  <>
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Pago:</span>
                      <span className="font-medium">{formatCurrency(totalPaid)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-sm">Restante:</span>
                      <span className={remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Ações Rápidas */}
              <div className="pt-4 space-y-2">
                {invoice.status === 'pending' && (
                  <Button onClick={handleMarkAsPaid} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Pago
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => previewPDF(invoice, payments)}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Gerando...' : 'Visualizar PDF'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => downloadPDF(invoice, payments)}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Baixando...' : 'Download PDF'}
                </Button>
                
                <PDFSettings 
                   invoice={invoice} 
                   payments={payments}
                   trigger={
                     <Button variant="outline" className="w-full">
                       <Settings className="h-4 w-4 mr-2" />
                       PDF Avançado
                     </Button>
                   }
                 />
                
                <Button variant="outline" onClick={handleSendEmail} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar por Email
                </Button>
              </div>

              {/* Informações Adicionais */}
              <div className="pt-4 space-y-2 text-xs text-muted-foreground border-t">
                <div>Criada: {formatDate(invoice.createdAt)}</div>
                <div>Atualizada: {formatDate(invoice.updatedAt)}</div>
                {invoice.paidDate && (
                  <div>Paga: {formatDate(invoice.paidDate)}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Fatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Fatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta fatura? Ela não poderá mais ser paga.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Sim, Cancelar Fatura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ViewInvoice;