'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Edit, Trash2, Search, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  usePrescription,
  usePrescriptionMedications,
  useMedicationSearch,
  useAddPrescriptionMedication,
  useUpdatePrescriptionMedication,
  useDeletePrescriptionMedication,
} from '@/hooks/usePrescriptions';
import {
  MEDICATION_FREQUENCIES,
  MEDICATION_DURATIONS,
  type MedicationFormData,
  type PrescriptionMedication,
} from '@/types/prescription';
import { toast } from 'sonner';

const medicationSchema = z.object({
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

interface MedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: PrescriptionMedication;
  prescriptionId: number;
  onSuccess: () => void;
}

function MedicationDialog({ open, onOpenChange, medication, prescriptionId, onSuccess }: MedicationDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults = [] } = useMedicationSearch(searchTerm);
  
  const addMedication = useAddPrescriptionMedication();
  const updateMedication = useUpdatePrescriptionMedication();
  
  const isEditing = !!medication;
  
  const form = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      medication_id: medication?.medication_id || 0,
      medication_name: medication?.medication_name || '',
      dosage: medication?.dosage || '',
      frequency: medication?.frequency || '',
      duration: medication?.duration || '',
      quantity: Number(medication?.quantity) || 0,
      instructions: medication?.instructions || '',
      is_controlled: medication?.is_controlled || false,
      generic_allowed: medication?.generic_allowed ?? true,
    },
  });

  const onSubmit = async (data: z.infer<typeof medicationSchema>) => {
    try {
      if (isEditing && medication) {
        await updateMedication.mutateAsync({
          prescriptionId,
          medicationId: medication.id,
          data,
        });
        toast.success('Medicamento atualizado com sucesso!');
      } else {
        await addMedication.mutateAsync({
          prescriptionId,
          data,
        });
        toast.success('Medicamento adicionado com sucesso!');
      }
      
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar medicamento' : 'Erro ao adicionar medicamento');
    }
  };

  const handleSelectMedication = (medicationName: string) => {
    form.setValue('medication_name', medicationName);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Medicamento' : 'Adicionar Medicamento'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifique as informações do medicamento'
              : 'Adicione um novo medicamento à prescrição'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FormField
                  control={form.control}
                  name="medication_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Medicamento *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Digite o nome do medicamento"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setSearchTerm(e.target.value);
                            }}
                          />
                        </FormControl>
                        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {searchTerm && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((medication, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                        onClick={() => handleSelectMedication(medication.name)}
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
              
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosagem *</FormLabel>
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
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 30" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções de Uso</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruções específicas para o uso do medicamento..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-6">
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
                      <FormLabel>Medicamento controlado</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="generic_allowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Permite genérico</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={addMedication.isPending || updateMedication.isPending}
              >
                {addMedication.isPending || updateMedication.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEditing ? 'Salvando...' : 'Adicionando...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Salvar' : 'Adicionar'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function PrescriptionMedicationsPage() {
  const params = useParams();
  const router = useRouter();
  
  if (!params || !params.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Parâmetros inválidos
              </h3>
              <p className="text-gray-600 mb-4">
                ID da prescrição não foi fornecido.
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
  
  const prescriptionId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<PrescriptionMedication | null>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<PrescriptionMedication | null>(null);
  
  const { data: prescription, isLoading: prescriptionLoading } = usePrescription(prescriptionId);
  const { data: medications = [], isLoading: medicationsLoading, refetch } = usePrescriptionMedications(prescriptionId);
  
  const removeMedication = useDeletePrescriptionMedication();

  const handleDeleteMedication = async () => {
    if (!medicationToDelete) return;
    
    try {
      await removeMedication.mutateAsync({
        prescriptionId,
        medicationId: medicationToDelete.id,
      });
      toast.success('Medicamento removido com sucesso!');
      setMedicationToDelete(null);
      refetch();
    } catch (error) {
      toast.error('Erro ao remover medicamento');
    }
  };

  const handleSuccess = () => {
    refetch();
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
                A prescrição solicitada não foi encontrada ou você não tem permissão para visualizá-la.
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
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              Medicamentos - Prescrição #{prescriptionId}
            </h1>
            <p className="text-gray-600">
              Gerencie os medicamentos desta prescrição
            </p>
          </div>
        </div>
        
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Medicamento
        </Button>
      </div>

      {/* Prescription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Prescrição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Paciente:</span>
              <p className="text-gray-900">ID: {prescription.patient_id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Médico:</span>
              <p className="text-gray-900">ID: {prescription.doctor_id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Tipo:</span>
              <p className="text-gray-900">
                {prescription.prescription_type === 'simple' && 'Simples'}
                {prescription.prescription_type === 'controlled' && 'Controlada'}
                {prescription.prescription_type === 'special' && 'Especial'}
                {prescription.prescription_type === 'digital' && 'Digital'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Status:</span>
              <Badge className="ml-2">
                {prescription.status === 'active' && 'Ativa'}
                {prescription.status === 'expired' && 'Expirada'}
                {prescription.status === 'cancelled' && 'Cancelada'}
                {prescription.status === 'dispensed' && 'Dispensada'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications List */}
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos Prescritos</CardTitle>
          <CardDescription>
            {medications.length} medicamento{medications.length !== 1 ? 's' : ''} prescrito{medications.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum medicamento adicionado</p>
                <p className="text-sm">Clique em "Adicionar Medicamento" para começar.</p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Medicamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((medication) => (
                <div key={medication.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900 text-lg">
                          {medication.medication_name}
                        </h4>
                        <div className="flex space-x-2">
                          {medication.is_controlled && (
                            <Badge variant="destructive" className="text-xs">
                              Controlado
                            </Badge>
                          )}
                          {medication.generic_allowed && (
                            <Badge variant="secondary" className="text-xs">
                              Genérico OK
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">
                        <span className="font-medium">Dosagem:</span> {medication.dosage}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMedication(medication)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMedicationToDelete(medication)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium text-gray-500">Frequência:</span>
                      <p className="text-gray-900">{medication.frequency}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Duração:</span>
                      <p className="text-gray-900">{medication.duration}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Quantidade:</span>
                      <p className="text-gray-900">{medication.quantity}</p>
                    </div>
                  </div>
                  
                  {medication.instructions && (
                    <div className="pt-3 border-t">
                      <span className="font-medium text-gray-500 text-sm">Instruções:</span>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                        {medication.instructions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Medication Dialog */}
      <MedicationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        prescriptionId={prescriptionId}
        onSuccess={handleSuccess}
      />

      {/* Edit Medication Dialog */}
      <MedicationDialog
        open={!!editingMedication}
        onOpenChange={(open) => !open && setEditingMedication(null)}
        medication={editingMedication || undefined}
        prescriptionId={prescriptionId}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!medicationToDelete}
        onOpenChange={(open) => !open && setMedicationToDelete(null)}
        title="Remover Medicamento"
        description={`Tem certeza que deseja remover "${medicationToDelete?.medication_name}" desta prescrição?`}
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleDeleteMedication}
        variant="destructive"
      />
    </div>
  );
}