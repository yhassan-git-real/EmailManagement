@echo off
REM All-in-one script to run the EmailManagement backend
REM This script automatically handles environment setup and activation

echo [EmailManagement] Starting backend application...
echo Backend will be available at: http://localhost:8000
echo.
call "%~dp0scripts\portable_env\run_backend.bat"
