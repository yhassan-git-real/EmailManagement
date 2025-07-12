# EmailManagement Backend

This is the backend API for the EmailManagement application, built with FastAPI and Microsoft SQL Server.

## Overview

The backend provides a RESTful API that handles:
- Database connection testing and management
- Email record retrieval and management
- Email template operations
- Email automation configuration
- Integration with Google Drive for large file handling

The backend provides a RESTful API that handles:
- Database connection testing and management
- Email record retrieval and management
- Email template operations
- Email automation configuration
- Integration with Google Drive for large file handling

## Project Structure

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
      │   ├── database/         # Database layer services
      │   │   ├── __init__.py
      │   │   ├── core/         # Core database functionality
      │   │   └── repositories/ # Data access repositories
      │   │       ├── email_repository.py
      │   │       └── email_record_repository.py
      │   ├── email/            # Email handling services
      │   │   ├── core/         # Core email functionality
      │   │   ├── gdrive/       # Google Drive integration
      │   │   └── status/       # Email status management
      │   ├── storage/          # Storage services
      │   │   └── gdrive/       # Google Drive storage
      │   └── templates/        # Template services
      │       ├── core/         # Core template functionality
      │       └── validation/   # Template validation
      └── utils/               # Utility functions
          ├── __init__.py
          └── db_utils.py      # Database utilities
```

## Workflow and Process

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

## Setup

For detailed setup instructions, please refer to the comprehensive setup guide:

- [Backend Setup Guide](../docs/BACKEND_SETUP.md)

### Option 1: Using System Python (Traditional Setup)

1. Install Python 3.11 or higher if not already installed

2. Install the required ODBC driver for SQL Server:
   - For Windows: [Download ODBC Driver for SQL Server](https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
   - For Linux: Follow [these instructions](https://docs.microsoft.com/en-us/sql/connect/odbc/linux-mac/installing-the-microsoft-odbc-driver-for-sql-server)

3. Clone the repository and navigate to the backend directory:
   ```
   cd EmailManagement/backend
   ```

4. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the backend directory with the following settings:
   ```
   DB_SERVER=your_server
   DB_NAME=your_database
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DRIVER=ODBC Driver 17 for SQL Server
   EMAIL_TABLE=EmailRecords
   
   # Optional Google Drive integration
   GDRIVE_CREDENTIALS_PATH=../credentials/oauth_credentials.json
   GDRIVE_FOLDER_ID=your_folder_id_here
   
   # API settings
   API_PORT=8000
   CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
   ```

6. Run the application:
   ```
   python run.py
   ```

### Option 2: Using Portable Python Environment (Recommended)

This method creates a self-contained, portable Python environment that works across different systems without relying on the system's global Python installation.

#### PowerShell (Recommended for Windows)

1. Run the all-in-one script from the project root:
   ```powershell
   # From project root (PowerShell)
   .\start_backend.ps1
   
   # From project root (CMD)
   start_backend.bat
   ```

This script will:
- Check if the portable Python environment is set up
- Set up the environment if needed
- Install all required dependencies
- Run the backend application

#### For Development (Manual Environment Activation)

If you need to work directly with the Python environment (for installing packages, etc.):

1. Activate the environment:
   ```
   # PowerShell
   .\scripts\portable_env\activate.ps1
   
   # CMD
   .\scripts\portable_env\activate.bat
   ```

2. You can now run Python commands directly.

3. Deactivate when finished:
   ```
   deactivate
   ```

## API Endpoints

### Root and Health Endpoints

- `GET /` - Root endpoint to verify API is running
- `GET /health` - Health check endpoint
- `GET /api/config` - Show current configuration (with sensitive data masked)

### Database Endpoints

- `POST /api/database/test` - Test database connection with provided credentials

### Email Records Endpoints

- `GET /api/email/records` - Get paginated email records with optional filtering
- `GET /api/email/records/{email_id}` - Get a specific email record by ID
- `PUT /api/email/records/{email_id}` - Update an email record
- `PUT /api/email/records/{email_id}/status` - Update the status of an email record
- `DELETE /api/email/records/{email_id}` - Delete an email record

### Email Records Endpoints (Alternative Format)

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

## Database Setup

The application requires the following database tables and stored procedures:

1. Create the necessary tables by running the SQL scripts in the `database` directory:
   - `email_tables.sql` - Creates the EmailRecords table
   - `email_records_procedures.sql` - Creates stored procedures for email records

2. You can run these scripts directly in SQL Server Management Studio or using the sqlcmd utility.

## License

This project is licensed under the MIT License.
