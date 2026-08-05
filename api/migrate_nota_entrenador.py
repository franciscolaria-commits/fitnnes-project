from app.database import ALEMBIC_DATABASE_URL
from sqlalchemy import create_engine, text

engine = create_engine(ALEMBIC_DATABASE_URL)

def migrate():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE rutinas_ejercicios ADD COLUMN nota_entrenador VARCHAR NULL;"))
            print("Successfully added nota_entrenador column to rutinas_ejercicios.")
        except Exception as e:
            if "already exists" in str(e) or "Duplicate column" in str(e):
                print("Column nota_entrenador already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    migrate()
