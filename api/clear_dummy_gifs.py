import os
from dotenv import load_dotenv

# Configurar variables de entorno y usar DIRECT_URL para migraciones si existe
load_dotenv()
direct_url = os.environ.get("DIRECT_URL")
if direct_url:
    os.environ["DATABASE_URL"] = direct_url

from app.database import engine
from sqlalchemy import text

def clear_gifs():
    print("Limpiando GIFs falsos...")
    with engine.begin() as conn:
        result = conn.execute(text("UPDATE ejercicios SET url_gif = NULL WHERE url_gif LIKE '%placeholder.com%'"))
        print(f"Ejercicios actualizados: {result.rowcount}")
    print("Limpieza completada.")

if __name__ == "__main__":
    clear_gifs()
