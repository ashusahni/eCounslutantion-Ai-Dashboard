import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_home_redirect():
    """Test that home redirects to UI"""
    response = client.get("/")
    assert response.status_code == 307  # Redirect
    assert response.headers["location"] == "/ui"

def test_ui_endpoint():
    """Test that UI endpoint returns HTML"""
    response = client.get("/ui")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "eConsultation" in response.text

def test_ingest_comment():
    """Test comment ingestion"""
    response = client.post("/ingest", data={"text": "Test comment", "clause": "overall"})
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "id" in data

def test_ingest_json():
    """Test JSON comment ingestion"""
    comments = [{"text": "Test comment 1", "clause": "overall"}]
    response = client.post("/ingest_json", json=comments)
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "ids" in data

def test_metrics_endpoint():
    """Test metrics endpoint"""
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "overall" in data
    assert "by_clause" in data
    assert "total" in data

def test_comments_endpoint():
    """Test comments endpoint"""
    response = client.get("/comments")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert isinstance(data["items"], list)

def test_clear_endpoint():
    """Test clear endpoint"""
    response = client.post("/clear")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "message" in data
