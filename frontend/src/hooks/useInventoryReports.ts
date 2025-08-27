import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

// Types
export interface ReportFilter {
  dateRange: {
    start: Date
    end: Date
  }
  departments?: string[]
  categories?: string[]
  suppliers?: string[]
  itemTypes?: ('medication' | 'equipment' | 'supply')[]
  includeExpired?: boolean
  includeDiscontinued?: boolean
  minValue?: number
  maxValue?: number
}

export interface ReportData {
  id: string
  name: string
  type: 'inventory' | 'consumption' | 'expiration' | 'financial' | 'movement' | 'supplier' | 'custom'
  description: string
  generatedAt: Date
  generatedBy: string
  generatedByName: string
  filters: ReportFilter
  data: any
  format: 'table' | 'chart' | 'summary'
  status: 'generating' | 'completed' | 'failed'
  fileUrl?: string
  fileSize?: number
  expiresAt?: Date
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: ReportData['type']
  defaultFilters: Partial<ReportFilter>
  fields: string[]
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  isCustom: boolean
  createdBy?: string
  createdByName?: string
  createdAt: Date
  lastUsed?: Date
  usageCount: number
}

export interface ReportStats {
  totalReports: number
  reportsThisMonth: number
  mostUsedTemplate: string
  averageGenerationTime: number
  totalDataExported: number
  reportsByType: Record<ReportData['type'], number>
  reportsByStatus: Record<ReportData['status'], number>
}

export interface UseInventoryReportsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  maxReports?: number
}

export interface UseInventoryReportsReturn {
  // State
  reports: ReportData[]
  templates: ReportTemplate[]
  loading: boolean
  generating: boolean
  stats: ReportStats
  filters: Partial<ReportFilter>
  currentPage: number
  totalPages: number
  totalItems: number

  // Actions
  loadReports: () => Promise<void>
  loadTemplates: () => Promise<void>
  setFilters: (filters: Partial<ReportFilter>) => void
  clearFilters: () => void
  setCurrentPage: (page: number) => void
  refreshData: () => Promise<void>

  // Report Operations
  generateReport: (templateId: string, filters: ReportFilter, format?: 'pdf' | 'excel' | 'csv') => Promise<string | null>
  getReport: (id: string) => Promise<ReportData | null>
  deleteReport: (id: string) => Promise<boolean>
  downloadReport: (id: string) => Promise<boolean>
  scheduleReport: (templateId: string, filters: ReportFilter, schedule: string) => Promise<boolean>
  cancelScheduledReport: (scheduleId: string) => Promise<boolean>

  // Template Operations
  createTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'usageCount' | 'lastUsed'>) => Promise<string | null>
  updateTemplate: (id: string, updates: Partial<ReportTemplate>) => Promise<boolean>
  deleteTemplate: (id: string) => Promise<boolean>
  duplicateTemplate: (id: string, name: string) => Promise<string | null>

  // Utility Functions
  exportReports: (format: 'csv' | 'excel', reportIds?: string[]) => Promise<boolean>
  importTemplates: (file: File) => Promise<boolean>
  previewReport: (templateId: string, filters: ReportFilter) => Promise<any>

  // Search and Filter Helpers
  searchReports: (query: string) => ReportData[]
  getReportsByType: (type: ReportData['type']) => ReportData[]
  getReportsByTemplate: (templateId: string) => ReportData[]
  getRecentReports: (days?: number) => ReportData[]
  getScheduledReports: () => any[]
}

// Mock Data
const mockTemplates: ReportTemplate[] = [
  {
    id: 'template_1',
    name: 'Relatório de Estoque Atual',
    description: 'Visão geral do estoque atual por categoria e departamento',
    type: 'inventory',
    defaultFilters: {
      includeExpired: false,
      includeDiscontinued: false
    },
    fields: ['itemName', 'category', 'currentStock', 'minLevel', 'maxLevel', 'value'],
    chartType: 'bar',
    isCustom: false,
    createdAt: new Date('2024-01-15'),
    usageCount: 45,
    lastUsed: new Date('2024-01-20')
  },
  {
    id: 'template_2',
    name: 'Análise de Consumo Mensal',
    description: 'Análise detalhada do consumo de itens no último mês',
    type: 'consumption',
    defaultFilters: {
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
      }
    },
    fields: ['itemName', 'consumed', 'averageDaily', 'trend', 'cost'],
    chartType: 'line',
    isCustom: false,
    createdAt: new Date('2024-01-10'),
    usageCount: 32,
    lastUsed: new Date('2024-01-19')
  }
]

