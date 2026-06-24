import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db
from app.models import Usuario, Entrenador, Invitacion
from app.schemas import EntrenadorOut, EntrenadorUpdate, InvitacionOut, InvitacionCreate
from app.utils.auth import get_current_user
from app.services.r2 import upload_file_to_r2

router = APIRouter(
    prefix="/api/v1/coaches",
    tags=["entrenadores"]
)

@router.get("/profile", response_model=EntrenadorOut)
def get_coach_profile(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene el perfil profesional del entrenador autenticado.
    """
    if current_user.rol != "entrenador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso exclusivo para entrenadores."
        )
        
    perfil = db.query(Entrenador).filter(Entrenador.id_usuario == current_user.id_usuario).first()
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de entrenador no encontrado."
        )
        
    return perfil

@router.put("/profile", response_model=EntrenadorOut)
def update_coach_profile(
    profile_data: EntrenadorUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el perfil profesional del entrenador autenticado.
    Permite modificar la especialidad, biografía y url de la foto de perfil (alojada en R2).
    """
    if current_user.rol != "entrenador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso exclusivo para entrenadores."
        )
        
    perfil = db.query(Entrenador).filter(Entrenador.id_usuario == current_user.id_usuario).first()
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de entrenador no encontrado."
        )
        
    try:
        if profile_data.nombre is not None:
            perfil.nombre = profile_data.nombre
        if profile_data.especialidad is not None:
            perfil.especialidad = profile_data.especialidad
        if profile_data.biografia is not None:
            perfil.biografia = profile_data.biografia
        if profile_data.anios_experiencia is not None:
            perfil.anios_experiencia = profile_data.anios_experiencia
        if profile_data.url_foto_perfil is not None:
            perfil.url_foto_perfil = profile_data.url_foto_perfil
            
        db.commit()
        db.refresh(perfil)
        return perfil
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el perfil: {str(e)}"
        )

@router.post("/profile/image", response_model=EntrenadorOut)
async def upload_coach_profile_image(
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sube una foto de perfil para el entrenador a Cloudflare R2 y actualiza su perfil.
    """
    if current_user.rol != "entrenador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso exclusivo para entrenadores."
        )
        
    perfil = db.query(Entrenador).filter(Entrenador.id_usuario == current_user.id_usuario).first()
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de entrenador no encontrado."
        )
        
    try:
        # Validate file size (e.g., 5MB limit)
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="El archivo es demasiado grande. Máximo 5MB.")
            
        file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
        unique_filename = f"profiles/coach_{current_user.id_usuario}_{uuid.uuid4().hex[:8]}.{file_ext}"
        
        url_foto = upload_file_to_r2(contents, unique_filename, file.content_type or f"image/{file_ext}")
        if not url_foto:
            raise HTTPException(status_code=500, detail="Error al subir la imagen a Cloudflare R2.")
            
        perfil.url_foto_perfil = url_foto
        db.commit()
        db.refresh(perfil)
        return perfil
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la imagen: {str(e)}"
        )

@router.post("/invitations", response_model=InvitacionOut, status_code=status.HTTP_201_CREATED)
def create_invitation(
    invitation_data: InvitacionCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Genera un nuevo código de invitación único (UUIDv4 inquebrantable) 
    para vincular un alumno con este entrenador. Expiración de 7 días.
    """
    if current_user.rol != "entrenador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso exclusivo para entrenadores."
        )
        
    try:
        # Generar código de invitación obligatoriamente como UUIDv4
        codigo_uuid = uuid.uuid4()
        
        nueva_invitacion = Invitacion(
            id_entrenador=current_user.id_usuario,
            codigo_unico=str(codigo_uuid),
            email_destinatario=invitation_data.email_destinatario.lower() if invitation_data.email_destinatario else None,
            is_used=False,
            fecha_expiracion=datetime.utcnow() + timedelta(days=7)
        )
        
        db.add(nueva_invitacion)
        db.commit()
        db.refresh(nueva_invitacion)
        
        return nueva_invitacion
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar la invitación: {str(e)}"
        )

@router.get("/invitations", response_model=List[InvitacionOut])
def get_invitations(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas las invitaciones creadas por este entrenador.
    """
    if current_user.rol != "entrenador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso exclusivo para entrenadores."
        )
        
    invitaciones = db.query(Invitacion).filter(Invitacion.id_entrenador == current_user.id_usuario).order_by(Invitacion.fecha_creacion.desc()).all()
    return invitaciones

@router.get("/audits/pending", response_model=List[schemas.LogLigaAlumnoOut])
def get_pending_audits(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    if current_user.rol != "entrenador":
        raise HTTPException(status_code=403, detail="Sólo entrenadores pueden ver auditorías")
        
    logs = db.query(models.LogLigaAlumno).join(
        models.Alumno, models.Alumno.id_usuario == models.LogLigaAlumno.id_alumno
    ).filter(
        models.Alumno.id_entrenador == current_user.id_usuario,
        models.LogLigaAlumno.estado_validacion == "pendiente_auditoria"
    ).all()
    
    # Mapear para incluir nombre del alumno
    result = []
    for log in logs:
        usuario_alumno = db.query(models.Usuario).filter(models.Usuario.id_usuario == log.id_alumno).first()
        log_dict = {
            "id_log": log.id_log,
            "id_alumno": log.id_alumno,
            "alumno_nombre": usuario_alumno.email.split("@")[0] if usuario_alumno else "Alumno", # fallback
            "ejercicio_nombre": log.ejercicio_nombre,
            "nivel_alcanzado": log.nivel_alcanzado,
            "subnivel_alcanzado": log.subnivel_alcanzado,
            "fecha_logro": log.fecha_logro,
            "e1rm_logrado": log.e1rm_logrado
        }
        result.append(log_dict)
        
    return result

@router.post("/audits/{id_log}/resolve")
def resolve_audit(
    id_log: str, 
    data: schemas.AuditResolveRequest,
    db: Session = Depends(get_db), 
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol != "entrenador":
        raise HTTPException(status_code=403, detail="Sólo entrenadores")
        
    log = db.query(models.LogLigaAlumno).filter(models.LogLigaAlumno.id_log == id_log).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log no encontrado")
        
    # Validar que pertenece a un alumno suyo
    alumno = db.query(models.Alumno).filter(models.Alumno.id_usuario == log.id_alumno).first()
    if not alumno or alumno.id_entrenador != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso sobre este alumno")
        
    if data.action == "aprobar":
        log.estado_validacion = "aprobado_manual"
        db.commit()
        return {"status": "Aprobado", "message": "Récord validado exitosamente."}
    elif data.action == "rechazar":
        log.estado_validacion = "rechazado"
        db.commit()
        return {"status": "Rechazado", "message": "Récord rechazado."}
    else:
        raise HTTPException(status_code=400, detail="Acción inválida")
