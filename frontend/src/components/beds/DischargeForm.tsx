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
  UserCheck, 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Pill,
  Heart,
  Activity,
  FileDown,
  Plus,
  X,
  Home,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useDischarges } from '@/hooks/useDischarges';
import { useAdmissions } from '@/hooks/useAdmissions';
import { toast } from 'sonner';

const dischargeSchema = z.object({
  admissionId: z.string().min(1, 'Selecione uma internação'),
  dischargeDate: z.date({
    required_error: 'Data de alta é obrigatória'
  }),
  dischargeTime: z.string().min(1, 'Horário de alta é obrigatório'),
  dischargeType: z.enum(['medical', 'administrative', 'transfer', 'death', 'evasion'], {
    required_error: 'Tipo de alta é obrigatório'
  }),
  dischargeReason: z.string().min(1, 'Motivo da alta é obrigatório'),
  finalDiagnosis: z.string().min(1, 'Diagnóstico final é obrigatório'),
  clinicalCondition: z.enum(['stable', 'improved', 'unchanged', 'worsened'], {
    required_error: 'Condição clínica é obrigatória'
  }),
  dischargeMedications: z.string().optional(),
  medicationInstructions: z.string().optional(),
  followUpInstructions: z.string().min(1, 'Instruções de acompanhamento são obrigatórias'),
  nextAppointment: z.date().optional(),
  nextAppointmentTime: z.string().optional(),
  nextAppointmentDoctor: z.string().optional(),
  dietInstructions: z.string().optional(),
  activityRestrictions: z.string().optional(),
  warningSignsInstructions: z.string().optional(),
  emergencyInstructions: z.string().optional(),
  dischargeDestination: z.enum(['home', 'another_hospital', 'nursing_home', 'rehabilitation', 'hospice'], {
    required_error: 'Destino da alta é obrigatório'
  }),
  transportType: z.enum(['walking', 'wheelchair', 'stretcher', 'ambulance'], {
    required_error: 'Tipo de transporte é obrigatório'
  }),
  accompaniedBy: z.string().optional(),
  accompaniedByPhone: z.string().optional(),
  dischargeDocuments: z.array(z.string()).default([]),
  readmissionRisk: z.enum(['low', 'medium', 'high'], {
    required_error: 'Risco de readmissão é obrigatório'
  }),
  socialServiceEvaluation: z.boolean().default(false),
  homeHealthCareNeeded: z.boolean().default(false),
  medicalEquipmentNeeded: z.string().optional(),
  observations: z.string().optional(),
  dischargedBy: z.string().min(1, 'Médico responsável pela alta é obrigatório')
});

type DischargeFormData = z.infer<typeof dischargeSchema>;

interface DischargeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedAdmissionId?: string;
  className?: string;
}

const dischargeTypes = [
  { value: 'medical', label: 'Alta Médica', color: 'bg-green-100 text-green-800' },
  { value: 'administrative', label: 'Alta Administrativa', color: 'bg-blue-100 text-blue-800' },
  { value: 'transfer', label: 'Transferência', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'death', label: 'Óbito', color: 'bg-red-100 text-red-800' },
  { value: 'evasion', label: 'Evasão', color: 'bg-orange-100 text-orange-800' }
];

const clinicalConditions = [
  { value: 'stable', label: 'Estável', color: 'bg-green-100 text-green-800' },
  { value: 'improved', label: 'Melhorado', color: 'bg-blue-100 text-blue-800' },
  { value: 'unchanged', label: 'Inalterado', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'worsened', label: 'Piorado', color: 'bg-red-100 text-red-800' }
];

const dischargeDestinations = [
  { value: 'home', label: 'Domicílio', icon: Home },
  { value: 'another_hospital', label: 'Outro Hospital', icon: Building2 },
  { value: 'nursing_home', label: 'Casa de Repouso', icon: Building2 },
  { value: 'rehabilitation', label: 'Reabilitação', icon: Activity },
  { value: 'hospice', label: 'Cuidados Paliativos', icon: Heart }
];

const transportTypes = [
  { value: 'walking', label: 'Caminhando' },
  { value: 'wheelchair', label: 'Cadeira de Rodas' },
  { value: 'stretcher', label: 'Maca' },
  { value: 'ambulance', label: 'Ambulância' }
];

