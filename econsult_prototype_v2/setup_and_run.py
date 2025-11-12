#!/usr/bin/env python3
"""
eConsultation AI Dashboard - One-Click Setup & Run
This script handles everything: setup, dependency installation, and running the application.
"""

import subprocess
import sys
import os
import webbrowser
import time
from pathlib import Path
import platform

def print_banner():
    """Print a nice banner"""
    print("=" * 60)
    print("🚀 eConsultation AI Dashboard - One-Click Setup & Run")
    print("=" * 60)
    print()

def run_command(command, description, check=True):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"⚠️  {description} completed with warnings")
            return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required. Current version: {version.major}.{version.minor}")
        print("Please install Python 3.8+ from https://python.org")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def check_directories():
    """Check if we're in the right directory"""
    print("📁 Checking project structure...")
    if not Path("backend").exists() or not Path("frontend").exists():
        print("❌ Please run this script from the project root directory")
        print("   Make sure you're in the 'econsultation-ai-dashboard' folder")
        return False
    print("✅ Project structure looks good")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    return run_command("pip install -r requirements.txt", "Installing Python packages")

def download_nltk_data():
    """Download required NLTK data"""
    print("📚 Downloading NLTK data...")
    return run_command("python -m nltk.downloader vader_lexicon", "Downloading NLTK vader_lexicon")

def check_models():
    """Check if AI models are present"""
    print("🤖 Checking AI models...")
    models_dir = Path("backend/models")
    required_models = ["intent_model.pkl", "sklearn_sentiment.pkl"]
    
    missing_models = []
    for model in required_models:
        if not (models_dir / model).exists():
            missing_models.append(model)
    
    if missing_models:
        print(f"⚠️  Missing models: {', '.join(missing_models)}")
        print("   The application may not work properly without these models.")
        return False
    else:
        print("✅ All AI models found")
        return True

def test_import():
    """Test if the application can be imported"""
    print("🧪 Testing application import...")
    try:
        from backend.main import app
        print("✅ Application imports successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import application: {e}")
        return False

def open_browser():
    """Open browser after a short delay"""
    def delayed_open():
        time.sleep(3)
        print("🌐 Opening browser...")
        webbrowser.open("http://127.0.0.1:8000")
    
    import threading
    thread = threading.Thread(target=delayed_open)
    thread.daemon = True
    thread.start()

def run_application():
    """Run the FastAPI application"""
    print("\n🚀 Starting the application...")
    print("=" * 40)
    print("🌐 Server will be available at: http://127.0.0.1:8000")
    print("📊 Dashboard UI: http://127.0.0.1:8000/ui")
    print("📚 API Documentation: http://127.0.0.1:8000/docs")
    print("=" * 40)
    print("\n💡 Tips:")
    print("- Upload the included 'mca_intent_dataset_850.csv' file to test the AI")
    print("- Use natural language search to find specific comments")
    print("- Press Ctrl+C to stop the server")
    print("\n🔄 Starting server...")
    
    # Open browser after a short delay
    open_browser()
    
    # Run the server
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "backend.main:app", 
            "--reload", 
            "--host", "127.0.0.1", 
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Thanks for using eConsultation AI Dashboard!")

def main():
    """Main setup and run function"""
    print_banner()
    
    # Check if we're in the right directory
    if not check_directories():
        input("\nPress Enter to exit...")
        return False
    
    # Check Python version
    if not check_python_version():
        input("\nPress Enter to exit...")
        return False
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies. Please check the error messages above.")
        input("\nPress Enter to exit...")
        return False
    
    # Download NLTK data
    if not download_nltk_data():
        print("⚠️  Failed to download NLTK data. The application may not work properly.")
    
    # Check models
    check_models()
    
    # Test import
    if not test_import():
        print("❌ Application import failed. Please check the error messages above.")
        input("\nPress Enter to exit...")
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\n" + "=" * 40)
    
    # Ask user if they want to run the application
    response = input("🚀 Would you like to start the application now? (y/n): ").lower().strip()
    
    if response in ['y', 'yes', '']:
        run_application()
    else:
        print("\n📋 To start the application later, run:")
        print("   python setup_and_run.py")
        print("   or")
        print("   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000")
        print("\nThanks for using eConsultation AI Dashboard! 🎉")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n👋 Setup cancelled. Thanks for using eConsultation AI Dashboard!")
        sys.exit(0)
