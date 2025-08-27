import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settingsService'
import { Settings, SettingsUpdate } from '@/types/settings'
import { toast } from 'sonner'

const SETTINGS_QUERY_KEY = ['settings']

export function useSettings() {
  const queryClient = useQueryClient()

  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: settingsService.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (data: SettingsUpdate) => settingsService.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, updatedSettings)
      toast.success('Configurações atualizadas com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar configurações')
    },
  })

  const resetSettingsMutation = useMutation({
    mutationFn: () => settingsService.resetSettings(),
    onSuccess: (defaultSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, defaultSettings)
      toast.success('Configurações restauradas para o padrão!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao restaurar configurações')
    },
  })

  const exportSettingsMutation = useMutation({
    mutationFn: () => settingsService.exportSettings(),
    onSuccess: (exportData) => {
      // Criar e baixar arquivo JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `configuracoes-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Configurações exportadas com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao exportar configurações')
    },
  })

  const importSettingsMutation = useMutation({
    mutationFn: (file: File) => {
      return new Promise<SettingsUpdate>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target?.result as string)
            resolve(importData)
          } catch (error) {
            reject(new Error('Arquivo inválido'))
          }
        }
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
        reader.readAsText(file)
      }).then(data => settingsService.importSettings(data))
    },
    onSuccess: (importedSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, importedSettings)
      toast.success('Configurações importadas com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao importar configurações')
    },
  })

  const validateSettingsMutation = useMutation({
    mutationFn: (data: SettingsUpdate) => settingsService.validateSettings(data),
    onError: (error: any) => {
      toast.error(error.message || 'Configurações inválidas')
    },
  })

  return {
    // Data
    settings,
    isLoading,
    error,
    
    // Actions
    updateSettings: updateSettingsMutation.mutate,
    resetSettings: resetSettingsMutation.mutate,
    exportSettings: exportSettingsMutation.mutate,
    importSettings: importSettingsMutation.mutate,
    validateSettings: validateSettingsMutation.mutate,
    refetch,
    
    // Loading states
    isUpdating: updateSettingsMutation.isPending,
    isResetting: resetSettingsMutation.isPending,
    isExporting: exportSettingsMutation.isPending,
    isImporting: importSettingsMutation.isPending,
    isValidating: validateSettingsMutation.isPending,
    
    // Error states
    updateError: updateSettingsMutation.error,
    resetError: resetSettingsMutation.error,
    exportError: exportSettingsMutation.error,
    importError: importSettingsMutation.error,
    validateError: validateSettingsMutation.error,
  }
}

export type UseSettingsReturn = ReturnType<typeof useSettings>