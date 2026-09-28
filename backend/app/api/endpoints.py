from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from typing import Dict, Any, Optional
from datetime import datetime

from app.schemas import (
    LocationHierarchy, PanchayatForecastResponse, MapGeoJSONResponse,
    ModelReliabilityResponse, AdvisoryRequest, AdvisoryResponse,
    HealthResponse, RetrainResponse, ComparisonResponse,
    WindsStatusResponse, DAMUApprovalRequest, DAMUApprovalResponse
)
from app.services.data_service import data_service
from app.services.advisory_service import advisory_engine
from app.services.winds_service import winds_service
from app.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["System"])
def get_health():
    """System health check endpoint."""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        model_loaded=data_service.model_service.is_trained,
        model_type=data_service.model_service.model_version,
        data_store_status="connected",
        timestamp=data_service.get_panchayat_map("PANC_001").timestamp
    )

@router.get("/winds/status", response_model=WindsStatusResponse, tags=["WINDS Ingestion"])
def get_winds_status():
    """USP 4: Returns status of Ministry of Agriculture WINDS AWS/ARG ground telemetry network connection."""
    return WindsStatusResponse(**winds_service.get_network_status())

@router.get("/locations", response_model=LocationHierarchy, tags=["Locations"])
def get_locations():
    """Returns administrative hierarchy (India -> State -> District -> Block -> Panchayats)."""
    return data_service.get_locations()

@router.get("/panchayats/{panchayat_id}/forecast", response_model=PanchayatForecastResponse, tags=["Forecast"])
def get_panchayat_forecast(panchayat_id: str):
    """Returns 5-day downscaled forecast with MinT reconciliation (USP 1) & Conformal intervals (USP 2)."""
    try:
        return data_service.get_panchayat_forecast(panchayat_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Forecast error for Panchayat {panchayat_id}: {str(e)}")

@router.get("/panchayats/{panchayat_id}/report", tags=["Report"])
def download_panchayat_report(panchayat_id: str, crop: Optional[str] = "Cotton", lang: Optional[str] = "en"):
    """PART 3.3: Returns generated MausamMesh PDF report for the selected Panchayat."""
    try:
        p_meta = data_service._find_panchayat_meta(panchayat_id)
        p_name = (p_meta.get("name", panchayat_id) if p_meta else panchayat_id).lower().replace(" ", "-")
        pdf_bytes = data_service.generate_pdf_report(panchayat_id, crop_name=crop, lang=lang)
        today_str = datetime.now().strftime("%Y-%m-%d")
        filename = f"mausammesh-report-{p_name}-{today_str}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

@router.get("/panchayats/{panchayat_id}/map", response_model=MapGeoJSONResponse, tags=["Map"])
def get_panchayat_map(panchayat_id: str):
    """Returns GeoJSON polygons for Block baseline, Panchayat forecasts, and residual deltas."""
    try:
        return data_service.get_panchayat_map(panchayat_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Map data error for Panchayat {panchayat_id}: {str(e)}")

@router.get("/panchayats/{panchayat_id}/compare", response_model=ComparisonResponse, tags=["Comparison"])
def get_panchayat_comparison(panchayat_id: str):
    """Returns side-by-side baseline vs model metrics and error reduction for selected Panchayat."""
    try:
        return data_service.get_panchayat_comparison(panchayat_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Comparison error for Panchayat {panchayat_id}: {str(e)}")

@router.get("/panchayats/{panchayat_id}/reliability", response_model=ModelReliabilityResponse, tags=["Reliability"])
def get_panchayat_reliability(panchayat_id: str):
    """Returns model quality metrics (MAE, RMSE, CSI, Conformal Coverage Rate, Feature Importances)."""
    try:
        return data_service.get_reliability_metrics(panchayat_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Reliability metrics error: {str(e)}")

@router.post("/advisory", response_model=AdvisoryResponse, tags=["Advisory"])
def generate_advisory(request: AdvisoryRequest):
    """Generates tailored agro-meteorological advisories, confidence-gated by forecast uncertainty width."""
    try:
        forecast_resp = data_service.get_panchayat_forecast(request.panchayat_id)
        forecast_dicts = [item.model_dump() for item in forecast_resp.five_day_forecast]
        
        return advisory_engine.generate_advisory(
            panchayat_id=request.panchayat_id,
            panchayat_name=forecast_resp.panchayat_name,
            crop_name=request.crop_name,
            growth_stage=request.growth_stage,
            forecast_items=forecast_dicts
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate advisory: {str(e)}")

@router.post("/advisory/approve", response_model=DAMUApprovalResponse, tags=["Advisory DAMU Workflow"])
def approve_advisory(request: DAMUApprovalRequest):
    """USP 5: Officer-in-the-Loop approval endpoint for DAMU (District Agromet Unit) scientists."""
    try:
        p_meta = data_service._find_panchayat_meta(request.panchayat_id)
        p_name = p_meta["name"] if p_meta else "Wagholi"
        return advisory_engine.approve_advisory(
            panchayat_id=request.panchayat_id,
            panchayat_name=p_name,
            crop_name=request.crop_name,
            growth_stage=request.growth_stage,
            officer_name=request.officer_name,
            target_channels=request.target_channels
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DAMU approval failed: {str(e)}")

@router.post("/model/retrain", response_model=RetrainResponse, tags=["Model Management"])
def retrain_model():
    """Triggers XGBoost model retraining on historical observations."""
    try:
        res = data_service.retrain_model()
        return RetrainResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")
