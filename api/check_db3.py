from app.database import SessionLocal
from app.models import Usuario, Alumno
import json

db = SessionLocal()
usuario = db.query(Usuario).filter(Usuario.rol == 'alumno').first()
alumno = db.query(Alumno).filter(Alumno.id_usuario == usuario.id_usuario).first()

print("fecha_ultimo_peso en BD:", alumno.fecha_ultimo_peso)
