#!/usr/bin/env python3
"""
eConsultation Prototype v2 - Startup Script
"""

import uvicorn
import sys
import os

def main():
    """Main entry point for the application"""
    # Add the current directory to Python path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    # Run the application
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
