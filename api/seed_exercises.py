import os
import sys
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
# Usar DIRECT_URL localmente para evitar el error de pgbouncer
direct_url = os.environ.get("DIRECT_URL")
if direct_url:
    os.environ["DATABASE_URL"] = direct_url

# Asegurar que el path sea correcto para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Ejercicio

EJERCICIOS_BASE = [
    {"nombre": "Press Banca Plano", "categoria": "Pecho", "url_gif": None},
    {"nombre": "Press Inclinado con Mancuernas", "categoria": "Pecho", "url_gif": None},
    {"nombre": "Aperturas en Polea", "categoria": "Pecho", "url_gif": None},
    {"nombre": "Dominadas", "categoria": "Espalda", "url_gif": None},
    {"nombre": "Remo con Barra", "categoria": "Espalda", "url_gif": None},
    {"nombre": "Jalón al Pecho", "categoria": "Espalda", "url_gif": None},
    {"nombre": "Sentadilla Libre", "categoria": "Piernas", "url_gif": None},
    {"nombre": "Prensa de Piernas", "categoria": "Piernas", "url_gif": None},
    {"nombre": "Peso Muerto", "categoria": "Piernas", "url_gif": None},
    {"nombre": "Extensiones de Cuádriceps", "categoria": "Piernas", "url_gif": None},
    {"nombre": "Curl de Isquios", "categoria": "Piernas", "url_gif": None},
    {"nombre": "Press Militar", "categoria": "Hombros", "url_gif": None},
    {"nombre": "Elevaciones Laterales", "categoria": "Hombros", "url_gif": None},
    {"nombre": "Pájaros", "categoria": "Hombros", "url_gif": None},
    {"nombre": "Curl de Bíceps con Barra", "categoria": "Brazos", "url_gif": None},
    {"nombre": "Curl Martillo", "categoria": "Brazos", "url_gif": None},
    {"nombre": "Extensión de Tríceps en Polea", "categoria": "Brazos", "url_gif": None},
    {"nombre": "Fondos en Paralelas", "categoria": "Brazos", "url_gif": None},
    {"nombre": "Plancha Abdominal", "categoria": "Core", "url_gif": None},
    {"nombre": "Crunch Abdominal", "categoria": "Core", "url_gif": None},
    {"nombre": "Rueda Abdominal", "categoria": "Core", "url_gif": None}
]

def seed_ejercicios():
    db: Session = SessionLocal()
    try:
        print("Iniciando sembrado de ejercicios predeterminados...")
        for ej_data in EJERCICIOS_BASE:
            existe = db.query(Ejercicio).filter(Ejercicio.nombre == ej_data["nombre"]).first()
            if not existe:
                nuevo = Ejercicio(
                    nombre=ej_data["nombre"],
                    categoria=ej_data["categoria"],
                    url_gif=ej_data["url_gif"]
                )
                db.add(nuevo)
                print(f"[+] Agregado: {ej_data['nombre']}")
            else:
                existe.categoria = ej_data["categoria"]
                existe.url_gif = ej_data["url_gif"]
                print(f"[i] Actualizado: {ej_data['nombre']}")
        
        db.commit()
        print("[!] Sembrado completado exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"[x] Error durante el sembrado: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_ejercicios()
