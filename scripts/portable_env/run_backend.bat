@echo off
REM Run the backend application using the portable environment

REM Set working directory and path variables using relative paths
set "ROOT_DIR=%~dp0..\.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "ENV_PYTHON=%BACKEND_DIR%\portable_venv\Scripts\python.exe"
set "ACTIVATE_SCRIPT=%BACKEND_DIR%\portable_venv\Scripts\activate.bat"

REM Check if portable environment exists
if not exist "%ENV_PYTHON%" (
    echo Portable environment not found. Setting it up first...
    call "%~dp0setup.bat"
)

echo Starting application with portable Python environment...
echo Backend will be available at: http://localhost:8000

REM Activate the environment and run the application
call "%ACTIVATE_SCRIPT%"
echo Portable Python environment activated.

REM Go to backend, run app, then return
pushd "%BACKEND_DIR%"
python run.py
popd

REM Deactivate the environment
call deactivate
echo Portable Python environment deactivated.
