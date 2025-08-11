#!/usr/bin/env python3
"""
Script de Backup Automatizado para DataClinica

Este script realiza backup do banco de dados PostgreSQL e upload para AWS S3.
Pode ser executado via cron job ou GitHub Actions.

Uso:
    python backup.py [--config-file config.json] [--dry-run]

Variáveis de ambiente necessárias:
    - DATABASE_URL: URL de conexão com PostgreSQL
    - AWS_ACCESS_KEY_ID: Chave de acesso AWS
    - AWS_SECRET_ACCESS_KEY: Chave secreta AWS
    - AWS_S3_BUCKET: Nome do bucket S3
    - BACKUP_RETENTION_DAYS: Dias para manter backups (padrão: 30)
"""

import os
import sys
import json
import logging
import argparse
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
except ImportError:
    print("Erro: boto3 não está instalado. Execute: pip install boto3")
    sys.exit(1)

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("Erro: psycopg2 não está instalado. Execute: pip install psycopg2-binary")
    sys.exit(1)

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('backup.log')
    ]
)
logger = logging.getLogger(__name__)

class DatabaseBackup:
    """Classe para gerenciar backups do banco de dados."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.database_url = config.get('database_url') or os.getenv('DATABASE_URL')
        self.aws_access_key = config.get('aws_access_key') or os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_key = config.get('aws_secret_key') or os.getenv('AWS_SECRET_ACCESS_KEY')
        self.s3_bucket = config.get('s3_bucket') or os.getenv('AWS_S3_BUCKET')
        self.retention_days = int(config.get('retention_days', os.getenv('BACKUP_RETENTION_DAYS', 30)))
        self.backup_dir = Path(config.get('backup_dir', './backups'))
        self.dry_run = config.get('dry_run', False)
        
        # Criar diretório de backup se não existir
        self.backup_dir.mkdir(exist_ok=True)
        
        # Validar configurações
        self._validate_config()
        
        # Inicializar cliente S3
        self.s3_client = self._init_s3_client()
    
    def _validate_config(self):
        """Valida as configurações necessárias."""
        required_configs = {
            'database_url': self.database_url,
            'aws_access_key': self.aws_access_key,
            'aws_secret_key': self.aws_secret_key,
            's3_bucket': self.s3_bucket
        }
        
        missing_configs = [key for key, value in required_configs.items() if not value]
        
        if missing_configs:
            raise ValueError(f"Configurações obrigatórias não encontradas: {', '.join(missing_configs)}")
    
    def _init_s3_client(self):
        """Inicializa o cliente S3."""
        try:
            return boto3.client(
                's3',
                aws_access_key_id=self.aws_access_key,
                aws_secret_access_key=self.aws_secret_key
            )
        except NoCredentialsError:
            logger.error("Credenciais AWS não encontradas")
            raise
    
    def create_backup(self) -> Optional[Path]:
        """Cria backup do banco de dados PostgreSQL."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f"dataclinica_backup_{timestamp}.sql"
        backup_path = self.backup_dir / backup_filename
        
        logger.info(f"Iniciando backup do banco de dados: {backup_filename}")
        
        if self.dry_run:
            logger.info(f"[DRY RUN] Backup seria criado em: {backup_path}")
            return backup_path
        
        try:
            # Comando pg_dump
            cmd = [
                'pg_dump',
                '--verbose',
                '--clean',
                '--no-owner',
                '--no-privileges',
                '--format=custom',
                '--file', str(backup_path),
                self.database_url
            ]
            
            # Executar pg_dump
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info(f"Backup criado com sucesso: {backup_path}")
            logger.debug(f"pg_dump output: {result.stdout}")
            
            return backup_path
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Erro ao criar backup: {e}")
            logger.error(f"stderr: {e.stderr}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao criar backup: {e}")
            return None
    
    def upload_to_s3(self, backup_path: Path) -> bool:
        """Faz upload do backup para S3."""
        if not backup_path or not backup_path.exists():
            logger.error("Arquivo de backup não encontrado")
            return False
        
        s3_key = f"backups/{backup_path.name}"
        
        logger.info(f"Fazendo upload para S3: s3://{self.s3_bucket}/{s3_key}")
        
        if self.dry_run:
            logger.info(f"[DRY RUN] Upload seria feito para: s3://{self.s3_bucket}/{s3_key}")
            return True
        
        try:
            # Upload com metadata
            extra_args = {
                'Metadata': {
                    'backup-date': datetime.now().isoformat(),
                    'database': 'dataclinica',
                    'backup-type': 'full'
                },
                'ServerSideEncryption': 'AES256'
            }
            
            self.s3_client.upload_file(
                str(backup_path),
                self.s3_bucket,
                s3_key,
                ExtraArgs=extra_args
            )
            
            logger.info(f"Upload concluído: s3://{self.s3_bucket}/{s3_key}")
            return True
            
        except ClientError as e:
            logger.error(f"Erro no upload para S3: {e}")
            return False
        except Exception as e:
            logger.error(f"Erro inesperado no upload: {e}")
            return False
    
    def cleanup_old_backups(self):
        """Remove backups antigos locais e do S3."""
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)
        
        # Cleanup local
        self._cleanup_local_backups(cutoff_date)
        
        # Cleanup S3
        self._cleanup_s3_backups(cutoff_date)
    
    def _cleanup_local_backups(self, cutoff_date: datetime):
        """Remove backups locais antigos."""
        logger.info(f"Removendo backups locais anteriores a {cutoff_date.date()}")
        
        removed_count = 0
        for backup_file in self.backup_dir.glob('dataclinica_backup_*.sql'):
            try:
                # Extrair data do nome do arquivo
                date_str = backup_file.stem.split('_')[-2] + '_' + backup_file.stem.split('_')[-1]
                file_date = datetime.strptime(date_str, '%Y%m%d_%H%M%S')
                
                if file_date < cutoff_date:
                    if self.dry_run:
                        logger.info(f"[DRY RUN] Removeria arquivo local: {backup_file}")
                    else:
                        backup_file.unlink()
                        logger.info(f"Arquivo local removido: {backup_file}")
                    removed_count += 1
                    
            except (ValueError, IndexError) as e:
                logger.warning(f"Não foi possível processar arquivo {backup_file}: {e}")
        
        logger.info(f"Backups locais removidos: {removed_count}")
    
    def _cleanup_s3_backups(self, cutoff_date: datetime):
        """Remove backups do S3 antigos."""
        logger.info(f"Removendo backups do S3 anteriores a {cutoff_date.date()}")
        
        if self.dry_run:
            logger.info("[DRY RUN] Cleanup do S3 seria executado")
            return
        
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.s3_bucket,
                Prefix='backups/dataclinica_backup_'
            )
            
            removed_count = 0
            if 'Contents' in response:
                for obj in response['Contents']:
                    if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                        self.s3_client.delete_object(
                            Bucket=self.s3_bucket,
                            Key=obj['Key']
                        )
                        logger.info(f"Backup S3 removido: {obj['Key']}")
                        removed_count += 1
            
            logger.info(f"Backups S3 removidos: {removed_count}")
            
        except ClientError as e:
            logger.error(f"Erro ao limpar backups do S3: {e}")
    
    def verify_backup(self, backup_path: Path) -> bool:
        """Verifica a integridade do backup."""
        if not backup_path or not backup_path.exists():
            return False
        
        logger.info(f"Verificando integridade do backup: {backup_path}")
        
        if self.dry_run:
            logger.info("[DRY RUN] Verificação seria executada")
            return True
        
        try:
            # Verificar se o arquivo não está vazio
            if backup_path.stat().st_size == 0:
                logger.error("Arquivo de backup está vazio")
                return False
            
            # Verificar se é um arquivo pg_dump válido
            cmd = ['pg_restore', '--list', str(backup_path)]
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            if result.returncode == 0:
                logger.info("Backup verificado com sucesso")
                return True
            else:
                logger.error("Backup falhou na verificação")
                return False
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Erro na verificação do backup: {e}")
            return False
        except Exception as e:
            logger.error(f"Erro inesperado na verificação: {e}")
            return False
    
    def run_backup(self) -> bool:
        """Executa o processo completo de backup."""
        logger.info("=== Iniciando processo de backup ===")
        
        try:
            # 1. Criar backup
            backup_path = self.create_backup()
            if not backup_path:
                logger.error("Falha ao criar backup")
                return False
            
            # 2. Verificar backup (apenas se não for dry run)
            if not self.dry_run and not self.verify_backup(backup_path):
                logger.error("Backup falhou na verificação")
                return False
            
            # 3. Upload para S3
            if not self.upload_to_s3(backup_path):
                logger.error("Falha no upload para S3")
                return False
            
            # 4. Cleanup de backups antigos
            self.cleanup_old_backups()
            
            logger.info("=== Backup concluído com sucesso ===")
            return True
            
        except Exception as e:
            logger.error(f"Erro no processo de backup: {e}")
            return False

def load_config(config_file: Optional[str] = None) -> Dict[str, Any]:
    """Carrega configuração de arquivo JSON."""
    config = {}
    
    if config_file and Path(config_file).exists():
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            logger.info(f"Configuração carregada de: {config_file}")
        except Exception as e:
            logger.warning(f"Erro ao carregar configuração: {e}")
    
    return config

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(description='Backup automatizado do DataClinica')
    parser.add_argument('--config-file', help='Arquivo de configuração JSON')
    parser.add_argument('--dry-run', action='store_true', help='Simular execução sem fazer alterações')
    parser.add_argument('--verbose', '-v', action='store_true', help='Saída detalhada')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Carregar configuração
        config = load_config(args.config_file)
        config['dry_run'] = args.dry_run
        
        # Executar backup
        backup = DatabaseBackup(config)
        success = backup.run_backup()
        
        sys.exit(0 if success else 1)
        
    except Exception as e:
        logger.error(f"Erro fatal: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()