#!/usr/bin/env python3
"""
DataClínica - Monitor de Segurança em Tempo Real

Este módulo implementa monitoramento de segurança em tempo real,
detecção de ameaças, análise comportamental e resposta automática a incidentes.
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, deque
import hashlib
import ipaddress
import re
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from .models import User, UserSession, AuditLog
from .audit_logger import AuditLogger, EventType, EventSeverity
from .session_manager import SessionManager
from .security_config import SecurityConfig

class ThreatLevel(str, Enum):
    """Níveis de ameaça"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ThreatType(str, Enum):
    """Tipos de ameaça"""
    BRUTE_FORCE = "brute_force"
    ACCOUNT_TAKEOVER = "account_takeover"
    DATA_EXFILTRATION = "data_exfiltration"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    SUSPICIOUS_LOGIN = "suspicious_login"
    MULTIPLE_SESSIONS = "multiple_sessions"
    UNUSUAL_ACTIVITY = "unusual_activity"
    SQL_INJECTION = "sql_injection"
    XSS_ATTEMPT = "xss_attempt"
    CSRF_ATTACK = "csrf_attack"
    DDoS_ATTACK = "ddos_attack"
    MALWARE_DETECTED = "malware_detected"
    INSIDER_THREAT = "insider_threat"

class ResponseAction(str, Enum):
    """Ações de resposta automática"""
    LOG_ONLY = "log_only"
    ALERT_ADMIN = "alert_admin"
    BLOCK_IP = "block_ip"
    SUSPEND_USER = "suspend_user"
    FORCE_LOGOUT = "force_logout"
    REQUIRE_2FA = "require_2fa"
    RATE_LIMIT = "rate_limit"
    QUARANTINE_SESSION = "quarantine_session"

@dataclass
class SecurityEvent:
    """Evento de segurança"""
    event_id: str
    timestamp: datetime
    threat_type: ThreatType
    threat_level: ThreatLevel
    source_ip: str
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    description: str = ""
    details: Dict[str, Any] = field(default_factory=dict)
    evidence: List[str] = field(default_factory=list)
    response_actions: List[ResponseAction] = field(default_factory=list)
    resolved: bool = False
    false_positive: bool = False

@dataclass
class UserBehaviorProfile:
    """Perfil comportamental do usuário"""
    user_id: int
    typical_login_times: List[int] = field(default_factory=list)  # Horas do dia
    typical_locations: Set[str] = field(default_factory=set)  # IPs/países
    typical_devices: Set[str] = field(default_factory=set)  # User agents
    typical_actions: Dict[str, int] = field(default_factory=dict)  # Ações e frequência
    session_duration_avg: float = 0.0
    last_updated: datetime = field(default_factory=datetime.now)
    anomaly_score: float = 0.0

