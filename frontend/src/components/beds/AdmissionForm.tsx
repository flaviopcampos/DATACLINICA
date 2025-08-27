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
  User, 
  Bed, 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Search,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdmissions } from '@/hooks/useAdmissions';
import { useBeds } from '@/hooks/useBeds';
import { toast } from 'sonner';

const admissionSchema = z.object({
  patientId: z.string().min(1, 'Selecione um paciente'),
  bedId: z.string().min(1, 'Selecione um leito'),
  admissionDate: z.date({
    required_error: 'Data de internação é obrigatória'
  }),
  admissionTime: z.string().min(1, 'Horário de internação é obrigatório'),
  admissionType: z.enum(['emergency', 'scheduled', 'transfer', 'readmission'], {
    required_error: 'Tipo de internação é obrigatório'
  }),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Prioridade é obrigatória'
  }),
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório'),
  symptoms: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  insurance: z.string().optional(),
  insuranceNumber: z.string().optional(),
  observations: z.string().optional(),
  requiresIsolation: z.boolean().default(false),
  requiresSpecialCare: z.boolean().default(false),
  dietRestrictions: z.string().optional(),
  attendingPhysician: z.string().min(1, 'Médico responsável é obrigatório'),
  department: z.string().min(1, 'Departamento é obrigatório')
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

interface AdmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedBedId?: string;
  preselectedPatientId?: string;
  className?: string;
}

const admissionTypes = [
  { value: 'emergency', label: 'Emergência' },
  { value: 'scheduled', label: 'Programada' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'readmission', label: 'Readmissão' }
];

const priorities = [
  { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800' }
];

const departments = [
  { value: 'emergency', label: 'Emergência' },
  { value: 'icu', label: 'UTI' },
  { value: 'cardiology', label: 'Cardiologia' },
  { value: 'neurology', label: 'Neurologia' },
  { value: 'orthopedics', label: 'Ortopedia' },
  { value: 'pediatrics', label: 'Pediatria' },
  { value: 'maternity', label: 'Maternidade' },
  { value: 'surgery', label: 'Cirurgia' },
  { value: 'internal_medicine', label: 'Clínica Médica' }
];

// Mock data para pacientes
const mockPatients = [
  { id: '1', name: 'João Silva', cpf: '123.456.789-00', birthDate: '1980-05-15' },
  { id: '2', name: 'Maria Santos', cpf: '987.654.321-00', birthDate: '1975-08-22' },
  { id: '3', name: 'Pedro Oliveira', cpf: '456.789.123-00', birthDate: '1990-12-10' }
];

export function AdmissionForm({ 
  onSuccess, 
  onCancel, 
  preselectedBedId,
  preselectedPatientId,
  className 
}: AdmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  
  const { createAdmission } = useAdmissions();
  const { data: availableBeds } = useBeds({ status: 'available' });
  
  const form = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      bedId: preselectedBedId || '',
      patientId: preselectedPatientId || '',
      admissionDate: new Date(),
      admissionTime: format(new Date(), 'HH:mm'),
      requiresIsolation: false,
      requiresSpecialCare: false
    }
  });

  const selectedPriority = form.watch('priority');
  const selectedPatientId = form.watch('patientId');
  const selectedBedId = form.watch('bedId');

  const filteredPatients = mockPatients.filter(patient => 
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.cpf.includes(patientSearch)
  );

  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);
  const selectedBed = availableBeds?.find(b => b.id === selectedBedId);

  const onSubmit = async (data: AdmissionFormData) => {
    setIsSubmitting(true);
    try {
      await createAdmission({
        ...data,
        admissionDateTime: new Date(`${format(data.admissionDate, 'yyyy-MM-dd')}T${data.admissionTime}`)
      });
      
      toast.success('Internação realizada com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar internação:', error);
      toast.error('Erro ao realizar internação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Nova Internação</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Seleção de Paciente */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Paciente</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPatientSearch(!showPatientSearch)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Paciente
                  </Button>
                </div>
                
                {showPatientSearch && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar por nome ou CPF..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                    />
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                      {filteredPatients.map(patient => (
                        <div
                          key={patient.id}
                          className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            form.setValue('patientId', patient.id);
                            setShowPatientSearch(false);
                            setPatientSearch('');
                          }}
                        >
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            CPF: {patient.cpf} | Nascimento: {format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedPatient && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-blue-900">{selectedPatient.name}</div>
                        <div className="text-sm text-blue-700">
                          CPF: {selectedPatient.cpf} | Nascimento: {format(new Date(selectedPatient.birthDate), 'dd/MM/yyyy')}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => form.setValue('patientId', '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Seleção de Leito */}
              <FormField
                control={form.control}
                name="bedId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leito</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um leito" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableBeds?.map(bed => (
                          <SelectItem key={bed.id} value={bed.id}>
                            <div className="flex items-center space-x-2">
                              <Bed className="h-4 w-4" />
                              <span>Leito {bed.number}</span>
                              <span className="text-muted-foreground">- {bed.type}</span>
                              {bed.room && (
                                <span className="text-muted-foreground">- Quarto {bed.room.number}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedBed && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-900">
                    Leito {selectedBed.number} - {selectedBed.type}
                  </div>
                  <div className="text-sm text-green-700">
                    {selectedBed.room && `Quarto ${selectedBed.room.number} | `}
                    {selectedBed.department?.name}
                  </div>
                </div>
              )}

              {/* Data e Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="admissionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Internação</FormLabel>
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
                  name="admissionTime"
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
              </div>

              {/* Tipo e Prioridade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="admissionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Internação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {admissionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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

              {/* Departamento e Médico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
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
                  name="attendingPhysician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médico Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do médico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Diagnóstico */}
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnóstico</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o diagnóstico principal..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Informações Médicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sintomas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva os sintomas..."
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
                          placeholder="Liste as alergias conhecidas..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Medicações e Histórico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicações em Uso</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste as medicações atuais..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Histórico Médico</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Histórico médico relevante..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contato de Emergência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato de Emergência</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone de Emergência</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Convênio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Convênio</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do convênio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Carteirinha</FormLabel>
                      <FormControl>
                        <Input placeholder="Número da carteirinha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cuidados Especiais */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Cuidados Especiais</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requiresIsolation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Requer Isolamento</FormLabel>
                          <FormDescription>
                            Paciente necessita de isolamento
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiresSpecialCare"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Cuidados Especiais</FormLabel>
                          <FormDescription>
                            Paciente necessita de cuidados especiais
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dietRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restrições Alimentares</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva as restrições alimentares..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Observações */}
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Gerais</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais..."
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
                  disabled={isSubmitting || !selectedPatientId || !selectedBedId}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Internando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirmar Internação</span>
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