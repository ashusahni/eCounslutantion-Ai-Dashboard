# eConsultation AI Dashboard

A modern, AI-powered consultation analysis platform built with FastAPI and a beautiful responsive frontend. This application provides intelligent sentiment analysis, intent classification, and interactive data visualization for consultation comments.

## 🚀 Features

- **AI-Powered Analysis**: Intent classification and sentiment analysis using trained ML models
- **Interactive Dashboard**: Real-time charts, word clouds, and data visualization
- **Data Import**: Support for CSV uploads and bulk JSON ingestion
- **Search & Filter**: Natural language search with clause-specific filtering
- **Modern UI**: Responsive design with glassmorphism effects and smooth animations
- **RESTful API**: Clean API endpoints for integration with other systems

## 📸 Screenshots

The dashboard features a modern, professional interface with:
- Beautiful loading screen with animated spinner
- Hero section with real-time statistics
- Drag-and-drop file upload with visual feedback
- Interactive charts and data visualizations
- Advanced search and filtering capabilities
- Responsive design for all devices

## 🛠️ Installation & Setup

### Prerequisites

- **Python 3.8 or higher** (tested with Python 3.11+)
- **pip** (Python package manager)
- **Git** (for cloning the repository)

### Quick Start

1. **Extract the project**
   ```bash
   # Extract the zip file to your desired location
   unzip econsultation-ai-dashboard.zip
   cd econsultation-ai-dashboard
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download NLTK data**
   ```bash
   python -m nltk.downloader vader_lexicon
   ```

5. **Run the application**
   ```bash
   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

6. **Open your browser**
   Navigate to: `http://127.0.0.1:8000` or `http://localhost:8000`

## 📁 Project Structure

```
econsultation-ai-dashboard/
├── backend/                    # Backend API and services
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── app.py                  # Backward compatibility wrapper
│   ├── config.py               # Configuration management
│   ├── database.py             # Database setup and connection
│   ├── models.py               # SQLAlchemy data models
│   ├── routes.py               # API route handlers
│   ├── services.py             # Business logic services
│   ├── utils.py                # Utility functions and AI helpers
│   ├── frontend.py             # Frontend HTML generation
│   └── models/                 # Trained ML models
│       ├── intent_model.pkl
│       └── sklearn_sentiment.pkl
├── frontend/                   # Frontend assets
│   ├── index.html              # Main dashboard HTML
│   └── static/
│       ├── css/
│       │   └── dashboard.css   # Modern CSS with glassmorphism
│       └── js/
│           └── dashboard.js    # Interactive JavaScript
├── tests/                      # Test suite
├── requirements.txt            # Production dependencies
├── requirements-dev.txt        # Development dependencies
├── pyproject.toml             # Project configuration
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🎯 Usage Guide

### 1. Data Input

**Text Input:**
- Enter comments one per line in the text area
- Use `::ClauseName` to tag specific clauses
- Example: `This is a great proposal ::Clause 7`

**CSV Upload:**
- Click the upload area or drag and drop CSV files
- Required columns: `Comment`, `Clause`
- Optional column: `Date` (format: YYYY-MM-DD)
- Download template CSV for reference

### 2. AI Analysis

1. **Upload your data** using text input or CSV upload
2. **Click "Run Analysis"** to process comments with AI models
3. **View results** in the analytics dashboard

### 3. Data Visualization

- **Sentiment Analysis**: Interactive pie charts showing sentiment distribution
- **Intent Classification**: Clause-wise intent analysis (Agree, Disagree, Suggest Change, etc.)
- **Word Cloud**: Visual representation of most frequent terms
- **Comments Table**: Searchable and filterable table of all comments

### 4. Search & Filter

- **Natural Language Search**: Type queries like "clause 7 negative comments"
- **Filter by Sentiment**: Positive, Negative, Neutral
- **Filter by Intent**: Agree, Disagree, Suggest Change, etc.
- **Real-time Results**: Instant filtering as you type

## 🔧 API Endpoints

The application provides a RESTful API for integration:

- `POST /ingest` - Ingest a single comment
- `POST /ingest_json` - Ingest multiple comments via JSON
- `POST /upload_csv` - Upload and process CSV file
- `POST /analyze` - Run AI analysis on all comments
- `GET /metrics` - Get analysis metrics and statistics
- `GET /comments` - Get all comments with predictions
- `GET /wordcloud` - Get wordcloud image
- `GET /wordcloud_map` - Get wordcloud layout data
- `GET /comments_by_keyword` - Filter comments by keyword
- `POST /clear` - Clear all data

### API Documentation

Once the server is running, visit:
- **Interactive API docs**: http://127.0.0.1:8000/docs
- **ReDoc documentation**: http://127.0.0.1:8000/redoc

## 🤖 AI Models

The application uses two trained machine learning models:

1. **Intent Classification Model** (`intent_model.pkl`): Classifies comments into:
   - AGREE
   - DISAGREE
   - SUGGEST_CHANGE
   - REQUEST_CLARIFICATION
   - CLAUSE_FEEDBACK

2. **Sentiment Analysis Model** (`sklearn_sentiment.pkl`): Analyzes sentiment as:
   - Positive
   - Negative
   - Neutral

## 🎨 UI Features

### Modern Design
- **Glassmorphism Effects**: Beautiful frosted glass cards with backdrop blur
- **Gradient Backgrounds**: Sophisticated color schemes and animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects, transitions, and loading states

### Interactive Elements
- **Drag & Drop Upload**: Visual feedback for file uploads
- **Real-time Search**: Debounced search with instant results
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Button loading indicators and progress feedback

### Data Visualization
- **Interactive Charts**: Enhanced Chart.js visualizations
- **Export Functionality**: Download charts and data
- **Word Cloud**: Clickable word cloud with filtering
- **Advanced Filtering**: Multiple filter options with real-time updates

## 🚀 Development

### Running in Development Mode

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run with auto-reload
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### Running Tests

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=backend tests/
```

