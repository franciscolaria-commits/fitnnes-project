from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
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

@router.get("/{alumno_id}/progress", response_model=dict)
def get_student_progress(
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
        
    sesiones = db.query(models.EntrenamientoSesion).filter(
        models.EntrenamientoSesion.id_alumno == alumno_id,
        models.EntrenamientoSesion.estado == "completado"
    ).order_by(models.EntrenamientoSesion.fecha_fin.desc()).all()
    
    stats = db.query(
        func.sum(models.EntrenamientoSetReal.peso_usado * models.EntrenamientoSetReal.reps_logradas).label("volume"),
        func.sum(models.EntrenamientoSetReal.reps_logradas).label("reps")
    ).join(models.EntrenamientoSesion, models.EntrenamientoSesion.id_sesion == models.EntrenamientoSetReal.id_sesion).filter(
        models.EntrenamientoSesion.id_alumno == alumno_id,
        models.EntrenamientoSesion.estado == "completado"
    ).first()

    volume = stats.volume or 0.0
    reps = stats.reps or 0
    
    history = [schemas.EntrenamientoSesionOut.model_validate(s).model_dump() for s in sesiones]

    return {
        "stats": {
            "total_sessions": len(sesiones),
            "total_volume_kg": float(volume),
            "total_reps": int(reps)
        },
        "history": history
    }

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
