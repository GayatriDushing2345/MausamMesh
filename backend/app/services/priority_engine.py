"""
Panchayat Priority Scoring Engine (Core USP for MausamMesh / IMD-DAMU Agromet Control Room).

Pure-function scoring engine with zero I/O.
Reference: IMD Standard Operating Procedures & Agrometeorological Advisory Guidelines.
"""

import math
from typing import Dict, Any, List, Optional, Tuple

DEFAULT_WEIGHTS = {
    "weather_severity": 35.0,
    "crop_vulnerability": 25.0,
    "potential_impact": 15.0,
    "exposed_area": 15.0,
    "farm_households": 10.0
}

DEFAULT_THRESHOLDS = {
    "very_high": 70.0,
    "high": 50.0,
    "medium": 30.0,
    "low": 0.0
}

# Crop Sensitivity Matrix (Crop + Stage + Hazard -> Sensitivity score 0.0 - 1.0)
CROP_SENSITIVITY_MATRIX: Dict[Tuple[str, str, str], float] = {
    ("Cotton", "Flowering & Podging", "rain"): 0.85,
    ("Cotton", "Flowering & Podging", "heat"): 0.90,
    ("Cotton", "Vegetative Growth", "rain"): 0.50,
    ("Cotton", "Maturation & Harvest", "rain"): 0.95,

    ("Soybean", "Pod Formation", "rain"): 0.85,
    ("Soybean", "Pod Formation", "heat"): 0.75,
    ("Soybean", "Vegetative Growth", "rain"): 0.45,
    ("Soybean", "Maturation & Harvest", "rain"): 0.90,

    ("Paddy / Rice", "Vegetative Growth", "rain"): 0.30,
    ("Paddy / Rice", "Flowering & Grain Filling", "heat"): 0.85,
    ("Paddy / Rice", "Harvesting", "rain"): 0.95,

    ("Sugarcane", "Grand Growth", "rain"): 0.30,
    ("Sugarcane", "Grand Growth", "heat"): 0.40,
    ("Sugarcane", "Maturation", "rain"): 0.50,
}

def get_crop_sensitivity(crop: str, stage: str, hazard: str) -> float:
    """Lookup crop sensitivity score (0.0 to 1.0) for crop, stage, and primary hazard."""
    # Normalize crop name matching
    crop_norm = "Cotton" if "cotton" in crop.lower() else "Soybean" if "soybean" in crop.lower() else "Paddy / Rice" if "paddy" in crop.lower() or "rice" in crop.lower() else "Sugarcane"
    stage_norm = "Flowering & Podging" if "flower" in stage.lower() or "pod" in stage.lower() else "Vegetative Growth" if "veg" in stage.lower() else "Maturation & Harvest"
    
    key = (crop_norm, stage_norm, hazard)
    return CROP_SENSITIVITY_MATRIX.get(key, 0.60)


def compute_rain_severity(upper_rain_mm: float) -> float:
    """Continuous interpolation of upper 90% conformal rain bound over official IMD categories."""
    if upper_rain_mm <= 0.0:
        return 0.0
    if upper_rain_mm <= 2.4:  # Very Light
        return 0.0 + (upper_rain_mm / 2.4) * 0.15
    if upper_rain_mm <= 15.5:  # Light
        return 0.15 + ((upper_rain_mm - 2.4) / (15.5 - 2.4)) * 0.25
    if upper_rain_mm <= 64.4:  # Moderate
        return 0.40 + ((upper_rain_mm - 15.5) / (64.4 - 15.5)) * 0.30
    if upper_rain_mm <= 115.5:  # Heavy
        return 0.70 + ((upper_rain_mm - 64.4) / (115.5 - 64.4)) * 0.20
    if upper_rain_mm <= 204.4:  # Very Heavy
        return 0.90 + ((upper_rain_mm - 115.5) / (204.4 - 115.5)) * 0.10
    return 1.0  # Extremely Heavy


def compute_heat_severity(temp_max_c: float) -> float:
    """Compute heat hazard severity factor (0.0 to 1.0)."""
    if temp_max_c < 35.0:
        return 0.0
    if temp_max_c <= 40.0:
        return 0.2 + ((temp_max_c - 35.0) / 5.0) * 0.4
    if temp_max_c <= 45.0:
        return 0.6 + ((temp_max_c - 40.0) / 5.0) * 0.4
    return 1.0


def compute_wind_severity(wind_speed_kmh: float) -> float:
    """Compute wind hazard severity factor (0.0 to 1.0)."""
    if wind_speed_kmh < 20.0:
        return 0.0
    if wind_speed_kmh <= 40.0:
        return 0.3 + ((wind_speed_kmh - 20.0) / 20.0) * 0.4
    return 1.0


