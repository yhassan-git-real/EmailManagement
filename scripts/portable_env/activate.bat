@echo off
REM Activate the portable virtual environment for manual development work

REM Set working directory and path variables using relative paths
set "ROOT_DIR=%~dp0..\.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "ACTIVATE_SCRIPT=%BACKEND_DIR%\portable_venv\Scripts\activate.bat"

REM Check if portable environment exists
if not exist "%ACTIVATE_SCRIPT%" (
    echo Portable environment not found. Setting it up first...
    call "%~dp0setup.bat"
)

call "%ACTIVATE_SCRIPT%"
echo.
echo Portable Python environment activated. 
echo Type 'deactivate' when you're done.
echo.
