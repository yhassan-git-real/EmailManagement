# Function to read values from .env files
function Get-EnvValue {
    param (
        [string]$filePath,
        [string]$key,
        [string]$defaultValue
    )
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        
        foreach ($line in $content) {
            if ($line -match "^\s*$key=(.*)") {
                $value = $matches[1].Trim('"').Trim("'")
                return $value
            }
        }
    }
    
    return $defaultValue
}
