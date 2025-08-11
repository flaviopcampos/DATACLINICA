#!/usr/bin/env python3
"""
DataClínica - Integração com APIs Externas

Este módulo gerencia a integração com APIs externas:
- Memed (Prescrição Médica)
- ClickSign (Assinatura Digital)
- ViaCEP (Validação de Endereço)
"""

import httpx
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import logging
from pydantic import BaseModel

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============================================================================
# MODELOS PYDANTIC PARA APIS EXTERNAS
# =============================================================================

class AddressResponse(BaseModel):
    """Modelo para resposta da API ViaCEP"""
    cep: str
    logradouro: str
    complemento: str
    bairro: str
    localidade: str
    uf: str
    ibge: str
    gia: str
    ddd: str
    siafi: str
    erro: Optional[bool] = None

class MemedPrescription(BaseModel):
    """Modelo para prescrição Memed"""
    patient_name: str
    patient_cpf: str
    medications: List[Dict[str, Any]]
    doctor_crm: str
    doctor_name: str
    clinic_name: str
    prescription_date: datetime

class ClickSignDocument(BaseModel):
    """Modelo para documento ClickSign"""
    document_key: str
    document_name: str
    signers: List[Dict[str, str]]
    content_base64: Optional[str] = None
    auto_close: bool = True
    locale: str = "pt-BR"

# =============================================================================
# CLASSE PARA INTEGRAÇÃO COM VIACEP
# =============================================================================

class ViaCEPAPI:
    """Cliente para API ViaCEP - Validação de endereços"""
    
    def __init__(self):
        self.base_url = os.getenv("VIACEP_API_URL", "https://viacep.com.br/ws")
        self.timeout = 10.0
    
    async def get_address_by_cep(self, cep: str) -> Optional[AddressResponse]:
        """Busca endereço por CEP"""
        try:
            # Limpar CEP (remover caracteres especiais)
            clean_cep = ''.join(filter(str.isdigit, cep))
            
            if len(clean_cep) != 8:
                logger.error(f"CEP inválido: {cep}")
                return None
            
            url = f"{self.base_url}/{clean_cep}/json/"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                data = response.json()
                
                if data.get('erro'):
                    logger.warning(f"CEP não encontrado: {cep}")
                    return None
                
                return AddressResponse(**data)
                
        except httpx.TimeoutException:
            logger.error(f"Timeout ao consultar CEP: {cep}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro HTTP ao consultar CEP {cep}: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao consultar CEP {cep}: {e}")
            return None
    
    async def validate_cep(self, cep: str) -> bool:
        """Valida se um CEP existe"""
        address = await self.get_address_by_cep(cep)
        return address is not None

# =============================================================================
# CLASSE PARA INTEGRAÇÃO COM MEMED
# =============================================================================

