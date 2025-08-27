import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Filter, Search, Download, Bell, Clock, Users, TrendingUp } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { useCalendar } from '../hooks/useCalendar';
import { useNotifications } from '../hooks/useNotifications';
import { CalendarView, AppointmentFilters } from '../types/appointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function Appointments() {
  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<CalendarView>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: [],
    doctorIds: [],
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    patientName: '',
    appointmentType: []
  });

  // Hooks
  const {
    appointments,
    stats,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    searchAppointments,
    exportAppointments
  } = useAppointments({ filters });

  const {
    currentDate,
    view,
    events,
    isLoadingEvents,
    goToToday,
    goToPrevious,
    goToNext,
    setView,
    getCalendarTitle,
    refresh: refreshCalendar
  } = useCalendar({
    initialView: selectedView,
    autoRefresh: true
  });

  const {
    notifications,
    unreadCount,
    hasUnreadNotifications
  } = useNotifications({
    autoRefresh: true
  });

  // Dados computados
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    
    let filtered = appointments;
    
    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [appointments, searchTerm]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredAppointments.filter(apt => 
      apt.appointment_date.startsWith(today)
    );
  }, [filteredAppointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate > today && aptDate <= nextWeek;
    });
  }, [filteredAppointments]);

  // Handlers
  const handleSearch = async (term: string) => {
    if (term.trim()) {
      try {
        await searchAppointments(term);
      } catch (error) {
        toast.error('Erro ao buscar agendamentos');
      }
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      await exportAppointments(filteredAppointments, format);
      toast.success(`Relatório exportado em ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const handleViewChange = (newView: CalendarView) => {
    setSelectedView(newView);
    setView(newView);
  };

  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800'
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
      no_show: 'Faltou'
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (appointmentsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar agendamentos</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie consultas, horários e disponibilidade médica
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasUnreadNotifications() && (
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Select value="pdf" onValueChange={(value) => handleExport(value as 'pdf' | 'excel')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Exportar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.filter(apt => apt.status === 'confirmed').length} confirmados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Próximos 7 dias
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedAppointments || 0} concluídos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Comparecimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendanceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status?.[0] || ''}
                  onValueChange={(value) => handleFilterChange('status', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Data Início</label>
                <Input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Data Fim</label>
                <Input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Paciente</label>
                <Input
                  placeholder="Nome do paciente"
                  value={filters.patientName || ''}
                  onChange={(e) => handleFilterChange('patientName', e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    status: [],
                    doctorIds: [],
                    dateRange: {
                      start: new Date().toISOString().split('T')[0],
                      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    },
                    patientName: '',
                    appointmentType: []
                  })}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por paciente, médico ou observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => handleSearch(searchTerm)}
          disabled={!searchTerm.trim()}
        >
          Buscar
        </Button>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="today">Hoje</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          {/* Controles do Calendário */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={goToPrevious}>
                &#8249;
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {getCalendarTitle()}
              </h2>
              <Button variant="outline" onClick={goToNext}>
                &#8250;
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Hoje
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={view} onValueChange={handleViewChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={refreshCalendar}>
                Atualizar
              </Button>
            </div>
          </div>
          
          {/* Calendário */}
          <Card>
            <CardContent className="p-6">
              {isLoadingEvents ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando calendário...</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Componente de calendário será implementado</p>
                  <p className="text-sm mt-2">{events?.length || 0} eventos encontrados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">Nenhum agendamento encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.slice(0, 10).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{appointment.patient?.name || 'Paciente não informado'}</p>
                            <p className="text-sm text-gray-600">
                              {appointment.doctor?.name || 'Médico não informado'} • 
                              {new Date(appointment.appointment_date).toLocaleString('pt-BR')}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                        
                        {appointment.price && (
                          <span className="text-sm font-medium text-green-600">
                            R$ {appointment.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredAppointments.length > 10 && (
                    <div className="text-center pt-4">
                      <Button variant="outline">
                        Carregar mais ({filteredAppointments.length - 10} restantes)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos de Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">Nenhum agendamento para hoje</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="font-medium">{appointment.patient?.name || 'Paciente não informado'}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} • {appointment.doctor?.name || 'Médico não informado'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Appointments;