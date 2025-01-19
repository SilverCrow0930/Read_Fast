Write-Host "Stopping Focus app servers..."

# Kill Python processes (backend)
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "python run.py" } | Stop-Process -Force

# Kill Node processes (frontend)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "All servers stopped successfully!" 