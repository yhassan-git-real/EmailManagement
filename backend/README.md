# EmailManagement Backend

This is the backend API for the EmailManagement application, built with FastAPI and Microsoft SQL Server.

## Project Structure

```
backend/
  ├── .env                # Environment variables for configuration
  ├── requirements.txt    # Python dependencies
  ├── run.py              # Application entry point
  └── app/                # Main application package
      ├── __init__.py
      ├── main.py         # FastAPI application definition
      ├── config.py       # Settings and configuration
      ├── db_utils.py     # Database utilities
      ├── models/         # Data models
      │   └── __init__.py
      └── routers/        # API endpoints
          ├── __init__.py
          └── db.py       # Database-related endpoints
```

## Setup

### Option 1: Using System Python (Traditional Setup)

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Make sure your `.env` file is configured correctly with:
   ```
   DB_SERVER=your_server
   DB_NAME=your_database
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DRIVER=ODBC Driver 17 for SQL Server
   EMAIL_TABLE=EmailRecords
   ```

3. Run the application:
   ```
   python run.py
   ```

### Option 2: Using Portable Python Environment (Recommended)

This method creates a self-contained, portable Python environment that works across different systems without relying on the system's global Python installation.

The portable environment scripts are located in the root directory of the project.

#### PowerShell (Recommended for Windows)

1. Run the all-in-one script from the project root:
   ```powershell
   # From project root (PowerShell)
   .\start_backend.ps1
   
   # From project root (CMD)
   start_backend.bat
   ```

#### Command Prompt

1. Run the all-in-one script from the project root:
   ```
   start_backend.bat
   ```

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

4. Or simply use the all-in-one run script:
   ```
   ..\run_backend_portable.bat
   ```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check endpoint
- `GET /api/config` - Show current configuration (with password masked)
- `POST /api/database/test` - Test database connection

## Testing

You can test the API endpoints using PowerShell:

```powershell
# Check health
Invoke-WebRequest -Method GET -Uri http://localhost:8000/health | Select-Object -ExpandProperty Content

# Get configuration
Invoke-WebRequest -Method GET -Uri http://localhost:8000/api/config | Select-Object -ExpandProperty Content

# Test database connection
Invoke-WebRequest -Method POST -Uri http://localhost:8000/api/database/test -ContentType "application/json" -Body '{}' | Select-Object -ExpandProperty Content
```
