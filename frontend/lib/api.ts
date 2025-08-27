import axios from 'axios'
import { toast } from 'sonner'

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token JWT nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error
    
    if (response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.error('Sessão expirada. Faça login novamente.')
      window.location.href = '/auth/login'
    } else if (response?.status === 403) {
      toast.error('Acesso negado.')
    } else if (response?.status === 404) {
      toast.error('Recurso não encontrado.')
    } else if (response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Tempo limite da requisição excedido.')
    } else {
      toast.error(response?.data?.message || 'Erro inesperado.')
    }
    
    return Promise.reject(error)
  }
)

export default api

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Funções utilitárias para chamadas de API
export const apiUtils = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    const response = await api.get(url, { params })
    return response.data
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.post(url, data)
    return response.data
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data)
    return response.data
  },

  // DELETE request
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.delete(url)
    return response.data
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data)
    return response.data
  },
}