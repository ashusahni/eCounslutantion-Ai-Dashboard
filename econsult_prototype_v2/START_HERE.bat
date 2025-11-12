@echo off
title eConsultation AI Dashboard - One-Click Launcher
color 0A

echo.
echo ================================================================
echo    🚀 eConsultation AI Dashboard - One-Click Launcher
echo ================================================================
echo.
echo This will automatically:
echo   ✅ Check Python installation
echo   ✅ Install all dependencies
echo   ✅ Download required data
echo   ✅ Start the application
echo   ✅ Open your browser
echo.
echo ================================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo.
    echo Please install Python 3.8+ from: https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo ✅ Python found! Starting setup...
echo.

REM Run the comprehensive setup and run script
python setup_and_run.py

echo.
echo ================================================================
echo    Thanks for using eConsultation AI Dashboard! 🎉
echo ================================================================
echo.
pause
