# Backend Setup Guide

This guide provides detailed instructions for setting up the EmailManagement backend, which is built with FastAPI and connects to a Microsoft SQL Server database.

## Overview

The EmailManagement backend is built with FastAPI and provides a RESTful API that handles:
- Database connection testing and management
- Email record retrieval and management
- Email template operations
- Email automation configuration with scheduling capabilities
- Integration with Google Drive for large file handling
- Asynchronous email processing and retry mechanisms
- Email archiving and storage management
- Automated error handling and logging

## Prerequisites

- Windows 10/11 (for portable Python setup)
- Microsoft SQL Server (2016 or higher)
- Internet connection (for downloading dependencies if needed)

## Project Structure

The backend follows a structured organization:

```
backend/
  ├── .env                     # Environment variables for configuration
  ├── requirements.txt         # Python dependencies
  ├── run.py                   # Application entry point
  ├── run_with_portable_env.ps1 # Run script with portable Python
  ├── database/                # SQL scripts for database setup
  │   ├── email_tables.sql     # Table definition scripts
  │   ├── email_records_procedures.sql # Stored procedures
  │   └── setup_stored_procedures.sql  # Procedure setup script
  ├── templates/               # Email templates
  │   ├── default_template.txt # Default email template
  │   └── custom_template.txt  # Custom email template
  ├── Email_Archive/           # Archive of sent email attachments
  ├── portable_python/         # Portable Python runtime
  ├── portable_venv/           # Portable virtual environment
  └── app/                     # Main application package
      ├── __init__.py
      ├── main.py              # FastAPI application definition
      ├── api/                 # API endpoints
      │   ├── __init__.py
      │   ├── email_records_router.py
      │   └── endpoints/
      │       ├── __init__.py
      │       ├── automation.py
      │       ├── database.py
      │       ├── emails.py
      │       └── templates.py
      ├── core/                # Core application modules
      │   ├── __init__.py
      │   ├── config.py        # Configuration handling
      │   └── database.py      # Database connection handling
      ├── models/              # Data models
      │   ├── __init__.py
      │   ├── email.py
      │   └── email_record.py
      ├── services/            # Business logic services
      │   ├── __init__.py
      │   ├── automation_service.py
      │   ├── email_record_service.py
      │   ├── email_sender.py
      │   ├── email_service.py
      │   ├── gdrive_service.py
      │   └── template_service.py
      └── utils/               # Utility functions
          ├── __init__.py
          ├── db_utils.py      # Database utilities
          ├── email_logger.py  # Email logging utilities
          └── file_utils.py    # File handling utilities
```

## Setup Methods

### Option 1: Using Portable Python Environment (Recommended)

This method creates a self-contained, portable Python environment that works across different systems without relying on the system's global Python installation.

1. From the project root directory, run the backend with a single command:
   ```powershell
   .\start_backend.ps1
   ```

   This script automatically:
   - Uses the pre-packaged portable Python environment
   - Activates the virtual environment
   - Installs any missing dependencies
   - Starts the FastAPI server

2. The backend will be available at: http://localhost:8000

3. Verify it's working by opening http://localhost:8000/health in your browser. You should see a JSON response with "status": "ok".

### Option 2: Using System Python (Traditional Setup)

If you prefer to use your system's Python installation:

1. Ensure you have Python 3.11 or higher installed.

2. Create a virtual environment:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install the dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with the following content:
   ```
   # Database settings
   DB_SERVER=your_sql_server
   DB_NAME=your_database
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # Email tables and columns
   EMAIL_TABLE=EmailRecords
   
   # Email settings
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_TLS=true
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   SENDER_EMAIL=your_email@gmail.com
   EMAIL_ARCHIVE_PATH=./Email_Archive
   
   # Optional Google Drive integration
   GDRIVE_CREDENTIALS_PATH=../credentials/oauth_credentials.json
   GDRIVE_FOLDER_ID=your_folder_id_here
   
   # API settings
   API_PORT=8000
   CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
   
   # Logging configuration
   LOG_LEVEL=INFO
   LOG_FILE=./logs/email_app.log
   ```

5. Run the application:
   ```powershell
   python run.py
   ```

