'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  User,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
  Shield,
  Pill,
  FileText,
  UserCheck,
  Stethoscope,
  Building2,
  CreditCard,
  Eye,
  Edit3,
  ExternalLink,
  Bell,
  Star
} from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface VitalSigns {
  temperature?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  pain?: number; // 0-10 scale
  consciousness?: 'alert' | 'drowsy' | 'confused' | 'unconscious';
  lastUpdated?: Date;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  status: 'active' | 'suspended' | 'completed';
  lastAdministered?: Date;
  nextDue?: Date;
}

interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  notes?: string;
}

interface PatientInfo {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  cpf?: string;
  rg?: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    plan: string;
    cardNumber: string;
  };
  photo?: string;
}

interface AdmissionInfo {
  id: string;
  admissionDate: Date;
  admissionType: 'emergency' | 'elective' | 'transfer' | 'observation';
  department: string;
  attendingPhysician: string;
  diagnosis: string;
  chiefComplaint: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isolationPrecautions?: string[];
  specialCare?: string[];
  dietaryRestrictions?: string[];
  estimatedDischarge?: Date;
  status: 'active' | 'discharged' | 'transferred';
}

interface PatientBedInfoProps {
  patient: PatientInfo;
  admission: AdmissionInfo;
  bedNumber: string;
  roomNumber: string;
  vitalSigns?: VitalSigns;
  medications?: Medication[];
  allergies?: Allergy[];
  className?: string;
  showFullDetails?: boolean;
  onViewFullProfile?: () => void;
  onEditPatient?: () => void;
  onDischarge?: () => void;
  onTransfer?: () => void;
}

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-800' }
};

const admissionTypeConfig = {
  emergency: { label: 'Emergência', color: 'bg-red-100 text-red-800' },
  elective: { label: 'Eletiva', color: 'bg-blue-100 text-blue-800' },
  transfer: { label: 'Transferência', color: 'bg-purple-100 text-purple-800' },
  observation: { label: 'Observação', color: 'bg-gray-100 text-gray-800' }
};

const consciousnessConfig = {
  alert: { label: 'Alerta', color: 'text-green-600' },
  drowsy: { label: 'Sonolento', color: 'text-yellow-600' },
  confused: { label: 'Confuso', color: 'text-orange-600' },
  unconscious: { label: 'Inconsciente', color: 'text-red-600' }
};

