#!/usr/bin/env python3
"""
DataClínica - Middleware de Segurança

Este módulo implementa middlewares de segurança para aplicar automaticamente
políticas de segurança, rate limiting, validação de IP, cabeçalhos de segurança
e auditoria em todas as requisições da API.
"""

import time
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import redis
from sqlalchemy.orm import Session

from database import get_db
from security_config import get_security_config, is_ip_allowed, get_rate_limit
from audit_logger import audit_logger, AuditEventType, AuditSeverity
from session_manager import SessionManager

class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware principal de segurança"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.security_config = get_security_config()
        self.redis_client = None
        self.session_manager = SessionManager()
        
        # Inicializar Redis para rate limiting
        try:
            import redis
            self.redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'localhost'),
                port=int(os.getenv('REDIS_PORT', 6379)),
                db=int(os.getenv('REDIS_DB', 0)),
                decode_responses=True
            )
        except Exception as e:
            print(f"Aviso: Redis não disponível para rate limiting: {e}")
    
    async def dispatch(self, request: Request, call_next):
        """Processa a requisição aplicando políticas de segurança"""
        start_time = time.time()
        
        try:
            # 1. Validar IP
            client_ip = self._get_client_ip(request)
            if not is_ip_allowed(client_ip):
                return self._create_error_response(
                    "IP bloqueado",
                    status.HTTP_403_FORBIDDEN,
                    request,
                    start_time
                )
            
            # 2. Aplicar rate limiting
            if not await self._check_rate_limit(client_ip, request):
                return self._create_error_response(
                    "Muitas requisições. Tente novamente mais tarde.",
                    status.HTTP_429_TOO_MANY_REQUESTS,
                    request,
                    start_time
                )
            
            # 3. Validar tamanho da requisição
            if not self._validate_request_size(request):
                return self._create_error_response(
                    "Requisição muito grande",
                    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    request,
                    start_time
                )
            
            # 4. Detectar ataques comuns
            if self._detect_attack_patterns(request):
                await self._log_security_event(
                    request,
                    "Padrão de ataque detectado",
                    AuditSeverity.HIGH,
                    client_ip
                )
                return self._create_error_response(
                    "Requisição suspeita bloqueada",
                    status.HTTP_400_BAD_REQUEST,
                    request,
                    start_time
                )
            
            # 5. Processar requisição
            response = await call_next(request)
            
            # 6. Aplicar cabeçalhos de segurança
            self._apply_security_headers(response)
            
            # 7. Auditar requisição (se necessário)
            await self._audit_request(request, response, start_time, client_ip)
            
            return response
            
        except Exception as e:
            # Log do erro
            await self._log_security_event(
                request,
                f"Erro no middleware de segurança: {str(e)}",
                AuditSeverity.HIGH,
                client_ip
            )
            
            return self._create_error_response(
                "Erro interno do servidor",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                request,
                start_time
            )
    
    def _get_client_ip(self, request: Request) -> str:
        """Obtém o IP real do cliente"""
        # Verificar cabeçalhos de proxy
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        real_ip = request.headers.get('X-Real-IP')
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    async def _check_rate_limit(self, client_ip: str, request: Request) -> bool:
        """Verifica rate limiting"""
        if not self.redis_client:
            return True  # Se Redis não estiver disponível, permitir
        
        try:
            requests_limit, window_seconds = get_rate_limit()
            
            # Chave única para o IP
            key = f"rate_limit:{client_ip}"
            
            # Obter contagem atual
            current_requests = self.redis_client.get(key)
            
            if current_requests is None:
                # Primeira requisição na janela
                self.redis_client.setex(key, window_seconds, 1)
                return True
            
            current_requests = int(current_requests)
            
            if current_requests >= requests_limit:
                # Limite excedido
                await self._log_security_event(
                    request,
                    f"Rate limit excedido: {current_requests}/{requests_limit}",
                    AuditSeverity.MEDIUM,
                    client_ip
                )
                return False
            
            # Incrementar contador
            self.redis_client.incr(key)
            return True
            
        except Exception as e:
            print(f"Erro no rate limiting: {e}")
            return True  # Em caso de erro, permitir
    
    def _validate_request_size(self, request: Request) -> bool:
        """Valida o tamanho da requisição"""
        content_length = request.headers.get('content-length')
        if content_length:
            try:
                size_bytes = int(content_length)
                max_size_bytes = self.security_config.network.max_request_size_mb * 1024 * 1024
                return size_bytes <= max_size_bytes
            except ValueError:
                return False
        return True
    
    def _detect_attack_patterns(self, request: Request) -> bool:
        """Detecta padrões de ataque comuns"""
        url = str(request.url)
        user_agent = request.headers.get('user-agent', '').lower()
        
        # Padrões suspeitos na URL
        suspicious_patterns = [
            # SQL Injection
            "union select", "drop table", "insert into", "delete from",
            "' or '1'='1", "' or 1=1", "'; drop", "' union",
            
            # XSS
            "<script", "javascript:", "onerror=", "onload=",
            "alert(", "document.cookie", "eval(",
            
            # Path Traversal
            "../", "..%2f", "..%5c", "%2e%2e%2f",
            
            # Command Injection
            "; cat", "; ls", "; rm", "; wget", "; curl",
            "| cat", "| ls", "| rm", "| wget", "| curl",
            
            # LDAP Injection
            "*)(uid=*", "*)(cn=*", ")(|(uid=*",
            
            # XML Injection
            "<!entity", "<!doctype", "<![cdata["
        ]
        
        # Verificar URL
        url_lower = url.lower()
        for pattern in suspicious_patterns:
            if pattern in url_lower:
                return True
        
        # Verificar User-Agent suspeito
        suspicious_agents = [
            "sqlmap", "nikto", "nmap", "masscan", "zap",
            "burp", "w3af", "acunetix", "nessus", "openvas",
            "python-requests", "curl", "wget", "bot", "crawler"
        ]
        
        for agent in suspicious_agents:
            if agent in user_agent:
                return True
        
        # Verificar cabeçalhos suspeitos
        suspicious_headers = {
            'x-forwarded-for': ['127.0.0.1', 'localhost', '0.0.0.0'],
            'x-real-ip': ['127.0.0.1', 'localhost', '0.0.0.0'],
            'x-originating-ip': ['127.0.0.1', 'localhost', '0.0.0.0']
        }
        
        for header, suspicious_values in suspicious_headers.items():
            header_value = request.headers.get(header, '').lower()
            if any(value in header_value for value in suspicious_values):
                return True
        
        return False
    
    def _apply_security_headers(self, response: Response):
        """Aplica cabeçalhos de segurança"""
        security_headers = self.security_config.get_security_headers()
        
        for header, value in security_headers.items():
            response.headers[header] = value
        
        # Remover cabeçalhos que podem vazar informações
        headers_to_remove = ['server', 'x-powered-by', 'x-aspnet-version']
        for header in headers_to_remove:
            if header in response.headers:
                del response.headers[header]
    
    async def _audit_request(self, request: Request, response: Response, start_time: float, client_ip: str):
        """Audita a requisição se necessário"""
        try:
            # Calcular tempo de resposta
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Determinar se deve auditar
            should_audit = (
                response.status_code >= 400 or  # Erros
                request.method in ['POST', 'PUT', 'DELETE', 'PATCH'] or  # Operações de modificação
                '/admin' in str(request.url) or  # Endpoints administrativos
                '/auth' in str(request.url) or  # Endpoints de autenticação
                response_time_ms > 5000  # Requisições lentas
            )
            
            if should_audit:
                # Obter informações do usuário se disponível
                user_id = None
                username = None
                user_role = None
                session_id = None
                
                # Tentar extrair do token JWT ou sessão
                auth_header = request.headers.get('authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    try:
                        # Aqui você pode decodificar o JWT para obter informações do usuário
                        # Por simplicidade, vamos deixar como None por enquanto
                        pass
                    except:
                        pass
                
                # Determinar severidade
                severity = AuditSeverity.LOW
                if response.status_code >= 500:
                    severity = AuditSeverity.HIGH
                elif response.status_code >= 400:
                    severity = AuditSeverity.MEDIUM
                elif request.method in ['DELETE']:
                    severity = AuditSeverity.MEDIUM
                
                # Determinar tipo de evento
                event_type = AuditEventType.API_ACCESS
                if '/auth/login' in str(request.url):
                    event_type = AuditEventType.LOGIN_ATTEMPT
                elif '/auth/logout' in str(request.url):
                    event_type = AuditEventType.LOGOUT
                elif response.status_code >= 400:
                    event_type = AuditEventType.SECURITY_VIOLATION
                
                # Obter sessão do banco de dados
                db = next(get_db())
                
                # Registrar evento
                audit_logger.log_event(
                    db=db,
                    event_type=event_type,
                    description=f"{request.method} {request.url.path} - Status: {response.status_code}",
                    user_id=user_id,
                    username=username,
                    user_role=user_role,
                    session_id=session_id,
                    ip_address=client_ip,
                    endpoint=str(request.url.path),
                    http_method=request.method,
                    status_code=response.status_code,
                    response_time_ms=response_time_ms,
                    severity=severity,
                    metadata={
                        'user_agent': request.headers.get('user-agent'),
                        'referer': request.headers.get('referer'),
                        'query_params': dict(request.query_params) if request.query_params else None
                    }
                )
                
                db.close()
                
        except Exception as e:
            print(f"Erro na auditoria: {e}")
    
    async def _log_security_event(self, request: Request, description: str, severity: AuditSeverity, client_ip: str):
        """Registra evento de segurança"""
        try:
            db = next(get_db())
            
            audit_logger.log_event(
                db=db,
                event_type=AuditEventType.SECURITY_VIOLATION,
                description=description,
                ip_address=client_ip,
                endpoint=str(request.url.path),
                http_method=request.method,
                severity=severity,
                metadata={
                    'user_agent': request.headers.get('user-agent'),
                    'referer': request.headers.get('referer'),
                    'full_url': str(request.url)
                }
            )
            
            db.close()
            
        except Exception as e:
            print(f"Erro ao registrar evento de segurança: {e}")
    
    def _create_error_response(self, message: str, status_code: int, request: Request, start_time: float) -> JSONResponse:
        """Cria resposta de erro padronizada"""
        response_time_ms = int((time.time() - start_time) * 1000)
        
        response = JSONResponse(
            status_code=status_code,
            content={
                "error": message,
                "status_code": status_code,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path),
                "method": request.method,
                "response_time_ms": response_time_ms
            }
        )
        
        # Aplicar cabeçalhos de segurança
        self._apply_security_headers(response)
        
        return response

