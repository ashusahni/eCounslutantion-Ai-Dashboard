# 🆘 Troubleshooting Guide

## Common Issues and Solutions

### 1. Python Not Found
**Error**: `'python' is not recognized as an internal or external command`

**Solution**:
- Install Python 3.8+ from https://python.org
- Make sure to check "Add Python to PATH" during installation
- Restart your terminal/command prompt after installation

### 2. Dependencies Not Installed
**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
- Run: `python setup_and_run.py`
- Or manually: `pip install -r requirements.txt`

### 3. Port Already in Use
**Error**: `[Errno 48] Address already in use`

**Solution**:
- Close other applications using port 8000
- Or change the port: `uvicorn backend.main:app --reload --port 8001`

### 4. NLTK Data Missing
**Error**: `LookupError: Resource 'vader_lexicon' not found`

**Solution**:
- Run: `python -m nltk.downloader vader_lexicon`
- Or run the setup script: `python setup_and_run.py`

### 5. Models Not Found
**Error**: `FileNotFoundError: [Errno 2] No such file or directory: 'backend/models/intent_model.pkl'`

**Solution**:
- Make sure you're in the correct directory
- Check that the `backend/models/` folder contains the `.pkl` files
- Re-download the project if models are missing

### 6. Permission Denied (macOS/Linux)
**Error**: `Permission denied: './start.sh'`

**Solution**:
- Run: `chmod +x start.sh`
- Then run: `./start.sh`

### 7. Analysis Fails with 500 Error
**Error**: `Internal Server Error` when running analysis

**Solution**:
- Restart the server completely
- Check that all models are present
- Run: `python check_requirements.py` to verify setup

### 8. Browser Doesn't Open Automatically
**Solution**:
- Manually open: http://127.0.0.1:8000/ui
- Check if your browser is set as default
- Try a different browser

## Quick Diagnostic

Run this command to check your setup:
```bash
python check_requirements.py
```

## Getting Help

1. **Check the logs**: Look at the terminal output for error messages
2. **Verify setup**: Run `python check_requirements.py`
3. **API docs**: Visit http://127.0.0.1:8000/docs when running
4. **Restart**: Try stopping the server (Ctrl+C) and starting again

## System Requirements

- **Python**: 3.8 or higher
- **RAM**: At least 2GB available
- **Disk Space**: At least 100MB free
- **OS**: Windows 10+, macOS 10.14+, or Linux

## Still Having Issues?

1. Make sure you're in the correct directory (should contain `backend` and `frontend` folders)
2. Try running `python setup_and_run.py` to reinstall everything
3. Check that your Python installation is working: `python --version`
4. Verify pip is working: `pip --version`

**Remember**: The application needs to be running for the web interface to work!
