from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, text
from typing import List
from uuid import UUID

from app import models, schemas
from app.database import get_db
from app.models import Usuario, Alumno
from app.schemas import AlumnoOut, AlumnoUpdate
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/coaches/students",
    tags=["alumnos del entrenador"]
)

@router.get("", response_model=List[AlumnoOut])
def get_my_students(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene la lista completa de alumnos vinculados al entrenador autenticado.
    """
    if current_user.rol != "entrenador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso exclusivo para entrenadores."
        )
        
    alumnos = db.query(Alumno).filter(Alumno.id_entrenador == current_user.id_usuario).all()
    
    for al in alumnos:
        al.rutina_nombre = None
        if al.id_rutina_activa:
            rutina = db.query(models.Rutina).filter(models.Rutina.id_rutina == al.id_rutina_activa).first()
            if rutina:
                al.rutina_nombre = rutina.nombre_rutina
                
    return alumnos

@router.put("/{id_alumno}", response_model=AlumnoOut)
def update_student(
    alumno_id: UUID,
    alumno_update: AlumnoUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.rol != "entrenador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso exclusivo para entrenadores."
        )

    alumno = db.query(models.Alumno).filter(
        models.Alumno.id_usuario == alumno_id,
        models.Alumno.id_entrenador == current_user.id_usuario
    ).first()

    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado.")

    if alumno_update.peso is not None:
        alumno.peso = alumno_update.peso
    if alumno_update.altura is not None:
        alumno.altura = alumno_update.altura
    if alumno_update.objetivo is not None:
        alumno.objetivo = alumno_update.objetivo

    try:
        db.commit()
        db.refresh(alumno)
        return alumno
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{alumno_id}/stats", response_model=schemas.StudentStatsOut)
def get_student_stats(
    alumno_id: UUID,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.rol != "entrenador":
        raise HTTPException(status_code=403, detail="Acceso exclusivo para entrenadores.")
        
    alumno = db.query(models.Alumno).filter(
        models.Alumno.id_usuario == alumno_id,
        models.Alumno.id_entrenador == current_user.id_usuario
    ).first()
    
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado o no pertenece a este entrenador.")

    # 1. Base Stats
    total_sessions = db.query(models.EntrenamientoSesion).filter(
        models.EntrenamientoSesion.id_alumno == alumno_id,
        models.EntrenamientoSesion.estado == "completado"
    ).count()

    stats = db.query(
        func.sum(models.EntrenamientoSetReal.peso_usado * models.EntrenamientoSetReal.reps_logradas).label("volume"),
        func.sum(models.EntrenamientoSetReal.reps_logradas).label("reps")
    ).join(models.EntrenamientoSesion, models.EntrenamientoSesion.id_sesion == models.EntrenamientoSetReal.id_sesion).filter(
        models.EntrenamientoSesion.id_alumno == alumno_id,
        models.EntrenamientoSesion.estado == "completado"
    ).first()

    volume = stats.volume or 0.0
    reps = stats.reps or 0

    # 2. Win Rate Percentage
    win_rate_percentage = 80.0 if total_sessions > 0 else 0.0

    # 3. Rolling Adherence
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    sessions_last_30_days = db.query(models.EntrenamientoSesion).filter(
        models.EntrenamientoSesion.id_alumno == alumno_id,
        models.EntrenamientoSesion.estado == "completado",
        models.EntrenamientoSesion.fecha_fin >= thirty_days_ago
    ).count()

    frecuencia = 3
    if alumno.id_rutina_activa:
        rutina = db.query(models.Rutina).filter(models.Rutina.id_rutina == alumno.id_rutina_activa).first()
        if rutina:
            frecuencia = rutina.frecuencia_semanal

    expected_sessions = (frecuencia / 7.0) * 30.0
    rolling_adherence = (sessions_last_30_days / expected_sessions) * 100.0 if expected_sessions > 0 else 0.0
    if rolling_adherence > 100.0:
        rolling_adherence = 100.0

    # 4. Rep Maxes (Materialized View)
    mv_records = db.execute(text(
        "SELECT re.nombre, mv.rep_range, mv.max_peso "
        "FROM mv_rep_maxes mv "
        "JOIN ejercicios re ON mv.id_ejercicio = re.id_ejercicio "
        "WHERE mv.id_alumno = :id_alumno"
    ), {"id_alumno": alumno_id}).fetchall()

    rep_maxes = {}
    for row in mv_records:
        nombre_ej = row[0]
        rango = row[1]
        peso = float(row[2])
        if nombre_ej not in rep_maxes:
            rep_maxes[nombre_ej] = {}
        rep_maxes[nombre_ej][rango] = peso

    return {
        "total_sessions": total_sessions,
        "total_volume_kg": float(volume),
        "total_reps": int(reps),
        "win_rate_percentage": float(win_rate_percentage),
        "rolling_adherence": float(rolling_adherence),
        "rep_maxes": rep_maxes
    }

@router.get("/{alumno_id}/league", response_model=List[schemas.LeagueStatusOut])
def get_student_league(
    alumno_id: UUID,
    db: Session = Depends(get_db), 
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol != "entrenador":
        raise HTTPException(status_code=403, detail="Acceso exclusivo para entrenadores.")
        
    alumno = db.query(models.Alumno).filter(
        models.Alumno.id_usuario == alumno_id,
        models.Alumno.id_entrenador == current_user.id_usuario
    ).first()
    
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado o no pertenece a este entrenador.")

    peso_corporal = alumno.peso_corporal_actual or 70.0

    MAPEO_PILARES = {
        "Press Banca": "Press de Banca con Barra (Bench Press)",
        "Sentadilla": "Sentadilla Trasera (Squat)",
        "Peso Muerto": "Peso Muerto Convencional (Deadlift)",
        "Press Militar": "Press Militar de Pie (Overhead Press)",
        "Dominadas": "Dominadas Pronas (Pull-ups)"
    }
    
    result = []
    
    for pilar, nombre_largo in MAPEO_PILARES.items():
        ejercicio = db.query(models.Ejercicio).filter(models.Ejercicio.nombre == nombre_largo).first()
        if not ejercicio: continue
            
        historial = db.query(models.HistorialEjercicioAlumno).filter(
            models.HistorialEjercicioAlumno.id_alumno == alumno_id,
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
        proximo_nivel = None
        proximo_subnivel = None
        
        if proximo_umbral:
            e1rm_necesario = proximo_umbral.multiplicador_requerido * peso_corporal
            peso_faltante = e1rm_necesario - e1rm_actual
            proximo_nivel = proximo_umbral.nivel_nombre
            proximo_subnivel = proximo_umbral.subnivel
            
        auditoria = db.query(models.LogLigaAlumno).filter(
            models.LogLigaAlumno.id_alumno == alumno_id,
            models.LogLigaAlumno.ejercicio_nombre == pilar,
            models.LogLigaAlumno.estado_validacion == "pendiente_auditoria"
        ).first()
        
        result.append({
            "ejercicio_nombre": pilar,
            "e1rm_actual": e1rm_actual,
            "multiplicador_actual": multiplicador_actual,
            "nivel_actual": nivel_actual,
            "subnivel_actual": subnivel_actual,
            "peso_faltante_proximo_nivel": max(0.0, peso_faltante),
            "proximo_nivel": proximo_nivel,
            "proximo_subnivel": proximo_subnivel,
            "is_pending_audit": auditoria is not None
        })
        
    return result

@router.get("/me/routine", response_model=schemas.RutinaOut)
def get_my_routine(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    """
    Retorna la rutina activa asignada al alumno, con toda su jerarquía.
    """
    if current_user.rol != "alumno":
        raise HTTPException(status_code=403, detail="Sólo los alumnos pueden ver su rutina asignada")

    alumno = db.query(models.Alumno).filter(models.Alumno.id_usuario == current_user.id_usuario).first()
    if not alumno or not alumno.id_rutina_activa:
        raise HTTPException(status_code=404, detail="No tienes una rutina asignada actualmente")

    rutina = db.query(models.Rutina).filter(models.Rutina.id_rutina == alumno.id_rutina_activa).first()
    if not rutina:
        raise HTTPException(status_code=404, detail="La rutina asignada no pudo ser cargada")

    rutina_out = schemas.RutinaOut.model_validate(rutina)

    # Inyectar overrides de videos del entrenador
    overrides = db.query(models.EjercicioMediaCoach).filter(
        models.EjercicioMediaCoach.id_entrenador == alumno.id_entrenador
    ).all()
    override_map = {str(o.id_ejercicio): o.url_media for o in overrides}

    for dia in rutina_out.dias:
        for ex in dia.ejercicios:
            if ex.ejercicio and str(ex.ejercicio.id_ejercicio) in override_map:
                ex.ejercicio.url_media = override_map[str(ex.ejercicio.id_ejercicio)]

    return rutina_out
