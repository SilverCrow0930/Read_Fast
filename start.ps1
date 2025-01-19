Write-Host "Starting Read Fast app..."

# Start backend server with auto-reload
Write-Host "Starting backend server with auto-reload..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 3003"

# Start frontend server (already has hot reloading)
Write-Host "Starting frontend server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Both servers are starting with auto-reload enabled..."
Write-Host "Frontend will be available at: http://localhost:3000"
Write-Host "Backend will be available at: http://localhost:3003/api"