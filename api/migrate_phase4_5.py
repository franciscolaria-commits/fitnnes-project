import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from sqlalchemy import text
from sqlalchemy.orm import Session
from app import models
import uuid

def upgrade():
    # 1. Crear nuevas tablas (GamificacionUmbral, LogLigaAlumno)
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        # 2. Agregar fecha_ultimo_peso a alumnos
        try:
            conn.execute(text("ALTER TABLE alumnos ADD COLUMN fecha_ultimo_peso TIMESTAMP;"))
            conn.execute(text("UPDATE alumnos SET fecha_ultimo_peso = NOW() WHERE fecha_ultimo_peso IS NULL;"))
            print("Columna 'fecha_ultimo_peso' añadida y populada.")
        except Exception as e:
            if "already exists" in str(e):
                print("Columna 'fecha_ultimo_peso' ya existe.")
            else:
                print("Ignorando error al alterar alumnos:", e)

    # 3. Población de Umbrales (Seed)
    with Session(engine) as session:
        count = session.query(models.GamificacionUmbral).count()
        if count == 0:
            print("Populando GamificacionUmbral...")
            
            # Definir ejercicios y sus bases (Cobre 1, Diamante 3 aprox).
            # Para 15 niveles, usaremos: Cobre (1-3), Bronce (1-3), Plata (1-3), Oro (1-3), Platino (1-3).
            # Total: 5 x 3 = 15 niveles
            niveles = ["Cobre", "Bronce", "Plata", "Oro", "Platino"]
            
            # Formato: (base_cobre, tope_platino)
            bases = {
                "Press Banca": (0.5, 1.6),
                "Sentadilla": (0.7, 2.0),
                "Peso Muerto": (0.9, 2.5),
                "Press Militar": (0.3, 1.1),
                "Dominadas": (0.0, 0.7) # Extra BW
            }

            for ej, (base, tope) in bases.items():
                paso = (tope - base) / 14.0 # 14 saltos para llegar del nivel 1 al nivel 15
                
                umbral_idx = 0
                for n_idx, nombre_nivel in enumerate(niveles):
                    for subnivel in range(1, 4):
                        mult = base + (paso * umbral_idx)
                        umbral = models.GamificacionUmbral(
                            id_umbral=uuid.uuid4(),
                            ejercicio_nombre=ej,
                            nivel_nombre=nombre_nivel,
                            subnivel=subnivel,
                            multiplicador_requerido=round(mult, 3)
                        )
                        session.add(umbral)
                        umbral_idx += 1
            session.commit()
            print("Población completada. 75 umbrales creados.")
        else:
            print("Umbrales ya poblados.")

if __name__ == "__main__":
    upgrade()
    print("Migración de Fase 4.5 Día 1 completada.")
