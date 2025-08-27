'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Save,
  RotateCcw,
  Upload,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos de campo suportados
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'switch' 
  | 'checkbox' 
  | 'radio' 
  | 'slider' 
  | 'file' 
  | 'color' 
  | 'date' 
  | 'time' 
  | 'datetime-local'
  | 'url'
  | 'tel'
  | 'range';

// Opção para campos select, radio, etc.
export interface FieldOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

// Configuração de validação
export interface FieldValidation {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: RegExp | string;
  custom?: (value: any) => boolean | string;
}

// Configuração de campo
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: FieldValidation;
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  sensitive?: boolean; // Para campos de senha/token
  copyable?: boolean; // Permite copiar valor
  testable?: boolean; // Permite testar (ex: conexão)
  refreshable?: boolean; // Permite atualizar (ex: tokens)
  group?: string; // Agrupamento de campos
  conditional?: {
    field: string;
    value: any;
    operator?: 'equals' | 'not-equals' | 'contains' | 'greater' | 'less';
  };
  // Configurações específicas por tipo
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  accept?: string; // Para file input
  rows?: number; // Para textarea
  cols?: number; // Para textarea
  format?: string; // Para formatação de valores
  unit?: string; // Unidade de medida
  prefix?: string;
  suffix?: string;
  // Callbacks
  onChange?: (value: any, allValues: FieldValues) => void;
  onTest?: (value: any) => Promise<boolean | string>;
  onRefresh?: () => Promise<any>;
  onCopy?: (value: any) => void;
}

// Configuração de seção
export interface SectionConfig {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  fields: FieldConfig[];
}

