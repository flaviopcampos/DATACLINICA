/**
 * Testes do Sistema de Gestão de Sessões - DataClínica
 * 
 * Este arquivo contém testes para validar as funcionalidades
 * principais do sistema de gestão de sessões.
 */

import React from 'react'
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSessions } from '../hooks/useSessions'
import { useSessionActivity } from '../hooks/useSessionActivity'
import { useSecurity } from '../hooks/useSecurity'
import { useIntegration } from '../hooks/useIntegration'
import { sessionService } from '../services/sessionService'
import { securityService } from '../services/securityService'
import { integrationService } from '../services/integrationService'
import type { Session, SessionActivity, SecurityAlert } from '../types/session'

// Mock dos serviços
jest.mock('../services/sessionService')
jest.mock('../services/securityService')
jest.mock('../services/integrationService')

const mockSessionService = sessionService as jest.Mocked<typeof sessionService>
const mockSecurityService = securityService as jest.Mocked<typeof securityService>
const mockIntegrationService = integrationService as jest.Mocked<typeof integrationService>

// Dados de teste
const mockSession: Session = {
  id: 'session-1',
  userId: 1,
  deviceInfo: {
    type: 'desktop',
    name: 'Chrome on Windows',
    os: 'Windows 11',
    browser: 'Chrome 120.0'
  },
  location: {
    ip: '192.168.1.100',
    country: 'Brasil',
    region: 'São Paulo',
    city: 'São Paulo',
    coordinates: { lat: -23.5505, lng: -46.6333 }
  },
  status: 'active',
  createdAt: '2024-01-15T10:00:00Z',
  lastActivity: '2024-01-15T10:30:00Z',
  expiresAt: '2024-01-15T18:00:00Z',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  isCurrentSession: false,
  riskLevel: 'low',
  securityScore: 85
}

