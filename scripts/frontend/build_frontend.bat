@echo off
setlocal EnableDelayedExpansion
REM Script to build the frontend for production

REM Set working directory and path variables using relative paths
set "ROOT_DIR=%~dp0..\.."
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "NODE_MODULES_DIR=%FRONTEND_DIR%\node_modules"
set "BUILD_DIR=%FRONTEND_DIR%\dist"

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
echo Building frontend for production...

REM Change directory to the frontend folder
pushd "%FRONTEND_DIR%"

REM Build the frontend for production
call npm run build

REM Return to original directory
popd

if exist "%BUILD_DIR%" (
    echo.
    echo Frontend built successfully! The production build is in: %BUILD_DIR%
) else (
    echo.
    echo Error: Frontend build failed. Check for errors above.
    exit /b 1
)
