import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Bed as BedIcon,
  Calculator,
  FileText,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { 
  Bed, 
  Patient, 
  AdmissionForm, 
  PaymentType, 
  BedType,
  DailyRateConfig 
} from '@/types/beds';

interface AdmissionWizardProps {
  availableBeds: Bed[];
  patients: Patient[];
  dailyRates: DailyRateConfig[];
  onSubmit: (admission: AdmissionForm) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: 'Paciente',
    description: 'Selecionar paciente',
    icon: <User className="h-5 w-5" />
  },
  {
    id: 2,
    title: 'Leito',
    description: 'Escolher leito',
    icon: <BedIcon className="h-5 w-5" />
  },
  {
    id: 3,
    title: 'Detalhes',
    description: 'Informações da internação',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 4,
    title: 'Confirmação',
    description: 'Revisar e confirmar',
    icon: <CheckCircle className="h-5 w-5" />
  }
];

const paymentTypes: { value: PaymentType; label: string }[] = [
  { value: 'PRIVATE', label: 'Particular' },
  { value: 'INSURANCE', label: 'Convênio' },
  { value: 'SUS', label: 'SUS' }
];

export default function AdmissionWizard({
  availableBeds,
  patients,
  dailyRates,
  onSubmit,
  onCancel,
  isLoading = false
}: AdmissionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AdmissionForm>>({
    admission_date: new Date(),
    payment_type: 'PRIVATE'
  });
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular custo estimado quando dados relevantes mudarem
  useEffect(() => {
    if (formData.bed_id && formData.payment_type && formData.estimated_days) {
      const selectedBed = availableBeds.find(bed => bed.id === formData.bed_id);
      if (selectedBed) {
        const rate = dailyRates.find(r => 
          r.payment_type === formData.payment_type && 
          r.bed_type === selectedBed.bed_type
        );
        
        if (rate) {
          const days = formData.estimated_days || 1;
          let dailyValue = rate.base_value;
          
          // Aplicar faixas de desconto/acréscimo
          const tier = rate.tiers.find(t => days >= t.min_days && days <= t.max_days);
          if (tier) {
            dailyValue = tier.value;
          }
          
          setEstimatedCost(dailyValue * days);
        }
      }
    }
  }, [formData.bed_id, formData.payment_type, formData.estimated_days, availableBeds, dailyRates]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.patient_id) {
          newErrors.patient_id = 'Selecione um paciente';
        }
        break;
      case 2:
        if (!formData.bed_id) {
          newErrors.bed_id = 'Selecione um leito';
        }
        break;
      case 3:
        if (!formData.admission_date) {
          newErrors.admission_date = 'Data de internação é obrigatória';
        }
        if (!formData.payment_type) {
          newErrors.payment_type = 'Tipo de pagamento é obrigatório';
        }
        if (!formData.estimated_days || formData.estimated_days < 1) {
          newErrors.estimated_days = 'Dias estimados deve ser maior que 0';
        }
        if (!formData.reason) {
          newErrors.reason = 'Motivo da internação é obrigatório';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      onSubmit(formData as AdmissionForm);
    }
  };

  const selectedPatient = patients.find(p => p.id === formData.patient_id);
  const selectedBed = availableBeds.find(b => b.id === formData.bed_id);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Buscar Paciente</Label>
              <Input
                placeholder="Digite o nome ou CPF do paciente..."
                className="mb-4"
              />
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {patients.map(patient => (
                <Card 
                  key={patient.id}
                  className={`cursor-pointer transition-colors ${
                    formData.patient_id === patient.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setFormData({ ...formData, patient_id: patient.id })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{patient.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          CPF: {patient.cpf} • Nascimento: {format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        {patient.phone && (
                          <p className="text-sm text-muted-foreground">
                            Telefone: {patient.phone}
                          </p>
                        )}
                      </div>
                      {formData.patient_id === patient.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {errors.patient_id && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.patient_id}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBeds.map(bed => (
                <Card 
                  key={bed.id}
                  className={`cursor-pointer transition-colors ${
                    formData.bed_id === bed.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setFormData({ ...formData, bed_id: bed.id })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <BedIcon className="h-4 w-4 mr-2" />
                        <span className="font-semibold">Leito {bed.number}</span>
                      </div>
                      {formData.bed_id === bed.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{bed.room.name} - {bed.room.department.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span>Andar: {bed.room.floor}</span>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {bed.bed_type === 'STANDARD' && 'Padrão'}
                        {bed.bed_type === 'ICU' && 'UTI'}
                        {bed.bed_type === 'SEMI_ICU' && 'Semi-UTI'}
                        {bed.bed_type === 'ISOLATION' && 'Isolamento'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {errors.bed_id && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.bed_id}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data de Internação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !formData.admission_date && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.admission_date ? (
                        format(formData.admission_date, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.admission_date}
                      onSelect={(date) => setFormData({ ...formData, admission_date: date })}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {errors.admission_date && (
                  <p className="text-sm text-destructive mt-1">{errors.admission_date}</p>
                )}
              </div>
              
              <div>
                <Label>Tipo de Pagamento</Label>
                <Select 
                  value={formData.payment_type} 
                  onValueChange={(value) => setFormData({ ...formData, payment_type: value as PaymentType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.payment_type && (
                  <p className="text-sm text-destructive mt-1">{errors.payment_type}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Dias Estimados</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.estimated_days || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_days: parseInt(e.target.value) || 1 })}
                  placeholder="Ex: 5"
                />
                {errors.estimated_days && (
                  <p className="text-sm text-destructive mt-1">{errors.estimated_days}</p>
                )}
              </div>
              
              <div>
                <Label>Custo Estimado</Label>
                <div className="flex items-center p-3 border rounded-md bg-muted/50">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-semibold text-green-600">
                    R$ {estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Motivo da Internação</Label>
              <Textarea
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Descreva o motivo da internação..."
                rows={3}
              />
              {errors.reason && (
                <p className="text-sm text-destructive mt-1">{errors.reason}</p>
              )}
            </div>
            
            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais (opcional)..."
                rows={2}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Revise as informações antes de confirmar a internação.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient && (
                    <div className="space-y-2">
                      <p><strong>Nome:</strong> {selectedPatient.name}</p>
                      <p><strong>CPF:</strong> {selectedPatient.cpf}</p>
                      <p><strong>Nascimento:</strong> {format(new Date(selectedPatient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      {selectedPatient.phone && (
                        <p><strong>Telefone:</strong> {selectedPatient.phone}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BedIcon className="h-5 w-5 mr-2" />
                    Leito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedBed && (
                    <div className="space-y-2">
                      <p><strong>Número:</strong> {selectedBed.number}</p>
                      <p><strong>Quarto:</strong> {selectedBed.room.name}</p>
                      <p><strong>Departamento:</strong> {selectedBed.room.department.name}</p>
                      <p><strong>Andar:</strong> {selectedBed.room.floor}º</p>
                      <p><strong>Tipo:</strong> 
                        {selectedBed.bed_type === 'STANDARD' && ' Padrão'}
                        {selectedBed.bed_type === 'ICU' && ' UTI'}
                        {selectedBed.bed_type === 'SEMI_ICU' && ' Semi-UTI'}
                        {selectedBed.bed_type === 'ISOLATION' && ' Isolamento'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Detalhes da Internação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Data de Internação:</strong> {formData.admission_date && format(formData.admission_date, 'dd/MM/yyyy', { locale: ptBR })}</p>
                    <p><strong>Tipo de Pagamento:</strong> {paymentTypes.find(t => t.value === formData.payment_type)?.label}</p>
                    <p><strong>Dias Estimados:</strong> {formData.estimated_days}</p>
                  </div>
                  <div>
                    <p><strong>Custo Estimado:</strong> 
                      <span className="text-green-600 font-semibold ml-2">
                        R$ {estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p><strong>Motivo:</strong></p>
                  <p className="text-muted-foreground mt-1">{formData.reason}</p>
                </div>
                
                {formData.notes && (
                  <div className="mt-4">
                    <p><strong>Observações:</strong></p>
                    <p className="text-muted-foreground mt-1">{formData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : prevStep}
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </Button>
        
        <Button
          onClick={currentStep === steps.length ? handleSubmit : nextStep}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : currentStep === steps.length ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          {currentStep === steps.length ? 'Confirmar Internação' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
}