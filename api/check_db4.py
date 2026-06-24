from app.database import SessionLocal
from app.models import Entrenador
from sqlalchemy import text

db = SessionLocal()
try:
    print("Verificando tabla de entrenadores...")
    entrenador = db.query(Entrenador).first()
    if entrenador:
        print(f"Límite de alumnos: {entrenador.limite_alumnos}")
        print(f"Estado Financiero: {entrenador.estado_financiero}")
        print(f"Fecha de Vencimiento: {entrenador.fecha_vencimiento}")
    else:
        print("No hay entrenadores en la BD para verificar, pero la tabla fue consultada exitosamente.")

    print("\nVerificando índice en tabla alumnos...")
    res = db.execute(text("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'alumnos';"))
    for row in res:
        print(f"{row[0]}: {row[1]}")
finally:
    db.close()
