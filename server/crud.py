from sqlalchemy.orm import Session
from models import ReceiptFile, Receipt
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

def save_extracted_data(db: Session, data: dict, file_path: str):
    print(data)
    if not data.get("merchant_name") or data.get("total_amount") is None:
        raise ValueError("Missing required fields: merchant_name, purchased_at, or total_amount")

    # Check if a record for the same file_path already exists
    existing = db.query(Receipt).filter(Receipt.file_path == file_path).first()

    if existing:
        # Update existing record
        existing.merchant_name = data["merchant_name"]
        existing.purchased_at = data["purchased_at"]
        existing.total_amount = data["total_amount"]
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Insert new record
        r = Receipt(**data, file_path=file_path)
        db.add(r)
        db.commit()
        db.refresh(r)
        return r
