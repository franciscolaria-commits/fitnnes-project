from app.database import SessionLocal
from app.models import Alumno, Rutina

db = SessionLocal()
alumno = db.query(Alumno).filter(Alumno.id_usuario == '81b361d5-f3b8-4aa6-8596-b465afa17ddd').first()
rutina = db.query(Rutina).filter(Rutina.id_rutina == alumno.id_rutina_activa).first()
for dia in rutina.dias:
    print(dia.nombre_dia)
    for ex in dia.ejercicios:
        print(f" - {ex.id_ejercicio}")
        print(f"   ejercicio rel: {ex.ejercicio}")
        if ex.ejercicio:
            print(f"   nombre: {ex.ejercicio.nombre}")
db.close()
