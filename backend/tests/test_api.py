import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_winds_status_endpoint():
    response = client.get("/api/v1/winds/status")
    assert response.status_code == 200
    data = response.json()
    assert "WINDS" in data["network_name"]
    assert data["active_telemetry_feed"] is True

def test_locations_endpoint():
    response = client.get("/api/v1/locations")
    assert response.status_code == 200
    data = response.json()
    assert "districts" in data

def test_panchayat_forecast_endpoint():
    response = client.get("/api/v1/panchayats/PANC_001/forecast")
    assert response.status_code == 200
    data = response.json()
    assert data["panchayat_id"] == "PANC_001"
    assert data["is_mint_reconciled"] is True
    assert data["is_conformal_calibrated"] is True
    assert len(data["five_day_forecast"]) == 5

def test_panchayat_compare_endpoint():
    response = client.get("/api/v1/panchayats/PANC_007/compare")
    assert response.status_code == 200
    data = response.json()
    assert data["panchayat_id"] == "PANC_007"
    assert data["is_hilly_hero_panchayat"] is True

def test_panchayat_reliability_endpoint():
    response = client.get("/api/v1/panchayats/PANC_001/reliability")
    assert response.status_code == 200
    data = response.json()
    assert "conformal_coverage_rate_pct" in data

def test_damu_advisory_approval_post():
    payload = {
        "panchayat_id": "PANC_001",
        "crop_name": "Paddy",
        "growth_stage": "Vegetative",
        "officer_name": "Dr. A. K. Sharma (DAMU Nodal Officer)",
        "target_channels": ["SMS", "WhatsApp", "Meghdoot"]
    }
    response = client.post("/api/v1/advisory/approve", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Approved & Dispatched"

def test_panchayat_report_pdf_endpoint():
    response = client.get("/api/v1/panchayats/PANC_001/report?crop=Cotton")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000
