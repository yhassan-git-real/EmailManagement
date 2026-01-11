from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from datetime import datetime
from enum import Enum
import json
import os

from ...services.automation import (
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
    sharingOption: Optional[str] = "anyone"
    specificEmails: Optional[List[str]] = []


class RetrySettings(BaseModel):
    retryOnFailure: bool
    retryInterval: str


class ScheduleFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    WEEKDAY = "weekday"
    MONTHLY = "monthly"
    CUSTOM = "custom"


class ScheduleSettings(BaseModel):
    enabled: bool
    frequency: ScheduleFrequency
    time: str  # Format: HH:MM in 24-hour format
    days: Optional[List[int]] = None  # For weekly: 0-6 (Sun-Sat); For monthly: 1-31
    lastRun: Optional[datetime] = None
    nextRun: Optional[datetime] = None


class EmailLogEntry(BaseModel):
    timestamp: datetime
    email_id: int
    recipient: str
    subject: str
    status: str
    file_name: Optional[str] = None
    error_message: Optional[str] = None


class SMTPValidationRequest(BaseModel):
    smtpServer: str
    port: int 
    username: str
    password: str
    useTLS: bool = True


class AttachmentSettingsModel(BaseModel):
    """Settings for smart attachment behavior"""
    fileCountThreshold: int = 5  # Files <= this: attach directly; > this: compress to ZIP
    allowedExtensions: List[str] = ["all"]  # List of extensions or ["all"] for all files


class EmailSizeSettingsModel(BaseModel):
    """Settings for email attachment size limits"""
    emailMaxSizeMB: int = 25  # Maximum email attachment size in MB
    emailSafeSizeMB: int = 20  # Safe size limit for direct attachment in MB
    gdriveUploadThresholdMB: int = 20  # Size threshold for uploading to Google Drive in MB


class TestMailRequest(BaseModel):
    """Request model for sending a test email"""
    recipientEmail: str
    subject: str
    body: Optional[str] = ""  # Optional custom body
    templateId: str = "default"
    folderPath: Optional[str] = ""  # Optional folder path for attachments
    companyName: Optional[str] = "Test Company"
    saveAsDefault: bool = False  # Whether to save these settings as defaults


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
    This endpoint only processes emails with status 'Pending',
    never affecting failed or successful emails.
    """
    try:
        status = start_automation()
        return {
            "success": True,
            "message": "Email automation started successfully (pending emails only)",
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
    Restart processing of failed emails only.
    This endpoint only affects emails with status 'Failed',
    never affecting pending or successful emails.
    """
    try:
        # We'll use the existing restart_failed_emails but ensure
        # it only processes emails with status 'Failed'
        status = restart_failed_emails()
        return {
            "success": True,
            "message": "Restarting failed emails only",
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
            "template_id": settings_dict.get("templateId"),
            "sharing_option": settings_dict.get("sharingOption"),
            "specific_emails": settings_dict.get("specificEmails")
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


@router.get("/templates")
async def get_templates():
    """
    Get all available email templates.
    """
    from ...services.templates import get_email_templates
    
    try:
        templates = get_email_templates()
        return {
            "success": True,
            "data": templates
        }
    except Exception as e:
        logger.error(f"Error getting email templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get email templates")


@router.get("/templates/{template_id}")
async def get_template(template_id: str):
    """
    Get a specific template by ID.
    """
    from ...services.templates import get_template_by_id
    
    try:
        template = get_template_by_id(template_id)
        if not template:
            raise HTTPException(status_code=404, detail=f"Template {template_id} not found")
            
        return {
            "success": True,
            "data": template
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get template {template_id}")


class TemplateData(BaseModel):
    name: Optional[str] = None
    body: str
    
    
@router.post("/templates/{template_id}")
async def update_template(template_id: str, data: TemplateData):
    """
    Update a specific template by ID.
    """
    from ...services.templates import update_email_template
    
    try:
        template_data = {"body": data.body}
        if data.name:
            template_data["name"] = data.name
            
        success = update_email_template(template_id, template_data)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Template {template_id} not found")
            
        return {
            "success": True,
            "message": f"Template {template_id} updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update template {template_id}")


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
        "EMAIL_ARCHIVE_PATH": os.getenv("EMAIL_ARCHIVE_PATH", "Not set"),
        "DEFAULT_EMAIL_TEMPLATE_PATH": os.getenv("DEFAULT_EMAIL_TEMPLATE_PATH", "Not set")
    }
    
    # Mask password for security
    if env_vars["EMAIL_PASSWORD"] != "Not set":
        env_vars["EMAIL_PASSWORD"] = "*" * len(env_vars["EMAIL_PASSWORD"])
    
    return {
        "success": True,
        "data": env_vars
    }



@router.get("/logs")
async def get_logs(limit: int = 100, filter_status: Optional[str] = None):
    """
    Get the most recent email automation logs.
    
    Args:
        limit: Maximum number of log entries to return
        filter_status: Filter logs by status (success, failed, pending)
        
    Returns:
        List of log entries
    """
    try:
        from ...utils.email_logger import email_logger
        logs = email_logger.get_recent_logs(limit, filter_status)
        
        return {
            "success": True,
            "data": logs
        }
    except Exception as e:
        logger.error(f"Error retrieving logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve logs")


@router.get("/logs/frontend")
async def get_frontend_logs(limit: int = 50, filter_status: Optional[str] = None):
    """
    Get cleaned and deduplicated logs specifically for frontend display.
    
    Args:
        limit: Maximum number of log entries to return
        filter_status: Filter logs by status (success, failed, pending)
        
    Returns:
        List of cleaned log entries optimized for frontend display
    """
    try:
        from ...utils.email_logger import email_logger
        raw_logs = email_logger.get_recent_logs(limit * 3, filter_status)  # Get more to filter
        
        # Clean and format logs for frontend
        cleaned_logs = []
        for log in raw_logs:
            # Clean the message for better frontend display
            cleaned_log = _clean_log_for_frontend(log)
            if cleaned_log:  # Only add non-empty cleaned logs
                cleaned_logs.append(cleaned_log)
                
            # Stop once we have enough logs
            if len(cleaned_logs) >= limit:
                break
        
        return {
            "success": True,
            "data": cleaned_logs
        }
    except Exception as e:
        logger.error(f"Error retrieving frontend logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve frontend logs")


def _clean_log_for_frontend(log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Clean and format a log entry for frontend display"""
    message = log.get("message", "")
    
    # Skip verbose or redundant messages
    skip_patterns = [
        "[Process:",
        "(Elapsed:",
        "Email processing statistics",
        "Processing email ID",
        "Started reprocessing",
        "Using template ID default"
    ]
    
    if any(pattern in message for pattern in skip_patterns):
        return None
    
    # Clean the message
    cleaned_message = message
    
    # Remove process information that clutters the frontend
    if "[Process: Failed Email Retry Process]" in cleaned_message:
        cleaned_message = cleaned_message.replace("[Process: Failed Email Retry Process]", "").strip()
    
    # Remove redundant emoji for cleaner display
    if "🔄 🔄" in cleaned_message:
        cleaned_message = cleaned_message.replace("🔄 🔄", "🔄")
    
    # Clean up spacing
    cleaned_message = " ".join(cleaned_message.split())
    
    # Create cleaned log entry
    cleaned_log = {
        "timestamp": log.get("timestamp"),
        "message": cleaned_message,
        "email_id": log.get("email_id"),
        "recipient": log.get("recipient"),
        "subject": log.get("subject"),
        "status": log.get("status")
    }
    
    # Remove None values
    cleaned_log = {k: v for k, v in cleaned_log.items() if v is not None}
    
    return cleaned_log


@router.post("/logs/clear")
async def clear_logs():
    """
    Clear the email automation logs.
    
    Returns:
        Success message
    """
    try:
        from ...utils.email_logger import email_logger
        email_logger.clear_logs()
        
        return {
            "success": True,
            "message": "Logs cleared successfully"
        }
    except Exception as e:
        logger.error(f"Error clearing logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clear logs")


@router.post("/archive/cleanup")
async def cleanup_archive(days: int = Body(30)):
    """
    Clean up the email archive by removing .zip files older than the specified days.
    
    Args:
        days: Number of days to keep files for (files older than this will be deleted)
        
    Returns:
        Number of files deleted
    """
    try:
        import os
        import time
        from datetime import datetime, timedelta
        from ...services.email import get_archive_path
        from pathlib import Path
        
        archive_path = get_archive_path()
        count = 0
        
        # Calculate the cutoff timestamp (current time - days)
        cutoff_date = datetime.now() - timedelta(days=days)
        cutoff_timestamp = cutoff_date.timestamp()
        
        logger.info(f"Cleaning up archive files older than {days} days (before {cutoff_date.strftime('%Y-%m-%d %H:%M:%S')})")
        
        # Ensure the archive path exists
        if os.path.exists(archive_path):
            for file_path in Path(archive_path).glob('*.zip'):
                try:
                    # Get the file's modification time
                    file_mtime = os.path.getmtime(file_path)
                    
                    # Check if the file is older than the cutoff date
                    if file_mtime < cutoff_timestamp:
                        file_date = datetime.fromtimestamp(file_mtime).strftime('%Y-%m-%d %H:%M:%S')
                        logger.info(f"Deleting old file: {file_path} (modified: {file_date})")
                        os.remove(file_path)
                        count += 1
                    else:
                        file_date = datetime.fromtimestamp(file_mtime).strftime('%Y-%m-%d %H:%M:%S')
                        logger.debug(f"Keeping recent file: {file_path} (modified: {file_date})")
                except Exception as e:
                    logger.error(f"Error processing file {file_path}: {str(e)}")
        
        return {
            "success": True,
            "message": f"Archive cleaned up successfully. {count} files older than {days} days removed.",
            "filesDeleted": count
        }
    except Exception as e:
        logger.error(f"Error cleaning up archive: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clean up archive")


@router.post("/schedule")
async def update_schedule(settings: ScheduleSettings):
    """
    Update the automation schedule settings.
    
    Args:
        settings: New schedule settings
        
    Returns:
        Updated schedule settings
    """
    try:
        from ...services.automation import update_schedule_settings
        updated_settings = update_schedule_settings(settings.dict())
        
        return {
            "success": True,
            "data": updated_settings
        }
    except Exception as e:
        logger.error(f"Error updating schedule settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update schedule settings")


@router.get("/schedule")
async def get_schedule():
    """
    Get the current automation schedule settings.
    
    Returns:
        Current schedule settings
    """
    try:
        from ...services.automation import get_schedule_settings
        settings = get_schedule_settings()
        
        return {
            "success": True,
            "data": settings
        }
    except Exception as e:
        logger.error(f"Error getting schedule settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get schedule settings")


@router.get("/attachment-settings")
async def get_attachment_settings():
    """
    Get the current smart attachment settings.
    
    Returns:
        Current attachment settings including file count threshold and allowed extensions.
    """
    try:
        from ...core.config import get_settings
        settings = get_settings()
        
        # Parse allowed extensions
        ext_setting = settings.ATTACHMENT_ALLOWED_EXTENSIONS
        if ext_setting.lower() == 'all':
            allowed_extensions = ['all']
        else:
            allowed_extensions = [ext.strip().lower() for ext in ext_setting.split(',')]
        
        return {
            "success": True,
            "data": {
                "fileCountThreshold": settings.ATTACHMENT_FILE_COUNT_THRESHOLD,
                "allowedExtensions": allowed_extensions
            }
        }
    except Exception as e:
        logger.error(f"Error getting attachment settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get attachment settings")


@router.post("/attachment-settings")
async def update_attachment_settings(settings: AttachmentSettingsModel):
    """
    Update smart attachment settings.
    
    These settings control whether files are attached directly or compressed to ZIP:
    - If file count <= threshold: attach files directly
    - If file count > threshold: compress to ZIP
    
    Args:
        settings: New attachment settings
        
    Returns:
        Updated settings
    """
    try:
        import os
        from functools import lru_cache
        from ...core import config as config_module
        
        # Update environment variables
        os.environ['ATTACHMENT_FILE_COUNT_THRESHOLD'] = str(settings.fileCountThreshold)
        
        # Convert extensions list to comma-separated string
        if 'all' in [ext.lower() for ext in settings.allowedExtensions]:
            os.environ['ATTACHMENT_ALLOWED_EXTENSIONS'] = 'all'
        else:
            os.environ['ATTACHMENT_ALLOWED_EXTENSIONS'] = ','.join(settings.allowedExtensions)
        
        # Clear the settings cache to reload with new values
        if hasattr(config_module, 'get_settings'):
            config_module.get_settings.cache_clear()
        
        logger.info(f"Updated attachment settings: threshold={settings.fileCountThreshold}, "
                   f"extensions={settings.allowedExtensions}")
        
        return {
            "success": True,
            "message": "Attachment settings updated successfully",
            "data": {
                "fileCountThreshold": settings.fileCountThreshold,
                "allowedExtensions": settings.allowedExtensions
            }
        }
    except Exception as e:
        logger.error(f"Error updating attachment settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update attachment settings")


@router.get("/size-settings")
async def get_size_settings():
    """
    Get the current email size settings.
    
    Returns:
        Current size settings including max size, safe size, and GDrive threshold.
    """
    try:
        from ...core.config import get_settings
        settings = get_settings()
        
        return {
            "success": True,
            "data": {
                "emailMaxSizeMB": settings.EMAIL_MAX_SIZE_MB,
                "emailSafeSizeMB": settings.EMAIL_SAFE_SIZE_MB,
                "gdriveUploadThresholdMB": settings.GDRIVE_UPLOAD_THRESHOLD_MB
            }
        }
    except Exception as e:
        logger.error(f"Error getting size settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get size settings")


@router.post("/size-settings")
async def update_size_settings(settings: EmailSizeSettingsModel):
    """
    Update email size settings.
    
    These settings control attachment size limits:
    - emailMaxSizeMB: Maximum email attachment size
    - emailSafeSizeMB: Safe size limit for direct attachment
    - gdriveUploadThresholdMB: Threshold for uploading to Google Drive
    
    Args:
        settings: New size settings
        
    Returns:
        Updated settings
    """
    try:
        import os
        from ...core import config as config_module
        
        # Validate settings
        if settings.emailSafeSizeMB > settings.emailMaxSizeMB:
            raise HTTPException(status_code=400, detail="Safe size cannot exceed max size")
        if settings.gdriveUploadThresholdMB > settings.emailMaxSizeMB:
            raise HTTPException(status_code=400, detail="GDrive threshold cannot exceed max size")
        
        # Update environment variables
        os.environ['EMAIL_MAX_SIZE_MB'] = str(settings.emailMaxSizeMB)
        os.environ['EMAIL_SAFE_SIZE_MB'] = str(settings.emailSafeSizeMB)
        os.environ['GDRIVE_UPLOAD_THRESHOLD_MB'] = str(settings.gdriveUploadThresholdMB)
        
        # Clear the settings cache to reload with new values
        if hasattr(config_module, 'get_settings'):
            config_module.get_settings.cache_clear()
        
        logger.info(f"Updated size settings: max={settings.emailMaxSizeMB}MB, "
                   f"safe={settings.emailSafeSizeMB}MB, gdrive={settings.gdriveUploadThresholdMB}MB")
        
        return {
            "success": True,
            "message": "Size settings updated successfully",
            "data": {
                "emailMaxSizeMB": settings.emailMaxSizeMB,
                "emailSafeSizeMB": settings.emailSafeSizeMB,
                "gdriveUploadThresholdMB": settings.gdriveUploadThresholdMB
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating size settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update size settings")


# ============================================================================
# Test Mail Endpoints
# ============================================================================

TEST_MAIL_DEFAULTS_PATH = os.path.join(
    os.path.dirname(__file__), 
    '..', '..', 'services', 'email', 'test_mail_defaults.json'
)


def _load_test_mail_defaults() -> dict:
    """Load test mail defaults from JSON file"""
    try:
        if os.path.exists(TEST_MAIL_DEFAULTS_PATH):
            with open(TEST_MAIL_DEFAULTS_PATH, 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Could not load test mail defaults: {str(e)}")
    
    return {
        "recipientEmail": "",
        "subject": "Test Email - {{company_name}}",
        "body": "",
        "templateId": "default",
        "folderPath": "",
        "companyName": "Test Company"
    }


def _save_test_mail_defaults(defaults: dict) -> bool:
    """Save test mail defaults to JSON file"""
    try:
        os.makedirs(os.path.dirname(TEST_MAIL_DEFAULTS_PATH), exist_ok=True)
        with open(TEST_MAIL_DEFAULTS_PATH, 'w') as f:
            json.dump(defaults, f, indent=4)
        return True
    except Exception as e:
        logger.error(f"Could not save test mail defaults: {str(e)}")
        return False


@router.get("/test-mail/defaults")
async def get_test_mail_defaults():
    """
    Get saved default test mail settings.
    
    Returns:
        Default settings for test mail form.
    """
    try:
        defaults = _load_test_mail_defaults()
        return {
            "success": True,
            "data": defaults
        }
    except Exception as e:
        logger.error(f"Error getting test mail defaults: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get test mail defaults")


@router.post("/test-mail/defaults")
async def save_test_mail_defaults(request: TestMailRequest):
    """
    Save default test mail settings.
    
    Args:
        request: Test mail settings to save as defaults
        
    Returns:
        Success status
    """
    try:
        defaults = {
            "recipientEmail": request.recipientEmail,
            "subject": request.subject,
            "body": request.body or "",
            "templateId": request.templateId,
            "folderPath": request.folderPath or "",
            "companyName": request.companyName or "Test Company"
        }
        
        if _save_test_mail_defaults(defaults):
            return {
                "success": True,
                "message": "Test mail defaults saved successfully",
                "data": defaults
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save test mail defaults")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving test mail defaults: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save test mail defaults")


@router.post("/test-mail/send")
async def send_test_mail(request: TestMailRequest):
    """
    Send a test email to validate settings, templates, and attachments.
    
    This endpoint works independently from automation and uses the same
    SMTP settings and template logic.
    
    Args:
        request: Test mail parameters
        
    Returns:
        Success status and message
    """
    try:
        from ...services.email import EmailSender
        from ...services.templates import get_template_by_id
        from ...services.automation.core.settings_manager import _get_smtp_settings
        from datetime import datetime
        
        # Save as default if requested
        if request.saveAsDefault:
            defaults = {
                "recipientEmail": request.recipientEmail,
                "subject": request.subject,
                "body": request.body or "",
                "templateId": request.templateId,
                "folderPath": request.folderPath or "",
                "companyName": request.companyName or "Test Company"
            }
            _save_test_mail_defaults(defaults)
        
        # Get SMTP settings
        smtp_settings = _get_smtp_settings()
        
        if not smtp_settings["smtp_server"] or not smtp_settings["username"] or not smtp_settings["password"]:
            raise HTTPException(status_code=400, detail="SMTP settings are incomplete. Please configure email settings first.")
        
        # Create email sender
        email_sender = EmailSender(
            smtp_server=smtp_settings["smtp_server"],
            port=smtp_settings["port"],
            username=smtp_settings["username"],
            password=smtp_settings["password"],
            use_tls=smtp_settings["use_tls"],
            archive_path=smtp_settings["archive_path"]
        )
        
        sender_email = smtp_settings["sender_email"] or smtp_settings["username"]
        
        # Get email body from template or use custom body
        email_body = request.body or ""
        
        if request.templateId and request.templateId != "none":
            try:
                template = get_template_by_id(request.templateId)
                if template:
                    # Process template placeholders
                    placeholders = {
                        "{{company_name}}": request.companyName or "Test Company",
                        "{{recipient}}": request.recipientEmail,
                        "{{subject}}": request.subject,
                        "{{date}}": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "{{file_path}}": request.folderPath or ""
                    }
                    
                    template_body = template['body_template']
                    for placeholder, value in placeholders.items():
                        template_body = template_body.replace(placeholder, str(value))
                    
                    email_body = template_body
            except Exception as e:
                logger.warning(f"Could not load template {request.templateId}: {str(e)}")
                if not email_body:
                    email_body = f"<p>Test email sent on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>"
        
        if not email_body:
            email_body = f"<p>Test email sent on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>"
        
        # Process subject placeholders
        subject = request.subject
        subject = subject.replace("{{company_name}}", request.companyName or "Test Company")
        subject = subject.replace("{{date}}", datetime.now().strftime("%Y-%m-%d"))
        
        # Send using smart attachment logic
        folder_path = request.folderPath if request.folderPath else None
        
        success, reason = email_sender.send_email_smart(
            recipient=request.recipientEmail,
            subject=subject,
            body=email_body,
            folder_path=folder_path,
            sender=sender_email,
            email_id=None,  # No database record for test emails
            use_smart_attachment=True
        )
        
        if success:
            return {
                "success": True,
                "message": f"Test email sent successfully to {request.recipientEmail}",
                "details": reason
            }
        else:
            return {
                "success": False,
                "message": f"Failed to send test email",
                "details": reason
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test mail: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send test email: {str(e)}")

