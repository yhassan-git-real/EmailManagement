@echo off
REM All-in-one script to build the EmailManagement frontend for production

echo [EmailManagement] Building frontend for production...
call "%~dp0scripts\frontend\build_frontend.bat"
