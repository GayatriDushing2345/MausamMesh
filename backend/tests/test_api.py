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
    assert len(data["five_day_forecast"]) in [5, 8]
    assert "evidence_chips" in data
    assert data["model_used"] == "xgboost"

def test_panchayat_fallback_honesty_endpoint():
    # PANC_005 is explicitly designated as baseline fallback demo
    response = client.get("/api/v1/panchayats/PANC_005/forecast")
    assert response.status_code == 200
    data = response.json()
    assert data["panchayat_id"] == "PANC_005"
    assert data["model_used"] == "baseline"
    assert data["baseline_fallback_reason"] is not None

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

def test_location_tree_endpoint():
    response = client.get("/api/v1/locations/tree?level=state")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["level"] == "state"

def test_location_search_endpoint():
    response = client.get("/api/v1/locations/search?q=Wagholi")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any("Wagholi" in item["name"] for item in data)

def test_data_health_endpoint():
    response = client.get("/api/v1/system/data-health")
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] in ["green", "amber", "red"]
    assert len(data["sources"]) >= 3

