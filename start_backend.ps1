# All-in-one script to run the EmailManagement backend
# This script automatically handles environment setup and activation

# Import utility functions
. (Join-Path $PSScriptRoot "scripts\utils.ps1")

# Read port configuration from .env file
$BackendEnvFile = Join-Path $PSScriptRoot "backend\.env"
$BackendPort = Get-EnvValue -filePath $BackendEnvFile -key "API_PORT" -defaultValue "8000"

Write-Host "[EmailManagement] Starting backend application..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:$BackendPort" -ForegroundColor Cyan
Write-Host ""
& "$PSScriptRoot\scripts\portable_env\run_backend.ps1"