const mockActivity: SessionActivity = {
  id: 'activity-1',
  sessionId: 'session-1',
  userId: 1,
  type: 'page_view',
  description: 'Visualizou página de dashboard',
  timestamp: '2024-01-15T10:30:00Z',
  metadata: {
    page: '/dashboard',
    duration: 5000
  },
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

const mockAlert: SecurityAlert = {
  id: 'alert-1',
  sessionId: 'session-1',
  userId: 1,
  type: 'suspicious_location',
  severity: 'medium',
  message: 'Login de localização não usual detectado',
  details: {
    location: 'São Paulo, Brasil',
    previousLocation: 'Rio de Janeiro, Brasil'
  },
  timestamp: '2024-01-15T10:00:00Z',
  isRead: false
}

// Wrapper para React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('Sistema de Gestão de Sessões', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useSessions Hook', () => {
    it('deve carregar sessões corretamente', async () => {
      mockSessionService.getSessions.mockResolvedValue([mockSession])
      
      const { result } = renderHook(() => useSessions(), {
        wrapper: createWrapper()
      })
      
      expect(result.current.isLoading).toBe(true)
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(mockSessionService.getSessions).toHaveBeenCalled()
    })

    it('deve encerrar sessão corretamente', async () => {
      mockSessionService.terminateSession.mockResolvedValue(undefined)
      
      const { result } = renderHook(() => useSessions(), {
        wrapper: createWrapper()
      })
      
      await act(async () => {
        await result.current.terminateSession.mutateAsync('session-1')
      })
      
      expect(mockSessionService.terminateSession).toHaveBeenCalledWith('session-1')
    })

    it('deve encerrar todas as outras sessões', async () => {
      mockSessionService.terminateAllOtherSessions.mockResolvedValue(undefined)
      
      const { result } = renderHook(() => useSessions(), {
        wrapper: createWrapper()
      })
      
      await act(async () => {
        await result.current.terminateAllOtherSessions.mutateAsync()
      })
      
      expect(mockSessionService.terminateAllOtherSessions).toHaveBeenCalled()
    })
  })

  describe('useSessionActivity Hook', () => {
    it('deve carregar atividades da sessão', async () => {
      mockSessionService.getSessionActivity.mockResolvedValue([mockActivity])
      
      const { result } = renderHook(() => useSessionActivity('session-1'), {
        wrapper: createWrapper()
      })
      
      expect(result.current.isLoading).toBe(true)
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(mockSessionService.getSessionActivity).toHaveBeenCalledWith('session-1')
    })
  })

  describe('useSecurity Hook', () => {
    it('deve analisar segurança da sessão', async () => {
      const mockAnalysis = {
        riskLevel: 'low' as const,
        securityScore: 85,
        threats: [],
        recommendations: []
      }
      
      mockSecurityService.analyzeSessionSecurity.mockResolvedValue(mockAnalysis)
      
      const { result } = renderHook(() => useSecurity(), {
        wrapper: createWrapper()
      })
      
      await act(async () => {
        await result.current.analyzeSessionSecurity.mutateAsync('session-1')
      })
      
      expect(mockSecurityService.analyzeSessionSecurity).toHaveBeenCalledWith('session-1')
    })

    it('deve criar alerta de segurança', async () => {
      mockSecurityService.createSecurityAlert.mockResolvedValue(mockAlert)
      
      const { result } = renderHook(() => useSecurity(), {
        wrapper: createWrapper()
      })
      
      const alertData = {
        sessionId: 'session-1',
        userId: 1,
        type: 'suspicious_location' as const,
        severity: 'medium' as const,
        message: 'Login suspeito detectado'
      }
      
      await act(async () => {
        await result.current.createAlert.mutateAsync(alertData)
      })
      
      expect(mockSecurityService.createSecurityAlert).toHaveBeenCalledWith(alertData)
    })
  })

  describe('useIntegration Hook', () => {
    it('deve verificar segurança da sessão', async () => {
      const mockSecurityCheck = {
        isSecure: true,
        requires2FA: false,
        isLocationSuspicious: false,
        riskFactors: []
      }
      
      mockIntegrationService.checkSessionSecurity.mockResolvedValue(mockSecurityCheck)
      
      const { result } = renderHook(() => useIntegration({ sessionId: 'session-1' }), {
        wrapper: createWrapper()
      })
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(mockIntegrationService.checkSessionSecurity).toHaveBeenCalledWith('session-1')
    })

    it('deve validar sessão com 2FA', async () => {
      mockIntegrationService.validateSessionWith2FA.mockResolvedValue(true)
      
      const { result } = renderHook(() => useIntegration(), {
        wrapper: createWrapper()
      })
      
      await act(async () => {
        await result.current.validateWith2FA.mutateAsync({
          sessionId: 'session-1',
          token: '123456'
        })
      })
      
      expect(mockIntegrationService.validateSessionWith2FA)
        .toHaveBeenCalledWith('session-1', '123456')
    })

    it('deve registrar atividade da sessão', async () => {
      mockIntegrationService.logSessionActivity.mockResolvedValue(undefined)
      
      const { result } = renderHook(() => useIntegration(), {
        wrapper: createWrapper()
      })
      
      const activityData = {
        sessionId: 'session-1',
        activityType: 'page_view',
        details: { page: '/dashboard' }
      }
      
      await act(async () => {
        await result.current.logActivity.mutateAsync(activityData)
      })
      
      expect(mockIntegrationService.logSessionActivity)
        .toHaveBeenCalledWith('session-1', 'page_view', { page: '/dashboard' })
    })
  })

  describe('Integração entre Serviços', () => {
    it('deve processar alerta de segurança corretamente', async () => {
      mockIntegrationService.processSessionSecurityAlert.mockResolvedValue(undefined)
      
      const { result } = renderHook(() => useIntegration(), {
        wrapper: createWrapper()
      })
      
      await act(async () => {
        await result.current.handleSecurityAlert(mockAlert)
      })
      
      expect(mockIntegrationService.processSessionSecurityAlert)
        .toHaveBeenCalledWith(mockAlert)
    })

    it('deve lidar com atividade suspeita', async () => {
      mockIntegrationService.logSessionActivity.mockResolvedValue(undefined)
      mockIntegrationService.sendSessionSecurityNotification.mockResolvedValue(undefined)
      mockIntegrationService.processSessionSecurityAlert.mockResolvedValue(undefined)
      
      const { result } = renderHook(() => useIntegration(), {
        wrapper: createWrapper()
      })
      
      const suspiciousDetails = {
        reason: 'unusual_location',
        location: 'Unknown Location'
      }
      
      await act(async () => {
        await result.current.handleSuspiciousActivity('session-1', suspiciousDetails)
      })
      
      expect(mockIntegrationService.logSessionActivity).toHaveBeenCalled()
      expect(mockIntegrationService.sendSessionSecurityNotification).toHaveBeenCalled()
    })
  })

  describe('Validação de Dados', () => {
    it('deve validar estrutura da sessão', () => {
      expect(mockSession).toHaveProperty('id')
      expect(mockSession).toHaveProperty('userId')
      expect(mockSession).toHaveProperty('deviceInfo')
      expect(mockSession).toHaveProperty('location')
      expect(mockSession).toHaveProperty('status')
      expect(mockSession.status).toMatch(/^(active|inactive|blocked|expired)$/)
    })

    it('deve validar estrutura da atividade', () => {
      expect(mockActivity).toHaveProperty('id')
      expect(mockActivity).toHaveProperty('sessionId')
      expect(mockActivity).toHaveProperty('userId')
      expect(mockActivity).toHaveProperty('type')
      expect(mockActivity).toHaveProperty('timestamp')
    })

    it('deve validar estrutura do alerta', () => {
      expect(mockAlert).toHaveProperty('id')
      expect(mockAlert).toHaveProperty('sessionId')
      expect(mockAlert).toHaveProperty('type')
      expect(mockAlert).toHaveProperty('severity')
      expect(mockAlert.severity).toMatch(/^(low|medium|high|critical)$/)
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve lidar com erro ao carregar sessões', async () => {
      const error = new Error('Erro ao carregar sessões')
      mockSessionService.getSessions.mockRejectedValue(error)
      
      const { result } = renderHook(() => useSessions(), {
        wrapper: createWrapper()
      })
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(result.current.error).toBeTruthy()
    })

    it('deve lidar com erro ao encerrar sessão', async () => {
      const error = new Error('Erro ao encerrar sessão')
      mockSessionService.terminateSession.mockRejectedValue(error)
      
      const { result } = renderHook(() => useSessions(), {
        wrapper: createWrapper()
      })
      
      await act(async () => {
        try {
          await result.current.terminateSession.mutateAsync('session-1')
        } catch (e) {
          expect(e).toBe(error)
        }
      })
    })
  })
})

