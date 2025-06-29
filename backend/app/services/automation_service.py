import os
import logging
import threading
import time
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import queue

from ..core.config import get_settings
from ..utils.db_utils import get_db_connection
from ..models.email import EmailStatus
from .email_sender import EmailSender, update_email_status
from .template_service import get_template_by_id
from ..utils.email_logger import email_logger

logger = logging.getLogger(__name__)

# Gmail's attachment size limit in bytes (25MB)
GMAIL_MAX_SIZE = 25 * 1024 * 1024  # 25MB
SAFE_MAX_SIZE = 20 * 1024 * 1024   # 20MB (conservative limit to account for email headers)

# Global state for the automation
_automation_state = {
    "is_running": False,
    "start_time": None,
    "stop_requested": False,
    "automation_thread": None,
    "status": "idle",
    "last_run": None,
    "summary": {
        "processed": 0,
        "successful": 0,
        "failed": 0,
        "pending": 0
    },
    "settings": {
        "retry_on_failure": True,
        "retry_interval": "15min",
        "template_id": "default"
    },
    # Queue for processing emails - will be initialized when needed
    "email_queue": None
}

def _interval_to_seconds(interval: str) -> int:
    """Convert interval string to seconds"""
    if not interval:
        return 900  # Default 15 minutes
        
    value = int(''.join(filter(str.isdigit, interval)))
    unit = ''.join(filter(str.isalpha, interval.lower()))
    
    if unit.startswith('s'):
        return value
    elif unit.startswith('m'):
        return value * 60
    elif unit.startswith('h'):
        return value * 60 * 60
    else:
        return 900  # Default 15 minutes


def _get_smtp_settings() -> Dict[str, Any]:
    """
    Get SMTP settings from environment variables
    
    Returns:
        Dictionary with SMTP settings
    """
    # Use environment variables for email settings
    settings = {
        "smtp_server": os.getenv("SMTP_SERVER", ""),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "username": os.getenv("EMAIL_USERNAME", ""),
        "password": os.getenv("EMAIL_PASSWORD", ""),
        "use_tls": os.getenv("SMTP_TLS", "True").lower() == "true",
        "sender_email": os.getenv("SENDER_EMAIL", ""),
        "archive_path": os.getenv("EMAIL_ARCHIVE_PATH", os.path.join(os.getcwd(), "Email_Archive"))
    }
    
    # Print diagnostic info
    logger.info(f"SMTP Settings: Server={settings['smtp_server']}, Username={settings['username']}, "
                f"Password={'*' * (len(settings['password']) if settings['password'] else 0)}, "
                f"Port={settings['port']}, TLS={settings['use_tls']}")
    
    return settings


