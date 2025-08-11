#!/usr/bin/env python3
"""
DataClínica - Sistema de Criptografia de Dados Sensíveis

Este módulo implementa criptografia AES-256 para proteger dados sensíveis
como CPF, RG, dados médicos e outras informações pessoais.
"""

import os
import base64
import hashlib
from typing import Optional, Union
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import logging

# Configurar logging
logger = logging.getLogger(__name__)

class DataEncryption:
    """Classe para criptografia de dados sensíveis"""
    
    def __init__(self, encryption_key: Optional[str] = None):
        """
        Inicializa o sistema de criptografia.
        
        Args:
            encryption_key: Chave de criptografia. Se não fornecida, usa variável de ambiente.
        """
        self.encryption_key = encryption_key or os.getenv("ENCRYPTION_KEY")
        if not self.encryption_key:
            raise ValueError("Chave de criptografia não configurada")
        
        # Gerar chave Fernet a partir da chave mestra
        self.fernet_key = self._derive_fernet_key(self.encryption_key)
        self.fernet = Fernet(self.fernet_key)
        
        logger.info("Sistema de criptografia inicializado")
    
    def _derive_fernet_key(self, password: str) -> bytes:
        """Deriva uma chave Fernet a partir de uma senha"""
        # Usar salt fixo para garantir que a mesma senha sempre gere a mesma chave
        # Em produção, considere usar um salt único por instalação
        salt = b'dataclinica_salt_2024'
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key
    
    def encrypt_string(self, plaintext: str) -> str:
        """
        Criptografa uma string.
        
        Args:
            plaintext: Texto a ser criptografado
            
        Returns:
            String criptografada em base64
        """
        if not plaintext:
            return plaintext
        
        try:
            encrypted_bytes = self.fernet.encrypt(plaintext.encode('utf-8'))
            return base64.urlsafe_b64encode(encrypted_bytes).decode('utf-8')
        except Exception as e:
            logger.error(f"Erro ao criptografar string: {e}")
            raise
    
    def decrypt_string(self, ciphertext: str) -> str:
        """
        Descriptografa uma string.
        
        Args:
            ciphertext: String criptografada em base64
            
        Returns:
            Texto descriptografado
        """
        if not ciphertext:
            return ciphertext
        
        try:
            encrypted_bytes = base64.urlsafe_b64decode(ciphertext.encode('utf-8'))
            decrypted_bytes = self.fernet.decrypt(encrypted_bytes)
            return decrypted_bytes.decode('utf-8')
        except Exception as e:
            logger.error(f"Erro ao descriptografar string: {e}")
            raise
    
    def encrypt_cpf(self, cpf: str) -> str:
        """Criptografa um CPF"""
        if not cpf:
            return cpf
        
        # Remover formatação antes de criptografar
        clean_cpf = ''.join(filter(str.isdigit, cpf))
        return self.encrypt_string(clean_cpf)
    
    def decrypt_cpf(self, encrypted_cpf: str) -> str:
        """Descriptografa um CPF"""
        if not encrypted_cpf:
            return encrypted_cpf
        
        return self.decrypt_string(encrypted_cpf)
    
    def encrypt_rg(self, rg: str) -> str:
        """Criptografa um RG"""
        return self.encrypt_string(rg) if rg else rg
    
    def decrypt_rg(self, encrypted_rg: str) -> str:
        """Descriptografa um RG"""
        return self.decrypt_string(encrypted_rg) if encrypted_rg else encrypted_rg
    
    def encrypt_phone(self, phone: str) -> str:
        """Criptografa um telefone"""
        if not phone:
            return phone
        
        # Remover formatação antes de criptografar
        clean_phone = ''.join(filter(str.isdigit, phone))
        return self.encrypt_string(clean_phone)
    
    def decrypt_phone(self, encrypted_phone: str) -> str:
        """Descriptografa um telefone"""
        return self.decrypt_string(encrypted_phone) if encrypted_phone else encrypted_phone
    
    def encrypt_medical_data(self, medical_data: str) -> str:
        """Criptografa dados médicos sensíveis"""
        return self.encrypt_string(medical_data) if medical_data else medical_data
    
    def decrypt_medical_data(self, encrypted_data: str) -> str:
        """Descriptografa dados médicos sensíveis"""
        return self.decrypt_string(encrypted_data) if encrypted_data else encrypted_data
    
    def hash_for_search(self, data: str) -> str:
        """
        Gera um hash dos dados para permitir busca sem descriptografar.
        
        Útil para buscar por CPF, RG, etc. sem expor os dados originais.
        
        Args:
            data: Dados a serem hasheados
            
        Returns:
            Hash SHA-256 dos dados
        """
        if not data:
            return data
        
        # Limpar dados antes de hashear
        clean_data = ''.join(filter(str.isalnum, data.lower()))
        
        # Adicionar salt para evitar rainbow tables
        salted_data = f"{clean_data}_{self.encryption_key[:16]}"
        
        return hashlib.sha256(salted_data.encode()).hexdigest()
    
    def encrypt_file(self, file_path: str, output_path: Optional[str] = None) -> str:
        """
        Criptografa um arquivo.
        
        Args:
            file_path: Caminho do arquivo a ser criptografado
            output_path: Caminho do arquivo criptografado (opcional)
            
        Returns:
            Caminho do arquivo criptografado
        """
        if not output_path:
            output_path = f"{file_path}.encrypted"
        
        try:
            with open(file_path, 'rb') as infile:
                file_data = infile.read()
            
            encrypted_data = self.fernet.encrypt(file_data)
            
            with open(output_path, 'wb') as outfile:
                outfile.write(encrypted_data)
            
            logger.info(f"Arquivo criptografado: {file_path} -> {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Erro ao criptografar arquivo {file_path}: {e}")
            raise
    
    def decrypt_file(self, encrypted_file_path: str, output_path: Optional[str] = None) -> str:
        """
        Descriptografa um arquivo.
        
        Args:
            encrypted_file_path: Caminho do arquivo criptografado
            output_path: Caminho do arquivo descriptografado (opcional)
            
        Returns:
            Caminho do arquivo descriptografado
        """
        if not output_path:
            output_path = encrypted_file_path.replace('.encrypted', '')
        
        try:
            with open(encrypted_file_path, 'rb') as infile:
                encrypted_data = infile.read()
            
            decrypted_data = self.fernet.decrypt(encrypted_data)
            
            with open(output_path, 'wb') as outfile:
                outfile.write(decrypted_data)
            
            logger.info(f"Arquivo descriptografado: {encrypted_file_path} -> {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Erro ao descriptografar arquivo {encrypted_file_path}: {e}")
            raise
    
    def is_encrypted(self, data: str) -> bool:
        """
        Verifica se uma string está criptografada.
        
        Args:
            data: String a ser verificada
            
        Returns:
            True se a string parece estar criptografada
        """
        if not data:
            return False
        
        try:
            # Tentar decodificar base64
            base64.urlsafe_b64decode(data.encode('utf-8'))
            # Se conseguiu decodificar e tem tamanho típico de dados criptografados
            return len(data) > 50 and '=' in data[-4:]
        except:
            return False

