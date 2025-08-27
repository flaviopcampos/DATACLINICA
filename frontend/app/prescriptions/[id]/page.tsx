'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Download, RefreshCw, X, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  usePrescription,
  usePrescriptionMedications,
  useDeletePrescription,
  useCancelPrescription,
  useRenewPrescription,
  useGeneratePrescriptionPDF,
} from '@/hooks/usePrescriptions';
import { PRESCRIPTION_STATUS, PRESCRIPTION_TYPES } from '@/types/prescription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function PrescriptionDetailsPage() {
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
  
  const prescriptionId = Number(params.id);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const { data: prescription, isLoading, error } = usePrescription(prescriptionId);
  const { data: medications = [] } = usePrescriptionMedications(prescriptionId);
  
  const deletePrescription = useDeletePrescription();
  const cancelPrescription = useCancelPrescription();
  const renewPrescription = useRenewPrescription();
  const generatePDF = useGeneratePrescriptionPDF();

  const handleDelete = async () => {
    try {
      await deletePrescription.mutateAsync(prescriptionId);
      toast.success('Prescrição excluída com sucesso!');
      router.push('/prescriptions');
    } catch (error) {
      toast.error('Erro ao excluir prescrição');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelPrescription.mutateAsync(prescriptionId);
      toast.success('Prescrição cancelada com sucesso!');
      setShowCancelDialog(false);
    } catch (error) {
      toast.error('Erro ao cancelar prescrição');
    }
  };

  const handleRenew = async () => {
    try {
      const renewed = await renewPrescription.mutateAsync(prescriptionId);
      toast.success('Prescrição renovada com sucesso!');
      router.push(`/prescriptions/${renewed.id}`);
    } catch (error) {
      toast.error('Erro ao renovar prescrição');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generatePDF.mutateAsync(prescriptionId);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `prescricao-${prescriptionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case PRESCRIPTION_STATUS.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-200';
      case PRESCRIPTION_STATUS.EXPIRED:
        return 'bg-red-100 text-red-800 border-red-200';
      case PRESCRIPTION_STATUS.CANCELLED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case PRESCRIPTION_STATUS.DISPENSED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case PRESCRIPTION_TYPES.SIMPLE:
        return 'Simples';
      case PRESCRIPTION_TYPES.CONTROLLED:
        return 'Controlada';
      case PRESCRIPTION_TYPES.SPECIAL:
        return 'Especial';
      case PRESCRIPTION_TYPES.DIGITAL:
        return 'Digital';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateOnly = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !prescription) {
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

  const canEdit = prescription.status === PRESCRIPTION_STATUS.ACTIVE;
  const canCancel = prescription.status === PRESCRIPTION_STATUS.ACTIVE;
  const canRenew = prescription.status === PRESCRIPTION_STATUS.EXPIRED;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/prescriptions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Prescrição #{prescription.id}
            </h1>
            <p className="text-gray-600">
              Criada em {formatDate(prescription.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={generatePDF.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {generatePDF.isPending ? 'Gerando...' : 'PDF'}
          </Button>
          
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/prescriptions/${prescriptionId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          
          {canRenew && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRenew}
              disabled={renewPrescription.isPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {renewPrescription.isPending ? 'Renovando...' : 'Renovar'}
            </Button>
          )}
          
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelPrescription.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deletePrescription.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Status and Type */}
      <div className="flex items-center space-x-4">
        <Badge className={getStatusColor(prescription.status)}>
          {prescription.status === PRESCRIPTION_STATUS.ACTIVE && 'Ativa'}
          {prescription.status === PRESCRIPTION_STATUS.EXPIRED && 'Expirada'}
          {prescription.status === PRESCRIPTION_STATUS.CANCELLED && 'Cancelada'}
          {prescription.status === PRESCRIPTION_STATUS.DISPENSED && 'Dispensada'}
        </Badge>
        <Badge variant="outline">
          {getTypeLabel(prescription.prescription_type)}
        </Badge>
        {prescription.is_controlled && (
          <Badge variant="destructive">Controlada</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Prescrição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Paciente</label>
                  <p className="text-sm text-gray-900">ID: {prescription.patient_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Médico</label>
                  <p className="text-sm text-gray-900">ID: {prescription.doctor_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Prontuário</label>
                  <p className="text-sm text-gray-900">ID: {prescription.medical_record_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Validade</label>
                  <p className="text-sm text-gray-900">
                    {prescription.validity_days} dias
                    {prescription.expires_at && (
                      <span className="text-gray-500 ml-2">
                        (até {formatDateOnly(prescription.expires_at)})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {prescription.content && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observações</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                    {prescription.content}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Medicamentos</CardTitle>
                <CardDescription>
                  {medications.length} medicamento{medications.length !== 1 ? 's' : ''} prescrito{medications.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/prescriptions/${prescriptionId}/medications`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum medicamento adicionado a esta prescrição.
                </p>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication, index) => (
                    <div key={medication.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {medication.medication_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {medication.dosage}
                          </p>
                        </div>
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                        <div className="mt-3 pt-3 border-t">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Prescrição criada</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(prescription.created_at)}
                    </p>
                  </div>
                </div>
                
                {prescription.updated_at !== prescription.created_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Última atualização</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(prescription.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
                
                {prescription.status === PRESCRIPTION_STATUS.EXPIRED && prescription.expires_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Prescrição expirada</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(prescription.expires_at)}
                      </p>
                    </div>
                  </div>
                )}
                
                {prescription.status === PRESCRIPTION_STATUS.CANCELLED && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Prescrição cancelada</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(prescription.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/prescriptions?patient_id=${prescription.patient_id}`)}
              >
                Ver outras prescrições do paciente
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/prescriptions?doctor_id=${prescription.doctor_id}`)}
              >
                Ver outras prescrições do médico
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/medical-records/${prescription.medical_record_id}`)}
              >
                Ver prontuário completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Prescrição"
        description="Tem certeza que deseja excluir esta prescrição? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        variant="destructive"
      />
      
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar Prescrição"
        description="Tem certeza que deseja cancelar esta prescrição? Ela não poderá mais ser utilizada."
        confirmText="Cancelar Prescrição"
        cancelText="Manter Ativa"
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
}