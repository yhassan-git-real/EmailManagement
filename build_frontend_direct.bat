@echo off
setlocal EnableDelayedExpansion

REM Direct script to build the frontend for production
REM This is a simplified version for reliability

cd "%~dp0frontend"

echo [EmailManagement] Building frontend for production...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in the PATH. Please install Node.js to continue.
    echo Download Node.js from: https://nodejs.org/
    goto :error
) else (
    echo Node.js is installed
    node --version
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed or not in the PATH. It should be included with Node.js.
    goto :error
) else (
    echo npm is installed
    npm --version
)

REM Check if frontend dependencies are installed
if not exist "node_modules" (
    echo.
    echo Frontend dependencies not found. Installing now...
    
    REM Install dependencies
    echo.
    echo Running npm install...
    call npm install
    
    if %ERRORLEVEL% NEQ 0 (
        echo Error installing dependencies.
        goto :error
    )
    
    echo.
    echo Frontend dependencies installed successfully!
) else (
    echo.
    echo Frontend dependencies already installed
)

echo.
echo Building frontend for production...
echo.

REM Run build command
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Error building the frontend.
    goto :error
)

echo.
echo Frontend built successfully!
echo The production build is in: %~dp0frontend\dist
goto :end

:error
echo.
echo An error occurred while building the frontend.
exit /b 1

:end
echo.
echo Build process completed successfully.
pause
