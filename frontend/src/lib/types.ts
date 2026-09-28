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
