#!/usr/bin/env python3
"""
DataClínica - Configurações de Segurança

Este módulo centraliza todas as configurações de segurança do sistema,
incluindo políticas de senha, sessão, autenticação, criptografia e auditoria.
"""

import os
from datetime import timedelta
from typing import Dict, List, Optional
from pydantic import BaseSettings, Field, validator
from enum import Enum

class SecurityLevel(str, Enum):
    """Níveis de segurança do sistema"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PasswordPolicy(BaseSettings):
    """Configurações de política de senhas"""
    min_length: int = Field(default=8, ge=6, le=128)
    max_length: int = Field(default=128, ge=8, le=256)
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = True
    special_chars: str = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    max_repeated_chars: int = Field(default=3, ge=1, le=10)
    min_unique_chars: int = Field(default=6, ge=4, le=20)
    password_history_count: int = Field(default=12, ge=0, le=50)
    password_expiry_days: int = Field(default=90, ge=0, le=365)
    password_warning_days: int = Field(default=7, ge=0, le=30)
    max_login_attempts: int = Field(default=5, ge=1, le=20)
    lockout_duration_minutes: int = Field(default=30, ge=1, le=1440)
    
    @validator('max_length')
    def validate_max_length(cls, v, values):
        if 'min_length' in values and v < values['min_length']:
            raise ValueError('max_length deve ser maior que min_length')
        return v
    
    class Config:
        env_prefix = "PASSWORD_"

class SessionPolicy(BaseSettings):
    """Configurações de política de sessões"""
    max_session_duration: timedelta = Field(default=timedelta(hours=8))
    idle_timeout: timedelta = Field(default=timedelta(minutes=30))
    max_concurrent_sessions: int = Field(default=3, ge=1, le=10)
    session_rotation_interval: timedelta = Field(default=timedelta(hours=1))
    require_session_validation: bool = True
    track_session_activity: bool = True
    detect_suspicious_activity: bool = True
    block_concurrent_logins: bool = False
    remember_me_duration: timedelta = Field(default=timedelta(days=30))
    secure_cookies: bool = True
    httponly_cookies: bool = True
    samesite_cookies: str = "Strict"
    
    class Config:
        env_prefix = "SESSION_"

class TwoFactorPolicy(BaseSettings):
    """Configurações de autenticação de dois fatores"""
    enabled: bool = Field(default=True)
    mandatory_for_admins: bool = Field(default=True)
    mandatory_for_doctors: bool = Field(default=False)
    totp_issuer: str = Field(default="DataClínica")
    totp_digits: int = Field(default=6, ge=6, le=8)
    totp_period: int = Field(default=30, ge=15, le=300)
    backup_codes_count: int = Field(default=10, ge=5, le=20)
    max_verification_attempts: int = Field(default=3, ge=1, le=10)
    verification_window: int = Field(default=1, ge=0, le=5)  # Janelas de tempo aceitas
    
    class Config:
        env_prefix = "2FA_"

class EncryptionPolicy(BaseSettings):
    """Configurações de criptografia"""
    algorithm: str = Field(default="AES-256-GCM")
    key_rotation_days: int = Field(default=90, ge=30, le=365)
    encrypt_sensitive_fields: bool = True
    encrypt_files: bool = True
    encrypt_backups: bool = True
    hash_algorithm: str = Field(default="SHA-256")
    salt_rounds: int = Field(default=12, ge=10, le=16)
    
    # Campos que devem ser criptografados
    sensitive_fields: List[str] = Field(default=[
        "cpf", "rg", "passport", "social_security",
        "phone", "email", "address", "medical_record",
        "prescription", "diagnosis", "treatment",
        "payment_info", "bank_account", "credit_card"
    ])
    
    class Config:
        env_prefix = "ENCRYPTION_"

class AuditPolicy(BaseSettings):
    """Configurações de auditoria"""
    enabled: bool = True
    log_all_actions: bool = True
    log_failed_attempts: bool = True
    log_sensitive_data_access: bool = True
    log_admin_actions: bool = True
    log_data_changes: bool = True
    log_file_access: bool = True
    retention_days: int = Field(default=2555, ge=30, le=3650)  # 7 anos
    max_log_size_mb: int = Field(default=100, ge=10, le=1000)
    compress_old_logs: bool = True
    encrypt_logs: bool = True
    
    # Eventos que sempre devem ser auditados
    critical_events: List[str] = Field(default=[
        "login", "logout", "password_change", "2fa_setup",
        "admin_action", "data_export", "backup_restore",
        "user_creation", "user_deletion", "permission_change",
        "system_config_change", "security_violation"
    ])
    
    class Config:
        env_prefix = "AUDIT_"

class AccessControlPolicy(BaseSettings):
    """Configurações de controle de acesso"""
    enable_rbac: bool = True  # Role-Based Access Control
    enable_abac: bool = False  # Attribute-Based Access Control
    default_role: str = "user"
    admin_roles: List[str] = Field(default=["admin", "super_admin"])
    doctor_roles: List[str] = Field(default=["doctor", "specialist"])
    staff_roles: List[str] = Field(default=["nurse", "receptionist", "technician"])
    
    # Permissões por recurso
    resource_permissions: Dict[str, List[str]] = Field(default={
        "patients": ["create", "read", "update", "delete", "export"],
        "medical_records": ["create", "read", "update", "delete", "export"],
        "prescriptions": ["create", "read", "update", "delete", "export"],
        "reports": ["create", "read", "update", "delete", "export"],
        "users": ["create", "read", "update", "delete"],
        "system": ["configure", "backup", "restore", "audit"]
    })
    
    class Config:
        env_prefix = "ACCESS_"

class NetworkPolicy(BaseSettings):
    """Configurações de segurança de rede"""
    allowed_ips: List[str] = Field(default=[])
    blocked_ips: List[str] = Field(default=[])
    rate_limit_requests: int = Field(default=100, ge=10, le=10000)
    rate_limit_window: int = Field(default=60, ge=1, le=3600)  # segundos
    enable_cors: bool = True
    cors_origins: List[str] = Field(default=["http://localhost:3000"])
    enable_csrf_protection: bool = True
    max_request_size_mb: int = Field(default=10, ge=1, le=100)
    enable_ssl_redirect: bool = True
    hsts_max_age: int = Field(default=31536000)  # 1 ano
    
    class Config:
        env_prefix = "NETWORK_"

class CompliancePolicy(BaseSettings):
    """Configurações de compliance (LGPD, HIPAA, etc.)"""
    enable_lgpd: bool = True
    enable_hipaa: bool = False
    data_retention_days: int = Field(default=2555, ge=365, le=3650)  # 7 anos
    anonymization_delay_days: int = Field(default=30, ge=1, le=365)
    consent_required: bool = True
    consent_expiry_days: int = Field(default=365, ge=30, le=1095)
    right_to_be_forgotten: bool = True
    data_portability: bool = True
    breach_notification_hours: int = Field(default=72, ge=1, le=168)
    
    # Campos considerados dados pessoais sensíveis
    sensitive_personal_data: List[str] = Field(default=[
        "cpf", "rg", "passport", "biometric_data",
        "health_data", "genetic_data", "medical_history",
        "mental_health", "sexual_orientation", "political_opinion",
        "religious_belief", "trade_union_membership"
    ])
    
    class Config:
        env_prefix = "COMPLIANCE_"

class SecurityConfig(BaseSettings):
    """Configuração principal de segurança"""
    security_level: SecurityLevel = SecurityLevel.HIGH
    environment: str = Field(default="production")
    debug_mode: bool = Field(default=False)
    
    # Políticas de segurança
    password: PasswordPolicy = PasswordPolicy()
    session: SessionPolicy = SessionPolicy()
    two_factor: TwoFactorPolicy = TwoFactorPolicy()
    encryption: EncryptionPolicy = EncryptionPolicy()
    audit: AuditPolicy = AuditPolicy()
    access_control: AccessControlPolicy = AccessControlPolicy()
    network: NetworkPolicy = NetworkPolicy()
    compliance: CompliancePolicy = CompliancePolicy()
    
    # Configurações específicas por ambiente
    @validator('debug_mode')
    def validate_debug_mode(cls, v, values):
        if values.get('environment') == 'production' and v:
            raise ValueError('Debug mode não pode estar ativo em produção')
        return v
    
    def get_security_headers(self) -> Dict[str, str]:
        """Retorna cabeçalhos de segurança HTTP"""
        headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
        
        if self.network.enable_ssl_redirect:
            headers["Strict-Transport-Security"] = f"max-age={self.network.hsts_max_age}; includeSubDomains"
        
        return headers
    
    def is_sensitive_field(self, field_name: str) -> bool:
        """Verifica se um campo é considerado sensível"""
        return (
            field_name.lower() in [f.lower() for f in self.encryption.sensitive_fields] or
            field_name.lower() in [f.lower() for f in self.compliance.sensitive_personal_data]
        )
    
    def get_password_requirements(self) -> Dict[str, any]:
        """Retorna os requisitos de senha em formato legível"""
        requirements = []
        
        if self.password.require_uppercase:
            requirements.append("pelo menos uma letra maiúscula")
        if self.password.require_lowercase:
            requirements.append("pelo menos uma letra minúscula")
        if self.password.require_numbers:
            requirements.append("pelo menos um número")
        if self.password.require_special_chars:
            requirements.append(f"pelo menos um caractere especial ({self.password.special_chars})")
        
        return {
            "min_length": self.password.min_length,
            "max_length": self.password.max_length,
            "requirements": requirements,
            "max_repeated_chars": self.password.max_repeated_chars,
            "min_unique_chars": self.password.min_unique_chars,
            "expiry_days": self.password.password_expiry_days,
            "history_count": self.password.password_history_count
        }
    
    def should_audit_event(self, event_type: str) -> bool:
        """Verifica se um evento deve ser auditado"""
        if not self.audit.enabled:
            return False
        
        if event_type.lower() in [e.lower() for e in self.audit.critical_events]:
            return True
        
        return self.audit.log_all_actions
    
    def get_allowed_file_types(self) -> List[str]:
        """Retorna tipos de arquivo permitidos para upload"""
        return [
            # Documentos
            ".pdf", ".doc", ".docx", ".txt", ".rtf",
            # Imagens
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff",
            # Planilhas
            ".xls", ".xlsx", ".csv",
            # Outros
            ".zip", ".rar"
        ]
    
    def get_max_file_size_mb(self) -> int:
        """Retorna tamanho máximo de arquivo em MB"""
        return self.network.max_request_size_mb
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Instância global da configuração
security_config = SecurityConfig()

# Funções utilitárias

def get_security_config() -> SecurityConfig:
    """Retorna a configuração de segurança"""
    return security_config

def is_production() -> bool:
    """Verifica se está em ambiente de produção"""
    return security_config.environment.lower() == "production"

def is_debug_enabled() -> bool:
    """Verifica se o modo debug está ativo"""
    return security_config.debug_mode and not is_production()

def get_security_level() -> SecurityLevel:
    """Retorna o nível de segurança atual"""
    return security_config.security_level

def validate_password_strength(password: str) -> Dict[str, any]:
    """Valida a força de uma senha"""
    config = security_config.password
    errors = []
    score = 0
    
    # Verificar comprimento
    if len(password) < config.min_length:
        errors.append(f"Senha deve ter pelo menos {config.min_length} caracteres")
    elif len(password) >= config.min_length:
        score += 1
    
    if len(password) > config.max_length:
        errors.append(f"Senha deve ter no máximo {config.max_length} caracteres")
    
    # Verificar requisitos
    if config.require_uppercase and not any(c.isupper() for c in password):
        errors.append("Senha deve conter pelo menos uma letra maiúscula")
    elif config.require_uppercase and any(c.isupper() for c in password):
        score += 1
    
    if config.require_lowercase and not any(c.islower() for c in password):
        errors.append("Senha deve conter pelo menos uma letra minúscula")
    elif config.require_lowercase and any(c.islower() for c in password):
        score += 1
    
    if config.require_numbers and not any(c.isdigit() for c in password):
        errors.append("Senha deve conter pelo menos um número")
    elif config.require_numbers and any(c.isdigit() for c in password):
        score += 1
    
    if config.require_special_chars and not any(c in config.special_chars for c in password):
        errors.append(f"Senha deve conter pelo menos um caractere especial: {config.special_chars}")
    elif config.require_special_chars and any(c in config.special_chars for c in password):
        score += 1
    
    # Verificar caracteres repetidos
    max_repeated = max((len(list(group)) for char, group in __import__('itertools').groupby(password)), default=0)
    if max_repeated > config.max_repeated_chars:
        errors.append(f"Senha não pode ter mais de {config.max_repeated_chars} caracteres repetidos consecutivos")
    
    # Verificar caracteres únicos
    unique_chars = len(set(password))
    if unique_chars < config.min_unique_chars:
        errors.append(f"Senha deve ter pelo menos {config.min_unique_chars} caracteres únicos")
    
    # Calcular força
    strength = "weak"
    if score >= 4 and len(errors) == 0:
        if len(password) >= 12 and unique_chars >= 8:
            strength = "very_strong"
        elif len(password) >= 10 and unique_chars >= 6:
            strength = "strong"
        else:
            strength = "medium"
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "strength": strength,
        "score": score,
        "requirements_met": score,
        "total_requirements": 4 if all([
            config.require_uppercase,
            config.require_lowercase,
            config.require_numbers,
            config.require_special_chars
        ]) else sum([
            config.require_uppercase,
            config.require_lowercase,
            config.require_numbers,
            config.require_special_chars
        ])
    }

def get_session_timeout() -> int:
    """Retorna timeout de sessão em segundos"""
    return int(security_config.session.idle_timeout.total_seconds())

def should_require_2fa(user_role: str) -> bool:
    """Verifica se 2FA é obrigatório para um papel"""
    if not security_config.two_factor.enabled:
        return False
    
    if user_role.lower() in ["admin", "super_admin"] and security_config.two_factor.mandatory_for_admins:
        return True
    
    if user_role.lower() in ["doctor", "specialist"] and security_config.two_factor.mandatory_for_doctors:
        return True
    
    return False

def get_rate_limit() -> tuple:
    """Retorna configuração de rate limiting (requests, window_seconds)"""
    return (security_config.network.rate_limit_requests, security_config.network.rate_limit_window)

def is_ip_allowed(ip_address: str) -> bool:
    """Verifica se um IP é permitido"""
    if ip_address in security_config.network.blocked_ips:
        return False
    
    if security_config.network.allowed_ips:
        return ip_address in security_config.network.allowed_ips
    
    return True