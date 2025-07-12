"""
Google Drive storage module

This module provides Google Drive integration with a refactored structure:
- authentication.py: Handles OAuth 2.0 authentication
- file_operations.py: Handles file uploads and link generation
- gdrive_client.py: Main client using composition pattern

For backward compatibility, GoogleDriveClient is exported as GoogleDriveService.
"""

from .gdrive_client import GoogleDriveClient
from .authentication import GoogleDriveAuthenticator
from .file_operations import GoogleDriveFileOperations

# Backward compatibility - export GoogleDriveClient as GoogleDriveService
GoogleDriveService = GoogleDriveClient

__all__ = [
    'GoogleDriveClient',
    'GoogleDriveService',  # Backward compatibility
    'GoogleDriveAuthenticator',
    'GoogleDriveFileOperations'
]
