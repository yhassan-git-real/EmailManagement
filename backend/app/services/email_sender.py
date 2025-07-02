import smtplib
import os
import zipfile
import logging
import tempfile
import shutil
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
from ..core.config import get_settings
from ..utils.db_utils import get_db_connection
from ..models.email import EmailStatus
from ..utils.email_logger import email_logger

# Import the Google Drive service
try:
    from .gdrive_service import GoogleDriveService
    GDRIVE_AVAILABLE = True
    email_logger.log_info("Google Drive service is available for large file uploads.")
except ImportError:
    GDRIVE_AVAILABLE = False
    email_logger.log_warning("Google Drive service not available. Large file uploads will not be possible.")

logger = logging.getLogger(__name__)

# Gmail's attachment size limit in bytes (25MB)
GMAIL_MAX_SIZE = 25 * 1024 * 1024  # 25MB
SAFE_MAX_SIZE = 20 * 1024 * 1024   # 20MB (conservative limit to account for email headers)
GDRIVE_UPLOAD_THRESHOLD = 20 * 1024 * 1024  # 20MB - when to use Google Drive instead of email attachment

def get_archive_path() -> str:
    """
    Get the path where email attachments are archived as zip files
    
    Returns:
        String path to the archive directory
    """
    settings = get_settings()
    
    # Get the archive path from settings (loaded from .env)
    env_path = settings.EMAIL_ARCHIVE_PATH
    
    # If env_path is a relative path, join it with the current working directory
    if env_path and not os.path.isabs(env_path):
        archive_path = os.path.join(os.getcwd(), env_path)
    else:
        archive_path = env_path or os.path.join(os.getcwd(), "Email_Archive")
    
    # Create the directory if it doesn't exist
    os.makedirs(archive_path, exist_ok=True)
    
    return archive_path

