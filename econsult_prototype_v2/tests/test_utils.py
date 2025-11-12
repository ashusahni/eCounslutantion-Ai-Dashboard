import pytest
from backend.utils import redact_pii, simple_summarize, extract_keywords

def test_redact_pii():
    """Test PII redaction"""
    # Test phone number
    assert redact_pii("Call me at 1234567890") == "Call me at [REDACTED]"
    
    # Test email
    assert redact_pii("Email me at test@example.com") == "Email me at [REDACTED]"
    
    # Test no PII
    assert redact_pii("This is a normal comment") == "This is a normal comment"
    
    # Test empty string
    assert redact_pii("") == ""

def test_simple_summarize():
    """Test simple summarization"""
    # Test normal text
    text = "This is the first sentence. This is the second sentence. This is the third sentence."
    result = simple_summarize(text, max_sentences=2)
    assert "first sentence" in result
    assert "second sentence" in result
    assert "third sentence" not in result
    
    # Test single sentence
    text = "This is a single sentence."
    result = simple_summarize(text)
    assert result == text
    
    # Test empty text
    assert simple_summarize("") == ""

def test_extract_keywords():
    """Test keyword extraction"""
    texts = ["This is a test comment about policy", "Another comment about feedback"]
    keywords = extract_keywords(texts, topk=5)
    
    assert isinstance(keywords, dict)
    assert len(keywords) > 0
    
    # Test with empty list
    empty_keywords = extract_keywords([])
    assert isinstance(empty_keywords, dict)
    assert "feedback" in empty_keywords  # Default fallback
