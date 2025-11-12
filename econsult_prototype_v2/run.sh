#!/bin/bash

echo "🚀 eConsultation AI Dashboard"
echo "================================"

echo ""
echo "🔄 Starting the application..."
echo ""

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed or not in PATH"
    echo "Please install Python 3.8+ from https://python.org"
    echo ""
    echo "💡 Alternative: Run 'python setup_and_run.py' for automatic setup"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    echo "Make sure you're in the 'econsultation-ai-dashboard' folder"
    exit 1
fi

# Check if dependencies are installed
python -c "import fastapi" &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Dependencies not installed. Running setup first..."
    echo ""
    python setup_and_run.py
    if [ $? -ne 0 ]; then
        echo "❌ Setup failed. Please check the error messages above."
        exit 1
    fi
fi

# Start the server
echo "🌐 Starting server on http://127.0.0.1:8000"
echo "📊 Dashboard UI: http://127.0.0.1:8000/ui"
echo "📚 API Documentation: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
