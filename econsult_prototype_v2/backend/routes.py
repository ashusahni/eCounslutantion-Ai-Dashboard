from fastapi import APIRouter, Depends, UploadFile, File, Form, Body, HTTPException
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import csv
import io
from datetime import datetime

from .database import get_db
from .services import CommentService, AnalysisService
from .config import STATIC_DIR, WORDCLOUD_PATH

router = APIRouter()

@router.get("/", include_in_schema=False)
def home():
    """Redirect root to UI dashboard"""
    return RedirectResponse(url="/ui")

@router.post("/ingest")
def ingest_comment(
    text: str = Form(...), 
    clause: str = Form("overall"), 
    db: Session = Depends(get_db)
):
    """Ingest a single comment"""
    service = CommentService(db)
    comment = service.create_comment(text, clause)
    return {"ok": True, "id": comment.id}

@router.post("/ingest_json")
def ingest_comments_json(
    payload: List[Dict[str, str]] = Body(...), 
    db: Session = Depends(get_db)
):
    """Ingest multiple comments via JSON"""
    service = CommentService(db)
    ids = service.create_comments_bulk(payload)
    return {"ok": True, "ids": ids}

@router.post("/upload_csv")
def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and process CSV file with comments"""
    try:
        content = file.file.read().decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(content))
        
        comments_data = []
        for row in reader:
            text = row.get("Comment", "").strip()
            clause = row.get("Clause", "overall") or "overall"
            date_str = row.get("Date")
            
            if not text:
                continue
            
            comment_data = {"text": text, "clause": clause}
            
            # Handle optional date
            if date_str:
                try:
                    parsed_date = datetime.strptime(date_str.strip(), "%Y-%m-%d")
                    comment_data["created_at"] = parsed_date
                except ValueError:
                    pass  # Use default date
            
            comments_data.append(comment_data)
        
        if not comments_data:
            return {"ok": True, "ingested": 0}
        
        service = CommentService(db)
        # For CSV upload, we need to handle dates differently
        # This is a simplified version - in production you'd want to modify the service
        ids = service.create_comments_bulk(comments_data)
        return {"ok": True, "ingested": len(ids)}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV processing error: {str(e)}")

@router.post("/analyze")
def analyze_comments(db: Session = Depends(get_db)):
    """Run AI analysis on all comments"""
    service = AnalysisService(db)
    result = service.analyze_comments()
    return {"ok": True, **result}

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    """Get analysis metrics and statistics"""
    service = AnalysisService(db)
    return service.get_metrics()

@router.get("/comments")
def get_comments(db: Session = Depends(get_db)):
    """Get all comments with predictions"""
    service = AnalysisService(db)
    comments = service.get_comments_with_predictions()
    return {"items": comments}

@router.get("/wordcloud")
def get_wordcloud_image():
    """Get wordcloud image"""
    if not WORDCLOUD_PATH.exists():
        return JSONResponse(
            {"error": "Run /analyze first to generate wordcloud.png"}, 
            status_code=400
        )
    return FileResponse(WORDCLOUD_PATH, media_type="image/png")

@router.get("/wordcloud_map")
def get_wordcloud_map(db: Session = Depends(get_db)):
    """Get wordcloud layout data for interactive visualization"""
    try:
        service = AnalysisService(db)
        return service.get_wordcloud_data()
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/comments_by_keyword")
def get_comments_by_keyword(word: str, db: Session = Depends(get_db)):
    """Get comments filtered by keyword"""
    if not word or not word.strip():
        return {"items": [], "word": word, "count": 0}
    
    service = CommentService(db)
    comments = service.get_comments_by_keyword(word.strip())
    return {"items": comments, "word": word, "count": len(comments)}

@router.post("/clear")
def clear_all_data(db: Session = Depends(get_db)):
    """Clear all comments and predictions"""
    service = CommentService(db)
    service.clear_all_data()
    return {"ok": True, "message": "All comments and predictions cleared."}
