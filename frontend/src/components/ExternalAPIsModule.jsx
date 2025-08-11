import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  MapPin,
  FileText,
  Pill,
  Settings,
  RefreshCw,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

const ExternalAPIsModule = () => {
  const [activeTab, setActiveTab] = useState('viacep');
  const [loading, setLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState({});
  const [healthStatus, setHealthStatus] = useState({});

  // Estados para ViaCEP
  const [cepData, setCepData] = useState({
    cep: '',
    result: null,
    loading: false
  });

  // Estados para Memed
  const [prescriptionData, setPrescriptionData] = useState({
    patient_name: '',
    patient_cpf: '',
    doctor_crm: '',
    doctor_name: '',
    clinic_name: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    result: null,
    loading: false
  });

  // Estados para ClickSign
  const [documentData, setDocumentData] = useState({
    document_name: '',
    signers: [{ name: '', email: '' }],
    content_base64: '',
    auto_close: true,
    result: null,
    loading: false
  });

  // Carregar configurações das APIs
  useEffect(() => {
    loadApiConfig();
    loadHealthStatus();
  }, []);

  const loadApiConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/external-apis/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const config = await response.json();
        setApiConfig(config);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadHealthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/external-apis/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const health = await response.json();
        setHealthStatus(health);
      }
    } catch (error) {
      console.error('Erro ao verificar health das APIs:', error);
    }
  };

  // Funções para ViaCEP
  const validateCEP = async () => {
    if (!cepData.cep) {
      toast.error('Por favor, informe um CEP');
      return;
    }

    setCepData(prev => ({ ...prev, loading: true, result: null }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/external-apis/cep/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cep: cepData.cep })
      });

      const result = await response.json();
      setCepData(prev => ({ ...prev, result, loading: false }));

      if (result.valid) {
        toast.success('CEP válido encontrado!');
      } else {
        toast.warning('CEP não encontrado ou inválido');
      }
    } catch (error) {
      console.error('Erro ao validar CEP:', error);
      toast.error('Erro ao validar CEP');
      setCepData(prev => ({ ...prev, loading: false }));
    }
  };

  // Funções para Memed
  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const createPrescription = async () => {
    if (!prescriptionData.patient_name || !prescriptionData.patient_cpf || 
        !prescriptionData.doctor_crm || !prescriptionData.doctor_name) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setPrescriptionData(prev => ({ ...prev, loading: true, result: null }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/external-apis/memed/prescription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_name: prescriptionData.patient_name,
          patient_cpf: prescriptionData.patient_cpf,
          doctor_crm: prescriptionData.doctor_crm,
          doctor_name: prescriptionData.doctor_name,
          clinic_name: prescriptionData.clinic_name,
          medications: prescriptionData.medications.filter(med => med.name)
        })
      });

      const result = await response.json();
      setPrescriptionData(prev => ({ ...prev, result, loading: false }));

      if (result.success) {
        toast.success('Prescrição criada com sucesso!');
      } else {
        toast.error(result.message || 'Erro ao criar prescrição');
      }
    } catch (error) {
      console.error('Erro ao criar prescrição:', error);
      toast.error('Erro ao criar prescrição');
      setPrescriptionData(prev => ({ ...prev, loading: false }));
    }
  };

  // Funções para ClickSign
  const addSigner = () => {
    setDocumentData(prev => ({
      ...prev,
      signers: [...prev.signers, { name: '', email: '' }]
    }));
  };

  const removeSigner = (index) => {
    setDocumentData(prev => ({
      ...prev,
      signers: prev.signers.filter((_, i) => i !== index)
    }));
  };

  const updateSigner = (index, field, value) => {
    setDocumentData(prev => ({
      ...prev,
      signers: prev.signers.map((signer, i) => 
        i === index ? { ...signer, [field]: value } : signer
      )
    }));
  };

  const createDocument = async () => {
    if (!documentData.document_name || !documentData.content_base64 || 
        documentData.signers.some(s => !s.name || !s.email)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setDocumentData(prev => ({ ...prev, loading: true, result: null }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/external-apis/clicksign/document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_name: documentData.document_name,
          signers: documentData.signers.filter(s => s.name && s.email),
          content_base64: documentData.content_base64,
          auto_close: documentData.auto_close
        })
      });

      const result = await response.json();
      setDocumentData(prev => ({ ...prev, result, loading: false }));

      if (result.success) {
        toast.success('Documento criado com sucesso!');
      } else {
        toast.error(result.message || 'Erro ao criar documento');
      }
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      toast.error('Erro ao criar documento');
      setDocumentData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        setDocumentData(prev => ({ ...prev, content_base64: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusIcon = (status) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">APIs Externas</h1>
          <p className="text-muted-foreground">
            Integração com serviços externos para validação de CEP, prescrições médicas e assinatura digital
          </p>
        </div>
        <Button onClick={loadHealthStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Status
        </Button>
      </div>

      {/* Status das APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status das APIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(apiConfig).map(([api, config]) => (
              <div key={api} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium capitalize">{api}</div>
                  <div className="text-sm text-muted-foreground">{config.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(config.configured)}
                  <Badge variant={config.configured ? 'default' : 'destructive'}>
                    {config.configured ? 'Configurada' : 'Não Configurada'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="viacep" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            ViaCEP
          </TabsTrigger>
          <TabsTrigger value="memed" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Memed
          </TabsTrigger>
          <TabsTrigger value="clicksign" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            ClickSign
          </TabsTrigger>
        </TabsList>

        {/* ViaCEP Tab */}
        <TabsContent value="viacep">
          <Card>
            <CardHeader>
              <CardTitle>Validação de CEP</CardTitle>
              <CardDescription>
                Valide CEPs e obtenha endereços completos usando a API ViaCEP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={cepData.cep}
                    onChange={(e) => setCepData(prev => ({ ...prev, cep: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={validateCEP} 
                    disabled={cepData.loading}
                    className="flex items-center gap-2"
                  >
                    {cepData.loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    Validar CEP
                  </Button>
                </div>
              </div>

              {cepData.result && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {cepData.result.valid ? (
                      <div className="space-y-2">
                        <div className="font-medium text-green-600">CEP Válido!</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><strong>Logradouro:</strong> {cepData.result.address?.logradouro}</div>
                          <div><strong>Bairro:</strong> {cepData.result.address?.bairro}</div>
                          <div><strong>Cidade:</strong> {cepData.result.address?.localidade}</div>
                          <div><strong>UF:</strong> {cepData.result.address?.uf}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium text-red-600">{cepData.result.message}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memed Tab */}
        <TabsContent value="memed">
          <Card>
            <CardHeader>
              <CardTitle>Prescrição Médica Digital</CardTitle>
              <CardDescription>
                Crie prescrições médicas digitais usando a API Memed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!apiConfig.memed?.configured && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    A API Memed não está configurada. Configure as credenciais no arquivo .env
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_name">Nome do Paciente *</Label>
                  <Input
                    id="patient_name"
                    value={prescriptionData.patient_name}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, patient_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="patient_cpf">CPF do Paciente *</Label>
                  <Input
                    id="patient_cpf"
                    value={prescriptionData.patient_cpf}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, patient_cpf: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="doctor_crm">CRM do Médico *</Label>
                  <Input
                    id="doctor_crm"
                    value={prescriptionData.doctor_crm}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, doctor_crm: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="doctor_name">Nome do Médico *</Label>
                  <Input
                    id="doctor_name"
                    value={prescriptionData.doctor_name}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, doctor_name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clinic_name">Nome da Clínica</Label>
                <Input
                  id="clinic_name"
                  value={prescriptionData.clinic_name}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, clinic_name: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Medicamentos</Label>
                  <Button onClick={addMedication} variant="outline" size="sm">
                    Adicionar Medicamento
                  </Button>
                </div>
                {prescriptionData.medications.map((med, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2 p-3 border rounded">
                    <Input
                      placeholder="Nome do medicamento"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Dosagem"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    />
                    <Input
                      placeholder="Frequência"
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Duração"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      />
                      <Button 
                        onClick={() => removeMedication(index)} 
                        variant="destructive" 
                        size="sm"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={createPrescription} 
                disabled={prescriptionData.loading || !apiConfig.memed?.configured}
                className="w-full"
              >
                {prescriptionData.loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Pill className="h-4 w-4 mr-2" />
                )}
                Criar Prescrição
              </Button>

              {prescriptionData.result && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {prescriptionData.result.success ? (
                      <div className="space-y-2">
                        <div className="font-medium text-green-600">Prescrição criada com sucesso!</div>
                        {prescriptionData.result.prescription_id && (
                          <div className="text-sm">
                            <strong>ID:</strong> {prescriptionData.result.prescription_id}
                          </div>
                        )}
                        {prescriptionData.result.prescription_url && (
                          <div className="text-sm">
                            <strong>URL:</strong> 
                            <a 
                              href={prescriptionData.result.prescription_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-1"
                            >
                              Visualizar Prescrição
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-medium text-red-600">{prescriptionData.result.message}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ClickSign Tab */}
        <TabsContent value="clicksign">
          <Card>
            <CardHeader>
              <CardTitle>Assinatura Digital</CardTitle>
              <CardDescription>
                Crie documentos para assinatura digital usando ClickSign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!apiConfig.clicksign?.configured && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    A API ClickSign não está configurada. Configure as credenciais no arquivo .env
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="document_name">Nome do Documento *</Label>
                <Input
                  id="document_name"
                  value={documentData.document_name}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, document_name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="document_file">Arquivo do Documento (PDF) *</Label>
                <Input
                  id="document_file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Signatários</Label>
                  <Button onClick={addSigner} variant="outline" size="sm">
                    Adicionar Signatário
                  </Button>
                </div>
                {documentData.signers.map((signer, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2 p-3 border rounded">
                    <Input
                      placeholder="Nome do signatário"
                      value={signer.name}
                      onChange={(e) => updateSigner(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Email do signatário"
                      type="email"
                      value={signer.email}
                      onChange={(e) => updateSigner(index, 'email', e.target.value)}
                    />
                    <Button 
                      onClick={() => removeSigner(index)} 
                      variant="destructive" 
                      size="sm"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_close"
                  checked={documentData.auto_close}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, auto_close: e.target.checked }))}
                />
                <Label htmlFor="auto_close">Fechar automaticamente após todas as assinaturas</Label>
              </div>

              <Button 
                onClick={createDocument} 
                disabled={documentData.loading || !apiConfig.clicksign?.configured}
                className="w-full"
              >
                {documentData.loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Criar Documento
              </Button>

              {documentData.result && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {documentData.result.success ? (
                      <div className="space-y-2">
                        <div className="font-medium text-green-600">Documento criado com sucesso!</div>
                        {documentData.result.document_key && (
                          <div className="text-sm">
                            <strong>Chave:</strong> {documentData.result.document_key}
                          </div>
                        )}
                        {documentData.result.document_url && (
                          <div className="text-sm">
                            <strong>URL:</strong> 
                            <a 
                              href={documentData.result.document_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-1"
                            >
                              Visualizar Documento
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-medium text-red-600">{documentData.result.message}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExternalAPIsModule;