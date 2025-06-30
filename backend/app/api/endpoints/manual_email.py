from fastapi import APIRouter, HTTPException, Body, Query, Depends, UploadFile, File, Form
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, validator, Field
import os
import logging
from datetime import datetime

from ...services.email_sender import EmailSender
from ...services.email_service import create_email_record, update_email_status, get_email_records
from ...services.template_service import get_template_by_id
from ...models.email import EmailStatus
from ...core.config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


class EmailAttachment(BaseModel):
    filename: str
    content_type: str
    size: int


class ManualEmailRequest(BaseModel):
    to: List[EmailStr]
    cc: Optional[List[EmailStr]] = None
    bcc: Optional[List[EmailStr]] = None
    subject: str
    body: str
    template_id: Optional[str] = None
    attachments: Optional[List[EmailAttachment]] = None


class SMTPConfig(BaseModel):
    smtp_server: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    sender_email: str
    use_tls: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "smtp_server": "smtp.gmail.com",
                "smtp_port": 587,
                "smtp_username": "user@gmail.com",
                "smtp_password": "app_password",
                "sender_email": "user@gmail.com",
                "use_tls": True
            }
        }


@router.post("/send")
async def send_manual_email(email_data: ManualEmailRequest):
    """
    Send an email manually with the provided data.
    """
    try:
        settings = get_settings()
        
        # Create email sender with SMTP settings from environment variables
        email_sender = EmailSender(
            smtp_server=settings.SMTP_SERVER,
            port=int(settings.SMTP_PORT),
            username=settings.EMAIL_USERNAME,
            password=settings.EMAIL_PASSWORD,
            use_tls=settings.SMTP_TLS.lower() == "true",
            archive_path=settings.EMAIL_ARCHIVE_PATH
        )
        
        # Process recipient lists
        recipients = email_data.to
        cc_list = email_data.cc or []
        bcc_list = email_data.bcc or []
        
        # Create a record for the email in the database
        current_time = datetime.now()
        record_data = {
            "company_name": "Manual Send",  # Default, could be improved
            "email": recipients[0],  # Primary recipient
            "subject": email_data.subject,
            "email_send_date": current_time,
            "email_status": EmailStatus.PENDING.value,
            "file_path": None  # We don't have a file path for manual emails
        }
        
        email_id = create_email_record(record_data)
        
        # Send the email
        success, reason = email_sender.send_email(
            recipient=", ".join(recipients + cc_list),  # TO + CC in recipient field
            subject=email_data.subject,
            body=email_data.body,
            sender=settings.SENDER_EMAIL or settings.EMAIL_USERNAME,
            email_id=email_id
        )
        
        # Update the record with the result
        if success:
            update_email_status(email_id, EmailStatus.SUCCESS.value)
        else:
            update_email_status(email_id, EmailStatus.FAILED.value, reason)
            
        return {
            "success": success,
            "message": "Email sent successfully" if success else f"Failed to send email: {reason}",
            "email_id": email_id
        }
    
    except Exception as e:
        logger.error(f"Error sending manual email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


@router.post("/smtp-config")
async def update_smtp_config(config: SMTPConfig):
    """
    Update SMTP configuration settings.
    This will update the environment variables or .env file.
    """
    try:
        # Path to .env file
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env")
        
        # Read existing .env file content
        env_content = ""
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                env_content = f.read()
        
        # Parse existing .env content into a dictionary
        env_vars = {}
        for line in env_content.split("\n"):
            if line.strip() and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                env_vars[key.strip()] = value.strip()
        
        # Update with new SMTP config
        env_vars["SMTP_SERVER"] = config.smtp_server
        env_vars["SMTP_PORT"] = str(config.smtp_port)
        env_vars["EMAIL_USERNAME"] = config.smtp_username
        env_vars["EMAIL_PASSWORD"] = config.smtp_password
        env_vars["SENDER_EMAIL"] = config.sender_email
        env_vars["SMTP_TLS"] = str(config.use_tls)
        
        # Write back to .env file
        with open(env_path, "w") as f:
            for key, value in env_vars.items():
                # Ensure values with spaces are quoted
                if " " in value and not (value.startswith('"') and value.endswith('"')):
                    value = f'"{value}"'
                f.write(f"{key}={value}\n")
        
        # Return success
        return {"success": True, "message": "SMTP configuration updated successfully"}
    
    except Exception as e:
        logger.error(f"Error updating SMTP config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update SMTP configuration: {str(e)}")


@router.get("/smtp-config")
async def get_smtp_config():
    """
    Get current SMTP configuration settings.
    """
    try:
        settings = get_settings()
        
        return {
            "smtp_server": settings.SMTP_SERVER,
            "smtp_port": settings.SMTP_PORT,
            "smtp_username": settings.EMAIL_USERNAME,
            "sender_email": settings.SENDER_EMAIL or settings.EMAIL_USERNAME,
            "use_tls": settings.SMTP_TLS.lower() == "true"
        }
    
    except Exception as e:
        logger.error(f"Error retrieving SMTP config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve SMTP configuration: {str(e)}")
