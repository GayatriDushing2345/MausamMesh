def get_imd_category_from_mm(rain_mm: float) -> str:
    """Returns official IMD precipitation category string for any daily rainfall in mm."""
    if rain_mm <= 0.0:
        return "No Rain"
    if rain_mm <= 2.4:
        return "Very Light Rain"
    if rain_mm <= 15.5:
        return "Light Rain"
    if rain_mm <= 64.4:
        return "Moderate Rain"
    if rain_mm <= 115.5:
        return "Heavy Rain"
    if rain_mm <= 204.4:
        return "Very Heavy Rain"
    return "Extremely Heavy Rain"
