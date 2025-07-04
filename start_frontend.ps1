# All-in-one script to run the EmailManagement frontend
# This script automatically handles dependency installation and starts the development server

# Import utility functions
. (Join-Path $PSScriptRoot "scripts\utils.ps1")

# Read port configuration from .env file
$FrontendEnvFile = Join-Path $PSScriptRoot "frontend\.env"
$FrontendPort = Get-EnvValue -filePath $FrontendEnvFile -key "VITE_PORT" -defaultValue "3000"

Write-Host "[EmailManagement] Starting frontend application..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:$FrontendPort" -ForegroundColor Cyan
Write-Host ""
& "$PSScriptRoot\scripts\frontend\run_frontend.ps1"
