"""Add gym mode tables and columns

Revision ID: a1b2c3d4e5f6
Revises: d3bd51611ea2
Create Date: 2026-09-28
"""
from typing import Union, Sequence
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid as _uuid
from datetime import datetime

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'd3bd51611ea2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Columns on entrenadores
    op.add_column('entrenadores', sa.Column('tipo_cuenta',          sa.String(), nullable=True,  server_default='estandar'))
    op.add_column('entrenadores', sa.Column('gym_tipo_cobro',        sa.String(), nullable=True))
    op.add_column('entrenadores', sa.Column('gym_frecuencia_tipo',   sa.String(), nullable=True))
    op.add_column('entrenadores', sa.Column('gym_frecuencia_valor',  sa.Integer(), nullable=True))
    op.add_column('entrenadores', sa.Column('gym_monto_pase_libre',  sa.Numeric(10, 2), nullable=True))
    op.add_column('entrenadores', sa.Column('gym_monto_clases',      sa.Numeric(10, 2), nullable=True))

    # Columns on alumnos
    op.add_column('alumnos', sa.Column('tipo_membresia',              sa.String(), nullable=True))
    op.add_column('alumnos', sa.Column('clases_compradas',            sa.Integer(), nullable=True))
    op.add_column('alumnos', sa.Column('clases_usadas_total',         sa.Integer(), nullable=True, server_default='0'))
    op.add_column('alumnos', sa.Column('clases_restantes',            sa.Integer(), nullable=True))
    op.add_column('alumnos', sa.Column('fecha_inicio_paquete',        sa.Date(), nullable=True))
    op.add_column('alumnos', sa.Column('vencimiento_estimado_clases', sa.Date(), nullable=True))

    # New table: asistencias_qr
    op.create_table(
        'asistencias_qr',
        sa.Column('id_asistencia', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('id_alumno',     UUID(as_uuid=True), sa.ForeignKey('alumnos.id_usuario'), nullable=False),
        sa.Column('id_entrenador', UUID(as_uuid=True), sa.ForeignKey('entrenadores.id_usuario'), nullable=False),
        sa.Column('fecha',         sa.Date(), nullable=False),
        sa.Column('hora',          sa.String(), nullable=False),
        sa.Column('creado_en',     sa.DateTime(), nullable=True),
    )
    op.create_index('ix_asistencias_qr_alumno', 'asistencias_qr', ['id_alumno'])
    op.create_index('ix_asistencias_qr_entrenador', 'asistencias_qr', ['id_entrenador'])
    op.create_unique_constraint('uq_asistencia_alumno_fecha', 'asistencias_qr', ['id_alumno', 'fecha'])


def downgrade() -> None:
    op.drop_table('asistencias_qr')
    for col in ['tipo_membresia','clases_compradas','clases_usadas_total',
                'clases_restantes','fecha_inicio_paquete','vencimiento_estimado_clases']:
        op.drop_column('alumnos', col)
    for col in ['tipo_cuenta','gym_tipo_cobro','gym_frecuencia_tipo',
                'gym_frecuencia_valor','gym_monto_pase_libre','gym_monto_clases']:
        op.drop_column('entrenadores', col)
