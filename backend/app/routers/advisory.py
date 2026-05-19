from fastapi import APIRouter, Query

from app.schemas.advisory import AdvisoryResponse
from app.services import cache
from app.services.advisory_service import get_advisory
from app.services.owm_service import get_current_weather

router = APIRouter()


@router.get("/advisory", response_model=AdvisoryResponse)
async def get_school_advisory(city: str = Query(..., min_length=2)) -> AdvisoryResponse:
    normalized = city.strip().lower()
    cache_key = f"advisory:{normalized}"
    cached = cache.get_cached(cache_key)
    if cached:
        return AdvisoryResponse(**cached)

    current = await get_current_weather(city)
    forecast_cached = cache.get_cached(f"forecast:{normalized}:7")
    if forecast_cached:
        forecast_data = forecast_cached
    else:
        from app.routers.forecast import get_forecast

        forecast_data = (await get_forecast(city, days=7)).model_dump()

    response = await get_advisory(current["city"], current["lat"], current["lon"], forecast_data)
    cache.set_cached(cache_key, response.model_dump())
    return response

