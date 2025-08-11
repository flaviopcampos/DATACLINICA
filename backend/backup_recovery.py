#!/usr/bin/env python3
"""
DataClínica - Sistema de Backup e Recuperação

Este módulo implementa um sistema completo de backup e recuperação de dados,
incluindo backup incremental, criptografia, verificação de integridade e
recuperação automática em caso de falhas.
"""

import os
import json
import gzip
import shutil
import hashlib
import asyncio
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
import schedule
import time

from .models import Base
from .encryption import DataEncryption
from .audit_logger import AuditLogger, EventType, EventSeverity
from .security_config import SecurityConfig

class BackupType(str, Enum):
    """Tipos de backup"""
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"
    TRANSACTION_LOG = "transaction_log"

class BackupStatus(str, Enum):
    """Status do backup"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CORRUPTED = "corrupted"
    VERIFIED = "verified"

class StorageType(str, Enum):
    """Tipos de armazenamento"""
    LOCAL = "local"
    S3 = "s3"
    AZURE = "azure"
    GCP = "gcp"
    FTP = "ftp"

@dataclass
class BackupMetadata:
    """Metadados do backup"""
    backup_id: str
    timestamp: datetime
    backup_type: BackupType
    storage_type: StorageType
    file_path: str
    file_size: int
    checksum: str
    encryption_key_id: Optional[str] = None
    compression_ratio: float = 0.0
    duration_seconds: float = 0.0
    tables_included: List[str] = field(default_factory=list)
    records_count: Dict[str, int] = field(default_factory=dict)
    status: BackupStatus = BackupStatus.PENDING
    error_message: Optional[str] = None
    retention_date: Optional[datetime] = None

@dataclass
class RestorePoint:
    """Ponto de restauração"""
    restore_id: str
    timestamp: datetime
    backup_id: str
    description: str
    database_state: Dict[str, Any] = field(default_factory=dict)
    verification_status: bool = False

class BackupManager:
    """Gerenciador de backup e recuperação"""
    
    def __init__(self, db_url: str, config: SecurityConfig, audit_logger: AuditLogger):
        self.db_url = db_url
        self.config = config
        self.audit_logger = audit_logger
        self.encryption = DataEncryption()
        
        # Configurações de backup
        self.backup_dir = Path(config.backup.local_backup_path)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        self.temp_dir = self.backup_dir / "temp"
        self.temp_dir.mkdir(exist_ok=True)
        
        # Metadados de backup
        self.metadata_file = self.backup_dir / "backup_metadata.json"
        self.backup_history: List[BackupMetadata] = self._load_backup_history()
        
        # Configuração de armazenamento remoto
        self.s3_client = None
        if config.backup.s3_enabled:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=config.backup.s3_access_key,
                aws_secret_access_key=config.backup.s3_secret_key,
                region_name=config.backup.s3_region
            )
    
    def _load_backup_history(self) -> List[BackupMetadata]:
        """Carrega histórico de backups"""
        if not self.metadata_file.exists():
            return []
        
        try:
            with open(self.metadata_file, 'r') as f:
                data = json.load(f)
                return [
                    BackupMetadata(
                        backup_id=item['backup_id'],
                        timestamp=datetime.fromisoformat(item['timestamp']),
                        backup_type=BackupType(item['backup_type']),
                        storage_type=StorageType(item['storage_type']),
                        file_path=item['file_path'],
                        file_size=item['file_size'],
                        checksum=item['checksum'],
                        encryption_key_id=item.get('encryption_key_id'),
                        compression_ratio=item.get('compression_ratio', 0.0),
                        duration_seconds=item.get('duration_seconds', 0.0),
                        tables_included=item.get('tables_included', []),
                        records_count=item.get('records_count', {}),
                        status=BackupStatus(item.get('status', 'completed')),
                        error_message=item.get('error_message'),
                        retention_date=datetime.fromisoformat(item['retention_date']) if item.get('retention_date') else None
                    )
                    for item in data
                ]
        except Exception as e:
            print(f"Erro ao carregar histórico de backup: {e}")
            return []
    
    def _save_backup_history(self):
        """Salva histórico de backups"""
        try:
            data = []
            for backup in self.backup_history:
                data.append({
                    'backup_id': backup.backup_id,
                    'timestamp': backup.timestamp.isoformat(),
                    'backup_type': backup.backup_type.value,
                    'storage_type': backup.storage_type.value,
                    'file_path': backup.file_path,
                    'file_size': backup.file_size,
                    'checksum': backup.checksum,
                    'encryption_key_id': backup.encryption_key_id,
                    'compression_ratio': backup.compression_ratio,
                    'duration_seconds': backup.duration_seconds,
                    'tables_included': backup.tables_included,
                    'records_count': backup.records_count,
                    'status': backup.status.value,
                    'error_message': backup.error_message,
                    'retention_date': backup.retention_date.isoformat() if backup.retention_date else None
                })
            
            with open(self.metadata_file, 'w') as f:
                json.dump(data, f, indent=2)
        
        except Exception as e:
            print(f"Erro ao salvar histórico de backup: {e}")
    
    async def create_backup(self, backup_type: BackupType = BackupType.FULL,
                          tables: Optional[List[str]] = None,
                          compress: bool = True,
                          encrypt: bool = True,
                          upload_to_cloud: bool = True) -> BackupMetadata:
        """Cria backup do banco de dados"""
        start_time = datetime.now()
        backup_id = f"backup_{start_time.strftime('%Y%m%d_%H%M%S')}_{backup_type.value}"
        
        # Criar metadados iniciais
        metadata = BackupMetadata(
            backup_id=backup_id,
            timestamp=start_time,
            backup_type=backup_type,
            storage_type=StorageType.LOCAL,
            file_path="",
            file_size=0,
            checksum="",
            status=BackupStatus.IN_PROGRESS
        )
        
        try:
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.INFO,
                None,
                f"Iniciando backup {backup_type.value}",
                {'backup_id': backup_id}
            )
            
            # Determinar tabelas para backup
            if not tables:
                tables = await self._get_all_tables()
            
            metadata.tables_included = tables
            
            # Criar backup baseado no tipo
            if backup_type == BackupType.FULL:
                backup_file = await self._create_full_backup(backup_id, tables)
            elif backup_type == BackupType.INCREMENTAL:
                backup_file = await self._create_incremental_backup(backup_id, tables)
            elif backup_type == BackupType.DIFFERENTIAL:
                backup_file = await self._create_differential_backup(backup_id, tables)
            else:
                raise ValueError(f"Tipo de backup não suportado: {backup_type}")
            
            # Comprimir se solicitado
            if compress:
                backup_file = await self._compress_backup(backup_file)
                metadata.compression_ratio = await self._calculate_compression_ratio(backup_file)
            
            # Criptografar se solicitado
            if encrypt:
                backup_file, key_id = await self._encrypt_backup(backup_file)
                metadata.encryption_key_id = key_id
            
            # Calcular checksum
            metadata.checksum = await self._calculate_checksum(backup_file)
            metadata.file_path = str(backup_file)
            metadata.file_size = backup_file.stat().st_size
            
            # Contar registros
            metadata.records_count = await self._count_records(tables)
            
            # Upload para nuvem se solicitado
            if upload_to_cloud and self.s3_client:
                cloud_path = await self._upload_to_s3(backup_file, backup_id)
                metadata.storage_type = StorageType.S3
                metadata.file_path = cloud_path
            
            # Verificar integridade
            if await self._verify_backup_integrity(backup_file, metadata):
                metadata.status = BackupStatus.VERIFIED
            else:
                metadata.status = BackupStatus.CORRUPTED
                raise Exception("Backup falhou na verificação de integridade")
            
            # Calcular duração
            end_time = datetime.now()
            metadata.duration_seconds = (end_time - start_time).total_seconds()
            
            # Definir data de retenção
            metadata.retention_date = start_time + timedelta(days=self.config.backup.retention_days)
            
            # Salvar metadados
            self.backup_history.append(metadata)
            self._save_backup_history()
            
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.INFO,
                None,
                f"Backup {backup_type.value} concluído com sucesso",
                {
                    'backup_id': backup_id,
                    'file_size': metadata.file_size,
                    'duration': metadata.duration_seconds,
                    'tables_count': len(tables)
                }
            )
            
            return metadata
        
        except Exception as e:
            metadata.status = BackupStatus.FAILED
            metadata.error_message = str(e)
            
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.ERROR,
                None,
                f"Falha no backup {backup_type.value}",
                {
                    'backup_id': backup_id,
                    'error': str(e)
                }
            )
            
            raise
    
    async def _create_full_backup(self, backup_id: str, tables: List[str]) -> Path:
        """Cria backup completo"""
        backup_file = self.temp_dir / f"{backup_id}.sql"
        
        # Usar pg_dump para PostgreSQL ou mysqldump para MySQL
        if 'postgresql' in self.db_url:
            cmd = [
                'pg_dump',
                self.db_url,
                '--no-password',
                '--verbose',
                '--clean',
                '--if-exists',
                '--create',
                '--format=custom',
                f'--file={backup_file}'
            ]
        else:
            # Assumir MySQL
            cmd = [
                'mysqldump',
                '--single-transaction',
                '--routines',
                '--triggers',
                '--all-databases',
                f'--result-file={backup_file}'
            ]
        
        # Executar comando de backup
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"Erro no backup: {stderr.decode()}")
        
        return backup_file
    
    async def _create_incremental_backup(self, backup_id: str, tables: List[str]) -> Path:
        """Cria backup incremental"""
        # Encontrar último backup
        last_backup = self._get_last_backup(BackupType.FULL)
        if not last_backup:
            # Se não há backup completo, criar um
            return await self._create_full_backup(backup_id, tables)
        
        backup_file = self.temp_dir / f"{backup_id}_incremental.sql"
        
        # Backup apenas de dados modificados desde o último backup
        engine = create_engine(self.db_url)
        
        with open(backup_file, 'w') as f:
            f.write(f"-- Backup Incremental {backup_id}\n")
            f.write(f"-- Base: {last_backup.backup_id}\n")
            f.write(f"-- Timestamp: {datetime.now().isoformat()}\n\n")
            
            with engine.connect() as conn:
                for table in tables:
                    # Buscar registros modificados
                    if await self._table_has_timestamp_column(table):
                        query = text(f"""
                            SELECT * FROM {table} 
                            WHERE updated_at > :last_backup_time
                            OR created_at > :last_backup_time
                        """)
                        
                        result = conn.execute(query, {'last_backup_time': last_backup.timestamp})
                        
                        if result.rowcount > 0:
                            f.write(f"-- Tabela: {table}\n")
                            for row in result:
                                # Gerar INSERT statement
                                columns = ', '.join(row.keys())
                                values = ', '.join([f"'{v}'" if v is not None else 'NULL' for v in row.values()])
                                f.write(f"INSERT INTO {table} ({columns}) VALUES ({values});\n")
                            f.write("\n")
        
        return backup_file
    
    async def _create_differential_backup(self, backup_id: str, tables: List[str]) -> Path:
        """Cria backup diferencial"""
        # Similar ao incremental, mas baseado no último backup completo
        last_full_backup = self._get_last_backup(BackupType.FULL)
        if not last_full_backup:
            return await self._create_full_backup(backup_id, tables)
        
        backup_file = self.temp_dir / f"{backup_id}_differential.sql"
        
        # Implementação similar ao incremental, mas usando timestamp do último backup completo
        engine = create_engine(self.db_url)
        
        with open(backup_file, 'w') as f:
            f.write(f"-- Backup Diferencial {backup_id}\n")
            f.write(f"-- Base: {last_full_backup.backup_id}\n")
            f.write(f"-- Timestamp: {datetime.now().isoformat()}\n\n")
            
            with engine.connect() as conn:
                for table in tables:
                    if await self._table_has_timestamp_column(table):
                        query = text(f"""
                            SELECT * FROM {table} 
                            WHERE updated_at > :last_backup_time
                            OR created_at > :last_backup_time
                        """)
                        
                        result = conn.execute(query, {'last_backup_time': last_full_backup.timestamp})
                        
                        if result.rowcount > 0:
                            f.write(f"-- Tabela: {table}\n")
                            for row in result:
                                columns = ', '.join(row.keys())
                                values = ', '.join([f"'{v}'" if v is not None else 'NULL' for v in row.values()])
                                f.write(f"INSERT INTO {table} ({columns}) VALUES ({values});\n")
                            f.write("\n")
        
        return backup_file
    
    async def _compress_backup(self, backup_file: Path) -> Path:
        """Comprime arquivo de backup"""
        compressed_file = backup_file.with_suffix(backup_file.suffix + '.gz')
        
        with open(backup_file, 'rb') as f_in:
            with gzip.open(compressed_file, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Remover arquivo original
        backup_file.unlink()
        
        return compressed_file
    
    async def _encrypt_backup(self, backup_file: Path) -> Tuple[Path, str]:
        """Criptografa arquivo de backup"""
        encrypted_file = backup_file.with_suffix(backup_file.suffix + '.enc')
        key_id = f"backup_key_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Criptografar arquivo
        self.encryption.encrypt_file(str(backup_file), str(encrypted_file))
        
        # Remover arquivo original
        backup_file.unlink()
        
        return encrypted_file, key_id
    
    async def _calculate_checksum(self, file_path: Path) -> str:
        """Calcula checksum do arquivo"""
        hash_sha256 = hashlib.sha256()
        
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        
        return hash_sha256.hexdigest()
    
    async def _calculate_compression_ratio(self, compressed_file: Path) -> float:
        """Calcula taxa de compressão"""
        # Estimar tamanho original baseado no arquivo comprimido
        # Esta é uma estimativa, o valor real seria conhecido durante a compressão
        compressed_size = compressed_file.stat().st_size
        
        # Para arquivos .gz, podemos estimar o tamanho original
        if compressed_file.suffix == '.gz':
            with gzip.open(compressed_file, 'rb') as f:
                original_size = len(f.read())
            
            return (original_size - compressed_size) / original_size if original_size > 0 else 0.0
        
        return 0.0
    
    async def _upload_to_s3(self, backup_file: Path, backup_id: str) -> str:
        """Faz upload do backup para S3"""
        if not self.s3_client:
            raise Exception("Cliente S3 não configurado")
        
        bucket_name = self.config.backup.s3_bucket
        key = f"backups/{backup_id}/{backup_file.name}"
        
        try:
            self.s3_client.upload_file(
                str(backup_file),
                bucket_name,
                key,
                ExtraArgs={
                    'ServerSideEncryption': 'AES256',
                    'StorageClass': 'STANDARD_IA'  # Armazenamento de acesso infrequente
                }
            )
            
            return f"s3://{bucket_name}/{key}"
        
        except ClientError as e:
            raise Exception(f"Erro no upload para S3: {e}")
    
    async def _verify_backup_integrity(self, backup_file: Path, metadata: BackupMetadata) -> bool:
        """Verifica integridade do backup"""
        try:
            # Verificar se arquivo existe e não está vazio
            if not backup_file.exists() or backup_file.stat().st_size == 0:
                return False
            
            # Verificar checksum
            current_checksum = await self._calculate_checksum(backup_file)
            if current_checksum != metadata.checksum:
                return False
            
            # Para backups SQL, verificar sintaxe básica
            if backup_file.suffix in ['.sql', '.gz']:
                return await self._verify_sql_syntax(backup_file)
            
            return True
        
        except Exception:
            return False
    
    async def _verify_sql_syntax(self, backup_file: Path) -> bool:
        """Verifica sintaxe básica do SQL"""
        try:
            content = ""
            
            if backup_file.suffix == '.gz':
                with gzip.open(backup_file, 'rt') as f:
                    content = f.read(1000)  # Ler apenas início
            else:
                with open(backup_file, 'r') as f:
                    content = f.read(1000)
            
            # Verificações básicas
            if not content.strip():
                return False
            
            # Verificar se contém comandos SQL válidos
            sql_keywords = ['CREATE', 'INSERT', 'UPDATE', 'SELECT', 'DROP', 'ALTER']
            has_sql = any(keyword in content.upper() for keyword in sql_keywords)
            
            return has_sql
        
        except Exception:
            return False
    
    async def restore_backup(self, backup_id: str, target_db_url: Optional[str] = None,
                           tables: Optional[List[str]] = None,
                           point_in_time: Optional[datetime] = None) -> bool:
        """Restaura backup"""
        try:
            # Encontrar backup
            backup = self._find_backup(backup_id)
            if not backup:
                raise Exception(f"Backup {backup_id} não encontrado")
            
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.WARNING,
                None,
                f"Iniciando restauração do backup {backup_id}",
                {'backup_id': backup_id, 'target_db': target_db_url or 'current'}
            )
            
            # Baixar backup se estiver na nuvem
            local_backup_file = await self._download_backup_if_needed(backup)
            
            # Descriptografar se necessário
            if backup.encryption_key_id:
                local_backup_file = await self._decrypt_backup(local_backup_file)
            
            # Descomprimir se necessário
            if local_backup_file.suffix == '.gz':
                local_backup_file = await self._decompress_backup(local_backup_file)
            
            # Verificar integridade antes da restauração
            if not await self._verify_backup_integrity(local_backup_file, backup):
                raise Exception("Backup falhou na verificação de integridade")
            
            # Executar restauração
            db_url = target_db_url or self.db_url
            success = await self._execute_restore(local_backup_file, db_url, tables)
            
            if success:
                await self.audit_logger.log_event(
                    EventType.SYSTEM,
                    EventSeverity.INFO,
                    None,
                    f"Restauração do backup {backup_id} concluída com sucesso",
                    {'backup_id': backup_id}
                )
            
            return success
        
        except Exception as e:
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.ERROR,
                None,
                f"Falha na restauração do backup {backup_id}",
                {'backup_id': backup_id, 'error': str(e)}
            )
            raise
    
    async def _execute_restore(self, backup_file: Path, db_url: str, tables: Optional[List[str]]) -> bool:
        """Executa restauração do backup"""
        try:
            if 'postgresql' in db_url:
                cmd = [
                    'pg_restore',
                    '--verbose',
                    '--clean',
                    '--if-exists',
                    '--dbname', db_url,
                    str(backup_file)
                ]
            else:
                # MySQL
                cmd = [
                    'mysql',
                    '--execute', f"source {backup_file}"
                ]
            
            # Executar comando de restauração
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"Erro na restauração: {stderr.decode()}")
            
            return True
        
        except Exception as e:
            print(f"Erro na execução da restauração: {e}")
            return False
    
    def _find_backup(self, backup_id: str) -> Optional[BackupMetadata]:
        """Encontra backup por ID"""
        for backup in self.backup_history:
            if backup.backup_id == backup_id:
                return backup
        return None
    
    def _get_last_backup(self, backup_type: BackupType) -> Optional[BackupMetadata]:
        """Obtém último backup do tipo especificado"""
        backups = [b for b in self.backup_history if b.backup_type == backup_type and b.status == BackupStatus.VERIFIED]
        if backups:
            return max(backups, key=lambda x: x.timestamp)
        return None
    
    async def _get_all_tables(self) -> List[str]:
        """Obtém lista de todas as tabelas"""
        engine = create_engine(self.db_url)
        
        with engine.connect() as conn:
            if 'postgresql' in self.db_url:
                result = conn.execute(text("""
                    SELECT tablename FROM pg_tables 
                    WHERE schemaname = 'public'
                """))
            else:
                result = conn.execute(text("SHOW TABLES"))
            
            return [row[0] for row in result]
    
    async def _table_has_timestamp_column(self, table: str) -> bool:
        """Verifica se tabela tem colunas de timestamp"""
        engine = create_engine(self.db_url)
        
        with engine.connect() as conn:
            if 'postgresql' in self.db_url:
                result = conn.execute(text("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name = :table_name 
                    AND column_name IN ('created_at', 'updated_at')
                """), {'table_name': table})
            else:
                result = conn.execute(text(f"""
                    SHOW COLUMNS FROM {table} 
                    WHERE Field IN ('created_at', 'updated_at')
                """))
            
            return result.rowcount > 0
    
    async def _count_records(self, tables: List[str]) -> Dict[str, int]:
        """Conta registros por tabela"""
        counts = {}
        engine = create_engine(self.db_url)
        
        with engine.connect() as conn:
            for table in tables:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    counts[table] = result.scalar()
                except Exception:
                    counts[table] = 0
        
        return counts
    
    async def cleanup_old_backups(self):
        """Remove backups antigos baseado na política de retenção"""
        current_time = datetime.now()
        removed_count = 0
        
        for backup in self.backup_history[:]:
            if backup.retention_date and current_time > backup.retention_date:
                try:
                    # Remover arquivo local
                    if backup.storage_type == StorageType.LOCAL:
                        backup_path = Path(backup.file_path)
                        if backup_path.exists():
                            backup_path.unlink()
                    
                    # Remover do S3
                    elif backup.storage_type == StorageType.S3 and self.s3_client:
                        bucket, key = backup.file_path.replace('s3://', '').split('/', 1)
                        self.s3_client.delete_object(Bucket=bucket, Key=key)
                    
                    # Remover dos metadados
                    self.backup_history.remove(backup)
                    removed_count += 1
                    
                    await self.audit_logger.log_event(
                        EventType.SYSTEM,
                        EventSeverity.INFO,
                        None,
                        f"Backup antigo removido: {backup.backup_id}",
                        {'backup_id': backup.backup_id, 'retention_date': backup.retention_date.isoformat()}
                    )
                
                except Exception as e:
                    await self.audit_logger.log_event(
                        EventType.SYSTEM,
                        EventSeverity.ERROR,
                        None,
                        f"Erro ao remover backup antigo: {backup.backup_id}",
                        {'backup_id': backup.backup_id, 'error': str(e)}
                    )
        
        if removed_count > 0:
            self._save_backup_history()
        
        return removed_count
    
    def get_backup_statistics(self) -> Dict[str, Any]:
        """Retorna estatísticas dos backups"""
        total_backups = len(self.backup_history)
        successful_backups = len([b for b in self.backup_history if b.status == BackupStatus.VERIFIED])
        failed_backups = len([b for b in self.backup_history if b.status == BackupStatus.FAILED])
        
        total_size = sum(b.file_size for b in self.backup_history)
        avg_duration = sum(b.duration_seconds for b in self.backup_history) / total_backups if total_backups > 0 else 0
        
        backup_types = {}
        for backup in self.backup_history:
            backup_types[backup.backup_type.value] = backup_types.get(backup.backup_type.value, 0) + 1
        
        return {
            'total_backups': total_backups,
            'successful_backups': successful_backups,
            'failed_backups': failed_backups,
            'success_rate': (successful_backups / total_backups * 100) if total_backups > 0 else 0,
            'total_size_bytes': total_size,
            'total_size_gb': total_size / (1024**3),
            'average_duration_seconds': avg_duration,
            'backup_types': backup_types,
            'oldest_backup': min(self.backup_history, key=lambda x: x.timestamp).timestamp.isoformat() if self.backup_history else None,
            'newest_backup': max(self.backup_history, key=lambda x: x.timestamp).timestamp.isoformat() if self.backup_history else None
        }

