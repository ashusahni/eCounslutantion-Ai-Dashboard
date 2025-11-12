@echo off
echo 🚀 eConsultation AI Dashboard
echo ================================

echo.
echo 🔄 Starting the application...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    echo.
    echo 💡 Alternative: Run 'setup_and_run.py' for automatic setup
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Please run this script from the project root directory
    echo Make sure you're in the 'econsultation-ai-dashboard' folder
    pause
    exit /b 1
)

REM Check if dependencies are installed
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Dependencies not installed. Running setup first...
    echo.
    python setup_and_run.py
    if errorlevel 1 (
        echo ❌ Setup failed. Please check the error messages above.
        pause
        exit /b 1
    )
)

REM Start the server
echo 🌐 Starting server on http://127.0.0.1:8000
echo 📊 Dashboard UI: http://127.0.0.1:8000/ui
echo 📚 API Documentation: http://127.0.0.1:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

pause
