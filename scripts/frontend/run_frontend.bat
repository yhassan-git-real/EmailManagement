@echo off
setlocal EnableDelayedExpansion
REM Frontend Setup and Run Script for CMD
REM This script sets up and runs the frontend application

REM Set working directory and path variables using relative paths
set "ROOT_DIR=%~dp0..\.."
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "NODE_MODULES_DIR=%FRONTEND_DIR%\node_modules"
set "ENV_FILE=%FRONTEND_DIR%\.env"

REM Get frontend port from .env or use default 3000
set "FRONTEND_PORT=3000"
if exist "%ENV_FILE%" (
    for /F "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
        if "%%A"=="VITE_PORT" (
            set "FRONTEND_PORT=%%B"
        )
    )
)

echo VITE_PORT set to: %FRONTEND_PORT%

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in the PATH. Please install Node.js to continue.
    echo Download Node.js from: https://nodejs.org/
    exit /b 1
) else (
    echo Node.js is installed
    node --version
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed or not in the PATH. It should be included with Node.js.
    exit /b 1
) else (
    echo npm is installed
    npm --version
)

REM Check if frontend dependencies are installed
if not exist "%NODE_MODULES_DIR%" (
    echo.
    echo Frontend dependencies not found. Installing now...
    
    REM Change directory to the frontend folder
    pushd "%FRONTEND_DIR%"
    
    REM Install dependencies
    echo.
    echo Running npm install...
    call npm install
    
    REM Return to original directory
    popd
    
    echo.
    echo Frontend dependencies installed successfully!
) else (
    echo.
    echo Frontend dependencies already installed
)

echo.
echo Starting frontend development server...
echo Frontend will be available at: http://localhost:%FRONTEND_PORT%

REM Change directory to the frontend folder
pushd "%FRONTEND_DIR%"

REM Create a temporary batch file to set environment variables and run vite
echo @echo off > run_vite_temp.bat
echo set "VITE_PORT=%FRONTEND_PORT%" >> run_vite_temp.bat
echo call npm run dev >> run_vite_temp.bat

REM Run the temporary batch file
call run_vite_temp.bat

REM Clean up
del run_vite_temp.bat

REM Return to original directory when npm run dev is terminated
popd

echo.
echo Frontend server has been stopped
