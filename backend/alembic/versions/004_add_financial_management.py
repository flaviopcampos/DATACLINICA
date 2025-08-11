"""Add financial management tables

Revision ID: 004
Revises: 003
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None

def upgrade():
    # Create invoice_nfs table
    op.create_table('invoice_nfs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=True),
        sa.Column('service_description', sa.Text(), nullable=False),
        sa.Column('service_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('iss_rate', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('iss_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('net_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('nfs_number', sa.String(length=50), nullable=True),
        sa.Column('verification_code', sa.String(length=50), nullable=True),
        sa.Column('issue_date', sa.DateTime(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoice_nfs_clinic_id'), 'invoice_nfs', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_invoice_nfs_status'), 'invoice_nfs', ['status'], unique=False)
    op.create_index(op.f('ix_invoice_nfs_nfs_number'), 'invoice_nfs', ['nfs_number'], unique=False)

    # Create cost_centers table
    op.create_table('cost_centers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['parent_id'], ['cost_centers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cost_centers_clinic_id'), 'cost_centers', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_cost_centers_code'), 'cost_centers', ['code'], unique=False)

    # Create tax_configurations table
    op.create_table('tax_configurations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('tax_type', sa.String(length=20), nullable=False),
        sa.Column('rate', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('description', sa.String(length=200), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('effective_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tax_configurations_clinic_id'), 'tax_configurations', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_tax_configurations_tax_type'), 'tax_configurations', ['tax_type'], unique=False)

    # Create bank_accounts table
    op.create_table('bank_accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('bank_name', sa.String(length=100), nullable=False),
        sa.Column('bank_code', sa.String(length=10), nullable=False),
        sa.Column('agency', sa.String(length=20), nullable=False),
        sa.Column('account_number', sa.String(length=30), nullable=False),
        sa.Column('account_type', sa.String(length=20), nullable=False),
        sa.Column('current_balance', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bank_accounts_clinic_id'), 'bank_accounts', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_bank_accounts_bank_code'), 'bank_accounts', ['bank_code'], unique=False)

    # Create bank_reconciliations table
    op.create_table('bank_reconciliations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('bank_account_id', sa.Integer(), nullable=False),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('description', sa.String(length=200), nullable=False),
        sa.Column('amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('transaction_type', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('reconciled_at', sa.DateTime(), nullable=True),
        sa.Column('reconciled_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['bank_account_id'], ['bank_accounts.id'], ),
        sa.ForeignKeyConstraint(['reconciled_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bank_reconciliations_bank_account_id'), 'bank_reconciliations', ['bank_account_id'], unique=False)
    op.create_index(op.f('ix_bank_reconciliations_status'), 'bank_reconciliations', ['status'], unique=False)

    # Create doctor_payments table
    op.create_table('doctor_payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('reference_period', sa.String(length=7), nullable=False),
        sa.Column('total_procedures', sa.Integer(), nullable=False),
        sa.Column('gross_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('commission_rate', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('commission_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('deductions', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('net_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_doctor_payments_clinic_id'), 'doctor_payments', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_doctor_payments_doctor_id'), 'doctor_payments', ['doctor_id'], unique=False)
    op.create_index(op.f('ix_doctor_payments_reference_period'), 'doctor_payments', ['reference_period'], unique=False)

    # Create financial_kpis table
    op.create_table('financial_kpis',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('kpi_type', sa.String(length=50), nullable=False),
        sa.Column('period_type', sa.String(length=20), nullable=False),
        sa.Column('reference_date', sa.Date(), nullable=False),
        sa.Column('value', sa.Numeric(precision=15, scale=4), nullable=False),
        sa.Column('target_value', sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column('unit', sa.String(length=20), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_financial_kpis_clinic_id'), 'financial_kpis', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_financial_kpis_kpi_type'), 'financial_kpis', ['kpi_type'], unique=False)
    op.create_index(op.f('ix_financial_kpis_reference_date'), 'financial_kpis', ['reference_date'], unique=False)

    # Create suppliers table
    op.create_table('suppliers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('cnpj_cpf', sa.String(length=18), nullable=True),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('payment_terms', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_suppliers_clinic_id'), 'suppliers', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_suppliers_category'), 'suppliers', ['category'], unique=False)
    op.create_index(op.f('ix_suppliers_cnpj_cpf'), 'suppliers', ['cnpj_cpf'], unique=False)

    # Add cost_center_id to accounts_payable table
    op.add_column('accounts_payable', sa.Column('cost_center_id', sa.Integer(), nullable=True))
    op.add_column('accounts_payable', sa.Column('supplier_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_accounts_payable_cost_center', 'accounts_payable', 'cost_centers', ['cost_center_id'], ['id'])
    op.create_foreign_key('fk_accounts_payable_supplier', 'accounts_payable', 'suppliers', ['supplier_id'], ['id'])

    # Add cost_center_id to accounts_receivable table
    op.add_column('accounts_receivable', sa.Column('cost_center_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_accounts_receivable_cost_center', 'accounts_receivable', 'cost_centers', ['cost_center_id'], ['id'])

def downgrade():
    # Remove foreign keys and columns from existing tables
    op.drop_constraint('fk_accounts_receivable_cost_center', 'accounts_receivable', type_='foreignkey')
    op.drop_column('accounts_receivable', 'cost_center_id')
    
    op.drop_constraint('fk_accounts_payable_supplier', 'accounts_payable', type_='foreignkey')
    op.drop_constraint('fk_accounts_payable_cost_center', 'accounts_payable', type_='foreignkey')
    op.drop_column('accounts_payable', 'supplier_id')
    op.drop_column('accounts_payable', 'cost_center_id')

    # Drop new tables
    op.drop_index(op.f('ix_suppliers_cnpj_cpf'), table_name='suppliers')
    op.drop_index(op.f('ix_suppliers_category'), table_name='suppliers')
    op.drop_index(op.f('ix_suppliers_clinic_id'), table_name='suppliers')
    op.drop_table('suppliers')
    
    op.drop_index(op.f('ix_financial_kpis_reference_date'), table_name='financial_kpis')
    op.drop_index(op.f('ix_financial_kpis_kpi_type'), table_name='financial_kpis')
    op.drop_index(op.f('ix_financial_kpis_clinic_id'), table_name='financial_kpis')
    op.drop_table('financial_kpis')
    
    op.drop_index(op.f('ix_doctor_payments_reference_period'), table_name='doctor_payments')
    op.drop_index(op.f('ix_doctor_payments_doctor_id'), table_name='doctor_payments')
    op.drop_index(op.f('ix_doctor_payments_clinic_id'), table_name='doctor_payments')
    op.drop_table('doctor_payments')
    
    op.drop_index(op.f('ix_bank_reconciliations_status'), table_name='bank_reconciliations')
    op.drop_index(op.f('ix_bank_reconciliations_bank_account_id'), table_name='bank_reconciliations')
    op.drop_table('bank_reconciliations')
    
    op.drop_index(op.f('ix_bank_accounts_bank_code'), table_name='bank_accounts')
    op.drop_index(op.f('ix_bank_accounts_clinic_id'), table_name='bank_accounts')
    op.drop_table('bank_accounts')
    
    op.drop_index(op.f('ix_tax_configurations_tax_type'), table_name='tax_configurations')
    op.drop_index(op.f('ix_tax_configurations_clinic_id'), table_name='tax_configurations')
    op.drop_table('tax_configurations')
    
    op.drop_index(op.f('ix_cost_centers_code'), table_name='cost_centers')
    op.drop_index(op.f('ix_cost_centers_clinic_id'), table_name='cost_centers')
    op.drop_table('cost_centers')
    
    op.drop_index(op.f('ix_invoice_nfs_nfs_number'), table_name='invoice_nfs')
    op.drop_index(op.f('ix_invoice_nfs_status'), table_name='invoice_nfs')
    op.drop_index(op.f('ix_invoice_nfs_clinic_id'), table_name='invoice_nfs')
    op.drop_table('invoice_nfs')