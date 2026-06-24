from fastapi.encoders import jsonable_encoder
from app.database import SessionLocal
from app.models import Alumno
from app.schemas import AlumnoOut
import json

db = SessionLocal()
alumnos = db.query(Alumno).all()
for alumno in alumnos:
    out = AlumnoOut.model_validate(alumno)
    print(f"Alumno {out.usuario.email} tiene coach {out.entrenador.nombre if out.entrenador else 'None'}")
