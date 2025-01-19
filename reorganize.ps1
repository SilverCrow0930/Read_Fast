$files = @(
    "backend/app/__init__.py",
    "backend/app/api/__init__.py",
    "backend/app/services/__init__.py",
    "backend/app/core/__init__.py"
)

foreach ($file in $files) {
    $dir = Split-Path -Parent $file
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir
    }
    if (-not (Test-Path $file)) {
        New-Item -ItemType File -Force -Path $file
    }
}

# Move main.py if it exists in root to backend/app/main.py
if (Test-Path "main.py") {
    Move-Item -Force "main.py" "backend/app/main.py"
} 