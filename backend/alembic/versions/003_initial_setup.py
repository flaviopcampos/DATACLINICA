"""Initial setup

Revision ID: 003
Revises: 
Create Date: 2024-01-01 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # This migration represents the initial state of the database
    # All existing tables are assumed to be already created
    pass


def downgrade():
    # Cannot downgrade from initial state
    pass