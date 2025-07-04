# This is a redirection script to use the centralized scripts
# For simplicity, this just redirects to the main script

Write-Host "Using centralized portable environment script..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot "..\start_backend.ps1")
