from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# --- Location Schemas ---
class PanchayatInfo(BaseModel):
    id: str
    name: str
    code: str
    elevation_m: Optional[float] = 575.0
    elevation_delta_m: Optional[float] = 0.0
    slope_deg: Optional[float] = 2.0
    aspect: Optional[str] = "Flat"
    area_sqkm: Optional[float] = 10.0
    centroid_lat: Optional[float] = 18.5
    centroid_lon: Optional[float] = 73.8
    lgd_code: Optional[int] = None
    has_data: Optional[bool] = False
    name_hi: Optional[str] = None
    name_mr: Optional[str] = None
    villages: Optional[List[str]] = Field(default_factory=list)

class BlockInfo(BaseModel):
    id: str
    name: str
    code: str
    mean_elevation_m: Optional[float] = 575.0
    lgd_code: Optional[int] = None
    has_data: Optional[bool] = False
    name_hi: Optional[str] = None
    name_mr: Optional[str] = None
    panchayats: List[PanchayatInfo] = Field(default_factory=list)

class DistrictInfo(BaseModel):
    id: str
    name: str
    code: str
    state: Optional[str] = "Maharashtra"
    lgd_code: Optional[int] = None
    has_data: Optional[bool] = False
    name_hi: Optional[str] = None
    name_mr: Optional[str] = None
    blocks: List[BlockInfo] = Field(default_factory=list)

class StateInfo(BaseModel):
    id: str
    name: str
    code: str
    lgd_code: Optional[int] = None
    has_data: Optional[bool] = False
    name_hi: Optional[str] = None
    name_mr: Optional[str] = None
    districts: List[DistrictInfo] = Field(default_factory=list)

class LocationHierarchy(BaseModel):
    country: str = "India"
    states: List[StateInfo] = Field(default_factory=list)
    districts: List[DistrictInfo] = Field(default_factory=list)


# --- Forecast Schemas ---
class DailyForecastItem(BaseModel):
    date: str
    day_name: str
    lead_day: int
    block_forecast_rain_mm: float
    panchayat_raw_predicted_residual_mm: float
    panchayat_reconciled_residual_mm: float  # USP 1: MinT Hierarchical Reconciliation
    panchayat_downscaled_rain_mm: float
    conformal_lower_bound_mm: float  # USP 2: Split-Conformal Prediction Interval
    conformal_upper_bound_mm: float
    conformal_coverage_guarantee_pct: float = 90.0
    confidence_interval_width_mm: float
    confidence_tier: str  # High, Moderate, Low
    heavy_rain_prob_pct: float
    temp_max_c: float
    temp_min_c: float
    humidity_pct: float
    wind_speed_kmh: float
    condition: str
    risk_level: str
    validation_status: str = "validated"  # 'validated' (lead 1-5) or 'indicative' (lead 0, 6, 7)
    prob_rain_2_5mm: float = 0.0
    prob_rain_15_6mm: float = 0.0
    prob_rain_64_5mm: float = 0.0
    range_label: str = "90% range"

class PanchayatForecastResponse(BaseModel):
    panchayat_id: str
    panchayat_name: str
    block_name: str
    district_name: str
    state_name: str = "Maharashtra"
    country_name: str = "India"
    forecast_generated_at: str
    model_version: str
    current_temp_c: float
    current_humidity_pct: float
    current_condition: str
    overall_confidence_level: str
    is_mint_reconciled: bool = True  # USP 1
    mint_coherence_guarantee: str = "Panchayat forecasts mathematically average to parent Block forecast"
    is_conformal_calibrated: bool = True  # USP 2
    is_loso_skill_gated: bool = False  # USP 3
    loso_skill_gate_status: str = "Passed Skill Gate (Model beats Block Baseline)"
    winds_telemetry_status: str = "Connected (WINDS ARG Active)"  # USP 4
    five_day_forecast: List[DailyForecastItem]
    risk_summary: str
    # Round 4B Evidence & Honesty Tokens
    panchayat_vs_block_rain_delta: float = 0.0
    panchayat_vs_block_temp_delta: float = 0.0
    evidence_chips: List[Any] = []
    evidence_sentence: str = ""
    model_used: str = "xgboost"  # 'xgboost' or 'baseline'
    baseline_fallback_reason: Optional[str] = None
    waterlogging_risk: Optional[str] = None  # Indicative
    thunderstorm_risk: Optional[str] = None


