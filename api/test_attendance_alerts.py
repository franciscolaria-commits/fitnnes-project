from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
# franciscolaria2003@gmail.com is coach 1 probably? 
# let's just get the first coach
id_entrenador = db.execute(text("SELECT id_usuario FROM entrenadores LIMIT 1")).scalar()
print("Coach ID:", id_entrenador)

query = text("""
WITH TargetWeek AS (
    SELECT DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') AS semana
),
ActiveStudents AS (
    SELECT 
        a.id_usuario AS id_alumno,
        u.email,
        r.frecuencia_semanal,
        tw.semana
    FROM alumnos a
    JOIN usuarios u ON a.id_usuario = u.id_usuario
    LEFT JOIN rutinas r ON a.id_rutina_activa = r.id_rutina
    CROSS JOIN TargetWeek tw
    WHERE a.id_entrenador = :id_entrenador AND a.estado_activo = true
),
SessionDays AS (
    SELECT 
        ses.id_sesion,
        ses.id_alumno,
        DATE_TRUNC('week', ses.fecha_inicio) AS semana,
        re.id_dia,
        COUNT(DISTINCT re.id_ejercicio) AS ejercicios_realizados
    FROM entrenamiento_sesiones ses
    JOIN entrenamiento_sets_reales set_r ON ses.id_sesion = set_r.id_sesion
    JOIN rutinas_ejercicios re ON set_r.id_rutina_ejercicio = re.id_rutina_ejercicio
    WHERE ses.estado = 'completado'
      AND DATE_TRUNC('week', ses.fecha_inicio) = (SELECT semana FROM TargetWeek)
    GROUP BY ses.id_sesion, ses.id_alumno, DATE_TRUNC('week', ses.fecha_inicio), re.id_dia
),
DayTotals AS (
    SELECT id_dia, COUNT(DISTINCT id_ejercicio) AS total_ejercicios
    FROM rutinas_ejercicios
    GROUP BY id_dia
),
SessionStats AS (
    SELECT 
        sd.id_sesion,
        sd.id_alumno,
        sd.semana,
        (sd.ejercicios_realizados::FLOAT / NULLIF(dt.total_ejercicios, 0)) AS completitud,
        ROW_NUMBER() OVER (PARTITION BY sd.id_sesion ORDER BY (sd.ejercicios_realizados::FLOAT / NULLIF(dt.total_ejercicios, 0)) DESC) as rn
    FROM SessionDays sd
    JOIN DayTotals dt ON sd.id_dia = dt.id_dia
),
ValidSessions AS (
    SELECT id_alumno, COUNT(id_sesion) AS asistencias
    FROM SessionStats
    WHERE rn = 1 AND completitud >= 0.6
    GROUP BY id_alumno
)
SELECT 
    ast.id_alumno,
    ast.email,
    ast.semana,
    COALESCE(ast.frecuencia_semanal, 3) AS frecuencia_objetivo,
    COALESCE(vs.asistencias, 0) AS asistencias
FROM ActiveStudents ast
LEFT JOIN ValidSessions vs ON ast.id_alumno = vs.id_alumno
WHERE COALESCE(vs.asistencias, 0) < (COALESCE(ast.frecuencia_semanal, 3) * 0.5)
ORDER BY asistencias ASC
""")

res = db.execute(query, {"id_entrenador": id_entrenador}).fetchall()
for r in res:
    print(r)
