'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Database, HardDrive, Settings, Trash2 } from 'lucide-react'
import { useBackup } from '@/hooks/useBackup'
import type { BackupJobSettings, BackupFrequency, BackupType, StorageLocation } from '@/types/backup'
import { toast } from 'sonner'

const backupJobSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  frequency: z.enum(['manual', 'daily', 'weekly', 'monthly'] as const),
  backupType: z.enum(['full', 'incremental', 'differential'] as const),
  storageLocation: z.enum(['local', 'cloud', 'both'] as const),
  enabled: z.boolean(),
  retentionDays: z.number().min(1).max(365),
  scheduledTime: z.string().optional(),
  scheduledDays: z.array(z.number()).optional(),
  modules: z.array(z.string()),
  compression: z.boolean(),
  encryption: z.boolean(),
  maxBackupSize: z.number().optional(),
})

type BackupJobFormData = z.infer<typeof backupJobSchema>

interface BackupSchedulerProps {
  jobId?: string
  onSave?: () => void
  onCancel?: () => void
}

const frequencyOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
]

const backupTypeOptions = [
  { value: 'full', label: 'Completo', description: 'Backup completo de todos os dados' },
  { value: 'incremental', label: 'Incremental', description: 'Apenas alterações desde o último backup' },
  { value: 'differential', label: 'Diferencial', description: 'Alterações desde o último backup completo' },
]

const storageOptions = [
  { value: 'local', label: 'Local', icon: HardDrive },
  { value: 'cloud', label: 'Nuvem', icon: Database },
  { value: 'both', label: 'Local + Nuvem', icon: Settings },
]

const weekDays = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
]

export function BackupScheduler({ jobId, onSave, onCancel }: BackupSchedulerProps) {
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  
  const { 
    useBackupJob, 
    useBackupModules, 
    createBackupJob, 
    updateBackupJob 
  } = useBackup()
  
  const { data: existingJob } = useBackupJob(jobId || '')
  const { data: modules = [] } = useBackupModules()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BackupJobFormData>({
    resolver: zodResolver(backupJobSchema),
    defaultValues: {
      name: existingJob?.name || '',
      description: existingJob?.description || '',
      frequency: existingJob?.frequency || 'daily',
      backupType: existingJob?.backupType || 'incremental',
      storageLocation: existingJob?.storageLocation || 'local',
      enabled: existingJob?.enabled ?? true,
      retentionDays: existingJob?.retentionDays || 30,
      scheduledTime: existingJob?.scheduledTime || '02:00',
      modules: existingJob?.modules || [],
      compression: existingJob?.compression ?? true,
      encryption: existingJob?.encryption ?? true,
      maxBackupSize: existingJob?.maxBackupSize,
    },
  })
  
  const frequency = watch('frequency')
  const backupType = watch('backupType')
  const storageLocation = watch('storageLocation')
  
  const onSubmit = async (data: BackupJobFormData) => {
    try {
      const jobData: BackupJobSettings = {
        ...data,
        scheduledDays: frequency === 'weekly' ? selectedDays : undefined,
        modules: selectedModules,
      }
      
      if (jobId) {
        await updateBackupJob.mutateAsync({ jobId, settings: jobData })
        toast.success('Agendamento atualizado com sucesso')
      } else {
        await createBackupJob.mutateAsync(jobData)
        toast.success('Agendamento criado com sucesso')
      }
      
      onSave?.()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar agendamento')
    }
  }
  
  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }
  
  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {jobId ? 'Editar Agendamento' : 'Novo Agendamento de Backup'}
        </CardTitle>
        <CardDescription>
          Configure quando e como os backups serão executados automaticamente
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Agendamento</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ex: Backup Diário Completo"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Retenção (dias)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  min="1"
                  max="365"
                  {...register('retentionDays', { valueAsNumber: true })}
                />
                {errors.retentionDays && (
                  <p className="text-sm text-red-500">{errors.retentionDays.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descreva o propósito deste backup..."
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                {...register('enabled')}
                onCheckedChange={(checked) => setValue('enabled', checked)}
              />
              <Label htmlFor="enabled">Agendamento ativo</Label>
            </div>
          </div>
          
          <Separator />
          
          {/* Configurações de Frequência */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Frequência</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={frequency}
                  onValueChange={(value) => setValue('frequency', value as BackupFrequency)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {frequency !== 'manual' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Horário</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    {...register('scheduledTime')}
                  />
                </div>
              )}
            </div>
            
            {frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Configurações de Backup */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurações de Backup</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Backup</Label>
                <Select
                  value={backupType}
                  onValueChange={(value) => setValue('backupType', value as BackupType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backupTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Local de Armazenamento</Label>
                <Select
                  value={storageLocation}
                  onValueChange={(value) => setValue('storageLocation', value as StorageLocation)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storageOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compression"
                    {...register('compression')}
                    onCheckedChange={(checked) => setValue('compression', checked)}
                  />
                  <Label htmlFor="compression">Compressão</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="encryption"
                    {...register('encryption')}
                    onCheckedChange={(checked) => setValue('encryption', checked)}
                  />
                  <Label htmlFor="encryption">Criptografia</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxBackupSize">Tamanho Máximo (MB) - Opcional</Label>
                <Input
                  id="maxBackupSize"
                  type="number"
                  min="1"
                  {...register('maxBackupSize', { valueAsNumber: true })}
                  placeholder="Deixe vazio para sem limite"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Seleção de Módulos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Módulos para Backup</h3>
            <p className="text-sm text-muted-foreground">
              Selecione quais módulos do sistema serão incluídos no backup
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {modules.map((module) => (
                <Button
                  key={module.id}
                  type="button"
                  variant={selectedModules.includes(module.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleModule(module.id)}
                  className="justify-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {module.name}
                </Button>
              ))}
            </div>
            
            {selectedModules.length === 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ Nenhum módulo selecionado. O backup será vazio.
              </p>
            )}
          </div>
          
          <Separator />
          
          {/* Ações */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : jobId ? 'Atualizar' : 'Criar Agendamento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}