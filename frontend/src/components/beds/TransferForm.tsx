'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRightLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  User,
  Bed,
  Building2,
  Stethoscope,
  FileText,
  Truck,
  Shield,
  Heart,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTransfers } from '@/hooks/useTransfers';
import { useBeds } from '@/hooks/useBeds';
import { toast } from 'sonner';

const transferSchema = z.object({
  patientId: z.string().min(1, 'Selecione um paciente'),
  fromBedId: z.string().min(1, 'Leito de origem é obrigatório'),
  toBedId: z.string().min(1, 'Leito de destino é obrigatório'),
  transferDate: z.date({
    required_error: 'Data da transferência é obrigatória'
  }),
  transferTime: z.string().min(1, 'Horário da transferência é obrigatório'),
  transferType: z.enum(['internal', 'external', 'emergency', 'planned'], {
    required_error: 'Tipo de transferência é obrigatório'
  }),
  transferReason: z.string().min(1, 'Motivo da transferência é obrigatório'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Prioridade é obrigatória'
  }),
  requestedBy: z.string().min(1, 'Solicitante é obrigatório'),
  approvedBy: z.string().optional(),
  transportType: z.enum(['walking', 'wheelchair', 'stretcher', 'ambulance'], {
    required_error: 'Tipo de transporte é obrigatório'
  }),
  medicalEscort: z.boolean().default(false),
  escortType: z.enum(['nurse', 'doctor', 'technician']).optional(),
  equipmentNeeded: z.array(z.string()).default([]),
  specialPrecautions: z.string().optional(),
  clinicalCondition: z.string().min(1, 'Condição clínica é obrigatória'),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    temperature: z.string().optional(),
    oxygenSaturation: z.string().optional(),
    respiratoryRate: z.string().optional()
  }).optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  isolationPrecautions: z.boolean().default(false),
  isolationType: z.enum(['contact', 'droplet', 'airborne', 'protective']).optional(),
  familyNotified: z.boolean().default(false),
  familyContact: z.string().optional(),
  estimatedDuration: z.string().optional(),
  returnScheduled: z.boolean().default(false),
  returnDate: z.date().optional(),
  returnTime: z.string().optional(),
  notes: z.string().optional(),
  documents: z.array(z.string()).default([]),
  costCenter: z.string().optional(),
  insurance: z.string().optional()
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedPatientId?: string;
  preselectedFromBedId?: string;
  className?: string;
}

const transferTypes = [
  { value: 'internal', label: 'Transferência Interna', color: 'bg-blue-100 text-blue-800' },
  { value: 'external', label: 'Transferência Externa', color: 'bg-purple-100 text-purple-800' },
  { value: 'emergency', label: 'Emergência', color: 'bg-red-100 text-red-800' },
  { value: 'planned', label: 'Planejada', color: 'bg-green-100 text-green-800' }
];

const priorities = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

const transportTypes = [
  { value: 'walking', label: 'Caminhando', icon: User },
  { value: 'wheelchair', label: 'Cadeira de Rodas', icon: User },
  { value: 'stretcher', label: 'Maca', icon: Bed },
  { value: 'ambulance', label: 'Ambulância', icon: Truck }
];

const escortTypes = [
  { value: 'nurse', label: 'Enfermeiro(a)' },
  { value: 'doctor', label: 'Médico(a)' },
  { value: 'technician', label: 'Técnico(a)' }
];

const isolationTypes = [
  { value: 'contact', label: 'Contato' },
  { value: 'droplet', label: 'Gotículas' },
  { value: 'airborne', label: 'Aerossóis' },
  { value: 'protective', label: 'Proteção' }
];

const equipmentOptions = [
  'Monitor Cardíaco',
  'Oxímetro',
  'Bomba de Infusão',
  'Ventilador Portátil',
  'Cilindro de Oxigênio',
  'Desfibrilador',
  'Aspirador Portátil',
  'Cadeira de Rodas',
  'Maca de Transporte',
  'Kit de Emergência'
];

const documentTypes = [
  'Prontuário Médico',
  'Exames Laboratoriais',
  'Exames de Imagem',
  'Prescrição Médica',
  'Relatório de Enfermagem',
  'Termo de Consentimento',
  'Guia de Transferência',
  'Relatório de Sinais Vitais'
];

// Mock data para pacientes internados
const mockPatients = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    currentBed: { id: '101', number: '101', department: 'Enfermaria A' },
    diagnosis: 'Pneumonia',
    condition: 'Estável'
  },
  {
    id: '2',
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    currentBed: { id: '205', number: '205', department: 'UTI' },
    diagnosis: 'Infarto Agudo do Miocárdio',
    condition: 'Crítico'
  }
];