## Database Setup

The application requires the following database tables and stored procedures:

1. Create the necessary tables by running the SQL scripts in the `database` directory:
   - `email_tables.sql` - Creates the EmailRecords table
   - `email_records_procedures.sql` - Creates stored procedures for email records
   - `setup_stored_procedures.sql` - Master script that runs all procedure scripts

2. You can run these scripts directly in SQL Server Management Studio or using the sqlcmd utility.

3. The application will connect to your database using the credentials provided when using the frontend interface.

## API Endpoints

The backend exposes the following API endpoints:

### Root and Health Endpoints

- `GET /` - Root endpoint to verify API is running
- `GET /health` - Health check endpoint
- `GET /api/config` - Show current configuration (with sensitive data masked)

### Database Endpoints

- `POST /api/database/test` - Test database connection with provided credentials

### Email Records Endpoints

- `GET /api/email-records/` - Get paginated email records with optional filtering
- `GET /api/email-records/{record_id}` - Get a specific email record by ID
- `PUT /api/email-records/{record_id}` - Update an email record
- `PUT /api/email-records/{record_id}/status` - Update the status of an email record
- `DELETE /api/email-records/{record_id}` - Delete an email record

### Email Templates Endpoints

- `GET /api/templates` - Get all available email templates
- `GET /api/templates/{template_id}` - Get a specific template by ID
- `POST /api/templates` - Create a new template
- `PUT /api/templates/{template_id}` - Update an existing template
- `DELETE /api/templates/{template_id}` - Delete a template

### Automation Endpoints

- `GET /api/automation/settings` - Get automation settings
- `POST /api/automation/settings` - Update automation settings
- `GET /api/automation/status` - Get automation status
- `POST /api/automation/start` - Start email automation
- `POST /api/automation/stop` - Stop email automation
- `POST /api/automation/restart-failed` - Retry failed emails
- `GET /api/automation/schedule` - Get automation schedule settings
- `POST /api/automation/schedule` - Update automation schedule settings
- `POST /api/automation/schedule/enable` - Enable scheduled automation
- `POST /api/automation/schedule/disable` - Disable scheduled automation
- `GET /api/automation/logs` - Get automation process logs

### Google Drive Integration Endpoints

- `GET /api/gdrive/status` - Check Google Drive integration status
- `POST /api/gdrive/upload` - Upload file to Google Drive
- `GET /api/gdrive/shared-link/{file_id}` - Get shareable link for a file
- `GET /api/gdrive/space-usage` - Get Google Drive space usage statistics

## Testing

You can test the API endpoints using curl, PowerShell, or any API testing tool like Postman.

### Using PowerShell

```powershell
# Check health
Invoke-WebRequest -Method GET -Uri http://localhost:8000/health | Select-Object -ExpandProperty Content

# Get configuration
Invoke-WebRequest -Method GET -Uri http://localhost:8000/api/config | Select-Object -ExpandProperty Content

# Test database connection
Invoke-WebRequest -Method POST -Uri http://localhost:8000/api/database/test -ContentType "application/json" -Body '{"server":"your_server","database":"your_database","username":"your_username","password":"your_password"}' | Select-Object -ExpandProperty Content
```

### Using curl

```bash
# Check health
curl -X GET http://localhost:8000/health

# Get configuration
curl -X GET http://localhost:8000/api/config

# Test database connection
curl -X POST http://localhost:8000/api/database/test -H "Content-Type: application/json" -d '{"server":"your_server","database":"your_database","username":"your_username","password":"your_password"}'
```

## Troubleshooting

### Common Issues

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

## Architectural Notes

The backend follows a layered architecture pattern:

1. **API Layer** (`app/api/`):
   - Defines all HTTP endpoints
   - Validates incoming requests
   - Handles HTTP-specific logic (status codes, headers)

2. **Service Layer** (`app/services/`):
   - Implements business logic
   - Orchestrates data operations
   - Handles integration with external services

3. **Data Layer** (`app/models/` and database connection):
   - Defines data structures
   - Manages database connections
   - Executes database operations

4. **Utility Layer** (`app/utils/`):
   - Provides helper functions
   - Handles cross-cutting concerns
