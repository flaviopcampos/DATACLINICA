import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DatePickerWithRange } from '../../components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar, FileText, DollarSign, Users, Stethoscope, Filter, Download } from 'lucide-react';
import { AppointmentBilling } from '../components/AppointmentBilling';
import { useAppointmentBilling } from '../hooks/useAppointmentBilling';
import { useDoctors } from '../hooks/useDoctors';
import { usePatients } from '../hooks/usePatients';
import { formatCurrency } from '../utils/formatters';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AppointmentBillingPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');

  const { doctors } = useDoctors();
  const { patients } = usePatients();
  
  const {
    billingStats,
    isLoading: isLoadingStats
  } = useAppointmentBilling({
    doctorId: selectedDoctor ? parseInt(selectedDoctor) : undefined,
    patientId: selectedPatient ? parseInt(selectedPatient) : undefined,
    dateRange: dateRange ? {
      from: format(dateRange.from!, 'yyyy-MM-dd'),
      to: format(dateRange.to!, 'yyyy-MM-dd')
    } : undefined
  });

  const handleExportReport = async () => {
    // Implementar exportação de relatório
    console.log('Exportando relatório de faturamento...');
  };

  const clearFilters = () => {
    setSelectedDoctor('');
    setSelectedPatient('');
    setDateRange({
      from: addDays(new Date(), -30),
      to: new Date()
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integração Agendamentos & Faturamento</h1>
          <p className="text-gray-600 mt-2">
            Gerencie o faturamento dos seus agendamentos de forma integrada
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="doctor-select">Médico</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger id="doctor-select">
                  <SelectValue placeholder="Todos os médicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os médicos</SelectItem>
                  {doctors?.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="patient-select">Paciente</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger id="patient-select">
                  <SelectValue placeholder="Todos os pacientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os pacientes</SelectItem>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Período</Label>
              <DatePickerWithRange
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                placeholder="Selecione o período"
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      {billingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
                  <p className="text-2xl font-bold">{billingStats.total_appointments}</p>
                  <p className="text-xs text-gray-500">
                    Taxa de faturamento: {billingStats.billing_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Agendamentos Faturados</p>
                  <p className="text-2xl font-bold">{billingStats.billed_appointments}</p>
                  <p className="text-xs text-green-600">
                    Receita: {formatCurrency(billingStats.total_revenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes de Faturamento</p>
                  <p className="text-2xl font-bold">{billingStats.unbilled_appointments}</p>
                  <p className="text-xs text-orange-600">
                    Receita pendente: {formatCurrency(billingStats.pending_revenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Não Faturáveis</p>
                  <p className="text-2xl font-bold">{billingStats.non_billable_appointments}</p>
                  <p className="text-xs text-gray-500">
                    Faturáveis: {billingStats.billable_appointments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="billed">Faturados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AppointmentBilling
            patientId={selectedPatient ? parseInt(selectedPatient) : undefined}
            doctorId={selectedDoctor ? parseInt(selectedDoctor) : undefined}
            dateRange={dateRange ? {
              from: format(dateRange.from!, 'yyyy-MM-dd'),
              to: format(dateRange.to!, 'yyyy-MM-dd')
            } : undefined}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Pendentes de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentBilling
                patientId={selectedPatient ? parseInt(selectedPatient) : undefined}
                doctorId={selectedDoctor ? parseInt(selectedDoctor) : undefined}
                dateRange={dateRange ? {
                  from: format(dateRange.from!, 'yyyy-MM-dd'),
                  to: format(dateRange.to!, 'yyyy-MM-dd')
                } : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Já Faturados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Histórico de Faturamento</h3>
                <p className="text-gray-600">
                  Visualize todos os agendamentos que já foram faturados no período selecionado.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AppointmentBillingPage;