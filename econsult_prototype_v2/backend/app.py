# This file is kept for backward compatibility
# The new structured version is in main.py

from .main import app

# Export the app for uvicorn compatibility
__all__ = ["app"]