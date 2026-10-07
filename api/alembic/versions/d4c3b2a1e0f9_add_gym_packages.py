"""add gym packages

Revision ID: d4c3b2a1e0f9
Revises: None
Create Date: 2026-10-06 20:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4c3b2a1e0f9'
down_revision = None

def upgrade():
    op.add_column('entrenadores', sa.Column('gym_paquetes_clases', sa.JSON(), server_default='[]', nullable=True))
    op.add_column('alumnos', sa.Column('gym_paquete_id', sa.String(), nullable=True))

def downgrade():
    op.drop_column('alumnos', 'gym_paquete_id')
    op.drop_column('entrenadores', 'gym_paquetes_clases')
