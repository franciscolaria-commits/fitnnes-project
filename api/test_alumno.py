from app.database import SessionLocal
from app.models import Usuario, Alumno
from app.schemas import AlumnoOut

db = SessionLocal()
usuario = db.query(Usuario).filter(Usuario.rol == 'alumno').first()
alumno = db.query(Alumno).filter(Alumno.id_usuario == usuario.id_usuario).first()

# Validate against AlumnoOut
alumno_out = AlumnoOut.model_validate(alumno)
print(alumno_out.model_dump())
