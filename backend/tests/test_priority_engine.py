import pytest
from app.services.priority_engine import (
    score_panchayat_priority, rank_priority_queue, compute_rain_severity, DEFAULT_WEIGHTS
)
from app.api.endpoints import parse_and_validate_weights
from fastapi import HTTPException

def test_score_monotonicity_with_rain():
    """Test A4.1: More rain upper bound -> score never decreases."""
    base_item = {
        "panchayat_id": "P1",
        "panchayat_name": "Test",
        "conformal_upper_bound_mm": 10.0,
        "panchayat_downscaled_rain_mm": 8.0,
        "crop_name": "Cotton",
        "growth_stage": "Flowering & Podging",
        "agri_area_ha": 500.0,
        "farm_households": 200.0,
    }
    
    score1 = score_panchayat_priority(base_item, [base_item])["score"]
    
    item_more_rain = {**base_item, "conformal_upper_bound_mm": 55.0, "panchayat_downscaled_rain_mm": 45.0}
    score2 = score_panchayat_priority(item_more_rain, [item_more_rain])["score"]
    
    item_heavy_rain = {**base_item, "conformal_upper_bound_mm": 120.0, "panchayat_downscaled_rain_mm": 90.0}
    score3 = score_panchayat_priority(item_heavy_rain, [item_heavy_rain])["score"]

    assert score2 >= score1
    assert score3 >= score2


def test_missing_exposure_factor_renormalization():
    """Test A4.2: Missing exposure factor renormalizes remaining weights and adds partial_data flag."""
    item_missing_area = {
        "panchayat_id": "P1",
        "panchayat_name": "Test",
        "conformal_upper_bound_mm": 25.0,
        "panchayat_downscaled_rain_mm": 20.0,
        "crop_name": "Cotton",
        "growth_stage": "Flowering & Podging",
        "agri_area_ha": None,  # MISSING
        "farm_households": 200.0,
    }
    
    res = score_panchayat_priority(item_missing_area, [item_missing_area])
    assert "partial_data" in res["flags"]
    assert res["factors"]["exposed_area"]["weight"] == 0.0
    # Remaining weights must sum to 100
    w_sum = sum(v["weight"] for v in res["factors"].values())
    assert abs(w_sum - 100.0) < 0.1


def test_heavy_rain_safety_floor():
    """Test A4.3: Heavy rain (>= 64.5mm) guarantees minimum High tier (cannot be Low)."""
    low_exposure_heavy_rain = {
        "panchayat_id": "P_HEAVY",
        "panchayat_name": "Heavy Rain Village",
        "conformal_upper_bound_mm": 75.0,
        "panchayat_downscaled_rain_mm": 70.0,  # HEAVY
        "crop_name": "Sugarcane",
        "growth_stage": "Grand Growth",
        "agri_area_ha": 10.0,  # low area
        "farm_households": 5.0,  # low households
    }
    
    res = score_panchayat_priority(low_exposure_heavy_rain, [low_exposure_heavy_rain])
    assert res["tier"] in ["High", "Very High"]
    assert res["tier"] != "Low"


def test_low_confidence_flag():
    """Test A4.4: Low confidence interval width keeps rank but adds verify_before_dispatch flag."""
    item_low_conf = {
        "panchayat_id": "P_LOW_CONF",
        "panchayat_name": "Uncertain Village",
        "conformal_upper_bound_mm": 30.0,
        "panchayat_downscaled_rain_mm": 22.0,
        "confidence_interval_width_mm": 8.5,  # LOW CONFIDENCE (>6.0)
        "crop_name": "Cotton",
        "growth_stage": "Flowering & Podging",
        "agri_area_ha": 400.0,
        "farm_households": 150.0,
    }
    
    res = score_panchayat_priority(item_low_conf, [item_low_conf])
    assert "verify_before_dispatch" in res["flags"]
    assert res["confidence_level"] == "Low"


def test_deterministic_tie_break():
    """Test A4.5: Deterministic tie-break by score desc, severity desc, area desc, name asc."""
    item1 = {
        "panchayat_id": "P1", "panchayat_name": "Alpha",
        "conformal_upper_bound_mm": 20.0, "panchayat_downscaled_rain_mm": 18.0,
        "crop_name": "Cotton", "growth_stage": "Vegetative Growth",
        "agri_area_ha": 300.0, "farm_households": 100.0,
    }
    item2 = {
        "panchayat_id": "P2", "panchayat_name": "Beta",
        "conformal_upper_bound_mm": 20.0, "panchayat_downscaled_rain_mm": 18.0,
        "crop_name": "Cotton", "growth_stage": "Vegetative Growth",
        "agri_area_ha": 300.0, "farm_households": 100.0,
    }
    
    ranked = rank_priority_queue([item2, item1])
    assert len(ranked) == 2
    assert ranked[0]["panchayat_name"] == "Alpha"  # Alphabetical tie-break
    assert ranked[1]["panchayat_name"] == "Beta"


def test_custom_weights_validation():
    """Test A4.6: Reject custom weights not summing to 100."""
    with pytest.raises(HTTPException) as exc_info:
        parse_and_validate_weights("weather_severity=50,crop_vulnerability=20")
    assert exc_info.value.status_code == 422


def test_all_four_tiers_reachable():
    """Test A4.7: Each of the four tiers (Very High, High, Medium, Low) is reachable."""
    item_vh = {
        "panchayat_id": "VH", "panchayat_name": "Very High",
        "conformal_upper_bound_mm": 130.0, "panchayat_downscaled_rain_mm": 110.0,
        "crop_name": "Cotton", "growth_stage": "Flowering & Podging",
        "agri_area_ha": 1500.0, "farm_households": 800.0, "elevation_delta_m": -20.0, "slope_deg": 1.0
    }
    item_h = {
        "panchayat_id": "H", "panchayat_name": "High",
        "conformal_upper_bound_mm": 45.0, "panchayat_downscaled_rain_mm": 35.0,
        "crop_name": "Soybean", "growth_stage": "Pod Formation",
        "agri_area_ha": 800.0, "farm_households": 400.0, "elevation_delta_m": -5.0, "slope_deg": 2.0
    }
    item_m = {
        "panchayat_id": "M", "panchayat_name": "Medium",
        "conformal_upper_bound_mm": 12.0, "panchayat_downscaled_rain_mm": 8.0,
        "crop_name": "Cotton", "growth_stage": "Vegetative Growth",
        "agri_area_ha": 400.0, "farm_households": 150.0, "elevation_delta_m": 5.0, "slope_deg": 4.0
    }
    item_l = {
        "panchayat_id": "L", "panchayat_name": "Low",
        "conformal_upper_bound_mm": 0.0, "panchayat_downscaled_rain_mm": 0.0,
        "crop_name": "Sugarcane", "growth_stage": "Grand Growth",
        "agri_area_ha": 50.0, "farm_households": 20.0, "elevation_delta_m": 15.0, "slope_deg": 5.0
    }
    
    scope = [item_vh, item_h, item_m, item_l]
    res_vh = score_panchayat_priority(item_vh, scope)["tier"]
    res_h = score_panchayat_priority(item_h, scope)["tier"]
    res_m = score_panchayat_priority(item_m, scope)["tier"]
    res_l = score_panchayat_priority(item_l, scope)["tier"]

    tiers_found = {res_vh, res_h, res_m, res_l}
    assert "Very High" in tiers_found
    assert "High" in tiers_found
    assert "Medium" in tiers_found
    assert "Low" in tiers_found
