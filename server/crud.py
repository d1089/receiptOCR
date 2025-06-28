from sqlalchemy.orm import Session
from models import ReceiptFile
from datetime import datetime

def create_receipt_file(db: Session, file_name, file_path):
    obj = ReceiptFile(file_name=file_name, file_path=file_path)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_validation(db: Session, file_id, is_valid, reason=None):
    obj = db.query(ReceiptFile).filter(ReceiptFile.id == file_id).first()
    obj.is_valid = is_valid
    obj.invalid_reason = reason
    obj.updated_at = datetime.utcnow()
    db.commit()

def mark_processed(db: Session, file_id):
    obj = db.query(ReceiptFile).filter(ReceiptFile.id == file_id).first()
    obj.is_processed = True
    obj.updated_at = datetime.utcnow()
    db.commit()