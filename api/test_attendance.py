from app.database import SessionLocal
from sqlalchemy import text
from app import models

db = SessionLocal()
alumno_id = "78aeadad-88f3-424e-a4ef-c3e8215aa3f6"

query = text("""
    WITH SessionDays AS (
        SELECT 
            ses.id_sesion,
            DATE_TRUNC('week', ses.fecha_inicio) AS semana,
            re.id_dia,
            COUNT(DISTINCT re.id_ejercicio) AS ejercicios_realizados
        FROM entrenamiento_sesiones ses
        JOIN entrenamiento_sets_reales set_r ON ses.id_sesion = set_r.id_sesion
        JOIN rutinas_ejercicios re ON set_r.id_rutina_ejercicio = re.id_rutina_ejercicio
        WHERE ses.id_alumno = :id_alumno 
          AND ses.estado = 'completado'
        GROUP BY ses.id_sesion, DATE_TRUNC('week', ses.fecha_inicio), re.id_dia
    ),
    DayTotals AS (
        SELECT id_dia, COUNT(DISTINCT id_ejercicio) AS total_ejercicios
        FROM rutinas_ejercicios
        GROUP BY id_dia
    ),
    SessionStats AS (
        SELECT 
            sd.id_sesion,
            sd.semana,
            sd.id_dia,
            sd.ejercicios_realizados,
            dt.total_ejercicios,
            (sd.ejercicios_realizados::FLOAT / NULLIF(dt.total_ejercicios, 0)) AS completitud,
            ROW_NUMBER() OVER (PARTITION BY sd.id_sesion ORDER BY (sd.ejercicios_realizados::FLOAT / NULLIF(dt.total_ejercicios, 0)) DESC) as rn
        FROM SessionDays sd
        JOIN DayTotals dt ON sd.id_dia = dt.id_dia
    ),
    ValidSessions AS (
        SELECT id_sesion, semana
        FROM SessionStats
        WHERE rn = 1 AND completitud >= 0.6
    )
    SELECT 
        semana,
        COUNT(id_sesion) AS asistencias
    FROM ValidSessions
    GROUP BY semana
    ORDER BY semana DESC
""")

res = db.execute(query, {"id_alumno": alumno_id}).fetchall()
for r in res:
    print(r)
