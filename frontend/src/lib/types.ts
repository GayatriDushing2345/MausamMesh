export interface PanchayatInfo {
  id: string;
  name: string;
  code: string;
  elevation_m: number;
  elevation_delta_m: number;
  slope_deg: number;
  aspect: string;
  area_sqkm: number;
  centroid_lat: number;
  centroid_lon: number;
}

export interface BlockInfo {
  id: string;
  name: string;
  code: string;
  mean_elevation_m: number;
  panchayats: PanchayatInfo[];
}

export interface DistrictInfo {
  id: string;
  name: string;
  code?: string;
  state: string;
  blocks: BlockInfo[];
}

export interface StateInfo {
  id: string;
  name: string;
  code: string;
  districts: DistrictInfo[];
}

export interface LocationHierarchy {
  country?: string;
  states: StateInfo[];
  districts: DistrictInfo[];
}

export interface DailyForecastItem {
  date: string;
  day_name: string;
  lead_day: number;
  block_forecast_rain_mm: number;
  panchayat_raw_predicted_residual_mm: number;
  panchayat_reconciled_residual_mm: number;
  panchayat_downscaled_rain_mm: number;
  conformal_lower_bound_mm: number;
  conformal_upper_bound_mm: number;
  conformal_coverage_guarantee_pct: number;
  confidence_interval_width_mm: number;
  confidence_tier: 'High' | 'Moderate' | 'Low';
  heavy_rain_prob_pct: number;
  temp_max_c: number;
  temp_min_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  condition: string;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  validation_status?: 'validated' | 'indicative';
  prob_rain_2_5mm?: number;
  prob_rain_15_6mm?: number;
  prob_rain_64_5mm?: number;
  range_label?: string;
}

export interface PanchayatForecastResponse {
  panchayat_id: string;
  panchayat_name: string;
  block_name: string;
  district_name: string;
  state_name?: string;
  country_name?: string;
  forecast_generated_at: string;
  model_version: string;
  current_temp_c: number;
  current_humidity_pct: number;
  current_condition: string;
  overall_confidence_level: 'High' | 'Moderate' | 'Low';
  is_mint_reconciled: boolean;
  mint_coherence_guarantee: string;
  is_conformal_calibrated: boolean;
  is_loso_skill_gated: boolean;
  loso_skill_gate_status: string;
  winds_telemetry_status: string;
  five_day_forecast: DailyForecastItem[];
  risk_summary: string;
  panchayat_vs_block_rain_delta?: number;
  panchayat_vs_block_temp_delta?: number;
  evidence_chips?: any[];
  evidence_sentence?: string;
  model_used?: 'xgboost' | 'baseline' | string;
  baseline_fallback_reason?: string | null;
  waterlogging_risk?: string | null;
  thunderstorm_risk?: string | null;
}

export interface MapFeatureProperties {
  id: string;
  name: string;
  type: 'panchayat' | 'block';
  parent_block_name?: string;
  block_baseline_rain_mm: number;
  downscaled_rain_mm: number;
  residual_delta_mm: number;
  heavy_rain_prob_pct: number;
  confidence_tier: string;
  risk_level: string;
  elevation_m: number;
  is_mint_reconciled?: boolean;
  priority_tier?: 'Very High' | 'High' | 'Medium' | 'Low';
  priority_score?: number;
}

export interface MapFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: MapFeatureProperties;
}

export interface MapGeoJSONResponse {
  type: 'FeatureCollection';
  features: MapFeature[];
  block_baseline_rain_mm: number;
  timestamp: string;
}

export interface DailyComparisonItem {
  date: string;
  day_name: string;
  block_baseline_rain_mm: number;
  panchayat_downscaled_rain_mm: number;
  panchayat_observed_rain_mm: number;
  baseline_error_mm: number;
  model_error_mm: number;
  residual_delta_mm: number;
}

export interface ComparisonResponse {
  panchayat_id: string;
  panchayat_name: string;
  is_hilly_hero_panchayat: boolean;
  elevation_m: number;
  block_mean_elevation_m: number;
  elevation_delta_m: number;
  baseline_mae_mm: number;
  model_mae_mm: number;
  baseline_rmse_mm: number;
  model_rmse_mm: number;
  error_reduction_pct: number;
  daily_comparisons: DailyComparisonItem[];
  comparison_summary: string;
}

export interface EventSkillMetrics {
  threshold_mm: number;
  csi: number;
  pod: number;
  far: number;
}

export interface HistoricalComparisonPoint {
  date: string;
  block_forecast_mm: number;
  panchayat_observed_mm: number;
  panchayat_predicted_mm: number;
  residual_error_mm: number;
}

export interface FeatureImportanceItem {
  feature_name: string;
  feature_description: string;
  importance_score: number;
}