def compute_terrain_impact(elevation_delta_m: float, slope_deg: float, upper_rain_mm: float) -> float:
    """Derive terrain & drainage susceptibility factor (0.0 to 1.0) from physical features."""
    is_low_lying = elevation_delta_m < 0.0
    is_poor_drainage = is_low_lying and (slope_deg < 2.5)
    is_steep_slope = slope_deg > 6.0
    
    impact = 0.2  # baseline neutral impact
    
    if is_poor_drainage:
        impact += 0.4
    elif is_low_lying:
        impact += 0.25
        
    if is_steep_slope and upper_rain_mm > 15.5:
        impact += 0.35
        
    return min(1.0, impact)


def calculate_percentile_rank(values: List[float], current_val: float) -> float:
    """Compute percentile rank [0.0, 1.0] of a value within scope."""
    if not values or len(values) <= 1:
        return 0.5
    less_count = sum(1 for v in values if v < current_val)
    equal_count = sum(1 for v in values if v == current_val)
    return min(1.0, max(0.05, (less_count + 0.5 * equal_count) / len(values)))


def score_panchayat_priority(
    item_input: Dict[str, Any],
    all_items_in_scope: List[Dict[str, Any]],
    weights: Optional[Dict[str, float]] = None,
    thresholds: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """Pure function to calculate explainable priority score, tier, flags, and reasons for a panchayat."""
    active_weights = (weights or DEFAULT_WEIGHTS).copy()
    active_thresholds = thresholds or DEFAULT_THRESHOLDS
    
    # Extract weather inputs (plan for the upper bound of 90% conformal interval)
    rain_upper_mm = float(item_input.get("conformal_upper_bound_mm", item_input.get("panchayat_downscaled_rain_mm", 0.0) * 1.15))
    rain_median_mm = float(item_input.get("panchayat_downscaled_rain_mm", 0.0))
    tmax_c = float(item_input.get("temp_max_c", 30.0))
    wind_kmh = float(item_input.get("wind_speed_kmh", 12.0))
    
    # 1. Weather Severity Factor
    f_rain = compute_rain_severity(rain_upper_mm)
    f_heat = compute_heat_severity(tmax_c)
    f_wind = compute_wind_severity(wind_kmh)
    
    sev_map = {"rain": f_rain, "heat": f_heat, "wind": f_wind}
    primary_hazard = max(sev_map, key=sev_map.get)
    f_severity = sev_map[primary_hazard]
    
    # 2. Crop Vulnerability Factor
    crop_name = item_input.get("crop_name", "Cotton")
    growth_stage = item_input.get("growth_stage", "Vegetative Growth")
    f_crop_vulnerability = get_crop_sensitivity(crop_name, growth_stage, primary_hazard)
    
    # 3. Potential Impact Factor (derived terrain/drainage)
    elev_delta = float(item_input.get("elevation_delta_m", 0.0))
    slope_deg = float(item_input.get("slope_deg", 2.0))
    f_potential_impact = compute_terrain_impact(elev_delta, slope_deg, rain_upper_mm)
    
    # 4. Exposed Area & 5. Households Percentile Normalization
    all_areas = [float(it.get("agri_area_ha", 500.0)) for it in all_items_in_scope if it.get("agri_area_ha") is not None]
    all_households = [float(it.get("farm_households", 200.0)) for it in all_items_in_scope if it.get("farm_households") is not None]
    
    agri_area = item_input.get("agri_area_ha")
    farm_households = item_input.get("farm_households")
    
    flags: List[str] = []
    missing_factors: List[str] = []
    
    if agri_area is not None:
        f_exposed_area = calculate_percentile_rank(all_areas, float(agri_area))
    else:
        f_exposed_area = None
        missing_factors.append("exposed_area")
        
    if farm_households is not None:
        f_households = calculate_percentile_rank(all_households, float(farm_households))
    else:
        f_households = None
        missing_factors.append("farm_households")
        
    # Check for missing factors & renormalize weights
    factor_values = {
        "weather_severity": f_severity,
        "crop_vulnerability": f_crop_vulnerability,
        "potential_impact": f_potential_impact,
        "exposed_area": f_exposed_area,
        "farm_households": f_households,
    }
    
    valid_weight_sum = sum(active_weights[k] for k, v in factor_values.items() if v is not None)
    if valid_weight_sum <= 0:
        valid_weight_sum = 100.0
        
    normalized_weights = {
        k: (active_weights[k] * 100.0 / valid_weight_sum) if v is not None else 0.0
        for k, v in factor_values.items()
    }
    
    if missing_factors:
        flags.append("partial_data")
        
    # Compute Weighted Score (0 to 100)
    score = sum((normalized_weights[k] / 100.0) * factor_values[k] for k, v in factor_values.items() if v is not None) * 100.0
    score = round(max(0.0, min(100.0, score)), 1)
    
    # Confidence modifier (check interval width)
    interval_width = float(item_input.get("confidence_interval_width_mm", 3.0))
    if interval_width > 6.0:
        flags.append("verify_before_dispatch")
        confidence_level = "Low"
    elif interval_width > 3.5:
        confidence_level = "Medium"
    else:
        confidence_level = "High"
        
    # Assign Priority Tier
    if score >= active_thresholds["very_high"]:
        tier = "Very High"
    elif score >= active_thresholds["high"]:
        tier = "High"
    elif score >= active_thresholds["medium"]:
        tier = "Medium"
    else:
        tier = "Low"
        
    # Safety Floor Rule: If IMD rain category >= Heavy (rain_upper_mm >= 64.5 or rain_median_mm >= 64.5), tier cannot be Low
    if (rain_upper_mm >= 64.5 or rain_median_mm >= 64.5) and tier == "Low":
        tier = "High"
        
    # Generate 2-3 Translation-Ready Reason Objects
    reasons: List[Dict[str, Any]] = []
    
    if rain_upper_mm >= 64.5:
        reasons.append({"key": "reason.heavy_rain", "params": {"rain_mm": round(rain_upper_mm, 1)}})
    elif rain_upper_mm >= 15.6:
        reasons.append({"key": "reason.moderate_rain", "params": {"rain_mm": round(rain_upper_mm, 1)}})
        
    if f_crop_vulnerability >= 0.75:
        reasons.append({"key": "reason.mature_crop_sensitive", "params": {"crop": crop_name, "stage": growth_stage}})
        
    if elev_delta < 0.0 and slope_deg < 2.5:
        reasons.append({"key": "reason.poor_drainage", "params": {}})
    elif slope_deg > 6.0 and rain_upper_mm > 15.5:
        reasons.append({"key": "reason.steep_slope_runoff", "params": {}})
        
    if not reasons:
        if score >= 50.0:
            reasons.append({"key": "reason.high_cumulative_risk", "params": {}})
        else:
            reasons.append({"key": "reason.no_major_risk", "params": {}})
            
    # Factor breakdown object
    factor_breakdown = {
        "weather_severity": {
            "value": round(f_severity, 2),
            "weight": round(normalized_weights["weather_severity"], 1),
            "contribution_points": round((normalized_weights["weather_severity"] / 100.0) * f_severity * 100.0, 1)
        },
        "crop_vulnerability": {
            "value": round(f_crop_vulnerability, 2),
            "weight": round(normalized_weights["crop_vulnerability"], 1),
            "contribution_points": round((normalized_weights["crop_vulnerability"] / 100.0) * f_crop_vulnerability * 100.0, 1)
        },
        "potential_impact": {
            "value": round(f_potential_impact, 2),
            "weight": round(normalized_weights["potential_impact"], 1),
            "contribution_points": round((normalized_weights["potential_impact"] / 100.0) * f_potential_impact * 100.0, 1)
        },
        "exposed_area": {
            "value": round(f_exposed_area if f_exposed_area is not None else 0.0, 2),
            "weight": round(normalized_weights["exposed_area"], 1),
            "contribution_points": round((normalized_weights["exposed_area"] / 100.0) * (f_exposed_area or 0.0) * 100.0, 1)
        },
        "farm_households": {
            "value": round(f_households if f_households is not None else 0.0, 2),
            "weight": round(normalized_weights["farm_households"], 1),
            "contribution_points": round((normalized_weights["farm_households"] / 100.0) * (f_households or 0.0) * 100.0, 1)
        }
    }
    
    return {
        "score": score,
        "tier": tier,
        "primary_hazard": primary_hazard,
        "confidence_level": confidence_level,
        "interval_width_mm": round(interval_width, 1),
        "factors": factor_breakdown,
        "reasons": reasons[:3],
        "flags": flags,
        "rain_upper_mm": round(rain_upper_mm, 1)
    }


def rank_priority_queue(
    items_input: List[Dict[str, Any]],
    weights: Optional[Dict[str, float]] = None,
    thresholds: Optional[Dict[str, float]] = None
) -> List[Dict[str, Any]]:
    """Score and deterministically rank a list of panchayats for the priority queue.
    Deterministic tie-break: score desc, severity desc, agri_area desc, name asc.
    """
    scored_items = []
    
    for item in items_input:
        res = score_panchayat_priority(item, items_input, weights, thresholds)
        scored_items.append({
            **item,
            "priority_result": res
        })
        
    # Deterministic sorting
    def sort_key(x):
        res = x["priority_result"]
        sev_val = res["factors"]["weather_severity"]["value"]
        area_val = float(x.get("agri_area_ha", 0.0) or 0.0)
        p_name = str(x.get("panchayat_name", ""))
        return (-res["score"], -sev_val, -area_val, p_name)
        
    scored_items.sort(key=sort_key)
    
    # Assign 1-based ranks
    for idx, item in enumerate(scored_items):
        item["priority_result"]["rank"] = idx + 1
        
    return scored_items
