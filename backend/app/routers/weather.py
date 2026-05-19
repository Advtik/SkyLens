import asyncio

from fastapi import APIRouter, HTTPException, Query
from pydantic import ValidationError

from app.schemas.weather import WeatherResponse
from app.services import cache, openmeteo_service, owm_service

router = APIRouter()


@router.get("/weather", response_model=WeatherResponse)
async def get_weather(city: str = Query(..., min_length=2)) -> WeatherResponse:
    cache_key = f"weather:{city.strip().lower()}"
    cached = cache.get_cached(cache_key)
    if cached:
        try:
            return WeatherResponse(**cached)
        except ValidationError:
            cache.delete_cached(cache_key)

    try:
        current = await owm_service.get_current_weather(city)
        aqi, uv = await asyncio.gather(
            owm_service.get_aqi(current["lat"], current["lon"]),
            openmeteo_service.get_uv_index(current["lat"], current["lon"]),
        )
        response = WeatherResponse(**current, **aqi, uv_index=uv["uv_index"], uv_label=uv["uv_label"])
        cache.set_cached(cache_key, response.model_dump())
        return response
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {exc}") from exc
