# Google Drive Integration Setup

This guide provides detailed instructions for setting up Google Drive integration with the EmailManagement application, which is used for handling large file attachments (over 20MB).

## Overview

When an email attachment exceeds 20MB (Gmail's limit), the EmailManagement application can:
1. Upload the file to Google Drive
2. Generate a shareable link with customizable permissions
3. Include the link in the email instead of attaching the file directly
4. Track links and downloads through the email records system
5. Automatically manage file sharing permissions based on recipient emails

## Prerequisites

- Google account
- Google Cloud Platform account (free tier is sufficient)
- The EmailManagement application installed and configured

## Setup Methods

There are two methods for Google Drive integration:

1. **Personal Google Account Method** - Using your personal Google account for direct access to uploaded files
2. **Service Account Method** - Using a service account for automated, background operations

## Method 1: Personal Google Account (Recommended)

This method allows you to upload files directly to your personal Google Drive, making them easier to manage.

### Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. At the top of the page, click on the project dropdown menu
3. Click "New Project"
4. Enter a project name (e.g., "EmailManagement")
5. Click "Create"
6. Wait for the project to be created, then select it from the notification or project dropdown

### Step 2: Enable the Google Drive API

1. In the left sidebar, navigate to "APIs & Services" > "Library"
2. In the search bar, type "Google Drive API"
3. Click on "Google Drive API" in the results
4. Click the blue "Enable" button
5. Wait for the API to be enabled

### Step 3: Configure OAuth Consent Screen

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

### Step 4: Create OAuth 2.0 Credentials

1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
2. Click the "+ Create Credentials" button at the top
3. Select "OAuth client ID" from the dropdown menu
4. For Application type, select "Desktop application"
   - If "Desktop application" is not available, select "Other" or "Web application" (and if using "Web application", delete any auto-filled redirect URIs and add `http://localhost` as the redirect URI)
5. Name your client (e.g., "EmailManagement Desktop App")
6. Click "Create"
7. A popup will appear with your client ID and client secret - click "Download JSON"
8. Save the downloaded file as `oauth_credentials.json` in the project's `credentials` folder

### Step 5: Run the Setup Script

1. Make sure the `oauth_credentials.json` file is in the correct location:
   ```
   EmailManagement/credentials/oauth_credentials.json
   ```

2. Install the required packages (if not already installed):
   ```powershell
   pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
   ```

3. Run the OAuth setup script:
   ```powershell
   cd credentials
   python setup_gdrive_oauth.py
   ```

4. During script execution:
   - A browser window will open automatically
   - You will be asked to sign in to your Google account
   - You'll see a warning screen that says "Google hasn't verified this app"
   - Click "Continue" or "Advanced" > "Go to [Your App Name] (unsafe)"
   - Grant permission to access your Google Drive
   - The script will save the authentication token and list your available folders

### Step 6: Configure Your Environment

Update your `.env` file in the backend directory with the folder ID displayed by the setup script:

```
# Google Drive Configuration
GDRIVE_CREDENTIALS_PATH=../credentials/oauth_credentials.json
GDRIVE_TOKEN_PATH=../credentials/token.pickle
GDRIVE_FOLDER_ID=your_folder_id_here
GDRIVE_SHARING_OPTION=anyone # Options: anyone, domain, or private
GDRIVE_FILE_EXPIRY_DAYS=30 # Number of days before access expires (0 for never)
```

## Method 2: Service Account (Alternative)

This method uses a service account which is better for automated, background operations without user interaction.

### Step 1: Create a Google Cloud Project

Follow the same steps as in Method 1, Step 1.

### Step 2: Enable the Google Drive API

Follow the same steps as in Method 1, Step 2.

### Step 3: Create a Service Account

1. In your Google Cloud Project, navigate to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a name and description for your service account
4. Click "Create and Continue"
5. Grant the service account the "Editor" role for the Google Drive API
6. Click "Continue" and then "Done"

### Step 4: Create a Service Account Key

1. From the service accounts list, click on the email address of your new service account
2. Click the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" as the key type
5. Click "Create"
6. Save the downloaded JSON file as `gdrive_credentials.json` in the project's `credentials` folder

### Step 5: Configure Google Drive Access

1. Create a shared folder in Google Drive where attachments will be uploaded
2. Share this folder with the service account email address (found in the credentials JSON file)
3. Copy the folder ID from the Drive URL and add it to your `.env` file

### Step 6: Configure Your Environment

Update your `.env` file in the backend directory:

```
# Google Drive Configuration
GDRIVE_CREDENTIALS_PATH=../credentials/gdrive_credentials.json
GDRIVE_USE_SERVICE_ACCOUNT=true
GDRIVE_FOLDER_ID=your_folder_id_here
GDRIVE_SHARING_OPTION=anyone # Options: anyone, domain, or private
GDRIVE_FILE_EXPIRY_DAYS=30 # Number of days before access expires (0 for never)
GDRIVE_NOTIFICATION_EMAIL=false # Whether to send notification emails when sharing
```

## Testing the Integration

To verify your setup is working correctly:

1. Restart the EmailManagement backend server
2. Send an email with a large attachment (over 20MB) using the application
3. Verify that:
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
  ```powershell
  pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
  ```

- **Token pickle errors:**
  - If you see token.pickle related errors, delete the file and run setup again:
  ```powershell
  del credentials\token.pickle
  python credentials\setup_gdrive_oauth.py
  ```

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
- Add both `token.pickle` and `oauth_credentials.json` to your `.gitignore` file
- If you believe your tokens have been compromised:
  1. Go to your Google account's security settings
  2. Remove access for the EmailManagement application
  3. Regenerate new OAuth credentials in the Google Cloud Console
  4. Run the setup script again

## Maintenance

- Google OAuth tokens eventually expire. If you experience authentication issues:
  1. Run the setup script again
  2. Follow the browser authentication steps
  3. The script will refresh your tokens

- Regularly check that your integration is working by testing large file uploads

## Advanced Features

### File Sharing Options

The application supports different sharing permission levels configured via the `GDRIVE_SHARING_OPTION` environment variable:

- `anyone`: Anyone with the link can access the file (most permissive)
- `domain`: Only users in your organization can access the file
- `private`: Only specific email addresses can access the file

### Expiring Links

For enhanced security, you can set file links to expire after a certain number of days using the `GDRIVE_FILE_EXPIRY_DAYS` setting:

- Set to a positive integer (e.g., `30`) to make links expire after that many days
- Set to `0` to create permanent links with no expiration

### Access Control by Email

When using the `private` sharing option, the application will automatically:

1. Extract recipient email addresses from the email being sent
2. Grant access to the Google Drive file only to those specific email addresses
3. Track permissions in the email records database

### File Organization

Files are organized in Google Drive according to these rules:

1. All files are uploaded to the folder specified by `GDRIVE_FOLDER_ID`
2. Within that folder, files are organized into dated subfolders (YYYY-MM-DD format)
3. Each file is named with a prefix of the email ID for easy tracking

### API Usage Monitoring

The application includes a usage monitoring system to help track Google Drive API quota usage:

- View current usage statistics via the `/api/gdrive/usage` endpoint
- Set up alerts for approaching quota limits via the automation system
- Monitor failed uploads due to quota limitations