class SecurityMonitor:
    """Monitor de segurança em tempo real"""
    
    def __init__(self, db: Session, config: SecurityConfig):
        self.db = db
        self.config = config
        self.audit_logger = AuditLogger(db)
        self.session_manager = SessionManager(db, config)
        
        # Armazenamento em memória para análise em tempo real
        self.failed_login_attempts: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self.request_counts: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.user_profiles: Dict[int, UserBehaviorProfile] = {}
        self.blocked_ips: Set[str] = set()
        self.suspicious_patterns: Dict[str, List[str]] = {
            'sql_injection': [
                r"('|(\-\-)|(;)|(\||\|)|(\*|\*))",
                r"(union|select|insert|delete|update|drop|create|alter|exec|execute)",
                r"(script|javascript|vbscript|onload|onerror|onclick)"
            ],
            'xss': [
                r"<script[^>]*>.*?</script>",
                r"javascript:\s*[^\s]",
                r"on\w+\s*=\s*['\"][^'\"]*['\"]?"
            ],
            'path_traversal': [
                r"\.\./",
                r"\.\.\\\\",
                r"%2e%2e%2f",
                r"%2e%2e%5c"
            ]
        }
        
        # Métricas de segurança
        self.security_metrics = {
            'total_events': 0,
            'events_by_type': defaultdict(int),
            'events_by_level': defaultdict(int),
            'blocked_attempts': 0,
            'false_positives': 0,
            'response_times': deque(maxlen=1000)
        }
    
    async def monitor_login_attempt(self, ip: str, user_id: Optional[int] = None, 
                                  success: bool = True, user_agent: str = "") -> Optional[SecurityEvent]:
        """Monitora tentativas de login"""
        current_time = datetime.now()
        
        if not success:
            # Registrar tentativa falhada
            self.failed_login_attempts[ip].append(current_time)
            
            # Verificar brute force
            recent_failures = [t for t in self.failed_login_attempts[ip] 
                             if current_time - t <= timedelta(minutes=15)]
            
            if len(recent_failures) >= self.config.security.max_login_attempts:
                return await self._create_security_event(
                    ThreatType.BRUTE_FORCE,
                    ThreatLevel.HIGH,
                    ip,
                    user_id,
                    f"Brute force detectado: {len(recent_failures)} tentativas em 15 minutos",
                    {
                        'attempts_count': len(recent_failures),
                        'time_window': '15_minutes',
                        'user_agent': user_agent
                    },
                    [ResponseAction.BLOCK_IP, ResponseAction.ALERT_ADMIN]
                )
        else:
            # Login bem-sucedido - analisar comportamento
            if user_id:
                await self._analyze_login_behavior(user_id, ip, user_agent, current_time)
        
        return None
    
    async def monitor_request(self, ip: str, endpoint: str, method: str, 
                            user_id: Optional[int] = None, payload: str = "") -> Optional[SecurityEvent]:
        """Monitora requisições HTTP"""
        current_time = datetime.now()
        
        # Rate limiting
        self.request_counts[ip].append(current_time)
        recent_requests = [t for t in self.request_counts[ip] 
                          if current_time - t <= timedelta(minutes=1)]
        
        if len(recent_requests) > self.config.security.rate_limit_requests:
            return await self._create_security_event(
                ThreatType.DDoS_ATTACK,
                ThreatLevel.MEDIUM,
                ip,
                user_id,
                f"Rate limit excedido: {len(recent_requests)} requisições por minuto",
                {
                    'requests_count': len(recent_requests),
                    'endpoint': endpoint,
                    'method': method
                },
                [ResponseAction.RATE_LIMIT, ResponseAction.BLOCK_IP]
            )
        
        # Detectar padrões maliciosos no payload
        if payload:
            threat_event = await self._detect_malicious_patterns(ip, endpoint, payload, user_id)
            if threat_event:
                return threat_event
        
        # Monitorar endpoints sensíveis
        sensitive_endpoints = ['/api/users', '/api/patients', '/api/medical-records']
        if any(sensitive in endpoint for sensitive in sensitive_endpoints):
            if user_id:
                await self._monitor_data_access(user_id, endpoint, method)
        
        return None
    
    async def monitor_user_activity(self, user_id: int, action: str, 
                                  resource: str = "", details: Dict[str, Any] = None) -> Optional[SecurityEvent]:
        """Monitora atividade do usuário"""
        if details is None:
            details = {}
        
        # Atualizar perfil comportamental
        await self._update_user_profile(user_id, action, details)
        
        # Detectar atividades suspeitas
        profile = self.user_profiles.get(user_id)
        if profile and profile.anomaly_score > 0.8:
            return await self._create_security_event(
                ThreatType.UNUSUAL_ACTIVITY,
                ThreatLevel.MEDIUM,
                details.get('ip', 'unknown'),
                user_id,
                f"Atividade anômala detectada (score: {profile.anomaly_score:.2f})",
                {
                    'action': action,
                    'resource': resource,
                    'anomaly_score': profile.anomaly_score,
                    'details': details
                },
                [ResponseAction.ALERT_ADMIN, ResponseAction.LOG_ONLY]
            )
        
        # Detectar escalação de privilégios
        if action in ['role_change', 'permission_grant', 'admin_access']:
            return await self._detect_privilege_escalation(user_id, action, details)
        
        return None
    
    async def monitor_data_access(self, user_id: int, table: str, operation: str, 
                                record_count: int = 1, sensitive_fields: List[str] = None) -> Optional[SecurityEvent]:
        """Monitora acesso a dados sensíveis"""
        if sensitive_fields is None:
            sensitive_fields = []
        
        # Detectar possível exfiltração de dados
        if record_count > 100:  # Threshold configurável
            return await self._create_security_event(
                ThreatType.DATA_EXFILTRATION,
                ThreatLevel.HIGH,
                'internal',
                user_id,
                f"Acesso em massa a dados: {record_count} registros de {table}",
                {
                    'table': table,
                    'operation': operation,
                    'record_count': record_count,
                    'sensitive_fields': sensitive_fields
                },
                [ResponseAction.ALERT_ADMIN, ResponseAction.QUARANTINE_SESSION]
            )
        
        # Monitorar acesso fora do horário
        current_hour = datetime.now().hour
        if current_hour < 6 or current_hour > 22:  # Fora do horário comercial
            profile = self.user_profiles.get(user_id)
            if profile and current_hour not in profile.typical_login_times:
                return await self._create_security_event(
                    ThreatType.UNUSUAL_ACTIVITY,
                    ThreatLevel.LOW,
                    'internal',
                    user_id,
                    f"Acesso a dados fora do horário usual: {current_hour}h",
                    {
                        'table': table,
                        'operation': operation,
                        'hour': current_hour,
                        'typical_hours': profile.typical_login_times
                    },
                    [ResponseAction.LOG_ONLY, ResponseAction.ALERT_ADMIN]
                )
        
        return None
    
    async def _analyze_login_behavior(self, user_id: int, ip: str, user_agent: str, login_time: datetime):
        """Analisa comportamento de login"""
        profile = self.user_profiles.get(user_id)
        if not profile:
            profile = UserBehaviorProfile(user_id=user_id)
            self.user_profiles[user_id] = profile
        
        # Analisar horário
        hour = login_time.hour
        if hour not in profile.typical_login_times:
            if len(profile.typical_login_times) > 5:  # Só após ter dados suficientes
                profile.anomaly_score += 0.2
        
        profile.typical_login_times.append(hour)
        if len(profile.typical_login_times) > 24:  # Manter apenas últimas 24 horas
            profile.typical_login_times = profile.typical_login_times[-24:]
        
        # Analisar localização (IP)
        if ip not in profile.typical_locations:
            if len(profile.typical_locations) > 0:
                profile.anomaly_score += 0.3
        
        profile.typical_locations.add(ip)
        if len(profile.typical_locations) > 10:  # Limitar histórico
            profile.typical_locations = set(list(profile.typical_locations)[-10:])
        
        # Analisar dispositivo (User-Agent)
        device_hash = hashlib.md5(user_agent.encode()).hexdigest()[:8]
        if device_hash not in profile.typical_devices:
            if len(profile.typical_devices) > 0:
                profile.anomaly_score += 0.1
        
        profile.typical_devices.add(device_hash)
        if len(profile.typical_devices) > 5:
            profile.typical_devices = set(list(profile.typical_devices)[-5:])
        
        # Decaimento do score de anomalia
        profile.anomaly_score *= 0.95
        profile.last_updated = login_time
    
    async def _detect_malicious_patterns(self, ip: str, endpoint: str, payload: str, 
                                       user_id: Optional[int] = None) -> Optional[SecurityEvent]:
        """Detecta padrões maliciosos no payload"""
        payload_lower = payload.lower()
        
        # SQL Injection
        for pattern in self.suspicious_patterns['sql_injection']:
            if re.search(pattern, payload_lower, re.IGNORECASE):
                return await self._create_security_event(
                    ThreatType.SQL_INJECTION,
                    ThreatLevel.HIGH,
                    ip,
                    user_id,
                    f"Tentativa de SQL Injection detectada em {endpoint}",
                    {
                        'endpoint': endpoint,
                        'pattern_matched': pattern,
                        'payload_sample': payload[:200]
                    },
                    [ResponseAction.BLOCK_IP, ResponseAction.ALERT_ADMIN]
                )
        
        # XSS
        for pattern in self.suspicious_patterns['xss']:
            if re.search(pattern, payload, re.IGNORECASE):
                return await self._create_security_event(
                    ThreatType.XSS_ATTEMPT,
                    ThreatLevel.MEDIUM,
                    ip,
                    user_id,
                    f"Tentativa de XSS detectada em {endpoint}",
                    {
                        'endpoint': endpoint,
                        'pattern_matched': pattern,
                        'payload_sample': payload[:200]
                    },
                    [ResponseAction.BLOCK_IP, ResponseAction.ALERT_ADMIN]
                )
        
        # Path Traversal
        for pattern in self.suspicious_patterns['path_traversal']:
            if re.search(pattern, payload, re.IGNORECASE):
                return await self._create_security_event(
                    ThreatType.UNUSUAL_ACTIVITY,
                    ThreatLevel.MEDIUM,
                    ip,
                    user_id,
                    f"Tentativa de Path Traversal detectada em {endpoint}",
                    {
                        'endpoint': endpoint,
                        'pattern_matched': pattern,
                        'payload_sample': payload[:200]
                    },
                    [ResponseAction.BLOCK_IP, ResponseAction.ALERT_ADMIN]
                )
        
        return None
    
    async def _detect_privilege_escalation(self, user_id: int, action: str, 
                                         details: Dict[str, Any]) -> Optional[SecurityEvent]:
        """Detecta tentativas de escalação de privilégios"""
        # Verificar se usuário está tentando elevar privilégios
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Detectar mudanças suspeitas de role
        if action == 'role_change':
            old_role = details.get('old_role')
            new_role = details.get('new_role')
            
            # Hierarquia de roles (menor número = maior privilégio)
            role_hierarchy = {
                'admin': 1,
                'doctor': 2,
                'nurse': 3,
                'receptionist': 4,
                'user': 5
            }
            
            if (old_role in role_hierarchy and new_role in role_hierarchy and
                role_hierarchy[new_role] < role_hierarchy[old_role]):
                
                return await self._create_security_event(
                    ThreatType.PRIVILEGE_ESCALATION,
                    ThreatLevel.HIGH,
                    details.get('ip', 'internal'),
                    user_id,
                    f"Escalação de privilégios: {old_role} -> {new_role}",
                    {
                        'action': action,
                        'old_role': old_role,
                        'new_role': new_role,
                        'changed_by': details.get('changed_by')
                    },
                    [ResponseAction.ALERT_ADMIN, ResponseAction.REQUIRE_2FA]
                )
        
        return None
    
    async def _monitor_data_access(self, user_id: int, endpoint: str, method: str):
        """Monitora acesso a dados sensíveis"""
        profile = self.user_profiles.get(user_id)
        if not profile:
            profile = UserBehaviorProfile(user_id=user_id)
            self.user_profiles[user_id] = profile
        
        # Registrar ação
        action_key = f"{method}:{endpoint}"
        profile.typical_actions[action_key] = profile.typical_actions.get(action_key, 0) + 1
        
        # Detectar acesso incomum
        total_actions = sum(profile.typical_actions.values())
        if total_actions > 10:  # Só após ter dados suficientes
            action_frequency = profile.typical_actions[action_key] / total_actions
            if action_frequency < 0.01:  # Ação muito rara
                profile.anomaly_score += 0.1
    
    async def _update_user_profile(self, user_id: int, action: str, details: Dict[str, Any]):
        """Atualiza perfil comportamental do usuário"""
        profile = self.user_profiles.get(user_id)
        if not profile:
            profile = UserBehaviorProfile(user_id=user_id)
            self.user_profiles[user_id] = profile
        
        # Registrar ação
        profile.typical_actions[action] = profile.typical_actions.get(action, 0) + 1
        
        # Atualizar timestamp
        profile.last_updated = datetime.now()
        
        # Calcular score de anomalia baseado na raridade da ação
        total_actions = sum(profile.typical_actions.values())
        if total_actions > 20:  # Só após ter dados suficientes
            action_frequency = profile.typical_actions[action] / total_actions
            if action_frequency < 0.05:  # Ação rara
                profile.anomaly_score += 0.05
        
        # Decaimento do score
        profile.anomaly_score *= 0.98
    
    async def _create_security_event(self, threat_type: ThreatType, threat_level: ThreatLevel,
                                   source_ip: str, user_id: Optional[int], description: str,
                                   details: Dict[str, Any], response_actions: List[ResponseAction]) -> SecurityEvent:
        """Cria evento de segurança"""
        event_id = hashlib.sha256(f"{threat_type}_{source_ip}_{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        
        event = SecurityEvent(
            event_id=event_id,
            timestamp=datetime.now(),
            threat_type=threat_type,
            threat_level=threat_level,
            source_ip=source_ip,
            user_id=user_id,
            description=description,
            details=details,
            response_actions=response_actions
        )
        
        # Executar ações de resposta
        await self._execute_response_actions(event)
        
        # Registrar no audit log
        await self.audit_logger.log_event(
            EventType.SECURITY,
            EventSeverity.HIGH if threat_level in [ThreatLevel.HIGH, ThreatLevel.CRITICAL] else EventSeverity.MEDIUM,
            user_id,
            f"Ameaça detectada: {threat_type.value}",
            {
                'event_id': event_id,
                'threat_level': threat_level.value,
                'source_ip': source_ip,
                'details': details
            }
        )
        
        # Atualizar métricas
        self.security_metrics['total_events'] += 1
        self.security_metrics['events_by_type'][threat_type.value] += 1
        self.security_metrics['events_by_level'][threat_level.value] += 1
        
        return event
    
    async def _execute_response_actions(self, event: SecurityEvent):
        """Executa ações de resposta automática"""
        for action in event.response_actions:
            try:
                if action == ResponseAction.BLOCK_IP:
                    await self._block_ip(event.source_ip)
                
                elif action == ResponseAction.SUSPEND_USER and event.user_id:
                    await self._suspend_user(event.user_id)
                
                elif action == ResponseAction.FORCE_LOGOUT and event.user_id:
                    await self._force_logout_user(event.user_id)
                
                elif action == ResponseAction.RATE_LIMIT:
                    await self._apply_rate_limit(event.source_ip)
                
                elif action == ResponseAction.QUARANTINE_SESSION and event.session_id:
                    await self._quarantine_session(event.session_id)
                
                elif action == ResponseAction.ALERT_ADMIN:
                    await self._alert_administrators(event)
                
            except Exception as e:
                # Log erro na execução da ação
                await self.audit_logger.log_event(
                    EventType.SYSTEM,
                    EventSeverity.ERROR,
                    None,
                    f"Erro ao executar ação de resposta: {action.value}",
                    {'error': str(e), 'event_id': event.event_id}
                )
    
    async def _block_ip(self, ip: str):
        """Bloqueia IP"""
        self.blocked_ips.add(ip)
        self.security_metrics['blocked_attempts'] += 1
        
        # Aqui você integraria com firewall/proxy reverso
        # Por exemplo, adicionar regra no iptables ou nginx
    
    async def _suspend_user(self, user_id: int):
        """Suspende usuário"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_active = False
            self.db.commit()
    
    async def _force_logout_user(self, user_id: int):
        """Força logout do usuário"""
        await self.session_manager.terminate_all_user_sessions(user_id)
    
    async def _apply_rate_limit(self, ip: str):
        """Aplica rate limiting mais restritivo"""
        # Implementar rate limiting mais agressivo para este IP
        pass
    
    async def _quarantine_session(self, session_id: str):
        """Coloca sessão em quarentena"""
        session = self.db.query(UserSession).filter(UserSession.session_id == session_id).first()
        if session:
            session.is_blocked = True
            self.db.commit()
    
    async def _alert_administrators(self, event: SecurityEvent):
        """Alerta administradores"""
        # Implementar notificação (email, Slack, etc.)
        # Por enquanto, apenas log
        await self.audit_logger.log_event(
            EventType.ADMINISTRATIVE,
            EventSeverity.HIGH,
            None,
            f"Alerta de segurança: {event.threat_type.value}",
            {
                'event_id': event.event_id,
                'threat_level': event.threat_level.value,
                'description': event.description,
                'source_ip': event.source_ip
            }
        )
    
    def is_ip_blocked(self, ip: str) -> bool:
        """Verifica se IP está bloqueado"""
        return ip in self.blocked_ips
    
    def get_security_metrics(self) -> Dict[str, Any]:
        """Retorna métricas de segurança"""
        return {
            'total_events': self.security_metrics['total_events'],
            'events_by_type': dict(self.security_metrics['events_by_type']),
            'events_by_level': dict(self.security_metrics['events_by_level']),
            'blocked_ips_count': len(self.blocked_ips),
            'blocked_attempts': self.security_metrics['blocked_attempts'],
            'false_positives': self.security_metrics['false_positives'],
            'user_profiles_count': len(self.user_profiles),
            'active_monitoring': True
        }
    
    def get_user_risk_score(self, user_id: int) -> float:
        """Retorna score de risco do usuário"""
        profile = self.user_profiles.get(user_id)
        if not profile:
            return 0.0
        
        return min(profile.anomaly_score, 1.0)
    
    async def cleanup_old_data(self, days: int = 30):
        """Limpa dados antigos do monitor"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Limpar tentativas de login antigas
        for ip in list(self.failed_login_attempts.keys()):
            self.failed_login_attempts[ip] = deque(
                [t for t in self.failed_login_attempts[ip] if t > cutoff_date],
                maxlen=100
            )
            if not self.failed_login_attempts[ip]:
                del self.failed_login_attempts[ip]
        
        # Limpar contadores de requisição
        for ip in list(self.request_counts.keys()):
            self.request_counts[ip] = deque(
                [t for t in self.request_counts[ip] if t > cutoff_date],
                maxlen=1000
            )
            if not self.request_counts[ip]:
                del self.request_counts[ip]
        
        # Limpar perfis de usuário inativos
        for user_id in list(self.user_profiles.keys()):
            profile = self.user_profiles[user_id]
            if profile.last_updated < cutoff_date:
                del self.user_profiles[user_id]

# Classe para análise de logs de segurança
class SecurityAnalyzer:
    """Analisador de logs de segurança"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def analyze_security_trends(self, days: int = 30) -> Dict[str, Any]:
        """Analisa tendências de segurança"""
        start_date = datetime.now() - timedelta(days=days)
        
        # Buscar eventos de segurança
        security_logs = self.db.query(AuditLog).filter(
            and_(
                AuditLog.event_type == EventType.SECURITY,
                AuditLog.timestamp >= start_date
            )
        ).all()
        
        # Análise por tipo de evento
        events_by_type = defaultdict(int)
        events_by_day = defaultdict(int)
        events_by_hour = defaultdict(int)
        top_source_ips = defaultdict(int)
        
        for log in security_logs:
            # Extrair informações dos metadados
            metadata = log.metadata or {}
            
            # Contar por tipo
            threat_type = metadata.get('threat_type', 'unknown')
            events_by_type[threat_type] += 1
            
            # Contar por dia
            day_key = log.timestamp.strftime('%Y-%m-%d')
            events_by_day[day_key] += 1
            
            # Contar por hora
            hour_key = log.timestamp.hour
            events_by_hour[hour_key] += 1
            
            # Contar IPs
            source_ip = metadata.get('source_ip', 'unknown')
            top_source_ips[source_ip] += 1
        
        return {
            'total_events': len(security_logs),
            'events_by_type': dict(events_by_type),
            'events_by_day': dict(events_by_day),
            'events_by_hour': dict(events_by_hour),
            'top_source_ips': dict(sorted(top_source_ips.items(), key=lambda x: x[1], reverse=True)[:10]),
            'analysis_period': f"{days} days",
            'start_date': start_date.isoformat(),
            'end_date': datetime.now().isoformat()
        }
    
    def generate_security_report(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Gera relatório de segurança"""
        # Implementar geração de relatório detalhado
        pass

# Função utilitária para inicializar o monitor
def create_security_monitor(db: Session, config: SecurityConfig) -> SecurityMonitor:
    """Cria instância do monitor de segurança"""
    return SecurityMonitor(db, config)