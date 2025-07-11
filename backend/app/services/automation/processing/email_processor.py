"""Email processor for handling email queue processing"""

import logging
import queue
from datetime import datetime
from typing import Optional

from ....models.email import EmailStatus
from ....services.email_sender import EmailSender
from ....services.template_service import get_template_by_id
from ....utils.email_logger import email_logger
from ..core.state_manager import get_automation_state
from ..core.settings_manager import _get_smtp_settings
from ..database.email_repository import _check_email_status
from ..templates.template_manager import _load_default_template
from ..validation.mapping_validator import _validate_recipient_mapping
from .batch_processor import _update_summary

logger = logging.getLogger(__name__)


def _process_email_queue():
    """Process the email queue in a separate thread"""
    automation_state = get_automation_state()
    
    # Determine if this is a restart process or normal process
    is_restart = automation_state["status"] == "restarting"
    process_emoji = "🔄" if is_restart else "🚀"
    
    automation_state["status"] = "running"
    automation_state["start_time"] = datetime.now()
    
    # Get the process_id from the automation state
    process_id = automation_state.get("process_id")
    
    # Reset summary
    automation_state["summary"] = {
        "processed": 0,
        "successful": 0,
        "failed": 0,
        "pending": 0
    }
    
    # Get template
    template = None
    template_id = automation_state["settings"]["template_id"]
    if template_id:
        try:
            template = get_template_by_id(template_id)
        except Exception as e:
            logger.warning(f"Could not find template with ID {template_id}, using default template: {str(e)}")
            
    # Get SMTP settings
    smtp_settings = _get_smtp_settings()
    
    # Check if we have valid SMTP settings
    if not smtp_settings["smtp_server"] or not smtp_settings["username"] or not smtp_settings["password"]:
        error_msg = "SMTP settings are incomplete. Email automation cannot start."
        logger.error(error_msg)
        
        # End the process with error if a process_id exists
        if process_id:
            email_logger.end_process(process_id, "error", error_msg)
            
        automation_state["status"] = "error"
        automation_state["last_run"] = datetime.now()
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
        while not automation_state["stop_requested"] and not automation_state["email_queue"].empty():
            try:
                # Get next email from queue with a timeout
                email_record = automation_state["email_queue"].get(timeout=1)
                
                # Check if email is still pending (race condition check)
                is_pending, current_status = _check_email_status(email_record["Email_ID"])
                if not is_pending:
                    # Log with process_id
                    email_logger.log_info(
                        f"Skipping email ID {email_record['Email_ID']} - " +
                        f"Status changed from Pending to {current_status} (race condition prevention)",
                        email_id=email_record["Email_ID"],
                        process_id=process_id
                    )
                    
                    # Mark task as done and continue to next email
                    automation_state["email_queue"].task_done()
                    continue
                
                # Log with process_id and consistent emoji
                email_logger.log_info(
                    f"{process_emoji} Processing email ID {email_record['Email_ID']} to {email_record['Email']}",
                    email_id=email_record["Email_ID"],
                    recipient=email_record["Email"],
                    subject=email_record["Subject"],
                    process_id=process_id
                )
                
                # Update processed count
                automation_state["summary"]["processed"] += 1
                
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
                
                # Validate recipient mapping before sending
                is_valid, error_reason = _validate_recipient_mapping(
                    email_record["Email_ID"],
                    email_record["Email"],
                    email_record["File_Path"]
                )
                
                if not is_valid:
                    error_message = f"ERROR: {error_reason}"
                    
                    # Update status to failed
                    from ....services.email_sender import update_email_status as update_status
                    update_status(
                        email_id=email_record["Email_ID"],
                        status=EmailStatus.FAILED.value,
                        reason=error_message,
                        date=datetime.now()
                    )
                    
                    # Log the error
                    email_logger.log_info(
                        f"Email processing failed - ID: {email_record['Email_ID']}, "
                        f"To: {email_record['Email']}, Subject: {email_record['Subject']}, "
                        f"Status: Failed, Reason: {error_message}"
                    )
                    
                    # Mark task as done and continue to next email
                    automation_state["email_queue"].task_done()
                    automation_state["summary"]["failed"] += 1
                    continue
                
                # Get the sharing options from the automation state
                sharing_option = automation_state["settings"].get("sharing_option", "anyone")
                specific_emails = automation_state["settings"].get("specific_emails", [])
                
                # Send email with validation - we already validated recipient mapping here
                # so we set validate_mapping=False to avoid duplicate validation
                success, reason = email_sender.send_email_with_validation(
                    recipient=email_record["Email"],
                    subject=email_record["Subject"],
                    body=email_body,
                    folder_path=email_record["File_Path"],
                    sender=sender_email,
                    email_id=email_record["Email_ID"],
                    validate_mapping=False,  # Already validated above
                    gdrive_share_type=sharing_option,
                    specific_emails=specific_emails
                )
                
                # Update status based on result
                new_status = EmailStatus.SUCCESS if success else EmailStatus.FAILED
                current_time = datetime.now()
                
                # Update the database with current timestamp
                if success:
                    # For success, update both Email_Send_Date and Date columns
                    from ....services.email_sender import update_email_status as update_status
                    update_status(
                        email_id=email_record["Email_ID"],
                        status=new_status.value,
                        reason=reason or "Email sent successfully",
                        send_date=current_time,
                        date=current_time
                    )
                    automation_state["summary"]["successful"] += 1
                else:
                    from ....services.email_sender import update_email_status as update_status
                    update_status(
                        email_id=email_record["Email_ID"],
                        status=new_status.value,
                        reason=reason or "Failed to send email",
                        send_date=current_time,
                        date=current_time
                    )
                    automation_state["summary"]["failed"] += 1
                
                # Log the transaction with process_id
                email_logger.log_email_transaction(
                    email_id=email_record["Email_ID"],
                    email=email_record["Email"],
                    subject=email_record["Subject"],
                    status=new_status.value,
                    reason=reason,
                    process_id=process_id
                )
                
                # Add additional detailed log for failures with the process emoji
                if not success:
                    email_logger.log_error(
                        f"{process_emoji} Email ID {email_record['Email_ID']} to {email_record['Email']} FAILED: {reason}",
                        email_id=email_record["Email_ID"],
                        recipient=email_record["Email"],
                        subject=email_record["Subject"],
                        process_id=process_id
                    )
                
                # Mark task as done in queue
                automation_state["email_queue"].task_done()
                
            except queue.Empty:
                # Queue is empty, continue to next loop iteration
                continue
            except Exception as e:
                # Log the error with process_id and consistent emoji
                email_logger.log_error(
                    f"{process_emoji} Error processing email: {str(e)}",
                    email_id=email_record.get("Email_ID"),
                    process_id=process_id
                )
                # Continue with next email
                continue
        
        # All emails processed - update status and end the process
        automation_state["status"] = "idle"
        automation_state["last_run"] = datetime.now()
        automation_state["is_running"] = False
        automation_state["stop_requested"] = False
        
        # End the process with success if a process_id exists
        if process_id:
            summary = automation_state["summary"]
            total_time = datetime.now() - automation_state["start_time"]
            total_seconds = total_time.total_seconds()
            
            # Add detailed statistics to the log with consistent emoji
            email_logger.log_info(
                f"{process_emoji} {process_emoji} Email processing statistics: " +
                f"{summary['successful']} successful, {summary['failed']} failed out of {summary['processed']} emails - " +
                f"Processing time: {total_seconds:.2f}s",
                process_id=process_id
            )
            
            # End the process with a summary description
            description = (f"Processed {summary['processed']} emails: " +
                          f"{summary['successful']} successful, {summary['failed']} failed")
            email_logger.end_process(process_id, "success", description)
        
        # Update pending count after finishing
        _update_summary()
    except Exception as e:
        error_msg = f"Error in email automation process: {str(e)}"
        logger.error(error_msg)
        
        # End the process with error if a process_id exists
        if process_id:
            email_logger.end_process(process_id, "error", error_msg)
            
        automation_state["status"] = "error"
        automation_state["last_run"] = datetime.now()
        automation_state["is_running"] = False
        automation_state["stop_requested"] = False
