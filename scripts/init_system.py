#!/usr/bin/env python3
"""
Script de Inicialização Completa do Sistema DataClínica

Este script executa todas as configurações necessárias para
inicializar o sistema DataClínica pela primeira vez.

Funcionalidades:
- Cria e configura o banco de dados
- Executa migrações
- Cria tenant padrão
- Cria usuário administrador
- Configura dados iniciais
- Verifica integridade do sistema

Uso:
    python scripts/init_system.py
    
Ou via Docker:
    docker-compose exec backend python scripts/init_system.py
"""

import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# Adiciona o diretório raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.base import Base
from app.models.user import User
from app.models.tenant import Tenant
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord
from app.models.appointment import Appointment
from app.models.inventory import InventoryItem, InventoryCategory
from app.models.audit import AuditLog
from app.models.lgpd import LGPDConsent, LGPDRequest


class SystemInitializer:
    """Classe para inicialização do sistema"""
    
    def __init__(self):
        self.engine = None
        self.session_factory = None
    
    async def initialize_database(self):
        """Inicializa conexão com banco de dados"""
        print("🔌 Conectando ao banco de dados...")
        
        try:
            self.engine = create_async_engine(
                settings.DATABASE_URL,
                echo=settings.DEBUG,
                pool_size=10,
                max_overflow=20
            )
            
            self.session_factory = sessionmaker(
                self.engine, 
                class_=AsyncSession, 
                expire_on_commit=False
            )
            
            # Testa conexão
            async with self.engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            
            print("✅ Conexão com banco de dados estabelecida")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao conectar com banco de dados: {e}")
            return False
    
    async def create_tables(self):
        """Cria todas as tabelas do sistema"""
        print("🏗️  Criando tabelas do banco de dados...")
        
        try:
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            print("✅ Tabelas criadas com sucesso")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao criar tabelas: {e}")
            return False
    
    async def create_default_tenant(self, session: AsyncSession):
        """Cria tenant padrão"""
        print("🏢 Criando tenant padrão...")
        
        # Verifica se já existe
        result = await session.execute(
            select(Tenant).where(Tenant.subdomain == "dataclinica")
        )
        tenant = result.scalar_one_or_none()
        
        if tenant:
            print(f"ℹ️  Tenant padrão já existe: {tenant.name}")
            return tenant
        
        # Cria novo tenant
        tenant = Tenant(
            name="DataClínica Hospital",
            subdomain="dataclinica",
            domain="dataclinica.local",
            is_active=True,
            plan="enterprise",
            max_users=1000,
            max_patients=50000,
            storage_limit=107374182400,  # 100GB
            settings={
                "hospital": {
                    "name": "Hospital DataClínica",
                    "cnpj": "00.000.000/0001-00",
                    "address": "Rua da Saúde, 123",
                    "city": "São Paulo",
                    "state": "SP",
                    "zip_code": "01000-000",
                    "phone": "(11) 1234-5678",
                    "email": "contato@dataclinica.com.br"
                },
                "system": {
                    "theme": "light",
                    "language": "pt-BR",
                    "timezone": "America/Sao_Paulo",
                    "date_format": "DD/MM/YYYY",
                    "time_format": "HH:mm"
                },
                "features": {
                    "multi_tenant": True,
                    "backup_enabled": True,
                    "audit_enabled": True,
                    "lgpd_enabled": True,
                    "2fa_enabled": True,
                    "encryption_enabled": True,
                    "api_access": True,
                    "mobile_app": True,
                    "telemedicine": True,
                    "prescription": True,
                    "billing": True,
                    "inventory": True,
                    "reports": True
                },
                "security": {
                    "password_policy": {
                        "min_length": 8,
                        "require_uppercase": True,
                        "require_lowercase": True,
                        "require_numbers": True,
                        "require_symbols": True,
                        "max_age_days": 90
                    },
                    "session_timeout": 480,
                    "max_login_attempts": 5,
                    "lockout_duration": 30
                },
                "notifications": {
                    "email_enabled": True,
                    "sms_enabled": False,
                    "push_enabled": True,
                    "appointment_reminders": True,
                    "medication_alerts": True,
                    "system_alerts": True
                }
            }
        )
        
        session.add(tenant)
        await session.commit()
        await session.refresh(tenant)
        
        print(f"✅ Tenant criado: {tenant.name}")
        return tenant
    
    async def create_inventory_categories(self, session: AsyncSession, tenant: Tenant):
        """Cria categorias padrão de estoque"""
        print("📦 Criando categorias de estoque...")
        
        categories = [
            {
                "nome": "Medicamentos",
                "descricao": "Medicamentos e fármacos",
                "codigo": "MED",
                "tipo": "medicamento"
            },
            {
                "nome": "Materiais Médicos",
                "descricao": "Materiais e equipamentos médicos",
                "codigo": "MAT",
                "tipo": "material"
            },
            {
                "nome": "Equipamentos",
                "descricao": "Equipamentos médicos e hospitalares",
                "codigo": "EQP",
                "tipo": "equipamento"
            },
            {
                "nome": "Descartáveis",
                "descricao": "Materiais descartáveis",
                "codigo": "DESC",
                "tipo": "descartavel"
            },
            {
                "nome": "Limpeza",
                "descricao": "Produtos de limpeza e higiene",
                "codigo": "LIMP",
                "tipo": "limpeza"
            }
        ]
        
        created_count = 0
        for cat_data in categories:
            # Verifica se já existe
            result = await session.execute(
                select(InventoryCategory).where(
                    InventoryCategory.codigo == cat_data["codigo"],
                    InventoryCategory.tenant_id == tenant.id
                )
            )
            existing = result.scalar_one_or_none()
            
            if not existing:
                category = InventoryCategory(
                    tenant_id=tenant.id,
                    **cat_data
                )
                session.add(category)
                created_count += 1
        
        if created_count > 0:
            await session.commit()
            print(f"✅ {created_count} categorias de estoque criadas")
        else:
            print("ℹ️  Categorias de estoque já existem")
    
    async def create_sample_data(self, session: AsyncSession, tenant: Tenant, admin_user: User):
        """Cria dados de exemplo para demonstração"""
        print("📊 Criando dados de exemplo...")
        
        # Paciente de exemplo
        sample_patient = Patient(
            tenant_id=tenant.id,
            nome_completo="João da Silva Santos",
            cpf="123.456.789-00",
            rg="12.345.678-9",
            data_nascimento=datetime(1980, 5, 15).date(),
            sexo="M",
            telefone="(11) 98765-4321",
            email="joao.santos@email.com",
            endereco={
                "logradouro": "Rua das Flores, 123",
                "bairro": "Centro",
                "cidade": "São Paulo",
                "estado": "SP",
                "cep": "01000-000",
                "complemento": "Apto 45"
            },
            contato_emergencia={
                "nome": "Maria Santos",
                "telefone": "(11) 91234-5678",
                "parentesco": "Esposa"
            },
            convenio={
                "nome": "Unimed",
                "numero_carteira": "123456789012345",
                "validade": "12/2025"
            },
            observacoes="Paciente exemplo para demonstração do sistema",
            created_by=admin_user.id
        )
        
        session.add(sample_patient)
        await session.commit()
        await session.refresh(sample_patient)
        
        # Prontuário de exemplo
        sample_record = MedicalRecord(
            tenant_id=tenant.id,
            patient_id=sample_patient.id,
            tipo="consulta",
            data_atendimento=datetime.now(),
            medico_responsavel=admin_user.id,
            especialidade="Clínica Geral",
            queixa_principal="Consulta de rotina",
            historia_doenca_atual="Paciente comparece para consulta de rotina, sem queixas específicas.",
            exame_fisico="Paciente em bom estado geral, sinais vitais normais.",
            hipotese_diagnostica="Paciente hígido",
            conduta="Orientações gerais de saúde, retorno em 6 meses.",
            observacoes="Consulta de rotina sem alterações",
            created_by=admin_user.id
        )
        
        session.add(sample_record)
        
        # Consulta agendada de exemplo
        sample_appointment = Appointment(
            tenant_id=tenant.id,
            patient_id=sample_patient.id,
            medico_id=admin_user.id,
            data_hora=datetime.now() + timedelta(days=7),
            tipo="consulta",
            especialidade="Clínica Geral",
            status="agendado",
            observacoes="Consulta de retorno",
            created_by=admin_user.id
        )
        
        session.add(sample_appointment)
        await session.commit()
        
        print("✅ Dados de exemplo criados")
    
    async def create_admin_user(self, session: AsyncSession, tenant: Tenant):
        """Cria usuário administrador interativo"""
        print("\n👤 Criação do Usuário Administrador")
        print("=" * 40)
        
        # Verifica se já existe admin
        result = await session.execute(
            select(User).where(
                User.tenant_id == tenant.id,
                User.is_superuser == True
            )
        )
        existing_admin = result.scalar_one_or_none()
        
        if existing_admin:
            print(f"ℹ️  Usuário administrador já existe: {existing_admin.email}")
            return existing_admin
        
        # Dados padrão para ambiente de desenvolvimento
        if settings.ENVIRONMENT == "development":
            email = "admin@dataclinica.com"
            nome = "Administrador do Sistema"
            senha = "admin123"
            print(f"🔧 Modo desenvolvimento - criando admin padrão: {email}")
        else:
            # Solicita dados em produção
            email = input("📧 Email do administrador: ").strip().lower()
            nome = input("👤 Nome completo: ").strip() or "Administrador"
            
            import getpass
            while True:
                senha = getpass.getpass("🔑 Senha (mín. 8 caracteres): ")
                if len(senha) >= 8:
                    break
                print("❌ Senha deve ter pelo menos 8 caracteres.")
        
        # Cria usuário admin
        admin_user = User(
            tenant_id=tenant.id,
            email=email,
            nome_completo=nome,
            username=email.split("@")[0],
            hashed_password=get_password_hash(senha),
            is_active=True,
            is_verified=True,
            is_superuser=True,
            tipo_usuario="admin",
            especialidade="Administração",
            crm="ADMIN001",
            permissoes={
                "admin": True,
                "create_users": True,
                "manage_system": True,
                "view_all_data": True,
                "export_data": True,
                "manage_backups": True,
                "view_audit_logs": True,
                "manage_lgpd": True,
                "manage_inventory": True,
                "manage_appointments": True,
                "manage_patients": True,
                "manage_billing": True,
                "view_reports": True
            }
        )
        
        session.add(admin_user)
        await session.commit()
        await session.refresh(admin_user)
        
        print(f"✅ Usuário administrador criado: {admin_user.email}")
        return admin_user
    
    async def verify_system_integrity(self, session: AsyncSession):
        """Verifica integridade do sistema"""
        print("🔍 Verificando integridade do sistema...")
        
        checks = [
            ("Tenants", select(Tenant)),
            ("Usuários", select(User)),
            ("Categorias de Estoque", select(InventoryCategory))
        ]
        
        all_ok = True
        for name, query in checks:
            try:
                result = await session.execute(query)
                count = len(result.scalars().all())
                print(f"  ✅ {name}: {count} registros")
            except Exception as e:
                print(f"  ❌ {name}: Erro - {e}")
                all_ok = False
        
        return all_ok
    
    async def cleanup(self):
        """Limpa recursos"""
        if self.engine:
            await self.engine.dispose()
    
    async def run(self):
        """Executa inicialização completa"""
        print("🏥 DataClínica - Inicialização do Sistema")
        print("=" * 50)
        print(f"🌍 Ambiente: {settings.ENVIRONMENT}")
        print(f"🗄️  Banco: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'Local'}")
        print("=" * 50)
        
        try:
            # 1. Inicializa banco
            if not await self.initialize_database():
                return False
            
            # 2. Cria tabelas
            if not await self.create_tables():
                return False
            
            async with self.session_factory() as session:
                # 3. Cria tenant padrão
                tenant = await self.create_default_tenant(session)
                
                # 4. Cria categorias de estoque
                await self.create_inventory_categories(session, tenant)
                
                # 5. Cria usuário admin
                admin_user = await self.create_admin_user(session, tenant)
                
                # 6. Cria dados de exemplo (apenas em desenvolvimento)
                if settings.ENVIRONMENT == "development":
                    await self.create_sample_data(session, tenant, admin_user)
                
                # 7. Verifica integridade
                if not await self.verify_system_integrity(session):
                    print("⚠️  Alguns problemas foram encontrados na verificação")
            
            print("\n🎉 Sistema inicializado com sucesso!")
            print("\n📋 Informações de Acesso:")
            print(f"🌐 Frontend: {settings.FRONTEND_URL or 'http://localhost:3000'}")
            print(f"🔌 API: {settings.BASE_URL or 'http://localhost:8000'}")
            print(f"📚 Docs: {settings.BASE_URL or 'http://localhost:8000'}/docs")
            
            if settings.ENVIRONMENT == "development":
                print(f"👤 Admin: admin@dataclinica.com")
                print(f"🔑 Senha: admin123")
            
            print("\n🚀 Próximos passos:")
            print("1. Acesse o sistema via navegador")
            print("2. Faça login com as credenciais do administrador")
            print("3. Configure outros usuários e permissões")
            print("4. Personalize as configurações do hospital")
            print("5. Configure backup e monitoramento")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro durante inicialização: {e}")
            return False
        
        finally:
            await self.cleanup()


async def main():
    """Função principal"""
    initializer = SystemInitializer()
    success = await initializer.run()
    
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    # Verifica dependências
    try:
        from app.core.config import settings
    except ImportError as e:
        print(f"❌ Erro ao importar configurações: {e}")
        print("Certifique-se de que está no diretório correto e as dependências estão instaladas.")
        sys.exit(1)
    
    # Executa inicialização
    asyncio.run(main())