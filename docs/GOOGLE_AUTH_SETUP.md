# Google Authentication Setup for Email Sending

This guide provides detailed instructions for setting up Google Authentication to send emails through Gmail SMTP with your EmailManagement application.

## Overview

EmailManagement can send emails through Gmail's SMTP server, which requires proper authentication. There are two main methods for authentication:

1. **App Password Authentication**: Simpler method for single-user applications
2. **OAuth 2.0 Authentication**: More secure, especially for multi-user applications

## Method 1: App Password Authentication (Recommended for Personal Use)

### Prerequisites

- A Google Account
- Two-factor authentication (2FA) enabled on your Google Account

### Step-by-Step Setup

1. **Enable 2-Step Verification (if not already enabled)**
   - Go to your [Google Account Security Settings](https://myaccount.google.com/security)
   - Click on "2-Step Verification" and follow the steps to turn it on

2. **Create an App Password**
   - Go to your [Google Account Security Settings](https://myaccount.google.com/security)
   - Click on "App passwords" (you may need to enter your password again)
   - Select "Mail" as the app and "Windows Computer" (or appropriate device) as the device
   - Click "Generate"
   - Google will display a 16-character app password. **Copy this password and keep it secure**

3. **Configure EmailManagement**
   - Edit the `.env` file in the backend directory:
     ```
     # Email sending configuration
     EMAIL_SENDER=your.email@gmail.com
     EMAIL_PASSWORD=your-16-character-app-password
     EMAIL_SMTP_SERVER=smtp.gmail.com
     EMAIL_SMTP_PORT=587
     ```

4. **Restart the Backend**
   - Restart the backend server for changes to take effect

### Testing App Password Authentication

1. Send a test email through the application
2. Check for successful delivery
3. If issues occur, check the application logs for SMTP-related errors

## Method 2: OAuth 2.0 Authentication (Recommended for Multi-User or Production)

### Prerequisites

- A Google Account
- Google Cloud Platform account (free tier is sufficient)

### Step-by-Step Setup

1. **Create a Google Cloud Project**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Make note of your Project ID

2. **Enable the Gmail API**
   - In your project, go to "APIs & Services" > "Library"
   - Search for "Gmail API" and click on it
   - Click "Enable"

3. **Configure the OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" as the user type (unless you're using Google Workspace)
   - Fill in the required fields:
     - App name: "EmailManagement"
     - User support email: Your email address
     - Developer contact information: Your email address
   - Add the scopes:
     - `https://www.googleapis.com/auth/gmail.send`
   - Add your email as a test user
   - Complete the setup

4. **Create OAuth Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Desktop application"
   - Name: "EmailManagement Desktop Client"
   - Click "Create"
   - Download the JSON file (client secret)
   - Save this file as `gmail_oauth_credentials.json` in the `credentials` directory of your project

5. **Configure EmailManagement**
   - Edit the `.env` file in the backend directory:
     ```
     # Email sending configuration (OAuth)
     EMAIL_SENDER=your.email@gmail.com
     EMAIL_USE_OAUTH=true
     EMAIL_OAUTH_CREDENTIALS_PATH=../credentials/gmail_oauth_credentials.json
     EMAIL_SMTP_SERVER=smtp.gmail.com
     EMAIL_SMTP_PORT=587
     ```

6. **Run the OAuth Setup Script**
   - The first time you run the application, it will:
     - Open a browser window asking you to sign in to your Google account
     - Request permission to send emails on your behalf
     - Generate and save a token file

### Testing OAuth Authentication

1. Send a test email through the application
2. Check for successful delivery
3. If issues occur, check the application logs for authentication-related errors

## Troubleshooting

### Common Issues with App Passwords

1. **Authentication Failed**
   - Verify the app password was entered correctly (no spaces)
   - Ensure you're using the correct email address
   - Check that 2FA is enabled on your account

2. **Connection Timeout**
   - Check your firewall or antivirus settings
   - Ensure port 587 is open for outgoing connections

### Common Issues with OAuth

1. **Redirect URI Mismatch**
   - Make sure the OAuth client is configured as a Desktop application

2. **Token Refresh Issues**
   - If tokens expire, delete the token file and restart the authentication process

3. **Scope Issues**
   - Ensure the Gmail API is enabled
   - Verify the correct scopes are configured in the OAuth consent screen

## Security Best Practices

1. **Never commit credentials to version control**
   - Add `gmail_oauth_credentials.json` and token files to `.gitignore`

2. **Use environment variables in production**
   - Consider using environment variables instead of `.env` files in production

3. **Regularly rotate credentials**
   - For app passwords, generate a new password periodically
   - For OAuth, generate new client secrets periodically

## Additional Resources

- [Google App Passwords Documentation](https://support.google.com/accounts/answer/185833)
- [Gmail API Documentation](https://developers.google.com/gmail/api/guides)
- [OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