### Code Quality

```bash
# Format code
black backend/ tests/

# Lint code
flake8 backend/ tests/

# Type checking
mypy backend/
```

## 🔧 Configuration

Configuration is managed in `backend/config.py`. Key settings include:

- Database URL
- Model paths
- CORS settings
- WordCloud parameters
- Intent classification colors

## 🚀 Deployment

### Production Setup

1. **Install production dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set environment variables**
   ```bash
   export DATABASE_URL="sqlite:///./comments.db"
   export DEBUG=False
   ```

3. **Run with production server**
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python -m nltk.downloader vader_lexicon

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🐛 Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'backend'**
   - Make sure you're running the command from the project root directory
   - Ensure you're in the `econsultation-ai-dashboard` folder

2. **Port already in use**
   - Change the port: `uvicorn backend.main:app --reload --port 8001`
   - Or kill the process using the port

3. **NLTK data not found**
   - Run: `python -m nltk.downloader vader_lexicon`

4. **Models not loading**
   - Ensure the `backend/models/` directory contains the `.pkl` files
   - Check file permissions

5. **Analysis fails with 500 error**
   - This is usually due to server not reloading properly
   - **Solution**: Restart the server completely:
     ```bash
     # Stop the current server (Ctrl+C)
     # Then restart:
     uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
     ```
   - Or use the provided restart script: `python restart_server.py`

### Getting Help

- Check the terminal output for error messages
- Visit the API documentation at `/docs`
- Ensure all dependencies are installed correctly

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs`

## 🔄 Version History

### v2.0.0
- Complete UI redesign with modern glassmorphism effects
- Enhanced user experience with smooth animations
- Improved data visualization and interactive charts
- Advanced search and filtering capabilities
- Responsive design for all devices
- Comprehensive error handling and loading states

### v1.x
- Basic functionality with monolithic structure
- Simple dashboard interface
- CSV upload support

---

**🎉 Enjoy your AI-powered consultation analysis platform!**

For the best experience, use a modern web browser (Chrome, Firefox, Safari, Edge) and ensure JavaScript is enabled.