import os
from dotenv import load_dotenv
load_dotenv()
direct_url = os.environ.get("DIRECT_URL")
if direct_url:
    os.environ["DATABASE_URL"] = direct_url

from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("--- GAMIFICACION UMBRALES ---")
    res = conn.execute(text("SELECT COUNT(*) FROM gamificacion_umbrales")).scalar()
    print(f"Total umbrales: {res}")
    if res > 0:
        res_sample = conn.execute(text("SELECT * FROM gamificacion_umbrales LIMIT 5")).fetchall()
        for r in res_sample:
            print(r)
