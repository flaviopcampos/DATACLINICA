import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Plus, Settings, Copy, Download, Upload, Filter, Search, RotateCcw } from 'lucide-react';
import { DoctorAvailability, AvailabilityPattern, WorkingHours, ScheduleBlock } from '../../types/appointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import AvailabilityGrid from './AvailabilityGrid';
import DoctorSchedule from './DoctorSchedule';
import TimeSlotManager from './TimeSlotManager';

interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  email?: string;
}

interface AvailabilityManagerProps {
  doctors: Doctor[];
  selectedDoctorId?: string;
  onDoctorChange?: (doctorId: string) => void;
  availability: DoctorAvailability[];
  patterns: AvailabilityPattern[];
  workingHours: WorkingHours[];
  scheduleBlocks: ScheduleBlock[];
  onUpdateAvailability: (availability: DoctorAvailability[]) => Promise<void>;
  onCreatePattern: (pattern: AvailabilityPattern) => Promise<void>;
  onUpdatePattern: (pattern: AvailabilityPattern) => Promise<void>;
  onDeletePattern: (patternId: string) => Promise<void>;
  onUpdateWorkingHours: (workingHours: WorkingHours) => Promise<void>;
  onCreateScheduleBlock: (block: ScheduleBlock) => Promise<void>;
  onUpdateScheduleBlock: (block: ScheduleBlock) => Promise<void>;
  onDeleteScheduleBlock: (blockId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

interface FilterState {
  dateRange: { start: Date; end: Date };
  showOnlyAvailable: boolean;
  showOnlyBooked: boolean;
  specialty?: string;
}

function AvailabilityManager({
  doctors,
  selectedDoctorId,
  onDoctorChange,
  availability,
  patterns,
  workingHours,
  scheduleBlocks,
  onUpdateAvailability,
  onCreatePattern,
  onUpdatePattern,
  onDeletePattern,
  onUpdateWorkingHours,
  onCreateScheduleBlock,
  onUpdateScheduleBlock,
  onDeleteScheduleBlock,
  isLoading = false,
  className
}: AvailabilityManagerProps) {
  const [activeTab, setActiveTab] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showPatternDialog, setShowPatternDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: new Date(),
      end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 semanas
    },
    showOnlyAvailable: false,
    showOnlyBooked: false
  });

  // Médico selecionado
  const selectedDoctor = useMemo(() => {
    return doctors.find(doc => doc.id === selectedDoctorId) || doctors[0];
  }, [doctors, selectedDoctorId]);

  // Médicos filtrados
  const filteredDoctors = useMemo(() => {
    if (!searchTerm) return doctors;
    
    return doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  // Disponibilidade do médico selecionado
  const doctorAvailability = useMemo(() => {
    return availability.filter(avail => avail.doctorId === selectedDoctor?.id);
  }, [availability, selectedDoctor]);

  // Padrões do médico selecionado
  const doctorPatterns = useMemo(() => {
    return patterns.filter(pattern => pattern.doctorId === selectedDoctor?.id);
  }, [patterns, selectedDoctor]);

  // Horários de trabalho do médico selecionado
  const doctorWorkingHours = useMemo(() => {
    return workingHours.find(wh => wh.doctorId === selectedDoctor?.id);
  }, [workingHours, selectedDoctor]);

  // Bloqueios do médico selecionado
  const doctorScheduleBlocks = useMemo(() => {
    return scheduleBlocks.filter(block => block.doctorId === selectedDoctor?.id);
  }, [scheduleBlocks, selectedDoctor]);

  const handleDoctorSelect = (doctorId: string) => {
    onDoctorChange?.(doctorId);
  };

  const handleApplyPattern = async (patternId: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern || !selectedDoctor) return;

    try {
      // Aplicar padrão para o período selecionado
      const newAvailability: DoctorAvailability[] = [];
      const current = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);

      while (current <= end) {
        const dayOfWeek = current.getDay();
        const patternDay = pattern.weeklyPattern?.find(p => p.dayOfWeek === dayOfWeek);
        
        if (patternDay && patternDay.isAvailable) {
          const dateStr = current.toISOString().split('T')[0];
          newAvailability.push({
            id: `${selectedDoctor.id}-${dateStr}`,
            doctorId: selectedDoctor.id,
            date: dateStr,
            isAvailable: true,
            timeSlots: patternDay.timeSlots || []
          });
        }
        
        current.setDate(current.getDate() + 1);
      }

      await onUpdateAvailability([...availability.filter(a => a.doctorId !== selectedDoctor.id), ...newAvailability]);
      toast.success('Padrão aplicado com sucesso!');
    } catch (error) {
      toast.error('Erro ao aplicar padrão.');
    }
  };

  const handleExportAvailability = () => {
    const data = {
      doctor: selectedDoctor,
      availability: doctorAvailability,
      patterns: doctorPatterns,
      workingHours: doctorWorkingHours,
      scheduleBlocks: doctorScheduleBlocks,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disponibilidade-${selectedDoctor?.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Disponibilidade exportada com sucesso!');
  };

  const handleCopyWeek = async (sourceWeek: Date) => {
    if (!selectedDoctor) return;

    try {
      const startOfWeek = new Date(sourceWeek);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      // Buscar disponibilidade da semana fonte
      const sourceAvailability = availability.filter(avail => {
        const availDate = new Date(avail.date);
        return avail.doctorId === selectedDoctor.id && 
               availDate >= startOfWeek && 
               availDate <= endOfWeek;
      });

      if (sourceAvailability.length === 0) {
        toast.error('Nenhuma disponibilidade encontrada na semana selecionada.');
        return;
      }

      // Aplicar para a próxima semana
      const nextWeekStart = new Date(startOfWeek);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);

      const newAvailability = sourceAvailability.map(avail => {
        const sourceDate = new Date(avail.date);
        const targetDate = new Date(nextWeekStart);
        targetDate.setDate(targetDate.getDate() + (sourceDate.getDay()));
        
        return {
          ...avail,
          id: `${selectedDoctor.id}-${targetDate.toISOString().split('T')[0]}`,
          date: targetDate.toISOString().split('T')[0]
        };
      });

      await onUpdateAvailability([...availability, ...newAvailability]);
      toast.success('Semana copiada com sucesso!');
    } catch (error) {
      toast.error('Erro ao copiar semana.');
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando gerenciador de disponibilidade...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Gerenciador de Disponibilidade</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAvailability}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Disponibilidade</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Selecione um arquivo JSON de disponibilidade para importar.
                    </p>
                    <Input type="file" accept=".json" />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                        Cancelar
                      </Button>
                      <Button>Importar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Seleção de médico e filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Seleção de médico */}
            <div className="space-y-2">
              <Label>Médico</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar médico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDoctor?.id} onValueChange={handleDoctorSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um médico" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          {doctor.specialty && (
                            <div className="text-xs text-gray-500">{doctor.specialty}</div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                  }))}
                />
                <Input
                  type="date"
                  value={filters.dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                  }))}
                />
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="space-y-2">
              <Label>Ações Rápidas</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyWeek(new Date())}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Semana
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      dateRange: {
                        start: new Date(),
                        end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                      },
                      showOnlyAvailable: false,
                      showOnlyBooked: false
                    });
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.showOnlyAvailable}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showOnlyAvailable: checked }))}
                  />
                  <Label>Apenas disponíveis</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.showOnlyBooked}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showOnlyBooked: checked }))}
                  />
                  <Label>Apenas ocupados</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Select value={filters.specialty} onValueChange={(value) => setFilters(prev => ({ ...prev, specialty: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="cardiologia">Cardiologia</SelectItem>
                      <SelectItem value="dermatologia">Dermatologia</SelectItem>
                      <SelectItem value="pediatria">Pediatria</SelectItem>
                      <SelectItem value="ortopedia">Ortopedia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informações do médico selecionado */}
      {selectedDoctor && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedDoctor.name}</h3>
                  {selectedDoctor.specialty && (
                    <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                  )}
                  {selectedDoctor.email && (
                    <p className="text-xs text-gray-500">{selectedDoctor.email}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {doctorAvailability.reduce((acc, avail) => 
                      acc + (avail.timeSlots?.filter(slot => slot.isAvailable && !slot.isBooked).length || 0), 0
                    )}
                  </div>
                  <div className="text-xs text-gray-600">Horários Livres</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {doctorAvailability.reduce((acc, avail) => 
                      acc + (avail.timeSlots?.filter(slot => slot.isBooked).length || 0), 0
                    )}
                  </div>
                  <div className="text-xs text-gray-600">Horários Ocupados</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{doctorPatterns.length}</div>
                  <div className="text-xs text-gray-600">Padrões</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{doctorScheduleBlocks.length}</div>
                  <div className="text-xs text-gray-600">Bloqueios</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grid">Grade de Horários</TabsTrigger>
          <TabsTrigger value="schedule">Configuração</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="blocks">Bloqueios</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {selectedDoctor && (
            <AvailabilityGrid
              doctorId={selectedDoctor.id}
              doctorName={selectedDoctor.name}
              availability={doctorAvailability}
              onUpdateAvailability={onUpdateAvailability}
              onCreatePattern={onCreatePattern}
              startDate={filters.dateRange.start}
              endDate={filters.dateRange.end}
            />
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {selectedDoctor && (
            <DoctorSchedule
              doctorId={selectedDoctor.id}
              doctorName={selectedDoctor.name}
              workingHours={doctorWorkingHours}
              onUpdateWorkingHours={onUpdateWorkingHours}
            />
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {selectedDoctor && (
            <TimeSlotManager
              doctorId={selectedDoctor.id}
              patterns={doctorPatterns}
              onCreatePattern={onCreatePattern}
              onUpdatePattern={onUpdatePattern}
              onDeletePattern={onDeletePattern}
              onApplyPattern={handleApplyPattern}
            />
          )}
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Bloqueios de Agenda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Funcionalidade de bloqueios será implementada aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AvailabilityManager;