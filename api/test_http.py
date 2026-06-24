import sys
import os

# Add api to path so we can import
sys.path.append(os.path.abspath('c:\\Users\\franc\\fitness-platform\\api'))

from app.utils.auth import crear_token_acceso
import urllib.request
import json
from datetime import timedelta

token = crear_token_acceso({"sub": "franciscolaria324@gmail.com", "rol": "alumno"}, expires_delta=timedelta(days=1))

req = urllib.request.Request("http://localhost:8000/api/v1/students/profile", headers={"Authorization": f"Bearer {token}"})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(response.status)
        print(json.dumps(data, indent=2))
except Exception as e:
    print(e)
