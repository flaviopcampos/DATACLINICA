from database import engine
from sqlalchemy import text

def check_etapa6_tables():
    with engine.connect() as conn:
        # Verificar todas as tabelas
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """))
        all_tables = [row[0] for row in result]
        
        print("=== TODAS AS TABELAS ===")
        for table in all_tables:
            print(f"- {table}")
        
        print("\n=== TABELAS DA ETAPA 6 (Relatórios e BI) ===")
        etapa6_tables = [
            'saved_reports',
            'report_executions', 
            'custom_dashboards',
            'dashboard_widgets',
            'performance_metrics',
            'bi_alerts',
            'alert_configurations'
        ]
        
        found_tables = []
        for table_name in etapa6_tables:
            if table_name in all_tables:
                found_tables.append(table_name)
                print(f"✅ {table_name}")
            else:
                print(f"❌ {table_name}")
        
        if not found_tables:
            print("❌ Nenhuma tabela da Etapa 6 encontrada")
        else:
            print(f"\n✅ Total de {len(found_tables)} tabelas da Etapa 6 encontradas")
        
        return len(found_tables) > 0

if __name__ == "__main__":
    check_etapa6_tables()