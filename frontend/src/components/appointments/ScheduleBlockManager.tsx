'use client';

import React, { useState, useMemo } from 'react';
import { format, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Template,
  CalendarDays,
  User,
  FileText,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import {
  useScheduleBlocks,
  useScheduleBlockTemplates,
  useScheduleBlockStats
} from '@/hooks/useScheduleBlocks';
import type {
  ScheduleBlock,
  ScheduleBlockCreate,
  ScheduleBlockUpdate,
  ScheduleBlockFilters,
  ScheduleBlockTemplate,
  ScheduleBlockTemplateCreate
} from '@/types/medical';

// ============================================================================
// INTERFACES
// ============================================================================

interface ScheduleBlockManagerProps {
  doctorId?: string;
  onBlockSelect?: (block: ScheduleBlock) => void;
  showStats?: boolean;
  showTemplates?: boolean;
}

interface BlockFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  block_type: ScheduleBlock['block_type'];
  is_all_day: boolean;
  affects_availability: boolean;
  recurrence_type: ScheduleBlock['recurrence_type'];
  recurrence_end_date: string;
  recurrence_days: number[];
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ScheduleBlockManager({
  doctorId,
  onBlockSelect,
  showStats = true,
  showTemplates = true
}: ScheduleBlockManagerProps) {
  // Estados
  const [filters, setFilters] = useState<ScheduleBlockFilters>({
    doctor_id: doctorId,
    is_active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('blocks');

  // Hooks
  const {
    blocks,
    loading: blocksLoading,
    error: blocksError,
    refetch: refetchBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    validateBlock
  } = useScheduleBlocks({ filters: { ...filters, search: searchTerm } });

  const {
    templates,
    loading: templatesLoading,
    createTemplate,
    createBlockFromTemplate
  } = useScheduleBlockTemplates();

  const {
    stats,
    loading: statsLoading
  } = useScheduleBlockStats({ doctorId });

  // Dados filtrados
  const filteredBlocks = useMemo(() => {
    return blocks.filter(block => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          block.title.toLowerCase().includes(searchLower) ||
          block.description?.toLowerCase().includes(searchLower) ||
          block.block_type.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [blocks, searchTerm]);

  // Handlers
  const handleCreateBlock = async (data: BlockFormData) => {
    const blockData: ScheduleBlockCreate = {
      ...data,
      doctor_id: doctorId || '',
      created_by: doctorId || '',
      is_active: true
    };

    const result = await createBlock(blockData);
    if (result) {
      setIsCreateDialogOpen(false);
      refetchBlocks();
    }
  };

  const handleUpdateBlock = async (data: Partial<BlockFormData>) => {
    if (!selectedBlock) return;

    const result = await updateBlock(selectedBlock.id, data);
    if (result) {
      setIsEditDialogOpen(false);
      setSelectedBlock(null);
      refetchBlocks();
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este bloqueio?')) {
      const success = await deleteBlock(blockId);
      if (success) {
        refetchBlocks();
      }
    }
  };

  const handleCreateFromTemplate = async (templateId: string, startDate: string, endDate?: string) => {
    if (!doctorId) {
      toast.error('ID do médico é obrigatório');
      return;
    }

    const result = await createBlockFromTemplate(templateId, doctorId, startDate, endDate);
    if (result) {
      refetchBlocks();
    }
  };

  const getBlockTypeColor = (type: ScheduleBlock['block_type']) => {
    const colors = {
      vacation: 'bg-blue-100 text-blue-800',
      sick_leave: 'bg-red-100 text-red-800',
      training: 'bg-green-100 text-green-800',
      meeting: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-purple-100 text-purple-800',
      personal: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  const getBlockTypeLabel = (type: ScheduleBlock['block_type']) => {
    const labels = {
      vacation: 'Férias',
      sick_leave: 'Licença Médica',
      training: 'Treinamento',
      meeting: 'Reunião',
      maintenance: 'Manutenção',
      personal: 'Pessoal',
      other: 'Outro'
    };
    return labels[type] || 'Outro';
  };

  if (blocksError) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar bloqueios: {blocksError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bloqueios de Agenda</h2>
          <p className="text-muted-foreground">
            Gerencie períodos indisponíveis e bloqueios de horário
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchBlocks()}
            disabled={blocksLoading}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!doctorId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Bloqueio
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Bloqueios</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_blocks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_blocks} ativos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bloqueios Atuais</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.current_blocks}</div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Bloqueios</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcoming_blocks}</div>
              <p className="text-xs text-muted-foreground">
                Agendados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Bloqueadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.total_blocked_hours)}</div>
              <p className="text-xs text-muted-foreground">
                Total de horas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Título, descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Bloqueio</Label>
              <Select
                value={filters.block_type?.[0] || 'all'}
                onValueChange={(value) => {
                  setFilters(prev => ({
                    ...prev,
                    block_type: value === 'all' ? undefined : [value as ScheduleBlock['block_type']]
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="sick_leave">Licença Médica</SelectItem>
                  <SelectItem value="training">Treinamento</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.is_active === undefined ? 'all' : filters.is_active.toString()}
                onValueChange={(value) => {
                  setFilters(prev => ({
                    ...prev,
                    is_active: value === 'all' ? undefined : value === 'true'
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Afeta Disponibilidade</Label>
              <Select
                value={filters.affects_availability === undefined ? 'all' : filters.affects_availability.toString()}
                onValueChange={(value) => {
                  setFilters(prev => ({
                    ...prev,
                    affects_availability: value === 'all' ? undefined : value === 'true'
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="blocks">Bloqueios</TabsTrigger>
          {showTemplates && <TabsTrigger value="templates">Templates</TabsTrigger>}
        </TabsList>

        {/* Lista de Bloqueios */}
        <TabsContent value="blocks" className="space-y-4">
          {blocksLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando bloqueios...</p>
              </div>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum bloqueio encontrado</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {searchTerm || Object.keys(filters).length > 1
                    ? 'Tente ajustar os filtros de busca'
                    : 'Crie seu primeiro bloqueio de agenda'}
                </p>
                {!searchTerm && Object.keys(filters).length <= 1 && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} disabled={!doctorId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Bloqueio
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBlocks.map((block) => (
                <Card key={block.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{block.title}</h3>
                          <Badge className={getBlockTypeColor(block.block_type)}>
                            {getBlockTypeLabel(block.block_type)}
                          </Badge>
                          {block.affects_availability && (
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Afeta Disponibilidade
                            </Badge>
                          )}
                          {!block.is_active && (
                            <Badge variant="secondary" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                        {block.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {block.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(block.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                            {block.start_date !== block.end_date && (
                              <span> - {format(parseISO(block.end_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            )}
                          </div>
                          {!block.is_all_day && block.start_time && block.end_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {block.start_time} - {block.end_time}
                            </div>
                          )}
                          {block.is_all_day && (
                            <Badge variant="outline" className="text-xs">
                              Dia inteiro
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBlock(block);
                                onBlockSelect?.(block);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBlock(block);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteBlock(block.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates */}
        {showTemplates && (
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Templates de Bloqueio</h3>
                <p className="text-sm text-muted-foreground">
                  Modelos pré-configurados para criação rápida de bloqueios
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsTemplateDialogOpen(true)}
              >
                <Template className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </div>

            {templatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Carregando templates...</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge className={getBlockTypeColor(template.block_type)}>
                          {getBlockTypeLabel(template.block_type)}
                        </Badge>
                      </div>
                      {template.description && (
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Duração padrão:</span>
                          <span>{template.default_duration_hours}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Dia inteiro:</span>
                          <span>{template.is_all_day ? 'Sim' : 'Não'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Afeta disponibilidade:</span>
                          <span>{template.affects_availability ? 'Sim' : 'Não'}</span>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          const endDate = addDays(new Date(), template.default_duration_hours / 24)
                            .toISOString().split('T')[0];
                          handleCreateFromTemplate(template.id, today, endDate);
                        }}
                        disabled={!doctorId}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Usar Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Diálogos */}
      <BlockFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateBlock}
        title="Criar Bloqueio"
        submitLabel="Criar"
      />

      <BlockFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateBlock}
        initialData={selectedBlock}
        title="Editar Bloqueio"
        submitLabel="Salvar"
      />

      <TemplateFormDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onSubmit={createTemplate}
      />
    </div>
  );
}

// ============================================================================
// COMPONENTE DE FORMULÁRIO DE BLOQUEIO
// ============================================================================

interface BlockFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BlockFormData) => void;
  initialData?: ScheduleBlock | null;
  title: string;
  submitLabel: string;
}

function BlockFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  submitLabel
}: BlockFormDialogProps) {
  const [formData, setFormData] = useState<BlockFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '08:00',
    end_time: '17:00',
    block_type: 'other',
    is_all_day: true,
    affects_availability: true,
    recurrence_type: 'none',
    recurrence_end_date: '',
    recurrence_days: []
  });

  // Preencher dados iniciais
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        start_time: initialData.start_time || '08:00',
        end_time: initialData.end_time || '17:00',
        block_type: initialData.block_type,
        is_all_day: initialData.is_all_day,
        affects_availability: initialData.affects_availability,
        recurrence_type: initialData.recurrence_type || 'none',
        recurrence_end_date: initialData.recurrence_end_date || '',
        recurrence_days: initialData.recurrence_days || []
      });
    } else {
      // Reset para valores padrão
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        start_time: '08:00',
        end_time: '17:00',
        block_type: 'other',
        is_all_day: true,
        affects_availability: true,
        recurrence_type: 'none',
        recurrence_end_date: '',
        recurrence_days: []
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    
    if (!formData.start_date) {
      toast.error('Data de início é obrigatória');
      return;
    }
    
    if (!formData.end_date) {
      toast.error('Data de fim é obrigatória');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure os detalhes do bloqueio de agenda
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Férias de verão"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block_type">Tipo de Bloqueio</Label>
              <Select
                value={formData.block_type}
                onValueChange={(value: ScheduleBlock['block_type']) => 
                  setFormData(prev => ({ ...prev, block_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="sick_leave">Licença Médica</SelectItem>
                  <SelectItem value="training">Treinamento</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalhes adicionais sobre o bloqueio..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Fim *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_all_day"
              checked={formData.is_all_day}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_all_day: checked }))}
            />
            <Label htmlFor="is_all_day">Dia inteiro</Label>
          </div>

          {!formData.is_all_day && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_time">Horário de Início</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Horário de Fim</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="affects_availability"
              checked={formData.affects_availability}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, affects_availability: checked }))}
            />
            <Label htmlFor="affects_availability">Afeta disponibilidade para agendamentos</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// COMPONENTE DE FORMULÁRIO DE TEMPLATE
// ============================================================================

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ScheduleBlockTemplateCreate) => Promise<ScheduleBlockTemplate | null>;
}

function TemplateFormDialog({ open, onOpenChange, onSubmit }: TemplateFormDialogProps) {
  const [formData, setFormData] = useState<ScheduleBlockTemplateCreate>({
    name: '',
    description: '',
    block_type: 'other',
    default_duration_hours: 8,
    is_all_day: true,
    affects_availability: true,
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const result = await onSubmit(formData);
    if (result) {
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        block_type: 'other',
        default_duration_hours: 8,
        is_all_day: true,
        affects_availability: true,
        is_active: true
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Template</DialogTitle>
          <DialogDescription>
            Crie um modelo para criação rápida de bloqueios
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template_name">Nome *</Label>
            <Input
              id="template_name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Férias Padrão"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_description">Descrição</Label>
            <Textarea
              id="template_description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do template..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template_type">Tipo de Bloqueio</Label>
              <Select
                value={formData.block_type}
                onValueChange={(value: ScheduleBlock['block_type']) => 
                  setFormData(prev => ({ ...prev, block_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="sick_leave">Licença Médica</SelectItem>
                  <SelectItem value="training">Treinamento</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração Padrão (horas)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.default_duration_hours}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  default_duration_hours: parseInt(e.target.value) || 1 
                }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="template_all_day"
                checked={formData.is_all_day}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_all_day: checked }))}
              />
              <Label htmlFor="template_all_day">Dia inteiro por padrão</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="template_affects"
                checked={formData.affects_availability}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, affects_availability: checked }))}
              />
              <Label htmlFor="template_affects">Afeta disponibilidade por padrão</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}