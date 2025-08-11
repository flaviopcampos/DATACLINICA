#!/usr/bin/env python3
"""
Script para criar usuário administrador inicial do DataClínica

Este script cria o primeiro usuário administrador do sistema,
que pode ser usado para acessar o sistema e criar outros usuários.

Uso:
    python scripts/create_admin.py
    
Ou via Docker:
    docker-compose exec backend python scripts/create_admin.py
"""

import asyncio
import getpass
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path para importar os módulos
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.tenant import Tenant
from app.models.base import Base


async def create_database_tables():
    """Cria as tabelas do banco de dados se não existirem"""
    engine = create_async_engine(settings.DATABASE_URL)
    
    async with engine.begin() as conn:
        # Cria todas as tabelas
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("✅ Tabelas do banco de dados verificadas/criadas")


async def create_default_tenant(session: AsyncSession):
    """Cria o tenant padrão se não existir"""
    # Verifica se já existe um tenant padrão
    result = await session.execute(
        select(Tenant).where(Tenant.subdomain == "dataclinica")
    )
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        tenant = Tenant(
            name="DataClínica Master",
            subdomain="dataclinica",
            domain="dataclinica.local",
            is_active=True,
            plan="enterprise",
            max_users=1000,
            max_patients=10000,
            storage_limit=107374182400,  # 100GB
            settings={
                "theme": "light",
                "language": "pt-BR",
                "timezone": "America/Sao_Paulo",
                "features": {
                    "multi_tenant": True,
                    "backup_enabled": True,
                    "audit_enabled": True,
                    "lgpd_enabled": True,
                    "2fa_enabled": True
                }
            }
        )
        session.add(tenant)
        await session.commit()
        await session.refresh(tenant)
        print(f"✅ Tenant padrão criado: {tenant.name}")
    else:
        print(f"ℹ️  Tenant padrão já existe: {tenant.name}")
    
    return tenant


async def create_admin_user(session: AsyncSession, tenant: Tenant):
    """Cria o usuário administrador"""
    print("\n🔐 Criação do Usuário Administrador")
    print("=" * 40)
    
    # Solicita dados do administrador
    while True:
        email = input("📧 Email do administrador: ").strip().lower()
        if email and "@" in email:
            break
        print("❌ Email inválido. Tente novamente.")
    
    # Verifica se o usuário já existe
    result = await session.execute(
        select(User).where(User.email == email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        print(f"❌ Usuário com email {email} já existe!")
        return None
    
    # Solicita outros dados
    nome_completo = input("👤 Nome completo: ").strip()
    if not nome_completo:
        nome_completo = "Administrador"
    
    # Solicita senha
    while True:
        senha = getpass.getpass("🔑 Senha (mín. 8 caracteres): ")
        if len(senha) >= 8:
            senha_confirmacao = getpass.getpass("🔑 Confirme a senha: ")
            if senha == senha_confirmacao:
                break
            else:
                print("❌ Senhas não coincidem. Tente novamente.")
        else:
            print("❌ Senha deve ter pelo menos 8 caracteres.")
    
    # Cria o usuário administrador
    admin_user = User(
        email=email,
        nome_completo=nome_completo,
        username=email.split("@")[0],
        hashed_password=get_password_hash(senha),
        is_active=True,
        is_verified=True,
        is_superuser=True,
        tenant_id=tenant.id,
        tipo_usuario="admin",
        permissoes={
            "admin": True,
            "create_users": True,
            "manage_system": True,
            "view_all_data": True,
            "export_data": True,
            "manage_backups": True,
            "view_audit_logs": True,
            "manage_lgpd": True
        },
        configuracoes={
            "theme": "light",
            "language": "pt-BR",
            "timezone": "America/Sao_Paulo",
            "notifications": {
                "email": True,
                "push": True,
                "sms": False
            },
            "security": {
                "2fa_enabled": False,
                "session_timeout": 480,
                "password_change_required": False
            }
        }
    )
    
    session.add(admin_user)
    await session.commit()
    await session.refresh(admin_user)
    
    print(f"\n✅ Usuário administrador criado com sucesso!")
    print(f"📧 Email: {admin_user.email}")
    print(f"👤 Nome: {admin_user.nome_completo}")
    print(f"🏢 Tenant: {tenant.name}")
    print(f"🆔 ID: {admin_user.id}")
    
    return admin_user


async def main():
    """Função principal"""
    print("🏥 DataClínica - Criação de Usuário Administrador")
    print("=" * 50)
    
    try:
        # Cria as tabelas do banco
        await create_database_tables()
        
        # Cria sessão do banco
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        
        async with async_session() as session:
            # Cria tenant padrão
            tenant = await create_default_tenant(session)
            
            # Cria usuário administrador
            admin_user = await create_admin_user(session, tenant)
            
            if admin_user:
                print("\n🎉 Configuração inicial concluída!")
                print("\n📋 Próximos passos:")
                print("1. Acesse o sistema em http://localhost:3000")
                print(f"2. Faça login com: {admin_user.email}")
                print("3. Configure outros usuários e permissões")
                print("4. Personalize as configurações do sistema")
                print("\n🔐 Recomendações de segurança:")
                print("- Ative a autenticação multifator (2FA)")
                print("- Configure backup automático")
                print("- Revise os logs de auditoria regularmente")
                print("- Mantenha o sistema sempre atualizado")
        
        await engine.dispose()
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário administrador: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Verifica se está sendo executado em ambiente adequado
    try:
        from app.core.config import settings
    except ImportError:
        print("❌ Erro: Não foi possível importar as configurações.")
        print("Certifique-se de que está executando no diretório correto.")
        sys.exit(1)
    
    # Executa o script
    asyncio.run(main())