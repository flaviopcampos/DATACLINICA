import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  CreditCard,
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
  AlertCircle
} from 'lucide-react';
import { useBillingStats, useOverdueReport } from '@/hooks/useBilling';
import { useInvoices, useInvoiceManagement } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import type { InvoiceFilters, PaymentFilters } from '@/types/billing';

function Billing() {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoiceFilters, setInvoiceFilters] = useState<InvoiceFilters>({});
  const [paymentFilters, setPaymentFilters] = useState<PaymentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // Hooks para dados
  const { data: stats, isLoading: statsLoading } = useBillingStats();
  const { data: overdueReport } = useOverdueReport();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices(1, 10, invoiceFilters);
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments(1, 10, paymentFilters);
  
  const invoiceManagement = useInvoiceManagement();

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
      paid: { label: 'Pago', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      overdue: { label: 'Vencido', variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' },
      cancelled: { label: 'Cancelado', variant: 'outline' as const, icon: XCircle, color: 'text-gray-600' },
      draft: { label: 'Rascunho', variant: 'outline' as const, icon: FileText, color: 'text-gray-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faturamento</h1>
          <p className="text-muted-foreground">
            Gerencie faturas, pagamentos e relatórios financeiros
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.pendingInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.pendingAmount || 0)} em aberto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statsLoading ? '...' : stats?.overdueInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.overdueAmount || 0)} em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Hoje</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.paymentsToday || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.paymentsAmountToday || 0)} recebidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Faturas Recentes</CardTitle>
                <CardDescription>
                  Últimas faturas criadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoicesLoading ? (
                    <div className="text-center py-4">Carregando...</div>
                  ) : (
                    invoicesData?.invoices?.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.patientName} • {formatDate(invoice.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Recentes</CardTitle>
                <CardDescription>
                  Últimos pagamentos recebidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentsLoading ? (
                    <div className="text-center py-4">Carregando...</div>
                  ) : (
                    paymentsData?.payments?.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{payment.reference}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.paymentMethod} • {formatDate(payment.paymentDate)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar faturas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select
                  value={invoiceFilters.status || ''}
                  onValueChange={(value) => setInvoiceFilters({ ...invoiceFilters, status: value || undefined })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
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
                    >
                      Marcar como Pago
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('send_reminder')}
                    >
                      Enviar Lembrete
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkAction('cancel')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoices List */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices(invoicesData?.invoices?.map(i => i.id) || []);
                            } else {
                              setSelectedInvoices([]);
                            }
                          }}
                        />
                      </th>
                      <th className="p-4 font-medium">Número</th>
                      <th className="p-4 font-medium">Paciente</th>
                      <th className="p-4 font-medium">Valor</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Vencimento</th>
                      <th className="p-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesLoading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          Carregando faturas...
                        </td>
                      </tr>
                    ) : (
                      invoicesData?.invoices?.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInvoices([...selectedInvoices, invoice.id]);
                                } else {
                                  setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                                }
                              }}
                            />
                          </td>
                          <td className="p-4 font-medium">{invoice.invoiceNumber}</td>
                          <td className="p-4">{invoice.patientName}</td>
                          <td className="p-4">{formatCurrency(invoice.totalAmount)}</td>
                          <td className="p-4">{getStatusBadge(invoice.status)}</td>
                          <td className="p-4">{formatDate(invoice.dueDate)}</td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
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
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Enviar Email
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteInvoice(invoice.id)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos</CardTitle>
              <CardDescription>
                Histórico de pagamentos recebidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Lista de pagamentos será implementada aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Relatórios detalhados de faturamento e inadimplência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Relatórios financeiros serão implementados aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Billing;