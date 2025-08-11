"""Add pharmacy and stock tables

Revision ID: 005
Revises: 004
Create Date: 2024-01-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Create product_categories table
    op.create_table('product_categories',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_categories_id'), 'product_categories', ['id'], unique=False)
    op.create_index(op.f('ix_product_categories_name'), 'product_categories', ['name'], unique=False)

    # Create products table
    op.create_table('products',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('category_id', sa.Integer(), nullable=True),
    sa.Column('barcode', sa.String(length=50), nullable=True),
    sa.Column('unit_of_measure', sa.String(length=20), nullable=True),
    sa.Column('last_purchase_price', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('current_stock', sa.Integer(), nullable=True),
    sa.Column('minimum_stock', sa.Integer(), nullable=True),
    sa.Column('maximum_stock', sa.Integer(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('clinic_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['category_id'], ['product_categories.id'], ),
    sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_barcode'), 'products', ['barcode'], unique=False)
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)
    op.create_index(op.f('ix_products_name'), 'products', ['name'], unique=False)

    # Create product_batches table
    op.create_table('product_batches',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=True),
    sa.Column('batch_number', sa.String(length=50), nullable=False),
    sa.Column('expiry_date', sa.Date(), nullable=True),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('purchase_price', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('supplier_id', sa.Integer(), nullable=True),
    sa.Column('received_date', sa.Date(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_batches_batch_number'), 'product_batches', ['batch_number'], unique=False)
    op.create_index(op.f('ix_product_batches_id'), 'product_batches', ['id'], unique=False)

    # Create product_stock_movements table
    op.create_table('product_stock_movements',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=True),
    sa.Column('batch_id', sa.Integer(), nullable=True),
    sa.Column('movement_type', sa.String(length=20), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit_cost', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('total_cost', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('reference_type', sa.String(length=50), nullable=True),
    sa.Column('reference_id', sa.Integer(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['batch_id'], ['product_batches.id'], ),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_stock_movements_id'), 'product_stock_movements', ['id'], unique=False)

    # Create stock_requisitions table
    op.create_table('stock_requisitions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('requisition_number', sa.String(length=50), nullable=False),
    sa.Column('department', sa.String(length=100), nullable=True),
    sa.Column('requested_by', sa.Integer(), nullable=True),
    sa.Column('approved_by', sa.Integer(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=True),
    sa.Column('request_date', sa.Date(), nullable=True),
    sa.Column('approval_date', sa.Date(), nullable=True),
    sa.Column('delivery_date', sa.Date(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('clinic_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
    sa.ForeignKeyConstraint(['requested_by'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_requisitions_id'), 'stock_requisitions', ['id'], unique=False)
    op.create_index(op.f('ix_stock_requisitions_requisition_number'), 'stock_requisitions', ['requisition_number'], unique=True)

    # Create stock_requisition_items table
    op.create_table('stock_requisition_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('requisition_id', sa.Integer(), nullable=True),
    sa.Column('product_id', sa.Integer(), nullable=True),
    sa.Column('requested_quantity', sa.Integer(), nullable=False),
    sa.Column('approved_quantity', sa.Integer(), nullable=True),
    sa.Column('delivered_quantity', sa.Integer(), nullable=True),
    sa.Column('unit_cost', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('total_cost', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.ForeignKeyConstraint(['requisition_id'], ['stock_requisitions.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_requisition_items_id'), 'stock_requisition_items', ['id'], unique=False)

    # Create purchase_orders table
    op.create_table('purchase_orders',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('order_number', sa.String(length=50), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=True),
    sa.Column('order_date', sa.Date(), nullable=True),
    sa.Column('expected_delivery_date', sa.Date(), nullable=True),
    sa.Column('actual_delivery_date', sa.Date(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=True),
    sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('discount_amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('tax_amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('final_amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('approved_by', sa.Integer(), nullable=True),
    sa.Column('clinic_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchase_orders_id'), 'purchase_orders', ['id'], unique=False)
    op.create_index(op.f('ix_purchase_orders_order_number'), 'purchase_orders', ['order_number'], unique=True)

    # Create purchase_order_items table
    op.create_table('purchase_order_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('purchase_order_id', sa.Integer(), nullable=True),
    sa.Column('product_id', sa.Integer(), nullable=True),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('total_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('received_quantity', sa.Integer(), nullable=True),
    sa.Column('batch_number', sa.String(length=50), nullable=True),
    sa.Column('expiry_date', sa.Date(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.ForeignKeyConstraint(['purchase_order_id'], ['purchase_orders.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchase_order_items_id'), 'purchase_order_items', ['id'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_index(op.f('ix_purchase_order_items_id'), table_name='purchase_order_items')
    op.drop_table('purchase_order_items')
    op.drop_index(op.f('ix_purchase_orders_order_number'), table_name='purchase_orders')
    op.drop_index(op.f('ix_purchase_orders_id'), table_name='purchase_orders')
    op.drop_table('purchase_orders')
    op.drop_index(op.f('ix_stock_requisition_items_id'), table_name='stock_requisition_items')
    op.drop_table('stock_requisition_items')
    op.drop_index(op.f('ix_stock_requisitions_requisition_number'), table_name='stock_requisitions')
    op.drop_index(op.f('ix_stock_requisitions_id'), table_name='stock_requisitions')
    op.drop_table('stock_requisitions')
    op.drop_index(op.f('ix_product_stock_movements_id'), table_name='product_stock_movements')
    op.drop_table('product_stock_movements')
    op.drop_index(op.f('ix_product_batches_id'), table_name='product_batches')
    op.drop_index(op.f('ix_product_batches_batch_number'), table_name='product_batches')
    op.drop_table('product_batches')
    op.drop_index(op.f('ix_products_name'), table_name='products')
    op.drop_index(op.f('ix_products_id'), table_name='products')
    op.drop_index(op.f('ix_products_barcode'), table_name='products')
    op.drop_table('products')
    op.drop_index(op.f('ix_product_categories_name'), table_name='product_categories')
    op.drop_index(op.f('ix_product_categories_id'), table_name='product_categories')
    op.drop_table('product_categories')