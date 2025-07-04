@echo off
REM All-in-one script to run both the frontend and backend of EmailManagement
REM This script starts both applications in separate windows

echo [EmailManagement] Starting both frontend and backend applications...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.

REM Start backend in a new window
start cmd /c "%~dp0start_backend.bat"

REM Start frontend in this window
call "%~dp0start_frontend.bat"
