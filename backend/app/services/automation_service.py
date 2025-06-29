import os
import logging
import threading
import time
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
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
    # New schedule settings
    "schedule": {
        "enabled": False, 
        "frequency": "daily",
        "time": "09:00",  # 24-hour format
        "days": [],  # For weekly/monthly schedules
        "lastRun": None,
        "nextRun": None
    },
    # Queue for processing emails - will be initialized when needed
    "email_queue": None,
    # Scheduler thread
    "scheduler_thread": None,
    "scheduler_running": False
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
    if template_id:
        try:
            template = get_template_by_id(template_id)
        except Exception as e:
            logger.warning(f"Could not find template with ID {template_id}, using default template: {str(e)}")
            
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
        
        # Always update all counts from the database for accuracy
        _automation_state["summary"]["pending"] = summary["Pending"]
        _automation_state["summary"]["successful"] = summary["Success"]
        _automation_state["summary"]["failed"] = summary["Failed"]
            
    except Exception as e:
        # Just log at debug level since this is called frequently by polling
        # and doesn't affect core functionality
        logger.debug(f"Error updating summary counts: {str(e)}")


def _load_emails_by_status(status):
    """
    Load email records from the database by status
    
    Args:
        status: EmailStatus value to filter by
    
    Returns:
        List of email records with the specified status
    """
    try:
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
        
        cursor.execute(query, [status])
        
        columns = [column[0] for column in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        logger.error(f"Error loading emails with status '{status}': {str(e)}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()


def start_automation() -> Dict[str, Any]:
    """
    Start the email automation process for PENDING emails only.
    This function will only process emails with 'Pending' status,
    never affecting failed or successful emails.
    
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
        # Get only pending emails
        emails_to_process = _load_emails_by_status(EmailStatus.PENDING.value)
        
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
        _automation_state["status"] = "running"  # Explicitly set to running
        _automation_state["automation_thread"] = threading.Thread(
            target=_process_email_queue,
            daemon=True
        )
        _automation_state["automation_thread"].start()
        
        logger.info(f"Started email automation with {len(emails_to_process)} pending emails to process")
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
    Restart processing of FAILED emails only.
    This function will only process emails with 'Failed' status,
    never affecting pending or successful emails.
    
    Returns:
        Current automation status
    """
    global _automation_state
    
    # Don't restart if already running
    if _automation_state["is_running"]:
        logger.info("Cannot restart failed emails while automation is running")
        return get_automation_status()
    
    try:
        # Get failed emails only
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        # First, get the count of failed emails only
        check_query = f"""
            SELECT COUNT(*) FROM {settings.EMAIL_TABLE}
            WHERE Email_Status = ?
        """
        
        cursor.execute(check_query, [EmailStatus.FAILED.value])
        failed_count = cursor.fetchone()[0]
        
        if failed_count == 0:
            logger.info("No failed emails to restart")
            return get_automation_status()
            
        logger.info(f"Found {failed_count} failed emails to restart")
        
        # Get all failed emails
        failed_emails = _load_emails_by_status(EmailStatus.FAILED.value)
        
        # Update status back to pending for only the failed emails
        update_query = f"""
            UPDATE {settings.EMAIL_TABLE}
            SET Email_Status = ?
            WHERE Email_Status = ?
        """
        
        cursor.execute(update_query, [EmailStatus.PENDING.value, EmailStatus.FAILED.value])
        conn.commit()
        
        # Create a queue specifically for these emails
        _automation_state["email_queue"] = queue.Queue()
        
        # Put all previously failed (now pending) emails into the queue
        for email in failed_emails:
            # Update the status in our local copy to match what we just did in the database
            email["Email_Status"] = EmailStatus.PENDING.value
            _automation_state["email_queue"].put(email)
        
        # Update summary counts
        _update_summary()
        
        # Start processing thread
        _automation_state["is_running"] = True
        _automation_state["status"] = "restarting"
        _automation_state["automation_thread"] = threading.Thread(
            target=_process_email_queue,
            daemon=True
        )
        _automation_state["automation_thread"].start()
        
        logger.info(f"Started reprocessing of {len(failed_emails)} previously failed emails")
        return get_automation_status()
            
    except Exception as e:
        logger.error(f"Error restarting failed emails: {str(e)}")
        _automation_state["status"] = "error"
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

def _schedule_next_run():
    """Schedule the next run time based on current settings"""
    global _automation_state
    
    if not _automation_state["schedule"]["enabled"]:
        return
    
    try:
        frequency = _automation_state["schedule"]["frequency"]
        current_time = datetime.now()
        next_run = None
        
        if frequency == "minute":
            next_run = current_time + timedelta(minutes=int(_automation_state["schedule"]["interval"]))
        elif frequency == "hour":
            next_run = current_time + timedelta(hours=int(_automation_state["schedule"]["interval"]))
        elif frequency == "daily":
            next_run = current_time.replace(hour=int(_automation_state["schedule"]["time"].split(":")[0]), 
                                             minute=int(_automation_state["schedule"]["time"].split(":")[1]), 
                                             second=0, microsecond=0)
            # If the time has already passed today, schedule for tomorrow
            if next_run < current_time:
                next_run += timedelta(days=1)
        elif frequency == "weekly":
            # Schedule for the next specified day of the week
            today = current_time.weekday()  # Monday is 0, Sunday is 6
            days_ahead = (_automation_state["schedule"]["days"][(current_time.weekday() + 1) % 7] - today) % 7
            if days_ahead == 0:
                # If the day is today, schedule for the next hour
                next_run = current_time.replace(hour=int(_automation_state["schedule"]["time"].split(":")[0]), 
                                                 minute=int(_automation_state["schedule"]["time"].split(":")[1]), 
                                                 second=0, microsecond=0)
                # If the time has already passed, schedule for next week
                if next_run < current_time:
                    next_run += timedelta(weeks=1)
            else:
                next_run = current_time + timedelta(days=days_ahead)
        elif frequency == "monthly":
            # Schedule for the next month on the same day
            next_run = current_time.replace(day=1) + timedelta(days=32)  # Go to next month
            next_run = next_run.replace(day=int(_automation_state["schedule"]["time"]))
            # If the day is in the past, schedule for next month
            if next_run < current_time:
                next_run = next_run + timedelta(days=32)
        
        _automation_state["schedule"]["nextRun"] = next_run
        logger.info(f"Next run scheduled at {next_run}")
        
    except Exception as e:
        logger.error(f"Error scheduling next run: {str(e)}")


def _scheduler_thread():
    """Thread function for the scheduler"""
    global _automation_state
    
    while _automation_state["scheduler_running"]:
        try:
            # Check if it's time to run the automation
            current_time = datetime.now()
            
            if _automation_state["schedule"]["nextRun"] and current_time >= _automation_state["schedule"]["nextRun"]:
                logger.info("Scheduled time reached, starting automation")
                start_automation()
                
                # Schedule the next run
                _schedule_next_run()
            else:
                # Sleep for a while before checking again
                time.sleep(10)
        
        except Exception as e:
            logger.error(f"Error in scheduler thread: {str(e)}")
            time.sleep(60)  # Wait before retrying


def start_scheduler() -> Dict[str, Any]:
    """
    Start the scheduler for automated email processing
    
    Returns:
        Current automation state
    """
    global _automation_state
    
    if _automation_state["scheduler_running"]:
        logger.info("Scheduler is already running")
        return get_automation_status()
    
    # Set the scheduler to running
    _automation_state["scheduler_running"] = True
    
    # Start the scheduler thread
    _automation_state["scheduler_thread"] = threading.Thread(
        target=_scheduler_thread,
        daemon=True
    )
    _automation_state["scheduler_thread"].start()
    
    logger.info("Started email automation scheduler")
    return get_automation_status()


def stop_scheduler() -> Dict[str, Any]:
    """
    Stop the scheduler for automated email processing
    
    Returns:
        Current automation state
    """
    global _automation_state
    
    if not _automation_state["scheduler_running"]:
        logger.info("Scheduler is not running")
        return get_automation_status()
    
    # Set the scheduler to not running
    _automation_state["scheduler_running"] = False
    
    logger.info("Stopped email automation scheduler")
    return get_automation_status()


def update_schedule_settings(schedule_settings: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update the automation schedule settings
    
    Args:
        schedule_settings: New schedule settings
        
    Returns:
        Updated schedule settings
    """
    global _automation_state
    
    # Update only valid keys
    for key, value in schedule_settings.items():
        if key in _automation_state["schedule"]:
            _automation_state["schedule"][key] = value
            
    # Calculate next run time if schedule is enabled
    if _automation_state["schedule"]["enabled"]:
        _calculate_next_run()
        
        # Start the scheduler if it's not already running
        if not _automation_state.get("scheduler_running", False):
            _start_scheduler()
    else:
        # Stop the scheduler if it's running
        _stop_scheduler()
    
    return get_schedule_settings()


def get_schedule_settings() -> Dict[str, Any]:
    """
    Get the current schedule settings
    
    Returns:
        Dictionary with current schedule settings
    """
    return _automation_state["schedule"]


def _calculate_next_run() -> None:
    """Calculate the next run time based on current schedule settings"""
    global _automation_state
    
    now = datetime.now()
    frequency = _automation_state["schedule"]["frequency"]
    time_str = _automation_state["schedule"]["time"]
    
    try:
        # Parse the time string (HH:MM)
        hour, minute = map(int, time_str.split(":"))
        
        if frequency == "daily":
            # Set next run to today at the specified time
            next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # If that time has already passed today, set to tomorrow
            if next_run <= now:
                next_run += timedelta(days=1)
                
        elif frequency == "weekly":
            # Get the target days of the week (0-6, where 0 is Monday in our case)
            days = _automation_state["schedule"]["days"]
            
            if not days:
                # Default to Monday if no days specified
                days = [0]
                
            # Find the next occurrence from the list of days
            current_weekday = now.weekday()
            days_ahead = 7
            
            for day in days:
                # Calculate days until the next occurrence of this weekday
                days_until = (day - current_weekday) % 7
                
                # If it's today but the time has passed, add a week
                if days_until == 0 and now >= now.replace(hour=hour, minute=minute, second=0, microsecond=0):
                    days_until = 7
                    
                days_ahead = min(days_ahead, days_until)
            
            next_run = now + timedelta(days=days_ahead)
            next_run = next_run.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
        elif frequency == "monthly":
            # Get the target days of the month (1-31)
            days = _automation_state["schedule"]["days"]
            
            if not days:
                # Default to the 1st of the month if no days specified
                days = [1]
                
            # Find the next occurrence from the list of days
            current_day = now.day
            
            # Sort days in ascending order
            days.sort()
            
            # Find the next day in the current month
            next_day = None
            for day in days:
                if day > current_day:
                    next_day = day
                    break
            
            if next_day is None:
                # If no days remain in this month, go to next month
                if now.month == 12:
                    next_month = 1
                    next_year = now.year + 1
                else:
                    next_month = now.month + 1
                    next_year = now.year
                    
                next_day = days[0]  # Use the first day in the list for next month
                next_run = datetime(next_year, next_month, next_day, hour, minute)
            else:
                # Use the found day in the current month
                next_run = now.replace(day=next_day, hour=hour, minute=minute, second=0, microsecond=0)
        else:
            # Default to daily if unknown frequency
            next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            if next_run <= now:
                next_run += timedelta(days=1)
        
        _automation_state["schedule"]["nextRun"] = next_run
        
    except Exception as e:
        logger.error(f"Error calculating next run time: {str(e)}")
        # Set a default next run time (1 hour from now)
        _automation_state["schedule"]["nextRun"] = now + timedelta(hours=1)


def _start_scheduler() -> None:
    """Start the scheduler thread"""
    global _automation_state
    
    if _automation_state.get("scheduler_running", False):
        return
        
    logger.info("Starting email automation scheduler")
    
    _automation_state["scheduler_running"] = True
    _automation_state["scheduler_thread"] = threading.Thread(
        target=_run_scheduler,
        daemon=True
    )
    _automation_state["scheduler_thread"].start()


def _stop_scheduler() -> None:
    """Stop the scheduler thread"""
    global _automation_state
    
    logger.info("Stopping email automation scheduler")
    _automation_state["scheduler_running"] = False


def _run_scheduler() -> None:
    """Run the scheduler loop"""
    global _automation_state
    
    while _automation_state.get("scheduler_running", False):
        try:
            # Check if scheduler is enabled
            if not _automation_state["schedule"]["enabled"]:
                break
                
            now = datetime.now()
            next_run = _automation_state["schedule"].get("nextRun")
            
            if next_run and now >= next_run:
                # It's time to run the automation
                logger.info("Scheduled automation starting")
                
                # Update last run time
                _automation_state["schedule"]["lastRun"] = now
                
                # Start the automation
                if not _automation_state["is_running"]:
                    start_automation()
                
                # Calculate the next run time
                _calculate_next_run()
                
                # Log the next scheduled run
                logger.info(f"Next scheduled run: {_automation_state['schedule']['nextRun']}")
        except Exception as e:
            logger.error(f"Error in scheduler loop: {str(e)}")
            
        # Sleep for a minute before checking again
        time.sleep(60)
    
    logger.info("Scheduler thread stopped")
