"""
Google Drive client for file operations.

This module provides a high-level interface for Google Drive operations,
composing authentication and file operations into a unified client.
"""

import logging
from typing import Optional, Tuple
from .authentication import GoogleDriveAuthenticator
from .file_operations import GoogleDriveFileOperations

logger = logging.getLogger(__name__)


class GoogleDriveClient:
    """Main Google Drive client using composition pattern for authentication and file operations"""
    
    def __init__(self, credentials_file: Optional[str] = None, token_file: Optional[str] = None):
        """
        Initialize the Google Drive client with credentials
        
        Args:
            credentials_file: Path to the Google OAuth 2.0 client credentials JSON file
            token_file: Path to the token pickle file
        """
        self.authenticator = GoogleDriveAuthenticator(credentials_file, token_file)
        self.file_operations = None
        self.drive_service = None
        
        # Try to authenticate on initialization, but don't fail if it doesn't work
        try:
            self.authenticate()
        except Exception as e:
            logger.warning(f"Initial authentication attempt failed: {str(e)}")
        
    def authenticate(self) -> bool:
        """
        Authenticate with Google Drive API using OAuth 2.0
        
        Returns:
            bool: True if authentication was successful
        """
        self.drive_service = self.authenticator.authenticate()
        if self.drive_service:
            self.file_operations = GoogleDriveFileOperations(self.drive_service)
            return True
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
        if not self.file_operations:
            if not self.authenticate():
                return False, None, "Failed to authenticate with Google Drive"
        
        return self.file_operations.upload_file(file_path, folder_id)
    
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
        if not self.file_operations:
            if not self.authenticate():
                return False, None, "Failed to authenticate with Google Drive"
        
        return self.file_operations.generate_shareable_link(file_id, share_type, recipient_email)
    
    @property
    def is_authenticated(self) -> bool:
        """Check if we're authenticated with Google Drive"""
        return self.drive_service is not None
    
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
        if not self.file_operations:
            if not self.authenticate():
                return False, None, "Failed to authenticate with Google Drive"
        
        return self.file_operations.upload_and_get_link(file_path, folder_id, share_type, recipient_email)
