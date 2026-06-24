from app.database import SessionLocal
from app.models import Ejercicio

db = SessionLocal()
ejercicios = db.query(Ejercicio).filter(Ejercicio.url_media != None).all()
print("Ejercicios with url_media:")
for e in ejercicios:
    print(f"Nombre: {e.nombre}, URL: {repr(e.url_media)}")
