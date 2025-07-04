@echo off
setlocal EnableDelayedExpansion

REM Direct script to run the frontend Vite server
REM This is a simplified version for troubleshooting

cd "%~dp0frontend"

REM Get port from .env file
set "FRONTEND_PORT=3000"
if exist ".env" (
    for /F "usebackq tokens=1,* delims==" %%A in (".env") do (
        if "%%A"=="VITE_PORT" (
            set "FRONTEND_PORT=%%B"
        )
    )
)

echo [EmailManagement] Starting frontend Vite server directly...
echo Frontend will be available at: http://localhost:%FRONTEND_PORT%
echo.

REM Set the port as an environment variable
set "VITE_PORT=%FRONTEND_PORT%"

REM Run npm directly
npm run dev

echo.
echo Frontend server has stopped.
pause