def _process_email_queue():
    """
    Process the email queue in a separate thread
    """
    global _automation_state
    
    _automation_state["status"] = "running"
    _automation_state["start_time"] = datetime.now()
    
    # Reset summary
    _automation_state["summary"] = {
        "processed": 0,
        "successful": 0,
        "failed": 0,
        "pending": 0
    }
    
    # Get template
    template = None
    template_id = _automation_state["settings"]["template_id"]
    if template_id and template_id != "default":
        try:
            template = get_template_by_id(int(template_id))
        except:
            logger.warning(f"Could not find template with ID {template_id}, using default body text")
            
    # Get SMTP settings
    smtp_settings = _get_smtp_settings()
    
    # Check if we have valid SMTP settings
    if not smtp_settings["smtp_server"] or not smtp_settings["username"] or not smtp_settings["password"]:
        logger.error("SMTP settings are incomplete. Email automation cannot start.")
        _automation_state["status"] = "error"
        _automation_state["last_run"] = datetime.now()
        return

    try:
        # Create email sender
        email_sender = EmailSender(
            smtp_server=smtp_settings["smtp_server"],
            port=smtp_settings["port"],
            username=smtp_settings["username"],
            password=smtp_settings["password"],
            use_tls=smtp_settings["use_tls"],
            archive_path=smtp_settings["archive_path"]
        )
        
        # Create the default sender email (from username if not specified)
        sender_email = smtp_settings["sender_email"] or smtp_settings["username"]
        
        # Process emails while queue is not empty and not stopped
        while not _automation_state["stop_requested"] and not _automation_state["email_queue"].empty():
            try:
                # Get next email from queue with a timeout
                email_record = _automation_state["email_queue"].get(timeout=1)
                
                logger.info(f"Processing email ID {email_record['Email_ID']} to {email_record['Email']}")
                
                # Update processed count
                _automation_state["summary"]["processed"] += 1
                
                # Generate email body from template if available
                email_body = _load_default_template()  # Start with default template from file
                
                if template:
                    try:
                        # Enhanced template processing with more placeholders
                        placeholders = {
                            "{{company_name}}": email_record.get("Company_Name", ""),
                            "{{recipient}}": email_record.get("Email", ""),
                            "{{subject}}": email_record.get("Subject", ""),
                            "{{date}}": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "{{file_path}}": email_record.get("File_Path", "")
                        }
                        
                        template_body = template['body_template']
                        for placeholder, value in placeholders.items():
                            template_body = template_body.replace(placeholder, str(value))
                        
                        # Only override default template if the SQL template is valid
                        if template_body and len(template_body.strip()) > 0:
                            email_body = template_body
                            email_logger.log_info(f"Using template ID {template_id} for email ID {email_record['Email_ID']}")
                        else:
                            email_logger.log_info(f"Template ID {template_id} body was empty, using default file template")
                    except Exception as e:
                        error_msg = f"Error processing template: {str(e)}, using default file template"
                        logger.error(error_msg)
                        email_logger.log_error(error_msg)
                else:
                    email_logger.log_info(f"Using default file template for email ID {email_record['Email_ID']}")
                
                # Send email
                success, reason = email_sender.send_email(
                    recipient=email_record["Email"],
                    subject=email_record["Subject"],
                    body=email_body,
                    folder_path=email_record["File_Path"],
                    sender=sender_email,
                    email_id=email_record["Email_ID"]
                )
                
                # Update status based on result
                new_status = EmailStatus.SUCCESS if success else EmailStatus.FAILED
                current_time = datetime.now()
                
                # Update the database with current timestamp
                if success:
                    # For success, update both Email_Send_Date and Date columns
                    from .email_sender import update_email_status as update_status
                    update_status(
                        email_id=email_record["Email_ID"],
                        status=new_status.value,
                        reason="Email sent successfully",
                        send_date=current_time,
                        date=current_time
                    )
                    _automation_state["summary"]["successful"] += 1
                else:
                    from .email_sender import update_email_status as update_status
                    update_status(
                        email_id=email_record["Email_ID"],
                        status=new_status.value,
                        reason=reason or "Failed to send email",
                        send_date=current_time,
                        date=current_time
                    )
                    _automation_state["summary"]["failed"] += 1
                
                # Log the transaction
                email_logger.log_info(
                    f"Email processing result - ID: {email_record['Email_ID']}, "
                    f"To: {email_record['Email']}, Subject: {email_record['Subject']}, "
                    f"Status: {new_status.value}, Reason: {reason or 'Success'}"
                )
                
                # Mark task as done in queue
                _automation_state["email_queue"].task_done()
                
            except queue.Empty:
                # Queue is empty, continue to next loop iteration
                continue
            except Exception as e:
                logger.error(f"Error processing email: {str(e)}")
                # Continue with next email
                continue
                
        # Update status when done
        _automation_state["status"] = "idle"
        _automation_state["last_run"] = datetime.now()
        _automation_state["is_running"] = False
        _automation_state["stop_requested"] = False
        
    except Exception as e:
        logger.error(f"Error in email automation process: {str(e)}")
        _automation_state["status"] = "error"
        _automation_state["last_run"] = datetime.now()
        _automation_state["is_running"] = False
        _automation_state["stop_requested"] = False
    
    # Update pending count after finishing
    _update_summary()


def _update_summary():
    """Update the summary counts from the database"""
    try:
        from .email_service import get_email_status_summary
        summary = get_email_status_summary()
        
        _automation_state["summary"]["pending"] = summary["pending"]
        
        # Only update other counts if we're not running (to avoid overwriting our real-time counts)
        if _automation_state["status"] != "running":
            _automation_state["summary"]["successful"] = summary["success"]
            _automation_state["summary"]["failed"] = summary["failed"]
            
    except Exception as e:
        # Just log at debug level since this is called frequently by polling
        # and doesn't affect core functionality
        logger.debug(f"Error updating summary counts: {str(e)}")


def start_automation() -> Dict[str, Any]:
    """
    Start the email automation process
    
    Returns:
        Current automation state
    """
    global _automation_state
    
    # Don't start if already running
    if _automation_state["is_running"]:
        logger.info("Email automation is already running")
        return get_automation_status()
    
    # Reset the stop flag
    _automation_state["stop_requested"] = False
    
    try:
        # Get pending emails
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        query = f"""
            SELECT Email_ID, Company_Name, Email, Subject, File_Path, 
                   Email_Send_Date, Email_Status, Date, Reason 
            FROM {settings.EMAIL_TABLE}
            WHERE Email_Status = ?
            ORDER BY Email_Send_Date
        """
        
        cursor.execute(query, [EmailStatus.PENDING.value])
        
        columns = [column[0] for column in cursor.description]
        emails_to_process = []
        
        for row in cursor.fetchall():
            emails_to_process.append(dict(zip(columns, row)))
        
        # Update pending count
        _automation_state["summary"]["pending"] = len(emails_to_process)
        
        # If no pending emails, no need to start
        if not emails_to_process:
            logger.info("No pending emails to process")
            return get_automation_status()
        
        # Create a queue and add all emails
        _automation_state["email_queue"] = queue.Queue()
        
        for email in emails_to_process:
            _automation_state["email_queue"].put(email)
        
        # Start processing thread
        _automation_state["is_running"] = True
        _automation_state["automation_thread"] = threading.Thread(
            target=_process_email_queue,
            daemon=True
        )
        _automation_state["automation_thread"].start()
        
        logger.info(f"Started email automation with {len(emails_to_process)} emails to process")
        return get_automation_status()
        
    except Exception as e:
        logger.error(f"Error starting email automation: {str(e)}")
        _automation_state["status"] = "error"
        _automation_state["is_running"] = False
        return get_automation_status()
    finally:
        if 'conn' in locals():
            conn.close()


