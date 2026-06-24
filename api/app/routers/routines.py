from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from uuid import uuid4

from app import models, schemas
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/routines",
    tags=["Routines"]
)

@router.post("", response_model=schemas.RutinaOut, status_code=status.HTTP_201_CREATED)
def create_routine(
    routine_data: schemas.RutinaCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol != "entrenador":
        raise HTTPException(status_code=403, detail="Sólo los entrenadores pueden crear rutinas")

    try:
        # 1. Crear Rutina Principal
        new_rutina_id = uuid4()
        new_rutina = models.Rutina(
            id_rutina=new_rutina_id,
            id_entrenador=current_user.id_usuario,
            nombre_rutina=routine_data.nombre_rutina,
            version_id=1,
            is_active=True
        )
        db.add(new_rutina)

        dias_out = []
        # 2. Iterar sobre Días
        for dia_data in routine_data.dias:
            new_dia_id = uuid4()
            new_dia = models.RutinaDia(
                id_dia=new_dia_id,
                id_rutina=new_rutina_id,
                nombre_dia=dia_data.nombre_dia,
                orden=dia_data.orden
            )
            db.add(new_dia)

            ejercicios_out = []
            # 3. Iterar sobre Ejercicios de cada Día
            for ej_data in dia_data.ejercicios:
                new_ej_id = uuid4()
                new_ej = models.RutinaEjercicio(
                    id_rutina_ejercicio=new_ej_id,
                    id_dia=new_dia_id,
                    id_ejercicio=ej_data.id_ejercicio,
                    series_esperadas=ej_data.series_esperadas,
                    reps_esperadas=ej_data.reps_esperadas,
                    descanso_segundos=ej_data.descanso_segundos,
                    orden=ej_data.orden
                )
                db.add(new_ej)
                
        # Commit de toda la jerarquía de forma transaccional
        db.commit()
        db.refresh(new_rutina)
        return new_rutina

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error transaccional al guardar rutina: {str(e)}")

from uuid import UUID

@router.put("/{id_rutina}", response_model=schemas.RutinaOut)
def update_routine(
    id_rutina: UUID,
    routine_data: schemas.RutinaCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol != "entrenador":
        raise HTTPException(status_code=403, detail="Sólo los entrenadores pueden editar rutinas")

    # 1. Buscar rutina original activa
    old_rutina = db.query(models.Rutina).filter(
        models.Rutina.id_rutina == id_rutina,
        models.Rutina.id_entrenador == current_user.id_usuario,
        models.Rutina.is_active == True
    ).first()

    if not old_rutina:
        raise HTTPException(status_code=404, detail="Rutina activa no encontrada")

    try:
        # 2. Desactivar la rutina original
        old_rutina.is_active = False

        # 3. Crear nueva Rutina (Clonando con version_id incrementado)
        new_rutina_id = uuid4()
        new_rutina = models.Rutina(
            id_rutina=new_rutina_id,
            id_entrenador=current_user.id_usuario,
            nombre_rutina=routine_data.nombre_rutina,
            version_id=old_rutina.version_id + 1,
            is_active=True
        )
        db.add(new_rutina)

        # 4. Insertar la jerarquía profunda clonada/modificada
        for dia_data in routine_data.dias:
            new_dia_id = uuid4()
            new_dia = models.RutinaDia(
                id_dia=new_dia_id,
                id_rutina=new_rutina_id,
                nombre_dia=dia_data.nombre_dia,
                orden=dia_data.orden
            )
            db.add(new_dia)

            for ej_data in dia_data.ejercicios:
                new_ej_id = uuid4()
                new_ej = models.RutinaEjercicio(
                    id_rutina_ejercicio=new_ej_id,
                    id_dia=new_dia_id,
                    id_ejercicio=ej_data.id_ejercicio,
                    series_esperadas=ej_data.series_esperadas,
                    reps_esperadas=ej_data.reps_esperadas,
                    descanso_segundos=ej_data.descanso_segundos,
                    orden=ej_data.orden
                )
                db.add(new_ej)

        db.commit()
        db.refresh(new_rutina)
        return new_rutina

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error transaccional al actualizar rutina: {str(e)}")

@router.post("/{id_rutina}/assign")
def assign_routine(
    id_rutina: UUID,
    asignacion: schemas.AsignacionCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol != "entrenador":
        raise HTTPException(status_code=403, detail="Sólo los entrenadores pueden asignar rutinas")

    # Validar que la rutina pertenezca al coach y esté activa
    rutina = db.query(models.Rutina).filter(
        models.Rutina.id_rutina == id_rutina,
        models.Rutina.id_entrenador == current_user.id_usuario,
        models.Rutina.is_active == True
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina activa no encontrada")

    # Validar que el alumno pertenezca al coach
    alumno = db.query(models.Alumno).filter(
        models.Alumno.id_usuario == asignacion.id_alumno,
        models.Alumno.id_entrenador == current_user.id_usuario
    ).first()
    
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado o no vinculado")

    try:
        # Asignar la rutina activa
        alumno.id_rutina_activa = id_rutina
        db.commit()
        return {"status": "success", "message": "Rutina asignada exitosamente al alumno."}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al asignar rutina: {str(e)}")

@router.get("", response_model=List[schemas.RutinaOut])
def get_routines(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol != "entrenador":
        raise HTTPException(status_code=403, detail="Sólo los entrenadores pueden ver sus rutinas")

    # Obtener todas las rutinas activas del entrenador con sus jerarquías
    rutinas = db.query(models.Rutina).filter(
        models.Rutina.id_entrenador == current_user.id_usuario,
        models.Rutina.is_active == True
    ).all()
    
    # Cargar manualmente relaciones si fuera necesario, aunque SQLAlchemy cargará lazy si configuramos las relaciones (esperemos no de error de detached session)
    return rutinas