class CSRFMiddleware(BaseHTTPMiddleware):
    """Middleware de proteção CSRF"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.security_config = get_security_config()
    
    async def dispatch(self, request: Request, call_next):
        """Verifica proteção CSRF"""
        if not self.security_config.network.enable_csrf_protection:
            return await call_next(request)
        
        # Métodos que precisam de proteção CSRF
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            # Verificar se é uma requisição AJAX
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return await call_next(request)
            
            # Verificar token CSRF
            csrf_token = request.headers.get('X-CSRF-Token')
            if not csrf_token:
                # Tentar obter do formulário
                if request.headers.get('content-type', '').startswith('application/x-www-form-urlencoded'):
                    # Aqui você implementaria a lógica para extrair do corpo da requisição
                    pass
            
            # Validar token CSRF (implementação simplificada)
            if not self._validate_csrf_token(csrf_token, request):
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"error": "Token CSRF inválido ou ausente"}
                )
        
        return await call_next(request)
    
    def _validate_csrf_token(self, token: str, request: Request) -> bool:
        """Valida token CSRF"""
        if not token:
            return False
        
        # Implementação simplificada - em produção, use uma validação mais robusta
        # Por exemplo, verificar se o token foi gerado para esta sessão
        try:
            # Aqui você implementaria a lógica de validação do token
            # Por exemplo, decodificar e verificar assinatura
            return len(token) >= 32  # Validação básica
        except:
            return False

class CORSMiddleware(BaseHTTPMiddleware):
    """Middleware de CORS customizado"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.security_config = get_security_config()
    
    async def dispatch(self, request: Request, call_next):
        """Aplica políticas de CORS"""
        if not self.security_config.network.enable_cors:
            return await call_next(request)
        
        origin = request.headers.get('origin')
        
        # Verificar se a origem é permitida
        allowed_origins = self.security_config.network.cors_origins
        is_allowed_origin = (
            not allowed_origins or  # Se não há restrições
            '*' in allowed_origins or  # Se permite todas
            origin in allowed_origins  # Se a origem está na lista
        )
        
        if request.method == 'OPTIONS':
            # Requisição preflight
            if is_allowed_origin:
                response = Response()
                response.headers['Access-Control-Allow-Origin'] = origin or '*'
                response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token'
                response.headers['Access-Control-Max-Age'] = '86400'  # 24 horas
                return response
            else:
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"error": "Origem não permitida"}
                )
        
        # Processar requisição normal
        if not is_allowed_origin:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "Origem não permitida"}
            )
        
        response = await call_next(request)
        
        # Adicionar cabeçalhos CORS
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        return response

