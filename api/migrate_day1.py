from app.database import engine, Base
from sqlalchemy import text
import app.models

def upgrade():
    # 1. Crear tablas nuevas (HistorialEjercicioAlumno)
    Base.metadata.create_all(bind=engine)
    
    with engine.begin() as conn:
        # 2. Añadir columna frecuencia_semanal a Rutina si no existe
        try:
            conn.execute(text("ALTER TABLE rutinas ADD COLUMN frecuencia_semanal INTEGER DEFAULT 3;"))
            print("Columna 'frecuencia_semanal' añadida.")
        except Exception as e:
            if "already exists" in str(e):
                print("Columna 'frecuencia_semanal' ya existe.")
            else:
                print("Ignorando error al alterar rutinas:", e)

        # 3. Crear Vista Materializada mv_rep_maxes
        # Eliminarla primero por si ya existe (para evitar errores)
        try:
            conn.execute(text("DROP MATERIALIZED VIEW IF EXISTS mv_rep_maxes;"))
            conn.execute(text("""
                CREATE MATERIALIZED VIEW mv_rep_maxes AS
                SELECT 
                    es.id_alumno,
                    re.id_ejercicio,
                    CASE 
                        WHEN sr.reps_logradas = 1 THEN '1RM'
                        WHEN sr.reps_logradas BETWEEN 2 AND 5 THEN '5RM'
                        WHEN sr.reps_logradas BETWEEN 6 AND 8 THEN '8RM'
                        ELSE '10RM'
                    END as rep_range,
                    MAX(sr.peso_usado) as max_peso
                FROM entrenamiento_sets_reales sr
                JOIN rutinas_ejercicios re ON sr.id_rutina_ejercicio = re.id_rutina_ejercicio
                JOIN entrenamiento_sesiones es ON sr.id_sesion = es.id_sesion
                WHERE es.estado = 'completado'
                GROUP BY 1, 2, 3;
            """))
            print("Vista materializada 'mv_rep_maxes' creada.")
            
            # Crear índice único en la vista materializada para permitir REFRESH CONCURRENTLY en el futuro si se requiere
            conn.execute(text("""
                CREATE UNIQUE INDEX idx_mv_rep_maxes ON mv_rep_maxes (id_alumno, id_ejercicio, rep_range);
            """))
            print("Índice creado en 'mv_rep_maxes'.")
        except Exception as e:
            print("Error al crear vista materializada:", e)

if __name__ == "__main__":
    upgrade()
    print("Migración de Día 1 completada.")
