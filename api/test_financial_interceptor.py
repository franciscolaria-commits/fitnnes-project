from app.database import SessionLocal
from app.models import Entrenador, Usuario
from app.utils.auth import crear_token_acceso
import urllib.request
import urllib.error
import json

db = SessionLocal()

print("Buscando el primer entrenador de prueba...")
entrenador = db.query(Entrenador).first()
if not entrenador:
    print("No hay entrenadores para probar.")
else:
    usuario = db.query(Usuario).filter(Usuario.id_usuario == entrenador.id_usuario).first()
    email = usuario.email
    
    print(f"Probando con {email}...")
    
    token = crear_token_acceso(data={"sub": email, "rol": "entrenador"})
    
    url = "http://localhost:8000/api/v1/coaches/profile"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    
    # 1. Asegurarse que es "activo"
    entrenador.estado_financiero = "activo"
    db.commit()
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[Activo] Petición GET /coaches/me - Status: {response.getcode()}")
    except urllib.error.HTTPError as e:
        print(f"[Activo] Falló: {e.code}")

    # 2. Suspender entrenador
    entrenador.estado_financiero = "suspendido"
    db.commit()
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[Suspendido] Status: {response.getcode()}")
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        print(f"[Suspendido] Petición GET /coaches/me - Status: {e.code} - Respuesta: {res_body}")
    
    # 3. Revertir
    entrenador.estado_financiero = "activo"
    db.commit()
    print("Estado revertido a 'activo'.")

db.close()
