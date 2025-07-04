@echo off
REM Portable Python Environment Setup Script for CMD
REM This script sets up a completely isolated Python environment for the backend

echo Setting up portable Python environment...

REM Set working directory and path variables using relative paths
set "ROOT_DIR=%~dp0..\.."
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "PORTABLE_PYTHON_DIR=%BACKEND_DIR%\portable_python"
set "ENV_DIR=%BACKEND_DIR%\portable_venv"
set "DOWNLOADS_DIR=%~dp0downloads"
set "PYTHON_ZIP=%DOWNLOADS_DIR%\python311.zip"
set "GET_PIP_PATH=%DOWNLOADS_DIR%\get-pip.py"

REM Create portable directories if they don't exist
if not exist "%PORTABLE_PYTHON_DIR%" (
    echo Creating portable Python directory...
    mkdir "%PORTABLE_PYTHON_DIR%"
)

if not exist "%DOWNLOADS_DIR%" (
    echo Creating downloads directory...
    mkdir "%DOWNLOADS_DIR%"
)

REM Check if Python 3.11 embeddable package is already downloaded
set "PYTHON_URL=https://www.python.org/ftp/python/3.11.8/python-3.11.8-embed-amd64.zip"

if not exist "%PYTHON_ZIP%" (
    echo Downloading Python 3.11 embeddable package...
    powershell -Command "Invoke-WebRequest -Uri '%PYTHON_URL%' -OutFile '%PYTHON_ZIP%'"
)

REM Extract Python if not already extracted
if not exist "%PORTABLE_PYTHON_DIR%\python.exe" (
    echo Extracting Python 3.11...
    powershell -Command "Expand-Archive -Path '%PYTHON_ZIP%' -DestinationPath '%PORTABLE_PYTHON_DIR%' -Force"
    
    REM Remove file restriction in python311._pth to enable site-packages
    powershell -Command "$pthFile = Join-Path '%PORTABLE_PYTHON_DIR%' 'python311._pth'; $pthContent = Get-Content -Path $pthFile; $newContent = $pthContent -replace '#import site', 'import site'; $newContent | Set-Content -Path $pthFile"
    
    REM Download get-pip.py to install pip in the portable Python
    set "GET_PIP_URL=https://bootstrap.pypa.io/get-pip.py"
    
    echo Downloading get-pip.py...
    powershell -Command "Invoke-WebRequest -Uri '%GET_PIP_URL%' -OutFile '%GET_PIP_PATH%'"
    
    REM Install pip in the portable Python
    echo Installing pip...
    "%PORTABLE_PYTHON_DIR%\python.exe" "%GET_PIP_PATH%"
    
    REM Install virtualenv package
    echo Installing virtualenv package...
    "%PORTABLE_PYTHON_DIR%\Scripts\pip.exe" install virtualenv
)

REM Create a virtual environment using the portable Python
if not exist "%ENV_DIR%" (
    echo Creating virtual environment using portable Python...
    "%PORTABLE_PYTHON_DIR%\Scripts\virtualenv.exe" "%ENV_DIR%"
)

REM Install requirements in the virtual environment
set "PIP_PATH=%ENV_DIR%\Scripts\pip.exe"
set "REQUIREMENTS_FILE=%BACKEND_DIR%\requirements.txt"

if exist "%PIP_PATH%" (
    echo Installing requirements in the virtual environment...
    "%PIP_PATH%" install -r "%REQUIREMENTS_FILE%"
) else (
    echo Error: pip not found in the virtual environment at %PIP_PATH%
    echo Check the virtual environment setup and try again.
)

echo.
echo Portable Python environment setup complete!
echo.
echo To activate this environment manually, run:
echo   %ENV_DIR%\Scripts\activate.bat
echo.
echo To run the backend directly, use the start_backend.bat script in the root directory.
