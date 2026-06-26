from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
res = db.execute(text("SELECT * FROM mv_student_progress_chart")).fetchall()
for r in res:
    print(r)
