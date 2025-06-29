from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel

from ...services.automation_service import (
    start_automation,
    stop_automation,
    restart_failed_emails,
    get_automation_status,
    get_automation_settings,
    update_automation_settings
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class AutomationSettings(BaseModel):
    senderEmail: Optional[str] = None
    smtpServer: Optional[str] = None
    port: Optional[str] = None
    authType: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    useTLS: Optional[bool] = None
    retryOnFailure: Optional[bool] = None
    retryInterval: Optional[str] = None
    templateId: Optional[str] = None


class RetrySettings(BaseModel):
    retryOnFailure: bool
    retryInterval: str


class SMTPValidationRequest(BaseModel):
    smtpServer: str
    port: int 
    username: str
    password: str
    useTLS: bool = True


@router.get("/status")
async def get_status():
    """
    Get the current status of email automation.
    """
    try:
        status = get_automation_status()
        return {
            "success": True,
            "data": status
        }
    except Exception as e:
        # Only log at debug level to prevent log flooding
        logger.debug(f"Error getting automation status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get automation status")


@router.post("/start")
async def start():
    """
    Start the email automation process.
    """
    try:
        status = start_automation()
        return {
            "success": True,
            "message": "Email automation started successfully",
            "data": status
        }
    except Exception as e:
        logger.error(f"Error starting automation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start automation")


@router.post("/stop")
async def stop():
    """
    Stop the email automation process.
    """
    try:
        status = stop_automation()
        return {
            "success": True,
            "message": "Email automation stopped successfully",
            "data": status
        }
    except Exception as e:
        logger.error(f"Error stopping automation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to stop automation")


@router.post("/restart-failed")
async def restart_failed():
    """
    Restart processing of failed emails.
    """
    try:
        status = restart_failed_emails()
        return {
            "success": True,
            "message": "Restarting failed emails",
            "data": status
        }
    except Exception as e:
        logger.error(f"Error restarting failed emails: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to restart failed emails")


@router.get("/settings")
async def read_settings():
    """
    Get the current automation settings.
    """
    try:
        settings = get_automation_settings()
        # Don't return the actual password
        if "password" in settings:
            settings["password"] = "********" if settings["password"] else ""
            
        return {
            "success": True,
            "data": settings
        }
    except Exception as e:
        logger.error(f"Error getting automation settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get automation settings")


@router.post("/settings")
async def update_settings(settings: AutomationSettings):
    """
    Update automation settings.
    """
    try:
        # Convert to dict and filter out None values
        settings_dict = {k: v for k, v in settings.model_dump().items() if v is not None}
        
        # Special handling for environment variables
        import os
        
        # Update environment variables for email settings
        env_mapping = {
            "smtpServer": "SMTP_SERVER",
            "port": "SMTP_PORT",
            "username": "EMAIL_USERNAME",
            "password": "EMAIL_PASSWORD",
            "useTLS": "SMTP_TLS",
            "senderEmail": "SENDER_EMAIL"
        }
        
        for setting_key, env_key in env_mapping.items():
            if setting_key in settings_dict:
                value = settings_dict[setting_key]
                
                # Convert boolean to string for environment variables
                if isinstance(value, bool):
                    value = str(value)
                    
                # Set environment variable
                os.environ[env_key] = value
        
        # Update other settings in the service
        automation_settings = {
            "retry_on_failure": settings_dict.get("retryOnFailure"),
            "retry_interval": settings_dict.get("retryInterval"),
            "template_id": settings_dict.get("templateId")
        }
        
        # Filter out None values
        automation_settings = {k: v for k, v in automation_settings.items() if v is not None}
        
        # Update settings in the service
        if automation_settings:
            updated_settings = update_automation_settings(automation_settings)
        else:
            updated_settings = get_automation_settings()
            
        # Don't return the actual password
        if "password" in updated_settings:
            updated_settings["password"] = "********" if updated_settings["password"] else ""
            
        return {
            "success": True,
            "message": "Automation settings updated successfully",
            "data": updated_settings
        }
    except Exception as e:
        logger.error(f"Error updating automation settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update automation settings")


@router.post("/retry-settings")
async def update_retry(settings: RetrySettings):
    """
    Update retry settings.
    """
    try:
        updated_settings = update_automation_settings({
            "retry_on_failure": settings.retryOnFailure,
            "retry_interval": settings.retryInterval
        })
        
        return {
            "success": True,
            "message": "Retry settings updated successfully",
            "data": updated_settings
        }
    except Exception as e:
        logger.error(f"Error updating retry settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update retry settings")


@router.post("/template/{template_id}")
async def update_template(template_id: str):
    """
    Update the template used for automation.
    """
    try:
        updated_settings = update_automation_settings({
            "template_id": template_id
        })
        
        return {
            "success": True,
            "message": "Automation template updated successfully",
            "data": updated_settings
        }
    except Exception as e:
        logger.error(f"Error updating automation template: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update automation template")


@router.post("/validate-smtp")
async def validate_smtp(settings: SMTPValidationRequest):
    """
    Validate SMTP credentials by attempting to connect and authenticate
    """
    from ...utils.smtp_validator import validate_smtp_credentials
    
    try:
        success, message = validate_smtp_credentials(
            server=settings.smtpServer,
            port=settings.port,
            username=settings.username,
            password=settings.password,
            use_tls=settings.useTLS
        )
        
        return {
            "success": success,
            "message": message
        }
    except Exception as e:
        logger.error(f"SMTP validation error: {str(e)}")
        return {
            "success": False,
            "message": f"Validation error: {str(e)}"
        }


@router.get("/debug-env")
async def debug_env():
    """Debug endpoint to check environment variables"""
    import os
    env_vars = {
        "SMTP_SERVER": os.getenv("SMTP_SERVER", "Not set"),
        "SMTP_PORT": os.getenv("SMTP_PORT", "Not set"),
        "EMAIL_USERNAME": os.getenv("EMAIL_USERNAME", "Not set"),
        "EMAIL_PASSWORD": os.getenv("EMAIL_PASSWORD", "Not set"),
        "SMTP_TLS": os.getenv("SMTP_TLS", "Not set"),
        "SENDER_EMAIL": os.getenv("SENDER_EMAIL", "Not set"),
        "EMAIL_ARCHIVE_PATH": os.getenv("EMAIL_ARCHIVE_PATH", "Not set")
    }
    
    # Mask password for security
    if env_vars["EMAIL_PASSWORD"] != "Not set":
        env_vars["EMAIL_PASSWORD"] = "*" * len(env_vars["EMAIL_PASSWORD"])
    
    return {
        "success": True,
        "data": env_vars
    }
