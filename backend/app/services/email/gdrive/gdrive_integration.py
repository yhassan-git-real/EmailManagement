import os
import logging
from typing import Tuple, Optional, Any, Union, List

from ....utils.email_logger import email_logger
from ....utils.file_utils import format_file_size

try:
    from ...gdrive_service import GoogleDriveService
    GDRIVE_AVAILABLE = True
    email_logger.log_info("Google Drive service is available for large file uploads.")
except ImportError:
    GDRIVE_AVAILABLE = False
    email_logger.log_warning("Google Drive service not available. Large file uploads will not be possible.")

logger = logging.getLogger(__name__)

MB_TO_BYTES = 1024 * 1024

EMAIL_MAX_SIZE_MB = int(os.environ.get('EMAIL_MAX_SIZE_MB', 25))
GMAIL_MAX_SIZE = EMAIL_MAX_SIZE_MB * MB_TO_BYTES

EMAIL_SAFE_SIZE_MB = int(os.environ.get('EMAIL_SAFE_SIZE_MB', 20))
SAFE_MAX_SIZE = EMAIL_SAFE_SIZE_MB * MB_TO_BYTES

GDRIVE_UPLOAD_THRESHOLD_MB = int(os.environ.get('GDRIVE_UPLOAD_THRESHOLD_MB', 20))
GDRIVE_UPLOAD_THRESHOLD = GDRIVE_UPLOAD_THRESHOLD_MB * MB_TO_BYTES

logger.info(f"Email size limits: Max={EMAIL_MAX_SIZE_MB}MB, Safe={EMAIL_SAFE_SIZE_MB}MB, GDrive threshold={GDRIVE_UPLOAD_THRESHOLD_MB}MB")

class GDriveIntegration:
    def __init__(self):
        self.gdrive_available = GDRIVE_AVAILABLE
    
    def check_gdrive_availability(self) -> Tuple[bool, str]:
        """Check if Google Drive is available for uploading"""
        return GDRIVE_AVAILABLE, "Google Drive service not imported"
    
    def handle_large_file_upload(self, attachment_path: str, gdrive_share_type: str = 'anyone', 
                                specific_emails: Optional[Union[List[str], str]] = None, 
                                recipient: str = None) -> Tuple[bool, Optional[str], Optional[str]]:
        """Handle large file upload via Google Drive"""
        if not self.gdrive_available:
            return False, None, "Google Drive service not available"
        
        try:
            gdrive = GoogleDriveService()
            logger.info("Using Google Drive account for file upload")
            
            file_size_bytes = os.path.getsize(attachment_path)
            file_size_formatted = format_file_size(file_size_bytes)
            file_name = os.path.basename(attachment_path)
            
            email_logger.log_info(f"Preparing to upload large file ({file_size_formatted}) to Google Drive...")
            
            if gdrive_share_type == 'restricted':
                upload_success, drive_link, error_msg = gdrive.upload_and_get_link(
                    attachment_path, 
                    share_type='restricted',
                    recipient_email=recipient
                )
                email_logger.log_info(f"Shared file with restricted access to {recipient}")
            elif gdrive_share_type == 'specific' and specific_emails:
                upload_success, drive_link, error_msg = gdrive.upload_and_get_link(
                    attachment_path,
                    share_type='restricted',
                    recipient_email=recipient
                )
                
                if upload_success and drive_link:
                    email_list = []
                    if isinstance(specific_emails, str):
                        email_list = [email.strip() for email in specific_emails.split(',') if email.strip()]
                    elif isinstance(specific_emails, list):
                        email_list = specific_emails
                    
                    for email in email_list:
                        if email != recipient:
                            try:
                                file_id = drive_link.split('/')[-2]
                                permission = {
                                    'type': 'user',
                                    'role': 'reader',
                                    'emailAddress': email
                                }
                                gdrive.drive_service.permissions().create(
                                    fileId=file_id,
                                    body=permission
                                ).execute()
                                email_logger.log_info(f"Added specific access for {email}")
                            except Exception as e:
                                email_logger.log_warning(f"Failed to share with {email}: {str(e)}")
            else:
                upload_success, drive_link, error_msg = gdrive.upload_and_get_link(attachment_path)
            
            if upload_success and drive_link:
                file_name = os.path.basename(attachment_path)
                success_message = f"✅ File '{file_name}' ({file_size_formatted}) successfully uploaded to Google Drive and linked in email"  
                email_logger.log_info(success_message)
                return True, drive_link, success_message
            else:
                return False, None, error_msg
                
        except Exception as e:
            error_message = f"Error using Google Drive for large file: {str(e)}"
            email_logger.log_error(error_message)
            return False, None, error_message
    
    def create_drive_link_html(self, gdrive_link: str, attachment_path: str) -> str:
        """Create Gmail-style Drive attachment HTML"""
        file_name = os.path.basename(attachment_path)
        file_extension = os.path.splitext(file_name)[1].lower()
        
        if file_extension in ['.zip', '.rar', '.tar', '.gz']:
            icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_10_generic_list.png"
        elif file_extension in ['.pdf']:
            icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_pdf_list.png"
        elif file_extension in ['.doc', '.docx']:
            icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_word_list.png"
        elif file_extension in ['.xls', '.xlsx']:
            icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_excel_list.png"
        elif file_extension in ['.ppt', '.pptx']:
            icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_powerpoint_list.png"
        else:
            icon_url = "https://ssl.gstatic.com/docs/doclist/images/icon_11_document_list.png"
        
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
        return link_html
