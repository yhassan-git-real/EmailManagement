"""
Email automation management system.

This module provides the core automation functionality including:
- Starting and stopping automation processes
- Processing email queues
- Managing automation state
- Handling failed email retries
- Status tracking and reporting

The automation manager coordinates between different components to provide
a complete email automation solution.
"""

import logging
import queue
import threading
from datetime import datetime
from typing import Dict, Any

from ....models.email import EmailStatus
from ....utils.email_logger import email_logger
from ....core.config import get_settings
from ....utils.db_utils import get_db_connection
from ..database.email_repository import _load_emails_by_status
from ..processing.email_processor import _process_email_queue
from ..processing.batch_processor import _update_summary
from .state_manager import get_automation_state

logger = logging.getLogger(__name__)


def start_automation() -> Dict[str, Any]:
    """Start email automation process for PENDING emails only"""
    automation_state = get_automation_state()
    
    if automation_state["is_running"]:
        logger.info("Email automation is already running")
        return get_automation_status()
    
    automation_state["stop_requested"] = False
    
    try:
        process_id = f"auto_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        email_logger.start_process(process_id, "Email Automation Process")
        
        emails_to_process = _load_emails_by_status(EmailStatus.PENDING.value)
        automation_state["summary"]["pending"] = len(emails_to_process)
        
        if not emails_to_process:
            email_logger.end_process(process_id, "completed", "No pending emails to process")
            logger.info("No pending emails to process")
            return get_automation_status()
        
        automation_state["email_queue"] = queue.Queue()
        
        for email in emails_to_process:
            automation_state["email_queue"].put(email)
        
        automation_state["process_id"] = process_id
        automation_state["is_running"] = True
        automation_state["status"] = "running"
        automation_state["automation_thread"] = threading.Thread(
            target=_process_email_queue,
            daemon=True
        )
        automation_state["automation_thread"].start()
        
        email_logger.log_info(f"Started email automation with {len(emails_to_process)} pending emails to process", process_id=process_id)
        return get_automation_status()
        
    except Exception as e:
        if 'process_id' in locals():
            email_logger.end_process(process_id, "error", f"Error starting automation: {str(e)}")
            
        logger.error(f"Error starting email automation: {str(e)}")
        automation_state["status"] = "error"
        automation_state["is_running"] = False
        return get_automation_status()


def stop_automation() -> Dict[str, Any]:
    """Stop the email automation process"""
    automation_state = get_automation_state()
    
    if not automation_state["is_running"]:
        logger.info("Email automation is not running")
        return get_automation_status()
    
    automation_state["stop_requested"] = True
    automation_state["status"] = "stopping"
    
    if "process_id" in automation_state and automation_state["process_id"]:
        process_id = automation_state["process_id"]
        email_logger.log_info(f"Stopping email automation process", process_id=process_id)
        email_logger.end_process(process_id, "stopped", "User requested stop")
    
    logger.info("Stopping email automation...")
    return get_automation_status()


def restart_failed_emails() -> Dict[str, Any]:
    """Restart processing of FAILED emails only"""
    automation_state = get_automation_state()
    
    if automation_state["is_running"]:
        email_logger.log_info("Cannot restart failed emails while automation is running")
        return get_automation_status()
    
    try:
        # Generate a unique process ID for this automation run
        process_id = f"retry_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Start process tracking in the logger with a more descriptive name and emoji
        email_logger.start_process(process_id, "Failed Email Retry Process")
        email_logger.log_info("🔄 Starting automation process: Failed Email Retry Process", process_id=process_id)
        
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
            email_logger.log_info("❌ No failed emails to restart", process_id=process_id)
            email_logger.end_process(process_id, "completed", "No failed emails to restart")
            return get_automation_status()
            
        email_logger.log_info(f"❌ Found {failed_count} failed emails to restart", process_id=process_id)
        
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
        automation_state["email_queue"] = queue.Queue()
        
        # Put all previously failed (now pending) emails into the queue
        for email in failed_emails:
            # Update the status in our local copy to match what we just did in the database
            email["Email_Status"] = EmailStatus.PENDING.value
            automation_state["email_queue"].put(email)
            
            # Track this email in the process
            if 'Email_ID' in email and email['Email_ID']:
                email_logger.add_email_to_process(process_id, email['Email_ID'])
        
        # Store process ID in automation state
        automation_state["process_id"] = process_id
        
        # Update summary counts
        _update_summary()
        
        # Start processing thread
        automation_state["is_running"] = True
        automation_state["status"] = "restarting"
        automation_state["automation_thread"] = threading.Thread(
            target=_process_email_queue,
            daemon=True
        )
        automation_state["automation_thread"].start()
        
        # Enhanced logging with more details and consistent formatting with normal process
        email_logger.log_info(f"🔄 Started reprocessing of {len(failed_emails)} previously failed emails", process_id=process_id)
        
        return get_automation_status()
            
    except Exception as e:
        error_msg = f"Error restarting failed emails: {str(e)}"
        email_logger.log_error(f"❌ {error_msg}", process_id=process_id if 'process_id' in locals() else None)
        
        # End the process with error if a process_id exists
        if 'process_id' in locals():
            email_logger.end_process(process_id, "error", error_msg)
            
        automation_state["status"] = "error"
        return get_automation_status()
    finally:
        if 'conn' in locals():
            conn.close()


def get_automation_status() -> Dict[str, Any]:
    """Get the current status of email automation"""
    automation_state = get_automation_state()
    
    if not automation_state["is_running"]:
        _update_summary()
    
    return {
        "status": automation_state["status"],
        "lastRun": automation_state["last_run"].isoformat() if automation_state["last_run"] else None,
        "summary": automation_state["summary"]
    }
