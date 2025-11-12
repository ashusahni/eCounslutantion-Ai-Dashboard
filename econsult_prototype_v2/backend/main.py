from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .config import (
    API_TITLE, 
    API_VERSION, 
    API_DESCRIPTION,
    CORS_ORIGINS,
    CORS_CREDENTIALS,
    CORS_METHODS,
    CORS_HEADERS
)
from .database import create_tables
from .routes import router
from .frontend import get_dashboard_html

# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=CORS_CREDENTIALS,
    allow_methods=CORS_METHODS,
    allow_headers=CORS_HEADERS,
)

# Include API routes
app.include_router(router)

# Mount static files
frontend_dir = Path(__file__).parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir / "static")), name="static")

# Create database tables
create_tables()

@app.get("/ui", response_class=HTMLResponse)
def dashboard():
    """Serve the main dashboard UI"""
    return HTMLResponse(get_dashboard_html())

# For backward compatibility
@app.get("/", include_in_schema=False)
def root():
    """Redirect root to UI"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/ui")
