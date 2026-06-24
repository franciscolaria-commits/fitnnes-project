from app.database import SessionLocal
from app.models import Alumno, Rutina
from app.schemas import RutinaOut

db = SessionLocal()
alumno = db.query(Alumno).filter(Alumno.id_usuario == '81b361d5-f3b8-4aa6-8596-b465afa17ddd').first()
rutina = db.query(Rutina).filter(Rutina.id_rutina == alumno.id_rutina_activa).first()

rut_out = RutinaOut.model_validate(rutina)
print(rut_out.model_dump_json(indent=2))
db.close()
