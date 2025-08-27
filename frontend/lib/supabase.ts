import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para autenticação
export interface AuthUser {
  id: string
  email?: string
  username?: string
  role?: string
  clinic_id?: string
}

// Funções de autenticação
export const authService = {
  // Login com email/senha
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Login com username/senha (buscar email primeiro)
  async signInWithUsername(username: string, password: string) {
    // Primeiro, buscar o email do usuário pelo username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('username', username)
      .single()

    if (userError || !userData?.email) {
      return { data: null, error: { message: 'Usuário não encontrado' } }
    }

    // Fazer login com o email encontrado
    return await this.signIn(userData.email, password)
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Obter sessão atual
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Redefinir senha
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  // Atualizar senha
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  // Escutar mudanças de autenticação
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Função de teste para verificar usuários
  async testUserExists(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, is_active')
      .eq('username', username)
      .single()
    
    return { data, error }
  }
}