#!/usr/bin/env python3
"""
Requirements checker for eConsultation AI Dashboard
This script checks if all required packages are installed and working.
"""

import sys
import subprocess
import importlib
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required. Current version: {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def check_package(package_name, import_name=None):
    """Check if a package is installed and can be imported"""
    if import_name is None:
        import_name = package_name
    
    try:
        importlib.import_module(import_name)
        print(f"✅ {package_name} is installed")
        return True
    except ImportError:
        print(f"❌ {package_name} is not installed")
        return False

def check_required_packages():
    """Check all required packages"""
    print("\n📦 Checking required packages...")
    
    required_packages = [
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("sqlalchemy", "sqlalchemy"),
        ("pydantic", "pydantic"),
        ("nltk", "nltk"),
        ("yake", "yake"),
        ("wordcloud", "wordcloud"),
        ("jinja2", "jinja2"),
        ("python-multipart", "multipart"),
        ("joblib", "joblib"),
    ]
    
    all_installed = True
    for package, import_name in required_packages:
        if not check_package(package, import_name):
            all_installed = False
    
    return all_installed

def check_nltk_data():
    """Check if NLTK data is available"""
    print("\n📚 Checking NLTK data...")
    try:
        import nltk
        nltk.data.find('vader_lexicon')
        print("✅ NLTK vader_lexicon data is available")
        return True
    except LookupError:
        print("❌ NLTK vader_lexicon data is not available")
        return False
    except ImportError:
        print("❌ NLTK is not installed")
        return False

def check_models():
    """Check if AI models are present"""
    print("\n🤖 Checking AI models...")
    models_dir = Path("backend/models")
    required_models = ["intent_model.pkl", "sklearn_sentiment.pkl"]
    
    missing_models = []
    for model in required_models:
        if not (models_dir / model).exists():
            missing_models.append(model)
    
    if missing_models:
        print(f"❌ Missing models: {', '.join(missing_models)}")
        return False
    else:
        print("✅ All AI models found")
        return True

def check_project_structure():
    """Check if project structure is correct"""
    print("\n📁 Checking project structure...")
    
    required_dirs = ["backend", "frontend"]
    required_files = ["requirements.txt", "setup_and_run.py"]
    
    all_present = True
    for dir_name in required_dirs:
        if not Path(dir_name).exists():
            print(f"❌ Missing directory: {dir_name}")
            all_present = False
        else:
            print(f"✅ Directory found: {dir_name}")
    
    for file_name in required_files:
        if not Path(file_name).exists():
            print(f"❌ Missing file: {file_name}")
            all_present = False
        else:
            print(f"✅ File found: {file_name}")
    
    return all_present

def main():
    """Main function"""
    print("🔍 eConsultation AI Dashboard - Requirements Checker")
    print("=" * 60)
    
    all_good = True
    
    # Check Python version
    if not check_python_version():
        all_good = False
    
    # Check project structure
    if not check_project_structure():
        all_good = False
    
    # Check required packages
    if not check_required_packages():
        all_good = False
    
    # Check NLTK data
    if not check_nltk_data():
        all_good = False
    
    # Check models
    if not check_models():
        all_good = False
    
    print("\n" + "=" * 60)
    if all_good:
        print("🎉 All requirements are satisfied! You're ready to run the application.")
        print("\nTo start the application, run:")
        print("  python setup_and_run.py")
        print("  or")
        print("  uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000")
    else:
        print("❌ Some requirements are missing. Please run:")
        print("  python setup_and_run.py")
        print("  to install missing dependencies.")
    
    return all_good

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
