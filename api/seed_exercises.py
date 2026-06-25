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
    {"nombre": "Sentadilla"},
    {"nombre": "Press Banca"},
    {"nombre": "Peso Muerto"},
    {"nombre": "Press Militar"},
    {"nombre": "Dominadas"},
]

def seed_ejercicios():
    db: Session = SessionLocal()
    try:
        print("Iniciando sembrado de ejercicios predeterminados...")
        for ej_data in EJERCICIOS_BASE:
            # Verificar si ya existe
            existe = db.query(Ejercicio).filter(Ejercicio.nombre == ej_data["nombre"]).first()
            if not existe:
                nuevo = Ejercicio(
                    nombre=ej_data["nombre"]
                )
                db.add(nuevo)
                print(f"[+] Agregado: {ej_data['nombre']}")
            else:
                print(f"[i] Ya existia: {ej_data['nombre']}")
        
        db.commit()
        print("[!] Sembrado completado exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"[x] Error durante el sembrado: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_ejercicios()