class SessionValidationMiddleware(BaseHTTPMiddleware):
    """Middleware de validação de sessão"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.session_manager = SessionManager()
        self.security_config = get_security_config()
    
    async def dispatch(self, request: Request, call_next):
        """Valida sessões ativas"""
        # Endpoints que não precisam de validação de sessão
        public_endpoints = [
            '/docs', '/redoc', '/openapi.json',
            '/auth/login', '/auth/register', '/auth/forgot-password',
            '/health', '/status'
        ]
        
        if any(request.url.path.startswith(endpoint) for endpoint in public_endpoints):
            return await call_next(request)
        
        # Obter token de autorização
        auth_header = request.headers.get('authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return await call_next(request)  # Deixar para o middleware de auth tratar
        
        token = auth_header[7:]  # Remover 'Bearer '
        
        try:
            # Validar sessão
            db = next(get_db())
            
            # Aqui você implementaria a lógica de validação da sessão
            # Por exemplo, verificar se a sessão ainda é válida
            session_valid = await self.session_manager.validate_session(
                db, token, self._get_client_ip(request)
            )
            
            if not session_valid:
                db.close()
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"error": "Sessão inválida ou expirada"}
                )
            
            db.close()
            
        except Exception as e:
            print(f"Erro na validação de sessão: {e}")
        
        return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Obtém o IP real do cliente"""
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        real_ip = request.headers.get('X-Real-IP')
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"

# Função para aplicar todos os middlewares
def apply_security_middlewares(app):
    """Aplica todos os middlewares de segurança à aplicação"""
    # Ordem é importante - do mais externo para o mais interno
    app.add_middleware(SecurityMiddleware)
    app.add_middleware(CORSMiddleware)
    app.add_middleware(CSRFMiddleware)
    app.add_middleware(SessionValidationMiddleware)
    
    return app