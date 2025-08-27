'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Archive, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Database, 
  FileText, 
  HardDrive, 
  Loader2, 
  RefreshCw, 
  Shield, 
  AlertTriangle,
  Clock,
  Users,
  Calendar
} from 'lucide-react'
import { useBackup } from '@/hooks/useBackup'
import { useRestore } from '@/hooks/useRestore'
import type { Backup, RestoreScope, CreateRestoreRequest } from '@/types/backup'
import { toast } from 'sonner'
import { formatBytes } from '@/lib/utils'

const restoreSchema = z.object({
  backupId: z.string().min(1, 'Selecione um backup'),
  scope: z.enum(['full', 'partial'] as const),
  modules: z.array(z.string()).optional(),
  overwriteExisting: z.boolean(),
  createBackupBeforeRestore: z.boolean(),
  validateIntegrity: z.boolean(),
})

type RestoreFormData = z.infer<typeof restoreSchema>

interface RestoreWizardProps {
  onComplete?: () => void
  onCancel?: () => void
}

type WizardStep = 'select' | 'configure' | 'preview' | 'confirm' | 'progress'

export function RestoreWizard({ onComplete, onCancel }: RestoreWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('select')
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [restoreJobId, setRestoreJobId] = useState<string | null>(null)
  
  const { useBackups } = useBackup()
  const { 
    useRestorePreview, 
    useRestoreValidation, 
    useRestoreProgress, 
    createRestore 
  } = useRestore()
  
  const { data: backups = [], isLoading: loadingBackups } = useBackups()
  const { data: preview } = useRestorePreview(
    selectedBackup?.id || '', 
    currentStep === 'preview' ? { modules: selectedModules } as RestoreScope : undefined
  )
  const { data: progress } = useRestoreProgress(restoreJobId || '')
  const { validateRestoreData } = useRestoreValidation()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RestoreFormData>({
    resolver: zodResolver(restoreSchema),
    defaultValues: {
      scope: 'full',
      overwriteExisting: false,
      createBackupBeforeRestore: true,
      validateIntegrity: true,
      modules: [],
    },
  })
  
  const scope = watch('scope')
  const overwriteExisting = watch('overwriteExisting')
  const createBackupBeforeRestore = watch('createBackupBeforeRestore')
  
  // Filtrar apenas backups completos e bem-sucedidos
  const availableBackups = backups.filter(backup => 
    backup.status === 'completed' && backup.type !== 'incremental'
  )
  
  const handleBackupSelect = (backup: Backup) => {
    setSelectedBackup(backup)
    setValue('backupId', backup.id)
    if (backup.modules) {
      setSelectedModules(backup.modules)
      setValue('modules', backup.modules)
    }
  }
  
  const handleModuleToggle = (moduleId: string) => {
    const newModules = selectedModules.includes(moduleId)
      ? selectedModules.filter(id => id !== moduleId)
      : [...selectedModules, moduleId]
    
    setSelectedModules(newModules)
    setValue('modules', newModules)
  }
  
  const handleNext = async () => {
    if (currentStep === 'select' && selectedBackup) {
      setCurrentStep('configure')
    } else if (currentStep === 'configure') {
      setCurrentStep('preview')
    } else if (currentStep === 'preview') {
      setCurrentStep('confirm')
    }
  }
  
  const handleBack = () => {
    if (currentStep === 'configure') {
      setCurrentStep('select')
    } else if (currentStep === 'preview') {
      setCurrentStep('configure')
    } else if (currentStep === 'confirm') {
      setCurrentStep('preview')
    }
  }
  
  const handleRestore = async (data: RestoreFormData) => {
    try {
      // Validar dados antes da restauração
      const validation = await validateRestoreData(
        data.backupId,
        data.scope === 'partial' ? { modules: selectedModules } : undefined
      )
      
      if (!validation.isValid) {
        toast.error(`Erro na validação: ${validation.error}`)
        return
      }
      
      if (validation.warnings.length > 0) {
        const proceed = confirm(
          `Avisos encontrados:\n${validation.warnings.join('\n')}\n\nDeseja continuar?`
        )
        if (!proceed) return
      }
      
      const restoreRequest: CreateRestoreRequest = {
        backupId: data.backupId,
        scope: data.scope === 'partial' ? { modules: selectedModules } : undefined,
        options: {
          overwriteExisting: data.overwriteExisting,
          createBackupBeforeRestore: data.createBackupBeforeRestore,
          validateIntegrity: data.validateIntegrity,
        },
      }
      
      const job = await createRestore.mutateAsync(restoreRequest)
      setRestoreJobId(job.id)
      setCurrentStep('progress')
      
      toast.success('Restauração iniciada com sucesso')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar restauração')
    }
  }
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Selecionar Backup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha o backup que deseja restaurar
              </p>
            </div>
            
            {loadingBackups ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando backups...</span>
              </div>
            ) : availableBackups.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum backup disponível para restauração. Apenas backups completos e bem-sucedidos podem ser restaurados.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {availableBackups.map((backup) => (
                  <Card 
                    key={backup.id}
                    className={`cursor-pointer transition-colors ${
                      selectedBackup?.id === backup.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleBackupSelect(backup)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Archive className="h-4 w-4" />
                            <h4 className="font-medium">{backup.name}</h4>
                            <Badge variant="secondary">
                              {backup.type === 'full' ? 'Completo' : 'Diferencial'}
                            </Badge>
                          </div>
                          
                          {backup.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {backup.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(backup.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </div>
                            
                            {backup.size && (
                              <div className="flex items-center gap-1">
                                <HardDrive className="h-3 w-3" />
                                {formatBytes(backup.size)}
                              </div>
                            )}
                            
                            {backup.modules && (
                              <div className="flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                {backup.modules.length} módulos
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedBackup?.id === backup.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
      
      case 'configure':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Configurar Restauração</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure as opções de restauração
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Escopo da Restauração</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="full"
                      value="full"
                      {...register('scope')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="full">Restauração Completa</Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Restaurar todos os dados do backup
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="partial"
                      value="partial"
                      {...register('scope')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="partial">Restauração Parcial</Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Selecionar módulos específicos para restaurar
                  </p>
                </div>
              </div>
              
              {scope === 'partial' && selectedBackup?.modules && (
                <div>
                  <Label className="text-base font-medium">Módulos para Restaurar</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {selectedBackup.modules.map((module) => (
                      <div key={module} className="flex items-center space-x-2">
                        <Checkbox
                          id={module}
                          checked={selectedModules.includes(module)}
                          onCheckedChange={() => handleModuleToggle(module)}
                        />
                        <Label htmlFor={module} className="text-sm">
                          {module}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base font-medium">Opções de Segurança</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createBackupBeforeRestore"
                      {...register('createBackupBeforeRestore')}
                      onCheckedChange={(checked) => setValue('createBackupBeforeRestore', !!checked)}
                    />
                    <Label htmlFor="createBackupBeforeRestore">
                      Criar backup antes da restauração
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Recomendado: cria um backup dos dados atuais antes de restaurar
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="validateIntegrity"
                      {...register('validateIntegrity')}
                      onCheckedChange={(checked) => setValue('validateIntegrity', !!checked)}
                    />
                    <Label htmlFor="validateIntegrity">
                      Validar integridade dos dados
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Verifica a integridade dos dados antes da restauração
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overwriteExisting"
                      {...register('overwriteExisting')}
                      onCheckedChange={(checked) => setValue('overwriteExisting', !!checked)}
                    />
                    <Label htmlFor="overwriteExisting">
                      Sobrescrever dados existentes
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    ⚠️ Cuidado: dados existentes serão substituídos
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Prévia da Restauração</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revise os dados que serão restaurados
              </p>
            </div>
            
            {preview ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">Registros</span>
                      </div>
                      <p className="text-2xl font-bold">{preview.recordCount?.toLocaleString() || 0}</p>
                      <p className="text-sm text-muted-foreground">Total de registros</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="h-4 w-4" />
                        <span className="font-medium">Tamanho</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {preview.estimatedSize ? formatBytes(preview.estimatedSize) : '0 B'}
                      </p>
                      <p className="text-sm text-muted-foreground">Dados a restaurar</p>
                    </CardContent>
                  </Card>
                </div>
                
                {preview.conflictingData && preview.conflictingData.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Conflitos detectados:</strong> {preview.conflictingData.length} registros 
                      serão sobrescritos se você prosseguir com a restauração.
                    </AlertDescription>
                  </Alert>
                )}
                
                {preview.missingDependencies && preview.missingDependencies.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Dependências ausentes:</strong> {preview.missingDependencies.length} 
                      dependências não foram encontradas no sistema atual.
                    </AlertDescription>
                  </Alert>
                )}
                
                {preview.modules && (
                  <div>
                    <Label className="text-base font-medium">Módulos a Restaurar</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {preview.modules.map((module) => (
                        <Badge key={module} variant="outline">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando prévia...</span>
              </div>
            )}
          </div>
        )
      
      case 'confirm':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Confirmar Restauração</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revise todas as configurações antes de prosseguir
              </p>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta operação não pode ser desfeita. 
                {createBackupBeforeRestore 
                  ? 'Um backup dos dados atuais será criado automaticamente.' 
                  : 'Certifique-se de ter um backup dos dados atuais.'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Backup Selecionado</Label>
                <p className="text-sm text-muted-foreground">{selectedBackup?.name}</p>
              </div>
              
              <div>
                <Label className="font-medium">Escopo</Label>
                <p className="text-sm text-muted-foreground">
                  {scope === 'full' ? 'Restauração Completa' : `Restauração Parcial (${selectedModules.length} módulos)`}
                </p>
              </div>
              
              <div>
                <Label className="font-medium">Opções de Segurança</Label>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>✓ Backup antes da restauração: {createBackupBeforeRestore ? 'Sim' : 'Não'}</li>
                  <li>✓ Validar integridade: {watch('validateIntegrity') ? 'Sim' : 'Não'}</li>
                  <li>✓ Sobrescrever existentes: {overwriteExisting ? 'Sim' : 'Não'}</li>
                </ul>
              </div>
            </div>
          </div>
        )
      
      case 'progress':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Restauração em Progresso</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aguarde enquanto os dados são restaurados
              </p>
            </div>
            
            {progress && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Status: {progress.currentStep}</p>
                  {progress.processedRecords && progress.totalRecords && (
                    <p>
                      Registros: {progress.processedRecords.toLocaleString()} / {progress.totalRecords.toLocaleString()}
                    </p>
                  )}
                  {progress.estimatedTimeRemaining && (
                    <p>Tempo restante: {Math.ceil(progress.estimatedTimeRemaining / 60)} minutos</p>
                  )}
                </div>
                
                {progress.status === 'completed' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Restauração concluída com sucesso!
                    </AlertDescription>
                  </Alert>
                )}
                
                {progress.status === 'failed' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Erro na restauração: {progress.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )
      
      default:
        return null
    }
  }
  
  const canProceed = () => {
    switch (currentStep) {
      case 'select':
        return !!selectedBackup
      case 'configure':
        return scope === 'full' || selectedModules.length > 0
      case 'preview':
        return !!preview
      case 'confirm':
        return true
      default:
        return false
    }
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Assistente de Restauração
        </CardTitle>
        <CardDescription>
          Restaure dados de backup de forma segura e controlada
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Indicador de Progresso */}
          <div className="flex items-center justify-between">
            {['select', 'configure', 'preview', 'confirm', 'progress'].map((step, index) => {
              const isActive = currentStep === step
              const isCompleted = ['select', 'configure', 'preview', 'confirm', 'progress'].indexOf(currentStep) > index
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive ? 'bg-primary text-primary-foreground' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Conteúdo do Step */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
          
          {/* Ações */}
          <div className="flex justify-between">
            <div>
              {onCancel && currentStep !== 'progress' && (
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {currentStep !== 'select' && currentStep !== 'progress' && (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              {currentStep !== 'confirm' && currentStep !== 'progress' && (
                <Button 
                  onClick={handleNext} 
                  disabled={!canProceed()}
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              
              {currentStep === 'confirm' && (
                <Button 
                  onClick={handleSubmit(handleRestore)}
                  disabled={createRestore.isPending}
                >
                  {createRestore.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    'Iniciar Restauração'
                  )}
                </Button>
              )}
              
              {currentStep === 'progress' && progress?.status === 'completed' && (
                <Button onClick={onComplete}>
                  Concluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}