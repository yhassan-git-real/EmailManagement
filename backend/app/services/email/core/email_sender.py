"""
Email sending functionality with attachment and Google Drive integration.

This module provides comprehensive email sending capabilities including:
- SMTP email delivery
- File attachment handling with compression
- Google Drive integration for large files
- Email validation and logging
- Status tracking and error handling
"""

import os
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Dict, List, Optional, Any, Tuple, Union

from ....core.config import get_settings
from ....utils.email_logger import email_logger
from ....utils.file_utils import format_file_size
from .validation_utils import ValidationUtils
from .attachment_manager import AttachmentManager, format_size
from .smtp_manager import SMTPManager
from ..gdrive.gdrive_integration import GDriveIntegration, GDRIVE_UPLOAD_THRESHOLD, SAFE_MAX_SIZE

logger = logging.getLogger(__name__)

class EmailSender:
    """
    Comprehensive email sending service with attachment and Google Drive integration.
    
    This class provides a complete email sending solution that includes:
    - SMTP configuration and connection management
    - File attachment handling with compression
    - Google Drive integration for large files
    - Email validation and delivery tracking
    - Archive management for sent emails
    
    Args:
        smtp_server: SMTP server hostname
        port: SMTP server port
        username: SMTP username for authentication
        password: SMTP password for authentication
        use_tls: Whether to use TLS encryption (default: True)
        archive_path: Path for storing email archives (optional)
    """
    
    def __init__(self, 
                 smtp_server: str, 
                 port: int, 
                 username: str, 
                 password: str, 
                 use_tls: bool = True,
                 archive_path: Optional[str] = None):
        self.smtp_manager = SMTPManager(smtp_server, port, username, password, use_tls)
        self.attachment_manager = AttachmentManager(archive_path)
        self.validation_utils = ValidationUtils()
        self.gdrive_integration = GDriveIntegration()
        
        settings = get_settings()
        
        if not archive_path:
            archive_path = settings.EMAIL_ARCHIVE_PATH
        
        if not os.path.isabs(archive_path):
            self.archive_path = os.path.join(os.getcwd(), archive_path)
        else:
            self.archive_path = archive_path
            
        os.makedirs(self.archive_path, exist_ok=True)

    def send_email(self, 
                  recipient: str, 
                  subject: str, 
                  body: str, 
                  folder_path: Optional[str] = None,
                  sender: Optional[str] = None,
                  email_id: Optional[int] = None,
                  gdrive_share_type: str = 'anyone',
                  specific_emails: Optional[Any] = None) -> Tuple[bool, Optional[str]]:
        """Send an email with optional compressed folder attachment"""
        try:
            is_valid, error_reason = self.validation_utils.validate_email(recipient)
            if not is_valid:
                error_message = f"ERROR: {error_reason}"
                email_logger.log_email_transaction(
                    email_id=email_id,
                    email=recipient,
                    subject=subject,
                    file_path=folder_path,
                    status="Failed",
                    reason=error_message
                )
                return False, error_message
                
            is_connected, error_reason = self.smtp_manager.check_smtp_connection()
            if not is_connected:
                error_message = f"ERROR: {error_reason}"
                email_logger.log_email_transaction(
                    email_id=email_id,
                    email=recipient,
                    subject=subject,
                    file_path=folder_path,
                    status="Failed",
                    reason=error_message
                )
                return False, error_message
                
            msg = MIMEMultipart()
            msg['From'] = sender or self.smtp_manager.username
            msg['To'] = recipient
            msg['Subject'] = subject
            
            email_body = body
            
            attachment_path = None
            original_size = None
            compressed_size = None
            used_gdrive = False
            gdrive_link = None
            
            if folder_path:
                is_valid, error_reason = self.attachment_manager.validate_attachment_path(folder_path)
                if not is_valid:
                    error_message = f"ERROR: {error_reason}"
                    email_logger.log_email_transaction(
                        email_id=email_id,
                        email=recipient,
                        subject=subject,
                        file_path=folder_path,
                        status="Failed",
                        reason=error_message
                    )
                    return False, error_message
                
                original_size = self.attachment_manager.get_folder_size(folder_path)
                attachment_path, compressed_size = self.attachment_manager.compress_folder(folder_path)
                
                if not attachment_path or not compressed_size:
                    error_message = "ERROR: Failed to compress attachment folder"
                    email_logger.log_email_transaction(
                        email_id=email_id,
                        email=recipient,
                        subject=subject,
                        file_path=folder_path,
                        status="Failed",
                        reason=error_message
                    )
                    return False, error_message
                
                if attachment_path and compressed_size > GDRIVE_UPLOAD_THRESHOLD:
                    is_available, gdrive_error = self.gdrive_integration.check_gdrive_availability()
                    
                    if not is_available:
                        formatted_size = format_size(compressed_size)
                        
                        # For very large files that exceed safe limits, fail immediately if GDrive is not available
                        if compressed_size > SAFE_MAX_SIZE:
                            reason = f"ERROR: Attachment too large ({formatted_size}) - exceeds limit of {format_size(SAFE_MAX_SIZE)} and Google Drive is not available"
                            email_logger.log_error(f"Cannot send email: {reason}")
                            email_logger.log_email_transaction(
                                email_id=email_id,
                                email=recipient,
                                subject=subject,
                                file_path=folder_path,
                                status="Failed",
                                reason=reason,
                                original_size=original_size,
                                compressed_size=compressed_size
                            )
                            return False, reason
                            
                        # For files that are large but within safe limits, we can try direct attachment
                        warning_msg = f"Google Drive not available: {gdrive_error}. Will try regular attachment ({formatted_size})."
                        email_logger.log_warning(warning_msg)
                    else:
                        try:
                            upload_success, drive_link, success_msg = self.gdrive_integration.handle_large_file_upload(
                                attachment_path, gdrive_share_type, specific_emails, recipient
                            )
                            
                            if upload_success and drive_link:
                                gdrive_link = drive_link
                                used_gdrive = True
                                
                                link_html = self.gdrive_integration.create_drive_link_html(gdrive_link, attachment_path)
                                email_body += link_html
                                
                                formatted_size = format_size(compressed_size)
                                success_reason = f"Large attachment handled via Google Drive sharing ({formatted_size})"
                                email_logger.log_info(success_reason)
                            else:
                                email_logger.log_warning(f"Google Drive upload failed: {success_msg}. Attempting regular attachment.")
                                if compressed_size > SAFE_MAX_SIZE:
                                    reason = f"ERROR: File too large ({format_size(compressed_size)}) - GDrive upload failed: {success_msg}"
                                    email_logger.log_email_transaction(
                                        email_id=email_id,
                                        email=recipient,
                                        subject=subject,
                                        file_path=folder_path,
                                        status="Failed",
                                        reason=reason,
                                        original_size=original_size,
                                        compressed_size=compressed_size
                                    )
                                    return False, reason
                        except Exception as e:
                            error_message = f"Error using Google Drive for large file: {str(e)}"
                            email_logger.log_error(error_message)
                            
                            if compressed_size > SAFE_MAX_SIZE:
                                reason = f"Attachment too large: {compressed_size} bytes exceeds safe limit of {SAFE_MAX_SIZE} bytes and Google Drive integration failed"
                                email_logger.log_email_transaction(
                                    email_id=email_id,
                                    email=recipient,
                                    subject=subject,
                                    file_path=folder_path,
                                    status="Failed",
                                    reason=reason,
                                    original_size=original_size,
                                    compressed_size=compressed_size
                                )
                                return False, reason
                
                if attachment_path and not used_gdrive:
                    if compressed_size > SAFE_MAX_SIZE:
                        formatted_size = format_size(compressed_size)
                        safe_limit = format_size(SAFE_MAX_SIZE)
                        
                        # More descriptive error message with advice
                        reason = f"ERROR: Attachment too large ({formatted_size}) - exceeds email limit of {safe_limit}. Please split the files into smaller batches."
                        
                        # Log a more detailed error message with clear error icon
                        error_message = f"⚠️ ATTACHMENT TOO LARGE: {formatted_size} exceeds {safe_limit} limit and Google Drive upload is not available. Email not sent."
                        email_logger.log_error(error_message, email_id=email_id)
                        
                        email_logger.log_email_transaction(
                            email_id=email_id,
                            email=recipient,
                            subject=subject,
                            file_path=folder_path,
                            status="Failed",
                            reason=reason,
                            original_size=original_size,
                            compressed_size=compressed_size
                        )
                        return False, reason
                    
                    filename = os.path.basename(attachment_path)
                    formatted_size = format_size(compressed_size)
                    
                    # Log that we're attaching the file directly
                    direct_attach_msg = f"📎 Attaching file directly: {filename} ({formatted_size})"
                    email_logger.log_info(direct_attach_msg, email_id=email_id)
                    logger.info(direct_attach_msg)
                    
                    with open(attachment_path, 'rb') as file:
                        attach = MIMEApplication(file.read(), _subtype='zip')
                        attach.add_header('Content-Disposition', f'attachment; filename="{filename}"')
                        msg.attach(attach)
            
            html_part = MIMEText(email_body, 'html')
            html_part.add_header('Content-Type', 'text/html; charset=utf-8')
            msg.attach(html_part)
            
            self.smtp_manager.send_message(msg)
                
            if used_gdrive:
                file_name = os.path.basename(attachment_path)
                formatted_size = format_file_size(compressed_size)
                success_reason = f"SUCCESS: Email sent with Google Drive link - {file_name} ({formatted_size})"
            elif attachment_path:
                file_name = os.path.basename(attachment_path)
                formatted_size = format_file_size(compressed_size) if compressed_size else "N/A"
                success_reason = f"SUCCESS: Email sent with direct attachment - {file_name} ({formatted_size})"
            else:
                success_reason = f"SUCCESS: Email sent without attachments"
                
            email_logger.log_email_transaction(
                email_id=email_id,
                email=recipient,
                subject=subject,
                file_path=folder_path,
                status="Success",
                reason=success_reason,
                original_size=original_size,
                compressed_size=compressed_size
            )
            
            logger.info(f"Email sent successfully to {recipient}")
            return True, success_reason
            
        except Exception as e:
            error_message = f"Failed to send email to {recipient}: {str(e)}"
            logger.error(error_message)
            
            error_type = e.__class__.__name__
            error_details = str(e)
            formatted_reason = f"ERROR: {error_type} - {error_details}"
            
            email_logger.log_email_transaction(
                email_id=email_id,
                email=recipient,
                subject=subject,
                file_path=folder_path,
                status="Failed",
                reason=formatted_reason,
                original_size=original_size,
                compressed_size=compressed_size
            )
            
            return False, formatted_reason

    def send_email_with_validation(self, recipient: str, subject: str, body: str, 
                                   folder_path: Optional[str] = None,
                                   sender: Optional[str] = None,
                                   email_id: Optional[int] = None,
                                   validate_mapping: bool = True,
                                   gdrive_share_type: str = 'anyone',
                                   specific_emails: Optional[Union[List[str], str]] = None) -> Tuple[bool, Optional[str]]:
        """Send an email with full validation before compression and sending"""
        try:
            is_valid, error_reason = self.validation_utils.validate_email(recipient)
            if not is_valid:
                error_message = f"ERROR: {error_reason}"
                email_logger.log_email_transaction(
                    email_id=email_id,
                    email=recipient,
                    subject=subject,
                    file_path=folder_path,
                    status="Failed",
                    reason=error_message
                )
                return False, error_message
                
            is_connected, error_reason = self.smtp_manager.check_smtp_connection()
            if not is_connected:
                error_message = f"ERROR: {error_reason}"
                email_logger.log_email_transaction(
                    email_id=email_id,
                    email=recipient,
                    subject=subject,
                    file_path=folder_path,
                    status="Failed",
                    reason=error_message
                )
                return False, error_message
                
            if folder_path:
                is_valid, error_reason = self.attachment_manager.validate_attachment_path(folder_path)
                if not is_valid:
                    error_message = f"ERROR: {error_reason}"
                    email_logger.log_email_transaction(
                        email_id=email_id,
                        email=recipient,
                        subject=subject,
                        file_path=folder_path,
                        status="Failed",
                        reason=error_message
                    )
                    return False, error_message
                    
            if validate_mapping and email_id is not None:
                from ....services.automation.validation.mapping_validator import _validate_recipient_mapping
                is_valid, error_reason = _validate_recipient_mapping(email_id, recipient, folder_path)
                if not is_valid:
                    error_message = f"ERROR: {error_reason}"
                    email_logger.log_email_transaction(
                        email_id=email_id,
                        email=recipient,
                        subject=subject,
                        file_path=folder_path,
                        status="Failed",
                        reason=error_message
                    )
                    return False, error_message
                
            if folder_path:
                original_size = self.attachment_manager.get_folder_size(folder_path)
                if original_size > GDRIVE_UPLOAD_THRESHOLD:
                    is_available, gdrive_error = self.gdrive_integration.check_gdrive_availability()
                    if not is_available:
                        # Predict if the compressed size will exceed safe limits
                        # Compression typically reduces size by ~30-50% for most files
                        # Using conservative estimate of 10% reduction to be safe
                        estimated_compressed_size = int(original_size * 0.9)  # Conservative estimate
                        
                        if estimated_compressed_size > SAFE_MAX_SIZE:
                            reason = f"ERROR: Attachment likely too large (est. {format_size(estimated_compressed_size)}) - exceeds limit of {format_size(SAFE_MAX_SIZE)} and Google Drive is not available"
                            email_logger.log_error(f"Pre-validation failed: {reason}")
                            email_logger.log_email_transaction(
                                email_id=email_id,
                                email=recipient,
                                subject=subject,
                                file_path=folder_path,
                                status="Failed",
                                reason=reason,
                                original_size=original_size
                            )
                            return False, reason
                            
                        email_logger.log_warning(f"Google Drive not available: {gdrive_error}. Will try regular attachment.")
            
            return self.send_email(recipient, subject, body, folder_path, sender, email_id, gdrive_share_type, specific_emails)
                
        except Exception as e:
            error_message = f"Failed to validate email: {str(e)}"
            logger.error(error_message)
            
            error_type = e.__class__.__name__
            error_details = str(e)
            formatted_reason = f"ERROR: {error_type} - {error_details}"
            
            email_logger.log_email_transaction(
                email_id=email_id,
                email=recipient,
                subject=subject,
                file_path=folder_path,
                status="Failed",
                reason=formatted_reason
            )
            
            return False, formatted_reason

    def _get_folder_size(self, folder_path: str) -> int:
        """Calculate the total size of a folder in bytes"""
        return self.attachment_manager.get_folder_size(folder_path)
            
    def _compress_folder(self, folder_path: str) -> Tuple[Optional[str], Optional[int]]:
        """Compress a folder and move it to the archive directory"""
        return self.attachment_manager.compress_folder(folder_path)
    
    def _check_smtp_connection(self) -> Tuple[bool, str]:
        """Check if connection to SMTP server can be established"""
        return self.smtp_manager.check_smtp_connection()
    
    def _validate_email(self, email: str) -> Tuple[bool, str]:
        """Validate an email address format"""
        return self.validation_utils.validate_email(email)
    
    def _validate_attachment_path(self, path: str) -> Tuple[bool, str]:
        """Validate that an attachment path exists and is accessible"""
        return self.attachment_manager.validate_attachment_path(path)
    
    def _check_gdrive_availability(self) -> Tuple[bool, str]:
        """Check if Google Drive is available for uploading"""
        return self.gdrive_integration.check_gdrive_availability()
