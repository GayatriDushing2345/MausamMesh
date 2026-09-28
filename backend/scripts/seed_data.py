import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models_store")

def generate_seed_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Generating multi-state location hierarchy (Maharashtra & Bihar) and GeoJSON boundaries...")

    # 1. Location Hierarchy & Spatial Attributes for Maharashtra (Pune/Haveli) and Bihar (Patna/Sampatchak)
    pune_panchayats = [
        {"id": "PANC_001", "name": "Wagholi", "code": "MH-PN-HAV-WAG", "elevation_m": 590.0, "slope_deg": 4.2, "aspect": "East", "aspect_deg": 90, "area_sqkm": 14.5, "lat": 18.578, "lon": 73.980},
        {"id": "PANC_002", "name": "Hadapsar Rural", "code": "MH-PN-HAV-HAD", "elevation_m": 560.0, "slope_deg": 2.1, "aspect": "North", "aspect_deg": 0, "area_sqkm": 12.0, "lat": 18.508, "lon": 73.935},
        {"id": "PANC_003", "name": "Manjari Khurd", "code": "MH-PN-HAV-MAN", "elevation_m": 552.0, "slope_deg": 1.8, "aspect": "East", "aspect_deg": 85, "area_sqkm": 10.8, "lat": 18.525, "lon": 73.978},
        {"id": "PANC_004", "name": "Phursungi", "code": "MH-PN-HAV-PHU", "elevation_m": 575.0, "slope_deg": 3.5, "aspect": "South", "aspect_deg": 180, "area_sqkm": 15.2, "lat": 18.472, "lon": 73.960},
        {"id": "PANC_005", "name": "Loni Kalbhor", "code": "MH-PN-HAV-LON", "elevation_m": 548.0, "slope_deg": 1.5, "aspect": "East", "aspect_deg": 95, "area_sqkm": 18.0, "lat": 18.485, "lon": 74.020},
        {"id": "PANC_006", "name": "Uruli Kanchan", "code": "MH-PN-HAV-URU", "elevation_m": 540.0, "slope_deg": 1.2, "aspect": "North-East", "aspect_deg": 45, "area_sqkm": 22.4, "lat": 18.488, "lon": 74.135},
        {"id": "PANC_007", "name": "Khed Shivapur", "code": "MH-PN-HAV-KHE", "elevation_m": 645.0, "slope_deg": 8.5, "aspect": "South-West", "aspect_deg": 245, "area_sqkm": 16.8, "lat": 18.345, "lon": 73.850},
        {"id": "PANC_008", "name": "Kondhwa Budruk", "code": "MH-PN-HAV-KON", "elevation_m": 610.0, "slope_deg": 6.1, "aspect": "South-West", "aspect_deg": 225, "area_sqkm": 11.2, "lat": 18.455, "lon": 73.890},
        {"id": "PANC_009", "name": "Dhayari", "code": "MH-PN-HAV-DHA", "elevation_m": 620.0, "slope_deg": 7.0, "aspect": "West", "aspect_deg": 260, "area_sqkm": 9.5, "lat": 18.442, "lon": 73.815},
        {"id": "PANC_010", "name": "Nanded Gramin", "code": "MH-PN-HAV-NAN", "elevation_m": 565.0, "slope_deg": 2.8, "aspect": "North", "aspect_deg": 10, "area_sqkm": 8.4, "lat": 18.458, "lon": 73.798},
    ]

    bihar_panchayats = [
        {"id": "PANC_101", "name": "Sampatchak Gramin", "code": "BR-PT-SAM-SAM", "elevation_m": 53.0, "slope_deg": 0.8, "aspect": "North", "aspect_deg": 10, "area_sqkm": 9.2, "lat": 25.550, "lon": 85.180},
        {"id": "PANC_102", "name": "Bairiya", "code": "BR-PT-SAM-BAI", "elevation_m": 51.5, "slope_deg": 0.5, "aspect": "East", "aspect_deg": 90, "area_sqkm": 7.8, "lat": 25.565, "lon": 85.195},
        {"id": "PANC_103", "name": "Kanhauli", "code": "BR-PT-SAM-KAN", "elevation_m": 54.2, "slope_deg": 1.1, "aspect": "South", "aspect_deg": 180, "area_sqkm": 8.5, "lat": 25.535, "lon": 85.165},
        {"id": "PANC_104", "name": "Chipura", "code": "BR-PT-SAM-CHI", "elevation_m": 50.8, "slope_deg": 0.4, "aspect": "North-East", "aspect_deg": 45, "area_sqkm": 6.9, "lat": 25.542, "lon": 85.210},
        {"id": "PANC_105", "name": "Sonagopalpur", "code": "BR-PT-SAM-SON", "elevation_m": 52.0, "slope_deg": 0.6, "aspect": "East", "aspect_deg": 85, "area_sqkm": 11.0, "lat": 25.520, "lon": 85.185},
        {"id": "PANC_106", "name": "Tarangpur", "code": "BR-PT-SAM-TAR", "elevation_m": 49.5, "slope_deg": 0.3, "aspect": "North", "aspect_deg": 5, "area_sqkm": 10.4, "lat": 25.575, "lon": 85.160},
    ]

    pune_block_mean_elev = float(np.mean([p["elevation_m"] for p in pune_panchayats]))
    bihar_block_mean_elev = float(np.mean([p["elevation_m"] for p in bihar_panchayats]))

    pune_district = {
        "id": "DIST_001",
        "name": "Pune",
        "code": "MH-PN",
        "state": "Maharashtra",
        "blocks": [
            {
                "id": "BLK_001",
                "name": "Haveli",
                "code": "MH-PN-HAV",
                "mean_elevation_m": pune_block_mean_elev,
                "panchayats": [
                    {
                        "id": p["id"],
                        "name": p["name"],
                        "code": p["code"],
                        "elevation_m": p["elevation_m"],
                        "elevation_delta_m": round(p["elevation_m"] - pune_block_mean_elev, 1),
                        "slope_deg": p["slope_deg"],
                        "aspect": p["aspect"],
                        "area_sqkm": p["area_sqkm"],
                        "centroid_lat": p["lat"],
                        "centroid_lon": p["lon"]
                    }
                    for p in pune_panchayats
                ]
            }
        ]
    }

    patna_district = {
        "id": "DIST_002",
        "name": "Patna",
        "code": "BR-PT",
        "state": "Bihar",
        "blocks": [
            {
                "id": "BLK_002",
                "name": "Sampatchak",
                "code": "BR-PT-SAM",
                "mean_elevation_m": bihar_block_mean_elev,
                "panchayats": [
                    {
                        "id": p["id"],
                        "name": p["name"],
                        "code": p["code"],
                        "elevation_m": p["elevation_m"],
                        "elevation_delta_m": round(p["elevation_m"] - bihar_block_mean_elev, 1),
                        "slope_deg": p["slope_deg"],
                        "aspect": p["aspect"],
                        "area_sqkm": p["area_sqkm"],
                        "centroid_lat": p["lat"],
                        "centroid_lon": p["lon"]
                    }
                    for p in bihar_panchayats
                ]
            }
        ]
    }

    locations_data = {
        "country": "India",
        "states": [
            {
                "id": "STATE_27",
                "name": "Maharashtra",
                "code": "MH-27",
                "districts": [pune_district]
            },
            {
                "id": "STATE_10",
                "name": "Bihar",
                "code": "BR-10",
                "districts": [patna_district]
            }
        ],
        "districts": [pune_district, patna_district]
    }

    with open(os.path.join(DATA_DIR, "locations.json"), "w") as f:
        json.dump(locations_data, f, indent=2)

    # 2. GeoJSON Polygons
    def create_square_poly(lat, lon, size=0.035):
        half = size / 2.0
        return [
            [round(lon - half, 4), round(lat - half, 4)],
            [round(lon + half, 4), round(lat - half, 4)],
            [round(lon + half, 4), round(lat + half, 4)],
            [round(lon - half, 4), round(lat + half, 4)],
            [round(lon - half, 4), round(lat - half, 4)]
        ]

    features = []
    
    # Pune Block Polygon
    features.append({
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[73.75, 18.30], [74.20, 18.30], [74.20, 18.62], [73.75, 18.62], [73.75, 18.30]]]
        },
        "properties": {
            "id": "BLK_001",
            "name": "Haveli Block Baseline (Maharashtra)",
            "type": "block",
            "block_baseline_rain_mm": 18.5,
            "downscaled_rain_mm": 18.5,
            "residual_delta_mm": 0.0,
            "heavy_rain_prob_pct": 35.0,
            "confidence_tier": "High",
            "risk_level": "Moderate",
            "elevation_m": pune_block_mean_elev
        }
    })

    # Patna Block Polygon
    features.append({
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[85.10, 25.48], [85.25, 25.48], [85.25, 25.60], [85.10, 25.60], [85.10, 25.48]]]
        },
        "properties": {
            "id": "BLK_002",
            "name": "Sampatchak Block Baseline (Bihar)",
            "type": "block",
            "block_baseline_rain_mm": 22.0,
            "downscaled_rain_mm": 22.0,
            "residual_delta_mm": 0.0,
            "heavy_rain_prob_pct": 45.0,
            "confidence_tier": "High",
            "risk_level": "Moderate",
            "elevation_m": bihar_block_mean_elev
        }
    })

    # Pune Panchayats
    for p in pune_panchayats:
        coords = create_square_poly(p["lat"], p["lon"])
        features.append({
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [coords]},
            "properties": {
                "id": p["id"],
                "name": p["name"],
                "type": "panchayat",
                "parent_block_name": "Haveli",
                "block_baseline_rain_mm": 18.5,
                "downscaled_rain_mm": 18.5,
                "residual_delta_mm": 0.0,
                "heavy_rain_prob_pct": 0.0,
                "confidence_tier": "High",
                "risk_level": "Low",
                "elevation_m": p["elevation_m"]
            }
        })

    # Bihar Panchayats
    for p in bihar_panchayats:
        coords = create_square_poly(p["lat"], p["lon"])
        features.append({
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [coords]},
            "properties": {
                "id": p["id"],
                "name": p["name"],
                "type": "panchayat",
                "parent_block_name": "Sampatchak",
                "block_baseline_rain_mm": 22.0,
                "downscaled_rain_mm": 22.0,
                "residual_delta_mm": 0.0,
                "heavy_rain_prob_pct": 0.0,
                "confidence_tier": "High",
                "risk_level": "Low",
                "elevation_m": p["elevation_m"]
            }
        })

    geojson_data = {"type": "FeatureCollection", "features": features}

    with open(os.path.join(DATA_DIR, "panchayat_shapes.json"), "w") as f:
        json.dump(geojson_data, f, indent=2)

    # 3. Compute Spatial Adjacency Matrix & 365 Days Observation Records for Pune & Bihar
    print("Generating 365 days of spatial observation dataset for Pune (MH) & Patna (BH)...")
    np.random.seed(42)
    start_date = datetime(2025, 6, 1)
    dates = [start_date + timedelta(days=i) for i in range(365)]

    all_panchayats = pune_panchayats + bihar_panchayats
    coords_dict = {p["id"]: (p["lat"], p["lon"]) for p in all_panchayats}
    p_ids = list(coords_dict.keys())
    dist_matrix = {}
    for i in p_ids:
        dist_matrix[i] = {}
        for j in p_ids:
            if i == j:
                dist_matrix[i][j] = 0.0
            else:
                lat1, lon1 = coords_dict[i]
                lat2, lon2 = coords_dict[j]
                d = np.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2) * 111.0
                dist_matrix[i][j] = max(d, 0.5)

    records = []
    for d in dates:
        doy = d.timetuple().tm_yday
        is_monsoon = 152 <= doy <= 273
        base_rain_prob = 0.65 if is_monsoon else 0.10
        
        has_block_rain = np.random.rand() < base_rain_prob
        block_rain = np.random.gamma(shape=2.0, scale=12.0) if has_block_rain else 0.0
        block_rain = round(float(block_rain), 1)

        block_temp_max = round(float(28.0 + np.random.normal(0, 2.5) if is_monsoon else 33.0 + np.random.normal(0, 3.0)), 1)
        block_humidity = round(float(85.0 + np.random.normal(0, 5.0) if is_monsoon else 55.0 + np.random.normal(0, 8.0)), 1)

        daily_obs = {}
        daily_residuals = {}
        for p in all_panchayats:
            b_mean = pune_block_mean_elev if p["id"].startswith("PANC_0") else bihar_block_mean_elev
            elev_delta = p["elevation_m"] - b_mean
            elevation_effect = (elev_delta / 80.0) * (2.8 if is_monsoon else 0.4)
            is_sw_facing = 180 <= p["aspect_deg"] <= 270
            aspect_effect = 3.5 if (is_sw_facing and is_monsoon) else 0.0
            
            local_noise = np.random.normal(0, 1.0 if block_rain > 0 else 0.2)
            if block_rain > 0:
                true_residual = elevation_effect + aspect_effect + local_noise
            else:
                true_residual = max(0.0, np.random.exponential(scale=2.0) - 1.5) if np.random.rand() < 0.08 else 0.0

            obs_rain = max(0.0, round(float(block_rain + true_residual), 1))
            daily_obs[p["id"]] = obs_rain
            daily_residuals[p["id"]] = obs_rain - block_rain

        for p in all_panchayats:
            pid = p["id"]
            b_mean = pune_block_mean_elev if pid.startswith("PANC_0") else bihar_block_mean_elev
            elev_delta = round(p["elevation_m"] - b_mean, 1)
            
            # Same-block neighbours
            same_block_ids = [other for other in p_ids if (other.startswith("PANC_0") == pid.startswith("PANC_0")) and other != pid]
            sorted_neighbours = sorted(same_block_ids, key=lambda x: dist_matrix[pid][x])[:3]
            
            neighbour_res_values = [daily_residuals[n] for n in sorted_neighbours]
            neighbour_res_mean = round(float(np.mean(neighbour_res_values)), 2)
            neighbour_res_std = round(float(np.std(neighbour_res_values)), 2)

            idw_num = sum(daily_obs[n] / (dist_matrix[pid][n]**2) for n in sorted_neighbours)
            idw_den = sum(1.0 / (dist_matrix[pid][n]**2) for n in sorted_neighbours)
            idw_rain = round(float(idw_num / idw_den), 1)

            hist_bias = round((elev_delta / 80.0) * 2.0, 2)
            recent_3d = round(max(0.0, daily_obs[pid] * 0.75 + np.random.normal(0, 0.8)), 1)
            is_sw_facing = 1.0 if (180 <= p["aspect_deg"] <= 270) else 0.0

            records.append({
                "date": d.strftime("%Y-%m-%d"),
                "panchayat_id": pid,
                "panchayat_name": p["name"],
                "block_rain_mm": block_rain,
                "block_temp_max": block_temp_max,
                "block_humidity": block_humidity,
                "elevation_m": p["elevation_m"],
                "elevation_delta_vs_block_mean": elev_delta,
                "slope_deg": p["slope_deg"],
                "aspect_deg": p["aspect_deg"],
                "aspect_wind_facing_flag": is_sw_facing,
                "neighbour_residual_mean": neighbour_res_mean,
                "neighbour_residual_std": neighbour_res_std,
                "idw_neighbour_rain": idw_rain,
                "recent_3d_rain_mean": recent_3d,
                "historical_bias": hist_bias,
                "observed_panchayat_rain": daily_obs[pid]
            })

    df_hist = pd.DataFrame(records)
    df_hist.to_csv(os.path.join(DATA_DIR, "historical_weather.csv"), index=False)
    print(f"Saved {len(df_hist)} multi-state spatial observations to historical_weather.csv.")

    # 4. Train and save model
    print("Training Multi-State Spatial XGBoost Residual Model...")
    from app.services.ml_service import XGBoostResidualDownscaler
    model_service = XGBoostResidualDownscaler()
    metrics = model_service.train(df_hist)
    
    model_path = os.path.join(MODEL_DIR, "residual_xgboost.pkl")
    model_service.save_model(model_path)
    print(f"Multi-State Model saved to {model_path}.")
    print("Training Metrics Summary:")
    print(f"  Overall MAE: {metrics['overall_mae_mm']} mm (Baseline MAE: {metrics['block_baseline_mae_mm']} mm)")

if __name__ == "__main__":
    generate_seed_data()
