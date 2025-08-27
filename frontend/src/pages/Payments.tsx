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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  User,
  FileText,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { usePayments, usePaymentManagement } from '@/hooks/usePayments';
import type { PaymentFilters } from '@/types/billing';

function Payments() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  // Hooks
  const { data: paymentsData, isLoading, error } = usePayments(currentPage, pageSize, {
    ...filters,
    search: searchTerm || undefined
  });
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

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600 bg-red-50' },
      refunded: { label: 'Estornado', variant: 'outline' as const, icon: RefreshCw, color: 'text-blue-600 bg-blue-50' },
      failed: { label: 'Falhou', variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600 bg-red-50' }
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

  const getMethodIcon = (method: string) => {
    const methodIcons = {
      credit_card: CreditCard,
      debit_card: CreditCard,
      cash: Banknote,
      pix: Smartphone,
      bank_transfer: Building,
      check: FileText
    };
    return methodIcons[method as keyof typeof methodIcons] || CreditCard;
  };

  const getMethodLabel = (method: string) => {
    const methods = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro',
      pix: 'PIX',
      bank_transfer: 'Transferência',
      check: 'Cheque'
    };
    return methods[method as keyof typeof methods] || method;
  };

  // Handlers
  const handleDeletePayment = (id: string) => {
    setPaymentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (paymentToDelete) {
      paymentManagement.deletePayment(paymentToDelete);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(paymentsData?.payments?.map(p => p.id) || []);
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, id]);
    } else {
      setSelectedPayments(selectedPayments.filter(paymentId => paymentId !== id));
    }
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
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
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pagamentos do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(paymentsData?.stats?.totalConfirmed || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Confirmados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(paymentsData?.stats?.totalPending || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(paymentsData?.stats?.totalRefunded || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Estornados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {paymentsData?.stats?.totalCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por referência, paciente ou fatura..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="refunded">Estornado</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.method || 'all'}
                onValueChange={(value) => handleFilterChange('method', value)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Métodos</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="bank_transfer">Transferência</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
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

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Pagamentos</CardTitle>
              <CardDescription>
                {paymentsData?.total || 0} pagamentos encontrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-red-600">
              Erro ao carregar pagamentos: {error.message}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedPayments.length === paymentsData?.payments?.length && paymentsData?.payments?.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-4 font-medium">Referência</th>
                    <th className="p-4 font-medium">Fatura</th>
                    <th className="p-4 font-medium">Paciente</th>
                    <th className="p-4 font-medium">Valor</th>
                    <th className="p-4 font-medium">Método</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Data</th>
                    <th className="p-4 font-medium w-16">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span>Carregando pagamentos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paymentsData?.payments?.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center space-y-2">
                          <CreditCard className="h-12 w-12 text-muted-foreground/50" />
                          <p>Nenhum pagamento encontrado</p>
                          <p className="text-sm">Tente ajustar os filtros ou registrar um novo pagamento</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paymentsData?.payments?.map((payment) => {
                      const MethodIcon = getMethodIcon(payment.method);
                      return (
                        <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedPayments.includes(payment.id)}
                              onChange={(e) => handleSelectPayment(payment.id, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{payment.reference}</div>
                            {payment.notes && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {payment.notes}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{payment.invoiceNumber}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{payment.patientName}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <MethodIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{getMethodLabel(payment.method)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDateTime(payment.paymentDate)}</span>
                            </div>
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
                                  onClick={() => paymentManagement.generatePaymentReceipt({ id: payment.id })}
                                  disabled={paymentManagement.isGeneratingReceipt}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Gerar Recibo
                                </DropdownMenuItem>
                                {payment.status === 'pending' && (
                                  <DropdownMenuItem
                                    onClick={() => paymentManagement.confirmPayment({ id: payment.id })}
                                    disabled={paymentManagement.isConfirmingPayment}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirmar
                                  </DropdownMenuItem>
                                )}
                                {payment.status === 'confirmed' && (
                                  <DropdownMenuItem
                                    onClick={() => paymentManagement.refundPayment({ id: payment.id })}
                                    disabled={paymentManagement.isRefundingPayment}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Estornar
                                  </DropdownMenuItem>
                                )}
                                {(payment.status === 'pending' || payment.status === 'failed') && (
                                  <DropdownMenuItem
                                    onClick={() => paymentManagement.cancelPayment({ id: payment.id })}
                                    disabled={paymentManagement.isCancellingPayment}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeletePayment(payment.id)}
                                  disabled={paymentManagement.isDeletingPayment}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {paymentsData && paymentsData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, paymentsData.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {paymentsData.totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(paymentsData.totalPages, currentPage + 1))}
                  className={currentPage === paymentsData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={paymentManagement.isDeletingPayment}
            >
              {paymentManagement.isDeletingPayment ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Payments;