// Configuração do formulário
export interface FormConfig {
  title?: string;
  description?: string;
  sections: SectionConfig[];
  schema?: z.ZodSchema;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
  showImportExport?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number; // ms
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// Props do componente
export interface SettingsFormProps<T extends FieldValues = FieldValues> {
  config: FormConfig;
  initialValues?: Partial<T>;
  onSubmit: (values: T) => Promise<void> | void;
  onReset?: () => void;
  onImport?: (data: any) => void;
  onExport?: () => any;
  onAutoSave?: (values: T) => void;
  isLoading?: boolean;
  isDirty?: boolean;
  errors?: Record<string, string>;
  className?: string;
}

// Estado de campo
interface FieldState {
  showPassword: boolean;
  isTesting: boolean;
  isRefreshing: boolean;
  testResult?: boolean | string;
}

const defaultFieldStates: Record<string, FieldState> = {};

export function SettingsForm<T extends FieldValues = FieldValues>({
  config,
  initialValues = {},
  onSubmit,
  onReset,
  onImport,
  onExport,
  onAutoSave,
  isLoading = false,
  isDirty = false,
  errors = {},
  className = ''
}: SettingsFormProps<T>) {
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>(defaultFieldStates);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [autoSaveProgress, setAutoSaveProgress] = useState(0);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Configurar formulário
  const form = useForm<T>({
    resolver: config.schema ? zodResolver(config.schema) : undefined,
    defaultValues: initialValues as any,
    mode: config.validateOnChange ? 'onChange' : config.validateOnBlur ? 'onBlur' : 'onSubmit'
  });

  const { control, handleSubmit, reset, watch, setValue, getValues, formState: { errors: formErrors, isValid } } = form;
  const watchedValues = watch();

  // Auto-save
  useEffect(() => {
    if (!config.autoSave || !onAutoSave || !isDirty) return;

    const delay = config.autoSaveDelay || 2000;
    const timer = setTimeout(() => {
      onAutoSave(getValues());
      setLastAutoSave(new Date());
      setAutoSaveProgress(100);
      
      // Reset progress after animation
      setTimeout(() => setAutoSaveProgress(0), 1000);
    }, delay);

    // Show progress
    const progressTimer = setInterval(() => {
      setAutoSaveProgress(prev => Math.min(prev + 2, 95));
    }, delay / 50);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [watchedValues, config.autoSave, config.autoSaveDelay, onAutoSave, isDirty]);

  // Gerenciar estado de campo
  const getFieldState = (fieldName: string): FieldState => {
    return fieldStates[fieldName] || {
      showPassword: false,
      isTesting: false,
      isRefreshing: false
    };
  };

  const updateFieldState = (fieldName: string, updates: Partial<FieldState>) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: { ...getFieldState(fieldName), ...updates }
    }));
  };

  // Verificar se campo deve ser exibido
  const shouldShowField = (field: FieldConfig): boolean => {
    if (field.hidden) return false;
    
    if (field.conditional) {
      const { field: condField, value: condValue, operator = 'equals' } = field.conditional;
      const currentValue = watchedValues[condField];
      
      switch (operator) {
        case 'equals':
          return currentValue === condValue;
        case 'not-equals':
          return currentValue !== condValue;
        case 'contains':
          return Array.isArray(currentValue) ? currentValue.includes(condValue) : false;
        case 'greater':
          return currentValue > condValue;
        case 'less':
          return currentValue < condValue;
        default:
          return true;
      }
    }
    
    return true;
  };

  // Copiar valor para clipboard
  const copyToClipboard = async (value: any, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success('Copiado para a área de transferência');
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  // Testar campo
  const testField = async (field: FieldConfig, value: any) => {
    if (!field.onTest) return;
    
    updateFieldState(field.name, { isTesting: true, testResult: undefined });
    
    try {
      const result = await field.onTest(value);
      updateFieldState(field.name, { isTesting: false, testResult: result });
      
      if (result === true) {
        toast.success('Teste realizado com sucesso');
      } else if (typeof result === 'string') {
        toast.error(result);
      } else {
        toast.error('Teste falhou');
      }
    } catch (error) {
      updateFieldState(field.name, { isTesting: false, testResult: false });
      toast.error('Erro ao executar teste');
    }
  };

  // Atualizar campo
  const refreshField = async (field: FieldConfig) => {
    if (!field.onRefresh) return;
    
    updateFieldState(field.name, { isRefreshing: true });
    
    try {
      const newValue = await field.onRefresh();
      setValue(field.name as Path<T>, newValue as PathValue<T, Path<T>>);
      updateFieldState(field.name, { isRefreshing: false });
      toast.success('Campo atualizado');
    } catch (error) {
      updateFieldState(field.name, { isRefreshing: false });
      toast.error('Erro ao atualizar campo');
    }
  };

  // Renderizar campo
  const renderField = (field: FieldConfig) => {
    if (!shouldShowField(field)) return null;
    
    const fieldState = getFieldState(field.name);
    const error = formErrors[field.name as keyof typeof formErrors] || errors[field.name];
    const hasError = !!error;
    
    return (
      <Controller
        key={field.name}
        name={field.name as Path<T>}
        control={control}
        render={({ field: formField }) => {
          const commonProps = {
            disabled: field.disabled || isLoading,
            readOnly: field.readonly,
            placeholder: field.placeholder,
            className: hasError ? 'border-red-500' : ''
          };

          let fieldElement: React.ReactNode;

          switch (field.type) {
            case 'text':
            case 'email':
            case 'url':
            case 'tel':
              fieldElement = (
                <Input
                  {...formField}
                  {...commonProps}
                  type={field.type}
                  prefix={field.prefix}
                  suffix={field.suffix}
                />
              );
              break;

            case 'password':
              fieldElement = (
                <div className="relative">
                  <Input
                    {...formField}
                    {...commonProps}
                    type={fieldState.showPassword ? 'text' : 'password'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => updateFieldState(field.name, { showPassword: !fieldState.showPassword })}
                  >
                    {fieldState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              );
              break;

            case 'number':
            case 'range':
              fieldElement = (
                <Input
                  {...formField}
                  {...commonProps}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                />
              );
              break;

            case 'textarea':
              fieldElement = (
                <Textarea
                  {...formField}
                  {...commonProps}
                  rows={field.rows || 3}
                  cols={field.cols}
                />
              );
              break;

            case 'select':
              fieldElement = (
                <Select
                  value={formField.value}
                  onValueChange={formField.onChange}
                  disabled={commonProps.disabled}
                >
                  <SelectTrigger className={commonProps.className}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem
                        key={String(option.value)}
                        value={String(option.value)}
                        disabled={option.disabled}
                      >
                        <div className="flex items-center gap-2">
                          {option.icon && <option.icon className="h-4 w-4" />}
                          <div>
                            <div>{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
              break;

            case 'multiselect':
              fieldElement = (
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={String(option.value)} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.name}-${option.value}`}
                        checked={Array.isArray(formField.value) && formField.value.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(formField.value) ? formField.value : [];
                          if (checked) {
                            formField.onChange([...currentValues, option.value]);
                          } else {
                            formField.onChange(currentValues.filter((v: any) => v !== option.value));
                          }
                        }}
                        disabled={option.disabled || commonProps.disabled}
                      />
                      <Label htmlFor={`${field.name}-${option.value}`} className="flex items-center gap-2">
                        {option.icon && <option.icon className="h-4 w-4" />}
                        <div>
                          <div>{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              );
              break;

            case 'switch':
              fieldElement = (
                <Switch
                  checked={formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={commonProps.disabled}
                />
              );
              break;

            case 'checkbox':
              fieldElement = (
                <Checkbox
                  checked={formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={commonProps.disabled}
                />
              );
              break;

            case 'radio':
              fieldElement = (
                <RadioGroup
                  value={formField.value}
                  onValueChange={formField.onChange}
                  disabled={commonProps.disabled}
                >
                  {field.options?.map((option) => (
                    <div key={String(option.value)} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={String(option.value)}
                        id={`${field.name}-${option.value}`}
                        disabled={option.disabled}
                      />
                      <Label htmlFor={`${field.name}-${option.value}`} className="flex items-center gap-2">
                        {option.icon && <option.icon className="h-4 w-4" />}
                        <div>
                          <div>{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              );
              break;

            case 'slider':
              fieldElement = (
                <div className="space-y-2">
                  <Slider
                    value={[formField.value || field.min || 0]}
                    onValueChange={([value]) => formField.onChange(value)}
                    min={field.min || 0}
                    max={field.max || 100}
                    step={field.step || 1}
                    disabled={commonProps.disabled}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{field.min || 0}{field.unit}</span>
                    <span className="font-medium">{formField.value}{field.unit}</span>
                    <span>{field.max || 100}{field.unit}</span>
                  </div>
                </div>
              );
              break;

            case 'file':
              fieldElement = (
                <Input
                  type="file"
                  accept={field.accept}
                  multiple={field.multiple}
                  onChange={(e) => {
                    const files = e.target.files;
                    formField.onChange(field.multiple ? Array.from(files || []) : files?.[0] || null);
                  }}
                  disabled={commonProps.disabled}
                  className={commonProps.className}
                />
              );
              break;

            case 'color':
              fieldElement = (
                <div className="flex items-center gap-2">
                  <Input
                    {...formField}
                    {...commonProps}
                    type="color"
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formField.value}
                    onChange={formField.onChange}
                    placeholder="#000000"
                    className="flex-1"
                    disabled={commonProps.disabled}
                  />
                </div>
              );
              break;

            case 'date':
            case 'time':
            case 'datetime-local':
              fieldElement = (
                <Input
                  {...formField}
                  {...commonProps}
                  type={field.type}
                />
              );
              break;

            default:
              fieldElement = (
                <Input
                  {...formField}
                  {...commonProps}
                  type="text"
                />
              );
          }

          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="flex items-center gap-1">
                  {field.copyable && formField.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(formField.value, field.name)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                  {field.testable && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => testField(field, formField.value)}
                      disabled={fieldState.isTesting || commonProps.disabled}
                    >
                      {fieldState.isTesting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  {field.refreshable && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => refreshField(field)}
                      disabled={fieldState.isRefreshing || commonProps.disabled}
                    >
                      {fieldState.isRefreshing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {fieldElement}
              
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              
              {field.unit && !['slider'].includes(field.type) && (
                <p className="text-xs text-muted-foreground">Unidade: {field.unit}</p>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {typeof error === 'string' ? error : error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {fieldState.testResult !== undefined && (
                <Alert variant={fieldState.testResult === true ? 'default' : 'destructive'}>
                  {fieldState.testResult === true ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {fieldState.testResult === true 
                      ? 'Teste realizado com sucesso' 
                      : typeof fieldState.testResult === 'string' 
                        ? fieldState.testResult 
                        : 'Teste falhou'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          );
        }}
      />
    );
  };

  // Renderizar seção
  const renderSection = (section: SectionConfig, index: number) => {
    const sectionKey = `section-${index}`;
    const isCollapsed = collapsedSections[sectionKey] ?? section.defaultCollapsed ?? false;
    const visibleFields = section.fields.filter(shouldShowField);
    
    if (visibleFields.length === 0) return null;
    
    // Agrupar campos
    const groupedFields = visibleFields.reduce((groups, field) => {
      const group = field.group || 'default';
      if (!groups[group]) groups[group] = [];
      groups[group].push(field);
      return groups;
    }, {} as Record<string, FieldConfig[]>);

    return (
      <Card key={sectionKey}>
        <CardHeader className={section.collapsible ? 'cursor-pointer' : ''} 
                   onClick={section.collapsible ? () => setCollapsedSections(prev => ({ ...prev, [sectionKey]: !isCollapsed })) : undefined}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {section.icon && <section.icon className="h-5 w-5" />}
              <div>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </div>
            </div>
            {section.collapsible && (
              <Button variant="ghost" size="sm">
                {isCollapsed ? '▼' : '▲'}
              </Button>
            )}
          </div>
        </CardHeader>
        
        {!isCollapsed && (
          <CardContent className="space-y-6">
            {Object.entries(groupedFields).map(([groupName, fields]) => (
              <div key={groupName}>
                {groupName !== 'default' && (
                  <>
                    <h4 className="text-sm font-medium mb-3">{groupName}</h4>
                    <Separator className="mb-4" />
                  </>
                )}
                <div className="grid gap-4">
                  {fields.map(renderField)}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    );
  };

  // Importar configurações
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (onImport) {
            onImport(data);
          } else {
            // Aplicar valores diretamente
            Object.entries(data).forEach(([key, value]) => {
              setValue(key as Path<T>, value as PathValue<T, Path<T>>);
            });
          }
          toast.success('Configurações importadas com sucesso');
        } catch (error) {
          toast.error('Erro ao importar configurações');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Exportar configurações
  const handleExport = () => {
    try {
      const data = onExport ? onExport() : getValues();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title?.toLowerCase().replace(/\s+/g, '-') || 'settings'}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Configurações exportadas com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar configurações');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(config.title || config.description) && (
        <div className="space-y-2">
          {config.title && (
            <h2 className="text-2xl font-bold">{config.title}</h2>
          )}
          {config.description && (
            <p className="text-muted-foreground">{config.description}</p>
          )}
        </div>
      )}

      {/* Auto-save indicator */}
      {config.autoSave && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Salvamento automático</span>
            {lastAutoSave && (
              <span className="text-xs text-muted-foreground">
                Último salvamento: {lastAutoSave.toLocaleTimeString()}
              </span>
            )}
          </div>
          {autoSaveProgress > 0 && (
            <Progress value={autoSaveProgress} className="h-1" />
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sections */}
        {config.sections.map(renderSection)}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-2">
            {config.showImportExport && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImport}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExport}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {config.showReset !== false && onReset && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  onReset();
                }}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {config.resetText || 'Restaurar Padrões'}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !isValid || (!config.autoSave && !isDirty)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {config.submitText || 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export type {
  FieldType,
  FieldOption,
  FieldValidation,
  FieldConfig,
  SectionConfig,
  FormConfig,
  SettingsFormProps
};