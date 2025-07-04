@echo off
REM Frontend Setup and Run Script for CMD
REM This script sets up and runs the frontend application

REM Set working directory and path variables using relative paths
set "ROOT_DIR=%~dp0..\.."
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "NODE_MODULES_DIR=%FRONTEND_DIR%\node_modules"

REM Check if Node.js is installed
node -v > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in the PATH. Please install Node.js to continue.
    echo Download Node.js from: https://nodejs.org/
    exit /b 1
)

echo Node.js is installed

REM Check if npm is installed
npm -v > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed or not in the PATH. It should be included with Node.js.
    exit /b 1
)

echo npm is installed

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
echo Frontend will be available at: http://localhost:3000

REM Change directory to the frontend folder
pushd "%FRONTEND_DIR%"

REM Run the frontend in development mode
call npm run dev

REM Return to original directory when npm run dev is terminated
popd

echo.
echo Frontend server has been stopped