// Testes de integração
describe('Testes de Integração', () => {
  it('deve integrar sessões com sistema de segurança', async () => {
    mockSessionService.getSessions.mockResolvedValue([mockSession])
    mockSecurityService.analyzeSessionSecurity.mockResolvedValue({
      riskLevel: 'low',
      securityScore: 85,
      threats: [],
      recommendations: []
    })
    
    const { result: sessionsResult } = renderHook(() => useSessions(), {
      wrapper: createWrapper()
    })
    
    const { result: securityResult } = renderHook(() => useSecurity(), {
      wrapper: createWrapper()
    })
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
      await securityResult.current.analyzeSessionSecurity.mutateAsync('session-1')
    })
    
    expect(mockSessionService.getSessions).toHaveBeenCalled()
    expect(mockSecurityService.analyzeSessionSecurity).toHaveBeenCalledWith('session-1')
  })

  it('deve integrar com sistema de notificações', async () => {
    mockIntegrationService.sendSessionSecurityNotification.mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useIntegration(), {
      wrapper: createWrapper()
    })
    
    await act(async () => {
      await result.current.sendSecurityNotification.mutateAsync({
        userId: 1,
        notificationType: 'new_device',
        sessionData: mockSession,
        priority: 'normal'
      })
    })
    
    expect(mockIntegrationService.sendSessionSecurityNotification)
      .toHaveBeenCalledWith(1, 'new_device', mockSession, 'normal')
  })
})