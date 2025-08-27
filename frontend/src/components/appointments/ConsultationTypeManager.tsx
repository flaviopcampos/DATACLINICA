'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Clock, DollarSign, Video, MapPin, Settings } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Alert,
  AlertDescription,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Switch,
  Label,
  Textarea,
} from '@/components/ui';
import { toast } from 'sonner';
import {
  useConsultationTypes,
  useCreateConsultationType,
  useUpdateConsultationType,
  useDeleteConsultationType,
  useActiveSpecialties,
  useConsultationTypeSettings,
  useUpdateConsultationTypeSettings,
} from '@/hooks/useMedical';
import {
  ConsultationType,
  ConsultationTypeCreate,
  ConsultationTypeUpdate,
  ConsultationTypeFilters,
  ConsultationTypeSettings,
} from '@/types/medical';

interface ConsultationTypeManagerProps {
  onTypeSelect?: (type: ConsultationType) => void;
  selectedTypeId?: string;
  specialtyId?: string;
  showSettings?: boolean;
  compact?: boolean;
}

export function ConsultationTypeManager({
  onTypeSelect,
  selectedTypeId,
  specialtyId,
  showSettings = true,
  compact = false,
}: ConsultationTypeManagerProps) {
  const [filters, setFilters] = useState<ConsultationTypeFilters>({
    specialty_id: specialtyId,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingType, setEditingType] = useState<ConsultationType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Queries
  const {
    data: typesData,
    isLoading,
    error,
    refetch,
  } = useConsultationTypes({
    filters: {
      ...filters,
      search: searchTerm || undefined,
    },
  });

  const { data: specialties } = useActiveSpecialties();
  const { data: settings } = useConsultationTypeSettings();

  // Mutations
  const createTypeMutation = useCreateConsultationType();
  const updateTypeMutation = useUpdateConsultationType();
  const deleteTypeMutation = useDeleteConsultationType();
  const updateSettingsMutation = useUpdateConsultationTypeSettings();

  const consultationTypes = typesData?.data || [];

  // Handlers
  const handleCreateType = async (data: ConsultationTypeCreate) => {
    try {
      await createTypeMutation.mutateAsync(data);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Erro ao criar tipo de consulta:', error);
    }
  };

  const handleUpdateType = async (data: ConsultationTypeUpdate) => {
    if (!editingType) return;

    try {
      await updateTypeMutation.mutateAsync({
        id: editingType.id,
        data,
      });
      setEditingType(null);
    } catch (error) {
      console.error('Erro ao atualizar tipo de consulta:', error);
    }
  };

  const handleDeleteType = async (id: string) => {
    try {
      await deleteTypeMutation.mutateAsync(id);
      setShowDeleteDialog(null);
    } catch (error) {
      console.error('Erro ao deletar tipo de consulta:', error);
    }
  };

  const handleUpdateSettings = async (newSettings: ConsultationTypeSettings) => {
    try {
      await updateSettingsMutation.mutateAsync(newSettings);
      setShowSettingsDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
    }
  };

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Erro ao carregar tipos de consulta. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tipos de Consulta
          </h2>
          <p className="text-muted-foreground">
            Gerencie os tipos de consulta disponíveis na clínica
          </p>
        </div>
        <div className="flex gap-2">
          {showSettings && (
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ConsultationTypeForm
                onSubmit={handleCreateType}
                isLoading={createTypeMutation.isPending}
                specialties={specialties || []}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar tipos de consulta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.specialty_id || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  specialty_id: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Especialidades</SelectItem>
                {specialties?.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.is_active?.toString() || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  is_active: value === 'all' ? undefined : value === 'true',
                })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.is_telemedicine_compatible?.toString() || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  is_telemedicine_compatible:
                    value === 'all' ? undefined : value === 'true',
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Telemedicina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Compatível</SelectItem>
                <SelectItem value="false">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Types Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consultationTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTypeId === type.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onTypeSelect?.(type)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {type.name}
                      {type.is_telemedicine_compatible && (
                        <Video className="h-4 w-4 text-blue-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {type.specialty?.name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={type.is_active ? 'default' : 'secondary'}
                    >
                      {type.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingType(type);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteDialog(type.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {type.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {type.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{type.duration_minutes}min</span>
                    </div>
                    {type.suggested_price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>R$ {type.suggested_price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {type.is_telemedicine_compatible && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs">
                              <Video className="h-3 w-3 mr-1" />
                              Online
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Compatível com telemedicina</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {!type.is_telemedicine_compatible && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        Presencial
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && consultationTypes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum tipo de consulta encontrado
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro tipo de consulta'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Tipo de Consulta
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
        <DialogContent className="max-w-2xl">
          {editingType && (
            <ConsultationTypeForm
              type={editingType}
              onSubmit={handleUpdateType}
              isLoading={updateTypeMutation.isPending}
              specialties={specialties || []}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este tipo de consulta? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDeleteType(showDeleteDialog)}
              disabled={deleteTypeMutation.isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações de Tipos de Consulta</DialogTitle>
            <DialogDescription>
              Configure as opções globais para tipos de consulta
            </DialogDescription>
          </DialogHeader>
          {settings && (
            <ConsultationTypeSettingsForm
              settings={settings}
              onSubmit={handleUpdateSettings}
              isLoading={updateSettingsMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// CONSULTATION TYPE FORM COMPONENT
// ============================================================================

interface ConsultationTypeFormProps {
  type?: ConsultationType;
  onSubmit: (data: ConsultationTypeCreate | ConsultationTypeUpdate) => void;
  isLoading?: boolean;
  specialties: Array<{ id: string; name: string }>;
}

function ConsultationTypeForm({
  type,
  onSubmit,
  isLoading,
  specialties,
}: ConsultationTypeFormProps) {
  const [formData, setFormData] = useState({
    name: type?.name || '',
    description: type?.description || '',
    specialty_id: type?.specialty_id || '',
    duration_minutes: type?.duration_minutes || 30,
    suggested_price: type?.suggested_price || 0,
    is_telemedicine_compatible: type?.is_telemedicine_compatible ?? false,
    requires_preparation: type?.requires_preparation ?? false,
    preparation_instructions: type?.preparation_instructions || '',
    is_active: type?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {type ? 'Editar Tipo de Consulta' : 'Novo Tipo de Consulta'}
        </DialogTitle>
        <DialogDescription>
          {type
            ? 'Atualize as informações do tipo de consulta'
            : 'Crie um novo tipo de consulta'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Consulta de Rotina"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialty_id">Especialidade *</Label>
            <Select
              value={formData.specialty_id}
              onValueChange={(value) =>
                setFormData({ ...formData, specialty_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma especialidade" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Descrição do tipo de consulta..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duração (minutos) *</Label>
            <Input
              id="duration_minutes"
              type="number"
              min="15"
              max="240"
              step="15"
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration_minutes: parseInt(e.target.value) || 30,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suggested_price">Preço Sugerido (R$)</Label>
            <Input
              id="suggested_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.suggested_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  suggested_price: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_telemedicine_compatible"
              checked={formData.is_telemedicine_compatible}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_telemedicine_compatible: checked })
              }
            />
            <Label htmlFor="is_telemedicine_compatible">
              Compatível com telemedicina
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="requires_preparation"
              checked={formData.requires_preparation}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, requires_preparation: checked })
              }
            />
            <Label htmlFor="requires_preparation">
              Requer preparação prévia
            </Label>
          </div>

          {formData.requires_preparation && (
            <div className="space-y-2">
              <Label htmlFor="preparation_instructions">
                Instruções de Preparação
              </Label>
              <Textarea
                id="preparation_instructions"
                value={formData.preparation_instructions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preparation_instructions: e.target.value,
                  })
                }
                placeholder="Instruções para o paciente..."
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor="is_active">Tipo de consulta ativo</Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {type ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ============================================================================
// SETTINGS FORM COMPONENT
// ============================================================================

interface ConsultationTypeSettingsFormProps {
  settings: ConsultationTypeSettings;
  onSubmit: (settings: ConsultationTypeSettings) => void;
  isLoading?: boolean;
}

function ConsultationTypeSettingsForm({
  settings,
  onSubmit,
  isLoading,
}: ConsultationTypeSettingsFormProps) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="default_duration">Duração Padrão (min)</Label>
            <Input
              id="default_duration"
              type="number"
              min="15"
              max="240"
              step="15"
              value={formData.default_duration_minutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  default_duration_minutes: parseInt(e.target.value) || 30,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_advance_booking">Agendamento Antecipado (dias)</Label>
            <Input
              id="max_advance_booking"
              type="number"
              min="1"
              max="365"
              value={formData.max_advance_booking_days}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_advance_booking_days: parseInt(e.target.value) || 30,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="allow_telemedicine"
              checked={formData.allow_telemedicine_by_default}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, allow_telemedicine_by_default: checked })
              }
            />
            <Label htmlFor="allow_telemedicine">
              Permitir telemedicina por padrão
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="require_confirmation"
              checked={formData.require_confirmation_by_default}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, require_confirmation_by_default: checked })
              }
            />
            <Label htmlFor="require_confirmation">
              Exigir confirmação por padrão
            </Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          Salvar Configurações
        </Button>
      </DialogFooter>
    </form>
  );
}