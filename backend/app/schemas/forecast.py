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
    precipitation_probability: Optional[int] = None
    cloud_cover_pct: int
    uv_index: Optional[float]
    condition_icon: str


class DailyForecast(BaseModel):
    date: str
    temp_max_c: float
    temp_min_c: float
    temp_ml_predicted: float
    temp_ml_max_predicted: Optional[float] = None
    temp_ml_min_predicted: Optional[float] = None
    humidity_avg: int
    wind_speed_avg: float
    precipitation_mm: float
    precipitation_probability: Optional[int] = None
    cloud_cover_avg: int
    aqi_avg: Optional[float]
    aqi_source: Optional[str] = None
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