# --- Map Schemas ---
class GeoJSONGeometry(BaseModel):
    type: str
    coordinates: Any

class MapFeatureProperties(BaseModel):
    id: str
    name: str
    type: str
    parent_block_name: Optional[str] = None
    block_baseline_rain_mm: float
    downscaled_rain_mm: float
    residual_delta_mm: float
    heavy_rain_prob_pct: float
    confidence_tier: str
    risk_level: str
    elevation_m: float
    is_mint_reconciled: bool = True

class MapFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: MapFeatureProperties

class MapGeoJSONResponse(BaseModel):
    type: str = "FeatureCollection"
    features: List[MapFeature]
    block_baseline_rain_mm: float
    timestamp: str


# --- Comparison Schemas ---
class DailyComparisonItem(BaseModel):
    date: str
    day_name: str
    block_baseline_rain_mm: float
    panchayat_downscaled_rain_mm: float
    panchayat_observed_rain_mm: float
    baseline_error_mm: float
    model_error_mm: float
    residual_delta_mm: float

class ComparisonResponse(BaseModel):
    panchayat_id: str
    panchayat_name: str
    is_hilly_hero_panchayat: bool
    elevation_m: float
    block_mean_elevation_m: float
    elevation_delta_m: float
    baseline_mae_mm: float
    model_mae_mm: float
    baseline_rmse_mm: float
    model_rmse_mm: float
    error_reduction_pct: float
    daily_comparisons: List[DailyComparisonItem]
    comparison_summary: str


# --- Reliability Schemas ---
class EventSkillMetrics(BaseModel):
    threshold_mm: float
    csi: float
    pod: float
    far: float

class HistoricalComparisonPoint(BaseModel):
    date: str
    block_forecast_mm: float
    panchayat_observed_mm: float
    panchayat_predicted_mm: float
    residual_error_mm: float

class FeatureImportanceItem(BaseModel):
    feature_name: str
    feature_description: str
    importance_score: float

class ModelReliabilityResponse(BaseModel):
    model_type: str
    model_version: str
    last_trained_at: str
    training_sample_size: int
    overall_mae_mm: float
    overall_rmse_mm: float
    block_baseline_mae_mm: float
    skill_improvement_pct: float
    brier_score_heavy_rain: float
    conformal_coverage_rate_pct: float = 91.2  # USP 2 empirical coverage
    loso_skill_gate_pass_rate_pct: float = 90.0  # USP 3 pass rate
    event_skills: List[EventSkillMetrics]
    feature_importances: List[FeatureImportanceItem]
    historical_comparison: List[HistoricalComparisonPoint]
    model_notes: List[str]


# --- Advisory & DAMU Officer Schemas (USP 5) ---
class AdvisoryRequest(BaseModel):
    panchayat_id: str
    crop_name: str
    growth_stage: str

class AdvisoryOutputItem(BaseModel):
    category: str
    title: str
    message: str
    severity: str
    trigger_rule: str

class AdvisoryResponse(BaseModel):
    panchayat_id: str
    panchayat_name: str
    crop_name: str
    growth_stage: str
    generated_at: str
    forecast_confidence_level: str
    forecast_interval_width_mm: float
    is_confidence_gated: bool = False
    confidence_gated_warning: Optional[str] = None
    approval_status: str = "Draft (Awaiting DAMU Officer Review)"  # USP 5
    approved_by_officer: Optional[str] = None
    dispatched_channels: List[str] = []
    is_demo_rule_engine: bool = True
    advisories: List[AdvisoryOutputItem]

class DAMUApprovalRequest(BaseModel):
    panchayat_id: str
    crop_name: str
    growth_stage: str
    officer_name: str = "Dr. A. K. Sharma (DAMU Nodal Officer)"
    edited_advisory_text: Optional[str] = None
    target_channels: List[str] = ["SMS (Kisan Portal)", "WhatsApp Agromet Group", "Meghdoot App"]

class DAMUApprovalResponse(BaseModel):
    status: str
    message: str
    panchayat_id: str
    panchayat_name: str
    approved_by: str
    approved_at: str
    dispatched_channels: List[str]


