from collections import defaultdict
from datetime import datetime

import httpx
from fastapi import HTTPException

from app.config import settings
from app.services import openmeteo_service
from app.services.weather_codes import aqi_label

OWM_BASE = "https://api.openweathermap.org"


async def _get_json(path: str, params: dict) -> dict:
    if not settings.owm_api_key:
        raise RuntimeError("OWM_API_KEY is not configured")
    async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
        response = await client.get(f"{OWM_BASE}{path}", params={**params, "appid": settings.owm_api_key})
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"City not found: '{params.get('q', '')}'")
    response.raise_for_status()
    return response.json()


async def get_current_weather(city: str) -> dict:
    if not settings.owm_api_key:
        return await openmeteo_service.get_current_fallback(city)

    data = await _get_json("/data/2.5/weather", {"q": city, "units": "metric"})
    weather = (data.get("weather") or [{}])[0]
    main = data.get("main", {})
    wind = data.get("wind", {})
    return {
        "city": data.get("name", city),
        "country": (data.get("sys") or {}).get("country", ""),
        "lat": float(data["coord"]["lat"]),
        "lon": float(data["coord"]["lon"]),
        "timestamp": int(data.get("dt", 0)),
        "timezone_offset": int(data.get("timezone", 0)),
        "temp_c": round(float(main.get("temp", 0)), 1),
        "feels_like_c": round(float(main.get("feels_like", 0)), 1),
        "temp_min_c": round(float(main.get("temp_min", 0)), 1),
        "temp_max_c": round(float(main.get("temp_max", 0)), 1),
        "humidity": int(main.get("humidity", 0)),
        "pressure_hpa": int(main.get("pressure", 0)),
        "condition": weather.get("main", "Clouds"),
        "condition_icon": weather.get("icon", "03d"),
        "description": weather.get("description", "variable weather"),
        "wind_speed_ms": round(float(wind.get("speed", 0)), 1),
        "wind_direction_deg": int(wind.get("deg", 0)),
        "cloud_cover_pct": int((data.get("clouds") or {}).get("all", 0)),
        "visibility_m": int(data.get("visibility", 0)),
    }


async def get_aqi(lat: float, lon: float) -> dict:
    if not settings.owm_api_key:
        return {"aqi": 2, "aqi_label": "Fair", "pm25": None, "pm10": None}

    data = await _get_json("/data/2.5/air_pollution", {"lat": lat, "lon": lon})
    item = (data.get("list") or [{}])[0]
    aqi = int((item.get("main") or {}).get("aqi", 1))
    components = item.get("components") or {}
    return {
        "aqi": aqi,
        "aqi_label": aqi_label(aqi),
        "pm25": components.get("pm2_5"),
        "pm10": components.get("pm10"),
    }


async def get_forecast(city: str, days: int = 7) -> dict:
    if not settings.owm_api_key:
        location = await openmeteo_service.geocode_city(city)
        hourly = await openmeteo_service.get_hourly(location["lat"], location["lon"], hours=days * 24)
        daily = defaultdict(list)
        for point in hourly:
            daily[datetime.fromtimestamp(point.timestamp).date().isoformat()].append(point)
        return {
            "city": location["city"],
            "lat": location["lat"],
            "lon": location["lon"],
            "daily": [
                {
                    "date": date_key,
                    "temp_max_c": max(p.temp_c for p in points),
                    "temp_min_c": min(p.temp_c for p in points),
                    "humidity_avg": round(sum(p.humidity for p in points) / len(points)),
                    "wind_speed_avg": round(sum(p.wind_speed_ms for p in points) / len(points), 1),
                    "precipitation_mm": round(sum(p.precipitation_mm for p in points), 1),
                    "cloud_cover_avg": round(sum(p.cloud_cover_pct for p in points) / len(points)),
                    "aqi_avg": None,
                    "uv_max": max((p.uv_index or 0) for p in points),
                    "condition": "Forecast",
                    "condition_icon": points[0].condition_icon,
                }
                for date_key, points in list(daily.items())[:days]
            ],
        }

    data = await _get_json("/data/2.5/forecast", {"q": city, "units": "metric"})
    grouped = defaultdict(list)
    for item in data.get("list", []):
        grouped[item["dt_txt"].split(" ")[0]].append(item)
    daily = []
    for date_key, items in list(grouped.items())[:days]:
        weather = (items[len(items) // 2].get("weather") or [{}])[0]
        daily.append(
            {
                "date": date_key,
                "temp_max_c": round(max(float(i["main"]["temp_max"]) for i in items), 1),
                "temp_min_c": round(min(float(i["main"]["temp_min"]) for i in items), 1),
                "humidity_avg": round(sum(int(i["main"]["humidity"]) for i in items) / len(items)),
                "wind_speed_avg": round(sum(float(i["wind"]["speed"]) for i in items) / len(items), 1),
                "precipitation_mm": round(sum(float((i.get("rain") or {}).get("3h", 0)) for i in items), 1),
                "cloud_cover_avg": round(sum(int(i["clouds"]["all"]) for i in items) / len(items)),
                "aqi_avg": None,
                "uv_max": 0.0,
                "condition": weather.get("main", "Clouds"),
                "condition_icon": weather.get("icon", "03d"),
            }
        )
    return {
        "city": data.get("city", {}).get("name", city),
        "lat": float(data["city"]["coord"]["lat"]),
        "lon": float(data["city"]["coord"]["lon"]),
        "daily": daily,
    }

