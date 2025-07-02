# Setting Up Personal Google Drive Integration

This document provides comprehensive instructions for setting up Google Drive integration with your personal Google account, allowing you to upload large email attachments (>20MB) directly to your personal Google Drive.

## Why Use Your Personal Google Account?

By using your personal Google account for Drive uploads:

1. **Visibility**: You can see all uploaded files directly in your Google Drive web interface
2. **Management**: You can manage, organize, and delete files more easily
3. **Control**: You have more control over file organization and sharing settings
4. **Storage**: The files count toward your personal Google Drive storage quota, not a separate service account
5. **Security**: You don't need to share folders with a service account

## Detailed Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. At the top of the page, click on the project dropdown menu
3. Click "New Project"
4. Enter a project name (e.g., "EmailManagement")
5. Click "Create"
6. Wait for the project to be created, then select it from the notification or project dropdown

### 2. Enable the Google Drive API

1. In the left sidebar, navigate to "APIs & Services" > "Library"
2. In the search bar, type "Google Drive API"
3. Click on "Google Drive API" in the results
4. Click the blue "Enable" button
5. Wait for the API to be enabled

### 3. Configure OAuth Consent Screen (IMPORTANT)

1. In the left sidebar, navigate to "APIs & Services" > "OAuth consent screen"
2. For User Type, select "External" (unless you're using Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - App name: "EmailManagement App"
   - User support email: Enter your email address
   - Developer contact information: Enter your email address
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Find and select the scope: `https://www.googleapis.com/auth/drive` (allows full Drive access)
8. Click "Update" to add the selected scope
9. Click "Save and Continue"
10. On the Test Users page, click "Add Users"
11. Add your own Google email address
12. Click "Save and Continue"
13. Review your settings and click "Back to Dashboard"

### 4. Create OAuth 2.0 Credentials

1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
2. Click the "+ Create Credentials" button at the top
3. Select "OAuth client ID" from the dropdown menu
4. For Application type, select "Desktop application"
   - If "Desktop application" is not available, select "Other" or "Web application" (and if using "Web application", delete any auto-filled redirect URIs and add `http://localhost` as the redirect URI)
5. Name your client (e.g., "EmailManagement Desktop App")
6. Click "Create"
7. A popup will appear with your client ID and client secret - click "Download JSON"
8. Save the downloaded file as `oauth_credentials.json` in the project's `credentials` folder

### 5. Run the Setup Script

1. Make sure the `oauth_credentials.json` file is in the correct location:
   ```
   EmailManagement/credentials/oauth_credentials.json
   ```
   (This should be in the same directory as the setup_gdrive_oauth.py script)

2. Install the required packages:
   ```
   pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
   ```
   If you're on Windows, also install:
   ```
   pip install pywin32
   ```

3. Run the OAuth setup script from the credentials directory:
   ```
   cd credentials
   python setup_gdrive_oauth.py
   ```
   
   Or run it from the project root directory with:
   ```
   python credentials/setup_gdrive_oauth.py
   ```

4. During script execution:
   - A browser window will open automatically
   - You will be asked to sign in to your Google account
   - You'll see a warning screen that says "Google hasn't verified this app"
   - Click "Continue" or "Advanced" > "Go to [Your App Name] (unsafe)"
   - Grant permission to access your Google Drive
   - The script will save the authentication token and list your available folders

### 6. Configure Your .env File

Update your `.env` file with the folder ID displayed by the setup script:

```
# Google Drive Configuration
GDRIVE_CREDENTIALS_PATH=../credentials/oauth_credentials.json
GDRIVE_FOLDER_ID=your_folder_id_here
```

You can create a new folder in your Google Drive specifically for email attachments if desired.

## Testing the Integration

To verify your setup is working correctly:

1. Send an email with a large attachment (over 20MB) using the application
2. Verify that:
   - The file appears in your specified Google Drive folder
   - The email is sent with a download link instead of the attachment
   - The download link works correctly when clicked

## Comprehensive Troubleshooting Guide

### OAuth Setup Issues

- **"Desktop application" option not available:**
  - Make sure you've completed the OAuth consent screen setup first
  - Try selecting "Other" or "Web application" application type instead
  - If using "Web application," add `http://localhost` to the redirect URIs

- **"This app isn't verified" warning:**
  - This is normal for personal projects
  - Click "Advanced" or "Continue" at the bottom of the warning screen
  - Then click "Go to [Your App Name] (unsafe)" to proceed

- **Access denied errors:**
  - Verify you added yourself as a test user in the OAuth consent screen
  - Check that you selected the correct Google Drive scope
  - Try deleting the token.pickle file (if it exists) and running the setup again

### Script Execution Issues

- **Missing dependencies:**
  ```
  pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib pywin32
  ```

- **Token pickle errors:**
  - If you see token.pickle related errors, delete the file and run setup again:
  ```
  del credentials\token.pickle
  python credentials\setup_gdrive_oauth.py
  ```

- **Script can't find credentials:**
  - Verify the file is named exactly `oauth_credentials.json`
  - Ensure it's in the `credentials` folder
  - Check file permissions

### Upload Issues

- **Files not appearing in Drive:**
  - Verify the folder ID in your .env file matches a folder in your Drive
  - Check application logs for API errors
  - Ensure the token hasn't expired (rerun the setup script if needed)
  - Check your Drive storage quota isn't full

- **Permission errors during upload:**
  - Verify the scope includes full Drive access
  - Try refreshing the token by running the setup script again

## Security Best Practices

- The `token.pickle` file contains access tokens for your Google Drive. Keep it secure.
- Add both `token.pickle` and `oauth_credentials.json` to your `.gitignore` file:
  ```
  # Google Drive credentials
  credentials/token.pickle
  credentials/oauth_credentials.json
  ```
- If you believe your tokens have been compromised:
  1. Go to your Google account's security settings
  2. Remove access for the EmailManagement application
  3. Regenerate new OAuth credentials in the Google Cloud Console
  4. Run the setup script again

- For production environments, consider implementing additional security measures:
  1. Store credentials in environment variables or a secure vault
  2. Implement token rotation
  3. Use more restrictive Drive API scopes when possible

## Maintenance

- Google OAuth tokens eventually expire. If you experience authentication issues:
  1. Run the setup script again
  2. Follow the browser authentication steps
  3. The script will refresh your tokens

- If Google Cloud Console updates its interface:
  1. Follow the general principles outlined in this guide
  2. Look for equivalent options in the updated interface
  3. The core requirements remain the same: enable API, create OAuth consent, create OAuth credentials