const readmissionRisks = [
  { value: 'low', label: 'Baixo', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alto', color: 'bg-red-100 text-red-800' }
];

const documentTypes = [
  'Resumo de Alta',
  'Prescrição Médica',
  'Exames Laboratoriais',
  'Exames de Imagem',
  'Relatório de Enfermagem',
  'Avaliação Nutricional',
  'Avaliação Fisioterapia',
  'Relatório Social',
  'Atestado Médico',
  'Guia de Referência'
];

// Mock data para internações ativas
const mockActiveAdmissions = [
  {
    id: '1',
    patient: { name: 'João Silva', cpf: '123.456.789-00' },
    bed: { number: '101', type: 'Enfermaria' },
    admissionDate: '2024-01-15',
    diagnosis: 'Pneumonia'
  },
  {
    id: '2',
    patient: { name: 'Maria Santos', cpf: '987.654.321-00' },
    bed: { number: '205', type: 'UTI' },
    admissionDate: '2024-01-18',
    diagnosis: 'Infarto Agudo do Miocárdio'
  }
];

export function DischargeForm({ 
  onSuccess, 
  onCancel, 
  preselectedAdmissionId,
  className 
}: DischargeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  const { createDischarge } = useDischarges();
  
  const form = useForm<DischargeFormData>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: {
      admissionId: preselectedAdmissionId || '',
      dischargeDate: new Date(),
      dischargeTime: format(new Date(), 'HH:mm'),
      dischargeDocuments: [],
      socialServiceEvaluation: false,
      homeHealthCareNeeded: false
    }
  });

  const selectedAdmissionId = form.watch('admissionId');
  const selectedDischargeType = form.watch('dischargeType');
  const selectedClinicalCondition = form.watch('clinicalCondition');
  const selectedReadmissionRisk = form.watch('readmissionRisk');
  const selectedDestination = form.watch('dischargeDestination');

  const selectedAdmission = mockActiveAdmissions.find(a => a.id === selectedAdmissionId);

  const handleDocumentToggle = (document: string) => {
    const updatedDocs = selectedDocuments.includes(document)
      ? selectedDocuments.filter(d => d !== document)
      : [...selectedDocuments, document];
    
    setSelectedDocuments(updatedDocs);
    form.setValue('dischargeDocuments', updatedDocs);
  };

  const onSubmit = async (data: DischargeFormData) => {
    setIsSubmitting(true);
    try {
      await createDischarge({
        ...data,
        dischargeDateTime: new Date(`${format(data.dischargeDate, 'yyyy-MM-dd')}T${data.dischargeTime}`),
        nextAppointmentDateTime: data.nextAppointment && data.nextAppointmentTime 
          ? new Date(`${format(data.nextAppointment, 'yyyy-MM-dd')}T${data.nextAppointmentTime}`)
          : undefined
      });
      
      toast.success('Alta realizada com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao processar alta:', error);
      toast.error('Erro ao processar alta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Processamento de Alta Hospitalar</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Seleção de Internação */}
              <FormField
                control={form.control}
                name="admissionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma internação ativa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockActiveAdmissions.map(admission => (
                          <SelectItem key={admission.id} value={admission.id}>
                            <div className="flex flex-col">
                              <div className="font-medium">{admission.patient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Leito {admission.bed.number} | {admission.diagnosis}
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

              {selectedAdmission && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold text-blue-900">{selectedAdmission.patient.name}</div>
                      <div className="text-sm text-blue-700">CPF: {selectedAdmission.patient.cpf}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700">
                        Leito: {selectedAdmission.bed.number} ({selectedAdmission.bed.type})
                      </div>
                      <div className="text-sm text-blue-700">
                        Internado em: {format(new Date(selectedAdmission.admissionDate), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-blue-700">
                      <strong>Diagnóstico:</strong> {selectedAdmission.diagnosis}
                    </div>
                  </div>
                </div>
              )}

              {/* Data e Hora da Alta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dischargeDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Alta</FormLabel>
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
                  name="dischargeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário da Alta</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tipo de Alta e Condição Clínica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dischargeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Alta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de alta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dischargeTypes.map(type => (
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
                  name="clinicalCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição Clínica</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a condição" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clinicalConditions.map(condition => (
                            <SelectItem key={condition.value} value={condition.value}>
                              <div className="flex items-center space-x-2">
                                <Badge className={condition.color}>
                                  {condition.label}
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

              {/* Motivo e Diagnóstico Final */}
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="dischargeReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo da Alta</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o motivo da alta..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalDiagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnóstico Final</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Diagnóstico final completo..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Medicações e Instruções */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center space-x-2">
                  <Pill className="h-4 w-4" />
                  <span>Medicações e Instruções</span>
                </Label>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="dischargeMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicações de Alta</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Liste as medicações prescritas para alta..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicationInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instruções de Medicação</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instruções detalhadas sobre como tomar as medicações..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Instruções de Acompanhamento */}
              <FormField
                control={form.control}
                name="followUpInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções de Acompanhamento</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instruções para acompanhamento médico..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Próxima Consulta */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Próxima Consulta (Opcional)</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nextAppointment"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
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
                    name="nextAppointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nextAppointmentDoctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Médico</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do médico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Instruções Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dietInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruções Alimentares</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Orientações sobre dieta..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activityRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restrições de Atividade</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Limitações de atividade física..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sinais de Alerta e Emergência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warningSignsInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sinais de Alerta</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Sinais que requerem atenção médica..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruções de Emergência</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="O que fazer em caso de emergência..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Destino e Transporte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dischargeDestination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destino da Alta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o destino" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dischargeDestinations.map(destination => {
                            const Icon = destination.icon;
                            return (
                              <SelectItem key={destination.value} value={destination.value}>
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{destination.label}</span>
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
                          {transportTypes.map(transport => (
                            <SelectItem key={transport.value} value={transport.value}>
                              {transport.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Acompanhante */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accompaniedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acompanhado por</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do acompanhante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accompaniedByPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Acompanhante</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Documentos de Alta */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center space-x-2">
                  <FileDown className="h-4 w-4" />
                  <span>Documentos de Alta</span>
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

              {/* Avaliações e Cuidados */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Avaliações e Cuidados Especiais</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="readmissionRisk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risco de Readmissão</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Avalie o risco" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {readmissionRisks.map(risk => (
                              <SelectItem key={risk.value} value={risk.value}>
                                <div className="flex items-center space-x-2">
                                  <Badge className={risk.color}>
                                    {risk.label}
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
                    name="medicalEquipmentNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipamentos Médicos Necessários</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Oxigênio, cadeira de rodas..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialServiceEvaluation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Avaliação do Serviço Social</FormLabel>
                          <FormDescription>
                            Necessita avaliação do serviço social
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeHealthCareNeeded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Cuidados Domiciliares</FormLabel>
                          <FormDescription>
                            Necessita cuidados de saúde em casa
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Médico Responsável */}
              <FormField
                control={form.control}
                name="dischargedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Médico Responsável pela Alta</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do médico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observações Finais */}
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Gerais</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais sobre a alta..."
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
                  disabled={isSubmitting || !selectedAdmissionId}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirmar Alta</span>
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