from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# ==========================================
# ESQUEMAS DE USUARIO
# ==========================================

class UsuarioBase(BaseModel):
    email: EmailStr

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6, description="Contraseña de al menos 6 caracteres")
    rol: str = Field(..., pattern="^(entrenador|alumno)$", description="El rol debe ser 'entrenador' o 'alumno'")

class UsuarioOut(UsuarioBase):
    id_usuario: UUID
    rol: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True


# ==========================================
# ESQUEMAS DE AUTENTICACIÓN / TOKENS
# ==========================================

class Token(BaseModel):
    access_token: str
    token_type: str
    email: str
    rol: str
    id_usuario: UUID

class TokenData(BaseModel):
    email: Optional[str] = None


# ==========================================
# ESQUEMAS DE ENTRENADOR
# ==========================================

class EntrenadorBase(BaseModel):
    nombre: Optional[str] = None
    especialidad: Optional[str] = None
    biografia: Optional[str] = None
    anios_experiencia: Optional[int] = None
    url_foto_perfil: Optional[str] = None
    limite_alumnos: Optional[int] = 10
    fecha_vencimiento: Optional[datetime] = None
    estado_financiero: Optional[str] = "activo"

class EntrenadorUpdate(EntrenadorBase):
    pass

class EntrenadorOut(EntrenadorBase):
    id_usuario: UUID
    usuario: UsuarioOut

    class Config:
        from_attributes = True


# ==========================================
# ESQUEMAS DE INVITACIÓN
# ==========================================

class InvitacionCreate(BaseModel):
    email_destinatario: Optional[EmailStr] = None

class InvitacionOut(BaseModel):
    id_invitacion: UUID
    id_entrenador: UUID
    codigo_unico: UUID
    email_destinatario: Optional[str] = None
    is_used: bool
    fecha_creacion: datetime
    fecha_expiracion: datetime

    class Config:
        from_attributes = True


# ==========================================
# ESQUEMAS DE ALUMNO
# ==========================================

class AlumnoBase(BaseModel):
    peso_corporal_actual: Optional[float] = None
    objetivo: Optional[str] = None

class AlumnoCreate(AlumnoBase):
    email: EmailStr
    password: str = Field(..., min_length=6)
    codigo_invitacion: UUID = Field(..., description="UUIDv4 único de invitación provisto por el entrenador")

class AlumnoUpdate(AlumnoBase):
    estado_activo: Optional[bool] = None

class AlumnoOut(AlumnoBase):
    id_usuario: UUID
    id_entrenador: UUID
    estado_activo: bool
    fecha_ultimo_peso: Optional[datetime] = None
    usuario: UsuarioOut
    entrenador: Optional[EntrenadorOut] = None

    class Config:
        from_attributes = True


# ==========================================
# ESQUEMAS DE EJERCICIO
# ==========================================

class EjercicioBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    url_media: Optional[str] = None

class EjercicioCreate(EjercicioBase):
    pass

class EjercicioUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    url_media: Optional[str] = None

class EjercicioOut(EjercicioBase):
    id_ejercicio: UUID
    id_entrenador: Optional[UUID] = None

    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS DE RUTINAS
# ==========================================

class RutinaEjercicioCreate(BaseModel):
    id_ejercicio: UUID
    series_esperadas: int
    reps_esperadas: int
    descanso_segundos: Optional[int] = None
    orden: int

class RutinaDiaCreate(BaseModel):
    nombre_dia: str
    orden: int
    ejercicios: List[RutinaEjercicioCreate]

class RutinaCreate(BaseModel):
    nombre_rutina: str
    dias: List[RutinaDiaCreate]

class RutinaEjercicioOut(BaseModel):
    id_rutina_ejercicio: UUID
    id_ejercicio: UUID
    series_esperadas: int
    reps_esperadas: int
    descanso_segundos: Optional[int] = None
    orden: int
    ejercicio: Optional[EjercicioOut] = None

    class Config:
        from_attributes = True

class RutinaDiaOut(BaseModel):
    id_dia: UUID
    nombre_dia: str
    orden: int
    ejercicios: List[RutinaEjercicioOut] = []

    class Config:
        from_attributes = True

class RutinaOut(BaseModel):
    id_rutina: UUID
    nombre_rutina: str
    version_id: int
    is_active: bool
    fecha_creacion: datetime
    dias: List[RutinaDiaOut] = []

    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS DE ASIGNACIÓN
# ==========================================

class AsignacionCreate(BaseModel):
    id_alumno: UUID

# ==========================================
# ESQUEMAS DE SESIONES Y ENTRENAMIENTO OFFLINE
# ==========================================

class EntrenamientoSetRealCreate(BaseModel):
    id_rutina_ejercicio: UUID
    peso_usado: float
    reps_logradas: int
    rpe: Optional[int] = None

class EntrenamientoSesionStart(BaseModel):
    id_rutina: UUID

class EntrenamientoSesionStartOut(BaseModel):
    id_sesion: UUID
    id_rutina: UUID
    estado: str

class EntrenamientoSesionComplete(BaseModel):
    fecha_fin: datetime
    sets: List[EntrenamientoSetRealCreate]

class EntrenamientoSetRealOut(BaseModel):
    id_set: UUID
    id_rutina_ejercicio: UUID
    peso_usado: float
    reps_logradas: int
    rpe: Optional[int] = None
    rutina_ejercicio: Optional[RutinaEjercicioOut] = None

    class Config:
        from_attributes = True

class EntrenamientoSesionOut(BaseModel):
    id_sesion: UUID
    id_alumno: UUID
    id_rutina: UUID
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    estado: str
    sets: List[EntrenamientoSetRealOut] = []
    nuevos_prs: List[str] = []

    class Config:
        from_attributes = True

class StudentStatsOut(BaseModel):
    total_sessions: int
    total_volume_kg: float
    total_reps: int
    win_rate_percentage: float
    rolling_adherence: float
    rep_maxes: dict

class LogLigaAlumnoOut(BaseModel):
    id_log: UUID
    id_alumno: UUID
    alumno_nombre: str
    ejercicio_nombre: str
    nivel_alcanzado: str
    subnivel_alcanzado: int
    fecha_logro: datetime
    e1rm_logrado: float

    class Config:
        from_attributes = True

class AuditResolveRequest(BaseModel):
    action: str # "aprobar" o "rechazar"

class LeagueStatusOut(BaseModel):
    ejercicio_nombre: str
    e1rm_actual: float
    multiplicador_actual: float
    nivel_actual: str
    subnivel_actual: int
    peso_faltante_proximo_nivel: float
    proximo_nivel: Optional[str] = None
    proximo_subnivel: Optional[int] = None
    is_pending_audit: bool

    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS SUPERADMIN
# ==========================================

class CoachAdminOut(BaseModel):
    id_usuario: UUID
    nombre: Optional[str] = None
    email: str
    limite_alumnos: int
    estado_financiero: str
    fecha_vencimiento: Optional[datetime] = None
    total_alumnos: int

class CoachAdminUpdate(BaseModel):
    limite_alumnos: Optional[int] = None
    estado_financiero: Optional[str] = None
    fecha_vencimiento: Optional[datetime] = None
