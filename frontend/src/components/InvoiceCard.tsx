import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Calendar,
  DollarSign,
  User,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  AlertTriangle,
  FileText,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Invoice } from '@/types/billing';
import { useInvoiceManagement } from '@/hooks/useInvoices';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { PDFSettings } from '@/components/PDFSettings';

interface InvoiceCardProps {
  invoice: Invoice;
  onUpdate?: () => void;
  showActions?: boolean;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

function InvoiceCard({
  invoice,
  onUpdate,
  showActions = true,
  compact = false,
  selectable = false,
  selected = false,
  onSelect
}: InvoiceCardProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const invoiceManagement = useInvoiceManagement();
  const { downloadPDF, previewPDF, isGenerating } = usePDFGenerator();

  // Funções de utilidade
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: {
        label: 'Rascunho',
        variant: 'secondary' as const,
        icon: FileText,
        color: 'text-gray-600'
      },
      pending: {
        label: 'Pendente',
        variant: 'default' as const,
        icon: Clock,
        color: 'text-blue-600'
      },
      paid: {
        label: 'Pago',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600'
      },
      overdue: {
        label: 'Vencido',
        variant: 'destructive' as const,
        icon: AlertTriangle,
        color: 'text-red-600'
      },
      cancelled: {
        label: 'Cancelado',
        variant: 'secondary' as const,
        icon: XCircle,
        color: 'text-gray-600'
      },
      partially_paid: {
        label: 'Parcialmente Pago',
        variant: 'default' as const,
        icon: Clock,
        color: 'text-yellow-600'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
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

  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;
  const daysOverdue = getDaysOverdue(invoice.dueDate);
  const isOverdue = invoice.status === 'overdue' || (invoice.status === 'pending' && daysOverdue > 0);

  // Handlers
  const handleView = () => {
    navigate(`/invoices/${invoice.id}`);
  };

  const handleEdit = () => {
    navigate(`/invoices/${invoice.id}/edit`);
  };

  const handleDuplicate = async () => {
    try {
      await invoiceManagement.duplicateInvoice(invoice.id);
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao duplicar fatura:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await invoiceManagement.generateInvoicePDF(invoice.id);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      await invoiceManagement.sendInvoiceEmail(invoice.id);
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await invoiceManagement.markInvoiceAsPaid(invoice.id);
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await invoiceManagement.cancelInvoice(invoice.id);
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao cancelar fatura:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await invoiceManagement.deleteInvoice(invoice.id);
      setShowDeleteDialog(false);
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao excluir fatura:', error);
    }
  };

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(!selected);
    } else {
      handleView();
    }
  };

  const canEdit = ['draft', 'pending'].includes(invoice.status);
  const canMarkAsPaid = ['pending', 'overdue', 'partially_paid'].includes(invoice.status);
  const canCancel = ['draft', 'pending', 'overdue'].includes(invoice.status);
  const canDelete = ['draft', 'cancelled'].includes(invoice.status);

  return (
    <>
      <Card 
        className={`transition-all duration-200 hover:shadow-md ${
          selected ? 'ring-2 ring-primary' : ''
        } ${
          selectable ? 'cursor-pointer' : ''
        } ${
          isOverdue ? 'border-red-200 bg-red-50/30' : ''
        }`}
        onClick={selectable ? handleCardClick : undefined}
      >
        <CardHeader className={`pb-3 ${compact ? 'py-3' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {selectable && (
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelect?.(e.target.checked);
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-lg truncate">
                    #{invoice.invoiceNumber}
                  </h3>
                  <Badge variant={statusConfig.variant} className="shrink-0">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive" className="shrink-0">
                      {daysOverdue} dias em atraso
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span className="truncate">{invoice.patientName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{getTypeLabel(invoice.type)}</span>
                  </div>
                </div>
              </div>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                  {canEdit && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => downloadPDF(invoice, [])}
                    disabled={isGenerating}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Baixando...' : 'Download PDF'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => previewPDF(invoice, [])}
                    disabled={isGenerating}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Gerando...' : 'Visualizar PDF'}
                  </DropdownMenuItem>
                  <PDFSettings 
                    invoice={invoice} 
                    payments={[]}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Settings className="h-4 w-4 mr-2" />
                        PDF Avançado
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem onClick={handleSendEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar por Email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canMarkAsPaid && (
                    <DropdownMenuItem onClick={handleMarkAsPaid}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Pago
                    </DropdownMenuItem>
                  )}
                  {canCancel && (
                    <DropdownMenuItem onClick={handleCancel}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className={`pt-0 ${compact ? 'pb-3' : ''}`}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Vencimento:</span>
                  <div className={`font-medium ${
                    isOverdue ? 'text-red-600' : 'text-foreground'
                  }`}>
                    {formatDate(invoice.dueDate)}
                  </div>
                </div>
              </div>
              
              {!compact && invoice.description && (
                <div className="text-sm text-muted-foreground truncate">
                  {invoice.description}
                </div>
              )}
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center justify-end space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Total:</div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(invoice.totalAmount)}
                  </div>
                </div>
              </div>
              
              {invoice.paidAmount > 0 && (
                <div className="text-sm text-green-600">
                  Pago: {formatCurrency(invoice.paidAmount)}
                </div>
              )}
              
              {invoice.status === 'partially_paid' && (
                <div className="text-sm text-muted-foreground">
                  Restante: {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                </div>
              )}
            </div>
          </div>

          {!compact && (
            <>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Criada em {formatDate(invoice.createdAt)}</span>
                  <span>{invoice.items.length} {invoice.items.length === 1 ? 'item' : 'itens'}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Fatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a fatura #{invoice.invoiceNumber}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={invoiceManagement.isDeletingInvoice}
            >
              {invoiceManagement.isDeletingInvoice ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default InvoiceCard;