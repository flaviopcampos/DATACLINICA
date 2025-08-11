#!/usr/bin/env python3
"""
DataClínica - Endpoints para APIs Externas

Endpoints para integração com:
- ViaCEP (Validação de endereços)
- Memed (Prescrição médica)
- ClickSign (Assinatura digital)
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from external_apis import (
    external_api_manager,
    AddressResponse,
    MemedPrescription,
    ClickSignDocument
)
from auth import get_current_user
from models import User

# Configurar logging
logger = logging.getLogger(__name__)

# Router para APIs externas
router = APIRouter(
    prefix="/external-apis",
    tags=["APIs Externas"],
    dependencies=[Depends(get_current_user)]
)

# =============================================================================
# MODELOS PYDANTIC PARA REQUESTS/RESPONSES
# =============================================================================

class CEPRequest(BaseModel):
    """Request para validação de CEP"""
    cep: str = Field(..., description="CEP para validação", example="01310-100")

class CEPValidationResponse(BaseModel):
    """Response para validação de CEP"""
    valid: bool
    address: Optional[AddressResponse] = None
    message: str

class PrescriptionRequest(BaseModel):
    """Request para criação de prescrição"""
    patient_name: str = Field(..., description="Nome do paciente")
    patient_cpf: str = Field(..., description="CPF do paciente")
    medications: List[Dict[str, Any]] = Field(..., description="Lista de medicamentos")
    doctor_crm: str = Field(..., description="CRM do médico")
    doctor_name: str = Field(..., description="Nome do médico")
    clinic_name: str = Field(..., description="Nome da clínica")

class PrescriptionResponse(BaseModel):
    """Response para criação de prescrição"""
    success: bool
    prescription_id: Optional[str] = None
    prescription_url: Optional[str] = None
    message: str

class DocumentRequest(BaseModel):
    """Request para criação de documento"""
    document_name: str = Field(..., description="Nome do documento")
    signers: List[Dict[str, str]] = Field(..., description="Lista de signatários")
    content_base64: str = Field(..., description="Conteúdo do documento em base64")
    auto_close: bool = Field(True, description="Fechar automaticamente após assinatura")

class DocumentResponse(BaseModel):
    """Response para criação de documento"""
    success: bool
    document_key: Optional[str] = None
    document_url: Optional[str] = None
    message: str

class HealthCheckResponse(BaseModel):
    """Response para health check das APIs"""
    status: str
    apis: Dict[str, bool]
    timestamp: datetime

# =============================================================================
# ENDPOINTS PARA VIACEP
# =============================================================================

@router.post(
    "/cep/validate",
    response_model=CEPValidationResponse,
    summary="Validar CEP",
    description="Valida um CEP e retorna o endereço correspondente"
)
async def validate_cep(
    request: CEPRequest,
    current_user: User = Depends(get_current_user)
):
    """Valida um CEP usando a API ViaCEP"""
    try:
        logger.info(f"Usuário {current_user.email} validando CEP: {request.cep}")
        
        address = await external_api_manager.viacep.get_address_by_cep(request.cep)
        
        if address:
            return CEPValidationResponse(
                valid=True,
                address=address,
                message="CEP válido e endereço encontrado"
            )
        else:
            return CEPValidationResponse(
                valid=False,
                address=None,
                message="CEP não encontrado ou inválido"
            )
            
    except Exception as e:
        logger.error(f"Erro ao validar CEP {request.cep}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao validar CEP"
        )

@router.get(
    "/cep/{cep}",
    response_model=AddressResponse,
    summary="Buscar endereço por CEP",
    description="Busca o endereço completo de um CEP"
)
async def get_address_by_cep(
    cep: str,
    current_user: User = Depends(get_current_user)
):
    """Busca endereço por CEP"""
    try:
        logger.info(f"Usuário {current_user.email} buscando endereço para CEP: {cep}")
        
        address = await external_api_manager.viacep.get_address_by_cep(cep)
        
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CEP não encontrado"
            )
        
        return address
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar endereço para CEP {cep}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao buscar endereço"
        )

# =============================================================================
# ENDPOINTS PARA MEMED
# =============================================================================

@router.post(
    "/memed/prescription",
    response_model=PrescriptionResponse,
    summary="Criar prescrição médica",
    description="Cria uma prescrição médica digital usando a API Memed"
)
async def create_prescription(
    request: PrescriptionRequest,
    current_user: User = Depends(get_current_user)
):
    """Cria uma prescrição médica digital"""
    try:
        logger.info(f"Usuário {current_user.email} criando prescrição para paciente: {request.patient_name}")
        
        # Criar objeto de prescrição
        prescription = MemedPrescription(
            patient_name=request.patient_name,
            patient_cpf=request.patient_cpf,
            medications=request.medications,
            doctor_crm=request.doctor_crm,
            doctor_name=request.doctor_name,
            clinic_name=request.clinic_name,
            prescription_date=datetime.now()
        )
        
        # Criar prescrição via API
        result = await external_api_manager.memed.create_prescription(prescription)
        
        if result:
            return PrescriptionResponse(
                success=True,
                prescription_id=result.get("id"),
                prescription_url=result.get("url"),
                message="Prescrição criada com sucesso"
            )
        else:
            return PrescriptionResponse(
                success=False,
                message="Erro ao criar prescrição. Verifique as configurações da API Memed."
            )
            
    except Exception as e:
        logger.error(f"Erro ao criar prescrição: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao criar prescrição"
        )

@router.get(
    "/memed/prescription/{prescription_id}",
    summary="Buscar prescrição",
    description="Busca uma prescrição médica por ID"
)
async def get_prescription(
    prescription_id: str,
    current_user: User = Depends(get_current_user)
):
    """Busca uma prescrição por ID"""
    try:
        logger.info(f"Usuário {current_user.email} buscando prescrição: {prescription_id}")
        
        result = await external_api_manager.memed.get_prescription(prescription_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prescrição não encontrada"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar prescrição {prescription_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao buscar prescrição"
        )

# =============================================================================
# ENDPOINTS PARA CLICKSIGN
# =============================================================================

@router.post(
    "/clicksign/document",
    response_model=DocumentResponse,
    summary="Criar documento para assinatura",
    description="Cria um documento para assinatura digital usando ClickSign"
)
async def create_document(
    request: DocumentRequest,
    current_user: User = Depends(get_current_user)
):
    """Cria um documento para assinatura digital"""
    try:
        logger.info(f"Usuário {current_user.email} criando documento: {request.document_name}")
        
        # Gerar chave única para o documento
        document_key = f"doc_{int(datetime.now().timestamp())}_{current_user.id}"
        
        # Criar objeto de documento
        document = ClickSignDocument(
            document_key=document_key,
            document_name=request.document_name,
            signers=request.signers,
            content_base64=request.content_base64,
            auto_close=request.auto_close
        )
        
        # Criar documento via API
        result = await external_api_manager.clicksign.create_document(document)
        
        if result:
            # Adicionar signatários
            for signer in request.signers:
                await external_api_manager.clicksign.add_signer(
                    document_key=result.get("document", {}).get("key", document_key),
                    signer_email=signer.get("email"),
                    signer_name=signer.get("name")
                )
            
            return DocumentResponse(
                success=True,
                document_key=result.get("document", {}).get("key"),
                document_url=result.get("document", {}).get("downloads", {}).get("original_file_url"),
                message="Documento criado com sucesso"
            )
        else:
            return DocumentResponse(
                success=False,
                message="Erro ao criar documento. Verifique as configurações da API ClickSign."
            )
            
    except Exception as e:
        logger.error(f"Erro ao criar documento: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao criar documento"
        )

@router.get(
    "/clicksign/document/{document_key}/status",
    summary="Verificar status do documento",
    description="Verifica o status de assinatura de um documento"
)
async def get_document_status(
    document_key: str,
    current_user: User = Depends(get_current_user)
):
    """Verifica o status de um documento"""
    try:
        logger.info(f"Usuário {current_user.email} verificando status do documento: {document_key}")
        
        result = await external_api_manager.clicksign.get_document_status(document_key)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documento não encontrado"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao verificar status do documento {document_key}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao verificar status do documento"
        )

# =============================================================================
# ENDPOINT PARA HEALTH CHECK
# =============================================================================

@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health check das APIs externas",
    description="Verifica a saúde de todas as APIs externas"
)
async def health_check(
    current_user: User = Depends(get_current_user)
):
    """Verifica a saúde de todas as APIs externas"""
    try:
        logger.info(f"Usuário {current_user.email} verificando health das APIs externas")
        
        apis_status = await external_api_manager.health_check()
        
        # Determinar status geral
        all_healthy = all(apis_status.values())
        status_text = "healthy" if all_healthy else "degraded"
        
        return HealthCheckResponse(
            status=status_text,
            apis=apis_status,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Erro ao verificar health das APIs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao verificar health das APIs"
        )

# =============================================================================
# ENDPOINT PARA CONFIGURAÇÕES
# =============================================================================

@router.get(
    "/config",
    summary="Configurações das APIs externas",
    description="Retorna o status de configuração das APIs externas"
)
async def get_api_config(
    current_user: User = Depends(get_current_user)
):
    """Retorna configurações das APIs externas"""
    try:
        logger.info(f"Usuário {current_user.email} consultando configurações das APIs")
        
        config = {
            "viacep": {
                "configured": True,
                "base_url": external_api_manager.viacep.base_url,
                "description": "API para validação de CEP e endereços"
            },
            "memed": {
                "configured": bool(external_api_manager.memed.api_key),
                "base_url": external_api_manager.memed.base_url,
                "sandbox": external_api_manager.memed.sandbox,
                "description": "API para prescrição médica digital"
            },
            "clicksign": {
                "configured": bool(external_api_manager.clicksign.api_key),
                "base_url": external_api_manager.clicksign.base_url,
                "sandbox": external_api_manager.clicksign.sandbox,
                "description": "API para assinatura digital de documentos"
            }
        }
        
        return config
        
    except Exception as e:
        logger.error(f"Erro ao consultar configurações das APIs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao consultar configurações"
        )