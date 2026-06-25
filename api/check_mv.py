import os
from dotenv import load_dotenv
load_dotenv()
direct_url = os.environ.get("DIRECT_URL")
if direct_url:
    os.environ["DATABASE_URL"] = direct_url

from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("--- MV REP MAXES ---")
    res = conn.execute(text("SELECT * FROM mv_rep_maxes")).fetchall()
    for r in res:
        print(r)
    
    print("\n--- EJERCICIOS ---")
    res = conn.execute(text("SELECT id_ejercicio, nombre FROM ejercicios")).fetchall()
    for r in res:
        print(r)

    print("\n--- HISTORIAL ---")
    res = conn.execute(text("SELECT * FROM historial_ejercicios_alumnos")).fetchall()
    for r in res:
        print(r)
