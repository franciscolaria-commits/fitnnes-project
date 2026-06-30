import os
from dotenv import load_dotenv

# Set correct env path
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

from app.services.r2 import upload_file_to_r2

video_path = r"C:\Users\franc\fitness-platform\VideoPresentacion.mp4"

def main():
    if not os.path.exists(video_path):
        print(f"Error: No se encontró el archivo en {video_path}")
        return
        
    print(f"Subiendo {video_path} a Cloudflare R2...")
    with open(video_path, "rb") as f:
        content = f.read()
        
    # Usamos la función ya creada
    url = upload_file_to_r2(content, "landing/VideoPresentacion.mp4", "video/mp4")
    
    if url:
        print(f"¡Éxito! El video se ha subido correctamente.")
        print(f"URL pública: {url}")
    else:
        print("Error al subir el video.")

if __name__ == "__main__":
    main()
