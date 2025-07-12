import os
import logging
from typing import Optional, Tuple
from googleapiclient.http import MediaFileUpload
from ....core.config import get_settings
from ....utils.email_logger import email_logger
from ....utils.file_utils import get_formatted_file_size

logger = logging.getLogger(__name__)


class GoogleDriveFileOperations:
    """Handles Google Drive file operations including upload and link generation"""
    
    def __init__(self, drive_service):
        """
        Initialize file operations with a Google Drive service
        
        Args:
            drive_service: Authenticated Google Drive service object
        """
        self.drive_service = drive_service
    
    def upload_file(self, file_path: str, folder_id: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Upload a file to Google Drive
        
        Args:
            file_path: Path to the file to upload
            folder_id: Optional folder ID to upload to (root folder if None)
            
        Returns:
            Tuple[bool, Optional[str], Optional[str]]: 
                (success, file_id if successful, error message if failed)
        """
        try:
            file_name = os.path.basename(file_path)
            file_metadata = {'name': file_name}
            
            # Check if environment variable has folder ID
            settings = get_settings()
            env_folder_id = settings.GDRIVE_FOLDER_ID
            
            # Get file size and format it
            size_bytes, formatted_size = get_formatted_file_size(file_path)
            
            # Log that we're beginning the upload process
            upload_message = f"Starting upload of {file_name} ({formatted_size}) to Google Drive..."
            logger.info(upload_message)
            email_logger.log_info(upload_message)
            
            # Debug logging for folder ID
            logger.info(f"GDrive Upload - File: {file_name}, Size: {formatted_size} ({size_bytes} bytes)")
            logger.info(f"GDrive Upload - Param folder_id: {folder_id}")
            logger.info(f"GDrive Upload - Env folder_id: {env_folder_id}")
            
            # Use environment folder ID if available, otherwise use passed parameter
            if env_folder_id and env_folder_id.strip():
                logger.info(f"GDrive Upload - Using folder ID from environment: {env_folder_id}")
                file_metadata['parents'] = [env_folder_id]
            elif folder_id:
                logger.info(f"GDrive Upload - Using passed folder ID: {folder_id}")
                file_metadata['parents'] = [folder_id]
            else:
                logger.info("GDrive Upload - No folder ID specified, using root folder")
            
            # Create media file upload object
            media = MediaFileUpload(
                file_path,
                mimetype='application/zip',
                resumable=True
            )
            
            # Execute the upload
            file = self.drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            
            file_id = file.get('id')
            success_message = f"Successfully uploaded file {file_name} ({formatted_size}) to Google Drive with ID: {file_id}"
            logger.info(success_message)
            email_logger.log_info(f"Upload complete: {file_name} successfully uploaded to Google Drive")
            
            return True, file_id, None
            
        except Exception as e:
            error_message = f"Failed to upload file to Google Drive: {str(e)}"
            logger.error(error_message)
            return False, None, error_message
    
    def generate_shareable_link(self, file_id: str, share_type: str = 'anyone', recipient_email: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Generate a shareable link for a file in Google Drive with specified permissions
        
        Args:
            file_id: ID of the file in Google Drive
            share_type: Type of sharing permission ('anyone', 'restricted', or 'specific')
            recipient_email: Email address of the recipient (used for 'restricted' or 'specific' share_type)
            
        Returns:
            Tuple[bool, Optional[str], Optional[str]]: 
                (success, shareable_link if successful, error message if failed)
        """
        try:
            # Update permissions based on the specified share_type
            if share_type == 'restricted' and recipient_email:
                # Only the specific recipient can access the file
                permission = {
                    'type': 'user',
                    'role': 'reader',
                    'emailAddress': recipient_email
                }
                logger.info(f"Setting restricted access for file {file_id} to {recipient_email}")
            elif share_type == 'specific' and recipient_email:
                # The specific recipient can access the file and can share with others
                # First, add the specific recipient
                permission = {
                    'type': 'user',
                    'role': 'reader',
                    'emailAddress': recipient_email
                }
                logger.info(f"Setting specific access for file {file_id} to {recipient_email}")
            else:
                # Default: Anyone with the link can access the file
                permission = {
                    'type': 'anyone',
                    'role': 'reader'
                }
                logger.info(f"Setting 'anyone with the link' access for file {file_id}")
            
            self.drive_service.permissions().create(
                fileId=file_id,
                body=permission
            ).execute()
            
            # Get the file to construct the shareable link
            file = self.drive_service.files().get(
                fileId=file_id,
                fields='webContentLink,webViewLink'
            ).execute()
            
            # Prefer webViewLink (shows file in Drive interface) over webContentLink (direct download)
            # This provides a better user experience similar to Gmail attachments, showing the file in Drive UI
            # rather than triggering the "Google Drive can't scan this file for viruses" warning
            shareable_link = file.get('webViewLink', file.get('webContentLink'))
            
            if not shareable_link:
                return False, None, "Failed to generate shareable link"
                
            logger.info(f"Generated shareable link for file ID {file_id}")
            return True, shareable_link, None
            
        except Exception as e:
            error_message = f"Failed to generate shareable link: {str(e)}"
            logger.error(error_message)
            return False, None, error_message
    
    def upload_and_get_link(self, file_path: str, folder_id: Optional[str] = None, share_type: str = 'anyone', recipient_email: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Upload a file to Google Drive and generate a shareable link with specified permissions
        
        Args:
            file_path: Path to the file to upload
            folder_id: Optional folder ID to upload to (root folder if None)
            share_type: Type of sharing permission ('anyone', 'restricted', or 'specific')
            recipient_email: Email address of the recipient (used for 'restricted' or 'specific' share_type)
            
        Returns:
            Tuple[bool, Optional[str], Optional[str]]: 
                (success, shareable_link if successful, error message if failed)
        """
        # Get file size for logging
        size_bytes, formatted_size = get_formatted_file_size(file_path)
        file_name = os.path.basename(file_path)
        
        # Log the overall process beginning
        process_start_message = f"Processing large file {file_name} ({formatted_size}) for Google Drive upload and sharing"
        logger.info(process_start_message)
        email_logger.log_info(process_start_message)
        
        # Upload the file
        upload_success, file_id, upload_error = self.upload_file(file_path, folder_id)
        
        if not upload_success:
            return False, None, upload_error
        
        # Log progress
        email_logger.log_info(f"Generating shareable link for {file_name}...")
        
        # Generate shareable link with specified sharing permissions
        link_success, shareable_link, link_error = self.generate_shareable_link(file_id, share_type, recipient_email)
        
        if not link_success:
            return False, None, link_error
        
        # Log completion of the entire process - only to internal logger, not email_logger
        # This prevents duplicate messages as email_sender.py also logs a success message
        complete_message = f"File {file_name} ({formatted_size}) successfully uploaded and shared on Google Drive"
        logger.info(complete_message)
        
        return True, shareable_link, None
