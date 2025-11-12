from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .models import Comment, Prediction
from .utils import (
    redact_pii, 
    simple_summarize, 
    classify_intent, 
    classify_sentiment,
    extract_keywords,
    generate_wordcloud,
    get_wordcloud_layout
)
import json
try:
    import yake
except ImportError:
    yake = None

class CommentService:
    """Service for managing comments and predictions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_comment(self, text: str, clause: str = "overall") -> Comment:
        """Create a new comment with PII redaction"""
        redacted_text = redact_pii(text)
        comment = Comment(text=redacted_text, clause=clause or "overall")
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment
    
    def create_comments_bulk(self, comments_data: List[Dict[str, str]]) -> List[int]:
        """Create multiple comments in bulk"""
        comments = []
        for item in comments_data:
            text = item.get("text", "").strip()
            clause = item.get("clause", "overall") or "overall"
            if not text:
                continue
            comments.append(Comment(text=redact_pii(text), clause=clause))
        
        if not comments:
            return []
        
        self.db.bulk_save_objects(comments)
        self.db.commit()
        
        # Get the created comment IDs
        n = len(comments)
        rows = self.db.query(Comment).order_by(Comment.id.desc()).limit(n).all()
        return [r.id for r in reversed(rows)]
    
    def get_all_comments(self) -> List[Comment]:
        """Get all comments"""
        return self.db.query(Comment).all()
    
    def get_comments_by_keyword(self, keyword: str) -> List[Dict[str, Any]]:
        """Get comments filtered by keyword"""
        keyword_lower = keyword.lower()
        predictions = self.db.query(Prediction).all()
        results = []
        
        for pred in predictions:
            comment = self.db.query(Comment).filter(Comment.id == pred.comment_id).first()
            if not comment:
                continue
            
            text = comment.text or ""
            try:
                keywords = json.loads(pred.keywords_json or "[]")
            except Exception:
                keywords = []
            
            # Check if keyword matches text or extracted keywords
            if (keyword_lower in text.lower()) or any((k or "").lower() == keyword_lower for k in keywords):
                results.append({
                    "id": comment.id,
                    "text": comment.text,
                    "clause": comment.clause,
                    "sentiment": pred.sentiment,
                    "score": round(pred.sentiment_score, 3),
                    "summary": pred.summary,
                    "keywords": keywords,
                    "created_at": comment.created_at.isoformat()
                })
        
        return results
    
    def clear_all_data(self) -> None:
        """Clear all comments and predictions"""
        self.db.query(Prediction).delete()
        self.db.query(Comment).delete()
        self.db.commit()

class AnalysisService:
    """Service for AI analysis and predictions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def analyze_comments(self) -> Dict[str, Any]:
        """Run AI analysis on all comments - Updated"""
        comments = self.db.query(Comment).all()
        
        # Clear existing predictions
        self.db.query(Prediction).delete()
        self.db.commit()
        
        texts = []
        for comment in comments:
            # Classify intent
            intent_label, intent_score = classify_intent(comment.text)
            
            # Generate summary
            summary = simple_summarize(comment.text)
            
            # Extract keywords
            if yake is not None:
                try:
                    kw_extractor = yake.KeywordExtractor(lan="en", n=1, top=5)
                    keywords = kw_extractor.extract_keywords(comment.text or "")
                    keywords_json = json.dumps([k for k, s in keywords])
                except Exception as e:
                    # Fallback to simple keyword extraction
                    keywords = extract_keywords([comment.text or ""], topk=5)
                    keywords_json = json.dumps([k for k, s in keywords])
            else:
                # Use simple keyword extraction if yake is not available
                keywords = extract_keywords([comment.text or ""], topk=5)
                keywords_json = json.dumps([k for k, s in keywords])
            
            # Create prediction record
            prediction = Prediction(
                comment_id=comment.id,
                sentiment=intent_label,
                sentiment_score=intent_score,
                summary=summary,
                keywords_json=keywords_json,
                clause=comment.clause
            )
            self.db.add(prediction)
            texts.append(comment.text or "")
        
        self.db.commit()
        
        # Generate wordcloud
        freqs = extract_keywords(texts, topk=30)
        generate_wordcloud(freqs)
        
        return {"processed": len(texts)}
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get analysis metrics and statistics"""
        predictions = self.db.query(Prediction).all()
        summary = {}
        by_clause = {}
        
        for pred in predictions:
            label = pred.sentiment or "UNKNOWN"
            summary[label] = summary.get(label, 0) + 1
            
            if pred.clause not in by_clause:
                by_clause[pred.clause] = {"count": 0}
            by_clause[pred.clause]["count"] += 1
            by_clause[pred.clause][label] = by_clause[pred.clause].get(label, 0) + 1
        
        return {
            "overall": summary,
            "by_clause": by_clause,
            "total": len(predictions)
        }
    
    def get_comments_with_predictions(self) -> List[Dict[str, Any]]:
        """Get all comments with their AI predictions"""
        predictions = self.db.query(Prediction).all()
        results = []
        
        for pred in predictions:
            comment = self.db.query(Comment).filter(Comment.id == pred.comment_id).first()
            if not comment:
                continue
            
            try:
                keywords = json.loads(pred.keywords_json or "[]")
            except Exception:
                keywords = []
            
            results.append({
                "id": comment.id,
                "text": comment.text,
                "clause": comment.clause,
                "sentiment": pred.sentiment,
                "score": round(pred.sentiment_score, 3),
                "summary": pred.summary,
                "keywords": keywords,
                "created_at": comment.created_at.isoformat()
            })
        
        return results
    
    def get_wordcloud_data(self) -> Dict[str, Any]:
        """Get wordcloud layout data for interactive visualization"""
        comments = self.db.query(Comment).all()
        texts = [(c.text or "") for c in comments]
        freqs = extract_keywords(texts, topk=30)
        words = get_wordcloud_layout(freqs)
        
        return {
            "width": 900,
            "height": 500,
            "words": words
        }
