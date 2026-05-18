from typing import Optional

from pydantic import BaseModel


class WeatherResponse(BaseModel):
    city: str
    country: str
    lat: float
    lon: float
    timestamp: int
    timezone_offset: int
    temp_c: float
    feels_like_c: float
    temp_min_c: float
    temp_max_c: float
    humidity: int
    pressure_hpa: int
    condition: str
    condition_icon: str
    description: str
    wind_speed_ms: float
    wind_direction_deg: int
    cloud_cover_pct: int
    visibility_m: int
    aqi: int
    aqi_label: str
    pm25: Optional[float]
    pm10: Optional[float]
    uv_index: float
    uv_label: str

