# Google Drive Integration Setup

This folder contains the necessary files for Google Drive integration with the Email Management system, used for handling large file attachments (over 20MB).

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API for your project

### 2. Create a Service Account

1. In your Google Cloud Project, navigate to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a name and description for your service account
4. Grant the service account the "Editor" role for the Google Drive API
5. Click "Create Key" and select JSON format
6. Save the downloaded JSON file as `gdrive_credentials.json` in this directory

### 3. Configure Google Drive Access

1. Create a shared folder in Google Drive where attachments will be uploaded
2. Share this folder with the service account email address (found in the credentials JSON file)
3. Optionally, copy the folder ID from the Drive URL and add it to your `.env` file as `GDRIVE_FOLDER_ID`

## Testing the Integration

1. Ensure the required Python packages are installed:
   ```
   pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
   ```

2. Restart the Email Management service for the changes to take effect
3. Test by sending an email with a large attachment (over 20MB)

## Troubleshooting

- Check the application logs for any errors related to Google Drive authentication
- Verify that the service account has the correct permissions for the Google Drive folder
- Ensure the credentials file path in `.env` is correct relative to the application's working directory

## Security Considerations

- The `gdrive_credentials.json` file contains sensitive information. Ensure it is properly secured.
- Consider adding it to your `.gitignore` file to prevent it from being committed to version control.
- Regularly rotate the service account keys for enhanced security.
