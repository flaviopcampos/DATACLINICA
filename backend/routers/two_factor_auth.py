#!/usr/bin/env python3
"""
DataClínica - Endpoints de Autenticação Multifator (2FA)

Este módulo implementa os endpoints para configuração e uso de autenticação
de dois fatores (2FA) usando TOTP.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel
import logging

from database import get_db
from auth import get_current_user
from models import User
from two_factor_auth import two_factor_manager
from encryption import field_encryption

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/2fa",
    tags=["2FA - Autenticação Multifator"]
)

# Schemas Pydantic
class TwoFactorSetupResponse(BaseModel):
    """Resposta da configuração inicial do 2FA"""
    qr_code: str
    backup_codes: list[str]
    message: str

class TwoFactorVerifyRequest(BaseModel):
    """Requisição para verificar token 2FA"""
    token: str

class TwoFactorStatusResponse(BaseModel):
    """Resposta do status do 2FA"""
    enabled: bool
    configured: bool
    backup_codes_remaining: int
    last_used: str = None
    created_at: str = None

class TwoFactorDisableRequest(BaseModel):
    """Requisição para desabilitar 2FA"""
    password: str

@router.post("/setup", response_model=TwoFactorSetupResponse)
async def setup_2fa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Configura 2FA para o usuário atual.
    
    Gera uma chave secreta, códigos de backup e QR code para configuração
    no aplicativo autenticador.
    """
    try:
        logger.info(f"Configurando 2FA para usuário {current_user.id}")
        
        result = two_factor_manager.setup_2fa(db, current_user.id)
        
        return TwoFactorSetupResponse(
            qr_code=result["qr_code"],
            backup_codes=result["backup_codes"],
            message="2FA configurado com sucesso. Escaneie o QR code com seu aplicativo autenticador e guarde os códigos de backup em local seguro."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao configurar 2FA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao configurar 2FA"
        )

@router.post("/verify")
async def verify_2fa(
    request: TwoFactorVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verifica o token 2FA e habilita a autenticação multifator.
    
    Este endpoint deve ser chamado após a configuração inicial para
    confirmar que o usuário consegue gerar tokens válidos.
    """
    try:
        logger.info(f"Verificando token 2FA para usuário {current_user.id}")
        
        success = two_factor_manager.verify_and_enable_2fa(
            db, current_user.id, request.token
        )
        
        if success:
            return {
                "message": "2FA habilitado com sucesso!",
                "enabled": True
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao verificar 2FA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao verificar 2FA"
        )

@router.get("/status", response_model=TwoFactorStatusResponse)
async def get_2fa_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna o status atual do 2FA para o usuário.
    
    Inclui informações sobre se está habilitado, configurado,
    códigos de backup restantes, etc.
    """
    try:
        logger.info(f"Consultando status 2FA para usuário {current_user.id}")
        
        status_info = two_factor_manager.get_2fa_status(db, current_user.id)
        
        return TwoFactorStatusResponse(
            enabled=status_info["enabled"],
            configured=status_info["configured"],
            backup_codes_remaining=status_info["backup_codes_remaining"],
            last_used=status_info.get("last_used").isoformat() if status_info.get("last_used") else None,
            created_at=status_info.get("created_at").isoformat() if status_info.get("created_at") else None
        )
        
    except Exception as e:
        logger.error(f"Erro ao consultar status 2FA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao consultar status 2FA"
        )

@router.post("/disable")
async def disable_2fa(
    request: TwoFactorDisableRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Desabilita 2FA para o usuário atual.
    
    Requer confirmação da senha atual por segurança.
    """
    try:
        logger.info(f"Desabilitando 2FA para usuário {current_user.id}")
        
        success = two_factor_manager.disable_2fa(
            db, current_user.id, request.password
        )
        
        if success:
            return {
                "message": "2FA desabilitado com sucesso",
                "enabled": False
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Falha ao desabilitar 2FA"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao desabilitar 2FA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao desabilitar 2FA"
        )

@router.post("/verify-login")
async def verify_2fa_login(
    request: TwoFactorVerifyRequest,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Verifica token 2FA durante o processo de login.
    
    Este endpoint é usado internamente pelo sistema de autenticação
    e não deve ser chamado diretamente pelos usuários.
    """
    try:
        logger.info(f"Verificando 2FA no login para usuário {user_id}")
        
        is_valid = two_factor_manager.verify_2fa_login(
            db, user_id, request.token
        )
        
        return {
            "valid": is_valid,
            "message": "Token válido" if is_valid else "Token inválido"
        }
        
    except Exception as e:
        logger.error(f"Erro ao verificar 2FA no login: {e}")
        return {
            "valid": False,
            "message": "Erro interno na verificação"
        }

@router.get("/backup-codes")
async def get_backup_codes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna os códigos de backup restantes para o usuário.
    
    ATENÇÃO: Este endpoint deve ser usado com cuidado pois expõe
    códigos de backup válidos.
    """
    try:
        from models import TwoFactorAuth
        
        logger.info(f"Consultando códigos de backup para usuário {current_user.id}")
        
        two_factor_auth = db.query(TwoFactorAuth).filter(
            TwoFactorAuth.user_id == current_user.id,
            TwoFactorAuth.is_enabled == True
        ).first()
        
        if not two_factor_auth:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="2FA não configurado ou não habilitado"
            )
        
        return {
            "backup_codes": two_factor_auth.backup_codes,
            "remaining": len(two_factor_auth.backup_codes),
            "message": "Guarde estes códigos em local seguro. Cada código pode ser usado apenas uma vez."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao consultar códigos de backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao consultar códigos de backup"
        )

@router.post("/regenerate-backup-codes")
async def regenerate_backup_codes(
    request: TwoFactorDisableRequest,  # Reutiliza schema que pede senha
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Regenera códigos de backup para o usuário.
    
    Requer confirmação da senha atual por segurança.
    Os códigos antigos são invalidados.
    """
    try:
        from auth import verify_password
        from models import TwoFactorAuth
        
        logger.info(f"Regenerando códigos de backup para usuário {current_user.id}")
        
        # Verificar senha
        if not verify_password(request.password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Senha incorreta"
            )
        
        # Buscar configuração 2FA
        two_factor_auth = db.query(TwoFactorAuth).filter(
            TwoFactorAuth.user_id == current_user.id,
            TwoFactorAuth.is_enabled == True
        ).first()
        
        if not two_factor_auth:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="2FA não configurado ou não habilitado"
            )
        
        # Gerar novos códigos
        new_backup_codes = two_factor_manager.generate_backup_codes()
        two_factor_auth.backup_codes = new_backup_codes
        
        db.commit()
        
        return {
            "backup_codes": new_backup_codes,
            "message": "Novos códigos de backup gerados com sucesso. Os códigos antigos foram invalidados."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao regenerar códigos de backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao regenerar códigos de backup"
        )