import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Calendar, Clock, User, Phone,
  MoreHorizontal, Edit, Trash2, Eye, CheckCircle, X,
  UserCheck, UserX, Play, Square, Download, RefreshCw,
  ChevronLeft, ChevronRight, SortAsc, SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import AppointmentCard from '../components/appointments/AppointmentCard';
import { useAppointments } from '../hooks/useAppointments';
import { Appointment, AppointmentFilters } from '../types/appointments';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AppointmentsListProps {
  className?: string;
}

type ViewMode = 'table' | 'cards' | 'calendar';
type SortField = 'appointmentDate' | 'patientName' | 'doctorName' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function AppointmentsList({ className }: AppointmentsListProps) {
  const navigate = useNavigate();
  const { 
    appointments, 
    isLoading, 
    searchAppointments,
    cancelAppointment,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    markNoShow,
    deleteAppointment,
    exportAppointments
  } = useAppointments();
  
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: [],
    doctor_id: undefined,
    patient_id: undefined,
    date_from: undefined,
    date_to: undefined,
    appointment_type: '',
    search: ''
  });
  const [sortField, setSortField] = useState<SortField>('appointmentDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedAppointments, setSelectedAppointments] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filtrar e ordenar agendamentos
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = appointments || [];
    
    // Aplicar busca por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patient?.name?.toLowerCase().includes(term) ||
        appointment.doctor?.name?.toLowerCase().includes(term) ||
        appointment.appointmentType?.toLowerCase().includes(term) ||
        appointment.notes?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtros
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(appointment => 
        filters.status!.includes(appointment.status)
      );
    }
    
    if (filters.doctor_id) {
      filtered = filtered.filter(appointment => 
        appointment.doctor_id === filters.doctor_id
      );
    }
    
    if (filters.patient_id) {
      filtered = filtered.filter(appointment => 
        appointment.patient_id === filters.patient_id
      );
    }
    
    if (filters.date_from) {
      filtered = filtered.filter(appointment => 
        new Date(appointment.appointment_date) >= new Date(filters.date_from!)
      );
    }
    
    if (filters.date_to) {
      filtered = filtered.filter(appointment => 
        new Date(appointment.appointment_date) <= new Date(filters.date_to!)
      );
    }
    
    if (filters.appointment_type) {
      filtered = filtered.filter(appointment => 
        appointment.appointment_type === filters.appointment_type
      );
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'appointmentDate':
          aValue = new Date(a.appointment_date);
          bValue = new Date(b.appointment_date);
          break;
        case 'patientName':
          aValue = a.patient?.name || '';
          bValue = b.patient?.name || '';
          break;
        case 'doctorName':
          aValue = a.doctor?.name || '';
          bValue = b.doctor?.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || '');
          bValue = new Date(b.createdAt || '');
          break;
        default:
          aValue = a.appointment_date;
          bValue = b.appointment_date;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [appointments, searchTerm, filters, sortField, sortOrder]);
  
  // Paginação
  const totalPages = Math.ceil(filteredAndSortedAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAndSortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppointments(paginatedAppointments.map(a => a.id));
    } else {
      setSelectedAppointments([]);
    }
  };
  
  const handleSelectAppointment = (appointmentId: number, checked: boolean) => {
    if (checked) {
      setSelectedAppointments(prev => [...prev, appointmentId]);
    } else {
      setSelectedAppointments(prev => prev.filter(id => id !== appointmentId));
    }
  };
  
  const handleBulkAction = async (action: string) => {
    if (selectedAppointments.length === 0) {
      toast.error('Selecione pelo menos um agendamento');
      return;
    }
    
    try {
      const promises = selectedAppointments.map(id => {
        switch (action) {
          case 'confirm':
            return confirmAppointment(id);
          case 'cancel':
            return cancelAppointment(id);
          case 'delete':
            return deleteAppointment(id);
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      setSelectedAppointments([]);
      
      const actionText = {
        confirm: 'confirmados',
        cancel: 'cancelados',
        delete: 'excluídos'
      }[action] || 'processados';
      
      toast.success(`${selectedAppointments.length} agendamentos ${actionText} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao processar agendamentos selecionados');
    }
  };
  
  const handleStatusChange = async (appointmentId: number, action: string) => {
    try {
      switch (action) {
        case 'confirm':
          await confirmAppointment(appointmentId);
          toast.success('Agendamento confirmado!');
          break;
        case 'start':
          await startAppointment(appointmentId);
          toast.success('Consulta iniciada!');
          break;
        case 'complete':
          await completeAppointment(appointmentId);
          toast.success('Consulta finalizada!');
          break;
        case 'no-show':
          await markNoShow(appointmentId);
          toast.success('Marcado como falta!');
          break;
        case 'cancel':
          await cancelAppointment(appointmentId);
          toast.success('Agendamento cancelado!');
          break;
      }
    } catch (error) {
      toast.error('Erro ao atualizar status do agendamento');
    }
  };
  
  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      await deleteAppointment(appointmentToDelete);
      toast.success('Agendamento excluído com sucesso!');
      setShowDeleteDialog(false);
      setAppointmentToDelete(null);
    } catch (error) {
      toast.error('Erro ao excluir agendamento');
    }
  };
  
  const handleExport = async () => {
    try {
      await exportAppointments(filters);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };
  
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
      rescheduled: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  
  const getStatusText = (status: string) => {
    const texts = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Faltou',
      rescheduled: 'Reagendado'
    };
    return texts[status as keyof typeof texts] || status;
  };
  
  const getAvailableActions = (appointment: Appointment) => {
    const actions = [];
    
    switch (appointment.status) {
      case 'scheduled':
        actions.push(
          { id: 'confirm', label: 'Confirmar', icon: CheckCircle },
          { id: 'cancel', label: 'Cancelar', icon: X }
        );
        break;
      case 'confirmed':
        actions.push(
          { id: 'start', label: 'Iniciar', icon: Play },
          { id: 'no-show', label: 'Falta', icon: UserX },
          { id: 'cancel', label: 'Cancelar', icon: X }
        );
        break;
      case 'in_progress':
        actions.push(
          { id: 'complete', label: 'Finalizar', icon: Square }
        );
        break;
    }
    
    return actions;
  };
  
  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString('pt-BR'),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };
  
  const clearFilters = () => {
    setFilters({
      status: [],
      doctor_id: undefined,
      patient_id: undefined,
      date_from: undefined,
      date_to: undefined,
      appointment_type: '',
      search: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendamentos</h1>
              <p className="text-gray-600">
                {filteredAndSortedAppointments.length} agendamento{filteredAndSortedAppointments.length !== 1 ? 's' : ''} encontrado{filteredAndSortedAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={filteredAndSortedAppointments.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button onClick={() => navigate('/appointments/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>
          
          {/* Barra de busca e filtros */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por paciente, médico, tipo de consulta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-blue-50 text-blue-600' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Tabela</SelectItem>
                  <SelectItem value="cards">Cards</SelectItem>
                  <SelectItem value="calendar">Calendário</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Painel de filtros */}
          {showFilters && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Status
                    </label>
                    <Select
                      value={filters.status?.[0] || ''}
                      onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, status: value ? [value] : [] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os status</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="no_show">Faltou</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Data Inicial
                    </label>
                    <DatePicker
                      date={filters.date_from}
                      onDateChange={(date) => 
                        setFilters(prev => ({ ...prev, date_from: date }))
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Data Final
                    </label>
                    <DatePicker
                      date={filters.date_to}
                      onDateChange={(date) => 
                        setFilters(prev => ({ ...prev, date_to: date }))
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tipo de Consulta
                    </label>
                    <Select
                      value={filters.appointment_type || ''}
                      onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, appointment_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os tipos</SelectItem>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="retorno">Retorno</SelectItem>
                        <SelectItem value="exame">Exame</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Ações em lote */}
          {selectedAppointments.length > 0 && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {selectedAppointments.length} agendamento{selectedAppointments.length !== 1 ? 's' : ''} selecionado{selectedAppointments.length !== 1 ? 's' : ''}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('confirm')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('cancel')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Conteúdo principal */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando agendamentos...</p>
            </div>
          </div>
        ) : filteredAndSortedAppointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro agendamento.'}
              </p>
              <Button onClick={() => navigate('/appointments/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'table' && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <Checkbox
                              checked={selectedAppointments.length === paginatedAppointments.length}
                              onCheckedChange={handleSelectAll}
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('appointmentDate')}
                              className="flex items-center space-x-1 hover:text-gray-700"
                            >
                              <span>Data/Hora</span>
                              {sortField === 'appointmentDate' && (
                                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('patientName')}
                              className="flex items-center space-x-1 hover:text-gray-700"
                            >
                              <span>Paciente</span>
                              {sortField === 'patientName' && (
                                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('doctorName')}
                              className="flex items-center space-x-1 hover:text-gray-700"
                            >
                              <span>Médico</span>
                              {sortField === 'doctorName' && (
                                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort('status')}
                              className="flex items-center space-x-1 hover:text-gray-700"
                            >
                              <span>Status</span>
                              {sortField === 'status' && (
                                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedAppointments.map((appointment) => {
                          const dateTime = formatDateTime(appointment.appointment_date);
                          const actions = getAvailableActions(appointment);
                          
                          return (
                            <tr key={appointment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <Checkbox
                                  checked={selectedAppointments.includes(appointment.id)}
                                  onCheckedChange={(checked) => 
                                    handleSelectAppointment(appointment.id, checked as boolean)
                                  }
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{dateTime.date}</div>
                                <div className="text-sm text-gray-500">{dateTime.time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage src="" />
                                    <AvatarFallback>
                                      {appointment.patient?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {appointment.patient?.name || 'Nome não informado'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {appointment.patient?.phone || 'Telefone não informado'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage src="" />
                                    <AvatarFallback>
                                      {appointment.doctor?.name?.split(' ').map(n => n[0]).join('') || 'M'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      Dr. {appointment.doctor?.name || 'Nome não informado'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {appointment.doctor?.specialty || 'Especialidade não informada'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {appointment.appointment_type || 'Não especificado'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getStatusColor(appointment.status)}>
                                  {getStatusText(appointment.status)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {actions.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                          <DropdownMenuItem
                                            key={action.id}
                                            onClick={() => handleStatusChange(appointment.id, action.id)}
                                          >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {action.label}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                      {actions.length > 0 && <DropdownMenuSeparator />}
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setAppointmentToDelete(appointment.id);
                                          setShowDeleteDialog(true);
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="detailed"
                    onEdit={() => navigate(`/appointments/${appointment.id}/edit`)}
                    onView={() => navigate(`/appointments/${appointment.id}`)}
                    onCancel={() => handleStatusChange(appointment.id, 'cancel')}
                    onConfirm={() => handleStatusChange(appointment.id, 'confirm')}
                    onStart={() => handleStatusChange(appointment.id, 'start')}
                    onComplete={() => handleStatusChange(appointment.id, 'complete')}
                    onDelete={() => {
                      setAppointmentToDelete(appointment.id);
                      setShowDeleteDialog(true);
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedAppointments.length)} de{' '}
                    {filteredAndSortedAppointments.length} resultados
                  </span>
                  
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Agendamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Atenção!</strong> Esta ação é irreversível. O agendamento será permanentemente excluído do sistema.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setAppointmentToDelete(null);
                }}
              >
                Cancelar
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Permanentemente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AppointmentsList;