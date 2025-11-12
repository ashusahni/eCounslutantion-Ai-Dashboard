# 🚀 Quick Start Guide

## Get Started in 3 Steps!

### 1. 📦 Extract & Setup
```bash
# Extract the zip file
unzip econsultation-ai-dashboard.zip
cd econsultation-ai-dashboard

# Run the setup script (optional but recommended)
python setup.py
```

### 2. 🏃‍♂️ Run the Application

**Option A: Use the provided scripts**
- **Windows**: Double-click `run.bat`
- **macOS/Linux**: Run `./run.sh`

**Option B: Manual command**
```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. 🌐 Open Your Browser
Navigate to: **http://127.0.0.1:8000**

---

## 🎯 What You Can Do

1. **Upload Data**: Drag & drop CSV files or enter text comments
2. **Run Analysis**: Click "Run Analysis" to process with AI
3. **Explore Results**: View charts, word clouds, and insights
4. **Search & Filter**: Find specific comments with natural language search

## 📊 Sample Data

Try uploading the included `mca_intent_dataset_850.csv` file to see the AI in action!

## 🆘 Need Help?

- Check the full README.md for detailed instructions
- Visit the API docs at http://127.0.0.1:8000/docs
- Make sure Python 3.8+ is installed

**Enjoy your AI-powered consultation analysis! 🎉**
