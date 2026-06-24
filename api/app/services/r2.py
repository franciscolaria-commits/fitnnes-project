import os
import boto3
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv()

R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN")

# Determinar si debemos usar un cliente simulado (Mock) por falta de credenciales
USE_MOCK_R2 = False
s3_client = None

# Validar credenciales
if (
    not R2_ACCESS_KEY_ID 
    or "your_access_key_id" in R2_ACCESS_KEY_ID 
    or not R2_ENDPOINT_URL 
    or "<your-account-id>" in R2_ENDPOINT_URL
):
    print("[WARNING] [R2 Storage] Credenciales no configuradas o contienen valores de plantilla. Corriendo en modo MOCK/Simulado.")
    USE_MOCK_R2 = True
else:
    try:
        s3_client = boto3.client(
            "s3",
            endpoint_url=R2_ENDPOINT_URL,
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto"
        )
    except Exception as e:
        print(f"[WARNING] [R2 Storage] Fallo la inicializacion del cliente R2: {str(e)}. Forzando modo MOCK/Simulado.")
        USE_MOCK_R2 = True

def generar_url_presubida(object_name: str, content_type: str, expiration: int = 3600) -> dict:
    """
    Genera una presigned URL para realizar una subida HTTP PUT directamente desde el frontend.
    Si estamos en modo MOCK, genera un endpoint de simulación local.
    """
    if USE_MOCK_R2:
        # Generar endpoint local simulado
        local_mock_url = f"http://localhost:8000/api/v1/storage/mock-upload?key={object_name}"
        # Retornamos una foto de entrenamiento estética de Unsplash como placeholder
        placeholder_url = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80"
        return {
            "upload_url": local_mock_url,
            "public_url": placeholder_url,
            "key": object_name
        }

    try:
        url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": R2_BUCKET_NAME,
                "Key": object_name,
                "ContentType": content_type
            },
            ExpiresIn=expiration,
            HttpMethod="PUT"
        )
        
        base_public_url = R2_PUBLIC_DOMAIN or ""
        public_url = f"{base_public_url.rstrip('/')}/{object_name}"
        
        return {
            "upload_url": url,
            "public_url": public_url,
            "key": object_name
        }
    except Exception as e:
        raise RuntimeError(f"Error generando URL pre-firmada en Cloudflare R2: {str(e)}")

def upload_file_to_r2(file_content: bytes, object_name: str, content_type: str) -> str:
    """
    Sube un archivo directamente a R2 desde el backend.
    """
    if USE_MOCK_R2:
        return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80"
        
    try:
        s3_client.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=object_name,
            Body=file_content,
            ContentType=content_type
        )
        base_public_url = R2_PUBLIC_DOMAIN or ""
        return f"{base_public_url.rstrip('/')}/{object_name}"
    except Exception as e:
        print(f"[ERROR] Subiendo a R2: {str(e)}")
        return None
