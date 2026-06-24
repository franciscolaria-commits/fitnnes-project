import sys
import os

# Añadir la carpeta raíz del backend al PYTHONPATH para importar correctamente
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal
from app.models import Ejercicio

# Placeholders SVG estilizados representativos para cada categoría de ejercicio
# Usamos HSL y degradados oscuros premium que combinan con nuestro diseño glassmorphic.

SVG_LEGS = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'>"
    "<defs><linearGradient id='legGrad' x1='0%' y1='0%' x2='100%' y2='100%'>"
    "<stop offset='0%' stop-color='%233b82f6'/><stop offset='100%' stop-color='%231d4ed8'/></linearGradient></defs>"
    "<circle cx='50' cy='50' r='45' fill='url(%23legGrad)' opacity='0.15'/>"
    "<path d='M35 80 L45 55 L50 35 L55 55 L65 80' stroke='%233b82f6' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'/>"
    "<circle cx='50' cy='20' r='8' fill='%2360a5fa'/>"
    "<rect x='30' y='42' width='40' height='6' rx='3' fill='%2360a5fa'/>"
    "</svg>"
)

SVG_CHEST = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'>"
    "<defs><linearGradient id='chestGrad' x1='0%' y1='0%' x2='100%' y2='100%'>"
    "<stop offset='0%' stop-color='%23ec4899'/><stop offset='100%' stop-color='%23be185d'/></linearGradient></defs>"
    "<circle cx='50' cy='50' r='45' fill='url(%23chestGrad)' opacity='0.15'/>"
    "<line x1='15' y1='50' x2='85' y2='50' stroke='%23ec4899' stroke-width='6' stroke-linecap='round'/>"
    "<rect x='10' y='35' width='10' height='30' rx='2' fill='%23f472b6'/>"
    "<rect x='80' y='35' width='10' height='30' rx='2' fill='%23f472b6'/>"
    "<circle cx='50' cy='50' r='12' stroke='%23f472b6' stroke-width='3' fill='none'/>"
    "</svg>"
)

SVG_BACK = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'>"
    "<defs><linearGradient id='backGrad' x1='0%' y1='0%' x2='100%' y2='100%'>"
    "<stop offset='0%' stop-color='%238b5cf6'/><stop offset='100%' stop-color='%235b21b6'/></linearGradient></defs>"
    "<circle cx='50' cy='50' r='45' fill='url(%23backGrad)' opacity='0.15'/>"
    "<path d='M30 40 Q50 20 70 40 T50 75 Z' fill='none' stroke='%238b5cf6' stroke-width='4' stroke-linejoin='round'/>"
    "<circle cx='50' cy='32' r='6' fill='%23a78bfa'/>"
    "<line x1='20' y1='25' x2='80' y2='25' stroke='%23a78bfa' stroke-width='4' stroke-linecap='round'/>"
    "</svg>"
)

SVG_ARMS = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'>"
    "<defs><linearGradient id='armGrad' x1='0%' y1='0%' x2='100%' y2='100%'>"
    "<stop offset='0%' stop-color='%2310b981'/><stop offset='100%' stop-color='%23047857'/></linearGradient></defs>"
    "<circle cx='50' cy='50' r='45' fill='url(%23armGrad)' opacity='0.15'/>"
    "<path d='M25 50 C25 35, 45 35, 50 45 C55 35, 75 35, 75 50 Q50 75 25 50 Z' fill='none' stroke='%2310b981' stroke-width='4'/>"
    "<line x1='15' y1='50' x2='85' y2='50' stroke='%2334d399' stroke-width='4' stroke-linecap='round'/>"
    "<circle cx='50' cy='50' r='6' fill='%2334d399'/>"
    "</svg>"
)

SVG_CORE = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'>"
    "<defs><linearGradient id='coreGrad' x1='0%' y1='0%' x2='100%' y2='100%'>"
    "<stop offset='0%' stop-color='%23f59e0b'/><stop offset='100%' stop-color='%23b45309'/></linearGradient></defs>"
    "<circle cx='50' cy='50' r='45' fill='url(%23coreGrad)' opacity='0.15'/>"
    "<path d='M50 25 L75 35 L70 65 L50 80 L30 65 L25 35 Z' fill='none' stroke='%23f59e0b' stroke-width='4' stroke-linejoin='round'/>"
    "<circle cx='50' cy='50' r='8' fill='%23fbbf24'/>"
    "</svg>"
)

