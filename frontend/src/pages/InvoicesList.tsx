import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  User,
  DollarSign,
  Settings
} from 'lucide-react';
import { useInvoices, useInvoiceManagement } from '@/hooks/useInvoices';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import InvoiceCard from '@/components/InvoiceCard';
import { PDFSettings } from '@/components/PDFSettings';
import type { Invoice, InvoiceStatus, InvoiceType, InvoiceFilters } from '@/types/billing';

function InvoicesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // Hooks
  const { data: invoicesData, isLoading, error } = useInvoices(currentPage, pageSize, {
    ...filters,
    search: searchTerm || undefined
  });
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Pago', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
      overdue: { label: 'Vencido', variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
      cancelled: { label: 'Cancelado', variant: 'outline' as const, icon: XCircle, color: 'text-gray-600 bg-gray-50' },
      draft: { label: 'Rascunho', variant: 'outline' as const, icon: FileText, color: 'text-gray-600 bg-gray-50' },
      partially_paid: { label: 'Parcial', variant: 'secondary' as const, icon: DollarSign, color: 'text-blue-600 bg-blue-50' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  // Handlers
  const handleDeleteInvoice = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      invoiceManagement.deleteInvoice(invoiceToDelete);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedInvoices.length === 0) return;
    
    invoiceManagement.executeBulkAction({
      action: action as any,
      invoiceIds: selectedInvoices
    });
    setSelectedInvoices([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoicesData?.invoices?.map(i => i.id) || []);
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices([...selectedInvoices, id]);
    } else {
      setSelectedInvoices(selectedInvoices.filter(invoiceId => invoiceId !== id));
    }
  };

  const handleFilterChange = (key: keyof InvoiceFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faturas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as faturas do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, paciente ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={Array.isArray(filters.status) ? filters.status[0] || 'all' : filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="partially_paid">Parcial</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={Array.isArray(filters.type) ? filters.type[0] || 'all' : filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="consultation">Consulta</SelectItem>
                  <SelectItem value="procedure">Procedimento</SelectItem>
                  <SelectItem value="hospitalization">Internação</SelectItem>
                  <SelectItem value="medication">Medicamento</SelectItem>
                  <SelectItem value="exam">Exame</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedInvoices.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedInvoices.length} faturas selecionadas
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('mark_paid')}
                  disabled={invoiceManagement.isExecutingBulkAction}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Pago
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('send_reminder')}
                  disabled={invoiceManagement.isExecutingBulkAction}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Lembrete
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('cancel')}
                  disabled={invoiceManagement.isExecutingBulkAction}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Faturas</CardTitle>
              <CardDescription>
                {invoicesData?.total || 0} faturas encontradas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-600">
              Erro ao carregar faturas: {error.message}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === invoicesData?.invoices?.length && invoicesData?.invoices?.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-4 font-medium">Número</th>
                    <th className="p-4 font-medium">Paciente</th>
                    <th className="p-4 font-medium">Tipo</th>
                    <th className="p-4 font-medium">Valor</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Vencimento</th>
                    <th className="p-4 font-medium">Criado em</th>
                    <th className="p-4 font-medium w-16">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span>Carregando faturas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : invoicesData?.invoices?.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="h-12 w-12 text-muted-foreground/50" />
                          <p>Nenhuma fatura encontrada</p>
                          <p className="text-sm">Tente ajustar os filtros ou criar uma nova fatura</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invoicesData?.invoices?.map((invoice) => (
                      <tr 
                        key={invoice.id} 
                        className={`border-b hover:bg-muted/50 transition-colors ${
                          isOverdue(invoice.dueDate, invoice.status) ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={(e) => handleSelectInvoice(invoice.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          {invoice.notes && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {invoice.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{invoice.patientName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {getTypeLabel(invoice.type)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                          {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
                            <div className="text-sm text-muted-foreground">
                              Pago: {formatCurrency(invoice.paidAmount)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600 font-medium' : ''}>
                              {formatDate(invoice.dueDate)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(invoice.createdAt)}
                          </span>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => invoiceManagement.duplicateInvoice(invoice.id)}
                                disabled={invoiceManagement.isDuplicatingInvoice}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>

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
                              <DropdownMenuItem
                                onClick={() => invoiceManagement.sendInvoiceEmail({ id: invoice.id })}
                                disabled={invoiceManagement.isSendingEmail}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar Email
                              </DropdownMenuItem>
                              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                <DropdownMenuItem
                                  onClick={() => invoiceManagement.markInvoiceAsPaid({ id: invoice.id })}
                                  disabled={invoiceManagement.isMarkingAsPaid}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar como Pago
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                disabled={invoiceManagement.isDeletingInvoice}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {invoicesData && invoicesData.totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4">
          <Pagination
            currentPage={currentPage}
            totalPages={invoicesData.totalPages}
            onPageChange={setCurrentPage}
          />
          <PaginationInfo
            currentPage={currentPage}
            totalPages={invoicesData.totalPages}
            totalItems={invoicesData.total}
            itemsPerPage={pageSize}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={invoiceManagement.isDeletingInvoice}
            >
              {invoiceManagement.isDeletingInvoice ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InvoicesList;