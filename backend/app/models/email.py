from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class EmailStatus(str, Enum):
    PENDING = "Pending"
    FAILED = "Failed"
    SUCCESS = "Success"


class EmailRecordBase(BaseModel):
    company_name: str
    email: EmailStr
    subject: str
    file_path: Optional[str] = None
    email_send_date: datetime
    email_status: EmailStatus = EmailStatus.PENDING
    reason: Optional[str] = None


class EmailRecordCreate(EmailRecordBase):
    pass


class EmailRecord(EmailRecordBase):
    email_id: int
    date: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True


class EmailTemplateBase(BaseModel):
    template_name: str
    subject_template: str
    body_template: str
    category: Optional[str] = None
    description: Optional[str] = None
    has_attachments: bool = False
    default_attachment_paths: Optional[str] = None
    is_active: bool = True


class EmailTemplateCreate(EmailTemplateBase):
    created_by: Optional[str] = None


class EmailTemplate(EmailTemplateBase):
    template_id: int
    created_date: datetime
    modified_date: datetime
    created_by: Optional[str] = None

    class Config:
        from_attributes = True
