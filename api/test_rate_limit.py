import requests

url = "http://localhost:8000/api/v1/auth/login"

print("Enviando 6 peticiones al endpoint de login...")
for i in range(1, 7):
    # Form data for oauth2 requires 'username' and 'password'
    response = requests.post(url, data={"username": "test@test.com", "password": "123"})
    print(f"Intento {i}: Status {response.status_code} - {response.text}")
