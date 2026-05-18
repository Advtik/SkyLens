from typing import Optional

from pydantic import BaseModel


class HourlyPoint(BaseModel):
    timestamp: int
    time_label: str
    temp_c: float
    feels_like_c: float
    humidity: int
    wind_speed_ms: float
    precipitation_mm: float
    cloud_cover_pct: int
    uv_index: Optional[float]
    condition_icon: str


class DailyForecast(BaseModel):
    date: str
    temp_max_c: float
    temp_min_c: float
    temp_ml_predicted: float
    humidity_avg: int
    wind_speed_avg: float
    precipitation_mm: float
    cloud_cover_avg: int
    aqi_avg: Optional[float]
    uv_max: float
    condition: str
    condition_icon: str


class ForecastResponse(BaseModel):
    city: str
    lat: float
    lon: float
    daily: list[DailyForecast]
    hourly: list[HourlyPoint]
    ml_confidence: float


class HourlyResponse(BaseModel):
    city: str
    lat: float
    lon: float
    hourly: list[HourlyPoint]

