"""mv_progress_chart

Revision ID: ab894c24f413
Revises: b13323ffee87
Create Date: 2026-06-26 08:26:11.053582

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab894c24f413'
down_revision: Union[str, Sequence[str], None] = 'b13323ffee87'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE MATERIALIZED VIEW mv_student_progress_chart AS
        SELECT 
            ses.id_alumno,
            e.id_ejercicio,
            e.nombre AS ejercicio_nombre,
            DATE(ses.fecha_inicio) AS fecha,
            MAX(set_r.peso_usado * (1.0 + (set_r.reps_logradas / 30.0))) AS max_e1rm,
            MAX(set_r.peso_usado) AS max_peso
        FROM entrenamiento_sets_reales set_r
        JOIN entrenamiento_sesiones ses ON set_r.id_sesion = ses.id_sesion
        JOIN rutinas_ejercicios re ON set_r.id_rutina_ejercicio = re.id_rutina_ejercicio
        JOIN ejercicios e ON re.id_ejercicio = e.id_ejercicio
        WHERE ses.estado = 'completado' 
          AND set_r.peso_usado > 0 
          AND set_r.reps_logradas > 0
        GROUP BY ses.id_alumno, e.id_ejercicio, e.nombre, DATE(ses.fecha_inicio);
    """)

    op.execute("""
        CREATE UNIQUE INDEX idx_mv_student_progress_unique 
        ON mv_student_progress_chart (id_alumno, id_ejercicio, fecha);
    """)

    op.execute("""
        CREATE INDEX idx_mv_student_progress_alumno_ej 
        ON mv_student_progress_chart (id_alumno, id_ejercicio);
    """)

def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_student_progress_chart CASCADE;")
