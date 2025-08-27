'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  XCircle,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Prescription, PRESCRIPTION_STATUS } from '@/types/prescription';
import {
  useDeletePrescription,
  useCancelPrescription,
  useRenewPrescription,
  useGeneratePrescriptionPDF
} from '@/hooks/usePrescriptions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import Link from 'next/link';

interface PrescriptionCardProps {
  prescription: Prescription;
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Mutations
  const deleteMutation = useDeletePrescription();
  const cancelMutation = useCancelPrescription();
  const renewMutation = useRenewPrescription();
  const generatePDFMutation = useGeneratePrescriptionPDF();

  const handleDelete = () => {
    deleteMutation.mutate(prescription.id, {
      onSuccess: () => setShowDeleteDialog(false)
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate(
      { id: prescription.id },
      { onSuccess: () => setShowCancelDialog(false) }
    );
  };

  const handleRenew = () => {
    renewMutation.mutate({ id: prescription.id });
  };

  const handleGeneratePDF = () => {
    generatePDFMutation.mutate(prescription.id);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      [PRESCRIPTION_STATUS.ACTIVE]: {
        variant: 'default' as const,
        icon: CheckCircle,
        label: 'Ativa',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      [PRESCRIPTION_STATUS.EXPIRED]: {
        variant: 'secondary' as const,
        icon: Clock,
        label: 'Expirada',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      [PRESCRIPTION_STATUS.CANCELLED]: {
        variant: 'destructive' as const,
        icon: XCircle,
        label: 'Cancelada',
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      [PRESCRIPTION_STATUS.DISPENSED]: {
        variant: 'outline' as const,
        icon: CheckCircle,
        label: 'Dispensada',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      }
    };

    const config = statusConfig[status] || statusConfig[PRESCRIPTION_STATUS.ACTIVE];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const isExpired = prescription.expires_at && new Date(prescription.expires_at) < new Date();
  const isActive = prescription.status === PRESCRIPTION_STATUS.ACTIVE;
  const canEdit = isActive && !isExpired;
  const canCancel = isActive;
  const canRenew = prescription.status === PRESCRIPTION_STATUS.EXPIRED;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={prescription.patient?.avatar} />
                <AvatarFallback>
                  {prescription.patient?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {prescription.patient?.name || 'Paciente não informado'}
                  </h3>
                  {prescription.is_controlled && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Controlada
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-600 gap-4">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    CPF: {prescription.patient?.cpf || 'Não informado'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    Dr(a). {prescription.doctor?.name || 'Médico não informado'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(prescription.status)}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/prescriptions/${prescription.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Link>
                  </DropdownMenuItem>
                  
                  {canEdit && (
                    <DropdownMenuItem asChild>
                      <Link href={`/prescriptions/${prescription.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleGeneratePDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </DropdownMenuItem>
                  
                  {canRenew && (
                    <DropdownMenuItem onClick={handleRenew}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renovar
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {canCancel && (
                    <DropdownMenuItem 
                      onClick={() => setShowCancelDialog(true)}
                      className="text-orange-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                <span className="font-medium">Número:</span>
                <span className="ml-1">{prescription.prescription_number || 'Não gerado'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="font-medium">Emitida em:</span>
                <span className="ml-1">
                  {format(new Date(prescription.issued_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <span className="font-medium">Tipo:</span>
                <span className="ml-1 capitalize">{prescription.prescription_type}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <span className="font-medium">Validade:</span>
                <span className="ml-1">{prescription.validity_days} dias</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {prescription.expires_at && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Expira em:</span>
                  <span className={`ml-1 ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                    {format(new Date(prescription.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              )}
              
              {prescription.medications && prescription.medications.length > 0 && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Medicamentos:</span>
                  <span className="ml-1">{prescription.medications.length}</span>
                </div>
              )}
            </div>
          </div>
          
          {prescription.content && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 line-clamp-2">
                {prescription.content}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Prescrição"
        description="Tem certeza que deseja excluir esta prescrição? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar Prescrição"
        description="Tem certeza que deseja cancelar esta prescrição? Ela não poderá mais ser utilizada."
        confirmText="Cancelar Prescrição"
        cancelText="Manter Ativa"
        variant="destructive"
        onConfirm={handleCancel}
        loading={cancelMutation.isPending}
      />
    </>
  );
}