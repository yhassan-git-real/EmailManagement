@echo off
REM All-in-one script to run the EmailManagement frontend
REM This script automatically handles dependency installation and starts the development server

echo [EmailManagement] Starting frontend application...
echo Frontend will be available at: http://localhost:3000
echo.
call "%~dp0scripts\frontend\run_frontend.bat"