// Mock data para leitos disponíveis
const mockAvailableBeds = [
  { id: '102', number: '102', department: 'Enfermaria A', type: 'Enfermaria', status: 'available' },
  { id: '103', number: '103', department: 'Enfermaria B', type: 'Enfermaria', status: 'available' },
  { id: '301', number: '301', department: 'UTI', type: 'UTI', status: 'available' },
  { id: '302', number: '302', department: 'UTI', type: 'UTI', status: 'available' },
  { id: '401', number: '401', department: 'Cardiologia', type: 'Especializada', status: 'available' }
];

export function TransferForm({ 
  onSuccess, 
  onCancel, 
  preselectedPatientId,
  preselectedFromBedId,
  className 
}: TransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  const { createTransfer } = useTransfers();
  
  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      patientId: preselectedPatientId || '',
      fromBedId: preselectedFromBedId || '',
      transferDate: new Date(),
      transferTime: format(new Date(), 'HH:mm'),
      medicalEscort: false,
      equipmentNeeded: [],
      isolationPrecautions: false,
      familyNotified: false,
      returnScheduled: false,
      documents: []
    }
  });

  const selectedPatientId = form.watch('patientId');
  const selectedFromBedId = form.watch('fromBedId');
  const selectedToBedId = form.watch('toBedId');
  const medicalEscort = form.watch('medicalEscort');
  const isolationPrecautions = form.watch('isolationPrecautions');
  const returnScheduled = form.watch('returnScheduled');
  const transferType = form.watch('transferType');
  const priority = form.watch('priority');

  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);
  const selectedFromBed = mockAvailableBeds.find(b => b.id === selectedFromBedId) || selectedPatient?.currentBed;
  const selectedToBed = mockAvailableBeds.find(b => b.id === selectedToBedId);

  const handleEquipmentToggle = (equipment: string) => {
    const updatedEquipment = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter(e => e !== equipment)
      : [...selectedEquipment, equipment];
    
    setSelectedEquipment(updatedEquipment);
    form.setValue('equipmentNeeded', updatedEquipment);
  };

  const handleDocumentToggle = (document: string) => {
    const updatedDocs = selectedDocuments.includes(document)
      ? selectedDocuments.filter(d => d !== document)
      : [...selectedDocuments, document];
    
    setSelectedDocuments(updatedDocs);
    form.setValue('documents', updatedDocs);
  };

  const onSubmit = async (data: TransferFormData) => {
    setIsSubmitting(true);
    try {
      await createTransfer({
        ...data,
        transferDateTime: new Date(`${format(data.transferDate, 'yyyy-MM-dd')}T${data.transferTime}`),
        returnDateTime: data.returnScheduled && data.returnDate && data.returnTime 
          ? new Date(`${format(data.returnDate, 'yyyy-MM-dd')}T${data.returnTime}`)
          : undefined
      });
      
      toast.success('Transferência solicitada com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao solicitar transferência:', error);
      toast.error('Erro ao solicitar transferência. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5" />
            <span>Solicitação de Transferência</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Seleção de Paciente */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockPatients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex flex-col">
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.cpf} | Leito {patient.currentBed.number} | {patient.diagnosis}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPatient && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold text-blue-900">{selectedPatient.name}</div>
                      <div className="text-sm text-blue-700">CPF: {selectedPatient.cpf}</div>
                      <div className="text-sm text-blue-700">Condição: {selectedPatient.condition}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700">
                        Leito Atual: {selectedPatient.currentBed.number} ({selectedPatient.currentBed.department})
                      </div>
                      <div className="text-sm text-blue-700">
                        Diagnóstico: {selectedPatient.diagnosis}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leitos de Origem e Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromBedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leito de Origem</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!!selectedPatient}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Leito atual" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedPatient ? (
                            <SelectItem value={selectedPatient.currentBed.id}>
                              Leito {selectedPatient.currentBed.number} - {selectedPatient.currentBed.department}
                            </SelectItem>
                          ) : (
                            mockAvailableBeds.map(bed => (
                              <SelectItem key={bed.id} value={bed.id}>
                                Leito {bed.number} - {bed.department}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toBedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leito de Destino</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o leito de destino" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockAvailableBeds
                            .filter(bed => bed.id !== selectedFromBedId)
                            .map(bed => (
                              <SelectItem key={bed.id} value={bed.id}>
                                <div className="flex flex-col">
                                  <div>Leito {bed.number} - {bed.department}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Tipo: {bed.type}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedFromBed && selectedToBed && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="font-semibold text-green-900">
                        Leito {selectedFromBed.number}
                      </div>
                      <div className="text-sm text-green-700">
                        {selectedFromBed.department}
                      </div>
                    </div>
                    <ArrowRightLeft className="h-6 w-6 text-green-600" />
                    <div className="text-center">
                      <div className="font-semibold text-green-900">
                        Leito {selectedToBed.number}
                      </div>
                      <div className="text-sm text-green-700">
                        {selectedToBed.department}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data e Hora da Transferência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transferDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Transferência</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transferTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário da Transferência</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tipo e Prioridade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transferType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Transferência</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transferTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <Badge className={type.color}>
                                  {type.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center space-x-2">
                                <Badge className={priority.color}>
                                  {priority.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Motivo da Transferência */}
              <FormField
                control={form.control}
                name="transferReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Transferência</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o motivo da transferência..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Solicitante e Aprovação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requestedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solicitado por</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do solicitante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approvedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aprovado por (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do aprovador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Transporte e Escolta */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center space-x-2">
                  <Truck className="h-4 w-4" />
                  <span>Transporte e Escolta</span>
                </Label>
                
                <FormField
                  control={form.control}
                  name="transportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Transporte</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o transporte" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transportTypes.map(transport => {
                            const Icon = transport.icon;
                            return (
                              <SelectItem key={transport.value} value={transport.value}>
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{transport.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalEscort"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Escolta Médica</FormLabel>
                        <FormDescription>
                          Necessita acompanhamento de profissional de saúde
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {medicalEscort && (
                  <FormField
                    control={form.control}
                    name="escortType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Escolta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de escolta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {escortTypes.map(escort => (
                              <SelectItem key={escort.value} value={escort.value}>
                                {escort.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Equipamentos Necessários */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Equipamentos Necessários</span>
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {equipmentOptions.map(equipment => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment}
                        checked={selectedEquipment.includes(equipment)}
                        onCheckedChange={() => handleEquipmentToggle(equipment)}
                      />
                      <Label 
                        htmlFor={equipment}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condição Clínica */}
              <FormField
                control={form.control}
                name="clinicalCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condição Clínica Atual</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva a condição clínica atual do paciente..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sinais Vitais */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Sinais Vitais (Opcional)</span>
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <FormField
                    control={form.control}
                    name="vitalSigns.bloodPressure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PA (mmHg)</FormLabel>
                        <FormControl>
                          <Input placeholder="120/80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.heartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FC (bpm)</FormLabel>
                        <FormControl>
                          <Input placeholder="72" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temp (°C)</FormLabel>
                        <FormControl>
                          <Input placeholder="36.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.oxygenSaturation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SpO2 (%)</FormLabel>
                        <FormControl>
                          <Input placeholder="98" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vitalSigns.respiratoryRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FR (irpm)</FormLabel>
                        <FormControl>
                          <Input placeholder="16" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Medicações e Alergias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentMedications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicações Atuais</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste as medicações em uso..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alergias</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste alergias conhecidas..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Precauções de Isolamento */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isolationPrecautions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Precauções de Isolamento</span>
                        </FormLabel>
                        <FormDescription>
                          Paciente requer precauções especiais de isolamento
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isolationPrecautions && (
                  <FormField
                    control={form.control}
                    name="isolationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Isolamento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de isolamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isolationTypes.map(isolation => (
                              <SelectItem key={isolation.value} value={isolation.value}>
                                {isolation.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Precauções Especiais */}
              <FormField
                control={form.control}
                name="specialPrecautions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precauções Especiais</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva precauções especiais necessárias..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notificação da Família */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="familyNotified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Família Notificada</FormLabel>
                        <FormDescription>
                          A família foi informada sobre a transferência
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="familyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato da Família</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome e telefone do contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Duração Estimada e Retorno */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração Estimada</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 2 horas, 1 dia, permanente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="returnScheduled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Retorno Agendado</FormLabel>
                        <FormDescription>
                          Transferência temporária com retorno programado
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {returnScheduled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Retorno</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecionar data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="returnTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Retorno</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Documentos */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Documentos a Acompanhar</span>
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {documentTypes.map(document => (
                    <div key={document} className="flex items-center space-x-2">
                      <Checkbox
                        id={document}
                        checked={selectedDocuments.includes(document)}
                        onCheckedChange={() => handleDocumentToggle(document)}
                      />
                      <Label 
                        htmlFor={document}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {document}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informações Administrativas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="costCenter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centro de Custo</FormLabel>
                      <FormControl>
                        <Input placeholder="Código do centro de custo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Convênio/Plano</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do convênio ou plano" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Observações */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Adicionais</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações gerais sobre a transferência..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botões de Ação */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedPatientId || !selectedToBedId}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Solicitando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Solicitar Transferência</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}