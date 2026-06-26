from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from uuid import uuid4

from app import models, schemas
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/sessions",
    tags=["Sessions"]
)

@router.post("/start", response_model=schemas.EntrenamientoSesionOut)
def start_session(
    session_data: schemas.EntrenamientoSesionStart,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol != "alumno":
        raise HTTPException(status_code=403, detail="Sólo los alumnos pueden iniciar sesiones")

    # Verificar que el alumno existe
    alumno = db.query(models.Alumno).filter(models.Alumno.id_usuario == current_user.id_usuario).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Perfil de alumno no encontrado")

    # Verificar que la rutina existe y está activa
    rutina = db.query(models.Rutina).filter(
        models.Rutina.id_rutina == session_data.id_rutina,
        models.Rutina.is_active == True
    ).first()
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina no encontrada o inactiva")

    try:
        new_session = models.EntrenamientoSesion(
            id_sesion=uuid4(),
            id_alumno=current_user.id_usuario,
            id_rutina=session_data.id_rutina,
            estado="incompleto"
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return new_session
    except Exception as e:
        db.rollback()
        print(f"ERROR INTERNO (Iniciar Sesión): {str(e)}")
        raise HTTPException(status_code=500, detail="Ocurrió un error interno en el servidor.")


from sqlalchemy import text

@router.put("/{id_sesion}/complete", response_model=schemas.EntrenamientoSesionOut)
def complete_session(
    id_sesion: str,
    data: schemas.EntrenamientoSesionComplete,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol != "alumno":
        raise HTTPException(status_code=403, detail="Sólo alumnos pueden completar sesiones")

    sesion = db.query(models.EntrenamientoSesion).filter(
        models.EntrenamientoSesion.id_sesion == id_sesion,
        models.EntrenamientoSesion.id_alumno == current_user.id_usuario
    ).first()

    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    try:
        # Registrar sets reales de forma atómica y agrupar por id_rutina_ejercicio
        max_e1rm_by_ejercicio = {}
        ejercicios_nombres = {}

        # Cargar alumno para peso corporal
        alumno = db.query(models.Alumno).filter(models.Alumno.id_usuario == current_user.id_usuario).first()
        peso_corporal = alumno.peso_corporal_actual or 70.0 # fallback

        for set_real in data.sets:
            new_set = models.EntrenamientoSetReal(
                id_set=uuid4(),
                id_sesion=sesion.id_sesion,
                id_rutina_ejercicio=set_real.id_rutina_ejercicio,
                peso_usado=set_real.peso_usado,
                reps_logradas=set_real.reps_logradas,
                rpe=set_real.rpe
            )
            db.add(new_set)

            # Buscar a qué ejercicio pertenece
            rut_ej = db.query(models.RutinaEjercicio).filter(models.RutinaEjercicio.id_rutina_ejercicio == set_real.id_rutina_ejercicio).first()
            if rut_ej:
                id_ejercicio = rut_ej.ejercicio.id_ejercicio
                nombre = rut_ej.ejercicio.nombre
                
                # Calcular e1RM = Peso * (1 + 0.0333 * Reps)
                peso_base = set_real.peso_usado
                if nombre == "Dominadas":
                    peso_base = peso_corporal + set_real.peso_usado
                    
                e1rm = peso_base * (1 + 0.0333 * set_real.reps_logradas)
                if id_ejercicio not in max_e1rm_by_ejercicio or e1rm > max_e1rm_by_ejercicio[id_ejercicio]:
                    max_e1rm_by_ejercicio[id_ejercicio] = e1rm
                    ejercicios_nombres[id_ejercicio] = nombre

        nuevos_prs = []

        # Verificar Historial para PRs y Ligas B2B
        for id_ejercicio, e1rm_bruto in max_e1rm_by_ejercicio.items():
            nombre_ej = ejercicios_nombres[id_ejercicio]
            
            # Recalcular e1rm final si es Dominadas (peso_usado es lastre)
            if nombre_ej == "Dominadas":
                # Find max sets for dominadas? Wait, e1rm_bruto is calculated as peso * (1+0.0333*reps).
                # To be precise, I should calculate it from the set directly, but I already maxed it. 
                # e1rm_bruto here was peso_usado * (1+0.0333*reps).
                # Actually, e1rm_final = e1rm_bruto but replacing peso_usado with (peso_corporal + peso_usado).
                # Since max_e1rm_by_ejercicio doesn't have reps, let's recalculate it accurately per set.
                pass
            
            historial = db.query(models.HistorialEjercicioAlumno).filter(
                models.HistorialEjercicioAlumno.id_alumno == current_user.id_usuario,
                models.HistorialEjercicioAlumno.id_ejercicio == id_ejercicio
            ).first()

            is_new_pr = False
            last_e1rm = 0.0

            if not historial:
                historial = models.HistorialEjercicioAlumno(
                    id_alumno=current_user.id_usuario,
                    id_ejercicio=id_ejercicio,
                    last_e1rm=e1rm_bruto
                )
                db.add(historial)
                is_new_pr = True
            else:
                last_e1rm = historial.last_e1rm
                if e1rm_bruto > historial.last_e1rm:
                    historial.last_e1rm = e1rm_bruto
                    is_new_pr = True

            if is_new_pr:
                nuevos_prs.append(nombre_ej)

            # --- Lógica de Ligas B2B y Antifraude ---
            MAPEO_PILARES_INVERSO = {
                "Press Banca": "Press Banca",
                "Sentadilla": "Sentadilla",
                "Peso Muerto": "Peso Muerto",
                "Press Militar": "Press Militar",
                "Dominadas": "Dominadas"
            }
            pilar = MAPEO_PILARES_INVERSO.get(nombre_ej)
            if pilar and is_new_pr:
                multiplicador = e1rm_bruto / peso_corporal

                # Buscar en gamificacion_umbrales el nivel alcanzado
                umbrales = db.query(models.GamificacionUmbral).filter(
                    models.GamificacionUmbral.ejercicio_nombre == pilar,
                    models.GamificacionUmbral.multiplicador_requerido <= multiplicador
                ).order_by(models.GamificacionUmbral.multiplicador_requerido.desc()).first()

                nivel_alcanzado = "Sin Nivel"
                subnivel_alcanzado = 0
                if umbrales:
                    nivel_alcanzado = umbrales.nivel_nombre
                    subnivel_alcanzado = umbrales.subnivel

                # Determinar Caso A o B
                # Salto porcentual (si last_e1rm == 0, es infinito, tratamos como automático salvo que alcance Platino)
                salto_porcentual = 0
                if last_e1rm > 0:
                    salto_porcentual = ((e1rm_bruto - last_e1rm) / last_e1rm) * 100

                estado_val = "aprobado_automatico"
                if salto_porcentual > 10.0 or nivel_alcanzado in ["Platino", "Diamante"]:
                    estado_val = "pendiente_auditoria"

                log_liga = models.LogLigaAlumno(
                    id_log=uuid4(),
                    id_alumno=current_user.id_usuario,
                    ejercicio_nombre=pilar,
                    nivel_alcanzado=nivel_alcanzado,
                    subnivel_alcanzado=subnivel_alcanzado,
                    estado_validacion=estado_val,
                    e1rm_logrado=e1rm_bruto
                )
                db.add(log_liga)

        sesion.estado = "completado"
        sesion.fecha_fin = data.fecha_fin
        
        db.commit()
        db.refresh(sesion)

        # Refresh de Vista Materializada (en caso de que aplique a rep_maxes)
        try:
            db.execute(text("REFRESH MATERIALIZED VIEW mv_rep_maxes"))
            db.execute(text("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_student_progress_chart"))
            db.commit()
        except Exception as mv_e:
            db.rollback()
            print("No se pudo refrescar la vista:", mv_e)

        # Set the dynamic property for response
        sesion_out = schemas.EntrenamientoSesionOut.model_validate(sesion)
        sesion_out.nuevos_prs = nuevos_prs
        return sesion_out

    except Exception as e:
        db.rollback()
        print(f"ERROR INTERNO (Offline Sync): {str(e)}")
        raise HTTPException(status_code=500, detail="Ocurrió un error interno en el servidor.")
