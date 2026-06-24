from app.database import SessionLocal
from app.models import Ejercicio

db = SessionLocal()
ejercicios = db.query(Ejercicio).filter(Ejercicio.url_media.like('data:image%')).all()
for e in ejercicios:
    e.url_media = None

db.commit()
print(f"Cleared url_media for {len(ejercicios)} exercises.")
