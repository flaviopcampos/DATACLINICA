'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCreatePrescription, useSearchMedications } from '@/hooks/usePrescriptions';
import {
  PrescriptionFormData,
  PRESCRIPTION_TYPES,
  MEDICATION_FREQUENCIES,
  MEDICATION_DURATIONS,
} from '@/types/prescription';
import { toast } from 'sonner';

interface CreatePrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: number;
  doctorId?: number;
}

const medicationSchema = z.object({
  medication_name: z.string().min(1, 'Nome do medicamento é obrigatório'),
  dosage: z.string().min(1, 'Dosagem é obrigatória'),
  frequency: z.string().min(1, 'Frequência é obrigatória'),
  duration: z.string().min(1, 'Duração é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  instructions: z.string().optional(),
  is_controlled: z.boolean().default(false),
  generic_allowed: z.boolean().default(true),
});

const prescriptionSchema = z.object({
  medical_record_id: z.number().min(1, 'Prontuário é obrigatório'),
  patient_id: z.number().min(1, 'Paciente é obrigatório'),
  doctor_id: z.number().min(1, 'Médico é obrigatório'),
  prescription_type: z.enum(['simple', 'controlled', 'special', 'digital']),
  content: z.string().optional(),
  validity_days: z.number().min(1, 'Validade deve ser maior que 0').max(365, 'Validade não pode exceder 365 dias'),
  is_controlled: z.boolean().default(false),
  medications: z.array(medicationSchema).min(1, 'Pelo menos um medicamento é obrigatório'),
});

type FormData = z.infer<typeof prescriptionSchema>;

export function CreatePrescriptionDialog({
  open,
  onOpenChange,
  patientId,
  doctorId,
}: CreatePrescriptionDialogProps) {
  const [medicationSearch, setMedicationSearch] = useState('');
  const [showMedicationSearch, setShowMedicationSearch] = useState<number | null>(null);
  
  const createPrescription = useCreatePrescription();
  const { data: medications = [] } = useSearchMedications(medicationSearch, {
    enabled: medicationSearch.length > 2,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patient_id: patientId || 0,
      doctor_id: doctorId || 0,
      medical_record_id: 0,
      prescription_type: 'simple',
      validity_days: 30,
      is_controlled: false,
      medications: [{
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: 1,
        instructions: '',
        is_controlled: false,
        generic_allowed: true,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medications',
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createPrescription.mutateAsync({
        ...data,
        medications: data.medications,
      });
      
      toast.success('Prescrição criada com sucesso!');
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao criar prescrição. Tente novamente.');
    }
  };

  const addMedication = () => {
    append({
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 1,
      instructions: '',
      is_controlled: false,
      generic_allowed: true,
    });
  };

  const selectMedication = (medicationName: string, index: number) => {
    form.setValue(`medications.${index}.medication_name`, medicationName);
    setShowMedicationSearch(null);
    setMedicationSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Prescrição</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar uma nova prescrição médica.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="patient_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Paciente</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ID do paciente"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Médico</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ID do médico"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medical_record_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Prontuário</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ID do prontuário"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="prescription_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Prescrição</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PRESCRIPTION_TYPES.SIMPLE}>Simples</SelectItem>
                            <SelectItem value={PRESCRIPTION_TYPES.CONTROLLED}>Controlada</SelectItem>
                            <SelectItem value={PRESCRIPTION_TYPES.SPECIAL}>Especial</SelectItem>
                            <SelectItem value={PRESCRIPTION_TYPES.DIGITAL}>Digital</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validity_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validade (dias)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de dias que a prescrição será válida
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_controlled"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicamento Controlado</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === 'true')}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">Não</SelectItem>
                            <SelectItem value="true">Sim</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações Gerais</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais sobre a prescrição..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Medicamentos</CardTitle>
                <Button type="button" onClick={addMedication} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Medicamento
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-dashed">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <Badge variant="outline">Medicamento {index + 1}</Badge>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`medications.${index}.medication_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Medicamento</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <div className="flex">
                                    <Input
                                      placeholder="Digite o nome do medicamento"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="ml-2"
                                      onClick={() => {
                                        setShowMedicationSearch(showMedicationSearch === index ? null : index);
                                        setMedicationSearch(field.value || '');
                                      }}
                                    >
                                      <Search className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                {showMedicationSearch === index && (
                                  <div className="absolute top-full left-0 right-0 z-10 mt-1">
                                    <Card className="shadow-lg">
                                      <CardContent className="p-2">
                                        <Input
                                          placeholder="Buscar medicamento..."
                                          value={medicationSearch}
                                          onChange={(e) => setMedicationSearch(e.target.value)}
                                          className="mb-2"
                                        />
                                        <div className="max-h-40 overflow-y-auto space-y-1">
                                          {medications.map((med, medIndex) => (
                                            <Button
                                              key={medIndex}
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="w-full justify-start"
                                              onClick={() => selectMedication(med.name, index)}
                                            >
                                              {med.name}
                                            </Button>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosagem</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 500mg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`medications.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequência</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {MEDICATION_FREQUENCIES.map((freq) => (
                                    <SelectItem key={freq.value} value={freq.value}>
                                      {freq.label}
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
                          name={`medications.${index}.duration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duração</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {MEDICATION_DURATIONS.map((duration) => (
                                    <SelectItem key={duration.value} value={duration.value}>
                                      {duration.label}
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
                          name={`medications.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`medications.${index}.is_controlled`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medicamento Controlado</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(value === 'true')}
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="false">Não</SelectItem>
                                  <SelectItem value="true">Sim</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications.${index}.generic_allowed`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permite Genérico</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(value === 'true')}
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="true">Sim</SelectItem>
                                  <SelectItem value="false">Não</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`medications.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instruções de Uso</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Instruções específicas para este medicamento..."
                                className="min-h-[60px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPrescription.isPending}>
                {createPrescription.isPending ? 'Criando...' : 'Criar Prescrição'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}