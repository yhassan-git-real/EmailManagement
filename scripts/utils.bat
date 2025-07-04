@echo off
REM Utility functions for batch scripts

REM Load environment variables from .env file
:LoadEnvFile
if "%~1"=="" exit /b
if not exist "%~1" exit /b
for /F "usebackq tokens=1,* delims==" %%A in ("%~1") do (
    set "%%A=%%B"
)
exit /b

REM A more reliable function to read a specific key from .env file
:ReadEnvValue
setlocal EnableDelayedExpansion
set "FILE_PATH=%~1"
set "KEY_TO_FIND=%~2"
set "DEFAULT_VALUE=%~3"
set "FOUND_VALUE=%DEFAULT_VALUE%"

if exist "%FILE_PATH%" (
    for /F "usebackq tokens=1,* delims==" %%A in ("%FILE_PATH%") do (
        if "%%A"=="%KEY_TO_FIND%" (
            set "FOUND_VALUE=%%B"
        )
    )
)

endlocal & set "%~4=%FOUND_VALUE%"
exit /b
