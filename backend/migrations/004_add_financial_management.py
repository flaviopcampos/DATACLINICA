"""Adicionar tabelas de gestão financeira e auditoria

Revision ID: 004
Revises: 003
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None

def upgrade():
    # Criar tabela de notas fiscais NFS-e
    op.create_table('invoice_nfs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=True),
        sa.Column('number', sa.String(length=50), nullable=True),
        sa.Column('series', sa.String(length=10), nullable=True),
        sa.Column('issue_date', sa.Date(), nullable=False),
        sa.Column('service_date', sa.Date(), nullable=False),
        sa.Column('gross_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tax_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('net_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('service_code', sa.String(length=20), nullable=False),
        sa.Column('service_description', sa.Text(), nullable=False),
        sa.Column('city_code', sa.String(length=10), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('xml_content', sa.Text(), nullable=True),
        sa.Column('pdf_path', sa.String(length=500), nullable=True),
        sa.Column('protocol_number', sa.String(length=50), nullable=True),
        sa.Column('verification_code', sa.String(length=50), nullable=True),
        sa.Column('cancellation_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoice_nfs_id'), 'invoice_nfs', ['id'], unique=False)
    op.create_index('ix_invoice_nfs_clinic_date', 'invoice_nfs', ['clinic_id', 'issue_date'], unique=False)
    op.create_index('ix_invoice_nfs_status', 'invoice_nfs', ['status'], unique=False)
    
    # Criar tabela de centros de custo
    op.create_table('cost_centers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['parent_id'], ['cost_centers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cost_centers_id'), 'cost_centers', ['id'], unique=False)
    op.create_index('ix_cost_centers_clinic_code', 'cost_centers', ['clinic_id', 'code'], unique=True)
    
    # Criar tabela de configurações de impostos
    op.create_table('tax_configurations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('tax_type', sa.String(length=50), nullable=False),
        sa.Column('rate', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('effective_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tax_configurations_id'), 'tax_configurations', ['id'], unique=False)
    op.create_index('ix_tax_configurations_clinic_type', 'tax_configurations', ['clinic_id', 'tax_type'], unique=False)
    
    # Criar tabela de contas bancárias
    op.create_table('bank_accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('bank_code', sa.String(length=10), nullable=False),
        sa.Column('bank_name', sa.String(length=100), nullable=False),
        sa.Column('agency', sa.String(length=20), nullable=False),
        sa.Column('account_number', sa.String(length=30), nullable=False),
        sa.Column('account_type', sa.String(length=20), nullable=False),
        sa.Column('balance', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bank_accounts_id'), 'bank_accounts', ['id'], unique=False)
    op.create_index('ix_bank_accounts_clinic', 'bank_accounts', ['clinic_id'], unique=False)
    
    # Criar tabela de conciliação bancária
    op.create_table('bank_reconciliations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('bank_account_id', sa.Integer(), nullable=False),
        sa.Column('reference_date', sa.Date(), nullable=False),
        sa.Column('bank_balance', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('book_balance', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('difference', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('reconciled_by', sa.Integer(), nullable=True),
        sa.Column('reconciled_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['bank_account_id'], ['bank_accounts.id'], ),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['reconciled_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bank_reconciliations_id'), 'bank_reconciliations', ['id'], unique=False)
    op.create_index('ix_bank_reconciliations_clinic_date', 'bank_reconciliations', ['clinic_id', 'reference_date'], unique=False)
    
    # Criar tabela de repasses médicos
    op.create_table('doctor_payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('reference_period', sa.String(length=7), nullable=False),
        sa.Column('gross_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tax_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('net_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('procedures_count', sa.Integer(), nullable=False),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_doctor_payments_id'), 'doctor_payments', ['id'], unique=False)
    op.create_index('ix_doctor_payments_clinic_period', 'doctor_payments', ['clinic_id', 'reference_period'], unique=False)
    
    # Criar tabela de KPIs financeiros
    op.create_table('financial_kpis',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('reference_date', sa.Date(), nullable=False),
        sa.Column('kpi_type', sa.String(length=50), nullable=False),
        sa.Column('value', sa.Numeric(precision=15, scale=4), nullable=False),
        sa.Column('target_value', sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column('unit', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_financial_kpis_id'), 'financial_kpis', ['id'], unique=False)
    op.create_index('ix_financial_kpis_clinic_date_type', 'financial_kpis', ['clinic_id', 'reference_date', 'kpi_type'], unique=True)
    
    # Criar tabela de fornecedores
    op.create_table('suppliers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('document', sa.String(length=20), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_suppliers_id'), 'suppliers', ['id'], unique=False)
    op.create_index('ix_suppliers_clinic_document', 'suppliers', ['clinic_id', 'document'], unique=True)
    
    # Criar tabela de auditoria
    op.create_table('audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=20), nullable=False),
        sa.Column('table_name', sa.String(length=50), nullable=False),
        sa.Column('record_id', sa.Integer(), nullable=False),
        sa.Column('old_values', sa.Text(), nullable=True),
        sa.Column('new_values', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index('ix_audit_logs_clinic_timestamp', 'audit_logs', ['clinic_id', 'timestamp'], unique=False)
    op.create_index('ix_audit_logs_table_record', 'audit_logs', ['table_name', 'record_id'], unique=False)
    
    # Adicionar colunas de relacionamento às tabelas existentes
    op.add_column('accounts_payable', sa.Column('cost_center_id', sa.Integer(), sa.ForeignKey('cost_centers.id'), nullable=True))
    op.add_column('accounts_payable', sa.Column('supplier_id', sa.Integer(), sa.ForeignKey('suppliers.id'), nullable=True))
    op.add_column('accounts_receivable', sa.Column('cost_center_id', sa.Integer(), sa.ForeignKey('cost_centers.id'), nullable=True))

def downgrade():
    # Remover colunas adicionadas
    op.drop_column('accounts_receivable', 'cost_center_id')
    op.drop_column('accounts_payable', 'supplier_id')
    op.drop_column('accounts_payable', 'cost_center_id')
    
    # Remover tabelas criadas
    op.drop_table('audit_logs')
    op.drop_table('suppliers')
    op.drop_table('financial_kpis')
    op.drop_table('doctor_payments')
    op.drop_table('bank_reconciliations')
    op.drop_table('bank_accounts')
    op.drop_table('tax_configurations')
    op.drop_table('cost_centers')
    op.drop_table('invoice_nfs')