/**
 * Middleware de Verificação de Sessão - DataClínica
 * 
 * Este middleware verifica a validade das sessões e integra
 * com os sistemas de segurança existentes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { integrationService } from '../services/integrationService'
import { sessionService } from '../services/sessionService'
import { securityService } from '../services/securityService'
import type { Session } from '../types/session'

interface SessionMiddlewareConfig {
  excludePaths?: string[]
  requireAuth?: boolean
  checkSecurity?: boolean
  logActivity?: boolean
}

const DEFAULT_CONFIG: SessionMiddlewareConfig = {
  excludePaths: ['/login', '/register', '/forgot-password', '/api/auth'],
  requireAuth: true,
  checkSecurity: true,
  logActivity: true
}

export class SessionMiddleware {
  private config: SessionMiddlewareConfig

  constructor(config: Partial<SessionMiddlewareConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async handle(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl
    const response = NextResponse.next()

    // Verificar se o path deve ser excluído
    if (this.shouldExcludePath(pathname)) {
      return response
    }

    try {
      // Obter token da sessão
      const sessionToken = this.extractSessionToken(request)
      
      if (!sessionToken && this.config.requireAuth) {
        return this.redirectToLogin(request)
      }

      if (sessionToken) {
        // Verificar validade da sessão
        const session = await this.validateSession(sessionToken)
        
        if (!session) {
          return this.redirectToLogin(request)
        }

        // Verificar segurança da sessão
        if (this.config.checkSecurity) {
          const securityCheck = await this.performSecurityCheck(session, request)
          
          if (!securityCheck.isValid) {
            return this.handleSecurityIssue(securityCheck, request)
          }
        }

        // Registrar atividade
        if (this.config.logActivity) {
          await this.logSessionActivity(session, request)
        }

        // Adicionar informações da sessão aos headers
        this.addSessionHeaders(response, session)
      }

      return response
    } catch (error) {
      console.error('Erro no middleware de sessão:', error)
      
      // Em caso de erro, redirecionar para login se autenticação for obrigatória
      if (this.config.requireAuth) {
        return this.redirectToLogin(request)
      }
      
      return response
    }
  }

  private shouldExcludePath(pathname: string): boolean {
    return this.config.excludePaths?.some(path => 
      pathname.startsWith(path)
    ) || false
  }

  private extractSessionToken(request: NextRequest): string | null {
    // Tentar obter token do cookie
    const cookieToken = request.cookies.get('session_token')?.value
    if (cookieToken) return cookieToken

    // Tentar obter token do header Authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    return null
  }

  private async validateSession(token: string): Promise<Session | null> {
    try {
      const session = await sessionService.validateSession(token)
      return session
    } catch (error) {
      console.error('Erro ao validar sessão:', error)
      return null
    }
  }

  private async performSecurityCheck(
    session: Session, 
    request: NextRequest
  ): Promise<{ isValid: boolean; reason?: string; action?: string }> {
    try {
      // Verificar se a sessão está bloqueada
      if (session.status === 'blocked') {
        return {
          isValid: false,
          reason: 'session_blocked',
          action: 'redirect_to_login'
        }
      }

      // Verificar se a sessão expirou
      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        return {
          isValid: false,
          reason: 'session_expired',
          action: 'redirect_to_login'
        }
      }

      // Verificar IP suspeito
      const clientIP = this.getClientIP(request)
      if (clientIP && session.ipAddress !== clientIP) {
        const isIPSuspicious = await securityService.analyzeLocationRisk({
          ip: clientIP,
          userAgent: request.headers.get('user-agent') || ''
        })

        if (isIPSuspicious.riskLevel === 'high') {
          return {
            isValid: false,
            reason: 'suspicious_ip',
            action: 'require_2fa'
          }
        }
      }

      // Verificar se reautenticação é necessária
      const reauthRequired = await integrationService.checkReauthenticationRequired(session.id)
      if (reauthRequired) {
        return {
          isValid: false,
          reason: 'reauth_required',
          action: 'require_2fa'
        }
      }

      // Verificar atividade suspeita
      const suspiciousActivity = await securityService.detectSuspiciousActivity({
        sessionId: session.id,
        userId: session.userId,
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || '',
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString()
      })

      if (suspiciousActivity.isSuspicious) {
        return {
          isValid: false,
          reason: 'suspicious_activity',
          action: 'require_2fa'
        }
      }

      return { isValid: true }
    } catch (error) {
      console.error('Erro na verificação de segurança:', error)
      return { isValid: true } // Em caso de erro, permitir acesso
    }
  }

  private async handleSecurityIssue(
    securityCheck: { reason?: string; action?: string },
    request: NextRequest
  ): Promise<NextResponse> {
    const { reason, action } = securityCheck

    switch (action) {
      case 'redirect_to_login':
        return this.redirectToLogin(request)
      
      case 'require_2fa':
        return this.redirectTo2FA(request, reason)
      
      default:
        return this.redirectToLogin(request)
    }
  }

  private async logSessionActivity(session: Session, request: NextRequest): Promise<void> {
    try {
      const clientIP = this.getClientIP(request)
      const userAgent = request.headers.get('user-agent') || ''
      
      await integrationService.logSessionActivity(session.id, 'page_access', {
        path: request.nextUrl.pathname,
        method: request.method,
        ip: clientIP,
        userAgent,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erro ao registrar atividade da sessão:', error)
    }
  }

  private addSessionHeaders(response: NextResponse, session: Session): void {
    response.headers.set('X-Session-ID', session.id)
    response.headers.set('X-User-ID', session.userId.toString())
    response.headers.set('X-Session-Status', session.status)
    
    if (session.expiresAt) {
      response.headers.set('X-Session-Expires', session.expiresAt)
    }
  }

  private getClientIP(request: NextRequest): string | null {
    // Tentar obter IP de diferentes headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim()
    }

    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
      return realIP
    }

    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    if (cfConnectingIP) {
      return cfConnectingIP
    }

    return request.ip || null
  }

  private redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    
    return NextResponse.redirect(loginUrl)
  }

  private redirectTo2FA(request: NextRequest, reason?: string): NextResponse {
    const twoFAUrl = new URL('/auth/2fa', request.url)
    twoFAUrl.searchParams.set('redirect', request.nextUrl.pathname)
    
    if (reason) {
      twoFAUrl.searchParams.set('reason', reason)
    }
    
    return NextResponse.redirect(twoFAUrl)
  }
}

// Instância padrão do middleware
export const sessionMiddleware = new SessionMiddleware()

// Função helper para usar em middleware.ts do Next.js
export function createSessionMiddleware(config?: Partial<SessionMiddlewareConfig>) {
  const middleware = new SessionMiddleware(config)
  
  return async (request: NextRequest) => {
    return middleware.handle(request)
  }
}

export default SessionMiddleware