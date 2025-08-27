import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, authService } from '@/lib/supabase'
import { toast } from 'sonner'

// Tipos para o usuário e autenticação
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'doctor' | 'receptionist'
  avatar?: string
  twoFactorEnabled?: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  username: string
  password: string
  twoFactorCode?: string
}

export interface LoginResponse {
  user?: User
  token?: string
  requiresTwoFactor?: boolean
  sessionToken?: string
  message?: string
}



export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  requiresTwoFactor: boolean
  sessionToken: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; requiresTwoFactor?: boolean; sessionToken?: string }>
  logout: () => void
  logoutSilent: () => void
  updateUser: (userData: Partial<User>) => void
  checkAuth: () => Promise<void>
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (token: string, password: string) => Promise<boolean>
  clearTwoFactorState: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      requiresTwoFactor: false,
      sessionToken: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
          // Tentar login com username (buscar email primeiro)
          const { data: authData, error } = await authService.signInWithUsername(
            credentials.username, 
            credentials.password
          )

          if (error || !authData?.user) {
            toast.error('Credenciais inválidas')
            set({ isLoading: false })
            return { success: false }
          }

          // Buscar dados completos do usuário na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()

          if (userError || !userData) {
            toast.error('Erro ao carregar dados do usuário')
            set({ isLoading: false })
            return { success: false }
          }

          // Mapear dados do usuário
          const user: User = {
            id: userData.id,
            name: userData.name || userData.username,
            email: userData.email,
            role: userData.role || 'receptionist',
            avatar: userData.avatar,
            twoFactorEnabled: userData.two_factor_enabled || false,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          }

          // Salvar token de sessão (apenas no cliente)
          const token = authData.session?.access_token
          if (token && typeof window !== 'undefined') {
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            requiresTwoFactor: false,
            sessionToken: null,
          })
          
          toast.success(`Bem-vindo(a), ${user.name}!`)
          return { success: true }
        } catch (error: any) {
          console.error('Erro no login:', error)
          toast.error('Erro ao fazer login')
          set({ isLoading: false })
          return { success: false }
        }
      },



      logout: async () => {
        try {
          // Fazer logout no Supabase
          await authService.signOut()
          
          // Remover dados do localStorage (apenas no cliente)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            requiresTwoFactor: false,
            sessionToken: null,
          })
          
          toast.success('Logout realizado com sucesso')
          
          // Redirecionar para login (apenas no cliente)
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        } catch (error) {
          console.error('Erro no logout:', error)
          toast.error('Erro ao fazer logout')
        }
      },

      logoutSilent: async () => {
        try {
          // Fazer logout no Supabase
          await authService.signOut()
          
          // Remover dados do localStorage (apenas no cliente)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            requiresTwoFactor: false,
            sessionToken: null,
          })
        } catch (error) {
          console.error('Erro no logout silencioso:', error)
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedUser))
          }
          set({ user: updatedUser })
        }
      },

      checkAuth: async () => {
        try {
          // Verificar sessão atual no Supabase
          const { session, error } = await authService.getSession()
          
          if (error || !session?.user) {
            // Não há sessão válida, fazer logout silencioso
            get().logoutSilent()
            return
          }

          // Buscar dados completos do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userError || !userData) {
            get().logoutSilent()
            return
          }

          // Mapear dados do usuário
          const user: User = {
            id: userData.id,
            name: userData.name || userData.username,
            email: userData.email,
            role: userData.role || 'receptionist',
            avatar: userData.avatar,
            twoFactorEnabled: userData.two_factor_enabled || false,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          }

          set({
            user,
            token: session.access_token,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error)
          get().logoutSilent()
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true })
        try {
          const { error } = await authService.resetPassword(email)
          
          if (!error) {
            toast.success('Email de recuperação enviado!')
            set({ isLoading: false })
            return true
          } else {
            toast.error('Erro ao enviar email de recuperação')
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          console.error('Erro ao solicitar recuperação:', error)
          toast.error('Erro ao enviar email de recuperação')
          set({ isLoading: false })
          return false
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true })
        try {
          const { error } = await authService.updatePassword(password)
          
          if (!error) {
            toast.success('Senha alterada com sucesso!')
            set({ isLoading: false })
            return true
          } else {
            toast.error('Erro ao alterar senha')
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          console.error('Erro ao alterar senha:', error)
          toast.error('Erro ao alterar senha')
          set({ isLoading: false })
          return false
        }
      },

      clearTwoFactorState: () => {
        set({
          requiresTwoFactor: false,
          sessionToken: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)