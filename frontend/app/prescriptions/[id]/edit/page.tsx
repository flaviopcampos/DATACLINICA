'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  usePrescription,
  usePrescriptionMedications,
  useUpdatePrescription,
  useMedicationSearch,
  useAddPrescriptionMedication,
  useUpdatePrescriptionMedication,
  useDeletePrescriptionMedication,
} from '@/hooks/usePrescriptions';
import {
  PRESCRIPTION_TYPES,
  MEDICATION_FREQUENCIES,
  MEDICATION_DURATIONS,
  type PrescriptionFormData,
  type MedicationFormData,
  type PrescriptionMedication,
} from '@/types/prescription';
import { toast } from 'sonner';

const medicationSchema = z.object({
  id: z.number().optional(),
  medication_id: z.number(),
  medication_name: z.string().min(1, 'Nome do medicamento é obrigatório'),
  dosage: z.string().min(1, 'Dosagem é obrigatória'),
  frequency: z.string().min(1, 'Frequência é obrigatória'),
  duration: z.string().min(1, 'Duração é obrigatória'),
  quantity: z.number().min(1, 'Quantidade é obrigatória'),
  instructions: z.string().optional(),
  is_controlled: z.boolean().optional(),
  generic_allowed: z.boolean().optional(),
});

const prescriptionSchema = z.object({
  patient_id: z.number().min(1, 'Paciente é obrigatório'),
  doctor_id: z.number().min(1, 'Médico é obrigatório'),
  medical_record_id: z.number().min(1, 'Prontuário é obrigatório'),
  prescription_type: z.enum(['simple', 'controlled', 'special', 'digital']),
  validity_days: z.number().min(1, 'Validade é obrigatória'),
  content: z.string().optional(),
  is_controlled: z.boolean().optional(),
  medications: z.array(medicationSchema),
});