const mockReports: ReportData[] = [
  {
    id: 'report_1',
    name: 'Estoque Atual - Janeiro 2024',
    type: 'inventory',
    description: 'Relatório completo do estoque atual',
    generatedAt: new Date('2024-01-20T10:30:00'),
    generatedBy: 'user_1',
    generatedByName: 'Dr. Silva',
    filters: {
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-20')
      },
      departments: ['Farmácia', 'UTI']
    },
    data: {},
    format: 'table',
    status: 'completed',
    fileUrl: '/reports/estoque_atual_jan2024.pdf',
    fileSize: 2048576,
    expiresAt: new Date('2024-02-20')
  }
]

const useInventoryReports = (options: UseInventoryReportsOptions = {}): UseInventoryReportsReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    maxReports = 100
  } = options

  // State
  const [reports, setReports] = useState<ReportData[]>(mockReports)
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [filters, setFiltersState] = useState<Partial<ReportFilter>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Computed values
  const filteredReports = useMemo(() => {
    let filtered = [...reports]

    if (filters.dateRange) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.generatedAt)
        return reportDate >= filters.dateRange!.start && reportDate <= filters.dateRange!.end
      })
    }

    return filtered.sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    )
  }, [reports, filters])

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = useMemo((): ReportStats => {
    const now = new Date()
    const thisMonth = reports.filter(report => {
      const reportDate = new Date(report.generatedAt)
      return reportDate.getMonth() === now.getMonth() && 
             reportDate.getFullYear() === now.getFullYear()
    })

    const templateUsage = templates.reduce((acc, template) => {
      acc[template.name] = template.usageCount
      return acc
    }, {} as Record<string, number>)

    const mostUsedTemplate = Object.entries(templateUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

    return {
      totalReports: reports.length,
      reportsThisMonth: thisMonth.length,
      mostUsedTemplate,
      averageGenerationTime: 2.5, // seconds
      totalDataExported: reports.reduce((sum, report) => sum + (report.fileSize || 0), 0),
      reportsByType: reports.reduce((acc, report) => {
        acc[report.type] = (acc[report.type] || 0) + 1
        return acc
      }, {} as Record<ReportData['type'], number>),
      reportsByStatus: reports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1
        return acc
      }, {} as Record<ReportData['status'], number>)
    }
  }, [reports, templates])

  // Actions
  const loadReports = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In real implementation, fetch from API
      // const data = await reportsService.getReports()
      // setReports(data)
    } catch (err) {
      toast.error('Erro ao carregar relatórios')
      console.error('Error loading reports:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTemplates = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      // In real implementation, fetch from API
      // const data = await reportsService.getTemplates()
      // setTemplates(data)
    } catch (err) {
      toast.error('Erro ao carregar templates')
      console.error('Error loading templates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const setFilters = useCallback((newFilters: Partial<ReportFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
    setCurrentPage(1)
  }, [])

  const refreshData = useCallback(async (): Promise<void> => {
    await Promise.all([loadReports(), loadTemplates()])
  }, [loadReports, loadTemplates])

  // Report Operations
  const generateReport = useCallback(async (
    templateId: string, 
    reportFilters: ReportFilter, 
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<string | null> => {
    try {
      setGenerating(true)
      
      const template = templates.find(t => t.id === templateId)
      if (!template) {
        toast.error('Template não encontrado')
        return null
      }

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000))

      const newReport: ReportData = {
        id: `report_${Date.now()}`,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        type: template.type,
        description: template.description,
        generatedAt: new Date(),
        generatedBy: 'current-user',
        generatedByName: 'Current User',
        filters: reportFilters,
        data: {}, // Would contain actual report data
        format: 'table',
        status: 'completed',
        fileUrl: `/reports/${template.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${format}`,
        fileSize: Math.floor(Math.random() * 5000000) + 500000, // Random size between 500KB and 5MB
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }

      setReports(prev => [newReport, ...prev.slice(0, maxReports - 1)])
      
      // Update template usage
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date() }
          : t
      ))

      toast.success('Relatório gerado com sucesso')
      return newReport.id
    } catch (err) {
      toast.error('Erro ao gerar relatório')
      console.error('Error generating report:', err)
      return null
    } finally {
      setGenerating(false)
    }
  }, [templates, maxReports])

  const getReport = useCallback(async (id: string): Promise<ReportData | null> => {
    try {
      const report = reports.find(r => r.id === id)
      if (!report) {
        toast.error('Relatório não encontrado')
        return null
      }
      return report
    } catch (err) {
      toast.error('Erro ao buscar relatório')
      console.error('Error getting report:', err)
      return null
    }
  }, [reports])

  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    try {
      setReports(prev => prev.filter(report => report.id !== id))
      toast.success('Relatório removido')
      return true
    } catch (err) {
      toast.error('Erro ao remover relatório')
      console.error('Error deleting report:', err)
      return false
    }
  }, [])

  const downloadReport = useCallback(async (id: string): Promise<boolean> => {
    try {
      const report = reports.find(r => r.id === id)
      if (!report || !report.fileUrl) {
        toast.error('Arquivo não encontrado')
        return false
      }

      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real implementation, trigger file download
      // window.open(report.fileUrl, '_blank')
      
      toast.success('Download iniciado')
      return true
    } catch (err) {
      toast.error('Erro no download')
      console.error('Error downloading report:', err)
      return false
    }
  }, [reports])

  const scheduleReport = useCallback(async (
    templateId: string, 
    reportFilters: ReportFilter, 
    schedule: string
  ): Promise<boolean> => {
    try {
      // Simulate scheduling
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Relatório agendado com sucesso')
      return true
    } catch (err) {
      toast.error('Erro ao agendar relatório')
      console.error('Error scheduling report:', err)
      return false
    }
  }, [])

  const cancelScheduledReport = useCallback(async (scheduleId: string): Promise<boolean> => {
    try {
      // Simulate cancellation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success('Agendamento cancelado')
      return true
    } catch (err) {
      toast.error('Erro ao cancelar agendamento')
      console.error('Error canceling scheduled report:', err)
      return false
    }
  }, [])

  // Template Operations
  const createTemplate = useCallback(async (
    template: Omit<ReportTemplate, 'id' | 'createdAt' | 'usageCount' | 'lastUsed'>
  ): Promise<string | null> => {
    try {
      const newTemplate: ReportTemplate = {
        ...template,
        id: `template_${Date.now()}`,
        createdAt: new Date(),
        usageCount: 0
      }

      setTemplates(prev => [...prev, newTemplate])
      toast.success('Template criado com sucesso')
      return newTemplate.id
    } catch (err) {
      toast.error('Erro ao criar template')
      console.error('Error creating template:', err)
      return null
    }
  }, [])

  const updateTemplate = useCallback(async (id: string, updates: Partial<ReportTemplate>): Promise<boolean> => {
    try {
      setTemplates(prev => prev.map(template => 
        template.id === id 
          ? { ...template, ...updates }
          : template
      ))
      
      toast.success('Template atualizado')
      return true
    } catch (err) {
      toast.error('Erro ao atualizar template')
      console.error('Error updating template:', err)
      return false
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const template = templates.find(t => t.id === id)
      if (template && !template.isCustom) {
        toast.error('Não é possível remover templates padrão')
        return false
      }

      setTemplates(prev => prev.filter(template => template.id !== id))
      toast.success('Template removido')
      return true
    } catch (err) {
      toast.error('Erro ao remover template')
      console.error('Error deleting template:', err)
      return false
    }
  }, [templates])

  const duplicateTemplate = useCallback(async (id: string, name: string): Promise<string | null> => {
    try {
      const originalTemplate = templates.find(t => t.id === id)
      if (!originalTemplate) {
        toast.error('Template não encontrado')
        return null
      }

      const newTemplate: ReportTemplate = {
        ...originalTemplate,
        id: `template_${Date.now()}`,
        name,
        isCustom: true,
        createdAt: new Date(),
        usageCount: 0,
        lastUsed: undefined,
        createdBy: 'current-user',
        createdByName: 'Current User'
      }

      setTemplates(prev => [...prev, newTemplate])
      toast.success('Template duplicado com sucesso')
      return newTemplate.id
    } catch (err) {
      toast.error('Erro ao duplicar template')
      console.error('Error duplicating template:', err)
      return null
    }
  }, [templates])

  // Utility Functions
  const exportReports = useCallback(async (format: 'csv' | 'excel', reportIds?: string[]): Promise<boolean> => {
    try {
      const reportsToExport = reportIds 
        ? reports.filter(report => reportIds.includes(report.id))
        : filteredReports
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const filename = `relatorios_${new Date().toISOString().split('T')[0]}.${format}`
      toast.success(`Dados exportados: ${filename}`)
      return true
    } catch (err) {
      toast.error('Erro ao exportar dados')
      console.error('Error exporting reports:', err)
      return false
    }
  }, [reports, filteredReports])

  const importTemplates = useCallback(async (file: File): Promise<boolean> => {
    try {
      // Simulate import
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Templates importados com sucesso')
      await loadTemplates() // Reload templates
      return true
    } catch (err) {
      toast.error('Erro ao importar templates')
      console.error('Error importing templates:', err)
      return false
    }
  }, [loadTemplates])

  const previewReport = useCallback(async (templateId: string, reportFilters: ReportFilter): Promise<any> => {
    try {
      // Simulate preview generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Return mock preview data
      return {
        columns: ['Item', 'Categoria', 'Estoque', 'Valor'],
        rows: [
          ['Paracetamol 500mg', 'Medicamentos', '150', 'R$ 75,00'],
          ['Seringa 10ml', 'Suprimentos', '200', 'R$ 100,00']
        ],
        summary: {
          totalItems: 2,
          totalValue: 175
        }
      }
    } catch (err) {
      toast.error('Erro ao gerar preview')
      console.error('Error generating preview:', err)
      return null
    }
  }, [])

  // Search and Filter Helpers
  const searchReports = useCallback((query: string) => {
    return reports.filter(report => 
      report.name.toLowerCase().includes(query.toLowerCase()) ||
      report.description.toLowerCase().includes(query.toLowerCase()) ||
      report.generatedByName.toLowerCase().includes(query.toLowerCase())
    )
  }, [reports])

  const getReportsByType = useCallback((type: ReportData['type']) => {
    return reports.filter(report => report.type === type)
  }, [reports])

  const getReportsByTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return []
    
    return reports.filter(report => report.type === template.type)
  }, [reports, templates])

  const getRecentReports = useCallback((days: number = 7) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return reports.filter(report => new Date(report.generatedAt) >= cutoffDate)
  }, [reports])

  const getScheduledReports = useCallback(() => {
    // Mock scheduled reports
    return [
      {
        id: 'schedule_1',
        templateId: 'template_1',
        templateName: 'Relatório de Estoque Atual',
        schedule: 'weekly',
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ]
  }, [])

  return {
    // State
    reports: paginatedReports,
    templates,
    loading,
    generating,
    stats,
    filters,
    currentPage,
    totalPages,
    totalItems: filteredReports.length,

    // Actions
    loadReports,
    loadTemplates,
    setFilters,
    clearFilters,
    setCurrentPage,
    refreshData,

    // Report Operations
    generateReport,
    getReport,
    deleteReport,
    downloadReport,
    scheduleReport,
    cancelScheduledReport,

    // Template Operations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,

    // Utility Functions
    exportReports,
    importTemplates,
    previewReport,

    // Search and Filter Helpers
    searchReports,
    getReportsByType,
    getReportsByTemplate,
    getRecentReports,
    getScheduledReports
  }
}

export default useInventoryReports