def stop_automation() -> Dict[str, Any]:
    """
    Stop the email automation process
    
    Returns:
        Current automation state
    """
    global _automation_state
    
    if not _automation_state["is_running"]:
        logger.info("Email automation is not running")
        return get_automation_status()
    
    # Set flag to request stop
    _automation_state["stop_requested"] = True
    _automation_state["status"] = "stopping"
    
    logger.info("Stopping email automation...")
    return get_automation_status()


def restart_failed_emails() -> Dict[str, Any]:
    """
    Restart processing of failed emails
    
    Returns:
        Current automation status
    """
    global _automation_state
    
    # Don't restart if already running
    if _automation_state["is_running"]:
        logger.info("Cannot restart failed emails while automation is running")
        return get_automation_status()
    
    try:
        # Get failed emails
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        # First, update status back to pending
        update_query = f"""
            UPDATE {settings.EMAIL_TABLE}
            SET Email_Status = ?
            WHERE Email_Status = ?
        """
        
        cursor.execute(update_query, [EmailStatus.PENDING.value, EmailStatus.FAILED.value])
        conn.commit()
        
        num_updated = cursor.rowcount
        
        if num_updated > 0:
            logger.info(f"Set {num_updated} failed emails back to pending status")
            
            # Update summary counts
            _update_summary()
            
            # Start automation
            return start_automation()
        else:
            logger.info("No failed emails to restart")
            return get_automation_status()
            
    except Exception as e:
        logger.error(f"Error restarting failed emails: {str(e)}")
        return get_automation_status()
    finally:
        if 'conn' in locals():
            conn.close()


def get_automation_status() -> Dict[str, Any]:
    """
    Get the current status of email automation
    
    Returns:
        Dictionary with status information
    """
    # Update summary if not running
    if not _automation_state["is_running"]:
        _update_summary()
    
    return {
        "status": _automation_state["status"],
        "lastRun": _automation_state["last_run"].isoformat() if _automation_state["last_run"] else None,
        "summary": _automation_state["summary"]
    }


def update_automation_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update automation settings
    
    Args:
        settings: Dictionary with settings to update
    
    Returns:
        Dictionary with updated settings
    """
    global _automation_state
    
    for key, value in settings.items():
        if key in _automation_state["settings"]:
            _automation_state["settings"][key] = value
    
    return _automation_state["settings"]


def get_automation_settings() -> Dict[str, Any]:
    """
    Get current automation settings
    
    Returns:
        Dictionary with current settings
    """
    return {
        **_automation_state["settings"],
        **_get_smtp_settings()
    }


def update_email_status(email_id: int, status: str, reason: Optional[str] = None) -> bool:
    """
    Update the status of an email record
    
    Args:
        email_id: ID of the email record
        status: New status value
        reason: Optional reason for the status update (e.g., error message)
    
    Returns:
        bool: True if update was successful
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        update_query = f"""
            UPDATE {settings.EMAIL_TABLE}
            SET Email_Status = ?, Reason = ?
            WHERE Email_ID = ?
        """
        
        cursor.execute(update_query, [status, reason, email_id])
        conn.commit()
        
        return cursor.rowcount > 0
        
    except Exception as e:
        logger.error(f"Error updating email status: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()


def _load_default_template() -> str:
    """
    Load the default email template from file
    
    Returns:
        String content of the default template
    """
    template_path = os.getenv("DEFAULT_EMAIL_TEMPLATE_PATH", "./templates/default_template.txt")
    try:
        # Convert relative path to absolute path if needed
        if not os.path.isabs(template_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            template_path = os.path.join(base_dir, template_path)
        
        # Check if the file exists
        if not os.path.isfile(template_path):
            logger.warning(f"Default template file not found at {template_path}")
            return ""
        
        with open(template_path, "r", encoding="utf-8") as file:
            template_content = file.read()
        
        logger.info(f"Loaded default template from {template_path}")
        return template_content
    
    except Exception as e:
        logger.error(f"Error loading default template: {str(e)}")
        return ""
