import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, FileText, DollarSign, Clock, User, Stethoscope, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAppointmentBilling } from '@/hooks/useAppointmentBilling';
import { useInvoiceManagement } from '@/hooks/useInvoiceManagement';
import { Appointment } from '@/types/appointments';
import { InvoiceCreate } from '@/types/billing';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { toast } from 'sonner';

interface AppointmentBillingProps {
  patientId?: number;
  doctorId?: number;
  dateRange?: {
    from: string;
    to: string;
  };
}

export function AppointmentBilling({ patientId, doctorId, dateRange }: AppointmentBillingProps) {
  const [selectedAppointments, setSelectedAppointments] = useState<number[]>([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<Partial<InvoiceCreate>>({});
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const {
    unbilledAppointments,
    billedAppointments,
    billingStats,
    generateInvoiceFromAppointment,
    generateBulkInvoice,
    markAsNonBillable,
    isLoading
  } = useAppointmentBilling({ patientId, doctorId, dateRange });

  const { createInvoice } = useInvoiceManagement();

  const handleSelectAppointment = (appointmentId: number, checked: boolean) => {
    if (checked) {
      setSelectedAppointments(prev => [...prev, appointmentId]);
    } else {
      setSelectedAppointments(prev => prev.filter(id => id !== appointmentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppointments(unbilledAppointments?.map(apt => apt.id) || []);
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleGenerateSingleInvoice = async (appointment: Appointment) => {
    try {
      await generateInvoiceFromAppointment.mutateAsync(appointment.id);
      toast.success('Fatura gerada com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar fatura');
    }
  };

  const handleGenerateBulkInvoice = async () => {
    if (selectedAppointments.length === 0) {
      toast.error('Selecione pelo menos um agendamento');
      return;
    }

    try {
      setIsGeneratingInvoice(true);
      await generateBulkInvoice.mutateAsync(selectedAppointments);
      setSelectedAppointments([]);
      toast.success(`${selectedAppointments.length} faturas geradas com sucesso!`);
    } catch (error) {
      toast.error('Erro ao gerar faturas em lote');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleMarkAsNonBillable = async (appointmentId: number, reason: string) => {
    try {
      await markAsNonBillable.mutateAsync({ appointmentId, reason });
      toast.success('Agendamento marcado como não faturável');
    } catch (error) {
      toast.error('Erro ao marcar como não faturável');
    }
  };

  const calculateSelectedTotal = () => {
    if (!unbilledAppointments) return 0;
    return selectedAppointments.reduce((total, appointmentId) => {
      const appointment = unbilledAppointments.find(apt => apt.id === appointmentId);
      return total + (appointment?.procedure?.price || 0);
    }, 0);
  };

  const getStatusBadge = (appointment: Appointment) => {
    if (appointment.is_billed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Faturado</Badge>;
    }
    if (appointment.is_non_billable) {
      return <Badge variant="secondary">Não Faturável</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando agendamentos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas de Faturamento */}
      {billingStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total de Agendamentos</p>
                  <p className="text-2xl font-bold">{billingStats.total_appointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Faturados</p>
                  <p className="text-2xl font-bold">{billingStats.billed_appointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Pendentes</p>
                  <p className="text-2xl font-bold">{billingStats.unbilled_appointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Receita Pendente</p>
                  <p className="text-2xl font-bold">{formatCurrency(billingStats.pending_revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agendamentos Não Faturados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Agendamentos Pendentes de Faturamento</span>
            </CardTitle>
            {unbilledAppointments && unbilledAppointments.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBulkInvoice}
                  disabled={selectedAppointments.length === 0 || isGeneratingInvoice}
                >
                  {isGeneratingInvoice ? 'Gerando...' : `Gerar ${selectedAppointments.length} Faturas`}
                </Button>
                <span className="text-sm text-gray-600">
                  Total: {formatCurrency(calculateSelectedTotal())}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {unbilledAppointments && unbilledAppointments.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedAppointments.length === unbilledAppointments.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  Selecionar todos ({unbilledAppointments.length} agendamentos)
                </Label>
              </div>
              <Separator />
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {unbilledAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`appointment-${appointment.id}`}
                        checked={selectedAppointments.includes(appointment.id)}
                        onCheckedChange={(checked) => handleSelectAppointment(appointment.id, checked as boolean)}
                      />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{appointment.patient?.name}</span>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{appointment.doctor?.name}</span>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.procedure?.name}</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatTime(appointment.start_time)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{formatCurrency(appointment.procedure?.price || 0)}</p>
                            {getStatusBadge(appointment)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleGenerateSingleInvoice(appointment)}
                              disabled={generateInvoiceFromAppointment.isPending}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Faturar
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <X className="h-4 w-4 mr-1" />
                                  Não Faturar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Marcar como Não Faturável</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="reason">Motivo</Label>
                                    <Textarea
                                      id="reason"
                                      placeholder="Informe o motivo para não faturar este agendamento..."
                                      onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancelar</Button>
                                    <Button
                                      onClick={() => handleMarkAsNonBillable(appointment.id, invoiceData.notes || '')}
                                    >
                                      Confirmar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Todos os agendamentos foram faturados</h3>
              <p className="text-gray-600">Não há agendamentos pendentes de faturamento no momento.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agendamentos Já Faturados */}
      {billedAppointments && billedAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Agendamentos Faturados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {billedAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{appointment.patient?.name}</p>
                        <p className="text-sm text-gray-600">{appointment.procedure?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm">{formatDate(appointment.appointment_date)}</p>
                        <p className="text-sm text-gray-600">{formatTime(appointment.start_time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">{formatCurrency(appointment.procedure?.price || 0)}</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Faturado
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}