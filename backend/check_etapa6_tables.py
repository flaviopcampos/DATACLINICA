#!/usr/bin/env python3
"""
Script para verificar se as tabelas da Etapa 6 foram criadas
"""

from database import engine
from sqlalchemy import text

def check_etapa6_tables():
    """Verifica se as tabelas da Etapa 6 existem"""
    
    etapa6_tables = [
        'saved_reports',
        'report_executions', 
        'custom_dashboards',
        'dashboard_widgets',
        'performance_metrics',
        'bi_alerts',
        'alert_configurations'
    ]
    
    print("=== VERIFICANDO TABELAS DA ETAPA 6 ===")
    
    with engine.connect() as conn:
        for table_name in etapa6_tables:
            try:
                result = conn.execute(text(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '{table_name}'
                    )
                """))
                
                exists = result.scalar()
                status = "✅" if exists else "❌"
                print(f"{status} {table_name}: {'Existe' if exists else 'Não encontrada'}")
                
            except Exception as e:
                print(f"❌ Erro ao verificar {table_name}: {e}")
    
    print("\n=== VERIFICAÇÃO CONCLUÍDA ===")

if __name__ == "__main__":
    check_etapa6_tables()