# Google Drive Integration Setup

This folder contains the necessary files for Google Drive integration with the Email Management system, used for handling large file attachments (over 20MB).

## Overview

For comprehensive setup instructions, please refer to the detailed setup guide:

- [Google Drive Integration Setup Guide](../docs/GOOGLE_DRIVE_SETUP.md)

## Files in this Directory

- `oauth_credentials.json` - OAuth credentials for personal Google account authentication
- `gdrive_credentials.json` - Service account credentials (alternative method)
- `token.pickle` - Authentication token generated during setup
- `setup_gdrive_oauth.py` - Script to set up OAuth authentication

## Security Considerations

- The credential files contain sensitive information. Ensure they are properly secured.
- Consider adding them to your `.gitignore` file to prevent them from being committed to version control.
- Regularly rotate the credentials for enhanced security.
