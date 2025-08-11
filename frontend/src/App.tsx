import React, { useState, useEffect } from 'react'
import './App.css'
import AdvancedStockManagementModule from './components/AdvancedStockManagementModule.jsx'
import SystemConfigurationModule from './components/SystemConfigurationModule.jsx'
import ReportsAndBIModule from './components/ReportsAndBIModule.jsx'
import TelemedicineModule from './components/TelemedicineModule.jsx'
import AnalyticsAIModule from './components/AnalyticsAIModule.jsx'
import MedicalDevicesModule from './components/MedicalDevicesModule.jsx'
import SecurityLGPDModule from './components/SecurityLGPDModule.jsx'
import TechnicalExtrasModule from './components/TechnicalExtrasModule.jsx'
import CompanionsVisitorsModule from './components/CompanionsVisitorsModule.jsx'

// Tipos para notificações
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
}

// Componente de Notificações
const NotificationCenter = ({ notifications, onDismiss }: { 
  notifications: Notification[]
  onDismiss: (id: string) => void 
}) => {
  if (notifications.length === 0) return null

  return (
    <div className="notification-center">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <span className="notification-message">{notification.message}</span>
          <button 
            className="notification-close" 
            onClick={() => onDismiss(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

// Componente de Breadcrumbs
const Breadcrumbs = ({ items }: { items: Array<{ label: string; path?: string }> }) => {
  return (
    <nav className="breadcrumbs">
      {items.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {item.path ? (
            <button className="breadcrumb-link" onClick={() => {}}>
              {item.label}
            </button>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
          {index < items.length - 1 && <span className="breadcrumb-separator">›</span>}
        </span>
      ))}
    </nav>
  )
}

// Componente de Seletor de Clínica
const ClinicSelector = ({ currentClinic, clinics, onClinicChange }: {
  currentClinic: any
  clinics: any[]
  onClinicChange: (clinic: any) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="clinic-selector">
      <button 
        className="clinic-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="clinic-icon">🏥</span>
        <span className="clinic-name">{currentClinic?.name || 'Selecionar Clínica'}</span>
        <span className="clinic-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="clinic-dropdown">
          {clinics.map((clinic) => (
            <button
              key={clinic.id}
              className={`clinic-option ${currentClinic?.id === clinic.id ? 'active' : ''}`}
              onClick={() => {
                onClinicChange(clinic)
                setIsOpen(false)
              }}
            >
              <span className="clinic-option-name">{clinic.name}</span>
              <span className="clinic-option-cnpj">{clinic.cnpj}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}



// Componente de Login
const LoginForm = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onLogin(data.access_token)
      } else {
        setError('Credenciais inválidas')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Sistema Clínico Profissional</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuário:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Tipos para o módulo de pacientes
interface Patient {
  id?: string
  // Dados pessoais
  full_name: string
  cpf: string
  rg: string
  birth_date: string
  gender: 'M' | 'F' | 'O'
  marital_status: string
  profession: string
  nationality: string
  birth_place: string
  
  // Contatos
  phone: string
  mobile: string
  email: string
  emergency_contact_name: string
  emergency_contact_phone: string
  
  // Endereço
  address: string
  address_number: string
  address_complement: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  
  // Convênios
  insurance_company: string
  insurance_number: string
  insurance_validity: string
  
  // Dados complementares
  blood_type: string
  allergies: string
  comorbidities: string
  medications_in_use: string
  observations: string
  
  // Documentos
  documents?: File[]
}

interface MedicalRecord {
  id: number
  patientId: number
  date: string
  time: string
  doctor: string
  specialty: string
  type: 'consulta' | 'exame' | 'procedimento' | 'retorno'
  diagnosis: string
  prescription: string
  evolution: string
  observations: string
  attachments?: string[]
}

interface Appointment {
  id: number
  patientId: number
  date: string
  time: string
  doctor: string
  specialty: string
  status: 'agendado' | 'realizado' | 'cancelado' | 'faltou'
  type: string
  observations: string
}

interface Exam {
  id: number
  patientId: number
  date: string
  type: string
  result: string
  doctor: string
  status: 'solicitado' | 'realizado' | 'entregue'
  attachments?: string[]
}

// Interfaces para Gestão de Leitos e Internações
interface Bed {
  id: number
  roomNumber: string // Número do Quarto
  bedNumber: string  // Número do Leito
  number: string     // Identificação completa (ex: "101-A")
  sector: string
  type: 'enfermaria' | 'uti' | 'semi-intensivo' | 'isolamento' | 'cirurgico'
  status: 'livre' | 'ocupado' | 'manutencao' | 'bloqueado' | 'higienizacao'
  patientId?: number
  patient_name?: string
  admission_date?: string
  lastCleaning?: string
  observations?: string
}

interface Hospitalization {
  id: number
  patientId: number
  bedId: number
  admissionDate: string
  admissionTime: string
  dischargeDate?: string
  dischargeTime?: string
  admissionReason: string
  admittingDoctor: string
  currentDoctor: string
  status: 'internado' | 'alta' | 'transferido' | 'obito'
  dischargeType?: 'alta_medica' | 'alta_pedido' | 'transferencia' | 'obito' | 'evasao'
  observations?: string
  companions?: Companion[]
}

interface Companion {
  id: number
  hospitalizationId: number
  name: string
  cpf: string
  relationship: string
  phone: string
  authorized: boolean
  startDate: string
  endDate?: string
}

interface Alert {
  id: number
  patientId: number
  type: 'medicacao' | 'exame' | 'retorno' | 'critico' | 'alergia'
  title: string
  message: string
  priority: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'ativo' | 'resolvido' | 'ignorado'
  createdAt: string
  resolvedAt?: string
  assignedTo?: string
}

interface VitalSigns {
  id: number
  patientId: number
  hospitalizationId?: number
  timestamp: string
  temperature?: number
  bloodPressureSys?: number
  bloodPressureDia?: number
  heartRate?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  weight?: number
  height?: number
  bloodGlucose?: number
  pain?: number
  consciousness?: 'alerta' | 'sonolento' | 'confuso' | 'inconsciente'
  recordedBy: string
  deviceId?: string
}

// Interfaces para Auditoria e Compliance
interface AuditLog {
  id: number
  userId: number
  userName: string
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'print'
  resource: 'patient' | 'medical_record' | 'appointment' | 'exam' | 'prescription' | 'document'
  resourceId?: number
  patientId?: number
  patientName?: string
  timestamp: string
  ipAddress: string
  userAgent: string
  details?: string
  sensitive: boolean
  lgpdCompliant: boolean
}

interface AccessLog {
  id: number
  userId: number
  userName: string
  patientId: number
  patientName: string
  accessType: 'view' | 'edit' | 'export' | 'print'
  timestamp: string
  duration?: number
  ipAddress: string
  justification?: string
  authorized: boolean
}

interface ComplianceReport {
  id: number
  type: 'lgpd' | 'access_control' | 'data_retention' | 'backup' | 'security'
  title: string
  description: string
  period: string
  generatedAt: string
  generatedBy: string
  status: 'compliant' | 'non_compliant' | 'warning'
  findings: ComplianceFinding[]
  recommendations: string[]
  nextReview: string
}

interface ComplianceFinding {
  id: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string
  affectedRecords: number
  remediation: string
  deadline: string
  status: 'open' | 'in_progress' | 'resolved'
}

// Interfaces para Integração com Sistemas Externos
interface DataSusIntegration {
  id: number
  patientId: number
  patientName: string
  cpf: string
  cns?: string
  integrationDate: string
  lastSync: string
  status: 'active' | 'pending' | 'error' | 'disabled'
  sihData?: SihData
  sisregData?: SisregData
  cnesData?: CnesData
  syncErrors: IntegrationError[]
  nextSync: string
}

interface SihData {
  aih?: string
  procedureCode?: string
  procedureName?: string
  admissionDate?: string
  dischargeDate?: string
  hospitalCode?: string
  hospitalName?: string
  totalValue?: number
  status: 'active' | 'discharged' | 'transferred'
}

interface SisregData {
  regulationId?: string
  requestDate?: string
  specialty?: string
  priority?: 'routine' | 'urgent' | 'emergency'
  status: 'waiting' | 'scheduled' | 'attended' | 'cancelled'
  estimatedDate?: string
  providerCode?: string
  providerName?: string
}

interface CnesData {
  establishmentCode?: string
  establishmentName?: string
  professionalCode?: string
  professionalName?: string
  specialty?: string
  validationDate?: string
  status: 'active' | 'inactive' | 'suspended'
}

interface ExternalSystem {
  id: number
  name: string
  type: 'datasus' | 'laboratory' | 'pacs' | 'pharmacy' | 'insurance'
  endpoint: string
  status: 'connected' | 'disconnected' | 'error' | 'maintenance'
  lastConnection: string
  version: string
  authentication: 'token' | 'certificate' | 'basic' | 'oauth'
  configuration: Record<string, any>
  healthCheck: boolean
  responseTime?: number
}

interface IntegrationLog {
  id: number
  systemId: number
  systemName: string
  operation: 'sync' | 'send' | 'receive' | 'validate' | 'transform'
  timestamp: string
  status: 'success' | 'error' | 'warning' | 'timeout'
  recordsProcessed: number
  recordsSuccess: number
  recordsError: number
  duration: number
  errorMessage?: string
  details?: Record<string, any>
}

interface IntegrationError {
  id: number
  timestamp: string
  errorCode: string
  errorMessage: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  resolution?: string
  resolvedAt?: string
}

// Componente do Módulo de Pacientes
const PatientModule = ({ addNotification, token }: { 
  addNotification: (type: Notification['type'], message: string) => void
  token: string 
}) => {
  const [view, setView] = useState<'list' | 'form' | 'history' | 'beds' | 'hospitalizations' | 'alerts' | 'vitals' | 'auditoria' | 'integracao'>('list')
   const [patients, setPatients] = useState<Patient[]>([])
   const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
   const [searchTerm, setSearchTerm] = useState('')
   const [loading, setLoading] = useState(false)
   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
   const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
   const [appointments, setAppointments] = useState<Appointment[]>([])
   const [exams, setExams] = useState<Exam[]>([])
   const [historyLoading, setHistoryLoading] = useState(false)
   
   // Estados para filtros avançados
   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
   const [filters, setFilters] = useState({
     ageGroup: '',
     insurance: '',
     bloodType: '',
     hasAllergies: '',
     hasComorbidities: '',
     registrationDateFrom: '',
     registrationDateTo: '',
     lastConsultationFrom: '',
     lastConsultationTo: ''
   })
   const [sortBy, setSortBy] = useState('name')
   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
   
   // Estados para Gestão de Leitos e Internações
   const [beds, setBeds] = useState<Bed[]>([])
   const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([])
   const [alerts, setAlerts] = useState<Alert[]>([])
   const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([])
   const [selectedBed, setSelectedBed] = useState<Bed | null>(null)
   const [selectedHospitalization, setSelectedHospitalization] = useState<Hospitalization | null>(null)
   const [showBedManagement, setShowBedManagement] = useState(false)
   const [showAlerts, setShowAlerts] = useState(false)
   const [showVitalSigns, setShowVitalSigns] = useState(false)
   const [showBedForm, setShowBedForm] = useState(false)
   const [editingBed, setEditingBed] = useState<Bed | null>(null)
   const [showPatientAssignment, setShowPatientAssignment] = useState(false)
   const [alertFilter, setAlertFilter] = useState('todos')
   const [alertStatusFilter, setAlertStatusFilter] = useState('todos')
   const [bedFormData, setBedFormData] = useState({
     roomNumber: '',
     bedNumber: '',
     sector: '',
     type: 'enfermaria',
     observations: ''
   })
   
   // Estados para Auditoria e Compliance
   const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
   const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([])
   const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
   const [showAuditoria, setShowAuditoria] = useState(false)
   const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null)
   
   // Estados para Integração com Sistemas Externos
   const [dataSusIntegration, setDataSusIntegration] = useState<DataSusIntegration[]>([])
   const [externalSystems, setExternalSystems] = useState<ExternalSystem[]>([])
   const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([])
   const [showIntegracao, setShowIntegracao] = useState(false)
   const [selectedIntegration, setSelectedIntegration] = useState<DataSusIntegration | null>(null)
  
  // Estado do formulário
  const [formData, setFormData] = useState<Patient>({
    full_name: '',
    cpf: '',
    rg: '',
    birth_date: '',
    gender: 'M',
    marital_status: '',
    profession: '',
    nationality: 'Brasileira',
    birth_place: '',
    phone: '',
    mobile: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    insurance_company: '',
    insurance_number: '',
    insurance_validity: '',
    blood_type: '',
    allergies: '',
    comorbidities: '',
    medications_in_use: '',
    observations: ''
  })
  
  // Carregar pacientes (usando dados mock)
  const loadPatients = async () => {
    setLoading(true)
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Dados mock de pacientes
      const mockPatients: Patient[] = [
        {
          id: 1,
          full_name: 'Maria Silva Santos',
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
          birth_date: '1985-03-15',
          gender: 'F',
          marital_status: 'Casada',
          profession: 'Professora',
          nationality: 'Brasileira',
          birth_place: 'São Paulo, SP',
          phone: '(11) 3456-7890',
          mobile: '(11) 98765-4321',
          email: 'maria.silva@email.com',
          emergency_contact_name: 'João Santos',
          emergency_contact_phone: '(11) 99999-8888',
          address: 'Rua das Flores, 123',
          address_number: '123',
          address_complement: 'Apto 45',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567',
          insurance_company: 'Unimed',
          insurance_number: '123456789',
          insurance_validity: '2024-12-31',
          blood_type: 'O+',
          allergies: 'Penicilina',
          comorbidities: 'Hipertensão',
          medications_in_use: 'Losartana 50mg',
          observations: 'Paciente colaborativa'
        },
        {
          id: 2,
          full_name: 'José Carlos Oliveira',
          cpf: '987.654.321-00',
          rg: '98.765.432-1',
          birth_date: '1978-07-22',
          gender: 'M',
          marital_status: 'Solteiro',
          profession: 'Engenheiro',
          nationality: 'Brasileira',
          birth_place: 'Rio de Janeiro, RJ',
          phone: '(21) 2345-6789',
          mobile: '(21) 87654-3210',
          email: 'jose.oliveira@email.com',
          emergency_contact_name: 'Ana Oliveira',
          emergency_contact_phone: '(21) 88888-7777',
          address: 'Av. Copacabana, 456',
          address_number: '456',
          address_complement: '',
          neighborhood: 'Copacabana',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zip_code: '22070-001',
          insurance_company: 'Bradesco Saúde',
          insurance_number: '987654321',
          insurance_validity: '2024-06-30',
          blood_type: 'A+',
          allergies: 'Nenhuma conhecida',
          comorbidities: 'Diabetes tipo 2',
          medications_in_use: 'Metformina 850mg',
          observations: 'Paciente pontual'
        }
      ]
      
      setPatients(mockPatients)
      addNotification('success', 'Pacientes carregados com sucesso!')
    } catch (err) {
      addNotification('error', 'Erro ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }
  
  // Salvar paciente (usando dados mock)
  const savePatient = async () => {
    setLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingPatient) {
        // Atualizar paciente existente
        setPatients(prev => prev.map(p => 
          p.id === editingPatient.id ? { ...formData, id: editingPatient.id } : p
        ))
        addNotification('success', 'Paciente atualizado com sucesso!')
      } else {
        // Criar novo paciente
        const newPatient = {
          ...formData,
          id: Date.now() // ID temporário baseado em timestamp
        }
        setPatients(prev => [...prev, newPatient])
        addNotification('success', 'Paciente cadastrado com sucesso!')
      }
      
      setView('list')
      setEditingPatient(null)
      resetForm()
    } catch (err) {
      addNotification('error', 'Erro ao salvar paciente')
    } finally {
      setLoading(false)
    }
  }
  
  // Resetar formulário
  const resetForm = () => {
    setFormData({
      full_name: '',
      cpf: '',
      rg: '',
      birth_date: '',
      gender: 'M',
      marital_status: '',
      profession: '',
      nationality: 'Brasileira',
      birth_place: '',
      phone: '',
      mobile: '',
      email: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: '',
      address_number: '',
      address_complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      insurance_company: '',
      insurance_number: '',
      insurance_validity: '',
      blood_type: '',
      allergies: '',
      comorbidities: '',
      medications_in_use: '',
      observations: ''
    })
  }
  
  // Editar paciente
  const editPatient = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData(patient)
    setView('form')
  }
  
  // Buscar CEP
  const searchCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }))
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err)
      }
    }
  }
  
  // Função para carregar histórico clínico do paciente
  const loadPatientHistory = async (patientId: string) => {
    setHistoryLoading(true)
    try {
      // Simular dados de histórico clínico
      const mockMedicalRecords: MedicalRecord[] = [
        {
          id: 1,
          patientId: parseInt(patientId),
          date: '2024-01-15',
          time: '14:30',
          doctor: 'Dr. João Silva',
          specialty: 'Cardiologia',
          type: 'consulta',
          diagnosis: 'Hipertensão arterial leve',
          prescription: 'Losartana 50mg - 1x ao dia\nHidroclotiazida 25mg - 1x ao dia',
          evolution: 'Paciente apresenta melhora dos sintomas após início do tratamento.',
          observations: 'Retorno em 30 dias para reavaliação'
        },
        {
          id: 2,
          patientId: parseInt(patientId),
          date: '2024-02-20',
          time: '10:15',
          doctor: 'Dr. Maria Santos',
          specialty: 'Clínica Geral',
          type: 'retorno',
          diagnosis: 'Acompanhamento hipertensão',
          prescription: 'Manter medicação atual',
          evolution: 'Pressão arterial controlada. Paciente aderente ao tratamento.',
          observations: 'Solicitar exames de rotina'
        }
      ]

      const mockAppointments: Appointment[] = [
        {
          id: 1,
          patientId: parseInt(patientId),
          date: '2024-03-15',
          time: '09:00',
          doctor: 'Dr. João Silva',
          specialty: 'Cardiologia',
          status: 'agendado',
          type: 'Consulta de retorno',
          observations: 'Trazer exames solicitados'
        },
        {
          id: 2,
          patientId: parseInt(patientId),
          date: '2024-02-20',
          time: '10:15',
          doctor: 'Dr. Maria Santos',
          specialty: 'Clínica Geral',
          status: 'realizado',
          type: 'Consulta de retorno',
          observations: 'Paciente compareceu no horário'
        }
      ]

      const mockExams: Exam[] = [
        {
          id: 1,
          patientId: parseInt(patientId),
          date: '2024-02-25',
          type: 'Hemograma completo',
          result: 'Valores dentro da normalidade',
          doctor: 'Dr. Maria Santos',
          status: 'entregue'
        },
        {
          id: 2,
          patientId: parseInt(patientId),
          date: '2024-02-25',
          type: 'Glicemia de jejum',
          result: '95 mg/dL - Normal',
          doctor: 'Dr. Maria Santos',
          status: 'entregue'
        },
        {
          id: 3,
          patientId: parseInt(patientId),
          date: '2024-03-01',
          type: 'Eletrocardiograma',
          result: 'Aguardando resultado',
          doctor: 'Dr. João Silva',
          status: 'realizado'
        }
      ]

      setMedicalRecords(mockMedicalRecords)
      setAppointments(mockAppointments)
      setExams(mockExams)
      
      addNotification('success', 'Histórico clínico carregado com sucesso!')
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      addNotification('error', 'Erro ao carregar histórico clínico')
    } finally {
      setHistoryLoading(false)
    }
  }

  // Função para visualizar histórico do paciente
  const viewPatientHistory = (patient: Patient) => {
    setSelectedPatient(patient)
    setView('history')
    if (patient.id) {
      loadPatientHistory(patient.id)
    }
  }
  
  // Função para calcular idade
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Função para determinar faixa etária
  const getAgeGroup = (birthDate: string) => {
    const age = calculateAge(birthDate)
    if (age < 12) return 'crianca'
    if (age < 18) return 'adolescente'
    if (age < 60) return 'adulto'
    return 'idoso'
  }

  // Funções para Gestão de Leitos e Internações
  const loadBeds = async () => {
    setLoading(true)
    try {
      // Simular dados de leitos
      const mockBeds: Bed[] = [
        {
          id: 1,
          number: '101',
          roomNumber: '101',
          bedNumber: 'A',
          sector: 'Enfermaria Geral',
          type: 'enfermaria',
          status: 'ocupado',
          patientId: 1,
          patient_name: 'João Silva Santos',
          admission_date: '2024-01-10',
          lastCleaning: '2024-01-15T08:00:00',
          observations: 'Leito com equipamento de oxigênio'
        },
        {
          id: 2,
          number: '102',
          roomNumber: '101',
          bedNumber: 'B',
          sector: 'Enfermaria Geral',
          type: 'enfermaria',
          status: 'livre',
          lastCleaning: '2024-01-15T10:30:00'
        },
        {
          id: 3,
          number: 'UTI-01',
          roomNumber: '201',
          bedNumber: '01',
          sector: 'UTI',
          type: 'uti',
          status: 'ocupado',
          patientId: 2,
          patient_name: 'Maria Oliveira Costa',
          admission_date: '2024-01-12',
          lastCleaning: '2024-01-15T06:00:00',
          observations: 'Paciente em estado crítico'
        },
        {
          id: 4,
          number: 'UTI-02',
          roomNumber: '201',
          bedNumber: '02',
          sector: 'UTI',
          type: 'uti',
          status: 'manutencao',
          lastCleaning: '2024-01-14T20:00:00',
          observations: 'Equipamento em manutenção preventiva'
        },
        {
          id: 5,
          number: '103',
          roomNumber: '102',
          bedNumber: 'A',
          sector: 'Enfermaria Geral',
          type: 'enfermaria',
          status: 'livre',
          lastCleaning: '2024-01-15T09:00:00'
        },
        {
          id: 6,
          number: '104',
          roomNumber: '102',
          bedNumber: 'B',
          sector: 'Enfermaria Geral',
          type: 'enfermaria',
          status: 'livre',
          lastCleaning: '2024-01-15T11:00:00'
        }
      ]
      setBeds(mockBeds)
      addNotification('success', 'Leitos carregados com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar leitos')
    } finally {
      setLoading(false)
    }
  }

  const loadHospitalizations = async () => {
    setLoading(true)
    try {
      // Simular dados de internações
      const mockHospitalizations: Hospitalization[] = [
        {
          id: 1,
          patientId: 1,
          bedId: 1,
          admissionDate: '2024-01-10',
          admissionTime: '14:30',
          admissionReason: 'Pneumonia bacteriana',
          admittingDoctor: 'Dr. João Silva',
          currentDoctor: 'Dr. João Silva',
          status: 'internado',
          observations: 'Paciente estável, respondendo bem ao tratamento'
        },
        {
          id: 2,
          patientId: 2,
          bedId: 3,
          admissionDate: '2024-01-12',
          admissionTime: '08:15',
          admissionReason: 'Infarto agudo do miocárdio',
          admittingDoctor: 'Dr. Maria Santos',
          currentDoctor: 'Dr. Carlos Lima',
          status: 'internado',
          observations: 'Paciente em UTI, quadro estabilizado'
        }
      ]
      setHospitalizations(mockHospitalizations)
      addNotification('success', 'Internações carregadas com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar internações')
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    setLoading(true)
    try {
      // Simular dados de alertas
      const mockAlerts: Alert[] = [
        {
          id: 1,
          patientId: 1,
          type: 'medicacao',
          title: 'Horário de Medicação',
          message: 'Antibiótico deve ser administrado às 14:00',
          priority: 'alta',
          status: 'ativo',
          createdAt: '2024-01-15T13:45:00',
          assignedTo: 'Enfermeira Ana'
        },
        {
          id: 2,
          patientId: 2,
          type: 'critico',
          title: 'Paciente Crítico',
          message: 'Monitoramento contínuo necessário',
          priority: 'critica',
          status: 'ativo',
          createdAt: '2024-01-15T08:00:00',
          assignedTo: 'Dr. Carlos Lima'
        },
        {
          id: 3,
          patientId: 1,
          type: 'exame',
          title: 'Exame Pendente',
          message: 'Raio-X de tórax agendado para hoje às 16:00',
          priority: 'media',
          status: 'ativo',
          createdAt: '2024-01-15T09:00:00',
          assignedTo: 'Técnico Radiologia'
        }
      ]
      setAlerts(mockAlerts)
      addNotification('success', 'Alertas carregados com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar alertas')
    } finally {
      setLoading(false)
    }
  }

  const loadVitalSigns = async (patientId?: number) => {
    setLoading(true)
    try {
      // Simular dados de sinais vitais
      const mockVitalSigns: VitalSigns[] = [
        {
          id: 1,
          patientId: patientId || 1,
          hospitalizationId: 1,
          timestamp: '2024-01-15T08:00:00',
          temperature: 37.2,
          bloodPressureSys: 130,
          bloodPressureDia: 85,
          heartRate: 78,
          respiratoryRate: 18,
          oxygenSaturation: 98,
          weight: 70.5,
          bloodGlucose: 95,
          pain: 3,
          consciousness: 'alerta',
          recordedBy: 'Enfermeira Ana'
        },
        {
          id: 2,
          patientId: patientId || 1,
          hospitalizationId: 1,
          timestamp: '2024-01-15T14:00:00',
          temperature: 36.8,
          bloodPressureSys: 125,
          bloodPressureDia: 80,
          heartRate: 75,
          respiratoryRate: 16,
          oxygenSaturation: 99,
          pain: 2,
          consciousness: 'alerta',
          recordedBy: 'Enfermeira Ana'
        }
      ]
      setVitalSigns(mockVitalSigns)
      addNotification('success', 'Sinais vitais carregados com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar sinais vitais')
    } finally {
      setLoading(false)
    }
  }

  // Funções para Gestão de Leitos
  const saveBed = async () => {
    setLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const bedNumber = `${bedFormData.roomNumber}-${bedFormData.bedNumber}`
      
      if (editingBed) {
        // Atualizar leito existente
        setBeds(prev => prev.map(bed => 
          bed.id === editingBed.id ? {
            ...bed,
            roomNumber: bedFormData.roomNumber,
            bedNumber: bedFormData.bedNumber,
            number: bedNumber,
            sector: bedFormData.sector,
            type: bedFormData.type as 'enfermaria' | 'uti' | 'semi_intensivo',
            observations: bedFormData.observations,
            lastCleaning: new Date().toISOString()
          } : bed
        ))
        addNotification('success', 'Leito atualizado com sucesso!')
      } else {
        // Criar novo leito
        const newBed: Bed = {
          id: Date.now(),
          roomNumber: bedFormData.roomNumber,
          bedNumber: bedFormData.bedNumber,
          number: bedNumber,
          sector: bedFormData.sector,
          type: bedFormData.type as 'enfermaria' | 'uti' | 'semi_intensivo',
          status: 'livre',
          lastCleaning: new Date().toISOString(),
          observations: bedFormData.observations
        }
        setBeds(prev => [...prev, newBed])
        addNotification('success', 'Leito cadastrado com sucesso!')
      }
      
      setShowBedForm(false)
      setEditingBed(null)
      resetBedForm()
    } catch (err) {
      addNotification('error', 'Erro ao salvar leito')
    } finally {
      setLoading(false)
    }
  }

  const resetBedForm = () => {
    setBedFormData({
      roomNumber: '',
      bedNumber: '',
      sector: '',
      type: 'enfermaria',
      observations: ''
    })
  }

  const editBed = (bed: Bed) => {
    setBedFormData({
      roomNumber: bed.roomNumber,
      bedNumber: bed.bedNumber,
      sector: bed.sector,
      type: bed.type,
      observations: bed.observations || ''
    })
    setEditingBed(bed)
    setShowBedForm(true)
  }

  // Funções para Auditoria e Compliance
  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      // Simular dados de logs de auditoria
      const mockAuditLogs: AuditLog[] = [
        {
          id: 1,
          userId: 1,
          userName: 'Dr. João Silva',
          action: 'read',
          resource: 'patient',
          resourceId: 1,
          patientId: 1,
          patientName: 'Maria Silva Santos',
          timestamp: '2024-01-15T14:30:00',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          details: 'Visualização do prontuário completo',
          sensitive: true,
          lgpdCompliant: true
        },
        {
          id: 2,
          userId: 2,
          userName: 'Enfermeira Ana',
          action: 'update',
          resource: 'medical_record',
          resourceId: 5,
          patientId: 1,
          patientName: 'Maria Silva Santos',
          timestamp: '2024-01-15T15:45:00',
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          details: 'Atualização de sinais vitais',
          sensitive: false,
          lgpdCompliant: true
        },
        {
          id: 3,
          userId: 3,
          userName: 'Recepcionista Carlos',
          action: 'export',
          resource: 'patient',
          timestamp: '2024-01-15T16:00:00',
          ipAddress: '192.168.1.110',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          details: 'Exportação de lista de pacientes em CSV',
          sensitive: true,
          lgpdCompliant: true
        }
      ]
      setAuditLogs(mockAuditLogs)
      addNotification('success', 'Logs de auditoria carregados com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar logs de auditoria')
    } finally {
      setLoading(false)
    }
  }

  const loadAccessLogs = async () => {
    setLoading(true)
    try {
      // Simular dados de logs de acesso
      const mockAccessLogs: AccessLog[] = [
        {
          id: 1,
          userId: 1,
          userName: 'Dr. João Silva',
          patientId: 1,
          patientName: 'Maria Silva Santos',
          accessType: 'view',
          timestamp: '2024-01-15T14:30:00',
          duration: 1200,
          ipAddress: '192.168.1.100',
          justification: 'Consulta médica agendada',
          authorized: true
        },
        {
          id: 2,
          userId: 2,
          userName: 'Enfermeira Ana',
          patientId: 2,
          patientName: 'João Carlos Oliveira',
          accessType: 'edit',
          timestamp: '2024-01-15T15:45:00',
          duration: 600,
          ipAddress: '192.168.1.105',
          justification: 'Atualização de medicação prescrita',
          authorized: true
        }
      ]
      setAccessLogs(mockAccessLogs)
      addNotification('success', 'Logs de acesso carregados com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar logs de acesso')
    } finally {
      setLoading(false)
    }
  }

  const loadComplianceReports = async () => {
    setLoading(true)
    try {
      // Simular dados de relatórios de compliance
      const mockComplianceReports: ComplianceReport[] = [
        {
          id: 1,
          type: 'lgpd',
          title: 'Relatório de Conformidade LGPD - Janeiro 2024',
          description: 'Análise de conformidade com a Lei Geral de Proteção de Dados',
          period: '2024-01-01 a 2024-01-31',
          generatedAt: '2024-02-01T09:00:00',
          generatedBy: 'Sistema Automático',
          status: 'compliant',
          findings: [
            {
              id: 1,
              severity: 'low',
              category: 'Consentimento',
              description: '5 pacientes sem consentimento explícito registrado',
              affectedRecords: 5,
              remediation: 'Solicitar consentimento retroativo',
              deadline: '2024-02-15',
              status: 'in_progress'
            }
          ],
          recommendations: [
            'Implementar formulário de consentimento digital',
            'Treinar equipe sobre coleta de consentimento'
          ],
          nextReview: '2024-03-01'
        },
        {
          id: 2,
          type: 'access_control',
          title: 'Relatório de Controle de Acesso - Janeiro 2024',
          description: 'Análise de acessos não autorizados e controles de segurança',
          period: '2024-01-01 a 2024-01-31',
          generatedAt: '2024-02-01T10:00:00',
          generatedBy: 'Administrador Sistema',
          status: 'compliant',
          findings: [],
          recommendations: [
            'Manter política atual de senhas',
            'Revisar permissões trimestralmente'
          ],
          nextReview: '2024-03-01'
        }
      ]
      setComplianceReports(mockComplianceReports)
      addNotification('success', 'Relatórios de compliance carregados com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar relatórios de compliance')
    } finally {
      setLoading(false)
    }
  }

  // Funções para Integração com Sistemas Externos
  const loadDataSusIntegration = async () => {
    setLoading(true)
    try {
      // Simular dados de integração DATASUS
      const mockDataSusIntegration: DataSusIntegration[] = [
        {
          id: 1,
          patientId: 1,
          patientName: 'Maria Silva Santos',
          cpf: '123.456.789-00',
          cns: '123456789012345',
          integrationDate: '2024-01-10T08:00:00',
          lastSync: '2024-01-15T14:30:00',
          status: 'active',
          sihData: {
            aih: 'AIH123456789',
            procedureCode: '03.01.01.001-2',
            procedureName: 'Consulta médica em atenção especializada',
            admissionDate: '2024-01-10',
            hospitalCode: '2077777',
            hospitalName: 'Hospital Municipal',
            totalValue: 150.00,
            status: 'active'
          },
          sisregData: {
            regulationId: 'REG2024001',
            requestDate: '2024-01-08',
            specialty: 'Cardiologia',
            priority: 'routine',
            status: 'scheduled',
            estimatedDate: '2024-01-20',
            providerCode: '123456',
            providerName: 'Clínica Cardiológica'
          },
          cnesData: {
            establishmentCode: '2077777',
            establishmentName: 'Hospital Municipal',
            professionalCode: 'CRM12345',
            professionalName: 'Dr. João Silva',
            specialty: 'Cardiologia',
            validationDate: '2024-01-01',
            status: 'active'
          },
          syncErrors: [],
          nextSync: '2024-01-16T14:30:00'
        },
        {
          id: 2,
          patientId: 2,
          patientName: 'João Carlos Oliveira',
          cpf: '987.654.321-00',
          cns: '987654321098765',
          integrationDate: '2024-01-12T10:00:00',
          lastSync: '2024-01-15T15:00:00',
          status: 'error',
          syncErrors: [
            {
              id: 1,
              timestamp: '2024-01-15T15:00:00',
              errorCode: 'SIH_001',
              errorMessage: 'CPF não encontrado na base DATASUS',
              severity: 'medium',
              resolved: false
            }
          ],
          nextSync: '2024-01-16T15:00:00'
        }
      ]
      setDataSusIntegration(mockDataSusIntegration)
      addNotification('success', 'Integração DATASUS carregada com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar integração DATASUS')
    } finally {
      setLoading(false)
    }
  }

  const loadExternalSystems = async () => {
    setLoading(true)
    try {
      // Simular dados de sistemas externos
      const mockExternalSystems: ExternalSystem[] = [
        {
          id: 1,
          name: 'DATASUS - SIH',
          type: 'datasus',
          endpoint: 'https://servicos.datasus.gov.br/sih',
          status: 'connected',
          lastConnection: '2024-01-15T14:30:00',
          version: '2.1.0',
          authentication: 'certificate',
          configuration: {
            certificatePath: '/certificates/datasus.p12',
            timeout: 30000,
            retryAttempts: 3
          },
          healthCheck: true,
          responseTime: 1200
        },
        {
          id: 2,
          name: 'DATASUS - SISREG',
          type: 'datasus',
          endpoint: 'https://servicos.datasus.gov.br/sisreg',
          status: 'connected',
          lastConnection: '2024-01-15T15:00:00',
          version: '1.8.5',
          authentication: 'token',
          configuration: {
            apiKey: '***hidden***',
            timeout: 25000,
            retryAttempts: 2
          },
          healthCheck: true,
          responseTime: 800
        },
        {
          id: 3,
          name: 'Laboratório Central',
          type: 'laboratory',
          endpoint: 'https://api.labcentral.com.br',
          status: 'error',
          lastConnection: '2024-01-15T12:00:00',
          version: '3.2.1',
          authentication: 'oauth',
          configuration: {
            clientId: 'dataclinica_001',
            scope: 'results:read',
            timeout: 20000
          },
          healthCheck: false,
          responseTime: 0
        }
      ]
      setExternalSystems(mockExternalSystems)
      addNotification('success', 'Sistemas externos carregados com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar sistemas externos')
    } finally {
      setLoading(false)
    }
  }

  const loadIntegrationLogs = async () => {
    setLoading(true)
    try {
      // Simular dados de logs de integração
      const mockIntegrationLogs: IntegrationLog[] = [
        {
          id: 1,
          systemId: 1,
          systemName: 'DATASUS - SIH',
          operation: 'sync',
          timestamp: '2024-01-15T14:30:00',
          status: 'success',
          recordsProcessed: 150,
          recordsSuccess: 148,
          recordsError: 2,
          duration: 45000,
          details: {
            syncType: 'incremental',
            lastSyncId: 'SIH_20240115_001'
          }
        },
        {
          id: 2,
          systemId: 2,
          systemName: 'DATASUS - SISREG',
          operation: 'send',
          timestamp: '2024-01-15T15:00:00',
          status: 'success',
          recordsProcessed: 25,
          recordsSuccess: 25,
          recordsError: 0,
          duration: 12000,
          details: {
            requestType: 'regulation_request',
            batchId: 'REG_20240115_002'
          }
        },
        {
          id: 3,
          systemId: 3,
          systemName: 'Laboratório Central',
          operation: 'receive',
          timestamp: '2024-01-15T12:00:00',
          status: 'error',
          recordsProcessed: 0,
          recordsSuccess: 0,
          recordsError: 0,
          duration: 30000,
          errorMessage: 'Connection timeout - servidor indisponível',
          details: {
            errorCode: 'CONN_TIMEOUT',
            retryScheduled: '2024-01-15T13:00:00'
          }
        }
      ]
      setIntegrationLogs(mockIntegrationLogs)
      addNotification('success', 'Logs de integração carregados com sucesso!')
    } catch (error) {
      addNotification('error', 'Erro ao carregar logs de integração')
    } finally {
      setLoading(false)
    }
  }

  // Função para resetar filtros
  const resetFilters = () => {
    setFilters({
      ageGroup: '',
      insurance: '',
      bloodType: '',
      hasAllergies: '',
      hasComorbidities: '',
      registrationDateFrom: '',
      registrationDateTo: '',
      lastConsultationFrom: '',
      lastConsultationTo: ''
    })
    setSearchTerm('')
    setSortBy('name')
    setSortOrder('asc')
  }

  // Função para exportar dados
  const exportData = (format: 'csv' | 'pdf') => {
    const dataToExport = getFilteredAndSortedPatients()
    if (format === 'csv') {
      const csvContent = [
        'Nome,CPF,Data Nascimento,Telefone,Convênio,Tipo Sanguíneo',
        ...dataToExport.map(p => 
          `"${p.full_name}","${p.cpf}","${new Date(p.birth_date).toLocaleDateString('pt-BR')}","${p.mobile}","${p.insurance_company || 'Particular'}","${p.blood_type || ''}"`
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `pacientes_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      addNotification('success', 'Lista exportada em CSV com sucesso!')
    }
  }

  // Filtrar e ordenar pacientes
  const getFilteredAndSortedPatients = () => {
    let filtered = patients.filter(patient => {
      // Busca por texto
      const matchesSearch = !searchTerm || 
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf.includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Filtro por faixa etária
      const matchesAgeGroup = !filters.ageGroup || getAgeGroup(patient.birth_date) === filters.ageGroup
      
      // Filtro por convênio
      const matchesInsurance = !filters.insurance || 
        (filters.insurance === 'particular' && !patient.insurance_company) ||
        (patient.insurance_company && patient.insurance_company.toLowerCase().includes(filters.insurance.toLowerCase()))
      
      // Filtro por tipo sanguíneo
      const matchesBloodType = !filters.bloodType || patient.blood_type === filters.bloodType
      
      // Filtro por alergias
      const matchesAllergies = !filters.hasAllergies || 
        (filters.hasAllergies === 'sim' && patient.allergies && patient.allergies.trim() !== '') ||
        (filters.hasAllergies === 'nao' && (!patient.allergies || patient.allergies.trim() === ''))
      
      // Filtro por comorbidades
      const matchesComorbidities = !filters.hasComorbidities || 
        (filters.hasComorbidities === 'sim' && patient.comorbidities && patient.comorbidities.trim() !== '') ||
        (filters.hasComorbidities === 'nao' && (!patient.comorbidities || patient.comorbidities.trim() === ''))
      
      return matchesSearch && matchesAgeGroup && matchesInsurance && matchesBloodType && matchesAllergies && matchesComorbidities
    })

    // Ordenação
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.full_name.toLowerCase()
          bValue = b.full_name.toLowerCase()
          break
        case 'age':
          aValue = calculateAge(a.birth_date)
          bValue = calculateAge(b.birth_date)
          break
        case 'registration':
          aValue = new Date(a.created_at || '').getTime()
          bValue = new Date(b.created_at || '').getTime()
          break
        default:
          aValue = a.full_name.toLowerCase()
          bValue = b.full_name.toLowerCase()
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  const filteredPatients = getFilteredAndSortedPatients()
  
  useEffect(() => {
    loadPatients()
  }, [])
  
  // Renderização da view de leitos
  if (view === 'beds') {
    return (
      <div className="section-content">
        <div className="form-header">
          <h2>🏥 Gestão de Leitos</h2>
          <div className="form-actions">
            <button 
              className="btn-secondary" 
              onClick={() => setView('list')}
            >
              Voltar aos Pacientes
            </button>
            <button 
              className="btn-primary" 
              onClick={() => {
                setShowBedForm(true)
                setEditingBed(null)
                setBedFormData({
                  roomNumber: '',
                  bedNumber: '',
                  sector: '',
                  type: 'enfermaria',
                  observations: ''
                })
              }}
            >
              Novo Leito
            </button>
          </div>
        </div>

        {/* Formulário de Leito */}
        {showBedForm && (
          <div className="form-section">
            <h3>{editingBed ? 'Editar Leito' : 'Novo Leito'}</h3>
            <form className="bed-form" onSubmit={(e) => { e.preventDefault(); saveBed(); }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Número do Quarto *</label>
                  <input
                    type="text"
                    value={bedFormData.roomNumber}
                    onChange={(e) => setBedFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Número do Leito *</label>
                  <input
                    type="text"
                    value={bedFormData.bedNumber}
                    onChange={(e) => setBedFormData(prev => ({ ...prev, bedNumber: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Setor *</label>
                  <select
                    value={bedFormData.sector}
                    onChange={(e) => setBedFormData(prev => ({ ...prev, sector: e.target.value }))}
                    required
                  >
                    <option value="">Selecione o setor</option>
                    <option value="Desintoxicação">Desintoxicação</option>
                    <option value="Tratamento Intensivo">Tratamento Intensivo</option>
                    <option value="Reabilitação">Reabilitação</option>
                    <option value="Cuidados Especiais">Cuidados Especiais</option>
                    <option value="Observação">Observação</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Tipo de Leito *</label>
                  <select
                    value={bedFormData.type}
                    onChange={(e) => setBedFormData(prev => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    <option value="enfermaria">Enfermaria</option>
                    <option value="quarto_individual">Quarto Individual</option>
                    <option value="quarto_duplo">Quarto Duplo</option>
                    <option value="isolamento">Isolamento</option>
                    <option value="observacao">Observação</option>
                  </select>
                </div>
                
                <div className="form-group form-group-wide">
                  <label>Observações</label>
                  <textarea
                    value={bedFormData.observations}
                    onChange={(e) => setBedFormData(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Observações sobre o leito"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowBedForm(false)
                    setEditingBed(null)
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Estatísticas dos Leitos */}
        <div className="beds-stats">
          <div className="stat-card">
            <h3>Total de Leitos</h3>
            <p className="stat-number">{beds.length}</p>
          </div>
          <div className="stat-card">
            <h3>Leitos Ocupados</h3>
            <p className="stat-number">{beds.filter(bed => bed.status === 'ocupado').length}</p>
          </div>
          <div className="stat-card">
            <h3>Leitos Livres</h3>
            <p className="stat-number">{beds.filter(bed => bed.status === 'livre').length}</p>
          </div>
          <div className="stat-card">
            <h3>Em Manutenção</h3>
            <p className="stat-number">{beds.filter(bed => bed.status === 'manutencao').length}</p>
          </div>
        </div>

        {/* Grid de Leitos */}
        <div className="beds-grid">
          {beds.map(bed => (
            <div key={bed.id} className={`bed-card bed-${bed.status}`}>
              <div className="bed-header">
                <h4>Quarto {bed.roomNumber} - Leito {bed.bedNumber}</h4>
                <span className={`bed-status status-${bed.status}`}>
                  {bed.status === 'ocupado' ? '🔴 Ocupado' : 
                   bed.status === 'livre' ? '🟢 Livre' : 
                   bed.status === 'manutencao' ? '🟡 Manutenção' : 
                   '🔵 Reservado'}
                </span>
              </div>
              
              <div className="bed-info">
                <p><strong>Setor:</strong> {bed.sector}</p>
                <p><strong>Tipo:</strong> {bed.type}</p>
                {bed.patientName && (
                  <p><strong>Paciente:</strong> {bed.patientName}</p>
                )}
                {bed.admissionDate && (
                  <p><strong>Internação:</strong> {new Date(bed.admissionDate).toLocaleDateString('pt-BR')}</p>
                )}
                {bed.observations && (
                  <p><strong>Obs:</strong> {bed.observations}</p>
                )}
              </div>
              
              <div className="bed-actions">
                {bed.status === 'livre' && (
                   <button 
                     className="btn-primary btn-small"
                     onClick={() => {
                       setSelectedBed(bed)
                       setShowPatientAssignment(true)
                     }}
                   >
                     Atribuir Paciente
                   </button>
                 )}
                {bed.status === 'ocupado' && (
                  <button 
                    className="btn-warning btn-small"
                    onClick={() => {
                      // Implementar liberação de leito
                      const updatedBeds = beds.map(b => 
                        b.id === bed.id 
                          ? { ...b, status: 'livre', patientName: undefined, admissionDate: undefined }
                          : b
                      )
                      setBeds(updatedBeds)
                      addNotification('success', 'Leito liberado com sucesso!')
                    }}
                  >
                    Liberar Leito
                  </button>
                )}
                {bed.status !== 'manutencao' && (
                   <button 
                     className="btn-warning btn-small"
                     onClick={() => {
                       const updatedBeds = beds.map(b => 
                         b.id === bed.id 
                           ? { ...b, status: 'manutencao', patientName: undefined, admissionDate: undefined }
                           : b
                       )
                       setBeds(updatedBeds)
                       addNotification('info', 'Leito colocado em manutenção!')
                     }}
                   >
                     🔧 Manutenção
                   </button>
                 )}
                 {bed.status === 'manutencao' && (
                   <button 
                     className="btn-success btn-small"
                     onClick={() => {
                       const updatedBeds = beds.map(b => 
                         b.id === bed.id 
                           ? { ...b, status: 'livre' }
                           : b
                       )
                       setBeds(updatedBeds)
                       addNotification('success', 'Leito liberado da manutenção!')
                     }}
                   >
                     ✅ Liberar
                   </button>
                 )}
                 <button 
                   className="btn-secondary btn-small"
                   onClick={() => editBed(bed)}
                 >
                   Editar
                 </button>
                 <button 
                   className="btn-danger btn-small"
                   onClick={() => {
                     if (confirm('Tem certeza que deseja excluir este leito?')) {
                       setBeds(beds.filter(b => b.id !== bed.id))
                       addNotification('success', 'Leito excluído com sucesso!')
                     }
                   }}
                 >
                   Excluir
                 </button>
              </div>
            </div>
          ))}
        </div>

        {beds.length === 0 && (
           <div className="empty-state">
             <p>Nenhum leito cadastrado. Clique em "Novo Leito" para começar.</p>
           </div>
         )}

         {/* Modal de Atribuição de Paciente */}
         {showPatientAssignment && selectedBed && (
           <div className="modal-overlay" onClick={() => setShowPatientAssignment(false)}>
             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
                 <h3>Atribuir Paciente ao Leito</h3>
                 <button 
                   className="modal-close"
                   onClick={() => setShowPatientAssignment(false)}
                 >
                   ×
                 </button>
               </div>
               
               <div className="modal-body">
                 <div className="bed-info-modal">
                   <h4>Leito Selecionado:</h4>
                   <p><strong>Quarto:</strong> {selectedBed.roomNumber}</p>
                   <p><strong>Leito:</strong> {selectedBed.bedNumber}</p>
                   <p><strong>Setor:</strong> {selectedBed.sector}</p>
                   <p><strong>Tipo:</strong> {selectedBed.type}</p>
                 </div>
                 
                 <div className="patient-selection">
                   <h4>Selecionar Paciente:</h4>
                   <div className="patient-list">
                     {patients.filter(p => !beds.some(b => b.patientName === p.full_name && b.status === 'ocupado')).map(patient => (
                       <div 
                         key={patient.id} 
                         className="patient-item"
                         onClick={() => {
                           // Atribuir paciente ao leito
                           const updatedBeds = beds.map(bed => 
                             bed.id === selectedBed.id 
                               ? { 
                                   ...bed, 
                                   status: 'ocupado' as const, 
                                   patientName: patient.full_name,
                                   admissionDate: new Date().toISOString()
                                 }
                               : bed
                           )
                           setBeds(updatedBeds)
                           setShowPatientAssignment(false)
                           setSelectedBed(null)
                           addNotification('success', `Paciente ${patient.full_name} atribuído ao leito ${selectedBed.roomNumber}-${selectedBed.bedNumber}!`)
                         }}
                       >
                         <div className="patient-info">
                           <strong>{patient.full_name}</strong>
                           <p>CPF: {patient.cpf}</p>
                           <p>Nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}</p>
                           <p>Telefone: {patient.phone}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   {patients.filter(p => !beds.some(b => b.patientName === p.full_name && b.status === 'ocupado')).length === 0 && (
                     <p className="no-patients">Nenhum paciente disponível para internação.</p>
                   )}
                 </div>
               </div>
               
               <div className="modal-footer">
                 <button 
                   className="btn-secondary"
                   onClick={() => setShowPatientAssignment(false)}
                 >
                   Cancelar
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
     )
   }

  // Renderização da view de alertas
  if (view === 'alerts') {
    return (
      <div className="section-content">
        <div className="form-header">
          <h2>🚨 Alertas e Monitoramento</h2>
          <div className="form-actions">
            <button 
              className="btn-secondary" 
              onClick={() => setView('list')}
            >
              Voltar à Lista de Pacientes
            </button>
            <button 
              className="btn-primary"
              onClick={() => {
                // Recarregar alertas
                loadAlerts()
                addNotification('info', 'Alertas atualizados!')
              }}
            >
              🔄 Atualizar Alertas
            </button>
          </div>
        </div>

        {/* Estatísticas de Alertas */}
        <div className="alerts-stats">
          <div className="stat-card alert-critical">
            <h3>Críticos</h3>
            <p className="stat-number">{alerts.filter(a => a.priority === 'critica' && a.status === 'ativo').length}</p>
          </div>
          <div className="stat-card alert-high">
            <h3>Alta Prioridade</h3>
            <p className="stat-number">{alerts.filter(a => a.priority === 'alta' && a.status === 'ativo').length}</p>
          </div>
          <div className="stat-card alert-medium">
            <h3>Média Prioridade</h3>
            <p className="stat-number">{alerts.filter(a => a.priority === 'media' && a.status === 'ativo').length}</p>
          </div>
          <div className="stat-card alert-low">
            <h3>Baixa Prioridade</h3>
            <p className="stat-number">{alerts.filter(a => a.priority === 'baixa' && a.status === 'ativo').length}</p>
          </div>
          <div className="stat-card alert-resolved">
            <h3>Resolvidos</h3>
            <p className="stat-number">{alerts.filter(a => a.status === 'resolvido').length}</p>
          </div>
        </div>

        {/* Filtros de Alertas */}
        <div className="alerts-filters">
          <div className="filter-group">
            <label>Filtrar por Prioridade:</label>
            <select 
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              className="form-input"
            >
              <option value="todos">Todos os Alertas</option>
              <option value="critica">Críticos</option>
              <option value="alta">Alta Prioridade</option>
              <option value="media">Média Prioridade</option>
              <option value="baixa">Baixa Prioridade</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={alertStatusFilter}
              onChange={(e) => setAlertStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="resolvido">Resolvidos</option>
              <option value="pausado">Pausados</option>
            </select>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="alerts-grid">
          {alerts
            .filter(alert => {
              const priorityMatch = alertFilter === 'todos' || alert.priority === alertFilter
              const statusMatch = alertStatusFilter === 'todos' || alert.status === alertStatusFilter
              return priorityMatch && statusMatch
            })
            .sort((a, b) => {
              // Ordenar por prioridade e data
              const priorityOrder = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 }
              const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
              if (priorityDiff !== 0) return priorityDiff
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })
            .map(alert => {
              const patient = patients.find(p => p.id === alert.patientId?.toString())
              return (
                <div key={alert.id} className={`alert-card alert-${alert.priority} alert-${alert.status}`}>
                  <div className="alert-header">
                    <div className="alert-priority">
                      <span className={`priority-badge priority-${alert.priority}`}>
                        {alert.priority === 'critica' && '🔴'}
                        {alert.priority === 'alta' && '🟠'}
                        {alert.priority === 'media' && '🟡'}
                        {alert.priority === 'baixa' && '🔵'}
                        {alert.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="alert-time">
                      {new Date(alert.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="alert-content">
                    <h4 className="alert-title">{alert.title}</h4>
                    <p className="alert-message">{alert.message}</p>
                    
                    {patient && (
                      <div className="alert-patient">
                        <strong>Paciente:</strong> {patient.full_name}
                        <br />
                        <small>CPF: {patient.cpf}</small>
                      </div>
                    )}
                    
                    {alert.assignedTo && (
                      <div className="alert-assigned">
                        <strong>Responsável:</strong> {alert.assignedTo}
                      </div>
                    )}
                  </div>
                  
                  <div className="alert-actions">
                    {alert.status === 'ativo' && (
                      <>
                        <button 
                          className="btn-success btn-small"
                          onClick={() => {
                            const updatedAlerts = alerts.map(a => 
                              a.id === alert.id 
                                ? { ...a, status: 'resolvido' as const, resolvedAt: new Date().toISOString() }
                                : a
                            )
                            setAlerts(updatedAlerts)
                            addNotification('success', 'Alerta resolvido com sucesso!')
                          }}
                        >
                          ✅ Resolver
                        </button>
                        <button 
                          className="btn-warning btn-small"
                          onClick={() => {
                            const updatedAlerts = alerts.map(a => 
                              a.id === alert.id 
                                ? { ...a, status: 'pausado' as const }
                                : a
                            )
                            setAlerts(updatedAlerts)
                            addNotification('info', 'Alerta pausado!')
                          }}
                        >
                          ⏸️ Pausar
                        </button>
                      </>
                    )}
                    
                    {alert.status === 'pausado' && (
                      <button 
                        className="btn-primary btn-small"
                        onClick={() => {
                          const updatedAlerts = alerts.map(a => 
                            a.id === alert.id 
                              ? { ...a, status: 'ativo' as const }
                              : a
                          )
                          setAlerts(updatedAlerts)
                          addNotification('info', 'Alerta reativado!')
                        }}
                      >
                        ▶️ Reativar
                      </button>
                    )}
                    
                    {alert.status === 'resolvido' && (
                      <div className="alert-resolved-info">
                        <span className="resolved-badge">✅ Resolvido</span>
                        {alert.resolvedAt && (
                          <small>em {new Date(alert.resolvedAt).toLocaleString('pt-BR')}</small>
                        )}
                      </div>
                    )}
                    
                    <button 
                      className="btn-danger btn-small"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este alerta?')) {
                          setAlerts(alerts.filter(a => a.id !== alert.id))
                          addNotification('success', 'Alerta excluído com sucesso!')
                        }
                      }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
        
        {alerts.filter(alert => {
          const priorityMatch = alertFilter === 'todos' || alert.priority === alertFilter
          const statusMatch = alertStatusFilter === 'todos' || alert.status === alertStatusFilter
          return priorityMatch && statusMatch
        }).length === 0 && (
          <div className="empty-state">
            <h3>Nenhum alerta encontrado</h3>
            <p>Não há alertas que correspondam aos filtros selecionados.</p>
          </div>
        )}
      </div>
    )
  }

  // Renderização da view de histórico
  if (view === 'history' && selectedPatient) {
    return (
      <div className="section-content">
        <div className="form-header">
          <h2>Histórico Clínico - {selectedPatient.full_name}</h2>
          <div className="form-actions">
            <button 
              className="btn-secondary" 
              onClick={() => setView('list')}
            >
              Voltar à Lista
            </button>
          </div>
        </div>

        {historyLoading ? (
          <div className="loading">Carregando histórico clínico...</div>
        ) : (
          <div className="history-content">
            {/* Resumo do Paciente */}
            <div className="form-section">
              <h3>Dados do Paciente</h3>
              <div className="patient-summary">
                <div className="summary-item">
                  <strong>Nome:</strong> {selectedPatient.full_name}
                </div>
                <div className="summary-item">
                  <strong>CPF:</strong> {selectedPatient.cpf}
                </div>
                <div className="summary-item">
                  <strong>Data de Nascimento:</strong> {new Date(selectedPatient.birth_date).toLocaleDateString('pt-BR')}
                </div>
                <div className="summary-item">
                  <strong>Convênio:</strong> {selectedPatient.insurance_company || 'Particular'}
                </div>
                <div className="summary-item">
                  <strong>Tipo Sanguíneo:</strong> {selectedPatient.blood_type || 'Não informado'}
                </div>
                <div className="summary-item">
                  <strong>Alergias:</strong> {selectedPatient.allergies || 'Nenhuma alergia registrada'}
                </div>
                <div className="summary-item">
                  <strong>Comorbidades:</strong> {selectedPatient.comorbidities || 'Nenhuma comorbidade registrada'}
                </div>
              </div>
            </div>

            {/* Prontuários */}
            <div className="form-section">
              <h3>Prontuários e Evoluções</h3>
              {medicalRecords.length > 0 ? (
                <div className="medical-records">
                  {medicalRecords.map(record => (
                    <div key={record.id} className="medical-record-card">
                      <div className="record-header">
                        <div className="record-date">
                          <strong>{new Date(record.date).toLocaleDateString('pt-BR')} às {record.time}</strong>
                        </div>
                        <div className="record-type">
                          <span className={`badge badge-${record.type}`}>
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="record-content">
                        <div className="record-info">
                          <strong>Médico:</strong> {record.doctor} ({record.specialty})
                        </div>
                        <div className="record-info">
                          <strong>Diagnóstico:</strong> {record.diagnosis}
                        </div>
                        <div className="record-info">
                          <strong>Prescrição:</strong>
                          <pre className="prescription">{record.prescription}</pre>
                        </div>
                        <div className="record-info">
                          <strong>Evolução:</strong> {record.evolution}
                        </div>
                        {record.observations && (
                          <div className="record-info">
                            <strong>Observações:</strong> {record.observations}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Nenhum prontuário encontrado</p>
                </div>
              )}
            </div>

            {/* Consultas Agendadas */}
            <div className="form-section">
              <h3>Consultas e Atendimentos</h3>
              {appointments.length > 0 ? (
                <div className="appointments-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Médico</th>
                        <th>Especialidade</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(appointment => (
                        <tr key={appointment.id}>
                          <td>{new Date(appointment.date).toLocaleDateString('pt-BR')}</td>
                          <td>{appointment.time}</td>
                          <td>{appointment.doctor}</td>
                          <td>{appointment.specialty}</td>
                          <td>{appointment.type}</td>
                          <td>
                            <span className={`badge badge-${appointment.status}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td>{appointment.observations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Nenhuma consulta encontrada</p>
                </div>
              )}
            </div>

            {/* Exames */}
            <div className="form-section">
              <h3>Exames</h3>
              {exams.length > 0 ? (
                <div className="exams-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo de Exame</th>
                        <th>Resultado</th>
                        <th>Médico Solicitante</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map(exam => (
                        <tr key={exam.id}>
                          <td>{new Date(exam.date).toLocaleDateString('pt-BR')}</td>
                          <td>{exam.type}</td>
                          <td>{exam.result}</td>
                          <td>{exam.doctor}</td>
                          <td>
                            <span className={`badge badge-${exam.status}`}>
                              {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Nenhum exame encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div className="section-content">
        <div className="form-header">
          <h2>{editingPatient ? 'Editar Paciente' : 'Novo Paciente'}</h2>
          <div className="form-actions">
            <button 
              className="btn-secondary" 
              onClick={() => {
                setView('list')
                setEditingPatient(null)
                resetForm()
              }}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              onClick={savePatient}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
        
        <form className="patient-form" onSubmit={(e) => { e.preventDefault(); savePatient(); }}>
          {/* Dados Pessoais */}
          <div className="form-section">
            <h3>Dados Pessoais</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>CPF *</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>RG</label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Data de Nascimento *</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Sexo *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'M' | 'F' | 'O' }))}
                  required
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Estado Civil</label>
                <select
                  value={formData.marital_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, marital_status: e.target.value }))}
                >
                  <option value="">Selecione</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                  <option value="União Estável">União Estável</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Profissão</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Nacionalidade</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Local de Nascimento</label>
                <input
                  type="text"
                  value={formData.birth_place}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_place: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          {/* Contatos */}
          <div className="form-section">
            <h3>Contatos</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 1234-5678"
                />
              </div>
              
              <div className="form-group">
                <label>Celular *</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="(11) 91234-5678"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Contato de Emergência</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                  placeholder="Nome do contato"
                />
              </div>
              
              <div className="form-group">
                <label>Telefone de Emergência</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  placeholder="(11) 91234-5678"
                />
              </div>
            </div>
          </div>
          
          {/* Endereço */}
          <div className="form-section">
            <h3>Endereço</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => {
                    const cep = e.target.value.replace(/\D/g, '')
                    setFormData(prev => ({ ...prev, zip_code: cep }))
                    if (cep.length === 8) {
                      searchCEP(cep)
                    }
                  }}
                  placeholder="00000-000"
                  maxLength={8}
                />
              </div>
              
              <div className="form-group form-group-wide">
                <label>Logradouro</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Número</label>
                <input
                  type="text"
                  value={formData.address_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_number: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Complemento</label>
                <input
                  type="text"
                  value={formData.address_complement}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_complement: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Bairro</label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Convênios */}
          <div className="form-section">
            <h3>Convênio</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Operadora</label>
                <input
                  type="text"
                  value={formData.insurance_company}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurance_company: e.target.value }))}
                  placeholder="Nome da operadora"
                />
              </div>
              
              <div className="form-group">
                <label>Número da Carteirinha</label>
                <input
                  type="text"
                  value={formData.insurance_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurance_number: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Validade</label>
                <input
                  type="date"
                  value={formData.insurance_validity}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurance_validity: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          {/* Dados Complementares */}
          <div className="form-section">
            <h3>Dados Complementares</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Tipo Sanguíneo</label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, blood_type: e.target.value }))}
                >
                  <option value="">Selecione</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div className="form-group form-group-wide">
                <label>Alergias</label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="Descreva alergias conhecidas"
                  rows={3}
                />
              </div>
              
              <div className="form-group form-group-wide">
                <label>Comorbidades</label>
                <textarea
                  value={formData.comorbidities}
                  onChange={(e) => setFormData(prev => ({ ...prev, comorbidities: e.target.value }))}
                  placeholder="Descreva doenças pré-existentes"
                  rows={3}
                />
              </div>
              
              <div className="form-group form-group-wide">
                <label>Medicamentos em Uso</label>
                <textarea
                  value={formData.medications_in_use}
                  onChange={(e) => setFormData(prev => ({ ...prev, medications_in_use: e.target.value }))}
                  placeholder="Liste medicamentos em uso contínuo"
                  rows={3}
                />
              </div>
              
              <div className="form-group form-group-wide">
                <label>Observações</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Observações gerais"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {/* Upload de Documentos */}
          <div className="form-section">
            <h3>Documentos</h3>
            <div className="upload-area">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => {
                  // Implementar upload de arquivos
                  addNotification('info', 'Upload de documentos será implementado')
                }}
                className="file-input"
              />
              <div className="upload-text">
                <p>Clique para selecionar ou arraste arquivos aqui</p>
                <small>Formatos aceitos: JPG, PNG, PDF (máx. 5MB cada)</small>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
  
  // Lista de pacientes
  return (
    <div className="section-content">
      <h2>Gestão de Pacientes</h2>
      <div className="section-actions">
        <button 
          className="btn-primary" 
          onClick={() => setView('form')}
        >
          Novo Paciente
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          {showAdvancedFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
        </button>
        <button 
          className="btn-info" 
          onClick={() => {
            setView('beds')
            loadBeds()
          }}
        >
          🏥 Leitos
        </button>
        <button 
          className="btn-warning" 
          onClick={() => {
            setView('alerts')
            loadAlerts()
          }}
        >
          🚨 Alertas
        </button>
        <button 
          className="btn-success" 
          onClick={() => exportData('csv')}
        >
          📊 Exportar CSV
        </button>
        <input 
          type="search" 
          placeholder="Buscar paciente..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Faixa Etária:</label>
              <select 
                value={filters.ageGroup} 
                onChange={(e) => setFilters({...filters, ageGroup: e.target.value})}
              >
                <option value="">Todas</option>
                <option value="crianca">Criança (0-11 anos)</option>
                <option value="adolescente">Adolescente (12-17 anos)</option>
                <option value="adulto">Adulto (18-59 anos)</option>
                <option value="idoso">Idoso (60+ anos)</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Convênio:</label>
              <select 
                value={filters.insurance} 
                onChange={(e) => setFilters({...filters, insurance: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="particular">Particular</option>
                <option value="unimed">Unimed</option>
                <option value="bradesco">Bradesco Saúde</option>
                <option value="amil">Amil</option>
                <option value="sulamerica">SulAmérica</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Tipo Sanguíneo:</label>
              <select 
                value={filters.bloodType} 
                onChange={(e) => setFilters({...filters, bloodType: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Alergias:</label>
              <select 
                value={filters.hasAllergies} 
                onChange={(e) => setFilters({...filters, hasAllergies: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="sim">Com alergias</option>
                <option value="nao">Sem alergias</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Comorbidades:</label>
              <select 
                value={filters.hasComorbidities} 
                onChange={(e) => setFilters({...filters, hasComorbidities: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="sim">Com comorbidades</option>
                <option value="nao">Sem comorbidades</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Ordenar por:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Nome</option>
                <option value="age">Idade</option>
                <option value="registration">Data de Cadastro</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Ordem:</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="btn-warning" onClick={resetFilters}>
              Limpar Filtros
            </button>
            <span className="filter-results">
              {filteredPatients.length} paciente(s) encontrado(s)
            </span>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="loading">Carregando pacientes...</div>
      ) : (
        <div className="patients-table">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Data Nascimento</th>
                <th>Telefone</th>
                <th>Convênio</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.full_name}</td>
                  <td>{patient.cpf}</td>
                  <td>{new Date(patient.birth_date).toLocaleDateString('pt-BR')}</td>
                  <td>{patient.mobile}</td>
                  <td>{patient.insurance_company || 'Particular'}</td>
                  <td>
                    <button 
                      className="btn-info btn-small"
                      onClick={() => viewPatientHistory(patient)}
                      style={{ marginRight: '5px' }}
                    >
                      Histórico
                    </button>
                    <button 
                      className="btn-secondary btn-small"
                      onClick={() => editPatient(patient)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPatients.length === 0 && (
            <div className="empty-state">
              <p>Nenhum paciente encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente do Módulo de Segurança e LGPD (Etapa 7)
const SecurityAndLGPDModule = ({ addNotification, token }: { addNotification: (type: string, message: string) => void; token: string }) => {
  const [activeTab, setActiveTab] = useState('lgpd')
  const [users, setUsers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [lgpdStats, setLgpdStats] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [consentForm, setConsentForm] = useState({
    lgpd_consent: false,
    data_sharing_consent: false,
    marketing_consent: false
  })
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [twoFAStatus, setTwoFAStatus] = useState<any>(null)

  // Carregar dados iniciais
  useEffect(() => {
    loadUsers()
    loadAuditLogs()
    loadLGPDStats()
    load2FAStatus()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:8002/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (err) {
      addNotification('error', 'Erro ao carregar usuários')
    }
  }

  const loadAuditLogs = async () => {
    try {
      const response = await fetch('http://localhost:8002/audit/trail', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      }
    } catch (err) {
      addNotification('error', 'Erro ao carregar logs de auditoria')
    }
  }

  const loadLGPDStats = async () => {
    try {
      const response = await fetch('http://localhost:8002/lgpd/data-processing-report', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setLgpdStats(data)
      }
    } catch (err) {
      addNotification('error', 'Erro ao carregar estatísticas LGPD')
    }
  }

  const updateUserConsent = async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8002/lgpd/consent/${selectedUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(consentForm)
      })
      if (response.ok) {
        addNotification('success', 'Consentimento atualizado com sucesso!')
        setShowConsentModal(false)
        loadUsers()
        loadLGPDStats()
      }
    } catch (err) {
      addNotification('error', 'Erro ao atualizar consentimento')
    } finally {
      setLoading(false)
    }
  }

  const exportUserData = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8002/lgpd/user-data/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dados_usuario_${userId}.json`
        a.click()
        addNotification('success', 'Dados exportados com sucesso!')
      }
    } catch (err) {
      addNotification('error', 'Erro ao exportar dados')
    }
  }

  const deleteUserData = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir todos os dados deste usuário? Esta ação é irreversível.')) return
    try {
      const response = await fetch(`http://localhost:8002/lgpd/user-data/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        addNotification('success', 'Dados do usuário excluídos conforme LGPD')
        loadUsers()
      }
    } catch (err) {
      addNotification('error', 'Erro ao excluir dados do usuário')
    }
  }

  const load2FAStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/2fa/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTwoFAStatus(data)
      }
    } catch (err) {
      console.log('Erro ao carregar status 2FA:', err)
    }
  }

  const setup2FA = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/2fa/setup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qr_code)
        setBackupCodes(data.backup_codes)
        addNotification('success', '2FA configurado! Escaneie o QR code.')
      }
    } catch (err) {
      addNotification('error', 'Erro ao configurar 2FA')
    } finally {
      setLoading(false)
    }
  }

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      addNotification('error', 'Digite um código de 6 dígitos')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: verificationCode })
      })
      if (response.ok) {
        addNotification('success', '2FA ativado com sucesso!')
        setShow2FAModal(false)
        setVerificationCode('')
        load2FAStatus()
      } else {
        addNotification('error', 'Código inválido')
      }
    } catch (err) {
      addNotification('error', 'Erro ao verificar código 2FA')
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm('Tem certeza que deseja desabilitar o 2FA?')) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/2fa/disable', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        addNotification('success', '2FA desabilitado com sucesso!')
        load2FAStatus()
      }
    } catch (err) {
      addNotification('error', 'Erro ao desabilitar 2FA')
    } finally {
      setLoading(false)
    }
  }

  const renderLGPDTab = () => (
    <div className="lgpd-section">
      <div className="section-header">
        <h3>🛡️ Gestão de Consentimento LGPD</h3>
        <button className="btn-primary" onClick={() => setShowConsentModal(true)}>Gerenciar Consentimentos</button>
      </div>
      
      <div className="lgpd-stats">
        <div className="stat-card">
          <h4>Taxa de Consentimento</h4>
          <p className="stat-number">{lgpdStats.consent_rate || 0}%</p>
          <span className="stat-trend positive">+5% este mês</span>
        </div>
        <div className="stat-card">
          <h4>Usuários com Consentimento</h4>
          <p className="stat-number">{lgpdStats.users_with_lgpd_consent || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Compartilhamento de Dados</h4>
          <p className="stat-number">{lgpdStats.data_sharing_rate || 0}%</p>
        </div>
        <div className="stat-card">
          <h4>Marketing Autorizado</h4>
          <p className="stat-number">{lgpdStats.marketing_consent_rate || 0}%</p>
        </div>
      </div>

      <div className="users-consent-grid">
        {users.map(user => (
          <div key={user.id} className="user-consent-card">
            <div className="user-info">
              <h4>{user.full_name}</h4>
              <p>{user.email}</p>
            </div>
            <div className="consent-status">
              <div className="consent-item">
                <span>LGPD:</span>
                <span className={`status-badge ${user.lgpd_consent ? 'status-success' : 'status-error'}`}>
                  {user.lgpd_consent ? 'Autorizado' : 'Pendente'}
                </span>
              </div>
              <div className="consent-item">
                <span>Compartilhamento:</span>
                <span className={`status-badge ${user.data_sharing_consent ? 'status-success' : 'status-error'}`}>
                  {user.data_sharing_consent ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="consent-item">
                <span>Marketing:</span>
                <span className={`status-badge ${user.marketing_consent ? 'status-success' : 'status-error'}`}>
                  {user.marketing_consent ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
            <div className="user-actions">
              <button 
                className="btn-small btn-secondary"
                onClick={() => {
                  setSelectedUser(user)
                  setConsentForm({
                    lgpd_consent: user.lgpd_consent || false,
                    data_sharing_consent: user.data_sharing_consent || false,
                    marketing_consent: user.marketing_consent || false
                  })
                  setShowConsentModal(true)
                }}
              >
                Editar
              </button>
              <button 
                className="btn-small btn-info"
                onClick={() => exportUserData(user.id)}
              >
                Exportar
              </button>
              <button 
                className="btn-small btn-warning"
                onClick={() => deleteUserData(user.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {showConsentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Gerenciar Consentimento LGPD</h3>
              <button className="modal-close" onClick={() => setShowConsentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {selectedUser && (
                <div className="user-consent-form">
                  <h4>{selectedUser.full_name}</h4>
                  <div className="consent-options">
                    <label className="consent-checkbox">
                      <input
                        type="checkbox"
                        checked={consentForm.lgpd_consent}
                        onChange={(e) => setConsentForm({...consentForm, lgpd_consent: e.target.checked})}
                      />
                      <span>Consentimento LGPD para tratamento de dados pessoais</span>
                    </label>
                    <label className="consent-checkbox">
                      <input
                        type="checkbox"
                        checked={consentForm.data_sharing_consent}
                        onChange={(e) => setConsentForm({...consentForm, data_sharing_consent: e.target.checked})}
                      />
                      <span>Autorização para compartilhamento de dados com parceiros</span>
                    </label>
                    <label className="consent-checkbox">
                      <input
                        type="checkbox"
                        checked={consentForm.marketing_consent}
                        onChange={(e) => setConsentForm({...consentForm, marketing_consent: e.target.checked})}
                      />
                      <span>Consentimento para recebimento de comunicações de marketing</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConsentModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={updateUserConsent} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Consentimento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderSecurityTab = () => (
    <div className="security-section">
      <div className="section-header">
        <h3>🔐 Configurações de Segurança</h3>
        <button className="btn-primary" onClick={() => setShow2FAModal(true)}>Configurar 2FA</button>
      </div>
      
      <div className="security-settings">
        <div className="setting-card">
          <h4>Autenticação de Dois Fatores (2FA)</h4>
          <p>Adicione uma camada extra de segurança às contas dos usuários</p>
          <div className="twofa-status">
            <div className="status-item">
              <span>Status:</span>
              <span className={`status-badge ${twoFAStatus?.enabled ? 'status-success' : 'status-error'}`}>
                {twoFAStatus?.enabled ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            {twoFAStatus?.enabled && (
              <div className="status-item">
                <span>Códigos de Backup:</span>
                <span className="backup-count">{twoFAStatus?.backup_codes_remaining || 0} restantes</span>
              </div>
            )}
          </div>
          <div className="setting-actions">
            {!twoFAStatus?.enabled ? (
              <button className="btn-primary" onClick={() => { setup2FA(); setShow2FAModal(true); }}>Configurar 2FA</button>
            ) : (
              <button className="btn-warning" onClick={disable2FA}>Desabilitar 2FA</button>
            )}
            <button className="btn-info">Configurar Política</button>
          </div>
        </div>
        
        <div className="setting-card">
          <h4>Política de Senhas</h4>
          <p>Configure os requisitos mínimos para senhas dos usuários</p>
          <div className="password-policy">
            <label><input type="checkbox" checked /> Mínimo 8 caracteres</label>
            <label><input type="checkbox" checked /> Letras maiúsculas e minúsculas</label>
            <label><input type="checkbox" checked /> Números obrigatórios</label>
            <label><input type="checkbox" /> Caracteres especiais</label>
            <label><input type="checkbox" /> Expiração em 90 dias</label>
          </div>
        </div>
        
        <div className="setting-card">
          <h4>Criptografia de Dados</h4>
          <p>Configurações de criptografia para dados sensíveis</p>
          <div className="encryption-status">
            <div className="status-item">
              <span>Dados em Trânsito:</span>
              <span className="status-badge status-success">TLS 1.3 Ativo</span>
            </div>
            <div className="status-item">
              <span>Dados em Repouso:</span>
              <span className="status-badge status-success">AES-256 Ativo</span>
            </div>
            <div className="status-item">
              <span>Backup:</span>
              <span className="status-badge status-success">Criptografado</span>
            </div>
          </div>
        </div>
        
        <div className="setting-card">
          <h4>Controle de Acesso</h4>
          <p>Gerencie permissões e níveis de acesso por perfil</p>
          <div className="access-matrix">
            <div className="access-role">
              <h5>Administrador</h5>
              <span className="permission-count">Todas as permissões (47)</span>
            </div>
            <div className="access-role">
              <h5>Médico</h5>
              <span className="permission-count">Permissões clínicas (23)</span>
            </div>
            <div className="access-role">
              <h5>Enfermeiro</h5>
              <span className="permission-count">Permissões assistenciais (15)</span>
            </div>
            <div className="access-role">
              <h5>Financeiro</h5>
              <span className="permission-count">Permissões financeiras (12)</span>
            </div>
          </div>
        </div>
      </div>

      {show2FAModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Configurar Autenticação de Dois Fatores</h3>
              <button className="modal-close" onClick={() => setShow2FAModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="twofa-setup">
                <div className="step">
                  <h4>1. Escaneie o QR Code</h4>
                  <div className="qr-code-placeholder">
                    {qrCode ? (
                      <img src={qrCode} alt="QR Code 2FA" style={{maxWidth: '200px', maxHeight: '200px'}} />
                    ) : (
                      <div className="qr-mock">📱 Carregando QR CODE...</div>
                    )}
                    <p>Use um app como Google Authenticator ou Authy</p>
                  </div>
                  {backupCodes.length > 0 && (
                    <div className="backup-codes">
                      <h5>Códigos de Backup (guarde em local seguro):</h5>
                      <div className="codes-grid">
                        {backupCodes.map((code, index) => (
                          <code key={index} className="backup-code">{code}</code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="step">
                  <h4>2. Digite o código de verificação</h4>
                  <input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="verification-input"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShow2FAModal(false)}>Cancelar</button>
              <button 
                className="btn-primary" 
                onClick={verify2FA}
                disabled={loading || !verificationCode || verificationCode.length !== 6}
              >
                {loading ? 'Verificando...' : 'Ativar 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderAuditTab = () => (
    <div className="audit-section">
      <div className="section-header">
        <h3>📋 Logs de Auditoria</h3>
        <div className="audit-filters">
          <input type="date" className="filter-input" />
          <select className="filter-select">
            <option>Todas as Ações</option>
            <option>Login/Logout</option>
            <option>Acesso a Dados</option>
            <option>Modificações</option>
            <option>LGPD</option>
          </select>
          <button className="btn-secondary">Exportar</button>
        </div>
      </div>
      
      <div className="audit-logs">
        {auditLogs.map(log => (
          <div key={log.id} className="audit-log-item">
            <div className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</div>
            <div className="log-user">{log.user_name}</div>
            <div className="log-action">{log.action}</div>
            <div className="log-details">{log.details}</div>
            <div className="log-ip">{log.ip_address}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderComplianceTab = () => (
    <div className="compliance-section">
      <div className="section-header">
        <h3>📊 Relatórios de Compliance</h3>
        <button className="btn-primary">Gerar Relatório</button>
      </div>
      
      <div className="compliance-dashboard">
        <div className="compliance-card">
          <h4>Status Geral de Compliance</h4>
          <div className="compliance-score">
            <div className="score-circle">
              <span className="score-number">94%</span>
            </div>
            <div className="score-details">
              <p>Excelente nível de conformidade</p>
              <span className="score-trend positive">+3% este mês</span>
            </div>
          </div>
        </div>
        
        <div className="compliance-metrics">
          <div className="metric-item">
            <span className="metric-label">Consentimentos LGPD</span>
            <span className="metric-value">{lgpdStats.consent_rate || 0}%</span>
            <span className="metric-status status-success">✓</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Logs de Auditoria</span>
            <span className="metric-value">100%</span>
            <span className="metric-status status-success">✓</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Criptografia</span>
            <span className="metric-value">100%</span>
            <span className="metric-status status-success">✓</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Backup Seguro</span>
            <span className="metric-value">100%</span>
            <span className="metric-status status-success">✓</span>
          </div>
        </div>
        
        <div className="recent-activities">
          <h4>Atividades Recentes de Compliance</h4>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">Hoje, 14:30</span>
              <span className="activity-desc">Backup automático realizado com sucesso</span>
              <span className="activity-status status-success">✓</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">Hoje, 10:15</span>
              <span className="activity-desc">Consentimento LGPD atualizado para 3 usuários</span>
              <span className="activity-status status-success">✓</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">Ontem, 18:45</span>
              <span className="activity-desc">Relatório de compliance gerado</span>
              <span className="activity-status status-success">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="security-lgpd-module">
      <div className="module-header">
        <h2>🔐 Segurança e LGPD</h2>
        <div className="module-tabs">
          <button 
            className={`tab-button ${activeTab === 'lgpd' ? 'active' : ''}`}
            onClick={() => setActiveTab('lgpd')}
          >
            LGPD
          </button>
          <button 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Segurança
          </button>
          <button 
            className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Auditoria
          </button>
          <button 
            className={`tab-button ${activeTab === 'compliance' ? 'active' : ''}`}
            onClick={() => setActiveTab('compliance')}
          >
            Compliance
          </button>
        </div>
      </div>
      
      <div className="module-content">
        {activeTab === 'lgpd' && renderLGPDTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'audit' && renderAuditTab()}
        {activeTab === 'compliance' && renderComplianceTab()}
      </div>
    </div>
  )
}




// Componente do Módulo de Estoque Ampliado (Etapa 5B)
const AdvancedStockModule = ({ addNotification, token }: { addNotification: (notification: Notification) => void; token: string }) => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [stockMovements, setStockMovements] = useState<any[]>([])
  const [inventories, setInventories] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Carregar dados iniciais
  useEffect(() => {
    loadProducts()
    loadSuppliers()
    loadStockMovements()
    loadInventories()
    loadBatches()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/pharmacy/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      addNotification({ id: Date.now(), type: 'error', message: 'Erro ao carregar produtos' })
    }
  }

  const loadSuppliers = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/pharmacy/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      addNotification({ id: Date.now(), type: 'error', message: 'Erro ao carregar fornecedores' })
    }
  }

  const loadStockMovements = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/pharmacy/stock-movements', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setStockMovements(data)
      }
    } catch (error) {
      addNotification({ id: Date.now(), type: 'error', message: 'Erro ao carregar movimentações' })
    }
  }

  const loadInventories = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/pharmacy/inventories', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setInventories(data)
      }
    } catch (error) {
      addNotification({ id: Date.now(), type: 'error', message: 'Erro ao carregar inventários' })
    }
  }

  const loadBatches = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/pharmacy/batches', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setBatches(data)
      }
    } catch (error) {
      addNotification({ id: Date.now(), type: 'error', message: 'Erro ao carregar lotes' })
    }
  }

  const renderProductsTab = () => (
    <div className="pharmacy-section">
      <div className="section-header">
        <h3>📦 Controle de Estoque Ampliado</h3>
        <div className="section-actions">
          <button className="btn-primary" onClick={() => setShowProductModal(true)}>Novo Produto</button>
          <button className="btn-secondary" onClick={() => setShowMovementModal(true)}>Nova Movimentação</button>
        </div>
      </div>
      
      <div className="filters-row">
        <input 
          type="search" 
          placeholder="Buscar produto/insumo..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Todas as Categorias</option>
          <option value="medicamento">Medicamentos</option>
          <option value="material_medico">Materiais Médicos</option>
          <option value="equipamento">Equipamentos</option>
          <option value="limpeza">Produtos de Limpeza</option>
          <option value="refeitorio">Insumos de Refeitório</option>
          <option value="escritorio">Material de Escritório</option>
          <option value="manutencao">Material de Manutenção</option>
        </select>
        <select className="filter-select" value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
          <option value="">Todos os Fornecedores</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos os Status</option>
          <option value="disponivel">Disponível</option>
          <option value="baixo_estoque">Baixo Estoque</option>
          <option value="vencido">Vencido</option>
          <option value="vencendo">Vencendo</option>
        </select>
      </div>

      <div className="products-grid">
        {products.filter(product => {
          const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               product.code?.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesCategory = !filterCategory || product.category === filterCategory
          const matchesSupplier = !filterSupplier || product.supplier_id === parseInt(filterSupplier)
          return matchesSearch && matchesCategory && matchesSupplier
        }).map(product => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <h4>{product.name}</h4>
              <span className={`status-badge ${product.status === 'disponivel' ? 'status-success' : 
                                              product.status === 'baixo_estoque' ? 'status-warning' : 
                                              'status-error'}`}>
                {product.status === 'disponivel' ? 'Disponível' :
                 product.status === 'baixo_estoque' ? 'Baixo Estoque' :
                 product.status === 'vencido' ? 'Vencido' : 'Vencendo'}
              </span>
            </div>
            <div className="product-details">
              <p><strong>Código:</strong> {product.code}</p>
              <p><strong>Categoria:</strong> {product.category}</p>
              <p><strong>Estoque Atual:</strong> {product.current_stock} {product.unit}</p>
              <p><strong>Estoque Mínimo:</strong> {product.minimum_stock} {product.unit}</p>
              <p><strong>Valor Unitário:</strong> R$ {product.unit_cost?.toFixed(2)}</p>
              <p><strong>Localização:</strong> {product.storage_location}</p>
            </div>
            <div className="product-actions">
              <button className="btn-small btn-secondary" onClick={() => setSelectedProduct(product)}>Detalhes</button>
              <button className="btn-small btn-info">Lotes</button>
              <button className="btn-small btn-warning">Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSuppliersTab = () => (
    <div className="pharmacy-section">
      <div className="section-header">
        <h3>🏢 Fornecedores</h3>
        <div className="section-actions">
          <button className="btn-primary" onClick={() => setShowSupplierModal(true)}>Novo Fornecedor</button>
        </div>
      </div>
      
      <div className="suppliers-grid">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="supplier-card">
            <div className="supplier-header">
              <h4>{supplier.name}</h4>
              <span className={`status-badge ${supplier.active ? 'status-success' : 'status-error'}`}>
                {supplier.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="supplier-details">
              <p><strong>CNPJ:</strong> {supplier.cnpj}</p>
              <p><strong>Contato:</strong> {supplier.contact_person}</p>
              <p><strong>Telefone:</strong> {supplier.phone}</p>
              <p><strong>Email:</strong> {supplier.email}</p>
              <p><strong>Endereço:</strong> {supplier.address}</p>
            </div>
            <div className="supplier-actions">
              <button className="btn-small btn-secondary">Editar</button>
              <button className="btn-small btn-info">Produtos</button>
              <button className={`btn-small ${supplier.active ? 'btn-warning' : 'btn-success'}`}>
                {supplier.active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMovementsTab = () => (
    <div className="pharmacy-section">
      <div className="section-header">
        <h3>📦 Movimentações de Estoque</h3>
        <div className="section-actions">
          <button className="btn-primary" onClick={() => setShowMovementModal(true)}>Nova Movimentação</button>
        </div>
      </div>
      
      <div className="movements-table">
        <table>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Lote</th>
              <th>Responsável</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {stockMovements.map(movement => (
              <tr key={movement.id}>
                <td>{new Date(movement.created_at).toLocaleString()}</td>
                <td>{movement.product_name}</td>
                <td>
                  <span className={`movement-type ${movement.movement_type === 'entrada' ? 'entrada' : 'saida'}`}>
                    {movement.movement_type === 'entrada' ? '⬆️ Entrada' : '⬇️ Saída'}
                  </span>
                </td>
                <td>{movement.quantity} {movement.unit}</td>
                <td>{movement.batch_number || '-'}</td>
                <td>{movement.responsible_user}</td>
                <td>{movement.observations || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderInventoriesTab = () => (
    <div className="pharmacy-section">
      <div className="section-header">
        <h3>📋 Inventários</h3>
        <div className="section-actions">
          <button className="btn-primary" onClick={() => setShowInventoryModal(true)}>Novo Inventário</button>
        </div>
      </div>
      
      <div className="inventories-grid">
        {inventories.map(inventory => (
          <div key={inventory.id} className="inventory-card">
            <div className="inventory-header">
              <h4>Inventário #{inventory.id}</h4>
              <span className={`status-badge ${inventory.status === 'concluido' ? 'status-success' : 
                                              inventory.status === 'em_andamento' ? 'status-warning' : 
                                              'status-info'}`}>
                {inventory.status === 'concluido' ? 'Concluído' :
                 inventory.status === 'em_andamento' ? 'Em Andamento' : 'Planejado'}
              </span>
            </div>
            <div className="inventory-details">
              <p><strong>Data:</strong> {new Date(inventory.date).toLocaleDateString()}</p>
              <p><strong>Responsável:</strong> {inventory.responsible_user}</p>
              <p><strong>Tipo:</strong> {inventory.inventory_type}</p>
              <p><strong>Produtos:</strong> {inventory.total_products || 0}</p>
              <p><strong>Divergências:</strong> {inventory.discrepancies || 0}</p>
            </div>
            <div className="inventory-actions">
              <button className="btn-small btn-secondary">Ver Detalhes</button>
              <button className="btn-small btn-info">Relatório</button>
              {inventory.status !== 'concluido' && (
                <button className="btn-small btn-success">Finalizar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBatchesTab = () => (
    <div className="pharmacy-section">
      <div className="section-header">
        <h3>🏷️ Controle de Lotes</h3>
      </div>
      
      <div className="batches-table">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Lote</th>
              <th>Fabricação</th>
              <th>Validade</th>
              <th>Quantidade</th>
              <th>Fornecedor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(batch => {
              const isExpired = new Date(batch.expiry_date) < new Date()
              const isExpiring = new Date(batch.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              
              return (
                <tr key={batch.id}>
                  <td>{batch.product_name}</td>
                  <td>{batch.batch_number}</td>
                  <td>{new Date(batch.manufacturing_date).toLocaleDateString()}</td>
                  <td>{new Date(batch.expiry_date).toLocaleDateString()}</td>
                  <td>{batch.quantity} {batch.unit}</td>
                  <td>{batch.supplier_name}</td>
                  <td>
                    <span className={`status-badge ${
                      isExpired ? 'status-error' :
                      isExpiring ? 'status-warning' :
                      'status-success'
                    }`}>
                      {isExpired ? 'Vencido' : isExpiring ? 'Vencendo' : 'Válido'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-small btn-secondary">Detalhes</button>
                    {isExpired && (
                      <button className="btn-small btn-error">Descartar</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderDepartmentsTab = () => (
    <div className="pharmacy-section">
      <div className="section-header">
        <h3>🏢 Controle por Departamentos</h3>
        <button className="btn-primary">Novo Departamento</button>
      </div>
      
      <div className="departments-grid">
        <div className="department-card">
          <div className="department-header">
            <h4>🏥 Enfermaria</h4>
            <span className="status-badge status-success">Ativo</span>
          </div>
          <div className="department-stats">
            <div className="stat-item">
              <span className="stat-label">Produtos:</span>
              <span className="stat-value">45</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Valor Total:</span>
              <span className="stat-value">R$ 12.450</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Alertas:</span>
              <span className="stat-value alert">3</span>
            </div>
          </div>
          <div className="department-actions">
            <button className="btn-small btn-secondary">Ver Estoque</button>
            <button className="btn-small btn-info">Relatório</button>
          </div>
        </div>
        
        <div className="department-card">
          <div className="department-header">
            <h4>🧹 Limpeza</h4>
            <span className="status-badge status-success">Ativo</span>
          </div>
          <div className="department-stats">
            <div className="stat-item">
              <span className="stat-label">Produtos:</span>
              <span className="stat-value">28</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Valor Total:</span>
              <span className="stat-value">R$ 3.200</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Alertas:</span>
              <span className="stat-value">0</span>
            </div>
          </div>
          <div className="department-actions">
            <button className="btn-small btn-secondary">Ver Estoque</button>
            <button className="btn-small btn-info">Relatório</button>
          </div>
        </div>
        
        <div className="department-card">
          <div className="department-header">
            <h4>🍽️ Refeitório</h4>
            <span className="status-badge status-success">Ativo</span>
          </div>
          <div className="department-stats">
            <div className="stat-item">
              <span className="stat-label">Produtos:</span>
              <span className="stat-value">67</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Valor Total:</span>
              <span className="stat-value">R$ 8.900</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Alertas:</span>
              <span className="stat-value alert">2</span>
            </div>
          </div>
          <div className="department-actions">
            <button className="btn-small btn-secondary">Ver Estoque</button>
            <button className="btn-small btn-info">Relatório</button>
          </div>
        </div>
        
        <div className="department-card">
          <div className="department-header">
            <h4>🏢 Escritório</h4>
            <span className="status-badge status-success">Ativo</span>
          </div>
          <div className="department-stats">
            <div className="stat-item">
              <span className="stat-label">Produtos:</span>
              <span className="stat-value">32</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Valor Total:</span>
              <span className="stat-value">R$ 5.600</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Alertas:</span>
              <span className="stat-value">0</span>
            </div>
          </div>
          <div className="department-actions">
            <button className="btn-small btn-secondary">Ver Estoque</button>
            <button className="btn-small btn-info">Relatório</button>
          </div>
        </div>
        
        <div className="department-card">
          <div className="department-header">
            <h4>🔧 Manutenção</h4>
            <span className="status-badge status-success">Ativo</span>
          </div>
          <div className="department-stats">
            <div className="stat-item">
              <span className="stat-label">Produtos:</span>
              <span className="stat-value">19</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Valor Total:</span>
              <span className="stat-value">R$ 4.300</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Alertas:</span>
              <span className="stat-value alert">1</span>
            </div>
          </div>
          <div className="department-actions">
            <button className="btn-small btn-secondary">Ver Estoque</button>
            <button className="btn-small btn-info">Relatório</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="pharmacy-stock-module">
      <div className="module-header">
        <h2>📦 Controle de Estoque Ampliado</h2>
      </div>
      
      <div className="pharmacy-tabs">
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Produtos
        </button>
        <button 
          className={`tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Fornecedores
        </button>
        <button 
          className={`tab-button ${activeTab === 'movements' ? 'active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          Movimentações
        </button>
        <button 
          className={`tab-button ${activeTab === 'inventories' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventories')}
        >
          Inventários
        </button>
        <button 
          className={`tab-button ${activeTab === 'batches' ? 'active' : ''}`}
          onClick={() => setActiveTab('batches')}
        >
          Lotes
        </button>
        <button 
          className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departamentos
        </button>
      </div>
      
      <div className="pharmacy-content">
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'suppliers' && renderSuppliersTab()}
        {activeTab === 'movements' && renderMovementsTab()}
        {activeTab === 'inventories' && renderInventoriesTab()}
        {activeTab === 'batches' && renderBatchesTab()}
        {activeTab === 'departments' && renderDepartmentsTab()}
      </div>
    </div>
  )
}

// Componente do Dashboard Principal
const Dashboard = ({ token, onLogout }: { token: string; onLogout: () => void }) => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentClinic, setCurrentClinic] = useState<any>(null)
  const [clinics, setClinics] = useState<any[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Funções para gerenciar notificações
  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    }
    setNotifications(prev => [...prev, notification])
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      dismissNotification(notification.id)
    }, 5000)
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Função para obter breadcrumbs baseado na seção ativa
  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, Array<{ label: string; path?: string }>> = {
      'dashboard': [{ label: 'Dashboard' }],
      'patients': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Pacientes' }],
      'appointments': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Consultas' }],
      'medical-records': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Prontuários' }],
      'doctors': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Médicos' }],
      'medications': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Medicamentos' }],
      'financial': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Financeiro' }],
      'reports': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Relatórios' }],
      'auditoria': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Auditoria' }],
      'integracao': [{ label: 'Dashboard', path: 'dashboard' }, { label: 'Integração' }],
    }
    return breadcrumbMap[activeSection] || [{ label: 'Dashboard' }]
  }

  useEffect(() => {
    // Buscar informações do usuário e clínicas
    const fetchData = async () => {
      try {
        // Buscar dados do usuário
        const userResponse = await fetch('http://localhost:8000/users/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
          
          // Buscar clínicas do usuário
          const clinicsResponse = await fetch('http://localhost:8000/clinics/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          if (clinicsResponse.ok) {
            const clinicsData = await clinicsResponse.json()
            setClinics(clinicsData)
            if (clinicsData.length > 0) {
              setCurrentClinic(clinicsData[0]) // Selecionar primeira clínica por padrão
            }
          }
          
          addNotification('success', `Bem-vindo, ${userData.full_name}!`)
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
        addNotification('error', 'Erro ao carregar dados do sistema')
      }
    }

    fetchData()
  }, [token])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'patients', label: 'Pacientes', icon: '👥' },
    { id: 'appointments', label: 'Consultas', icon: '📅' },
    { id: 'medical-records', label: 'Prontuários', icon: '📋' },
    { id: 'doctors', label: 'Médicos', icon: '👨‍⚕️' },
    { id: 'telemedicine', label: 'Telemedicina', icon: '💻' },
    { id: 'companions-visitors', label: 'Acompanhantes e Visitantes', icon: '👥' },
    { id: 'medications', label: 'Medicamentos', icon: '💊' },
    { id: 'advanced-stock', label: 'Estoque Avançado', icon: '📦' },
    { id: 'medical-devices', label: 'Dispositivos Médicos', icon: '🩺' },
    { id: 'analytics-ai', label: 'Analytics & IA', icon: '🤖' },
    { id: 'financial', label: 'Financeiro', icon: '💰' },
    { id: 'reports', label: 'Relatórios & BI', icon: '📈' },
    { id: 'administration', label: 'Administração', icon: '⚙️' },
    { id: 'security', label: 'Segurança & LGPD', icon: '🔒' },
    { id: 'system-config', label: 'Configurações', icon: '🛠️' },
    { id: 'technical-extras', label: 'Extras Técnicos', icon: '🔧' },
    { id: 'auditoria', label: 'Auditoria', icon: '🔍' },
    { id: 'integracao', label: 'Integração', icon: '🔗' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <h2>Dashboard</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Pacientes Cadastrados</h3>
                <p className="stat-number">1,234</p>
              </div>
              <div className="stat-card">
                <h3>Consultas Hoje</h3>
                <p className="stat-number">15</p>
              </div>
              <div className="stat-card">
                <h3>Receita Mensal</h3>
                <p className="stat-number">R$ 45,678</p>
              </div>
              <div className="stat-card">
                <h3>Medicamentos em Estoque</h3>
                <p className="stat-number">89</p>
              </div>
            </div>
          </div>
        )
      case 'patients':
        return <PatientModule addNotification={addNotification} token={token} />
      case 'appointments':
        return (
          <div className="section-content">
            <h2>Agenda de Consultas</h2>
            <div className="section-actions">
              <button className="btn-primary">Nova Consulta</button>
              <select className="filter-select">
                <option>Todos os médicos</option>
              </select>
            </div>
            <div className="calendar-container">
              <p>Calendário de consultas será implementado aqui...</p>
            </div>
          </div>
        )
      case 'medical-records':
        return (
          <div className="section-content">
            <h2>Prontuários Eletrônicos</h2>
            <div className="section-actions">
              <button className="btn-primary">Novo Prontuário</button>
              <input type="search" placeholder="Buscar por paciente..." className="search-input" />
            </div>
            <div className="records-container">
              <p>Lista de prontuários será carregada aqui...</p>
            </div>
          </div>
        )
      case 'doctors':
        return (
          <div className="section-content">
            <h2>Cadastro de Médicos</h2>
            <div className="section-actions">
              <button className="btn-primary">Novo Médico</button>
            </div>
            <div className="doctors-grid">
              <p>Lista de médicos será carregada aqui...</p>
            </div>
          </div>
        )
      case 'telemedicine':
        return <TelemedicineModule addNotification={addNotification} token={token} />
      case 'companions-visitors':
        return <CompanionsVisitorsModule addNotification={addNotification} token={token} />
      case 'medications':
        return <AdvancedStockModule addNotification={addNotification} token={token} />
      case 'advanced-stock':
        return <AdvancedStockManagementModule addNotification={addNotification} token={token} />
      case 'medical-devices':
        return <MedicalDevicesModule addNotification={addNotification} token={token} />
      case 'analytics-ai':
        return <AnalyticsAIModule addNotification={addNotification} token={token} />
      case 'financial':
        return (
          <div className="section-content">
            <h2>Gestão Financeira</h2>
            <div className="financial-tabs">
              <button className="tab-button active">Faturamento</button>
              <button className="tab-button">Contas a Receber</button>
              <button className="tab-button">Despesas</button>
            </div>
            <div className="financial-content">
              <p>Módulo financeiro será implementado aqui...</p>
            </div>
          </div>
        )
      case 'reports':
          return <ReportsAndBIModule addNotification={addNotification} token={token} />
      case 'administration':
        return (
          <div className="section-content">
            <h2>⚙️ Administração do Sistema</h2>
            <div className="admin-tabs">
              <button className="tab-button active">Usuários</button>
              <button className="tab-button">Perfis e Permissões</button>
              <button className="tab-button">Configurações</button>
            </div>
            <div className="admin-content">
              <div className="section-actions">
                <button className="btn-primary">Novo Usuário</button>
                <input type="search" placeholder="Buscar usuário..." className="search-input" />
                <select className="filter-select">
                  <option>Todos os Perfis</option>
                  <option>Administrador</option>
                  <option>Médico</option>
                  <option>Enfermeiro</option>
                  <option>Financeiro</option>
                  <option>Farmacêutico</option>
                  <option>Assistente Social</option>
                  <option>Psicólogo</option>
                </select>
              </div>
              <div className="users-grid">
                <div className="user-card">
                  <div className="user-header">
                    <h4>Dr. João Silva</h4>
                    <span className="status-badge status-success">Ativo</span>
                  </div>
                  <div className="user-details">
                    <p><strong>Email:</strong> joao.silva@clinica.com</p>
                    <p><strong>Perfil:</strong> Médico</p>
                    <p><strong>CRM:</strong> 12345-SP</p>
                    <p><strong>Último Acesso:</strong> 15/01/2024 14:30</p>
                  </div>
                  <div className="user-actions">
                    <button className="btn-small btn-secondary">Editar</button>
                    <button className="btn-small btn-warning">Desativar</button>
                    <button className="btn-small btn-info">Permissões</button>
                  </div>
                </div>
                <div className="user-card">
                  <div className="user-header">
                    <h4>Enfermeira Ana Costa</h4>
                    <span className="status-badge status-success">Ativo</span>
                  </div>
                  <div className="user-details">
                    <p><strong>Email:</strong> ana.costa@clinica.com</p>
                    <p><strong>Perfil:</strong> Enfermeiro</p>
                    <p><strong>COREN:</strong> 123456-SP</p>
                    <p><strong>Último Acesso:</strong> 15/01/2024 13:45</p>
                  </div>
                  <div className="user-actions">
                    <button className="btn-small btn-secondary">Editar</button>
                    <button className="btn-small btn-warning">Desativar</button>
                    <button className="btn-small btn-info">Permissões</button>
                  </div>
                </div>
                <div className="user-card">
                  <div className="user-header">
                    <h4>Carlos Financeiro</h4>
                    <span className="status-badge status-warning">Inativo</span>
                  </div>
                  <div className="user-details">
                    <p><strong>Email:</strong> carlos.financeiro@clinica.com</p>
                    <p><strong>Perfil:</strong> Financeiro</p>
                    <p><strong>CPF:</strong> ***.***.***-**</p>
                    <p><strong>Último Acesso:</strong> 10/01/2024 16:20</p>
                  </div>
                  <div className="user-actions">
                    <button className="btn-small btn-secondary">Editar</button>
                    <button className="btn-small btn-success">Ativar</button>
                    <button className="btn-small btn-info">Permissões</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'security':
        return <SecurityLGPDModule addNotification={addNotification} token={token} />
      case 'system-config':
        return <SystemConfigurationModule addNotification={addNotification} token={token} />
      case 'technical-extras':
        return <TechnicalExtrasModule addNotification={addNotification} token={token} />
      case 'auditoria':
        return <SecurityLGPDModule addNotification={addNotification} token={token} />
      case 'integracao':
        return (
          <div className="section-content">
            <h2>🔗 Integração com Sistemas Externos</h2>
            <div className="integration-tabs">
              <button className="tab-button active">DATASUS/SIH</button>
              <button className="tab-button">Sistemas Externos</button>
              <button className="tab-button">Logs de Integração</button>
            </div>
            <div className="integration-content">
              <div className="datasus-section">
                <h3>Conectividade com DATASUS/SIH</h3>
                <div className="integration-status">
                  <div className="status-indicator">
                    <span className="status-dot status-success"></span>
                    <span>Conectado ao DATASUS</span>
                  </div>
                  <div className="status-indicator">
                    <span className="status-dot status-success"></span>
                    <span>SIH Online</span>
                  </div>
                  <div className="status-indicator">
                    <span className="status-dot status-warning"></span>
                    <span>SISREG - Sincronizando</span>
                  </div>
                  <div className="status-indicator">
                    <span className="status-dot status-success"></span>
                    <span>CNES Atualizado</span>
                  </div>
                </div>
                
                <div className="datasus-actions">
                  <button className="btn-primary">Sincronizar AIH</button>
                  <button className="btn-secondary">Enviar APAC</button>
                  <button className="btn-secondary">Consultar CNES</button>
                  <button className="btn-secondary">Validar CNS</button>
                </div>
                
                <div className="datasus-stats">
                  <div className="stat-card">
                    <h4>AIH Enviadas (Mês)</h4>
                    <p className="stat-number">127</p>
                  </div>
                  <div className="stat-card">
                    <h4>APAC Processadas</h4>
                    <p className="stat-number">89</p>
                  </div>
                  <div className="stat-card">
                    <h4>CNS Validados</h4>
                    <p className="stat-number">1,234</p>
                  </div>
                  <div className="stat-card">
                    <h4>Última Sincronização</h4>
                    <p className="stat-text">Há 15 min</p>
                  </div>
                </div>
              </div>
              
              <div className="external-systems">
                <h3>Outros Sistemas Integrados</h3>
                <div className="systems-grid">
                  <div className="system-card">
                    <div className="system-header">
                      <h4>Sistema de Laboratório</h4>
                      <span className="status-badge status-success">Online</span>
                    </div>
                    <p>Integração com resultados de exames laboratoriais</p>
                    <div className="system-actions">
                      <button className="btn-small btn-secondary">Configurar</button>
                      <button className="btn-small btn-info">Testar</button>
                    </div>
                  </div>
                  
                  <div className="system-card">
                    <div className="system-header">
                      <h4>Sistema de Imagem</h4>
                      <span className="status-badge status-success">Online</span>
                    </div>
                    <p>PACS - Integração com exames de imagem</p>
                    <div className="system-actions">
                      <button className="btn-small btn-secondary">Configurar</button>
                      <button className="btn-small btn-info">Testar</button>
                    </div>
                  </div>
                  
                  <div className="system-card">
                    <div className="system-header">
                      <h4>Convênios</h4>
                      <span className="status-badge status-warning">Parcial</span>
                    </div>
                    <p>Integração com sistemas de convênios médicos</p>
                    <div className="system-actions">
                      <button className="btn-small btn-secondary">Configurar</button>
                      <button className="btn-small btn-info">Testar</button>
                    </div>
                  </div>
                  
                  <div className="system-card">
                    <div className="system-header">
                      <h4>Farmácia</h4>
                      <span className="status-badge status-error">Offline</span>
                    </div>
                    <p>Sistema de controle de medicamentos</p>
                    <div className="system-actions">
                      <button className="btn-small btn-secondary">Configurar</button>
                      <button className="btn-small btn-info">Testar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <div>Seção não encontrada</div>
    }
  }

  return (
    <div className="dashboard">
      <NotificationCenter 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
      
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </button>
          <h1>Sistema Clínico Profissional</h1>
        </div>
        
        <div className="header-center">
          {clinics.length > 0 && (
            <ClinicSelector 
              currentClinic={currentClinic}
              clinics={clinics}
              onClinicChange={setCurrentClinic}
            />
          )}
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-role">{user?.role || 'Usuário'}</span>
            <span className="user-name">{user?.full_name || 'Usuário'}</span>
            <button onClick={onLogout} className="logout-btn">Sair</button>
          </div>
        </div>
      </header>
      
      <div className="dashboard-layout">
        <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <ul className="menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="menu-label">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <main className="main-content">
          <div className="content-header">
            <Breadcrumbs items={getBreadcrumbs()} />
            {currentClinic && (
              <div className="clinic-info">
                <span className="clinic-badge">{currentClinic.name}</span>
              </div>
            )}
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// Componente Principal da Aplicação
function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <div className="app">
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
