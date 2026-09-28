from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas import AdvisoryOutputItem, AdvisoryResponse, DAMUApprovalResponse

class AgroAdvisoryEngine:
    """Explainable, rule-based & confidence-gated Agro-Meteorological Advisory Service.
    Supports DAMU (District Agromet Unit) Officer-in-the-Loop review & channel dispatch (USP 5).
    """

    def generate_advisory(
        self,
        panchayat_id: str,
        panchayat_name: str,
        crop_name: str,
        growth_stage: str,
        forecast_items: List[Dict[str, Any]]
    ) -> AdvisoryResponse:
        
        advisories: List[AdvisoryOutputItem] = []

        next_48h_rain = sum(item["panchayat_downscaled_rain_mm"] for item in forecast_items[:2])
        total_5d_rain = sum(item["panchayat_downscaled_rain_mm"] for item in forecast_items)
        max_single_day_rain = max(item["panchayat_downscaled_rain_mm"] for item in forecast_items)
        max_humidity = max(item["humidity_pct"] for item in forecast_items)
        max_wind = max(item["wind_speed_kmh"] for item in forecast_items)

        max_interval_width = max(item.get("confidence_interval_width_mm", 5.0) for item in forecast_items)
        avg_interval_width = sum(item.get("confidence_interval_width_mm", 5.0) for item in forecast_items) / len(forecast_items)

        if max_interval_width >= 7.5 or avg_interval_width >= 6.0:
            confidence_level = "Low"
            is_confidence_gated = True
            confidence_warning = f"⚠️ Low-confidence downscaled forecast (Interval width: {max_interval_width:.1f} mm). High microclimate variance detected for {panchayat_name}. Treat advisories as indicative; consult local Krishi Vigyan Kendra (KVK) officer before high-cost interventions."
        elif max_interval_width >= 4.5:
            confidence_level = "Moderate"
            is_confidence_gated = False
            confidence_warning = None
        else:
            confidence_level = "High"
            is_confidence_gated = False
            confidence_warning = None

        crop_clean = crop_name.strip().title()
        stage_clean = growth_stage.strip().title()

        # Rule 1: Heavy Rain Warning
        if max_single_day_rain >= 25.0 or next_48h_rain >= 35.0:
            advisories.append(AdvisoryOutputItem(
                category="Irrigation & Field Management",
                title="Immediate Suspension of Irrigation & Drainage Alert",
                message=f"Heavy rainfall of up to {max_single_day_rain:.1f} mm is downscaled for {panchayat_name}. Stop all artificial irrigation. Clear field ditches to prevent root submergence and nutrient leaching in {crop_clean} fields.",
                severity="ActionRequired",
                trigger_rule="RULE_HEAVY_RAIN_SUBMERGENCE (Panchayat Rain > 25mm/day)"
            ))

        elif next_48h_rain >= 12.0:
            advisories.append(AdvisoryOutputItem(
                category="Irrigation & Field Management",
                title="Postpone Scheduled Irrigation",
                message=f"Moderate rain ({next_48h_rain:.1f} mm expected over next 48h) will satisfy soil water requirement for {crop_clean} at {stage_clean} stage. Postpone canal/borewell irrigation to conserve water and power.",
                severity="Warning",
                trigger_rule="RULE_MODERATE_RAIN_DEFERRAL (Next 48h Rain >= 12mm)"
            ))

        # Rule 2: Dry Spell Alert
        if total_5d_rain < 3.0:
            if stage_clean in ["Flowering", "Grain Filling", "Pod Formation"]:
                advisories.append(AdvisoryOutputItem(
                    category="Irrigation & Field Management",
                    title="Critical Moisture Stress Mitigation",
                    message=f"Dry spell predicted with less than 3 mm rainfall over the next 5 days. {crop_clean} is currently at moisture-critical '{stage_clean}' stage. Provide light protective micro-irrigation or apply crop residue mulch to preserve root zone moisture.",
                    severity="ActionRequired",
                    trigger_rule="RULE_CRITICAL_STAGE_DRY_SPELL (5-Day Rain < 3mm at Flowering/Grain Filling)"
                ))
            else:
                advisories.append(AdvisoryOutputItem(
                    category="Irrigation & Field Management",
                    title="Dry Weather Moisture Conservation",
                    message=f"Dry weather ahead ({total_5d_rain:.1f} mm total in 5 days). Maintain regular light irrigation schedule according to soil type.",
                    severity="Info",
                    trigger_rule="RULE_DRY_WEATHER_REGULAR (5-Day Rain < 3mm)"
                ))

        # Rule 3: Plant Protection & Chemical Spraying
        if max_humidity >= 80.0 and total_5d_rain >= 8.0:
            advisories.append(AdvisoryOutputItem(
                category="Plant Protection & Spraying",
                title="Fungal / Bacterial Disease Watch",
                message=f"High atmospheric humidity ({max_humidity:.0f}%) combined with wet conditions increases risk of blast/blight/rust in {crop_clean}. Avoid chemical spraying during rain spells. Plan prophylactic spray of recommended bio-fungicide during clear morning windows.",
                severity="Warning",
                trigger_rule="RULE_HUMID_DISEASE_FAVORABLE (Humidity > 80% & Rain >= 8mm)"
            ))
        elif max_wind >= 22.0:
            advisories.append(AdvisoryOutputItem(
                category="Plant Protection & Spraying",
                title="High Wind Spray Warning",
                message=f"Wind speeds reaching {max_wind:.1f} km/h downscaled for {panchayat_name}. Postpone pesticide/herbicide spray operations to prevent spray drift and ineffective chemical deposition.",
                severity="Warning",
                trigger_rule="RULE_HIGH_WIND_DRIFT (Wind Speed >= 22 km/h)"
            ))
        else:
            advisories.append(AdvisoryOutputItem(
                category="Plant Protection & Spraying",
                title="Optimal Chemical Spray Window",
                message="Wind and weather conditions are suitable for scheduled foliar sprays and nutrient application during non-rain hours.",
                severity="Info",
                trigger_rule="RULE_NORMAL_SPRAY_WINDOW"
            ))

        # Rule 4: Stage-Specific Advisory
        if stage_clean in ["Sowing", "Germination"]:
            if 10.0 <= next_48h_rain <= 30.0:
                advisories.append(AdvisoryOutputItem(
                    category="Sowing & Land Preparation",
                    title="Optimal Sowing Window",
                    message=f"Favorable soil moisture expected ({next_48h_rain:.1f} mm rain in 48h). Ideal window for sowing/transplanting {crop_clean}. Ensure certified seed treatment before sowing.",
                    severity="Info",
                    trigger_rule="RULE_SOWING_OPTIMAL_MOISTURE (48h Rain 10-30mm)"
                ))
            elif next_48h_rain > 35.0:
                advisories.append(AdvisoryOutputItem(
                    category="Sowing & Land Preparation",
                    title="Delay Sowing Due to Excess Moisture",
                    message=f"Excessive rain ({next_48h_rain:.1f} mm) will cause seed decay or soil crusting. Delay sowing of {crop_clean} until soil moisture reaches field capacity.",
                    severity="ActionRequired",
                    trigger_rule="RULE_SOWING_EXCESS_RAIN (48h Rain > 35mm)"
                ))

        if stage_clean in ["Maturity", "Harvesting"]:
            if max_single_day_rain >= 10.0:
                advisories.append(AdvisoryOutputItem(
                    category="Harvesting & Post-Harvest",
                    title="Urgent Harvest & Produce Protection",
                    message=f"Rain of {max_single_day_rain:.1f} mm expected in forecast period. Expedite harvesting of mature {crop_clean} and move harvested produce immediately to safe tarpaulin-covered shelters.",
                    severity="ActionRequired",
                    trigger_rule="RULE_HARVEST_RAIN_PROTECTION (Panchayat Rain >= 10mm at Harvest)"
                ))
            else:
                advisories.append(AdvisoryOutputItem(
                    category="Harvesting & Post-Harvest",
                    title="Clear Weather Harvest Window",
                    message=f"Dry conditions suitable for harvesting and sun-drying harvested {crop_clean} grain/produce.",
                    severity="Info",
                    trigger_rule="RULE_HARVEST_CLEAR_WEATHER"
                ))

        return AdvisoryResponse(
            panchayat_id=panchayat_id,
            panchayat_name=panchayat_name,
            crop_name=crop_clean,
            growth_stage=stage_clean,
            generated_at=datetime.now().strftime("%Y-%m-%d %H:%M IST"),
            forecast_confidence_level=confidence_level,
            forecast_interval_width_mm=round(max_interval_width, 1),
            is_confidence_gated=is_confidence_gated,
            confidence_gated_warning=confidence_warning,
            approval_status="Draft (Awaiting DAMU Officer Review)",
            approved_by_officer=None,
            dispatched_channels=[],
            is_demo_rule_engine=True,
            advisories=advisories
        )

    def approve_advisory(
        self,
        panchayat_id: str,
        panchayat_name: str,
        crop_name: str,
        growth_stage: str,
        officer_name: str,
        target_channels: List[str]
    ) -> DAMUApprovalResponse:
        """USP 5: DAMU Officer Approval & Multi-Channel Dispatch Handler."""
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M IST")
        return DAMUApprovalResponse(
            status="Approved & Dispatched",
            message=f"Agro-advisory bulletin for {panchayat_name} ({crop_name} - {growth_stage}) successfully approved by {officer_name} and queued for multi-channel dispatch.",
            panchayat_id=panchayat_id,
            panchayat_name=panchayat_name,
            approved_by=officer_name,
            approved_at=now_str,
            dispatched_channels=target_channels
        )

advisory_engine = AgroAdvisoryEngine()
