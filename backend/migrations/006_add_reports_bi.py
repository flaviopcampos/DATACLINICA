#!/usr/bin/env python3
"""
Migração 006: Etapa 6 - Relatórios e BI

Implementa:
- Tabelas para relatórios administrativos
- Indicadores gráficos (BI)
- Métricas de performance
- Dashboards personalizados
"""

import os
import sys
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Date, Boolean, ForeignKey, JSON, text
from sqlalchemy.types import DECIMAL as SQLDecimal
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func

# Adicionar o diretório pai ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import DATABASE_URL
import models

# Configuração do banco
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_migration():
    """Executa a migração da Etapa 6"""
    print("🚀 Iniciando Migração 006: Etapa 6 - Relatórios e BI")
    
    try:
        # Criar as tabelas
        create_tables()
        
        # Inserir dados de exemplo
        insert_sample_data()
        
        print("✅ Migração 006 concluída com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
        raise

def create_tables():
    """Cria as tabelas para relatórios e BI"""
    print("📊 Criando tabelas de relatórios e BI...")
    
    # Garantir que todas as tabelas sejam criadas
    models.Base.metadata.create_all(bind=engine)
    
    # Criar tabelas específicas da Etapa 6
    with engine.connect() as conn:
        conn.execute(text("""
        -- Tabela de Relatórios Salvos
    CREATE TABLE IF NOT EXISTS saved_reports (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinics(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        report_type VARCHAR(100) NOT NULL, -- 'administrative', 'financial', 'clinical', 'bi'
        report_config JSONB NOT NULL, -- Configurações do relatório (filtros, parâmetros)
        is_public BOOLEAN DEFAULT FALSE,
        is_scheduled BOOLEAN DEFAULT FALSE,
        schedule_config JSONB, -- Configurações de agendamento
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Tabela de Execuções de Relatórios
    CREATE TABLE IF NOT EXISTS report_executions (
        id SERIAL PRIMARY KEY,
        saved_report_id INTEGER NOT NULL REFERENCES saved_reports(id),
        executed_by INTEGER REFERENCES users(id),
        execution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parameters JSONB,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
        file_path VARCHAR(500),
        file_size INTEGER,
        execution_time_ms INTEGER,
        error_message TEXT
    );
    
    -- Tabela de Dashboards Personalizados
    CREATE TABLE IF NOT EXISTS custom_dashboards (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinics(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        layout_config JSONB NOT NULL, -- Configuração do layout (widgets, posições)
        is_default BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Tabela de Widgets de Dashboard
    CREATE TABLE IF NOT EXISTS dashboard_widgets (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER NOT NULL REFERENCES custom_dashboards(id),
        widget_type VARCHAR(100) NOT NULL, -- 'chart', 'kpi', 'table', 'gauge'
        title VARCHAR(255) NOT NULL,
        position_x INTEGER DEFAULT 0,
        position_y INTEGER DEFAULT 0,
        width INTEGER DEFAULT 4,
        height INTEGER DEFAULT 3,
        config JSONB NOT NULL, -- Configurações específicas do widget
        data_source VARCHAR(255), -- Fonte dos dados
        refresh_interval INTEGER DEFAULT 300, -- Intervalo de atualização em segundos
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Tabela de Métricas de Performance
    CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinics(id),
        metric_date DATE NOT NULL,
        metric_type VARCHAR(100) NOT NULL, -- 'daily', 'weekly', 'monthly'
        
        -- Métricas de Atendimento
        total_appointments INTEGER DEFAULT 0,
        completed_appointments INTEGER DEFAULT 0,
        cancelled_appointments INTEGER DEFAULT 0,
        no_show_appointments INTEGER DEFAULT 0,
        average_wait_time INTEGER DEFAULT 0, -- em minutos
        average_consultation_time INTEGER DEFAULT 0, -- em minutos
        
        -- Métricas de Pacientes
        new_patients INTEGER DEFAULT 0,
        returning_patients INTEGER DEFAULT 0,
        total_active_patients INTEGER DEFAULT 0,
        
        -- Métricas Financeiras
        total_revenue DECIMAL(15,2) DEFAULT 0,
        total_expenses DECIMAL(15,2) DEFAULT 0,
        net_profit DECIMAL(15,2) DEFAULT 0,
        accounts_receivable DECIMAL(15,2) DEFAULT 0,
        accounts_payable DECIMAL(15,2) DEFAULT 0,
        
        -- Métricas por Convênio
        revenue_by_insurance JSONB, -- {"insurance_name": revenue_amount}
        procedures_by_insurance JSONB, -- {"insurance_name": procedure_count}
        
        -- Métricas por Especialidade
        revenue_by_specialty JSONB, -- {"specialty": revenue_amount}
        appointments_by_specialty JSONB, -- {"specialty": appointment_count}
        
        -- Métricas por Profissional
        revenue_by_doctor JSONB, -- {"doctor_id": revenue_amount}
        appointments_by_doctor JSONB, -- {"doctor_id": appointment_count}
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Tabela de Alertas de BI
    CREATE TABLE IF NOT EXISTS bi_alerts (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinics(id),
        alert_type VARCHAR(100) NOT NULL, -- 'performance', 'financial', 'operational'
        severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        metric_value DECIMAL(15,2),
        threshold_value DECIMAL(15,2),
        comparison_operator VARCHAR(10), -- '>', '<', '>=', '<=', '=', '!='
        is_active BOOLEAN DEFAULT TRUE,
        is_resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        resolved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Tabela de Configurações de Alertas
    CREATE TABLE IF NOT EXISTS alert_configurations (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinics(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        alert_name VARCHAR(255) NOT NULL,
        metric_type VARCHAR(100) NOT NULL,
        threshold_value DECIMAL(15,2) NOT NULL,
        comparison_operator VARCHAR(10) NOT NULL,
        notification_method VARCHAR(50) DEFAULT 'dashboard', -- 'dashboard', 'email', 'sms'
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_saved_reports_clinic_type ON saved_reports(clinic_id, report_type);
    CREATE INDEX IF NOT EXISTS idx_report_executions_date ON report_executions(execution_date);
    CREATE INDEX IF NOT EXISTS idx_custom_dashboards_clinic_user ON custom_dashboards(clinic_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_clinic_date ON performance_metrics(clinic_id, metric_date);
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
    CREATE INDEX IF NOT EXISTS idx_bi_alerts_clinic_active ON bi_alerts(clinic_id, is_active);
    CREATE INDEX IF NOT EXISTS idx_alert_configurations_clinic ON alert_configurations(clinic_id, is_active);
    """))
        conn.commit()
    
    print("✅ Tabelas de relatórios e BI criadas com sucesso!")

def insert_sample_data():
    """Insere dados de exemplo para relatórios e BI"""
    print("📊 Inserindo dados de exemplo para relatórios e BI...")
    
    db = SessionLocal()
    
    try:
        # Buscar clínica de exemplo
        clinic = db.query(models.Clinic).first()
        if not clinic:
            print("⚠️ Nenhuma clínica encontrada. Criando clínica de exemplo...")
            clinic = models.Clinic(
                name="Clínica Exemplo",
                cnpj="12.345.678/0001-90",
                address="Rua Exemplo, 123",
                phone="(11) 1234-5678",
                email="contato@clinicaexemplo.com.br"
            )
            db.add(clinic)
            db.commit()
            db.refresh(clinic)
        
        # Buscar usuário admin
        admin_user = db.query(models.User).filter(
            models.User.clinic_id == clinic.id,
            models.User.role == "admin"
        ).first()
        
        if not admin_user:
            print("⚠️ Usuário admin não encontrado. Pulando inserção de dados de exemplo.")
            return
        
        # Inserir relatórios salvos de exemplo
        sample_reports = [
            {
                "name": "Relatório Mensal de Atendimentos",
                "description": "Relatório detalhado dos atendimentos realizados no mês",
                "report_type": "administrative",
                "report_config": {
                    "period": "monthly",
                    "groupBy": ["specialty", "doctor"],
                    "metrics": ["total_appointments", "revenue", "patient_satisfaction"]
                }
            },
            {
                "name": "Dashboard Financeiro Executivo",
                "description": "Visão executiva das métricas financeiras",
                "report_type": "financial",
                "report_config": {
                    "period": "quarterly",
                    "charts": ["revenue_trend", "profit_margin", "accounts_receivable"]
                }
            },
            {
                "name": "Análise de Performance por Convênio",
                "description": "Análise detalhada da performance por convênio médico",
                "report_type": "bi",
                "report_config": {
                    "period": "monthly",
                    "dimensions": ["insurance_company", "procedure_type"],
                    "metrics": ["revenue", "volume", "average_ticket", "gloss_rate"]
                }
            }
        ]
        
        for report_data in sample_reports:
            existing_report = db.query(models.SavedReport).filter(
                models.SavedReport.clinic_id == clinic.id,
                models.SavedReport.name == report_data["name"]
            ).first()
            
            if not existing_report:
                report = models.SavedReport(
                    clinic_id=clinic.id,
                    user_id=admin_user.id,
                    **report_data
                )
                db.add(report)
        
        # Inserir dashboard personalizado de exemplo
        dashboard_config = {
            "layout": "grid",
            "columns": 12,
            "widgets": [
                {
                    "id": "revenue_chart",
                    "type": "line_chart",
                    "title": "Receita Mensal",
                    "position": {"x": 0, "y": 0, "w": 6, "h": 4},
                    "dataSource": "financial_metrics",
                    "config": {"metric": "total_revenue", "period": "monthly"}
                },
                {
                    "id": "appointments_kpi",
                    "type": "kpi",
                    "title": "Atendimentos Hoje",
                    "position": {"x": 6, "y": 0, "w": 3, "h": 2},
                    "dataSource": "appointments",
                    "config": {"metric": "daily_count", "comparison": "yesterday"}
                },
                {
                    "id": "revenue_kpi",
                    "type": "kpi",
                    "title": "Receita do Mês",
                    "position": {"x": 9, "y": 0, "w": 3, "h": 2},
                    "dataSource": "financial_metrics",
                    "config": {"metric": "monthly_revenue", "comparison": "last_month"}
                }
            ]
        }
        
        existing_dashboard = db.query(models.CustomDashboard).filter(
            models.CustomDashboard.clinic_id == clinic.id,
            models.CustomDashboard.name == "Dashboard Executivo"
        ).first()
        
        if not existing_dashboard:
            dashboard = models.CustomDashboard(
                clinic_id=clinic.id,
                user_id=admin_user.id,
                name="Dashboard Executivo",
                description="Dashboard principal com métricas executivas",
                layout_config=dashboard_config,
                is_default=True,
                is_public=True
            )
            db.add(dashboard)
        
        # Inserir métricas de performance de exemplo (últimos 30 dias)
        today = date.today()
        for i in range(30):
            metric_date = today - timedelta(days=i)
            
            existing_metric = db.query(models.PerformanceMetric).filter(
                models.PerformanceMetric.clinic_id == clinic.id,
                models.PerformanceMetric.metric_date == metric_date,
                models.PerformanceMetric.metric_type == "daily"
            ).first()
            
            if not existing_metric:
                # Simular dados realistas
                base_appointments = 25 + (i % 10)  # Variação de 25-35 atendimentos
                revenue = Decimal(str(base_appointments * 150))  # R$ 150 por atendimento em média
                
                metric = models.PerformanceMetric(
                    clinic_id=clinic.id,
                    metric_date=metric_date,
                    metric_type="daily",
                    total_appointments=base_appointments,
                    completed_appointments=int(base_appointments * 0.9),
                    cancelled_appointments=int(base_appointments * 0.05),
                    no_show_appointments=int(base_appointments * 0.05),
                    average_wait_time=15 + (i % 10),  # 15-25 minutos
                    average_consultation_time=30 + (i % 15),  # 30-45 minutos
                    new_patients=3 + (i % 5),  # 3-8 pacientes novos
                    returning_patients=base_appointments - (3 + (i % 5)),
                    total_revenue=revenue,
                    total_expenses=revenue * Decimal('0.7'),  # 70% de custos
                    net_profit=revenue * Decimal('0.3'),  # 30% de lucro
                    revenue_by_insurance={
                        "Unimed": float(revenue * Decimal('0.4')),
                        "Bradesco": float(revenue * Decimal('0.3')),
                        "Particular": float(revenue * Decimal('0.3'))
                    },
                    appointments_by_specialty={
                        "Clínica Geral": int(base_appointments * 0.4),
                        "Cardiologia": int(base_appointments * 0.3),
                        "Dermatologia": int(base_appointments * 0.3)
                    }
                )
                db.add(metric)
        
        # Inserir configurações de alertas de exemplo
        alert_configs = [
            {
                "alert_name": "Receita Diária Baixa",
                "metric_type": "daily_revenue",
                "threshold_value": Decimal('2000.00'),
                "comparison_operator": "<",
                "notification_method": "dashboard"
            },
            {
                "alert_name": "Taxa de No-Show Alta",
                "metric_type": "no_show_rate",
                "threshold_value": Decimal('10.0'),
                "comparison_operator": ">",
                "notification_method": "email"
            },
            {
                "alert_name": "Tempo de Espera Excessivo",
                "metric_type": "average_wait_time",
                "threshold_value": Decimal('30.0'),
                "comparison_operator": ">",
                "notification_method": "dashboard"
            }
        ]
        
        for config_data in alert_configs:
            existing_config = db.query(models.AlertConfiguration).filter(
                models.AlertConfiguration.clinic_id == clinic.id,
                models.AlertConfiguration.alert_name == config_data["alert_name"]
            ).first()
            
            if not existing_config:
                config = models.AlertConfiguration(
                    clinic_id=clinic.id,
                    user_id=admin_user.id,
                    **config_data
                )
                db.add(config)
        
        db.commit()
        print("✅ Dados de exemplo inseridos com sucesso!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao inserir dados de exemplo: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()