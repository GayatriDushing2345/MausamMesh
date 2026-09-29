from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from typing import Dict, Any, Optional, List
from datetime import datetime

from app.schemas import (
    LocationHierarchy, PanchayatForecastResponse, MapGeoJSONResponse,
    ModelReliabilityResponse, AdvisoryRequest, AdvisoryResponse,
    HealthResponse, RetrainResponse, ComparisonResponse,
    WindsStatusResponse, DAMUApprovalRequest, DAMUApprovalResponse,
    PriorityQueueResponse, PriorityConfigResponse,
    LocationTreeNode, LocationSearchItem, DataHealthResponse,
    BlockForecastUploadResponse
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


# --- Priority Queue Endpoints (USP 1 Core) ---
def parse_and_validate_weights(weights_param: Optional[str]) -> Optional[Dict[str, float]]:
    if not weights_param:
        return None
    try:
        import json
        if weights_param.startswith("{"):
            parsed = json.loads(weights_param)
        else:
            parsed = {}
            for item in weights_param.split(","):
                if "=" in item:
                    k, v = item.split("=", 1)
                    parsed[k.strip()] = float(v.strip())
                elif ":" in item:
                    k, v = item.split(":", 1)
                    parsed[k.strip()] = float(v.strip())

        # Validate non-negative & sum == 100
        for k, v in parsed.items():
            if v < 0:
                raise ValueError(f"Weight {k} cannot be negative")

        weight_sum = sum(parsed.values())
        if abs(weight_sum - 100.0) > 0.5:
            raise ValueError(f"Weights must sum to 100. Got sum={weight_sum}")

        return parsed
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=f"Custom weights validation error: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid weights format: {str(e)}")


@router.get("/priority-queue", response_model=PriorityQueueResponse, tags=["Priority Queue (USP 1)"])
@router.get("/v1/priority-queue", response_model=PriorityQueueResponse, include_in_schema=False)
def get_priority_queue(
    block_id: Optional[str] = None,
    district_id: Optional[str] = None,
    lead_day: int = 1,
    hazard: str = "all",
    crop: str = "all",
    weights: Optional[str] = None
):
    """GET /api/v1/priority-queue: Returns explainable, ranked priority queue for IMD/DAMU Officers."""
    parsed_weights = parse_and_validate_weights(weights)
    try:
        return data_service.get_priority_queue(
            block_id=block_id,
            district_id=district_id,
            lead_day=lead_day,
            hazard=hazard,
            crop=crop,
            custom_weights=parsed_weights
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Priority queue error: {str(e)}")


@router.get("/priority-queue/config", response_model=PriorityConfigResponse, tags=["Priority Queue (USP 1)"])
@router.get("/v1/priority-queue/config", response_model=PriorityConfigResponse, include_in_schema=False)
def get_priority_config():
    """GET /api/v1/priority-queue/config: Returns priority scoring weights, thresholds & data sources."""
    return data_service.get_priority_config()


@router.get("/priority-queue/export.csv", tags=["Priority Queue (USP 1)"])
@router.get("/v1/priority-queue/export.csv", include_in_schema=False)
def export_priority_queue_csv(
    block_id: Optional[str] = None,
    district_id: Optional[str] = None,
    lead_day: int = 1,
    hazard: str = "all",
    crop: str = "all",
    weights: Optional[str] = None
):
    """GET /api/v1/priority-queue/export.csv: Exports filtered priority queue items to CSV."""
    parsed_weights = parse_and_validate_weights(weights)
    try:
        csv_content = data_service.export_priority_queue_csv(
            block_id=block_id,
            district_id=district_id,
            lead_day=lead_day,
            hazard=hazard,
            crop=crop,
            custom_weights=parsed_weights
        )
        today_str = datetime.now().strftime("%Y-%m-%d")
        filename = f"mausammesh-priority-queue-lead{lead_day}-{today_str}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV export error: {str(e)}")


# --- ROUND 4A & 4B: Locations Tree, Search, Nearest, Data Health, Block Forecast Upload ---
from pydantic import BaseModel

class BlockForecastUploadRequest(BaseModel):
    csv_content: str
    dry_run: bool = False

@router.get("/locations/tree", response_model=List[LocationTreeNode], tags=["Locations"])
@router.get("/v1/locations/tree", response_model=List[LocationTreeNode], include_in_schema=False)
def get_location_tree(level: str = "state", parent_id: Optional[str] = None):
    """GET /api/v1/locations/tree: Returns drilldown hierarchy for State -> District -> Block -> Panchayat."""
    try:
        return data_service.get_location_tree(level=level, parent_id=parent_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location tree error: {str(e)}")

@router.get("/locations/search", response_model=List[LocationSearchItem], tags=["Locations"])
@router.get("/v1/locations/search", response_model=List[LocationSearchItem], include_in_schema=False)
def search_locations(q: str, lang: str = "en"):
    """GET /api/v1/locations/search: Universal search matching Panchayat, Village, Block, or LGD code."""
    try:
        return data_service.search_locations(q=q, lang=lang)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location search error: {str(e)}")

@router.get("/locations/nearest", response_model=Optional[LocationSearchItem], tags=["Locations"])
@router.get("/v1/locations/nearest", response_model=Optional[LocationSearchItem], include_in_schema=False)
def get_nearest_location(lat: float, lon: float):
    """GET /api/v1/locations/nearest: GPS nearest panchayat lookup."""
    try:
        return data_service.get_nearest_location(lat=lat, lon=lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nearest location error: {str(e)}")

@router.get("/system/data-health", response_model=DataHealthResponse, tags=["System"])
@router.get("/v1/system/data-health", response_model=DataHealthResponse, include_in_schema=False)
def get_data_health():
    """GET /api/v1/system/data-health: Live telemetry and data sync health monitor."""
    return data_service.get_data_health()

@router.post("/block-forecast/upload", response_model=BlockForecastUploadResponse, tags=["Forecast"])
@router.post("/v1/block-forecast/upload", response_model=BlockForecastUploadResponse, include_in_schema=False)
def upload_block_forecast_csv(request: BlockForecastUploadRequest):
    """POST /api/v1/block-forecast/upload: Official Block Forecast CSV upload & validation."""
    try:
        return data_service.upload_block_forecast_csv(csv_content=request.csv_content, dry_run=request.dry_run)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV upload error: {str(e)}")