export default function EditPrescriptionPage({ params }: { params: { id: string } | null }) {
  const router = useRouter();
  
  // All hooks must be called at the top level
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicationIndex, setSelectedMedicationIndex] = useState<number | null>(null);
  const [medicationsToAdd, setMedicationsToAdd] = useState<MedicationFormData[]>([]);
  const [medicationsToUpdate, setMedicationsToUpdate] = useState<(MedicationFormData & { id: number })[]>([]);
  const [medicationsToRemove, setMedicationsToRemove] = useState<number[]>([]);
  
  if (!params) {
    return <div>Parâmetros inválidos</div>;
  }
  const prescriptionId = parseInt(params.id);
  
  const { data: prescription, isLoading: prescriptionLoading } = usePrescription(prescriptionId);
  const { data: existingMedications = [], isLoading: medicationsLoading } = usePrescriptionMedications(prescriptionId);
  const { data: searchResults = [], isLoading: isSearching } = useMedicationSearch(searchTerm);
  
  const updatePrescription = useUpdatePrescription();
  const addMedication = useAddPrescriptionMedication();
  const updateMedication = useUpdatePrescriptionMedication();
  const removeMedicationMutation = useDeletePrescriptionMedication();

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patient_id: 0,
      doctor_id: 0,
      medical_record_id: 0,
      prescription_type: 'simple' as const,
      validity_days: 30,
      content: '',
      is_controlled: false,
      medications: [],
    },
  });

  const { fields: medicationFields, append: appendMedication, remove: removeMedicationField, update: updateMedicationField } = useFieldArray({
    control: form.control,
    name: 'medications',
  });

  // Initialize form with prescription data
  useEffect(() => {
    if (prescription) {
      form.reset({
        patient_id: prescription.patient_id,
        doctor_id: prescription.doctor_id,
        medical_record_id: prescription.medical_record_id || 0,
        prescription_type: prescription.prescription_type as 'simple' | 'controlled' | 'special' | 'digital',
        validity_days: prescription.validity_days,
        content: prescription.content || '',
        is_controlled: prescription.is_controlled || false,
        medications: existingMedications.map(med => ({
          id: med.id,
          medication_id: 0, // Default value since PrescriptionMedication doesn't have medication_id
          medication_name: med.medication_name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          quantity: Number(med.quantity) || 0,
          instructions: med.instructions || '',
          is_controlled: med.is_controlled || false,
          generic_allowed: med.generic_allowed || false,
        })),
      });
    }
  }, [prescription, form]);

  // Initialize medications
  useEffect(() => {
    if (existingMedications.length > 0) {
      // Clear existing fields and add current medications
      while (medicationFields.length > 0) {
        removeMedicationField(0);
      }
      
      existingMedications.forEach((med: PrescriptionMedication) => {
        appendMedication({
          id: med.id,
          medication_id: 0, // Default value since PrescriptionMedication doesn't have medication_id
          medication_name: med.medication_name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          quantity: med.quantity || 0,
          instructions: med.instructions || '',
          is_controlled: med.is_controlled,
          generic_allowed: med.generic_allowed,
        });
      });
    }
  }, [existingMedications, appendMedication, removeMedicationField, medicationFields.length]);

  const handleAddMedication = () => {
    appendMedication({
      medication_id: 0,
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

  const handleSelectMedication = (medicationName: string, index: number) => {
    const currentMedication = medicationFields[index];
    updateMedicationField(index, {
      ...currentMedication,
      medication_name: medicationName,
    });
    setSearchTerm('');
    setSelectedMedicationIndex(null);
  };

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      // Update prescription basic info
      await updatePrescription.mutateAsync({
        id: prescriptionId,
        data: {
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          medical_record_id: data.medical_record_id,
          prescription_type: data.prescription_type,
          validity_days: data.validity_days,
          content: data.content,
          is_controlled: data.is_controlled,
        },
      });

      // Handle medication changes
      const currentMedications = data.medications || [];
      
      // Remove medications that were deleted
      for (const medId of medicationsToRemove) {
        await removeMedicationMutation.mutateAsync({ prescriptionId, medicationId: medId });
      }
      
      // Update existing medications and add new ones
      for (let i = 0; i < currentMedications.length; i++) {
        const medication = currentMedications[i];
        const existingMed = existingMedications[i];
        
        if (existingMed) {
          // Update existing medication
          await updateMedication.mutateAsync({
            prescriptionId,
            medicationId: existingMed.id,
            data: medication,
          });
        } else {
          // Add new medication
          await addMedication.mutateAsync({
            prescriptionId,
            data: medication,
          });
        }
      }
      
      // Remove any extra existing medications
      for (let i = currentMedications.length; i < existingMedications.length; i++) {
        const medToRemove = existingMedications[i];
        if (medToRemove && !medicationsToRemove.includes(medToRemove.id)) {
          await removeMedicationMutation.mutateAsync({ prescriptionId, medicationId: medToRemove.id });
        }
      }

      toast.success('Prescrição atualizada com sucesso!');
      router.push(`/prescriptions/${prescriptionId}`);
    } catch (error) {
      toast.error('Erro ao atualizar prescrição');
    }
  };

  if (prescriptionLoading || medicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Prescrição não encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                A prescrição solicitada não foi encontrada ou você não tem permissão para editá-la.
              </p>
              <Button onClick={() => router.push('/prescriptions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Prescrições
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/prescriptions/${prescriptionId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Prescrição #{prescriptionId}
            </h1>
            <p className="text-gray-600">
              Modifique as informações da prescrição e medicamentos
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais da prescrição médica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID do Paciente *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 123"
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
                      <FormLabel>ID do Médico *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 456"
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
                      <FormLabel>ID do Prontuário *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 789"
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
                  name="prescription_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Prescrição *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormLabel>Validade (dias) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 30"
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
              </div>
              
              <FormField
                control={form.control}
                name="is_controlled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Prescrição de medicamento controlado
                      </FormLabel>
                      <FormDescription>
                        Marque se esta prescrição contém medicamentos controlados
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais sobre a prescrição..."
                        className="min-h-[100px]"
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
              <div>
                <CardTitle>Medicamentos</CardTitle>
                <CardDescription>
                  Adicione os medicamentos prescritos
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMedication}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Medicamento
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicationFields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum medicamento adicionado.</p>
                  <p className="text-sm">Clique em "Adicionar Medicamento" para começar.</p>
                </div>
              ) : (
                medicationFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Medicamento {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedicationField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Label>Nome do Medicamento *</Label>
                        <div className="relative">
                          <Input
                            placeholder="Digite o nome do medicamento"
                            value={(medicationFields[index] as any)?.medication_name || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const currentMedication = medicationFields[index] as any;
                              updateMedicationField(index, {
                                ...currentMedication,
                                medication_name: value,
                              });
                              setSearchTerm(value);
                              setSelectedMedicationIndex(index);
                            }}
                          />
                          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        
                        {searchTerm && selectedMedicationIndex === index && searchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map((medication: { name: string; description?: string }, medIndex: number) => (
                              <button
                                key={medIndex}
                                type="button"
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                onClick={() => handleSelectMedication(medication.name, index)}
                              >
                                <div className="font-medium">{medication.name}</div>
                                {medication.description && (
                                  <div className="text-sm text-gray-600">{medication.description}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label>Dosagem *</Label>
                        <Input
                          placeholder="Ex: 500mg"
                          value={(medicationFields[index] as any)?.dosage || ''}
                          onChange={(e) => {
                            const currentMedication = medicationFields[index] as any;
                            updateMedicationField(index, {
                              ...currentMedication,
                              dosage: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Frequência *</Label>
                        <Select
                          value={(medicationFields[index] as any)?.frequency || ''}
                          onValueChange={(value) => {
                            const currentMedication = medicationFields[index] as any;
                            updateMedicationField(index, {
                              ...currentMedication,
                              frequency: value,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEDICATION_FREQUENCIES.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Duração *</Label>
                        <Select
                          value={(medicationFields[index] as any)?.duration || ''}
                          onValueChange={(value) => {
                            const currentMedication = medicationFields[index] as any;
                            updateMedicationField(index, {
                              ...currentMedication,
                              duration: value,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEDICATION_DURATIONS.map((duration) => (
                              <SelectItem key={duration.value} value={duration.value}>
                                {duration.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Quantidade *</Label>
                        <Input
                          placeholder="Ex: 30 comprimidos"
                          value={(medicationFields[index] as any)?.quantity || ''}
                          onChange={(e) => {
                            const currentMedication = medicationFields[index] as any;
                            updateMedicationField(index, {
                              ...currentMedication,
                              quantity: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Instruções de Uso</Label>
                      <Textarea
                        placeholder="Instruções específicas para o uso do medicamento..."
                        value={(medicationFields[index] as any)?.instructions || ''}
                        onChange={(e) => {
                          const currentMedication = medicationFields[index] as any;
                          updateMedicationField(index, {
                            ...currentMedication,
                            instructions: e.target.value,
                          });
                        }}
                      />
                    </div>
                    
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`controlled-${index}`}
                          checked={(medicationFields[index] as any)?.is_controlled || false}
                          onCheckedChange={(checked) => {
                            const currentMedication = medicationFields[index] as any;
                            updateMedicationField(index, {
                              ...currentMedication,
                              is_controlled: checked as boolean,
                            });
                          }}
                        />
                        <Label htmlFor={`controlled-${index}`} className="text-sm">
                          Medicamento controlado
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`generic-${index}`}
                          checked={(medicationFields[index] as any)?.generic_allowed ?? true}
                          onCheckedChange={(checked) => {
                            const currentMedication = medicationFields[index] as any;
                            updateMedicationField(index, {
                              ...currentMedication,
                              generic_allowed: checked as boolean,
                            });
                          }}
                        />
                        <Label htmlFor={`generic-${index}`} className="text-sm">
                          Permite genérico
                        </Label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/prescriptions/${prescriptionId}`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updatePrescription.isPending}
            >
              {updatePrescription.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}