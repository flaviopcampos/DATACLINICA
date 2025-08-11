#!/usr/bin/env python3
"""
Script de Deploy Automatizado - DataClinica
Este script automatiza o processo de deploy da aplicação DataClinica
"""

import os
import sys
import subprocess
import argparse
import json
import time
from pathlib import Path
from typing import Dict, List, Optional

# Configurações
PROJECT_ROOT = Path(__file__).parent.parent
DOCKER_COMPOSE_FILES = {
    'development': 'docker-compose.yml',
    'staging': 'docker-compose.staging.yml',
    'production': 'docker-compose.prod.yml'
}

class Colors:
    """Cores para output no terminal"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

class DeployManager:
    """Gerenciador de deploy da aplicação"""
    
    def __init__(self, environment: str, verbose: bool = False):
        self.environment = environment
        self.verbose = verbose
        self.project_root = PROJECT_ROOT
        
    def log(self, message: str, level: str = 'INFO'):
        """Log com cores"""
        color_map = {
            'INFO': Colors.OKBLUE,
            'SUCCESS': Colors.OKGREEN,
            'WARNING': Colors.WARNING,
            'ERROR': Colors.FAIL,
            'HEADER': Colors.HEADER
        }
        
        color = color_map.get(level, Colors.ENDC)
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"{color}[{timestamp}] {level}: {message}{Colors.ENDC}")
    
    def run_command(self, command: str, check: bool = True) -> subprocess.CompletedProcess:
        """Executa comando no shell"""
        if self.verbose:
            self.log(f"Executando: {command}")
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                check=check,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            
            if self.verbose and result.stdout:
                print(result.stdout)
            
            return result
        except subprocess.CalledProcessError as e:
            self.log(f"Erro ao executar comando: {command}", 'ERROR')
            self.log(f"Código de saída: {e.returncode}", 'ERROR')
            if e.stderr:
                self.log(f"Erro: {e.stderr}", 'ERROR')
            raise
    
    def check_prerequisites(self) -> bool:
        """Verifica pré-requisitos para deploy"""
        self.log("Verificando pré-requisitos...", 'HEADER')
        
        # Verificar Docker
        try:
            result = self.run_command("docker --version")
            self.log(f"Docker encontrado: {result.stdout.strip()}", 'SUCCESS')
        except subprocess.CalledProcessError:
            self.log("Docker não encontrado. Instale o Docker primeiro.", 'ERROR')
            return False
        
        # Verificar Docker Compose
        try:
            result = self.run_command("docker-compose --version")
            self.log(f"Docker Compose encontrado: {result.stdout.strip()}", 'SUCCESS')
        except subprocess.CalledProcessError:
            self.log("Docker Compose não encontrado. Instale o Docker Compose primeiro.", 'ERROR')
            return False
        
        # Verificar arquivo de configuração
        env_file = self.project_root / f".env.{self.environment}"
        if not env_file.exists():
            self.log(f"Arquivo de configuração não encontrado: {env_file}", 'ERROR')
            return False
        
        self.log(f"Arquivo de configuração encontrado: {env_file}", 'SUCCESS')
        
        # Verificar docker-compose file
        compose_file = self.project_root / DOCKER_COMPOSE_FILES.get(self.environment, 'docker-compose.yml')
        if not compose_file.exists():
            self.log(f"Arquivo docker-compose não encontrado: {compose_file}", 'ERROR')
            return False
        
        self.log(f"Arquivo docker-compose encontrado: {compose_file}", 'SUCCESS')
        
        return True
    
    def backup_database(self) -> bool:
        """Faz backup do banco de dados antes do deploy"""
        if self.environment == 'development':
            self.log("Pulando backup em ambiente de desenvolvimento", 'WARNING')
            return True
        
        self.log("Fazendo backup do banco de dados...", 'HEADER')
        
        try:
            backup_dir = self.project_root / "backups"
            backup_dir.mkdir(exist_ok=True)
            
            timestamp = time.strftime('%Y%m%d_%H%M%S')
            backup_file = backup_dir / f"backup_pre_deploy_{timestamp}.sql"
            
            # Comando de backup (ajustar conforme necessário)
            backup_command = f"docker-compose exec -T postgres pg_dump -U dataclinica_user dataclinica > {backup_file}"
            
            self.run_command(backup_command)
            self.log(f"Backup criado: {backup_file}", 'SUCCESS')
            return True
            
        except Exception as e:
            self.log(f"Erro ao fazer backup: {str(e)}", 'ERROR')
            return False
    
    def build_images(self) -> bool:
        """Constrói as imagens Docker"""
        self.log("Construindo imagens Docker...", 'HEADER')
        
        try:
            compose_file = DOCKER_COMPOSE_FILES.get(self.environment, 'docker-compose.yml')
            env_file = f".env.{self.environment}"
            
            build_command = f"docker-compose -f {compose_file} --env-file {env_file} build --no-cache"
            self.run_command(build_command)
            
            self.log("Imagens construídas com sucesso", 'SUCCESS')
            return True
            
        except Exception as e:
            self.log(f"Erro ao construir imagens: {str(e)}", 'ERROR')
            return False
    
    def run_migrations(self) -> bool:
        """Executa migrações do banco de dados"""
        self.log("Executando migrações do banco de dados...", 'HEADER')
        
        try:
            compose_file = DOCKER_COMPOSE_FILES.get(self.environment, 'docker-compose.yml')
            env_file = f".env.{self.environment}"
            
            # Aguardar banco estar pronto
            self.log("Aguardando banco de dados ficar pronto...")
            wait_command = f"docker-compose -f {compose_file} --env-file {env_file} exec postgres pg_isready -U dataclinica_user"
            
            max_attempts = 30
            for attempt in range(max_attempts):
                try:
                    self.run_command(wait_command)
                    break
                except subprocess.CalledProcessError:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(2)
            
            # Executar migrações
            migration_command = f"docker-compose -f {compose_file} --env-file {env_file} exec backend alembic upgrade head"
            self.run_command(migration_command)
            
            self.log("Migrações executadas com sucesso", 'SUCCESS')
            return True
            
        except Exception as e:
            self.log(f"Erro ao executar migrações: {str(e)}", 'ERROR')
            return False
    
    def deploy_services(self) -> bool:
        """Faz deploy dos serviços"""
        self.log("Fazendo deploy dos serviços...", 'HEADER')
        
        try:
            compose_file = DOCKER_COMPOSE_FILES.get(self.environment, 'docker-compose.yml')
            env_file = f".env.{self.environment}"
            
            # Parar serviços existentes
            self.log("Parando serviços existentes...")
            stop_command = f"docker-compose -f {compose_file} --env-file {env_file} down"
            self.run_command(stop_command, check=False)  # Não falhar se não houver serviços rodando
            
            # Iniciar novos serviços
            self.log("Iniciando novos serviços...")
            start_command = f"docker-compose -f {compose_file} --env-file {env_file} up -d"
            self.run_command(start_command)
            
            self.log("Serviços iniciados com sucesso", 'SUCCESS')
            return True
            
        except Exception as e:
            self.log(f"Erro ao fazer deploy dos serviços: {str(e)}", 'ERROR')
            return False
    
    def health_check(self) -> bool:
        """Verifica se os serviços estão saudáveis"""
        self.log("Verificando saúde dos serviços...", 'HEADER')
        
        try:
            compose_file = DOCKER_COMPOSE_FILES.get(self.environment, 'docker-compose.yml')
            env_file = f".env.{self.environment}"
            
            # Aguardar serviços ficarem prontos
            self.log("Aguardando serviços ficarem prontos...")
            time.sleep(30)  # Aguardar inicialização
            
            # Verificar status dos containers
            status_command = f"docker-compose -f {compose_file} --env-file {env_file} ps"
            result = self.run_command(status_command)
            
            if self.verbose:
                print(result.stdout)
            
            # Verificar health checks
            health_command = f"docker-compose -f {compose_file} --env-file {env_file} exec backend curl -f http://localhost:8000/api/health"
            
            max_attempts = 10
            for attempt in range(max_attempts):
                try:
                    self.run_command(health_command)
                    self.log("Health check passou", 'SUCCESS')
                    return True
                except subprocess.CalledProcessError:
                    if attempt == max_attempts - 1:
                        self.log("Health check falhou após múltiplas tentativas", 'ERROR')
                        return False
                    self.log(f"Health check falhou, tentativa {attempt + 1}/{max_attempts}")
                    time.sleep(10)
            
            return False
            
        except Exception as e:
            self.log(f"Erro no health check: {str(e)}", 'ERROR')
            return False
    
    def cleanup(self) -> bool:
        """Limpa recursos não utilizados"""
        self.log("Limpando recursos não utilizados...", 'HEADER')
        
        try:
            # Remover imagens não utilizadas
            self.run_command("docker image prune -f", check=False)
            
            # Remover volumes não utilizados (cuidado em produção)
            if self.environment == 'development':
                self.run_command("docker volume prune -f", check=False)
            
            self.log("Limpeza concluída", 'SUCCESS')
            return True
            
        except Exception as e:
            self.log(f"Erro na limpeza: {str(e)}", 'WARNING')
            return True  # Não falhar o deploy por causa da limpeza
    
    def deploy(self, skip_backup: bool = False, skip_build: bool = False) -> bool:
        """Executa o processo completo de deploy"""
        self.log(f"Iniciando deploy para ambiente: {self.environment}", 'HEADER')
        
        steps = [
            ("Verificar pré-requisitos", self.check_prerequisites),
        ]
        
        if not skip_backup:
            steps.append(("Fazer backup", self.backup_database))
        
        if not skip_build:
            steps.append(("Construir imagens", self.build_images))
        
        steps.extend([
            ("Fazer deploy", self.deploy_services),
            ("Executar migrações", self.run_migrations),
            ("Verificar saúde", self.health_check),
            ("Limpar recursos", self.cleanup)
        ])
        
        for step_name, step_func in steps:
            self.log(f"Executando: {step_name}", 'HEADER')
            if not step_func():
                self.log(f"Falha na etapa: {step_name}", 'ERROR')
                return False
        
        self.log("Deploy concluído com sucesso!", 'SUCCESS')
        return True

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description='Script de Deploy DataClinica')
    parser.add_argument(
        'environment',
        choices=['development', 'staging', 'production'],
        help='Ambiente de deploy'
    )
    parser.add_argument(
        '--skip-backup',
        action='store_true',
        help='Pular backup do banco de dados'
    )
    parser.add_argument(
        '--skip-build',
        action='store_true',
        help='Pular construção das imagens'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Output verboso'
    )
    
    args = parser.parse_args()
    
    # Confirmação para produção
    if args.environment == 'production':
        print(f"{Colors.WARNING}ATENÇÃO: Você está fazendo deploy para PRODUÇÃO!{Colors.ENDC}")
        confirmation = input("Digite 'CONFIRMO' para continuar: ")
        if confirmation != 'CONFIRMO':
            print("Deploy cancelado.")
            sys.exit(1)
    
    # Executar deploy
    deploy_manager = DeployManager(args.environment, args.verbose)
    
    try:
        success = deploy_manager.deploy(
            skip_backup=args.skip_backup,
            skip_build=args.skip_build
        )
        
        if success:
            print(f"{Colors.OKGREEN}Deploy concluído com sucesso!{Colors.ENDC}")
            sys.exit(0)
        else:
            print(f"{Colors.FAIL}Deploy falhou!{Colors.ENDC}")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Deploy interrompido pelo usuário{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print(f"{Colors.FAIL}Erro inesperado: {str(e)}{Colors.ENDC}")
        sys.exit(1)

if __name__ == '__main__':
    main()