class FieldEncryption:
    """Classe para criptografia automática de campos específicos"""
    
    # Campos que devem ser criptografados
    ENCRYPTED_FIELDS = {
        'cpf', 'rg_number', 'phone', 'emergency_phone', 'mother_name', 
        'father_name', 'allergies', 'comorbidities', 'chief_complaint',
        'history_present_illness', 'physical_examination', 'assessment',
        'plan', 'observations', 'prescription_content'
    }
    
    # Campos que devem ter hash para busca
    SEARCHABLE_FIELDS = {'cpf', 'rg_number', 'phone'}
    
    def __init__(self, encryption: DataEncryption):
        self.encryption = encryption
    
    def encrypt_model_data(self, model_data: dict) -> dict:
        """
        Criptografa campos sensíveis de um modelo.
        
        Args:
            model_data: Dicionário com dados do modelo
            
        Returns:
            Dicionário com campos sensíveis criptografados
        """
        encrypted_data = model_data.copy()
        
        for field_name, value in model_data.items():
            if field_name in self.ENCRYPTED_FIELDS and value:
                # Criptografar o campo
                encrypted_data[field_name] = self.encryption.encrypt_string(str(value))
                
                # Criar hash para busca se necessário
                if field_name in self.SEARCHABLE_FIELDS:
                    hash_field = f"{field_name}_hash"
                    encrypted_data[hash_field] = self.encryption.hash_for_search(str(value))
        
        return encrypted_data
    
    def decrypt_model_data(self, model_data: dict) -> dict:
        """
        Descriptografa campos sensíveis de um modelo.
        
        Args:
            model_data: Dicionário com dados criptografados
            
        Returns:
            Dicionário com campos descriptografados
        """
        decrypted_data = model_data.copy()
        
        for field_name, value in model_data.items():
            if field_name in self.ENCRYPTED_FIELDS and value:
                try:
                    # Verificar se está criptografado antes de tentar descriptografar
                    if self.encryption.is_encrypted(str(value)):
                        decrypted_data[field_name] = self.encryption.decrypt_string(str(value))
                except Exception as e:
                    logger.warning(f"Erro ao descriptografar campo {field_name}: {e}")
                    # Manter valor original se não conseguir descriptografar
                    pass
        
        return decrypted_data

# Instância global
encryption_key = os.getenv("ENCRYPTION_KEY", "dataclinica_default_key_2024_change_in_production")
data_encryption = DataEncryption(encryption_key)
field_encryption = FieldEncryption(data_encryption)

# Funções de conveniência
def encrypt_sensitive_data(data: str) -> str:
    """Função de conveniência para criptografar dados sensíveis"""
    return data_encryption.encrypt_string(data)

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Função de conveniência para descriptografar dados sensíveis"""
    return data_encryption.decrypt_string(encrypted_data)

def hash_for_search(data: str) -> str:
    """Função de conveniência para gerar hash para busca"""
    return data_encryption.hash_for_search(data)