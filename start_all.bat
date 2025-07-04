@echo off
setlocal EnableDelayedExpansion

REM All-in-one script to run both the frontend and backend of EmailManagement
REM This script starts both applications in separate windows

REM Read port configuration from .env files
set "BACKEND_ENV_FILE=%~dp0backend\.env"
set "FRONTEND_ENV_FILE=%~dp0frontend\.env"

REM Read backend port
set "BACKEND_PORT=8000"
if exist "%BACKEND_ENV_FILE%" (
    for /F "usebackq tokens=1,* delims==" %%A in ("%BACKEND_ENV_FILE%") do (
        if "%%A"=="API_PORT" (
            set "BACKEND_PORT=%%B"
        )
    )
)

REM Read frontend port
set "FRONTEND_PORT=3000"
if exist "%FRONTEND_ENV_FILE%" (
    for /F "usebackq tokens=1,* delims==" %%A in ("%FRONTEND_ENV_FILE%") do (
        if "%%A"=="VITE_PORT" (
            set "FRONTEND_PORT=%%B"
        )
    )
)

echo [EmailManagement] Starting both frontend and backend applications...
echo Backend will be available at: http://localhost:%BACKEND_PORT%
echo Frontend will be available at: http://localhost:%FRONTEND_PORT%
echo.

REM Start backend in a new window
echo Starting backend...
start "EmailManagement Backend" cmd /c "%~dp0start_backend.bat"

REM Give the backend a moment to start
timeout /t 2 >nul

REM Start frontend in a new window
echo Starting frontend...
start "EmailManagement Frontend" cmd /c "%~dp0start_frontend.bat"

echo.
echo Both applications have been started in separate windows.
echo To stop the applications, close their respective command windows.
echo.
echo Press any key to exit this launcher...
pause
