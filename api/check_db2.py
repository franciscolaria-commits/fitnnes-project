from app.database import SessionLocal
from app.models import Alumno, EjercicioMediaCoach, Rutina
from app.schemas import RutinaOut

db = SessionLocal()
alumno = db.query(Alumno).first()
print("Alumno coach id:", alumno.id_entrenador)

rutina = db.query(Rutina).filter(Rutina.id_rutina == alumno.id_rutina_activa).first()
rutina_out = RutinaOut.model_validate(rutina)

overrides = db.query(EjercicioMediaCoach).filter(
    EjercicioMediaCoach.id_entrenador == alumno.id_entrenador
).all()
override_map = {str(o.id_ejercicio): o.url_media for o in overrides}

print("Overrides map:", override_map)

for dia in rutina_out.dias:
    for ex in dia.ejercicios:
        if ex.ejercicio and str(ex.ejercicio.id_ejercicio) in override_map:
            print("FOUND OVERRIDE FOR:", ex.ejercicio.nombre)
            ex.ejercicio.url_media = override_map[str(ex.ejercicio.id_ejercicio)]
            print("MODIFIED IN PYDANTIC:", ex.ejercicio.url_media)

# dump and check if url_media is in the dict
dumped = rutina_out.model_dump()
for dia in dumped['dias']:
    for ex in dia['ejercicios']:
        if ex.get('ejercicio') and ex['ejercicio'].get('nombre') == "Sentadilla Trasera (Squat)":
            print("DUMPED SQUAT URL:", ex['ejercicio'].get('url_media'))
