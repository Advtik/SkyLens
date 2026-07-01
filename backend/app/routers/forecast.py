import asyncio

from fastapi import APIRouter, HTTPException, Query

from app.schemas.forecast import ForecastResponse, HourlyResponse
from app.services import cache, forecast_service, openmeteo_service, owm_service
from app.services.ml_service import predict

router = APIRouter()


@router.get("/forecast", response_model=ForecastResponse)
async def get_forecast(city: str = Query(..., min_length=2), days: int = Query(7, ge=1, le=10)) -> ForecastResponse:
    cache_key = f"forecast:{city.strip().lower()}:{days}"
    cached = cache.get_cached(cache_key)
    if cached:
        return ForecastResponse(**cached)

    try:
        official = await owm_service.get_forecast(city, days=days)
        historical_task = openmeteo_service.get_historical(official["lat"], official["lon"], days=45)
        hourly_task = openmeteo_service.get_hourly(official["lat"], official["lon"], hours=48)
        aqi_task = owm_service.get_aqi_forecast(official["lat"], official["lon"])
        historical, hourly, aqi_forecast = await asyncio.gather(historical_task, hourly_task, aqi_task)
        ml_predictions, confidence = predict(historical, days=days)
        response = forecast_service.merge_forecast(official, hourly, ml_predictions, confidence, days, aqi_forecast=aqi_forecast)
        cache.set_cached(cache_key, response.model_dump())
        return response
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Forecast service unavailable: {exc}") from exc


@router.get("/forecast/hourly", response_model=HourlyResponse)
async def get_hourly_forecast(city: str = Query(..., min_length=2)) -> HourlyResponse:
    cache_key = f"hourly:{city.strip().lower()}"
    cached = cache.get_cached(cache_key)
    if cached:
        return HourlyResponse(**cached)

    try:
        current = await owm_service.get_current_weather(city)
        hourly = await openmeteo_service.get_hourly(current["lat"], current["lon"], hours=24)
        response = HourlyResponse(city=current["city"], lat=current["lat"], lon=current["lon"], hourly=hourly)
        cache.set_cached(cache_key, response.model_dump())
        return response
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Hourly forecast unavailable: {exc}") from exc
