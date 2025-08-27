'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Calendar as CalendarIcon,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react'
import { AuditFilters, AuditExportRequest, AuditExportResult } from '@/types/audit'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AuditExportProps {
  filters?: AuditFilters
  onExport?: (request: AuditExportRequest) => Promise<AuditExportResult>
  className?: string
}

type ExportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON'
type ExportStatus = 'idle' | 'preparing' | 'exporting' | 'completed' | 'error'

interface ExportJob {
  id: string
  format: ExportFormat
  status: ExportStatus
  progress: number
  fileName?: string
  downloadUrl?: string
  error?: string
  createdAt: Date
  completedAt?: Date
}

function AuditExport({ filters, onExport, className }: AuditExportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF')
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeUserDetails, setIncludeUserDetails] = useState(true)
  const [includeSystemInfo, setIncludeSystemInfo] = useState(false)
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'PDF':
        return <FileText className="h-4 w-4" />
      case 'EXCEL':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'CSV':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'JSON':
        return <File className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getFormatDescription = (format: ExportFormat) => {
    switch (format) {
      case 'PDF':
        return 'Relatório formatado para impressão e visualização'
      case 'EXCEL':
        return 'Planilha com dados estruturados para análise'
      case 'CSV':
        return 'Dados tabulares compatíveis com qualquer sistema'
      case 'JSON':
        return 'Dados estruturados para integração com sistemas'
      default:
        return 'Formato de exportação'
    }
  }

  const getStatusColor = (status: ExportStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'preparing':
      case 'exporting':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: ExportStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'preparing':
      case 'exporting':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const generateFileName = () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
    const extension = exportFormat.toLowerCase()
    return `auditoria_${timestamp}.${extension}`
  }

  const handleExport = async () => {
    if (!fileName) {
      setFileName(generateFileName())
    }

    const exportRequest: AuditExportRequest = {
      format: exportFormat,
      fileName: fileName || generateFileName(),
      description,
      filters: {
        ...filters,
        startDate: dateRange.from,
        endDate: dateRange.to,
      },
      options: {
        includeMetadata,
        includeUserDetails,
        includeSystemInfo,
      },
    }

    const jobId = `export_${Date.now()}`
    const newJob: ExportJob = {
      id: jobId,
      format: exportFormat,
      status: 'preparing',
      progress: 0,
      fileName: exportRequest.fileName,
      createdAt: new Date(),
    }

    setExportJobs(prev => [newJob, ...prev])
    setIsDialogOpen(false)

    try {
      // Simular progresso
      const updateProgress = (progress: number, status: ExportStatus) => {
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, progress, status } : job
        ))
      }

      updateProgress(25, 'preparing')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateProgress(50, 'exporting')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      updateProgress(75, 'exporting')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simular resultado da exportação
      const result: AuditExportResult = {
        success: true,
        fileName: exportRequest.fileName,
        downloadUrl: `#download_${jobId}`,
        fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
        recordCount: Math.floor(Math.random() * 10000) + 100,
        generatedAt: new Date(),
      }

      if (onExport) {
        const customResult = await onExport(exportRequest)
        Object.assign(result, customResult)
      }

      updateProgress(100, 'completed')
      setExportJobs(prev => prev.map(job => 
        job.id === jobId ? { 
          ...job, 
          status: 'completed',
          progress: 100,
          downloadUrl: result.downloadUrl,
          completedAt: new Date()
        } : job
      ))

      toast.success('Exportação concluída com sucesso!')
    } catch (error) {
      setExportJobs(prev => prev.map(job => 
        job.id === jobId ? { 
          ...job, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        } : job
      ))
      toast.error('Erro ao exportar dados')
    }
  }

  const handleDownload = (job: ExportJob) => {
    if (job.downloadUrl && job.status === 'completed') {
      // Simular download
      const link = document.createElement('a')
      link.href = job.downloadUrl
      link.download = job.fileName || 'export'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download iniciado!')
    }
  }

  const removeJob = (jobId: string) => {
    setExportJobs(prev => prev.filter(job => job.id !== jobId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Botão de Exportação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exportar Dados de Auditoria</DialogTitle>
            <DialogDescription>
              Configure as opções de exportação para gerar o relatório
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Formato */}
            <div className="space-y-2">
              <Label>Formato de Exportação</Label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <div className="font-medium">PDF</div>
                        <div className="text-xs text-gray-500">Relatório formatado</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="EXCEL">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Excel</div>
                        <div className="text-xs text-gray-500">Planilha estruturada</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="CSV">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <div>
                        <div className="font-medium">CSV</div>
                        <div className="text-xs text-gray-500">Dados tabulares</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="JSON">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <div>
                        <div className="font-medium">JSON</div>
                        <div className="text-xs text-gray-500">Dados estruturados</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{getFormatDescription(exportFormat)}</p>
            </div>

            {/* Nome do Arquivo */}
            <div className="space-y-2">
              <Label htmlFor="fileName">Nome do Arquivo</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={generateFileName()}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito desta exportação..."
                rows={3}
              />
            </div>

            {/* Período */}
            <div className="space-y-2">
              <Label>Período (Opcional)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR }) : 'Data inicial'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR }) : 'Data final'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Opções */}
            <div className="space-y-3">
              <Label>Opções de Exportação</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={includeMetadata}
                    onCheckedChange={setIncludeMetadata}
                  />
                  <Label htmlFor="includeMetadata" className="text-sm">
                    Incluir metadados dos eventos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeUserDetails"
                    checked={includeUserDetails}
                    onCheckedChange={setIncludeUserDetails}
                  />
                  <Label htmlFor="includeUserDetails" className="text-sm">
                    Incluir detalhes dos usuários
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSystemInfo"
                    checked={includeSystemInfo}
                    onCheckedChange={setIncludeSystemInfo}
                  />
                  <Label htmlFor="includeSystemInfo" className="text-sm">
                    Incluir informações do sistema
                  </Label>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de Exportações */}
      {exportJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Exportações
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso das suas exportações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(job.format)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{job.fileName}</p>
                        <Badge className={getStatusColor(job.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            <span className="capitalize">
                              {job.status === 'preparing' ? 'Preparando' :
                               job.status === 'exporting' ? 'Exportando' :
                               job.status === 'completed' ? 'Concluído' :
                               job.status === 'error' ? 'Erro' : job.status}
                            </span>
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{job.format}</span>
                        <span>{format(job.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                        {job.completedAt && (
                          <span>Concluído em {format(job.completedAt, 'HH:mm', { locale: ptBR })}</span>
                        )}
                      </div>
                      {job.status === 'error' && job.error && (
                        <p className="text-xs text-red-600 mt-1">{job.error}</p>
                      )}
                    </div>
                  </div>

                  {/* Progresso */}
                  {(job.status === 'preparing' || job.status === 'exporting') && (
                    <div className="flex-1 max-w-32">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-center mt-1">{job.progress}%</p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && (
                      <Button
                        onClick={() => handleDownload(job)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => removeJob(job.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AuditExport