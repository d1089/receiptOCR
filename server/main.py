from fastapi import FastAPI, UploadFile, File, HTTPException
from database import Base, engine, SessionLocal
from models import *
from crud import *
from utils import is_valid_pdf
from ocr import extract_text_from_pdf, extract_fields_from_text
from pathlib import Path
import shutil
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    db = SessionLocal()
    obj = create_receipt_file(db, file.filename, str(file_path))
    db.close()
    return {"file_id": obj.id}

@app.post("/validate")
def validate(file_id: int):
    db = SessionLocal()
    obj = db.query(ReceiptFile).filter(ReceiptFile.id == file_id).first()
    if not obj:
        raise HTTPException(404, "Not found")

    valid, reason = is_valid_pdf(obj.file_path)
    update_validation(db, file_id, valid, reason)
    db.close()
    return {"is_valid": valid, "reason": reason}