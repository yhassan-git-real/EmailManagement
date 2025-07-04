# All-in-one script to run both the frontend and backend of EmailManagement
# This script starts both applications in separate windows

# Import utility functions
. (Join-Path $PSScriptRoot "scripts\utils.ps1")

# Read port configuration from .env files
$BackendEnvFile = Join-Path $PSScriptRoot "backend\.env"
$FrontendEnvFile = Join-Path $PSScriptRoot "frontend\.env"

$BackendPort = Get-EnvValue -filePath $BackendEnvFile -key "API_PORT" -defaultValue "8000"
$FrontendPort = Get-EnvValue -filePath $FrontendEnvFile -key "VITE_PORT" -defaultValue "3000"

Write-Host "[EmailManagement] Starting both frontend and backend applications..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:$BackendPort" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:$FrontendPort" -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$PSScriptRoot\start_backend.ps1`""

# Start frontend in this window
& "$PSScriptRoot\start_frontend.ps1"
