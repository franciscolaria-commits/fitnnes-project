from app.database import SessionLocal
from app.models import EjercicioMediaCoach

db = SessionLocal()
overrides = db.query(EjercicioMediaCoach).all()
print("Overrides in DB:")
for o in overrides:
    print(f"URL: {repr(o.url_media)}")
