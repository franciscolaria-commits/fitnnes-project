from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import Usuario

db = SessionLocal()
alumno = db.query(Usuario).filter(Usuario.rol == 'alumno').first()
print("Alumno email:", alumno.email)

client = TestClient(app)
response = client.post("/api/v1/auth/login", data={"username": alumno.email, "password": "password123"})
token = response.json().get("access_token")

res = client.get("/api/v1/students/me/routine", headers={"Authorization": f"Bearer {token}"})
data = res.json()

for dia in data.get('dias', []):
    for ex in dia.get('ejercicios', []):
        if ex.get('ejercicio', {}).get('nombre') == "Sentadilla Trasera (Squat)":
            print("HTTP RESPONSE URL:", ex.get('ejercicio').get('url_media'))
