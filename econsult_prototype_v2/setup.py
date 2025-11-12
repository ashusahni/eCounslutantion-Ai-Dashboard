#!/usr/bin/env python3
"""
Setup script for eConsultation AI Dashboard
This script helps users set up the project quickly and easily.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
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
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
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

def main():
    """Main setup function"""
    print("🚀 eConsultation AI Dashboard Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("backend").exists() or not Path("frontend").exists():
        print("❌ Please run this script from the project root directory")
        print("   Make sure you're in the 'econsultation-ai-dashboard' folder")
        return False
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies. Please check the error messages above.")
        return False
    
    # Download NLTK data
    if not download_nltk_data():
        print("⚠️  Failed to download NLTK data. The application may not work properly.")
    
    # Check models
    check_models()
    
    # Test import
    if not test_import():
        print("❌ Application import failed. Please check the error messages above.")
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the server: uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000")
    print("2. Open your browser: http://127.0.0.1:8000")
    print("3. Upload some data and start analyzing!")
    
    print("\n💡 Tips:")
    print("- Use the CSV template for easy data upload")
    print("- Try the natural language search feature")
    print("- Check out the API documentation at /docs")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
