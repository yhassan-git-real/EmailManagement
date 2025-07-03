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
from ..utils.file_utils import format_file_size

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

def format_size(size_bytes):
    """Format size in bytes to a human-readable string (KB, MB, GB)"""
    if size_bytes < 1024:
        return f"{size_bytes} bytes"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"

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
            # Validate recipient email address
            is_valid, error_reason = self._validate_email(recipient)
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
                
            # Check SMTP connectivity before proceeding
            is_connected, error_reason = self._check_smtp_connection()
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
            
            if folder_path:
                # First validate the attachment path
                is_valid, error_reason = self._validate_attachment_path(folder_path)
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
                
                # Get original folder size
                original_size = self._get_folder_size(folder_path)
                
                # Compress the folder
                attachment_path, compressed_size = self._compress_folder(folder_path)
                
                # Verify compression was successful
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
                
                # If file exists and is larger than threshold, try to use Google Drive
                if attachment_path and compressed_size > GDRIVE_UPLOAD_THRESHOLD:
                    # Check GDrive availability before attempting to use it
                    is_available, gdrive_error = self._check_gdrive_availability()
                    
                    if not is_available:
                        email_logger.log_warning(f"Google Drive not available: {gdrive_error}. Will try regular attachment.")
                        # We don't fail here, we'll try regular attachment instead
                    else:
                        try:
                            # Initialize Google Drive service
                            gdrive = GoogleDriveService()
                            logger.info("Using Google Drive account for file upload")
                            
                            # Log that we're starting the Google Drive upload process
                            file_size_bytes = os.path.getsize(attachment_path)
                            file_size_formatted = format_file_size(file_size_bytes)
                            file_name = os.path.basename(attachment_path)
                            
                            email_logger.log_info(f"Preparing to upload large file ({file_size_formatted}) to Google Drive...")
                            
                            # Upload file to Google Drive and get shareable link
                            upload_success, drive_link, error_msg = gdrive.upload_and_get_link(attachment_path)
                            
                            if upload_success and drive_link:
                                # If successful, add the link to the email body
                                gdrive_link = drive_link
                                used_gdrive = True
                                
                                # Log success with size information
                                success_message = f"Large file ({file_size_formatted}) uploaded to Google Drive - Link added to email"
                                email_logger.log_info(f"SUCCESS: {success_message}")
                                
                                # Append download link information to the email body in Gmail Drive attachment style
                                file_name = os.path.basename(attachment_path)
                                formatted_size = format_size(os.path.getsize(attachment_path))
                                
                                # Determine proper icon based on file extension
                                file_extension = os.path.splitext(file_name)[1].lower()
                                if file_extension in ['.zip', '.rar', '.tar', '.gz']:
                                    # Archive file icon
                                    icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_10_generic_list.png"
                                elif file_extension in ['.pdf']:
                                    # PDF file icon
                                    icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_pdf_list.png"
                                elif file_extension in ['.doc', '.docx']:
                                    # Word document icon
                                    icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_word_list.png"
                                elif file_extension in ['.xls', '.xlsx']:
                                    # Excel spreadsheet icon
                                    icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_excel_list.png"
                                elif file_extension in ['.ppt', '.pptx']:
                                    # PowerPoint presentation icon
                                    icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_powerpoint_list.png"
                                else:
                                    # Default document icon
                                    icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_document_list.png"
                                
                                # Create Gmail-style Drive attachment HTML with precise alignment to match Gmail's native chips
                                link_html = f"""
                                <div style="margin: 6px 0px;">
                                    <div class="gmail_chip gmail_drive_chip" style="width: 386px; height: 20px; max-height: 20px; background-color: rgb(245,245,245); padding: 10px; font-size: 14px; line-height: 20px; font-family: 'Google Sans', Roboto, Arial, sans-serif; border: 1px solid rgb(221,221,221);">
                                        <a href="{gdrive_link}" style="color: rgb(32,33,36); display: inline-block; max-width: 356px; overflow: hidden; text-overflow: ellipsis; text-decoration: none; border: none;">
                                            <img src="{icon_url}" style="vertical-align: text-bottom; border: none; padding-right: 10px; height: 20px; width: 20px;" alt="File icon">
                                            <span dir="ltr" style="vertical-align: bottom; text-decoration: none; display: inline-block; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{file_name}</span>
                                        </a>
                                    </div>
                                </div>
                                """
                                
                                # Add link to email body
                                email_body += link_html
                                
                                formatted_size = format_size(compressed_size)
                                success_reason = f"SUCCESS: Large file ({formatted_size}) uploaded to Google Drive - Link added to email"
                                email_logger.log_info(success_reason)
                            else:
                                # If Google Drive upload failed, fall back to regular attachment if possible
                                email_logger.log_warning(f"Google Drive upload failed: {error_msg}. Attempting regular attachment.")
                                if compressed_size > SAFE_MAX_SIZE:
                                    reason = f"ERROR: File too large ({format_size(compressed_size)}) - GDrive upload failed: {error_msg}"
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
                        formatted_size = format_size(compressed_size)
                        safe_limit = format_size(SAFE_MAX_SIZE)
                        reason = f"ERROR: Attachment too large ({formatted_size}) - exceeds limit of {safe_limit}"
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
            
            # Create a more descriptive and formatted reason
            error_type = e.__class__.__name__
            error_details = str(e)
            formatted_reason = f"ERROR: {error_type} - {error_details}"
            
            # Log the error
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
    
    def send_email_with_validation(self, 
                               recipient: str, 
                               subject: str, 
                               body: str, 
                               folder_path: Optional[str] = None,
                               sender: Optional[str] = None,
                               email_id: Optional[int] = None,
                               validate_mapping: bool = True) -> Tuple[bool, Optional[str]]:
        """
        Send an email with full validation before compression and sending
        
        This method performs all validations first before any resource-intensive operations.
        It validates recipient email, folder path, SMTP connection, and optionally recipient mapping.
        
        Args:
            recipient: Recipient email address
            subject: Email subject
            body: Email body content (HTML)
            folder_path: Path to folder that should be compressed and attached
            sender: Sender email address (defaults to SMTP username)
            email_id: Database ID of the email record for logging
            validate_mapping: Whether to validate recipient mapping against database
            
        Returns:
            Tuple[bool, Optional[str]]: (success, reason_if_failed)
        """
        try:
            # STEP 1: Validate recipient email address
            is_valid, error_reason = self._validate_email(recipient)
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
                
            # STEP 2: Check SMTP connectivity before proceeding
            is_connected, error_reason = self._check_smtp_connection()
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
                
            # STEP 3: Validate the attachment path if provided
            if folder_path:
                is_valid, error_reason = self._validate_attachment_path(folder_path)
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
                    
            # STEP 4: Validate recipient mapping against database if requested
            if validate_mapping and email_id is not None:
                # Import here to avoid circular imports
                from ..services.automation_service import _validate_recipient_mapping
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
                
            # STEP 5: If we need Google Drive, validate its availability
            if folder_path:
                # Get original folder size to determine if we might need GDrive
                original_size = self._get_folder_size(folder_path)
                if original_size > GDRIVE_UPLOAD_THRESHOLD:
                    is_available, gdrive_error = self._check_gdrive_availability()
                    # Just log this as a warning, we'll try normal attachment if GDrive fails
                    if not is_available:
                        email_logger.log_warning(f"Google Drive not available: {gdrive_error}. Will try regular attachment.")
            
            # Now that all validations have passed, proceed with the actual sending
            return self.send_email(recipient, subject, body, folder_path, sender, email_id)
                
        except Exception as e:
            error_message = f"Failed to validate email: {str(e)}"
            logger.error(error_message)
            
            # Create a more descriptive and formatted reason
            error_type = e.__class__.__name__
            error_details = str(e)
            formatted_reason = f"ERROR: {error_type} - {error_details}"
            
            # Log the error
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
                error_msg = f"Folder path does not exist for compression: {folder_path}"
                logger.error(error_msg)
                email_logger.log_error(error_msg)
                return None, None
                
            folder_name = os.path.basename(folder_path)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            zip_filename = f"{folder_name}_{timestamp}.zip"
            archive_file_path = os.path.join(self.archive_path, zip_filename)
            
            # Create a temporary directory for the compression process
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_zip_path = os.path.join(temp_dir, zip_filename)
                
                # Create the zip file
                try:
                    with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        # If the source is a file
                        if os.path.isfile(folder_path):
                            zipf.write(folder_path, os.path.basename(folder_path))
                        else:
                            # If the source is a directory, iterate through all files
                            files_found = False
                            for root, _, files in os.walk(folder_path):
                                for file in files:
                                    files_found = True
                                    file_path = os.path.join(root, file)
                                    # Preserve the directory structure inside the zip
                                    arcname = os.path.relpath(file_path, os.path.dirname(folder_path))
                                    zipf.write(file_path, arcname)
                            
                            # Double-check we actually found files
                            if not files_found:
                                error_msg = f"No files found in folder for compression: {folder_path}"
                                logger.error(error_msg)
                                email_logger.log_error(error_msg)
                                return None, None
                except Exception as zip_error:
                    error_msg = f"Error creating zip file for {folder_path}: {str(zip_error)}"
                    logger.error(error_msg)
                    email_logger.log_error(error_msg)
                    return None, None
                
                # Move the zip file to the archive path
                try:
                    shutil.move(temp_zip_path, archive_file_path)
                except Exception as move_error:
                    error_msg = f"Error moving zip file to archive path: {str(move_error)}"
                    logger.error(error_msg)
                    email_logger.log_error(error_msg)
                    return None, None
                
                # Get the size of the compressed file
                try:
                    compressed_size = os.path.getsize(archive_file_path)
                    
                    # Check if compressed file is empty or too small (could indicate compression failure)
                    if compressed_size == 0:
                        error_msg = f"Compressed file is empty: {archive_file_path}"
                        logger.error(error_msg)
                        email_logger.log_error(error_msg)
                        
                        # Clean up the empty file
                        os.remove(archive_file_path)
                        return None, None
                        
                    formatted_size = format_file_size(compressed_size)
                except Exception as size_error:
                    error_msg = f"Error getting compressed file size: {str(size_error)}"
                    logger.error(error_msg)
                    email_logger.log_error(error_msg)
                    return None, None
                
            email_logger.log_info(f"Folder compressed successfully: {archive_file_path}, size: {formatted_size} ({compressed_size} bytes)")
            return archive_file_path, compressed_size
            
        except Exception as e:
            error_msg = f"Failed to compress folder {folder_path}: {str(e)}"
            logger.error(error_msg)
            email_logger.log_error(error_msg)
            return None, None
        
    def _validate_attachment_path(self, folder_path: str) -> Tuple[bool, Optional[str]]:
        """
        Validate that a folder path exists and contains files
        
        Args:
            folder_path: Path to the folder to validate
            
        Returns:
            Tuple[bool, str]: (is_valid, error_reason_if_invalid)
        """
        # Check if folder path is provided
        if not folder_path:
            return False, "No attachment path provided"
            
        # Check if folder exists
        if not os.path.exists(folder_path):
            return False, f"Folder path does not exist: {folder_path}"
            
        # If it's a file, check if it exists and is not empty
        if os.path.isfile(folder_path):
            if os.path.getsize(folder_path) == 0:
                return False, f"Attachment file exists but is empty: {folder_path}"
            return True, None
            
        # If it's a folder, check if it has files
        has_files = False
        for _, _, files in os.walk(folder_path):
            if files:
                has_files = True
                break
                
        if not has_files:
            return False, f"Folder exists but is empty: {folder_path}"
            
        return True, None
    
    def _validate_email(self, email: str) -> Tuple[bool, Optional[str]]:
        """
        Validate email format and content
        
        Args:
            email: Email address to validate
            
        Returns:
            Tuple[bool, str]: (is_valid, error_reason_if_invalid)
        """
        if not email:
            return False, "Email address is empty"
            
        # Simple regex for email validation
        import re
        email_pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        if not email_pattern.match(email):
            return False, f"Invalid email format: {email}"
            
        return True, None

    def _check_smtp_connection(self) -> Tuple[bool, Optional[str]]:
        """
        Verify SMTP server connectivity before attempting to send
        
        Returns:
            Tuple[bool, str]: (is_connected, error_reason_if_not)
        """
        try:
            # Try to connect to the SMTP server
            with smtplib.SMTP(self.smtp_server, self.port, timeout=10) as server:
                if self.use_tls:
                    server.starttls()
                server.ehlo()  # Just say hello, don't login yet
            return True, None
        except Exception as e:
            error_msg = f"Cannot connect to SMTP server: {str(e)}"
            return False, error_msg

    def _check_gdrive_availability(self) -> Tuple[bool, Optional[str]]:
        """
        Verify Google Drive API is available
        
        Returns:
            Tuple[bool, str]: (is_available, error_reason_if_not)
        """
        if not GDRIVE_AVAILABLE:
            return False, "Google Drive service not available"
            
        try:
            # Try to initialize the Google Drive service
            gdrive = GoogleDriveService()
            # Just check if we can initialize it
            return True, None
        except Exception as e:
            error_msg = f"Cannot connect to Google Drive: {str(e)}"
            return False, error_msg

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
