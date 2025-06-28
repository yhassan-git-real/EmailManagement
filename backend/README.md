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
   TEMPLATE_TABLE=EmailTemplates
   ```

3. Run the application:
   ```
   python run.py
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