class MemedAPI:
    """Cliente para API Memed - Prescrição médica digital"""
    
    def __init__(self):
        self.api_key = os.getenv("MEMED_API_KEY")
        self.base_url = os.getenv("MEMED_API_URL", "https://api.memed.com.br")
        self.sandbox = os.getenv("MEMED_SANDBOX", "true").lower() == "true"
        self.timeout = 30.0
        
        if not self.api_key:
            logger.warning("MEMED_API_KEY não configurada")
    
    async def create_prescription(self, prescription: MemedPrescription) -> Optional[Dict[str, Any]]:
        """Cria uma prescrição médica"""
        if not self.api_key:
            logger.error("API Key do Memed não configurada")
            return None
        
        try:
            url = f"{self.base_url}/v1/prescriptions"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "patient": {
                    "name": prescription.patient_name,
                    "cpf": prescription.patient_cpf
                },
                "doctor": {
                    "crm": prescription.doctor_crm,
                    "name": prescription.doctor_name
                },
                "clinic": {
                    "name": prescription.clinic_name
                },
                "medications": prescription.medications,
                "date": prescription.prescription_date.isoformat(),
                "sandbox": self.sandbox
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Prescrição criada com sucesso: {result.get('id')}")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro HTTP ao criar prescrição: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao criar prescrição: {e}")
            return None
    
    async def get_prescription(self, prescription_id: str) -> Optional[Dict[str, Any]]:
        """Busca uma prescrição por ID"""
        if not self.api_key:
            logger.error("API Key do Memed não configurada")
            return None
        
        try:
            url = f"{self.base_url}/v1/prescriptions/{prescription_id}"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro HTTP ao buscar prescrição {prescription_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao buscar prescrição {prescription_id}: {e}")
            return None

# =============================================================================
# CLASSE PARA INTEGRAÇÃO COM CLICKSIGN
# =============================================================================

class ClickSignAPI:
    """Cliente para API ClickSign - Assinatura digital"""
    
    def __init__(self):
        self.api_key = os.getenv("CLICKSIGN_API_KEY")
        self.base_url = os.getenv("CLICKSIGN_API_URL", "https://api.clicksign.com")
        self.sandbox = os.getenv("CLICKSIGN_SANDBOX", "true").lower() == "true"
        self.timeout = 30.0
        
        if not self.api_key:
            logger.warning("CLICKSIGN_API_KEY não configurada")
    
    async def create_document(self, document: ClickSignDocument) -> Optional[Dict[str, Any]]:
        """Cria um documento para assinatura"""
        if not self.api_key:
            logger.error("API Key do ClickSign não configurada")
            return None
        
        try:
            url = f"{self.base_url}/v1/documents"
            
            headers = {
                "Authorization": self.api_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "document": {
                    "path": f"/{document.document_key}.pdf",
                    "content_base64": document.content_base64,
                    "deadline_at": (datetime.now().replace(hour=23, minute=59, second=59) 
                                   + timedelta(days=30)).isoformat(),
                    "auto_close": document.auto_close,
                    "locale": document.locale
                }
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Documento criado com sucesso: {result.get('document', {}).get('key')}")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro HTTP ao criar documento: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao criar documento: {e}")
            return None
    
    async def add_signer(self, document_key: str, signer_email: str, signer_name: str) -> Optional[Dict[str, Any]]:
        """Adiciona um signatário ao documento"""
        if not self.api_key:
            logger.error("API Key do ClickSign não configurada")
            return None
        
        try:
            url = f"{self.base_url}/v1/lists"
            
            headers = {
                "Authorization": self.api_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "list": {
                    "document_key": document_key,
                    "signer_key": signer_email,
                    "sign_as": "sign",
                    "message": f"Olá {signer_name}, você tem um documento para assinar."
                }
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Signatário adicionado com sucesso: {signer_email}")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro HTTP ao adicionar signatário: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao adicionar signatário: {e}")
            return None
    
    async def get_document_status(self, document_key: str) -> Optional[Dict[str, Any]]:
        """Verifica o status de um documento"""
        if not self.api_key:
            logger.error("API Key do ClickSign não configurada")
            return None
        
        try:
            url = f"{self.base_url}/v1/documents/{document_key}"
            
            headers = {
                "Authorization": self.api_key
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Erro HTTP ao verificar status do documento {document_key}: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao verificar status do documento {document_key}: {e}")
            return None

# =============================================================================
# CLASSE PRINCIPAL PARA GERENCIAR TODAS AS APIS
# =============================================================================

class ExternalAPIManager:
    """Gerenciador principal para todas as APIs externas"""
    
    def __init__(self):
        self.viacep = ViaCEPAPI()
        self.memed = MemedAPI()
        self.clicksign = ClickSignAPI()
    
    async def health_check(self) -> Dict[str, bool]:
        """Verifica a saúde de todas as APIs externas"""
        health_status = {
            "viacep": False,
            "memed": False,
            "clicksign": False
        }
        
        # Teste ViaCEP
        try:
            test_address = await self.viacep.get_address_by_cep("01310-100")
            health_status["viacep"] = test_address is not None
        except Exception:
            pass
        
        # Teste Memed (apenas verifica se a API key está configurada)
        health_status["memed"] = bool(self.memed.api_key)
        
        # Teste ClickSign (apenas verifica se a API key está configurada)
        health_status["clicksign"] = bool(self.clicksign.api_key)
        
        return health_status

# Instância global
external_api_manager = ExternalAPIManager()