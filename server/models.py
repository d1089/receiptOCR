from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from datetime import datetime
from database import Base

class ReceiptFile(Base):
    __tablename__ = "receipt_file"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String)
    file_path = Column(String)
    is_valid = Column(Boolean, default=False)
    invalid_reason = Column(String)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Receipt(Base):
    __tablename__ = "receipt"
    id = Column(Integer, primary_key=True, index=True)
    purchased_at = Column(String)
    merchant_name = Column(String)
    total_amount = Column(Float)
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
