@echo off
REM All-in-one script to run the EmailManagement backend
REM This script automatically handles environment setup and activation

REM Load utility functions
call "%~dp0scripts\utils.bat"

REM Read port configuration from .env file
set "BACKEND_ENV_FILE=%~dp0backend\.env"
call :GetEnvValue "%BACKEND_ENV_FILE%" "API_PORT" "8000"
set "BACKEND_PORT=%RETURN_VALUE%"

echo [EmailManagement] Starting backend application...
echo Backend will be available at: http://localhost:%BACKEND_PORT%
echo.
call "%~dp0scripts\portable_env\run_backend.bat"
