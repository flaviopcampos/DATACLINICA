"""Add advanced stock management tables

Revision ID: 006
Revises: 005
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None

def upgrade():
    # Criar tabela stock_inventories
    op.create_table('stock_inventories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, default='planejado'),
        sa.Column('inventory_date', sa.Date(), nullable=False),
        sa.Column('location', sa.String(length=100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_inventories_clinic_id'), 'stock_inventories', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_stock_inventories_status'), 'stock_inventories', ['status'], unique=False)
    op.create_index(op.f('ix_stock_inventories_inventory_date'), 'stock_inventories', ['inventory_date'], unique=False)

    # Criar tabela inventory_counts
    op.create_table('inventory_counts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('inventory_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=True),
        sa.Column('expected_quantity', sa.Integer(), nullable=False),
        sa.Column('counted_quantity', sa.Integer(), nullable=True),
        sa.Column('discrepancy', sa.Integer(), nullable=True),
        sa.Column('unit_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('total_cost_impact', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('counted_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['inventory_id'], ['stock_inventories.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['batch_id'], ['product_batches.id'], ),
        sa.ForeignKeyConstraint(['counted_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inventory_counts_inventory_id'), 'inventory_counts', ['inventory_id'], unique=False)
    op.create_index(op.f('ix_inventory_counts_product_id'), 'inventory_counts', ['product_id'], unique=False)

    # Criar tabela stock_alerts
    op.create_table('stock_alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('alert_type', sa.String(length=50), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False, default='media'),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('threshold_value', sa.Integer(), nullable=True),
        sa.Column('current_value', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_by', sa.Integer(), nullable=True),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_alerts_clinic_id'), 'stock_alerts', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_stock_alerts_product_id'), 'stock_alerts', ['product_id'], unique=False)
    op.create_index(op.f('ix_stock_alerts_alert_type'), 'stock_alerts', ['alert_type'], unique=False)
    op.create_index(op.f('ix_stock_alerts_is_active'), 'stock_alerts', ['is_active'], unique=False)

    # Criar tabela stock_transfers
    op.create_table('stock_transfers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('transfer_number', sa.String(length=50), nullable=False),
        sa.Column('from_location', sa.String(length=100), nullable=False),
        sa.Column('to_location', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, default='pendente'),
        sa.Column('transfer_date', sa.Date(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('shipped_at', sa.DateTime(), nullable=True),
        sa.Column('received_at', sa.DateTime(), nullable=True),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('shipped_by', sa.Integer(), nullable=True),
        sa.Column('received_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['shipped_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['received_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_transfers_clinic_id'), 'stock_transfers', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_stock_transfers_transfer_number'), 'stock_transfers', ['transfer_number'], unique=True)
    op.create_index(op.f('ix_stock_transfers_status'), 'stock_transfers', ['status'], unique=False)
    op.create_index(op.f('ix_stock_transfers_transfer_date'), 'stock_transfers', ['transfer_date'], unique=False)

    # Criar tabela stock_transfer_items
    op.create_table('stock_transfer_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('transfer_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=True),
        sa.Column('quantity_requested', sa.Integer(), nullable=False),
        sa.Column('quantity_shipped', sa.Integer(), nullable=True),
        sa.Column('quantity_received', sa.Integer(), nullable=True),
        sa.Column('unit_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('total_cost', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['transfer_id'], ['stock_transfers.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['batch_id'], ['product_batches.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_transfer_items_transfer_id'), 'stock_transfer_items', ['transfer_id'], unique=False)
    op.create_index(op.f('ix_stock_transfer_items_product_id'), 'stock_transfer_items', ['product_id'], unique=False)

    # Criar tabela stock_adjustments
    op.create_table('stock_adjustments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=True),
        sa.Column('adjustment_type', sa.String(length=20), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('unit_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('total_value', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('approval_required', sa.Boolean(), nullable=False, default=False),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('clinic_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['batch_id'], ['product_batches.id'], ),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_adjustments_clinic_id'), 'stock_adjustments', ['clinic_id'], unique=False)
    op.create_index(op.f('ix_stock_adjustments_product_id'), 'stock_adjustments', ['product_id'], unique=False)
    op.create_index(op.f('ix_stock_adjustments_adjustment_type'), 'stock_adjustments', ['adjustment_type'], unique=False)
    op.create_index(op.f('ix_stock_adjustments_created_at'), 'stock_adjustments', ['created_at'], unique=False)

def downgrade():
    # Remover tabelas na ordem inversa
    op.drop_table('stock_adjustments')
    op.drop_table('stock_transfer_items')
    op.drop_table('stock_transfers')
    op.drop_table('stock_alerts')
    op.drop_table('inventory_counts')
    op.drop_table('stock_inventories')