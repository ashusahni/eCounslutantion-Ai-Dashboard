import re
import json
import os
from typing import Dict, List, Tuple, Optional
from joblib import load as joblib_load
import yake
from wordcloud import WordCloud
from .config import (
    PII_REGEX_PATTERN, 
    INTENT_MODEL_PATH, 
    SENTIMENT_MODEL_PATH,
    STATIC_DIR,
    WORDCLOUD_WIDTH,
    WORDCLOUD_HEIGHT,
    WORDCLOUD_BACKGROUND_COLOR,
    WORDCLOUD_TOP_KEYWORDS
)

# Load models
INTENT_MODEL = None
SENTIMENT_MODEL = None

def load_models():
    """Load AI models for intent classification and sentiment analysis"""
    global INTENT_MODEL, SENTIMENT_MODEL
    
    # Load intent model
    try:
        if INTENT_MODEL_PATH.exists():
            INTENT_MODEL = joblib_load(INTENT_MODEL_PATH)
            print("✅ Loaded intent_model.pkl")
        else:
            print("⚠️ Intent model not found")
    except Exception as e:
        print("⚠️ Could not load intent model:", e)
    
    # Load sentiment model
    try:
        if SENTIMENT_MODEL_PATH.exists():
            SENTIMENT_MODEL = joblib_load(SENTIMENT_MODEL_PATH)
            print("✅ Loaded sklearn_sentiment.pkl")
        else:
            print("⚠️ Sentiment model not found")
    except Exception as e:
        print("⚠️ Could not load sentiment model:", e)

# Initialize models
load_models()

# PII regex pattern
PII_REGEX = re.compile(PII_REGEX_PATTERN)

def redact_pii(text: str) -> str:
    """Remove personally identifiable information from text"""
    return PII_REGEX.sub("[REDACTED]", text or "")

def simple_summarize(text: str, max_sentences: int = 2) -> str:
    """Create a simple summary by taking the first few sentences"""
    sentences = re.split(r'(?<=[.!?])\s+', (text or "").strip())
    return " ".join(sentences[:max_sentences]) if sentences else text

def classify_intent(text: str) -> Tuple[str, float]:
    """
    Classify the intent of a comment using the trained model
    Returns (intent_label, confidence_score)
    """
    if INTENT_MODEL is None:
        return "REQUEST_CLARIFICATION", 0.0
    
    try:
        pipe = INTENT_MODEL["pipeline"]
        labels = INTENT_MODEL["labels"]
        probs = pipe.predict_proba([text or ""])[0]
        idx = int(probs.argmax())
        return labels[idx], float(probs[idx])
    except Exception as e:
        print(f"Error in intent classification: {e}")
        return "REQUEST_CLARIFICATION", 0.0

def classify_sentiment(text: str) -> Tuple[str, float]:
    """
    Classify sentiment of a comment using the trained model
    Returns (sentiment_label, confidence_score)
    """
    if SENTIMENT_MODEL is None:
        return "neutral", 0.0
    
    try:
        pred = SENTIMENT_MODEL.predict([text or ""])[0]
        return pred, 0.0
    except Exception as e:
        print(f"Error in sentiment classification: {e}")
        return "neutral", 0.0

def extract_keywords(texts: List[str], topk: int = WORDCLOUD_TOP_KEYWORDS) -> Dict[str, float]:
    """Extract keywords from a list of texts using YAKE"""
    if not texts:
        return {"feedback": 1, "policy": 1, "comment": 1}
    
    try:
        kw_extractor = yake.KeywordExtractor(lan="en", n=1, top=topk)
        big_text = "\n".join(texts)
        keywords = kw_extractor.extract_keywords(big_text)
        freqs = {k: max(1.0/(s+1e-6), 1.0) for k, s in keywords if len(k) > 2}
        return freqs
    except Exception as e:
        print(f"Error extracting keywords: {e}")
        return {"feedback": 1, "policy": 1, "comment": 1}

def generate_wordcloud(freqs: Dict[str, float], out_path: Optional[str] = None) -> str:
    """Generate wordcloud image from keyword frequencies"""
    if out_path is None:
        out_path = STATIC_DIR / "wordcloud.png"
    
    # Ensure static directory exists
    STATIC_DIR.mkdir(exist_ok=True)
    
    if not freqs:
        freqs = {"feedback": 1, "policy": 1, "comment": 1}
    
    try:
        wc = WordCloud(
            width=WORDCLOUD_WIDTH, 
            height=WORDCLOUD_HEIGHT, 
            background_color=WORDCLOUD_BACKGROUND_COLOR
        )
        img = wc.generate_from_frequencies(freqs).to_image()
        img.save(out_path)
        return str(out_path)
    except Exception as e:
        print(f"Error generating wordcloud: {e}")
        return str(out_path)

def get_wordcloud_layout(freqs: Dict[str, float]) -> List[Dict]:
    """Get word positions for interactive wordcloud"""
    try:
        wc = WordCloud(
            width=WORDCLOUD_WIDTH, 
            height=WORDCLOUD_HEIGHT, 
            background_color=WORDCLOUD_BACKGROUND_COLOR
        )
        wc.generate_from_frequencies(freqs)
        layout = getattr(wc, "layout_", []) or []
        
        words = []
        for item in layout:
            try:
                (word, _freq), font_size, position, orientation, _color = item
                x, y = position
                words.append({
                    "text": word,
                    "font_size": int(font_size),
                    "x": int(x),
                    "y": int(y),
                    "orientation": int(orientation or 0)
                })
            except Exception:
                continue
        return words
    except Exception as e:
        print(f"Error getting wordcloud layout: {e}")
        return []
