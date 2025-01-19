Write-Host "Setting up Focus app..."

# Install backend dependencies
Write-Host "Installing backend dependencies..."
pip install -r backend/requirements.txt

# Install frontend dependencies
Write-Host "Installing frontend dependencies..."
npm install

Write-Host "`nSetup completed successfully!"
Write-Host "Run ./start.ps1 to start the application" 