import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { preferencesService } from '@/services/preferencesService'
import { SystemPreferences, PreferencesUpdate, ThemeSettings, LocaleSettings } from '@/types/preferences'
import { toast } from 'sonner'

const PREFERENCES_QUERY_KEY = ['system-preferences']
const THEME_QUERY_KEY = ['theme-settings']
const LOCALE_QUERY_KEY = ['locale-settings']

export function useSystemPreferences() {
  const queryClient = useQueryClient()

  // Preferências do sistema
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
    error: preferencesError,
    refetch: refetchPreferences
  } = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: preferencesService.getPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })

  // Configurações de tema
  const {
    data: themeSettings,
    isLoading: isLoadingTheme,
    error: themeError
  } = useQuery({
    queryKey: THEME_QUERY_KEY,
    queryFn: preferencesService.getThemeSettings,
    staleTime: 10 * 60 * 1000,
  })

  // Configurações de localização
  const {
    data: localeSettings,
    isLoading: isLoadingLocale,
    error: localeError
  } = useQuery({
    queryKey: LOCALE_QUERY_KEY,
    queryFn: preferencesService.getLocaleSettings,
    staleTime: 30 * 60 * 1000, // 30 minutos
  })

  // Atualizar preferências
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: PreferencesUpdate) => preferencesService.updatePreferences(data),
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, updatedPreferences)
      toast.success('Preferências atualizadas com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar preferências')
    },
  })

  // Atualizar tema
  const updateThemeMutation = useMutation({
    mutationFn: (theme: Partial<ThemeSettings>) => preferencesService.updateTheme(theme),
    onSuccess: (updatedTheme) => {
      queryClient.setQueryData(THEME_QUERY_KEY, updatedTheme)
      // Aplicar tema imediatamente
      document.documentElement.setAttribute('data-theme', updatedTheme.mode)
      if (updatedTheme.colorScheme) {
        document.documentElement.style.setProperty('--color-scheme', updatedTheme.colorScheme)
      }
      toast.success('Tema atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar tema')
    },
  })

  // Atualizar localização
  const updateLocaleMutation = useMutation({
    mutationFn: (locale: Partial<LocaleSettings>) => preferencesService.updateLocale(locale),
    onSuccess: (updatedLocale) => {
      queryClient.setQueryData(LOCALE_QUERY_KEY, updatedLocale)
      // Aplicar configurações de localização
      if (updatedLocale.language) {
        document.documentElement.lang = updatedLocale.language
      }
      toast.success('Configurações de idioma atualizadas!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar configurações de idioma')
    },
  })

  // Resetar preferências
  const resetPreferencesMutation = useMutation({
    mutationFn: () => preferencesService.resetPreferences(),
    onSuccess: (defaultPreferences) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, defaultPreferences)
      queryClient.invalidateQueries({ queryKey: THEME_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: LOCALE_QUERY_KEY })
      toast.success('Preferências restauradas para o padrão!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao restaurar preferências')
    },
  })

  // Exportar preferências
  const exportPreferencesMutation = useMutation({
    mutationFn: () => preferencesService.exportPreferences(),
    onSuccess: (exportData) => {
      // Criar e baixar arquivo JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `preferencias-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Preferências exportadas com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao exportar preferências')
    },
  })

  // Importar preferências
  const importPreferencesMutation = useMutation({
    mutationFn: (file: File) => {
      return new Promise<PreferencesUpdate>((resolve, reject) => {
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
      }).then(data => preferencesService.importPreferences(data))
    },
    onSuccess: (importedPreferences) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, importedPreferences)
      queryClient.invalidateQueries({ queryKey: THEME_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: LOCALE_QUERY_KEY })
      toast.success('Preferências importadas com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao importar preferências')
    },
  })

  // Aplicar tema do sistema
  const applySystemThemeMutation = useMutation({
    mutationFn: () => preferencesService.applySystemTheme(),
    onSuccess: (systemTheme) => {
      queryClient.setQueryData(THEME_QUERY_KEY, systemTheme)
      document.documentElement.setAttribute('data-theme', systemTheme.mode)
      toast.success('Tema do sistema aplicado!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao aplicar tema do sistema')
    },
  })

  // Detectar configurações do navegador
  const detectBrowserSettingsMutation = useMutation({
    mutationFn: () => preferencesService.detectBrowserSettings(),
    onSuccess: (browserSettings) => {
      queryClient.setQueryData(LOCALE_QUERY_KEY, (old: LocaleSettings) => ({
        ...old,
        ...browserSettings
      }))
      toast.success('Configurações do navegador detectadas!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao detectar configurações do navegador')
    },
  })

  // Validar preferências
  const validatePreferencesMutation = useMutation({
    mutationFn: (data: PreferencesUpdate) => preferencesService.validatePreferences(data),
    onError: (error: any) => {
      toast.error(error.message || 'Preferências inválidas')
    },
  })

  // Salvar automaticamente
  const autoSaveMutation = useMutation({
    mutationFn: (data: Partial<SystemPreferences>) => preferencesService.autoSave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY })
    },
    onError: (error: any) => {
      console.error('Erro no salvamento automático:', error)
    },
  })

  return {
    // Data
    preferences,
    themeSettings,
    localeSettings,
    
    // Loading states
    isLoading: isLoadingPreferences || isLoadingTheme || isLoadingLocale,
    isLoadingPreferences,
    isLoadingTheme,
    isLoadingLocale,
    
    // Errors
    error: preferencesError || themeError || localeError,
    preferencesError,
    themeError,
    localeError,
    
    // Actions
    updatePreferences: updatePreferencesMutation.mutate,
    updateTheme: updateThemeMutation.mutate,
    updateLocale: updateLocaleMutation.mutate,
    resetPreferences: resetPreferencesMutation.mutate,
    exportPreferences: exportPreferencesMutation.mutate,
    importPreferences: importPreferencesMutation.mutate,
    applySystemTheme: applySystemThemeMutation.mutate,
    detectBrowserSettings: detectBrowserSettingsMutation.mutate,
    validatePreferences: validatePreferencesMutation.mutate,
    autoSave: autoSaveMutation.mutate,
    refetchPreferences,
    
    // Mutation states
    isUpdating: updatePreferencesMutation.isPending,
    isUpdatingTheme: updateThemeMutation.isPending,
    isUpdatingLocale: updateLocaleMutation.isPending,
    isResetting: resetPreferencesMutation.isPending,
    isExporting: exportPreferencesMutation.isPending,
    isImporting: importPreferencesMutation.isPending,
    isApplyingSystemTheme: applySystemThemeMutation.isPending,
    isDetectingBrowser: detectBrowserSettingsMutation.isPending,
    isValidating: validatePreferencesMutation.isPending,
    isAutoSaving: autoSaveMutation.isPending,
    
    // Mutation errors
    updateError: updatePreferencesMutation.error,
    themeUpdateError: updateThemeMutation.error,
    localeUpdateError: updateLocaleMutation.error,
    resetError: resetPreferencesMutation.error,
    exportError: exportPreferencesMutation.error,
    importError: importPreferencesMutation.error,
    systemThemeError: applySystemThemeMutation.error,
    browserDetectionError: detectBrowserSettingsMutation.error,
    validateError: validatePreferencesMutation.error,
    autoSaveError: autoSaveMutation.error,
  }
}

export type UseSystemPreferencesReturn = ReturnType<typeof useSystemPreferences>