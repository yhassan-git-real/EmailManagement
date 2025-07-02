import os
import logging
import pickle
from typing import Optional, Tuple
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from ..core.config import get_settings
from ..utils.email_logger import email_logger

logger = logging.getLogger(__name__)

class GoogleDriveService:
    """Service class for Google Drive operations using OAuth 2.0 authentication with your Google account"""
    
    def __init__(self, credentials_file: Optional[str] = None, token_file: Optional[str] = None):
        """
        Initialize the Google Drive service with credentials
        
        Args:
            credentials_file: Path to the Google OAuth 2.0 client credentials JSON file
            token_file: Path to the token pickle file
        """
        # Default paths
        self.credentials_file = credentials_file or os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 
                                                             "credentials", "oauth_credentials.json")
        self.token_file = token_file or os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 
                                                 "credentials", "token.pickle")
        self.drive_service = None
        
    def authenticate(self) -> bool:
        """
        Authenticate with Google Drive API using OAuth 2.0
        This method securely handles authentication to Google Drive.
        
        Returns:
            bool: True if authentication was successful
        """
        try:
            creds = None
            
            # Check if token file exists and validate its permissions
            if os.path.exists(self.token_file):
                # Check file permissions (Windows doesn't have the same permission system as Unix)
                # but we can ensure the file is readable
                try:
                    with open(self.token_file, 'rb') as token:
                        creds = pickle.load(token)
                    logger.info(f"Successfully loaded credentials from {self.token_file}")
                except (PermissionError, pickle.UnpicklingError) as e:
                    logger.error(f"Error loading token file: {str(e)}")
                    return False
            
            # If no valid credentials available, try to refresh or require manual login
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    try:
                        logger.info("Refreshing expired credentials...")
                        creds.refresh(Request())
                    except Exception as e:
                        logger.error(f"Failed to refresh credentials: {str(e)}")
                        email_logger.log_error(f"Failed to refresh Google Drive credentials: {str(e)}")
                        return False
                else:
                    # Check if this is a server environment (no interactive login possible)
                    if not os.environ.get('DISPLAY') and not os.name == 'nt':
                        logger.error("Cannot perform interactive login in headless environment")
                        email_logger.log_error("Google Drive authentication failed: Cannot perform interactive login in headless environment")
                        return False
                        
                    if not os.path.exists(self.credentials_file):
                        logger.error(f"OAuth credentials file not found at {self.credentials_file}")
                        email_logger.log_error(f"Google Drive authentication failed: OAuth credentials file not found at {self.credentials_file}")
                        return False
                    
                    try:    
                        logger.info("Starting OAuth flow for Google Drive authentication...")
                        flow = InstalledAppFlow.from_client_secrets_file(
                            self.credentials_file, 
                            ['https://www.googleapis.com/auth/drive']
                        )
                        creds = flow.run_local_server(port=0)
                        logger.info("OAuth flow completed successfully")
                    except Exception as e:
                        logger.error(f"OAuth flow failed: {str(e)}")
                        email_logger.log_error(f"Google Drive authentication failed: OAuth flow error: {str(e)}")
                        return False
                
                # Save the credentials securely for the next run
                try:
                    # Ensure credentials directory exists
                    os.makedirs(os.path.dirname(self.token_file), exist_ok=True)
                    
                    with open(self.token_file, 'wb') as token:
                        pickle.dump(creds, token)
                    logger.info(f"Credentials saved to {self.token_file}")
                    
                    # Set more restrictive permissions on Windows if possible
                    if os.name == 'nt':
                        try:
                            import win32security
                            import ntsecuritycon as con
                            import win32con
                            # Get current username
                            username = os.environ.get('USERNAME')
                            if username:
                                # Get security descriptor
                                sd = win32security.GetFileSecurity(self.token_file, win32security.DACL_SECURITY_INFORMATION)
                                # Get DACL from security descriptor
                                dacl = sd.GetSecurityDescriptorDacl()
                                # Clear all ACEs
                                for i in range(dacl.GetAceCount()):
                                    dacl.DeleteAce(0)
                                # Add new ACE for current user
                                user, domain, type = win32security.LookupAccountName(None, username)
                                dacl.AddAccessAllowedAce(win32security.ACL_REVISION, con.FILE_ALL_ACCESS, user)
                                # Set DACL in security descriptor
                                sd.SetSecurityDescriptorDacl(1, dacl, 0)
                                # Apply security descriptor to file
                                win32security.SetFileSecurity(self.token_file, win32security.DACL_SECURITY_INFORMATION, sd)
                                logger.info(f"Set restrictive permissions on {self.token_file} for user {username}")
                        except ImportError:
                            logger.warning("Windows security modules not available, skipping permission restrictions")
                        except Exception as e:
                            logger.warning(f"Failed to set restrictive permissions on token file: {str(e)}")
                except Exception as e:
                    logger.error(f"Failed to save credentials: {str(e)}")
                    email_logger.log_error(f"Failed to save Google Drive credentials: {str(e)}")
                    # We can still continue with the current session even if saving fails
            
            # Build the Drive service
            self.drive_service = build('drive', 'v3', credentials=creds)
            
            # Verify the authentication works by making a simple API call
            try:
                about = self.drive_service.about().get(fields="user").execute()
                email = about.get('user', {}).get('emailAddress')
                logger.info(f"Successfully authenticated with Google Drive as {email}")
                email_logger.log_info(f"Successfully authenticated with Google Drive as {email}")
                return True
            except Exception as e:
                logger.error(f"Authentication verification failed: {str(e)}")
                email_logger.log_error(f"Google Drive authentication verification failed: {str(e)}")
                return False
            
        except Exception as e:
            logger.error(f"Failed to authenticate with Google Drive: {str(e)}")
            return False
    
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
        if not self.drive_service:
            if not self.authenticate():
                return False, None, "Failed to authenticate with Google Drive"
        
        try:
            file_name = os.path.basename(file_path)
            file_metadata = {'name': file_name}
            
            # Check if environment variable has folder ID
            settings = get_settings()
            env_folder_id = settings.GDRIVE_FOLDER_ID
            
            # Debug logging for folder ID
            logger.info(f"GDrive Upload - File: {file_name}, Size: {os.path.getsize(file_path)} bytes")
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
            logger.info(f"Successfully uploaded file {file_name} to Google Drive with ID: {file_id}")
            
            return True, file_id, None
            
        except Exception as e:
            error_message = f"Failed to upload file to Google Drive: {str(e)}"
            logger.error(error_message)
            return False, None, error_message
    
    def generate_shareable_link(self, file_id: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Generate a shareable link for a file in Google Drive
        
        Args:
            file_id: ID of the file in Google Drive
            
        Returns:
            Tuple[bool, Optional[str], Optional[str]]: 
                (success, shareable_link if successful, error message if failed)
        """
        if not self.drive_service:
            if not self.authenticate():
                return False, None, "Failed to authenticate with Google Drive"
        
        try:
            # Update permissions to make the file accessible via link
            permission = {
                'type': 'anyone',
                'role': 'reader'
            }
            
            self.drive_service.permissions().create(
                fileId=file_id,
                body=permission
            ).execute()
            
            # Get the file to construct the direct download link
            file = self.drive_service.files().get(
                fileId=file_id,
                fields='webContentLink,webViewLink'
            ).execute()
            
            # Prefer webContentLink (direct download) if available, otherwise use webViewLink
            shareable_link = file.get('webContentLink', file.get('webViewLink'))
            
            if not shareable_link:
                return False, None, "Failed to generate shareable link"
                
            logger.info(f"Generated shareable link for file ID {file_id}")
            return True, shareable_link, None
            
        except Exception as e:
            error_message = f"Failed to generate shareable link: {str(e)}"
            logger.error(error_message)
            return False, None, error_message
    
    def upload_and_get_link(self, file_path: str, folder_id: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Upload a file to Google Drive and generate a shareable link
        
        Args:
            file_path: Path to the file to upload
            folder_id: Optional folder ID to upload to (root folder if None)
            
        Returns:
            Tuple[bool, Optional[str], Optional[str]]: 
                (success, shareable_link if successful, error message if failed)
        """
        # Upload the file
        upload_success, file_id, upload_error = self.upload_file(file_path, folder_id)
        
        if not upload_success:
            return False, None, upload_error
        
        # Generate shareable link
        link_success, shareable_link, link_error = self.generate_shareable_link(file_id)
        
        if not link_success:
            return False, None, link_error
        
        return True, shareable_link, None
