'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Users, TrendingUp, Settings } from 'lucide-react';
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
  useSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
  useSpecialtyStats,
  useInitializeDefaultData,
} from '@/hooks/useMedical';
import {
  MedicalSpecialty,
  MedicalSpecialtyCreate,
  MedicalSpecialtyUpdate,
  SpecialtyFilters,
} from '@/types/medical';

interface SpecialtyManagerProps {
  onSpecialtySelect?: (specialty: MedicalSpecialty) => void;
  selectedSpecialtyId?: string;
  showStats?: boolean;
  compact?: boolean;
}

export function SpecialtyManager({
  onSpecialtySelect,
  selectedSpecialtyId,
  showStats = true,
  compact = false,
}: SpecialtyManagerProps) {
  const [filters, setFilters] = useState<SpecialtyFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<MedicalSpecialty | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState<string | null>(null);

  // Queries
  const {
    data: specialtiesData,
    isLoading,
    error,
    refetch,
  } = useSpecialties({
    filters: {
      ...filters,
      search: searchTerm || undefined,
    },
  });

  const { data: statsData } = useSpecialtyStats(
    showStatsDialog || '',
    undefined,
  );

  // Mutations
  const createSpecialtyMutation = useCreateSpecialty();
  const updateSpecialtyMutation = useUpdateSpecialty();
  const deleteSpecialtyMutation = useDeleteSpecialty();
  const initializeDataMutation = useInitializeDefaultData();

  const specialties = specialtiesData?.data || [];

  // Handlers
  const handleCreateSpecialty = async (data: MedicalSpecialtyCreate) => {
    try {
      await createSpecialtyMutation.mutateAsync(data);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Erro ao criar especialidade:', error);
    }
  };

  const handleUpdateSpecialty = async (data: MedicalSpecialtyUpdate) => {
    if (!editingSpecialty) return;

    try {
      await updateSpecialtyMutation.mutateAsync({
        id: editingSpecialty.id,
        data,
      });
      setEditingSpecialty(null);
    } catch (error) {
      console.error('Erro ao atualizar especialidade:', error);
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    try {
      await deleteSpecialtyMutation.mutateAsync(id);
      setShowDeleteDialog(null);
    } catch (error) {
      console.error('Erro ao deletar especialidade:', error);
    }
  };

  const handleInitializeData = async () => {
    try {
      await initializeDataMutation.mutateAsync();
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
    }
  };

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Erro ao carregar especialidades. Tente novamente.
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
            Especialidades Médicas
          </h2>
          <p className="text-muted-foreground">
            Gerencie as especialidades médicas disponíveis na clínica
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleInitializeData}
            disabled={initializeDataMutation.isPending}
          >
            <Settings className="h-4 w-4 mr-2" />
            Inicializar Dados
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Especialidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <SpecialtyForm
                onSubmit={handleCreateSpecialty}
                isLoading={createSpecialtyMutation.isPending}
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
                  placeholder="Buscar especialidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.is_active?.toString() || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  is_active: value === 'all' ? undefined : value === 'true',
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Specialties Grid */}
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
          {specialties.map((specialty) => (
            <Card
              key={specialty.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSpecialtyId === specialty.id
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => onSpecialtySelect?.(specialty)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{specialty.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {specialty.code}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={specialty.is_active ? 'default' : 'secondary'}
                    >
                      {specialty.is_active ? 'Ativo' : 'Inativo'}
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
                                setShowStatsDialog(specialty.id);
                              }}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver estatísticas</p>
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
                                setEditingSpecialty(specialty);
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
                                setShowDeleteDialog(specialty.id);
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
                {specialty.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {specialty.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>0 médicos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && specialties.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma especialidade encontrada
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira especialidade médica'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Especialidade
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingSpecialty}
        onOpenChange={() => setEditingSpecialty(null)}
      >
        <DialogContent>
          {editingSpecialty && (
            <SpecialtyForm
              specialty={editingSpecialty}
              onSubmit={handleUpdateSpecialty}
              isLoading={updateSpecialtyMutation.isPending}
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
              Tem certeza que deseja excluir esta especialidade? Esta ação não
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
              onClick={() => showDeleteDialog && handleDeleteSpecialty(showDeleteDialog)}
              disabled={deleteSpecialtyMutation.isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog
        open={!!showStatsDialog}
        onOpenChange={() => setShowStatsDialog(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Estatísticas da Especialidade</DialogTitle>
          </DialogHeader>
          {statsData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {statsData.total_appointments}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total de Consultas
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {statsData.active_doctors}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Médicos Ativos
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// SPECIALTY FORM COMPONENT
// ============================================================================

interface SpecialtyFormProps {
  specialty?: MedicalSpecialty;
  onSubmit: (data: MedicalSpecialtyCreate | MedicalSpecialtyUpdate) => void;
  isLoading?: boolean;
}

function SpecialtyForm({ specialty, onSubmit, isLoading }: SpecialtyFormProps) {
  const [formData, setFormData] = useState({
    name: specialty?.name || '',
    code: specialty?.code || '',
    description: specialty?.description || '',
    is_active: specialty?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {specialty ? 'Editar Especialidade' : 'Nova Especialidade'}
        </DialogTitle>
        <DialogDescription>
          {specialty
            ? 'Atualize as informações da especialidade médica'
            : 'Crie uma nova especialidade médica'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Cardiologia"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Ex: CARDIO"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Descrição da especialidade..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_active: checked })
            }
          />
          <Label htmlFor="is_active">Especialidade ativa</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {specialty ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
}