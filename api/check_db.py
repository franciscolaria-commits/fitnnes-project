from app.database import SessionLocal
from app.models import EjercicioMediaCoach, Ejercicio, Rutina

db = SessionLocal()
overrides = db.query(EjercicioMediaCoach).all()
print("Overrides:")
for o in overrides:
    ex = db.query(Ejercicio).filter(Ejercicio.id_ejercicio == o.id_ejercicio).first()
    print(f"Coach: {o.id_entrenador}, Ejercicio: {ex.nombre if ex else o.id_ejercicio}, URL: {o.url_media}")
