import os
import logging
import pickle
from typing import Optional
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from ....core.config import get_settings
from ....utils.email_logger import email_logger

logger = logging.getLogger(__name__)


class GoogleDriveAuthenticator:
    """Handles Google Drive OAuth 2.0 authentication and token management"""
    
    def __init__(self, credentials_file: Optional[str] = None, token_file: Optional[str] = None):
        """
        Initialize the authenticator with credential and token file paths
        
        Args:
            credentials_file: Path to the Google OAuth 2.0 client credentials JSON file
            token_file: Path to the token pickle file
        """
        # Get settings for default paths
        settings = get_settings()
        
        # Use environment variables or provided paths for credentials and token
        self.credentials_file = credentials_file or os.environ.get('GDRIVE_CREDENTIALS_FILE', settings.GDRIVE_CREDENTIALS_PATH)
        self.token_file = token_file or os.environ.get('GDRIVE_TOKEN_FILE', settings.GDRIVE_TOKEN_PATH)
        
    def authenticate(self) -> Optional[object]:
        """
        Authenticate with Google Drive API using OAuth 2.0
        This method securely handles authentication to Google Drive.
        
        Returns:
            Google Drive service object if authentication was successful, None otherwise
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
                    return None
            
            # If no valid credentials available, try to refresh or require manual login
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    try:
                        logger.info("Refreshing expired credentials...")
                        creds.refresh(Request())
                    except Exception as e:
                        logger.error(f"Failed to refresh credentials: {str(e)}")
                        email_logger.log_error(f"Failed to refresh Google Drive credentials: {str(e)}")
                        return None
                else:
                    # Check if this is a server environment (no interactive login possible)
                    if not os.environ.get('DISPLAY') and not os.name == 'nt':
                        logger.error("Cannot perform interactive login in headless environment")
                        email_logger.log_error("Google Drive authentication failed: Cannot perform interactive login in headless environment")
                        return None
                    
                    if not os.path.exists(self.credentials_file):
                        creds_path = os.path.abspath(self.credentials_file)
                        error_msg = f"OAuth credentials file not found at {creds_path}"
                        fallback_msg = "Will attempt to use direct email attachment instead."
                        
                        logger.error(f"{error_msg} - {fallback_msg}")
                        email_logger.log_warning(f"⚠️ Google Drive auth: {error_msg} - {fallback_msg}")
                        return None
                    
                    # Skip interactive auth in server environments
                    server_env = os.environ.get('SERVER_ENV', '').lower() == 'true'
                    if server_env:
                        logger.warning("Running in server environment, skipping interactive OAuth flow")
                        email_logger.log_warning("⚠️ Server environment detected - skipping Google Drive interactive auth")
                        return None
                        
                    try:    
                        logger.info("Starting OAuth flow for Google Drive authentication...")
                        email_logger.log_info("Starting Google Drive OAuth authentication flow - this may open a browser window")
                        flow = InstalledAppFlow.from_client_secrets_file(
                            self.credentials_file, 
                            ['https://www.googleapis.com/auth/drive']
                        )
                        creds = flow.run_local_server(port=0)
                        logger.info("OAuth flow completed successfully")
                    except Exception as e:
                        logger.error(f"OAuth flow failed: {str(e)}")
                        email_logger.log_error(f"Google Drive authentication failed: OAuth flow error: {str(e)}")
                        return None
                
                # Save the credentials securely for the next run
                try:
                    # Ensure credentials directory exists
                    os.makedirs(os.path.dirname(self.token_file), exist_ok=True)
                    
                    with open(self.token_file, 'wb') as token:
                        pickle.dump(creds, token)
                    logger.info(f"Credentials saved to {self.token_file}")
                    
                    # Set more restrictive permissions on Windows if possible
                    self._set_file_permissions()
                    
                except Exception as e:
                    logger.error(f"Failed to save credentials: {str(e)}")
                    email_logger.log_error(f"Failed to save Google Drive credentials: {str(e)}")
                    # We can still continue with the current session even if saving fails
            
            # Build the Drive service
            drive_service = build('drive', 'v3', credentials=creds)
            
            # Verify the authentication works by making a simple API call
            try:
                about = drive_service.about().get(fields="user").execute()
                email = about.get('user', {}).get('emailAddress')
                logger.info(f"Successfully authenticated with Google Drive as {email}")
                email_logger.log_info(f"Successfully authenticated with Google Drive as {email}")
                return drive_service
            except Exception as e:
                logger.error(f"Authentication verification failed: {str(e)}")
                email_logger.log_error(f"Google Drive authentication verification failed: {str(e)}")
                return None
            
        except Exception as e:
            logger.error(f"Failed to authenticate with Google Drive: {str(e)}")
            return None
    
    def _set_file_permissions(self):
        """Set restrictive permissions on the token file (Windows-specific)"""
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
