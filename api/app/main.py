from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.routers.storage import router as storage_router
from app.routers.auth import router as auth_router
from app.routers.coaches import router as coaches_router
from app.routers.students import router as students_router
from app.routers.student_me import router as student_me_router
from app.routers.exercises import router as exercises_router
from app.routers.routines import router as routines_router
from app.routers.sessions import router as sessions_router
from app.routers.superadmin import router as superadmin_router
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.utils.rate_limit import limiter

app = FastAPI(title="Fitness Platform API")

# Rate Limiting Global Setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Configurar middleware CORS para comunicación cruzada (Frontend PWA a Backend API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth_router)
app.include_router(coaches_router)
app.include_router(students_router)
app.include_router(student_me_router)
app.include_router(exercises_router)
app.include_router(routines_router)
app.include_router(sessions_router)
app.include_router(storage_router)
app.include_router(superadmin_router)



@app.get("/ping")
def ping(db: Session = Depends(get_db)):
    try:
        # Ejecuta un query básico para validar que PostgreSQL responde
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}