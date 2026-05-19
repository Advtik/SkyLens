from fastapi import APIRouter, Query

from app.config import settings
from app.schemas.disaster import DisasterResponse
from app.services import cache, openmeteo_service
from app.services.disaster_service import get_disaster_assessment
from app.services.owm_service import get_current_weather

router = APIRouter()


@router.get("/disaster", response_model=DisasterResponse)
async def get_disaster_assessment_route(city: str = Query(..., min_length=2)) -> DisasterResponse:
    normalized = city.strip().lower()
    cache_key = f"disaster:{normalized}"
    cached = cache.get_cached(cache_key)
    if cached:
        return DisasterResponse(**cached)

    current = await get_current_weather(city)
    forecast_cached = cache.get_cached(f"forecast:{normalized}:7")
    if forecast_cached:
        forecast_data = forecast_cached
    else:
        from app.routers.forecast import get_forecast

        forecast_data = (await get_forecast(city, days=7)).model_dump()

    historical = await openmeteo_service.get_historical(current["lat"], current["lon"], days=45)
    response = await get_disaster_assessment(current["city"], current["lat"], current["lon"], historical, forecast_data)
    cache.set_cached(cache_key, response.model_dump(), ttl=settings.disaster_cache_ttl_seconds)
    return response

