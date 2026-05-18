from datetime import date, timedelta, timezone

import httpx
import pandas as pd
from fastapi import HTTPException

from app.config import settings
from app.schemas.forecast import HourlyPoint
from app.services.weather_codes import describe_weather_code, uv_label

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"


async def geocode_city(city: str) -> dict:
    async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
        response = await client.get(GEOCODING_URL, params={"name": city, "count": 1, "language": "en", "format": "json"})
    response.raise_for_status()
    results = response.json().get("results") or []
    if not results:
        raise HTTPException(status_code=404, detail=f"City not found: '{city}'")
    item = results[0]
    return {
        "city": item.get("name", city),
        "country": item.get("country_code") or item.get("country", ""),
        "lat": float(item["latitude"]),
        "lon": float(item["longitude"]),
        "timezone": item.get("timezone", "auto"),
    }


async def get_current_fallback(city: str) -> dict:
    location = await geocode_city(city)
    params = {
        "latitude": location["lat"],
        "longitude": location["lon"],
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
        "daily": "temperature_2m_max,temperature_2m_min",
        "timezone": "auto",
    }
    async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
        response = await client.get(FORECAST_URL, params=params)
    response.raise_for_status()
    payload = response.json()
    current = payload.get("current", {})
    daily = payload.get("daily", {})
    condition, icon, description = describe_weather_code(current.get("weather_code"))
    return {
        "city": location["city"],
        "country": location["country"],
        "lat": location["lat"],
        "lon": location["lon"],
        "timestamp": int(pd.Timestamp(current.get("time")).replace(tzinfo=timezone.utc).timestamp()),
        "timezone_offset": 0,
        "temp_c": round(float(current.get("temperature_2m", 0)), 1),
        "feels_like_c": round(float(current.get("apparent_temperature", 0)), 1),
        "temp_min_c": round(float((daily.get("temperature_2m_min") or [0])[0]), 1),
        "temp_max_c": round(float((daily.get("temperature_2m_max") or [0])[0]), 1),
        "humidity": int(current.get("relative_humidity_2m", 0)),
        "pressure_hpa": int(current.get("pressure_msl", 0)),
        "condition": condition,
        "condition_icon": icon,
        "description": description,
        "wind_speed_ms": round(float(current.get("wind_speed_10m", 0)) / 3.6, 1),
        "wind_direction_deg": int(current.get("wind_direction_10m", 0)),
        "cloud_cover_pct": int(current.get("cloud_cover", 0)),
        "visibility_m": 10000,
    }


async def get_uv_index(lat: float, lon: float) -> dict:
    params = {"latitude": lat, "longitude": lon, "daily": "uv_index_max", "timezone": "auto", "forecast_days": 1}
    async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
        response = await client.get(FORECAST_URL, params=params)
    response.raise_for_status()
    uv = float(((response.json().get("daily") or {}).get("uv_index_max") or [0])[0] or 0)
    return {"uv_index": round(uv, 1), "uv_label": uv_label(uv)}


async def get_hourly(lat: float, lon: float, hours: int = 48) -> list[HourlyPoint]:
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,cloud_cover,uv_index,weather_code,wind_speed_10m",
        "forecast_hours": hours,
        "timezone": "auto",
    }
    async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
        response = await client.get(FORECAST_URL, params=params)
    response.raise_for_status()
    hourly = response.json().get("hourly", {})
    points: list[HourlyPoint] = []
    for index, time_value in enumerate((hourly.get("time") or [])[:hours]):
        timestamp = int(pd.Timestamp(time_value).replace(tzinfo=timezone.utc).timestamp())
        _, icon, _ = describe_weather_code((hourly.get("weather_code") or [0])[index])
        points.append(
            HourlyPoint(
                timestamp=timestamp,
                time_label=pd.Timestamp(time_value).strftime("%H:%M"),
                temp_c=round(float((hourly.get("temperature_2m") or [0])[index]), 1),
                feels_like_c=round(float((hourly.get("apparent_temperature") or [0])[index]), 1),
                humidity=int((hourly.get("relative_humidity_2m") or [0])[index]),
                wind_speed_ms=round(float((hourly.get("wind_speed_10m") or [0])[index]) / 3.6, 1),
                precipitation_mm=round(float((hourly.get("precipitation") or [0])[index]), 1),
                cloud_cover_pct=int((hourly.get("cloud_cover") or [0])[index]),
                uv_index=round(float((hourly.get("uv_index") or [0])[index]), 1),
                condition_icon=icon,
            )
        )
    return points


async def get_historical(lat: float, lon: float, days: int = 45) -> pd.DataFrame:
    end_date = date.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=days)
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,cloud_cover_mean,uv_index_max,relative_humidity_2m_mean",
        "timezone": "auto",
    }
    async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
        response = await client.get(ARCHIVE_URL, params=params)
    response.raise_for_status()
    return pd.DataFrame(response.json().get("daily", {}))

