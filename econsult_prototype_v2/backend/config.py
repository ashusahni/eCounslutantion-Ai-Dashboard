import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Database configuration
DATABASE_URL = "sqlite:///./comments.db"

# Model paths
MODELS_DIR = BASE_DIR / "models"
INTENT_MODEL_PATH = MODELS_DIR / "intent_model.pkl"
SENTIMENT_MODEL_PATH = MODELS_DIR / "sklearn_sentiment.pkl"

# Static files
STATIC_DIR = BASE_DIR / "static"
WORDCLOUD_PATH = STATIC_DIR / "wordcloud.png"

# API configuration
API_TITLE = "eConsultation – Pie Chart Dashboard"
API_VERSION = "0.34"
API_DESCRIPTION = "AI-powered consultation analysis dashboard"

# CORS settings
CORS_ORIGINS = ["*"]
CORS_CREDENTIALS = True
CORS_METHODS = ["*"]
CORS_HEADERS = ["*"]

# PII regex pattern
PII_REGEX_PATTERN = r"(?:\b\d{10}\b)|(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})"

# WordCloud settings
WORDCLOUD_WIDTH = 900
WORDCLOUD_HEIGHT = 500
WORDCLOUD_BACKGROUND_COLOR = "white"
WORDCLOUD_TOP_KEYWORDS = 30

# Intent classification colors
INTENT_COLORS = {
    "AGREE": "#3B82F6",
    "DISAGREE": "#EF4444", 
    "SUGGEST_CHANGE": "#22C55E",
    "REQUEST_CLARIFICATION": "#F59E0B",
    "CLAUSE_FEEDBACK": "#64748B"
}
