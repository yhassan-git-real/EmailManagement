"""
Email Record Model - Data models for email records

This module defines the Pydantic models used for email records management.
The application no longer supports creating email records through the API.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class EmailRecordBase(BaseModel):
    """Base model for email records"""
    company_name: Optional[str] = None
    email: str
    subject: str
    file_path: Optional[str] = None
    email_status: str = "Pending"
    reason: Optional[str] = None
    email_send_date: Optional[datetime] = None

class EmailRecord(EmailRecordBase):
    """Complete email record model"""
    id: int
    email_send_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class EmailRecordUpdate(BaseModel):
    """Model for updating an email record"""
    company_name: Optional[str] = None
    email: Optional[str] = None
    subject: Optional[str] = None
    file_path: Optional[str] = None
    email_status: Optional[str] = None
    reason: Optional[str] = None
    email_send_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class EmailRecordStatusUpdate(BaseModel):
    """Model for updating just the status of an email record"""
    status: str = Field(..., description="Email status: Pending, Success, or Failed")
    
    class Config:
        from_attributes = True
