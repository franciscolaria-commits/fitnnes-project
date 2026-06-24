import urllib.request
import urllib.parse
import json
from app.database import SessionLocal
from app.models import Usuario

db = SessionLocal()
alumno = db.query(Usuario).filter(Usuario.rol == 'alumno').first()
email = alumno.email

data = urllib.parse.urlencode({'username': email, 'password': 'password123'}).encode()
req = urllib.request.Request("http://localhost:8000/api/v1/auth/login", data=data)
res = urllib.request.urlopen(req)
token = json.loads(res.read()).get("access_token")

req2 = urllib.request.Request("http://localhost:8000/api/v1/students/profile", headers={"Authorization": f"Bearer {token}"})
res2 = urllib.request.urlopen(req2)
print("HTTP Status:", res2.status)
print("HTTP Response:", json.loads(res2.read()))
