import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models import Usuario, Entrenador, Alumno, Invitacion
from app.schemas import UsuarioCreate, UsuarioOut, AlumnoCreate, AlumnoOut, Token
from app.utils.auth import (
    generar_hash_password,
    verificar_password,
    crear_token_acceso
)
from app.utils.rate_limit import limiter

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["autenticación"]
)

@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def register_coach(user_data: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario con rol de Entrenador profesional.
    Crea tanto el registro principal en 'usuarios' como el secundario en 'entrenadores'.
    """
    if user_data.rol != "entrenador":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este endpoint es exclusivo para el registro de entrenadores profesionales."
        )
        
    # Verificar si el email ya existe
    existing_user = db.query(Usuario).filter(Usuario.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )
        
    try:
        # Crear usuario principal
        hashed_password = generar_hash_password(user_data.password)
        nuevo_usuario = Usuario(
            email=user_data.email.lower(),
            password_hash=hashed_password,
            rol="entrenador"
        )
        db.add(nuevo_usuario)
        db.flush() # Obtener id_usuario generado por la base de datos
        
        # Crear perfil del entrenador asociado
        nuevo_entrenador = Entrenador(
            id_usuario=nuevo_usuario.id_usuario,
            especialidad=None,
            biografia=None,
            url_foto_perfil=None
        )
        db.add(nuevo_entrenador)
        db.commit()
        db.refresh(nuevo_usuario)
        
        return nuevo_usuario
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante el registro del entrenador: {str(e)}"
        )

@router.post("/register-student", response_model=AlumnoOut, status_code=status.HTTP_201_CREATED)
def register_student(student_data: AlumnoCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario con rol de Alumno.
    Valida estrictamente el código de invitación provisto por el entrenador.
    Asocia el alumno al entrenador y marca la invitación como utilizada.
    """
    # 1. Verificar si el email ya existe
    existing_user = db.query(Usuario).filter(Usuario.email == student_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )
        
    # 2. Validar el código de invitación (Debe ser UUIDv4 estricto)
    invitacion = db.query(Invitacion).filter(Invitacion.codigo_unico == str(student_data.codigo_invitacion)).first()
    if not invitacion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de invitación proporcionado es inválido o no existe."
        )
        
    if invitacion.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de invitación ya ha sido utilizado."
        )
        
    if invitacion.fecha_expiracion < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de invitación ha expirado y ya no es válido."
        )
        
    try:
        # 3. Crear usuario principal (Alumno)
        hashed_password = generar_hash_password(student_data.password)
        nuevo_usuario = Usuario(
            email=student_data.email.lower(),
            password_hash=hashed_password,
            rol="alumno"
        )
        db.add(nuevo_usuario)
        db.flush()
        
        # 4. Crear perfil de Alumno asociado al entrenador de la invitación
        nuevo_alumno = Alumno(
            id_usuario=nuevo_usuario.id_usuario,
            id_entrenador=invitacion.id_entrenador,
            peso_corporal_actual=student_data.peso_corporal_actual,
            objetivo=student_data.objetivo,
            estado_activo=True
        )
        db.add(nuevo_alumno)
        
        # 5. Inhabilitar la invitación
        invitacion.is_used = True
        
        db.commit()
        db.refresh(nuevo_alumno)
        return nuevo_alumno
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante el registro del alumno: {str(e)}"
        )

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para autenticar usuarios mediante OAuth2.
    Valida las credenciales y retorna un token de acceso JWT.
    """
    # 1. Validar si es el SuperAdmin B2B
    SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL")
    SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD")
    
    if SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD and form_data.username.lower() == SUPERADMIN_EMAIL.lower() and form_data.password == SUPERADMIN_PASSWORD:
        access_token = crear_token_acceso(data={"sub": SUPERADMIN_EMAIL, "rol": "superadmin"})
        # Retornamos UUID dummy (lleno de ceros) ya que no existe en tabla usuarios
        return Token(
            access_token=access_token,
            token_type="bearer",
            email=SUPERADMIN_EMAIL,
            rol="superadmin",
            id_usuario=UUID("00000000-0000-0000-0000-000000000000")
        )
        
    # 2. Validar usuarios normales en BD
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username.lower()).first()
    if not usuario or not verificar_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Crear token JWT
    access_token = crear_token_acceso(data={"sub": usuario.email, "rol": usuario.rol})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        email=usuario.email,
        rol=usuario.rol,
        id_usuario=usuario.id_usuario
    )