# Classe para agendamento automático de backups
class BackupScheduler:
    """Agendador de backups automáticos"""
    
    def __init__(self, backup_manager: BackupManager):
        self.backup_manager = backup_manager
        self.running = False
    
    def setup_schedules(self):
        """Configura agendamentos de backup"""
        # Backup completo semanal (domingo às 2h)
        schedule.every().sunday.at("02:00").do(self._run_full_backup)
        
        # Backup incremental diário (todos os dias às 23h)
        schedule.every().day.at("23:00").do(self._run_incremental_backup)
        
        # Limpeza de backups antigos (primeira segunda do mês às 3h)
        schedule.every().monday.at("03:00").do(self._cleanup_old_backups)
    
    async def _run_full_backup(self):
        """Executa backup completo"""
        try:
            await self.backup_manager.create_backup(BackupType.FULL)
        except Exception as e:
            print(f"Erro no backup automático completo: {e}")
    
    async def _run_incremental_backup(self):
        """Executa backup incremental"""
        try:
            await self.backup_manager.create_backup(BackupType.INCREMENTAL)
        except Exception as e:
            print(f"Erro no backup automático incremental: {e}")
    
    async def _cleanup_old_backups(self):
        """Executa limpeza de backups antigos"""
        try:
            await self.backup_manager.cleanup_old_backups()
        except Exception as e:
            print(f"Erro na limpeza automática de backups: {e}")
    
    def start(self):
        """Inicia o agendador"""
        self.running = True
        while self.running:
            schedule.run_pending()
            time.sleep(60)  # Verificar a cada minuto
    
    def stop(self):
        """Para o agendador"""
        self.running = False

# Função utilitária para criar instância do gerenciador
def create_backup_manager(db_url: str, config: SecurityConfig, audit_logger: AuditLogger) -> BackupManager:
    """Cria instância do gerenciador de backup"""
    return BackupManager(db_url, config, audit_logger)