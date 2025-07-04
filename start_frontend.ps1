# All-in-one script to run the EmailManagement frontend
# This script automatically handles dependency installation and starts the development server

Write-Host "[EmailManagement] Starting frontend application..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
& "$PSScriptRoot\scripts\frontend\run_frontend.ps1"
