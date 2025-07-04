# All-in-one script to run both the frontend and backend of EmailManagement
# This script starts both applications in separate windows

Write-Host "[EmailManagement] Starting both frontend and backend applications..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$PSScriptRoot\start_backend.ps1`""

# Start frontend in this window
& "$PSScriptRoot\start_frontend.ps1"