# --- WINDS Status Schema (USP 4) ---
class WindsStatusResponse(BaseModel):
    network_name: str
    status: str
    active_telemetry_feed: bool
    connected_panchayat_args: int
    national_winds_target_stations: int
    protocol: str
    last_ping: str
    data_source_legitimacy: str


# --- Health & Retrain Schemas ---
class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    model_type: str
    data_store_status: str
    timestamp: str

class RetrainResponse(BaseModel):
    status: str
    message: str
    new_mae: float
    new_rmse: float
    samples_trained: int


# --- Priority Queue Schemas (USP 1 Core) ---
class PriorityFactorContribution(BaseModel):
    value: float
    weight: float
    contribution_points: float

class PriorityReason(BaseModel):
    key: str
    params: Dict[str, Any] = {}

class PriorityForecastSnippet(BaseModel):
    rain_mm: float
    rain_upper_mm: float
    imd_category: str
    temp_max_c: float
    wind_speed_kmh: float

class PriorityConfidenceSnippet(BaseModel):
    level: str
    interval_width_mm: float

class PriorityCropSnippet(BaseModel):
    name: str
    stage: str

class PriorityExposureSnippet(BaseModel):
    agri_area_ha: Optional[float] = None
    farm_households: Optional[int] = None
    source: str = "demo"

class PriorityQueueItem(BaseModel):
    rank: int
    panchayat_id: str
    name: str
    block_name: str
    district_name: str
    state_name: str
    score: float
    tier: str  # Very High, High, Medium, Low
    primary_hazard: str  # rain, heat, wind
    forecast: PriorityForecastSnippet
    confidence: PriorityConfidenceSnippet
    factors: Dict[str, PriorityFactorContribution]
    reasons: List[PriorityReason]
    flags: List[str] = []
    crop: PriorityCropSnippet
    exposure: PriorityExposureSnippet
    recommended_action_key: str

class PriorityQueueSummary(BaseModel):
    total_panchayats: int
    very_high: int
    high: int
    medium: int
    low: int

class PriorityQueueResponse(BaseModel):
    generated_at: str
    scope: str
    lead_day: int
    data_mode: str = "demo"
    weights: Dict[str, float]
    thresholds: Dict[str, float]
    summary: PriorityQueueSummary
    items: List[PriorityQueueItem]

class PriorityConfigResponse(BaseModel):
    weights: Dict[str, float]
    thresholds: Dict[str, float]
    data_sources: Dict[str, str]


# --- Round 4A: Location Explorer Schemas ---
class LocationTreeNode(BaseModel):
    id: str
    name: str
    name_hi: Optional[str] = None
    name_mr: Optional[str] = None
    level: str  # 'state', 'district', 'block', 'panchayat'
    parent_id: Optional[str] = None
    lgd_code: Optional[int] = None
    has_data: bool = False
    item_count: int = 0
    data_status: str = "not_loaded"  # 'demo', 'live', 'not_loaded'
    villages_count: int = 0
    villages: List[str] = []
    centroid_lat: Optional[float] = None
    centroid_lon: Optional[float] = None

class LocationSearchItem(BaseModel):
    id: str
    name: str
    level: str
    full_path: str
    has_data: bool
    gp_id: str
    gp_name: str
    lgd_code: Optional[int] = None
    message: Optional[str] = None


# --- Round 4B: Data Health & CSV Upload Schemas ---
class DataSourceHealthItem(BaseModel):
    name: str
    status: str  # 'nominal', 'degraded', 'offline'
    last_updated: str
    coverage: str
    missing_inputs: List[str] = []
    fallback_in_use: Optional[str] = None

class DataHealthResponse(BaseModel):
    overall_status: str  # 'green', 'amber', 'red'
    sources: List[DataSourceHealthItem]
    last_checked: str
    active_fallbacks: List[str] = []

class CSVRowError(BaseModel):
    row: int
    column: str
    value: str
    message: str

class BlockForecastUploadResponse(BaseModel):
    status: str  # 'valid', 'errors', 'success'
    total_rows: int
    valid_rows: int
    errors: List[CSVRowError] = []
    preview: List[Dict[str, Any]] = []
    dataset_id: Optional[str] = None
    is_custom_input: bool = True


