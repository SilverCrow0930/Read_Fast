# PowerShell script to clean null bytes from Python files
Write-Host "Cleaning Python files..."

# Get all Python files recursively
$pythonFiles = Get-ChildItem -Path "." -Filter "*.py" -Recurse

foreach ($file in $pythonFiles) {
    Write-Host "Processing $($file.FullName)"
    try {
        # Read the content of the file
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        # Remove null bytes
        $cleanContent = $content -replace "`0",""
        
        # Write the content back to the file with UTF8 encoding (no BOM)
        $utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $cleanContent, $utf8NoBomEncoding)
        
        Write-Host "Cleaned $($file.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nCleaning complete!" -ForegroundColor Green 