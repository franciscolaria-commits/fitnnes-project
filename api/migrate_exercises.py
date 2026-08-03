import os
from dotenv import load_dotenv

# Configurar variables de entorno y usar DIRECT_URL para migraciones si existe
load_dotenv()
direct_url = os.environ.get("DIRECT_URL")
if direct_url:
    os.environ["DATABASE_URL"] = direct_url

from app.database import engine
from sqlalchemy import text

def upgrade():
    print("Iniciando migración de ejercicios...")
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE ejercicios ADD COLUMN categoria VARCHAR DEFAULT 'General'"))
            print("Agregada columna categoria a ejercicios.")
        except Exception as e:
            print("Columna categoria ya existe o error:", e)
            
        try:
            conn.execute(text("ALTER TABLE ejercicios ADD COLUMN url_gif VARCHAR"))
            print("Agregada columna url_gif a ejercicios.")
        except Exception as e:
            print("Columna url_gif ya existe en ejercicios o error:", e)
            
        try:
            conn.execute(text("ALTER TABLE ejercicios_media_coaches ADD COLUMN url_gif VARCHAR"))
            print("Agregada columna url_gif a ejercicios_media_coaches.")
        except Exception as e:
            print("Columna url_gif ya existe en ejercicios_media_coaches o error:", e)
            
        try:
            conn.execute(text("ALTER TABLE ejercicios_media_coaches ALTER COLUMN url_media DROP NOT NULL"))
            print("url_media de ejercicios_media_coaches ahora permite NULL.")
        except Exception as e:
            print("url_media ya permite NULL o error:", e)
            
    print("Migración de ejercicios completada.")

if __name__ == "__main__":
    upgrade()
