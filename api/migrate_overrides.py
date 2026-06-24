from app.database import engine, Base
from app.models import EjercicioMediaCoach

print("Creando tabla ejercicios_media_coaches...")
Base.metadata.create_all(bind=engine, tables=[EjercicioMediaCoach.__table__])
print("¡Tabla creada!")