EXERCISES_SEED = [
    # Piernas (Legs)
    {
        "nombre": "Sentadilla Trasera (Squat)",
        "descripcion": "Ejercicio central para el desarrollo del tren inferior, enfocándose en cuádriceps, glúteos y core.",
        "url_media": SVG_LEGS
    },
    {
        "nombre": "Peso Muerto Convencional (Deadlift)",
        "descripcion": "Movimiento compuesto bisagra de cadera que recluta la cadena posterior entera (femorales, glúteos, erectores espinales).",
        "url_media": SVG_LEGS
    },
    {
        "nombre": "Prensa de Piernas (Leg Press)",
        "descripcion": "Excelente ejercicio mecánico para aislar cuádriceps y glúteos reduciendo la fatiga espinal del core.",
        "url_media": SVG_LEGS
    },
    {
        "nombre": "Zancadas con Mancuernas (Lunges)",
        "descripcion": "Ejercicio unilateral ideal para corregir desbalances musculares y potenciar la estabilidad de cadera.",
        "url_media": SVG_LEGS
    },
    {
        "nombre": "Elevación de Talones (Calf Raises)",
        "descripcion": "Aislamiento del tríceps sural (gemelos y sóleo) de pie o sentado.",
        "url_media": SVG_LEGS
    },
    
    # Empuje (Push)
    {
        "nombre": "Press de Banca con Barra (Bench Press)",
        "descripcion": "El rey del empuje horizontal. Desarrolla fuerza y masa en pectorales, tríceps y deltoides anterior.",
        "url_media": SVG_CHEST
    },
    {
        "nombre": "Press Militar de Pie (Overhead Press)",
        "descripcion": "Empuje vertical con barra olímpica que exige fuerza en hombros, tríceps y estabilidad de core.",
        "url_media": SVG_CHEST
    },
    {
        "nombre": "Fondos de Pecho en Paralelas (Dips)",
        "descripcion": "Ejercicio de calistenia avanzado enfocado en la sección inferior del pectoral y tríceps.",
        "url_media": SVG_CHEST
    },
    {
        "nombre": "Aperturas con Mancuernas (Chest Flyes)",
        "descripcion": "Aislamiento de pectoral enfocado en la aducción horizontal de hombro.",
        "url_media": SVG_CHEST
    },
    {
        "nombre": "Extensión de Tríceps en Polea Alta",
        "descripcion": "Aislamiento enfocado en la cabeza lateral y medial del músculo tríceps braquial.",
        "url_media": SVG_CHEST
    },
    
    # Tirón (Pull)
    {
        "nombre": "Dominadas Pronas (Pull-ups)",
        "descripcion": "Ejercicio de autocarga vertical estrella para el desarrollo de la amplitud de la espalda (dorsal ancho).",
        "url_media": SVG_BACK
    },
    {
        "nombre": "Remo con Barra (Barbell Row)",
        "descripcion": "Tirón horizontal con barra para trabajar el grosor de la espalda (dorsales, trapecios y romboides).",
        "url_media": SVG_BACK
    },
    {
        "nombre": "Jalón al Pecho en Polea (Lat Pulldown)",
        "descripcion": "Alternativa de tirón vertical ideal para modular cargas y enfocar el estímulo en dorsales.",
        "url_media": SVG_BACK
    },
    {
        "nombre": "Curl de Bíceps con Barra (Bicep Curl)",
        "descripcion": "Clásico movimiento de flexión de codo para desarrollar la cabeza corta y larga del bíceps.",
        "url_media": SVG_ARMS
    },
    {
        "nombre": "Pájaros con Mancuernas (Rear Delt Fly)",
        "descripcion": "Aislamiento para el deltoides posterior y romboides.",
        "url_media": SVG_BACK
    },
    
    # Core
    {
        "nombre": "Plancha Abdominal Estática (Plank)",
        "descripcion": "Ejercicio isométrico fundamental para el fortalecimiento del core profundo y estabilidad lumbar.",
        "url_media": SVG_CORE
    },
    {
        "nombre": "Abdominales Crunches",
        "descripcion": "Flexión de columna básica para el estímulo del recto abdominal.",
        "url_media": SVG_CORE
    }
]

def seed():
    session = SessionLocal()
    try:
        print("[SEED] Comprobando catálogo de ejercicios existente...")
        count = session.query(Ejercicio).filter(Ejercicio.id_entrenador == None).count()
        
        if count > 0:
            print(f"[SEED] El catálogo ya cuenta con {count} ejercicios globales. No se requiere siembra.")
            return

        print(f"[SEED] Sembrando {len(EXERCISES_SEED)} ejercicios del catálogo maestro...")
        for item in EXERCISES_SEED:
            ejercicio = Ejercicio(
                nombre=item["nombre"],
                descripcion=item["descripcion"],
                url_media=item["url_media"],
                id_entrenador=None  # Indicar que es un ejercicio global
            )
            session.add(ejercicio)
            
        session.commit()
        print("[SEED] ¡Siembra de ejercicios completada de forma exitosa!")
    except Exception as e:
        session.rollback()
        print(f"[SEED] ERROR durante la siembra de base de datos: {str(e)}")
    finally:
        session.close()

if __name__ == "__main__":
    seed()
