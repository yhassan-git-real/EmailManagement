# All-in-one script to run the EmailManagement backend
# This script automatically handles environment setup and activation

Write-Host "[EmailManagement] Starting backend application..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
& "$PSScriptRoot\scripts\portable_env\run_backend.ps1"
