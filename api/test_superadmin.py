import urllib.request
import urllib.error
import urllib.parse
import json

base_url = "http://localhost:8000/api/v1"

# 1. Login
data = urllib.parse.urlencode({
    "username": "admin@entrenadorpremium.com",
    "password": "admin123"
}).encode('utf-8')
req_login = urllib.request.Request(f"{base_url}/auth/login", data=data)
try:
    with urllib.request.urlopen(req_login) as res:
        token_data = json.loads(res.read().decode())
        token = token_data["access_token"]
        print("Login SuperAdmin exitoso!")
except Exception as e:
    print("Falló el login:", e)
    exit(1)

# 2. Obtener entrenadores
req_coaches = urllib.request.Request(f"{base_url}/admin/coaches", headers={"Authorization": f"Bearer {token}"})
try:
    with urllib.request.urlopen(req_coaches) as res:
        coaches = json.loads(res.read().decode())
        print(f"Entrenadores obtenidos: {len(coaches)}")
        if coaches:
            first_coach_id = coaches[0]["id_usuario"]
            print(f"Coach de prueba ID: {first_coach_id}")
        else:
            print("No hay entrenadores")
            exit(0)
except Exception as e:
    print("Falló obtener entrenadores:", e)
    exit(1)

# 3. Modificar entrenador (ejemplo: cambiar estado financiero y limite)
update_data = json.dumps({
    "limite_alumnos": 50,
    "estado_financiero": "suspendido"
}).encode('utf-8')

req_update = urllib.request.Request(
    f"{base_url}/admin/coaches/{first_coach_id}",
    data=update_data,
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    method="PUT"
)

try:
    with urllib.request.urlopen(req_update) as res:
        updated_coach = json.loads(res.read().decode())
        print(f"Coach modificado exitosamente: Limite {updated_coach['limite_alumnos']}, Estado: {updated_coach['estado_financiero']}")
except Exception as e:
    print("Falló modificar entrenador:", e)
    
# 4. Revertir a activo para no romper todo
revert_data = json.dumps({
    "limite_alumnos": 10,
    "estado_financiero": "activo"
}).encode('utf-8')

req_revert = urllib.request.Request(
    f"{base_url}/admin/coaches/{first_coach_id}",
    data=revert_data,
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    method="PUT"
)

try:
    with urllib.request.urlopen(req_revert) as res:
        print("Revertido a activo con límite 10")
except:
    pass
