import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(String, nullable=False) # 'entrenador' o 'alumno'
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

class Entrenador(Base):
    __tablename__ = "entrenadores"
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario"), primary_key=True)
    nombre = Column(String)
    especialidad = Column(String)
    biografia = Column(String)
    anios_experiencia = Column(Integer)
    url_foto_perfil = Column(String) # Se alojará en Cloudflare R2
    limite_alumnos = Column(Integer, default=10, nullable=False)
    fecha_vencimiento = Column(DateTime, nullable=True)
    estado_financiero = Column(String, default="activo", nullable=False) # 'activo', 'suspendido'
    
    usuario = relationship("Usuario")

class Alumno(Base):
    __tablename__ = "alumnos"
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario"), primary_key=True)
    id_entrenador = Column(UUID(as_uuid=True), ForeignKey("entrenadores.id_usuario"), nullable=False)
    peso_corporal_actual = Column(Float)
    fecha_ultimo_peso = Column(DateTime, default=datetime.utcnow)
    objetivo = Column(String)
    estado_activo = Column(Boolean, default=True, index=True)
    id_rutina_activa = Column(UUID(as_uuid=True), ForeignKey("rutinas.id_rutina"), nullable=True)
    
    usuario = relationship("Usuario")
    entrenador = relationship("Entrenador")

class GamificacionUmbral(Base):
    __tablename__ = "gamificacion_umbrales"
    id_umbral = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ejercicio_nombre = Column(String, nullable=False)
    nivel_nombre = Column(String, nullable=False) # ej: Cobre, Bronce, Plata, Oro, Platino, Diamante
    subnivel = Column(Integer, nullable=False) # ej: 1, 2, 3
    multiplicador_requerido = Column(Float, nullable=False)

class LogLigaAlumno(Base):
    __tablename__ = "log_ligas_alumnos"
    id_log = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_alumno = Column(UUID(as_uuid=True), ForeignKey("alumnos.id_usuario"), nullable=False)
    ejercicio_nombre = Column(String, nullable=False)
    nivel_alcanzado = Column(String, nullable=False)
    subnivel_alcanzado = Column(Integer, nullable=False)
    fecha_logro = Column(DateTime, default=datetime.utcnow)
    estado_validacion = Column(String, nullable=False) # aprobado_automatico, pendiente_auditoria, aprobado_manual, rechazado
    e1rm_logrado = Column(Float, nullable=False)

class Ejercicio(Base):
    __tablename__ = "ejercicios"
    id_ejercicio = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    url_media = Column(String) # URL estática de Cloudflare R2
    # Si es null, es un ejercicio global del sistema. Si tiene UUID, es custom del entrenador.
    id_entrenador = Column(UUID(as_uuid=True), ForeignKey("entrenadores.id_usuario"), nullable=True)

class EjercicioMediaCoach(Base):
    __tablename__ = "ejercicios_media_coaches"
    id_override = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_ejercicio = Column(UUID(as_uuid=True), ForeignKey("ejercicios.id_ejercicio"), nullable=False)
    id_entrenador = Column(UUID(as_uuid=True), ForeignKey("entrenadores.id_usuario"), nullable=False)
    url_media = Column(String, nullable=False)

class Rutina(Base):
    __tablename__ = "rutinas"
    id_rutina = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_entrenador = Column(UUID(as_uuid=True), ForeignKey("entrenadores.id_usuario"), nullable=False)
    nombre_rutina = Column(String, nullable=False)
    version_id = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    frecuencia_semanal = Column(Integer, default=3)
    
    dias = relationship("RutinaDia", cascade="all, delete-orphan", order_by="RutinaDia.orden")

class RutinaDia(Base):
    __tablename__ = "rutinas_dias"
    id_dia = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_rutina = Column(UUID(as_uuid=True), ForeignKey("rutinas.id_rutina"), nullable=False)
    nombre_dia = Column(String, nullable=False)
    orden = Column(Integer, nullable=False)
    
    ejercicios = relationship("RutinaEjercicio", cascade="all, delete-orphan")

class RutinaEjercicio(Base):
    __tablename__ = "rutinas_ejercicios"
    id_rutina_ejercicio = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_dia = Column(UUID(as_uuid=True), ForeignKey("rutinas_dias.id_dia"), nullable=False)
    id_ejercicio = Column(UUID(as_uuid=True), ForeignKey("ejercicios.id_ejercicio"), nullable=False)
    series_esperadas = Column(Integer, nullable=False)
    reps_esperadas = Column(Integer, nullable=False)
    descanso_segundos = Column(Integer)
    orden = Column(Integer, nullable=False)

    ejercicio = relationship("Ejercicio")

class EntrenamientoSesion(Base):
    __tablename__ = "entrenamiento_sesiones"
    id_sesion = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_alumno = Column(UUID(as_uuid=True), ForeignKey("alumnos.id_usuario"), nullable=False)
    id_rutina = Column(UUID(as_uuid=True), ForeignKey("rutinas.id_rutina"), nullable=False)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_fin = Column(DateTime, nullable=True)
    estado = Column(String, nullable=False) # 'completado', 'incompleto'

    sets = relationship("EntrenamientoSetReal", cascade="all, delete-orphan", backref="sesion")

class EntrenamientoSetReal(Base):
    __tablename__ = "entrenamiento_sets_reales"
    id_set = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_sesion = Column(UUID(as_uuid=True), ForeignKey("entrenamiento_sesiones.id_sesion"), nullable=False)
    id_rutina_ejercicio = Column(UUID(as_uuid=True), ForeignKey("rutinas_ejercicios.id_rutina_ejercicio"), nullable=False)
    peso_usado = Column(Float, nullable=False)
    reps_logradas = Column(Integer, nullable=False)
    rpe = Column(Integer, nullable=True)

class HistorialEjercicioAlumno(Base):
    __tablename__ = "historial_ejercicios_alumnos"
    id_historial = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_alumno = Column(UUID(as_uuid=True), ForeignKey("alumnos.id_usuario"), nullable=False)
    id_ejercicio = Column(UUID(as_uuid=True), ForeignKey("ejercicios.id_ejercicio"), nullable=False)
    last_e1rm = Column(Float, nullable=False, default=0.0)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Invitacion(Base):
    __tablename__ = "invitaciones"
    id_invitacion = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_entrenador = Column(UUID(as_uuid=True), ForeignKey("entrenadores.id_usuario"), nullable=False)
    codigo_unico = Column(String, unique=True, index=True, nullable=False)
    email_destinatario = Column(String, nullable=True)
    is_used = Column(Boolean, default=False, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_expiracion = Column(DateTime, nullable=False)
    
    entrenador = relationship("Entrenador")