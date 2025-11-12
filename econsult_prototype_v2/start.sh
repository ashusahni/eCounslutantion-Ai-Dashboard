#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "================================================================"
echo "    🚀 eConsultation AI Dashboard - One-Click Launcher"
echo "================================================================"
echo ""
echo "This will automatically:"
echo "  ✅ Check Python installation"
echo "  ✅ Install all dependencies"
echo "  ✅ Download required data"
echo "  ✅ Start the application"
echo "  ✅ Open your browser"
echo ""
echo "================================================================"
echo ""

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python is not installed or not in PATH${NC}"
    echo ""
    echo "Please install Python 3.8+ from: https://python.org"
    echo "Or use your package manager:"
    echo "  - macOS: brew install python"
    echo "  - Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "  - CentOS/RHEL: sudo yum install python3 python3-pip"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Python found! Starting setup...${NC}"
echo ""

# Make the script executable
chmod +x "$0"

# Run the comprehensive setup and run script
python setup_and_run.py

echo ""
echo "================================================================"
echo "    Thanks for using eConsultation AI Dashboard! 🎉"
echo "================================================================"
echo ""
