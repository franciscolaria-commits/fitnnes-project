from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app import models, schemas
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/admin",
    tags=["superadmin"]
)

def get_superadmin(current_user: models.Usuario = Depends(get_current_user)):
    if current_user.rol != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requieren permisos de super administrador."
        )
    return current_user

@router.get("/coaches", response_model=List[schemas.CoachAdminOut])
def get_all_coaches(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(get_superadmin)
):
    """
    Lista todos los entrenadores con su estado financiero y cantidad de alumnos.
    """
    entrenadores = db.query(models.Entrenador).all()
    result = []
    for e in entrenadores:
        usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == e.id_usuario).first()
        total_alumnos = db.query(func.count(models.Alumno.id_usuario)).filter(models.Alumno.id_entrenador == e.id_usuario).scalar()
        
        result.append({
            "id_usuario": e.id_usuario,
            "nombre": e.nombre,
            "email": usuario.email if usuario else "Desconocido",
            "limite_alumnos": e.limite_alumnos,
            "estado_financiero": e.estado_financiero,
            "fecha_vencimiento": e.fecha_vencimiento,
            "total_alumnos": total_alumnos
        })
    return result

@router.put("/coaches/{coach_id}", response_model=schemas.CoachAdminOut)
def update_coach_financial(
    coach_id: str,
    update_data: schemas.CoachAdminUpdate,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(get_superadmin)
):
    """
    Actualiza los límites y estados financieros de un entrenador específico.
    """
    entrenador = db.query(models.Entrenador).filter(models.Entrenador.id_usuario == coach_id).first()
    if not entrenador:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")
        
    if update_data.limite_alumnos is not None:
        entrenador.limite_alumnos = update_data.limite_alumnos
    if update_data.estado_financiero is not None:
        entrenador.estado_financiero = update_data.estado_financiero
    if update_data.fecha_vencimiento is not None:
        entrenador.fecha_vencimiento = update_data.fecha_vencimiento
        
    db.commit()
    db.refresh(entrenador)
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == entrenador.id_usuario).first()
    total_alumnos = db.query(func.count(models.Alumno.id_usuario)).filter(models.Alumno.id_entrenador == entrenador.id_usuario).scalar()
    
    return {
        "id_usuario": entrenador.id_usuario,
        "nombre": entrenador.nombre,
        "email": usuario.email if usuario else "Desconocido",
        "limite_alumnos": entrenador.limite_alumnos,
        "estado_financiero": entrenador.estado_financiero,
        "fecha_vencimiento": entrenador.fecha_vencimiento,
        "total_alumnos": total_alumnos
    }
