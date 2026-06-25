import os
from dotenv import load_dotenv

load_dotenv()
direct_url = os.environ.get("DIRECT_URL")
if direct_url:
    os.environ["DATABASE_URL"] = direct_url

from app.database import engine, get_db
from sqlalchemy.orm import Session
from app import models

# User we found in previous checks
test_user_id = "78aeadad-88f3-424e-a4ef-c3e8215aa3f6"

with Session(engine) as db:
    alumno = db.query(models.Alumno).filter(models.Alumno.id_usuario == test_user_id).first()
    peso_corporal = alumno.peso_corporal_actual or 70.0

    MAPEO_PILARES = {
        "Press Banca": "Press Banca",
        "Sentadilla": "Sentadilla",
        "Peso Muerto": "Peso Muerto",
        "Press Militar": "Press Militar",
        "Dominadas": "Dominadas"
    }
    
    result = []
    for pilar, nombre_largo in MAPEO_PILARES.items():
        ejercicio = db.query(models.Ejercicio).filter(models.Ejercicio.nombre == nombre_largo).first()
        if not ejercicio: continue
            
        historial = db.query(models.HistorialEjercicioAlumno).filter(
            models.HistorialEjercicioAlumno.id_alumno == test_user_id,
            models.HistorialEjercicioAlumno.id_ejercicio == ejercicio.id_ejercicio
        ).first()
        
        e1rm_actual = historial.last_e1rm if historial else 0.0
        multiplicador_actual = e1rm_actual / peso_corporal if peso_corporal > 0 else 0.0
        
        umbral_alcanzado = db.query(models.GamificacionUmbral).filter(
            models.GamificacionUmbral.ejercicio_nombre == pilar,
            models.GamificacionUmbral.multiplicador_requerido <= multiplicador_actual
        ).order_by(models.GamificacionUmbral.multiplicador_requerido.desc()).first()
        
        nivel_actual = umbral_alcanzado.nivel_nombre if umbral_alcanzado else "Sin Nivel"
        subnivel_actual = umbral_alcanzado.subnivel if umbral_alcanzado else 0
        
        proximo_umbral = db.query(models.GamificacionUmbral).filter(
            models.GamificacionUmbral.ejercicio_nombre == pilar,
            models.GamificacionUmbral.multiplicador_requerido > multiplicador_actual
        ).order_by(models.GamificacionUmbral.multiplicador_requerido.asc()).first()
        
        peso_faltante = 0.0
        if proximo_umbral:
            peso_faltante = (proximo_umbral.multiplicador_requerido * peso_corporal) - e1rm_actual
            
        result.append({
            "ejercicio": pilar,
            "e1rm": e1rm_actual,
            "multiplicador": multiplicador_actual,
            "nivel": nivel_actual,
            "subnivel": subnivel_actual,
            "proximo_nivel": proximo_umbral.nivel_nombre if proximo_umbral else None,
            "peso_faltante": peso_faltante
        })
        
    for r in result:
        print(r)
