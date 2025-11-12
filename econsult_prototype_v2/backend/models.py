from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Comment(Base):
    """Model for storing consultation comments"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    clause = Column(String(100), default="overall")
    created_at = Column(DateTime, default=datetime.utcnow)

class Prediction(Base):
    """Model for storing AI predictions and analysis results"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer)
    sentiment = Column(String(20))
    sentiment_score = Column(Float)
    summary = Column(Text)
    keywords_json = Column(Text)
    clause = Column(String(100), default="overall")
    created_at = Column(DateTime, default=datetime.utcnow)
