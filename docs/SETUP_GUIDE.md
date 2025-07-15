# EmailManagement Setup Guide

This guide provides step-by-step instructions for setting up the EmailManagement application on a new machine. It's designed for non-technical users and covers all aspects of installation and configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [Database Setup](#database-setup)
7. [SMTP Configuration](#smtp-configuration)
8. [Google Drive Integration](#google-drive-integration)
9. [Running the Application](#running-the-application)
10. [Refresh Controls & Data Management](#refresh-controls--data-management)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

- Windows 10 or newer
- Internet connection
- Administrator access to your computer
- SQL Server installed (Express edition is sufficient)
- 2GB of free disk space

## Quick Start

For experienced users who want to get started quickly:

1. Clone or download the EmailManagement repository
2. Run the setup script: `.\start_app.ps1`
3. Follow the prompts to configure the application
4. Access the application at http://localhost:5173

## Environment Setup

### Option 1: Portable Environment (Recommended for Non-Technical Users)

The portable environment automatically sets up Python and Node.js without requiring system-wide installation.

1. Open PowerShell as Administrator
2. Navigate to the EmailManagement folder
3. Run the portable setup script:
   ```
   .\scripts\portable_env\setup.ps1
   ```
4. Wait for the script to complete (this may take a few minutes)

### Option 2: Manual Environment Setup

If you prefer to use your existing Python and Node.js installations:

1. Ensure Python 3.8+ is installed
   - Check with: `python --version`
   - If not installed, download from [python.org](https://www.python.org/downloads/)

2. Ensure Node.js 14+ is installed
   - Check with: `node --version`
   - If not installed, download from [nodejs.org](https://nodejs.org/)

3. Set up Python virtual environment:
   ```
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. Install Node.js dependencies:
   ```
   cd frontend
   npm install
   ```

## Backend Configuration

### Setting Up the .env File

1. Navigate to the backend directory
2. Copy the `.env.example` file to `.env`:
   ```
   copy .env.example .env
   ```
3. Open the `.env` file in a text editor and configure:

   ```
   # API Configuration
   API_PORT=8000
   CORS_ORIGINS=http://localhost:5173

   # Database Configuration
   DB_SERVER=localhost\SQLEXPRESS
   DB_NAME=EmailManagement
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DRIVER=ODBC Driver 17 for SQL Server

   # Email Configuration
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   EMAIL_USERNAME=your.email@gmail.com
   EMAIL_PASSWORD=your_app_password
   SMTP_TLS=True

   # File Storage
   EMAIL_ARCHIVE_PATH=../Email_Archive
   TEMPLATE_PATH=../templates
   MAX_ATTACHMENT_SIZE=25000000

   # Google Drive (Optional)
   GDRIVE_CREDENTIALS_PATH=../credentials/gdrive_credentials.json
   GDRIVE_TOKEN_PATH=../credentials/token.pickle
   GDRIVE_FOLDER_ID=your_folder_id
   GDRIVE_UPLOAD_THRESHOLD=20000000
   ```

4. Replace the placeholder values with your actual configuration

## Frontend Configuration

1. Navigate to the frontend directory
2. Open `src/utils/apiClient.js` in a text editor
3. Verify the API_BASE_URL matches your backend URL:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000';
   ```
4. If you changed the backend port in the `.env` file, update this URL accordingly

## Database Setup

### Creating the Database

1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Right-click on "Databases" and select "New Database"
4. Enter "EmailManagement" as the database name and click OK

### Running the Setup Scripts

1. In SSMS, connect to your SQL Server instance
2. Open the `database/email_tables.sql` script
3. Click "Execute" to create the necessary tables
4. Open the `database/setup_stored_procedures.sql` script
5. Click "Execute" to create the stored procedures

Alternatively, you can run the scripts from PowerShell:

```powershell
sqlcmd -S localhost\SQLEXPRESS -d EmailManagement -i database\email_tables.sql
sqlcmd -S localhost\SQLEXPRESS -d EmailManagement -i database\setup_stored_procedures.sql
```

## SMTP Configuration

### Option 1: Gmail with App Password (Recommended)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Under "Signing in to Google," select "App passwords"
   - Select "Mail" and "Windows Computer" from the dropdowns
   - Click "Generate"
3. Copy the 16-character password
4. Update your `.env` file:
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   EMAIL_USERNAME=your.email@gmail.com
   EMAIL_PASSWORD=your_app_password
   SMTP_TLS=True
   ```

### Option 2: Custom SMTP Provider

1. Obtain SMTP server details from your email provider
2. Update your `.env` file with the appropriate values:
   ```
   SMTP_SERVER=your.smtp.server
   SMTP_PORT=your_port
   EMAIL_USERNAME=your_username
   EMAIL_PASSWORD=your_password
   SMTP_TLS=True_or_False
   ```

## Google Drive Integration

Google Drive integration is optional but recommended for handling large email attachments.

### Option 1: Personal Google Account (OAuth)

1. Create a Google Cloud Project:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project named "EmailManagement"
   - Enable the Google Drive API

2. Configure OAuth Consent Screen:
   - Go to "OAuth consent screen"
   - Select "External" user type
   - Fill in the application name and user support email
   - Add your email as a test user
   - Add the required scopes: `.../auth/drive.file`

3. Create OAuth Credentials:
   - Go to "Credentials" and click "Create Credentials"
   - Select "OAuth client ID"
   - Choose "Desktop application" as the application type
   - Download the JSON file

4. Set Up Credentials:
   - Create a `credentials` folder in the EmailManagement root directory
   - Rename the downloaded JSON file to `gdrive_credentials.json`
   - Place it in the `credentials` folder
   - Run the setup script:
     ```
     python credentials\setup_gdrive_oauth.py
     ```
   - Follow the browser prompts to authorize the application

5. Update your `.env` file:
   ```
   GDRIVE_CREDENTIALS_PATH=../credentials/gdrive_credentials.json
   GDRIVE_TOKEN_PATH=../credentials/token.pickle
   GDRIVE_FOLDER_ID=your_folder_id
   GDRIVE_UPLOAD_THRESHOLD=20000000
   ```

### Option 2: Service Account (For Server Environments)

1. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts" in Google Cloud Console
   - Click "Create Service Account"
   - Download the JSON key file

2. Set Up Credentials:
   - Rename the downloaded JSON file to `gdrive_service_account.json`
   - Place it in the `credentials` folder

3. Update your `.env` file:
   ```
   GDRIVE_SERVICE_ACCOUNT_PATH=../credentials/gdrive_service_account.json
   GDRIVE_FOLDER_ID=your_folder_id
   GDRIVE_UPLOAD_THRESHOLD=20000000
   ```

## Running the Application

### Option 1: Using the Start Script (Recommended)

1. Open PowerShell
2. Navigate to the EmailManagement folder
3. Run the start script:
   ```
   .\start_app.ps1
   ```
4. The script will start both backend and frontend servers
5. Access the application at http://localhost:5173

### Option 2: Starting Components Separately

#### Starting the Backend

1. Open PowerShell
2. Navigate to the EmailManagement folder
3. Run:
   ```
   .\start_backend.ps1
   ```
   or manually:
   ```
   cd backend
   python -m app.main
   ```
4. The backend will start on http://localhost:8000

#### Starting the Frontend

1. Open a new PowerShell window
2. Navigate to the EmailManagement folder
3. Run:
   ```
   .\start_frontend.ps1
   ```
   or manually:
   ```
   cd frontend
   npm run dev
   ```
4. The frontend will start on http://localhost:5173

## Refresh Controls & Data Management

The EmailManagement application includes several features to manage data refresh and API traffic:

### Automatic Refresh

- **Email Automation Status**: Automatically refreshes every 5 seconds when automation is running
- **Dashboard Metrics**: Automatically refreshes every 30 seconds

### Manual Refresh

- **Email Records**: Use the "Execute" button after setting filters to refresh data
- **Templates**: Click the refresh icon to load the latest templates
- **Logs**: Click the refresh button to update log entries

### Data Pagination

- Email records are paginated to improve performance
- Use the pagination controls at the bottom of tables to navigate between pages
- Adjust page size using the dropdown menu

### Search and Filtering

- Use the search box to filter records by text content
- Use status filters to show only specific email statuses
- Click "Execute" to apply server-side filtering
- Client-side filtering is applied immediately for quick searches

## Troubleshooting

### Backend Issues

1. **Port Conflict**
   - If port 8000 is already in use, modify the `API_PORT` value in the `.env` file
   - Remember to update the frontend API client to point to the new port

2. **Database Connection Issues**
   - Verify SQL Server is running
   - Check that the connection details are correct
   - Ensure the user has appropriate permissions on the database
   - Make sure SQL Server authentication is enabled if using SQL authentication

3. **Missing Dependencies**
   - If you encounter module import errors, run:
     ```
     pip install -r requirements.txt
     ```
   - For the portable environment, try:
     ```
     .\scripts\portable_env\setup.ps1
     ```

4. **File Permission Issues**
   - Ensure the application has write permissions to the `Email_Archive` directory
   - Check permissions on template files

### Frontend Issues

1. **Node.js Version**
   - Ensure you have Node.js 14.x or higher installed
   - Check with: `node --version`

2. **Port Conflict**
   - If port 5173 is already in use, Vite will automatically try the next available port
   - Look for the URL in the terminal output when starting the development server

3. **Backend Connection Issues**
   - Check if the backend server is running
   - Verify the API_BASE_URL in apiClient.js matches your backend URL
   - Check browser console for CORS errors (ensure backend has proper CORS settings)

4. **Build Errors**
   - Run `npm run build` to see detailed error messages
   - Check for any dependencies that need updating: `npm update`

5. **White Screen/Blank Page**
   - Check browser console for JavaScript errors
   - Verify all dependencies are installed correctly
   - Try clearing your browser cache

### SMTP Issues

1. **Authentication Failed**
   - Verify the app password was entered correctly (no spaces)
   - Ensure you're using the correct email address
   - Check that 2FA is enabled on your account if using Gmail

2. **Connection Timeout**
   - Check your firewall or antivirus settings
   - Ensure port 587 is open for outgoing connections

### Google Drive Issues

1. **OAuth Setup Issues**
   - If "Desktop application" option is not available, try selecting "Other" or "Web application"
   - For "This app isn't verified" warning, click "Advanced" and then "Go to [Your App Name] (unsafe)"
   - For access denied errors, verify you added yourself as a test user

2. **Token Issues**
   - If you see token.pickle related errors, delete the file and run setup again:
     ```
     del credentials\token.pickle
     python credentials\setup_gdrive_oauth.py
     ```

3. **Upload Issues**
   - If files aren't appearing in Drive, verify the folder ID in your .env file
   - Check application logs for API errors
   - Ensure your Drive storage quota isn't full

## Additional Resources

- [Backend Setup Details](BACKEND_SETUP.md)
- [Frontend Setup Details](FRONTEND_SETUP.md)
- [Google Drive Setup Details](GOOGLE_DRIVE_SETUP.md)
- [Google Auth Setup Details](GOOGLE_AUTH_SETUP.md)
