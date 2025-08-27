'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, Filter, Download, Eye, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePrescriptionsByDoctor } from '@/hooks/usePrescriptions';
import { PRESCRIPTION_STATUS, type Prescription, type PrescriptionFilters } from '@/types/prescription';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface DoctorPrescriptionCardProps {
  prescription: Prescription;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDownloadPDF: (id: number) => void;
}

function DoctorPrescriptionCard({ 
  prescription, 
  onView, 
  onEdit, 
  onDelete, 
  onDownloadPDF 
}: DoctorPrescriptionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'dispensed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'expired':
        return 'Expirada';
      case 'cancelled':
        return 'Cancelada';
      case 'dispensed':
        return 'Dispensada';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'simple':
        return 'Simples';
      case 'controlled':
        return 'Controlada';
      case 'special':
        return 'Especial';
      case 'digital':
        return 'Digital';
      default:
        return type;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">
                Prescrição #{prescription.id}
              </CardTitle>
              <Badge className={getStatusColor(prescription.status)}>
                {getStatusLabel(prescription.status)}
              </Badge>
            </div>
            <CardDescription>
              {getTypeLabel(prescription.prescription_type)} • 
              Criada em {formatDate(prescription.created_at)}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(prescription.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              {prescription.status === 'active' && (
                <DropdownMenuItem onClick={() => onEdit(prescription.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDownloadPDF(prescription.id)}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(prescription.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Paciente:</span>
            <p className="text-gray-900">ID: {prescription.patient_id}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Prontuário:</span>
            <p className="text-gray-900">#{prescription.medical_record_id}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Validade:</span>
            <p className="text-gray-900">
              {prescription.expires_at ? formatDate(prescription.expires_at) : 'Sem validade'}
            </p>
          </div>
        </div>
        
        {prescription.content && (
          <div className="mt-4 pt-4 border-t">
            <span className="font-medium text-gray-500 text-sm">Observações:</span>
            <p className="text-sm text-gray-900 mt-1 line-clamp-2">
              {prescription.content}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Atualizada: {formatDate(prescription.updated_at)}</span>
            {prescription.is_controlled && (
              <Badge variant="outline" className="text-xs">
                Controlada
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onView(prescription.id)}
            >
              Ver Detalhes
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`/prescriptions/patient/${prescription.patient_id}`, '_blank')}
            >
              Ver Paciente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${
              trend.isPositive ? '' : 'rotate-180'
            }`} />
            {trend.value}% em relação ao mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DoctorPrescriptionHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = Number(params.doctorId);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  
  const filters: PrescriptionFilters = {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    prescription_type: typeFilter !== 'all' ? typeFilter : undefined,
    page: currentPage,
    limit: 10,
  };
  
  // Add date range filter logic
  if (dateRange !== 'all') {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
    }
    
    filters.start_date = startDate.toISOString().split('T')[0];
    filters.end_date = now.toISOString().split('T')[0];
  }
  
  const { 
    data: prescriptionsData, 
    isLoading, 
    error 
  } = usePrescriptionsByDoctor(doctorId, filters);
  
  const prescriptions = prescriptionsData?.prescriptions || [];
  const totalPages = prescriptionsData?.total_pages || 1;
  const totalCount = prescriptionsData?.total || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    active: prescriptions.filter(p => p.status === 'active').length,
    expired: prescriptions.filter(p => p.status === 'expired').length,
    controlled: prescriptions.filter(p => p.is_controlled).length,
  };

  const handleView = (prescriptionId: number) => {
    router.push(`/prescriptions/${prescriptionId}`);
  };

  const handleEdit = (prescriptionId: number) => {
    router.push(`/prescriptions/${prescriptionId}/edit`);
  };

  const handleDelete = (prescriptionId: number) => {
    // TODO: Implementar confirmação e exclusão
    toast.info('Funcionalidade de exclusão será implementada');
  };

  const handleDownloadPDF = (prescriptionId: number) => {
    // TODO: Implementar download de PDF
    toast.info('Download de PDF será implementado');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateRange('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateRange !== 'all';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erro ao carregar prescrições
              </h3>
              <p className="text-gray-600 mb-4">
                Ocorreu um erro ao carregar o histórico de prescrições do médico.
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
            onClick={() => router.push('/prescriptions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Prescrições do Médico
            </h1>
            <p className="text-gray-600">
              Médico ID: {doctorId} • {totalCount} prescrição{totalCount !== 1 ? 'ões' : ''}
            </p>
          </div>
        </div>
        
        <Button onClick={() => router.push('/prescriptions/create')}>
          <FileText className="h-4 w-4 mr-2" />
          Nova Prescrição
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Prescrições"
          value={stats.total}
          description="Todas as prescrições"
          icon={FileText}
        />
        <StatsCard
          title="Prescrições Ativas"
          value={stats.active}
          description="Válidas e em uso"
          icon={Calendar}
        />
        <StatsCard
          title="Prescrições Expiradas"
          value={stats.expired}
          description="Fora da validade"
          icon={Calendar}
        />
        <StatsCard
          title="Medicamentos Controlados"
          value={stats.controlled}
          description="Prescrições especiais"
          icon={FileText}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Buscar
              </label>
              <Input
                placeholder="Buscar por observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {PRESCRIPTION_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="simple">Simples</SelectItem>
                  <SelectItem value="controlled">Controlada</SelectItem>
                  <SelectItem value="special">Especial</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Período
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma prescrição encontrada"
          description={
            hasActiveFilters
              ? "Nenhuma prescrição corresponde aos filtros aplicados."
              : "Este médico ainda não possui prescrições registradas."
          }
          action={
            hasActiveFilters ? (
              <Button onClick={clearFilters}>
                Limpar Filtros
              </Button>
            ) : (
              <Button onClick={() => router.push('/prescriptions/create')}>
                <FileText className="h-4 w-4 mr-2" />
                Criar Primeira Prescrição
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <DoctorPrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownloadPDF={handleDownloadPDF}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}