export interface ModelReliabilityResponse {
  model_type: string;
  model_version: string;
  last_trained_at: string;
  training_sample_size: number;
  overall_mae_mm: number;
  overall_rmse_mm: number;
  block_baseline_mae_mm: number;
  skill_improvement_pct: number;
  conformal_coverage_rate_pct: number;
  loso_skill_gate_pass_rate_pct: number;
  brier_score_heavy_rain: number;
  event_skills: EventSkillMetrics[];
  feature_importances: FeatureImportanceItem[];
  historical_comparison: HistoricalComparisonPoint[];
  model_notes: string[];
}

export interface AdvisoryOutputItem {
  category: string;
  title: string;
  message: string;
  severity: 'Info' | 'Warning' | 'ActionRequired';
  trigger_rule: string;
}

export interface AdvisoryResponse {
  panchayat_id: string;
  panchayat_name: string;
  crop_name: string;
  growth_stage: string;
  generated_at: string;
  forecast_confidence_level: 'High' | 'Moderate' | 'Low';
  forecast_interval_width_mm: number;
  is_confidence_gated: boolean;
  confidence_gated_warning?: string;
  approval_status: string;
  approved_by_officer?: string;
  dispatched_channels: string[];
  is_demo_rule_engine: boolean;
  advisories: AdvisoryOutputItem[];
}

export interface DAMUApprovalResponse {
  status: string;
  message: string;
  panchayat_id: string;
  panchayat_name: string;
  approved_by: string;
  approved_at: string;
  dispatched_channels: string[];
}

// --- Priority Queue Schemas (USP 1 Core) ---
export interface PriorityFactorContribution {
  value: number;
  weight: number;
  contribution_points: number;
}

export interface PriorityReason {
  key: string;
  params: Record<string, any>;
}

export interface PriorityForecastSnippet {
  rain_mm: number;
  rain_upper_mm: number;
  imd_category: string;
  temp_max_c: number;
  wind_speed_kmh: number;
}

export interface PriorityConfidenceSnippet {
  level: string;
  interval_width_mm: number;
}

export interface PriorityCropSnippet {
  name: string;
  stage: string;
}

export interface PriorityExposureSnippet {
  agri_area_ha?: number;
  farm_households?: number;
  source: string;
}

export interface PriorityQueueItem {
  rank: number;
  panchayat_id: string;
  name: string;
  block_name: string;
  district_name: string;
  state_name: string;
  score: number;
  tier: 'Very High' | 'High' | 'Medium' | 'Low';
  primary_hazard: 'rain' | 'heat' | 'wind';
  forecast: PriorityForecastSnippet;
  confidence: PriorityConfidenceSnippet;
  factors: Record<string, PriorityFactorContribution>;
  reasons: PriorityReason[];
  flags: string[];
  crop: PriorityCropSnippet;
  exposure: PriorityExposureSnippet;
  recommended_action_key: string;
}

export interface PriorityQueueSummary {
  total_panchayats: number;
  very_high: number;
  high: number;
  medium: number;
  low: number;
}

export interface PriorityQueueResponse {
  generated_at: string;
  scope: string;
  lead_day: number;
  data_mode: 'demo' | 'live';
  weights: Record<string, number>;
  thresholds: Record<string, number>;
  summary: PriorityQueueSummary;
  items: PriorityQueueItem[];
}

export interface PriorityConfigResponse {
  weights: Record<string, number>;
  thresholds: Record<string, number>;
  data_sources: Record<string, string>;
}

// --- ROUND 4A & 4B Types ---
export interface LocationTreeNode {
  id: string;
  name: string;
  name_hi?: string;
  name_mr?: string;
  level: 'state' | 'district' | 'block' | 'panchayat';
  parent_id?: string | null;
  lgd_code?: number | null;
  has_data: boolean;
  item_count: number;
  data_status: 'demo' | 'live' | 'not_loaded';
  villages_count: number;
  villages: string[];
  centroid_lat?: number | null;
  centroid_lon?: number | null;
}

export interface LocationSearchItem {
  id: string;
  name: string;
  level: string;
  full_path: string;
  has_data: boolean;
  gp_id: string;
  gp_name: string;
  lgd_code?: number | null;
  message?: string | null;
}

export interface DataSourceHealthItem {
  name: string;
  status: 'nominal' | 'degraded' | 'offline';
  last_updated: string;
  coverage: string;
  missing_inputs: string[];
  fallback_in_use?: string | null;
}

export interface DataHealthResponse {
  overall_status: 'green' | 'amber' | 'red';
  sources: DataSourceHealthItem[];
  last_checked: string;
  active_fallbacks: string[];
}

export interface CSVRowError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface BlockForecastUploadResponse {
  status: 'valid' | 'errors' | 'success';
  total_rows: number;
  valid_rows: number;
  errors: CSVRowError[];
  preview: Record<string, any>[];
  dataset_id?: string | null;
  is_custom_input: boolean;
}