class EmailSender:
    """Service class for sending emails with attachments"""
    
    def __init__(self, 
                 smtp_server: str, 
                 port: int, 
                 username: str, 
                 password: str, 
                 use_tls: bool = True,
                 archive_path: Optional[str] = None):
        """
        Initialize the email sender with SMTP configuration
        
        Args:
            smtp_server: SMTP server address
            port: SMTP server port
            username: SMTP username/login
            password: SMTP password
            use_tls: Whether to use TLS encryption
            archive_path: Path to store compressed attachments
        """
        self.smtp_server = smtp_server
        self.port = port
        self.username = username
        self.password = password
        self.use_tls = use_tls
        
        # Get settings for default values from .env
        settings = get_settings()
        
        # If no archive path provided, use the one from settings
        if not archive_path:
            archive_path = settings.EMAIL_ARCHIVE_PATH
        
        # Handle archive path - make it absolute if it's relative
        if not os.path.isabs(archive_path):
            self.archive_path = os.path.join(os.getcwd(), archive_path)
        else:
            self.archive_path = archive_path
            
        # Create archive directory if it doesn't exist
        os.makedirs(self.archive_path, exist_ok=True)
        
    def send_email(self, 
                  recipient: str, 
                  subject: str, 
                  body: str, 
                  folder_path: Optional[str] = None,
                  sender: Optional[str] = None,
                  email_id: Optional[int] = None) -> Tuple[bool, Optional[str]]:
        """
        Send an email with optional compressed folder attachment
        
        Args:
            recipient: Recipient email address
            subject: Email subject
            body: Email body content (HTML)
            folder_path: Path to folder that should be compressed and attached
            sender: Sender email address (defaults to SMTP username)
            email_id: Database ID of the email record for logging
            
        Returns:
            Tuple[bool, Optional[str]]: (success, reason_if_failed)
        """
        try:
            # Create email message
            msg = MIMEMultipart()
            msg['From'] = sender or self.username
            msg['To'] = recipient
            msg['Subject'] = subject
            
            # Modified email body (may be updated later if we use Google Drive)
            email_body = body
            
            # Handle folder attachment if provided
            attachment_path = None
            original_size = None
            compressed_size = None
            used_gdrive = False
            gdrive_link = None
            
            if folder_path and os.path.exists(folder_path):
                # Get original folder size
                original_size = self._get_folder_size(folder_path)
                
                # Compress the folder
                attachment_path, compressed_size = self._compress_folder(folder_path)
                
                # If file exists and is larger than threshold, try to use Google Drive
                if attachment_path and compressed_size > GDRIVE_UPLOAD_THRESHOLD:
                    try:
                        # Use personal Google Drive account
                        if GDRIVE_AVAILABLE:
                            # Initialize Google Drive service
                            gdrive = GoogleDriveService()
                            logger.info("Using Google Drive account for file upload")
                        else:
                            raise ImportError("Google Drive service not available")
                        
                        # Upload file to Google Drive and get shareable link
                        upload_success, drive_link, error_msg = gdrive.upload_and_get_link(attachment_path)
                        
                        if upload_success and drive_link:
                            # If successful, add the link to the email body
                            gdrive_link = drive_link
                            used_gdrive = True
                            
                            # Append download link information to the email body
                            file_name = os.path.basename(attachment_path)
                            link_html = f"""
                            <div style="margin-top: 20px; padding: 15px; border: 1px solid #e0e0e0; background-color: #f9f9f9;">
                                <p><strong>Large File Attachment Notice:</strong></p>
                                <p>The file <strong>{file_name}</strong> was too large to send as an email attachment.</p>
                                <p>It has been uploaded to Google Drive for your convenience.</p>
                                <p><a href="{gdrive_link}" style="display: inline-block; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px;">Download File</a></p>
                                <p style="font-size: 12px; color: #666;">This link will be available for 30 days.</p>
                            </div>
                            """
                            
                            # Add link to email body
                            email_body += link_html
                            
                            email_logger.log_info(f"File {file_name} uploaded to Google Drive instead of email attachment (size: {compressed_size} bytes)")
                        else:
                            # If Google Drive upload failed, fall back to regular attachment if possible
                            email_logger.log_warning(f"Google Drive upload failed: {error_msg}. Attempting regular attachment.")
                            if compressed_size > SAFE_MAX_SIZE:
                                reason = f"Attachment too large: {compressed_size} bytes exceeds safe limit of {SAFE_MAX_SIZE} bytes and Google Drive upload failed: {error_msg}"
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
                        # Log error but continue with regular attachment if possible
                        error_message = f"Error using Google Drive for large file: {str(e)}"
                        email_logger.log_error(error_message)
                        
                        # Check if file is too large for regular email
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
                
                # If we didn't use Google Drive and the file exists, attach it to the email
                if attachment_path and not used_gdrive:
                    # Double check size for regular attachment
                    if compressed_size > SAFE_MAX_SIZE:
                        reason = f"Attachment too large: {compressed_size} bytes exceeds safe limit of {SAFE_MAX_SIZE} bytes"
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
                    
                    # Get just the filename for the attachment
                    filename = os.path.basename(attachment_path)
                    
                    with open(attachment_path, 'rb') as file:
                        attach = MIMEApplication(file.read(), _subtype='zip')
                        attach.add_header('Content-Disposition', f'attachment; filename="{filename}"')
                        msg.attach(attach)
            
            # Attach email body as properly formatted HTML
            # Note: This is now done after potential modification with Google Drive link
            html_part = MIMEText(email_body, 'html')
            html_part.add_header('Content-Type', 'text/html; charset=utf-8')
            msg.attach(html_part)
            
            # Connect to SMTP server and send email
            with smtplib.SMTP(self.smtp_server, self.port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
                
            # Log successful email with meaningful success reason
            if used_gdrive:
                success_reason = f"Email successfully sent to {recipient} with Google Drive link to {os.path.basename(attachment_path)} (file size: {compressed_size} bytes)"
            else:
                success_reason = f"Email successfully sent to {recipient}" + (f" with {os.path.basename(attachment_path)}" if attachment_path else "")
                
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
            return True, None
            
        except Exception as e:
            error_message = f"Failed to send email to {recipient}: {str(e)}"
            logger.error(error_message)
            
            # Log the error
            email_logger.log_email_transaction(
                email_id=email_id,
                email=recipient,
                subject=subject,
                file_path=folder_path,
                status="Failed",
                reason=str(e),
                original_size=original_size,
                compressed_size=compressed_size
            )
            
            return False, str(e)
            
    def _get_folder_size(self, folder_path: str) -> int:
        """
        Calculate the total size of a folder in bytes
        
        Args:
            folder_path: Path to the folder
            
        Returns:
            int: Size in bytes
        """
        total_size = 0
        
        if os.path.isfile(folder_path):
            return os.path.getsize(folder_path)
            
        for dirpath, _, filenames in os.walk(folder_path):
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                if os.path.isfile(file_path):
                    total_size += os.path.getsize(file_path)
                    
        return total_size
            
    def _compress_folder(self, folder_path: str) -> Tuple[Optional[str], Optional[int]]:
        """
        Compress a folder and move it to the archive directory
        
        Args:
            folder_path: Path to the folder to compress
            
        Returns:
            Tuple[Optional[str], Optional[int]]: (path_to_compressed_file, size_in_bytes) or (None, None)
        """
        try:
            if not os.path.exists(folder_path):
                logger.error(f"Folder path does not exist: {folder_path}")
                return None, None
                
            folder_name = os.path.basename(folder_path)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            zip_filename = f"{folder_name}_{timestamp}.zip"
            archive_file_path = os.path.join(self.archive_path, zip_filename)
            
            # Create a temporary directory for the compression process
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_zip_path = os.path.join(temp_dir, zip_filename)
                
                # Create the zip file
                with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    # If the source is a file
                    if os.path.isfile(folder_path):
                        zipf.write(folder_path, os.path.basename(folder_path))
                    else:
                        # If the source is a directory, iterate through all files
                        for root, _, files in os.walk(folder_path):
                            for file in files:
                                file_path = os.path.join(root, file)
                                # Preserve the directory structure inside the zip
                                arcname = os.path.relpath(file_path, os.path.dirname(folder_path))
                                zipf.write(file_path, arcname)
                
                # Move the zip file to the archive path
                shutil.move(temp_zip_path, archive_file_path)
                
                # Get the size of the compressed file
                compressed_size = os.path.getsize(archive_file_path)
                
            email_logger.log_info(f"Folder compressed successfully: {archive_file_path}, size: {compressed_size} bytes")
            return archive_file_path, compressed_size
            
        except Exception as e:
            error_msg = f"Failed to compress folder {folder_path}: {str(e)}"
            logger.error(error_msg)
            email_logger.log_error(error_msg)
            return None, None

# Functions to handle email records from the database
def get_email_status_summary() -> Dict[str, int]:
    """
    Get a summary count of emails by status
    
    Returns:
        Dict with counts for each status
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        query = f"""
            SELECT Email_Status, COUNT(*) as Count
            FROM {settings.EMAIL_TABLE}
            GROUP BY Email_Status
        """
        
        cursor.execute(query)
        
        # Initialize with zeros for all possible statuses
        summary = {
            "total": 0,
            "pending": 0, 
            "success": 0, 
            "failed": 0
        }
        
        # Update with actual counts from database
        for status, count in cursor.fetchall():
            status_lower = status.lower()
            if status_lower in summary:
                summary[status_lower] = count
                summary["total"] += count
        
        return summary
        
    except Exception as e:
        logger.error(f"Error getting email status summary: {str(e)}")
        email_logger.log_error(f"Error getting email status summary: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


def update_email_status(email_id: int, status: str, reason: Optional[str] = None, 
                       send_date: Optional[datetime] = None, date: Optional[datetime] = None) -> bool:
    """
    Update the status of an email record
    
    Args:
        email_id: ID of the email record
        status: New status value
        reason: Optional reason for the status update (e.g., error message)
        send_date: Optional date when the email was sent (for Email_Send_Date column)
        date: Optional date for the Date column update timestamp
    
    Returns:
        bool: True if update was successful
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        settings = get_settings()
        
        # Check which dates are provided
        current_time = datetime.now()
        parameters = [status, reason]
        
        # Build the update query based on which parameters are provided
        update_parts = ["Email_Status = ?", "Reason = ?"]
        
        # Include Date column update (operation timestamp)
        update_date = date if date is not None else current_time
        update_parts.append("Date = ?")
        parameters.append(update_date)
        
        # Include Email_Send_Date in the update if provided
        if send_date is not None:
            update_parts.append("Email_Send_Date = ?")
            parameters.append(send_date)
            
        # Build the final query
        update_query = f"""
            UPDATE {settings.EMAIL_TABLE}
            SET {", ".join(update_parts)}
            WHERE Email_ID = ?
        """
        
        # Add the email_id to the parameters
        parameters.append(email_id)
        
        # Execute the update
        cursor.execute(update_query, parameters)
        conn.commit()
        
        email_logger.log_info(f"Updated email ID {email_id} status to {status}" + 
                             (f" with reason: {reason}" if reason else ""))
        
        return cursor.rowcount > 0
        
    except Exception as e:
        error_msg = f"Error updating email status: {str(e)}"
        logger.error(error_msg)
        email_logger.log_error(error_msg)
        return False
    finally:
        if 'conn' in locals():
            conn.close()
