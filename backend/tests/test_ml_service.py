import os
import sys
import pytest
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ml_service import XGBoostResidualDownscaler
from app.services.advisory_service import AgroAdvisoryEngine

def test_residual_calculation_mint_and_conformal():
    df = pd.DataFrame([
        {
            "date": "2025-07-01",
            "block_rain_mm": 20.0,
            "block_temp_max": 28.0,
            "block_humidity": 85.0,
            "elevation_m": 650.0,
            "elevation_delta_vs_block_mean": 75.0,
            "slope_deg": 5.0,
            "aspect_deg": 245,
            "aspect_wind_facing_flag": 1.0,
            "neighbour_residual_mean": 2.5,
            "neighbour_residual_std": 0.5,
            "idw_neighbour_rain": 22.0,
            "recent_3d_rain_mean": 15.0,
            "historical_bias": 2.0,
            "observed_panchayat_rain": 24.5
        },
        {
            "date": "2025-07-02",
            "block_rain_mm": 10.0,
            "block_temp_max": 30.0,
            "block_humidity": 75.0,
            "elevation_m": 540.0,
            "elevation_delta_vs_block_mean": -35.0,
            "slope_deg": 1.0,
            "aspect_deg": 0,
            "aspect_wind_facing_flag": 0.0,
            "neighbour_residual_mean": -1.0,
            "neighbour_residual_std": 0.3,
            "idw_neighbour_rain": 9.0,
            "recent_3d_rain_mean": 8.0,
            "historical_bias": -1.0,
            "observed_panchayat_rain": 8.5
        }
    ] * 20)

    model = XGBoostResidualDownscaler()
    metrics = model.train(df)

    assert metrics is not None
    assert "overall_mae_mm" in metrics
    assert "conformal_coverage_rate_pct" in metrics
    assert model.is_trained is True

    # Test MinT Reconciliation math (USP 1)
    block_rain = 20.0
    raw_res = np.array([4.0, -1.0, 2.0, 0.0])
    reconciled_res = model.reconcile_min_t(block_rain, raw_res)
    # Average of downscaled values must equal block rain mathematically
    reconciled_downscaled_mean = np.mean(block_rain + reconciled_res)
    assert abs(reconciled_downscaled_mean - block_rain) < 1e-5

    # Test Conformal prediction interval (USP 2)
    final_rain, pred_res, lower_b, upper_b = model.predict(df.iloc[:2])
    assert len(final_rain) == 2
    assert lower_b[0] <= final_rain[0] <= upper_b[0]

def test_advisory_engine_approval():
    engine = AgroAdvisoryEngine()
    res = engine.approve_advisory(
        panchayat_id="PANC_001",
        panchayat_name="Wagholi",
        crop_name="Paddy",
        growth_stage="Vegetative",
        officer_name="Dr. A. K. Sharma (DAMU)",
        target_channels=["SMS", "Meghdoot"]
    )
    assert res.status == "Approved & Dispatched"
    assert "Dr. A. K. Sharma" in res.approved_by
    assert len(res.dispatched_channels) == 2