export function PatientBedInfo({
  patient,
  admission,
  bedNumber,
  roomNumber,
  vitalSigns,
  medications = [],
  allergies = [],
  className,
  showFullDetails = false,
  onViewFullProfile,
  onEditPatient,
  onDischarge,
  onTransfer
}: PatientBedInfoProps) {
  const [showVitalsDialog, setShowVitalsDialog] = useState(false);
  const [showMedicationsDialog, setShowMedicationsDialog] = useState(false);

  const getAge = () => {
    const today = new Date();
    const birthDate = new Date(patient.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAdmissionDuration = () => {
    const now = new Date();
    const admissionDate = new Date(admission.admissionDate);
    
    const days = differenceInDays(now, admissionDate);
    const hours = differenceInHours(now, admissionDate) % 24;
    const minutes = differenceInMinutes(now, admissionDate) % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getVitalSignsStatus = () => {
    if (!vitalSigns) return 'unknown';
    
    const alerts = [];
    
    // Temperatura
    if (vitalSigns.temperature) {
      if (vitalSigns.temperature > 38 || vitalSigns.temperature < 36) {
        alerts.push('temperature');
      }
    }
    
    // Pressão arterial
    if (vitalSigns.bloodPressure) {
      const { systolic, diastolic } = vitalSigns.bloodPressure;
      if (systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60) {
        alerts.push('bloodPressure');
      }
    }
    
    // Frequência cardíaca
    if (vitalSigns.heartRate) {
      if (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60) {
        alerts.push('heartRate');
      }
    }
    
    // Saturação de oxigênio
    if (vitalSigns.oxygenSaturation) {
      if (vitalSigns.oxygenSaturation < 95) {
        alerts.push('oxygenSaturation');
      }
    }
    
    return alerts.length > 0 ? 'alert' : 'normal';
  };

  const getActiveMedications = () => {
    return medications.filter(med => med.status === 'active');
  };

  const getCriticalAllergies = () => {
    return allergies.filter(allergy => allergy.severity === 'severe');
  };

  const vitalsStatus = getVitalSignsStatus();
  const activeMeds = getActiveMedications();
  const criticalAllergies = getCriticalAllergies();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Cabeçalho do Paciente */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={patient.photo} alt={patient.name} />
                <AvatarFallback>
                  {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{patient.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {getAge()} anos
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", priorityConfig[admission.priority].color)}
                  >
                    {priorityConfig[admission.priority].label}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>Leito {bedNumber} - Quarto {roomNumber}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Internado há {getAdmissionDuration()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {onViewFullProfile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={onViewFullProfile}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver perfil completo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {onEditPatient && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={onEditPatient}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar paciente</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Informações da Internação */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Internação</span>
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", admissionTypeConfig[admission.admissionType].color)}
                  >
                    {admissionTypeConfig[admission.admissionType].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Setor:</span>
                  <span>{admission.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Médico:</span>
                  <span className="text-right">{admission.attendingPhysician}</span>
                </div>
              </div>
            </div>
            
            {/* Sinais Vitais */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Sinais Vitais</span>
                </h4>
                {vitalSigns && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowVitalsDialog(true)}
                    className="h-6 px-2 text-xs"
                  >
                    Ver todos
                  </Button>
                )}
              </div>
              
              {vitalSigns ? (
                <div className="space-y-1 text-sm">
                  {vitalSigns.temperature && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Thermometer className="h-3 w-3" />
                        <span className="text-muted-foreground">Temp:</span>
                      </div>
                      <span className={cn(
                        vitalSigns.temperature > 38 || vitalSigns.temperature < 36 
                          ? 'text-red-600 font-medium' 
                          : ''
                      )}>
                        {vitalSigns.temperature}°C
                      </span>
                    </div>
                  )}
                  
                  {vitalSigns.heartRate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span className="text-muted-foreground">FC:</span>
                      </div>
                      <span className={cn(
                        vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60 
                          ? 'text-red-600 font-medium' 
                          : ''
                      )}>
                        {vitalSigns.heartRate} bpm
                      </span>
                    </div>
                  )}
                  
                  {vitalSigns.oxygenSaturation && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Wind className="h-3 w-3" />
                        <span className="text-muted-foreground">SpO2:</span>
                      </div>
                      <span className={cn(
                        vitalSigns.oxygenSaturation < 95 
                          ? 'text-red-600 font-medium' 
                          : ''
                      )}>
                        {vitalSigns.oxygenSaturation}%
                      </span>
                    </div>
                  )}
                  
                  {vitalsStatus === 'alert' && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Valores alterados</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Não informado</p>
              )}
            </div>
            
            {/* Medicações e Alergias */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Pill className="h-4 w-4" />
                <span>Medicações & Alergias</span>
              </h4>
              
              <div className="space-y-2 text-sm">
                {activeMeds.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Medicações ativas:</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowMedicationsDialog(true)}
                        className="h-6 px-2 text-xs"
                      >
                        Ver {activeMeds.length}
                      </Button>
                    </div>
                  </div>
                )}
                
                {criticalAllergies.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="font-medium">Alergias críticas:</span>
                    </div>
                    {criticalAllergies.slice(0, 2).map(allergy => (
                      <div key={allergy.id} className="text-xs text-red-600 ml-4">
                        • {allergy.allergen}
                      </div>
                    ))}
                    {criticalAllergies.length > 2 && (
                      <div className="text-xs text-red-600 ml-4">
                        +{criticalAllergies.length - 2} mais
                      </div>
                    )}
                  </div>
                )}
                
                {allergies.length === 0 && (
                  <div className="text-muted-foreground">Sem alergias conhecidas</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Precauções e Cuidados Especiais */}
          {(admission.isolationPrecautions?.length || admission.specialCare?.length) && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {admission.isolationPrecautions && admission.isolationPrecautions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center space-x-2 text-orange-600">
                      <Shield className="h-4 w-4" />
                      <span>Precauções de Isolamento</span>
                    </h4>
                    <div className="space-y-1">
                      {admission.isolationPrecautions.map((precaution, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700">
                          {precaution}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {admission.specialCare && admission.specialCare.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center space-x-2 text-blue-600">
                      <Star className="h-4 w-4" />
                      <span>Cuidados Especiais</span>
                    </h4>
                    <div className="space-y-1">
                      {admission.specialCare.map((care, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {care}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Ações */}
          <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
            {onTransfer && (
              <Button variant="outline" size="sm" onClick={onTransfer}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Transferir
              </Button>
            )}
            {onDischarge && (
              <Button variant="outline" size="sm" onClick={onDischarge}>
                <UserCheck className="h-4 w-4 mr-2" />
                Alta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog de Sinais Vitais */}
      {vitalSigns && (
        <Dialog open={showVitalsDialog} onOpenChange={setShowVitalsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Sinais Vitais - {patient.name}</DialogTitle>
              <DialogDescription>
                {vitalSigns.lastUpdated && (
                  `Última atualização: ${format(vitalSigns.lastUpdated, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              {vitalSigns.temperature && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4" />
                    <span className="font-medium">Temperatura</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.temperature}°C</div>
                  <div className="text-sm text-muted-foreground">
                    Normal: 36.0 - 37.5°C
                  </div>
                </div>
              )}
              
              {vitalSigns.bloodPressure && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">Pressão Arterial</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {vitalSigns.bloodPressure.systolic}/{vitalSigns.bloodPressure.diastolic} mmHg
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Normal: &lt;120/80 mmHg
                  </div>
                </div>
              )}
              
              {vitalSigns.heartRate && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span className="font-medium">Frequência Cardíaca</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.heartRate} bpm</div>
                  <div className="text-sm text-muted-foreground">
                    Normal: 60 - 100 bpm
                  </div>
                </div>
              )}
              
              {vitalSigns.respiratoryRate && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4" />
                    <span className="font-medium">Frequência Respiratória</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.respiratoryRate} rpm</div>
                  <div className="text-sm text-muted-foreground">
                    Normal: 12 - 20 rpm
                  </div>
                </div>
              )}
              
              {vitalSigns.oxygenSaturation && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4" />
                    <span className="font-medium">Saturação de O2</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.oxygenSaturation}%</div>
                  <div className="text-sm text-muted-foreground">
                    Normal: &gt;95%
                  </div>
                </div>
              )}
              
              {vitalSigns.consciousness && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Nível de Consciência</span>
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    consciousnessConfig[vitalSigns.consciousness].color
                  )}>
                    {consciousnessConfig[vitalSigns.consciousness].label}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog de Medicações */}
      <Dialog open={showMedicationsDialog} onOpenChange={setShowMedicationsDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Medicações - {patient.name}</DialogTitle>
            <DialogDescription>
              Medicações ativas e histórico de administração
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activeMeds.map(medication => (
              <Card key={medication.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{medication.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            medication.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {medication.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dosagem:</span>
                          <span className="ml-2">{medication.dosage}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequência:</span>
                          <span className="ml-2">{medication.frequency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Via:</span>
                          <span className="ml-2">{medication.route}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prescrito por:</span>
                          <span className="ml-2">{medication.prescribedBy}</span>
                        </div>
                      </div>
                      
                      {medication.nextDue && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-3 w-3" />
                          <span className="text-muted-foreground">Próxima dose:</span>
                          <span className="font-medium">
                            {format(medication.nextDue, 'dd/MM HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}