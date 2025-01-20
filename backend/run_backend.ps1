# Clear Python cache
Remove-Item -Recurse -Force **/__pycache__ -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force *.pyc -ErrorAction SilentlyContinue

# Set PYTHONPATH to ensure correct module loading
$env:PYTHONPATH = (Get-Location).Path

# Start the server with forced reload
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 3003 --reload-dir app 