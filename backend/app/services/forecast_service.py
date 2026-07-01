from datetime import datetime

from app.schemas.forecast import DailyForecast, ForecastResponse, HourlyPoint


def _hourly_by_date(hourly: list[HourlyPoint]) -> dict[str, list[HourlyPoint]]:
    grouped: dict[str, list[HourlyPoint]] = {}
    for point in hourly:
        date_key = point.time_label
        try:
            date_key = datetime.fromtimestamp(point.timestamp).date().isoformat()
        except (OSError, ValueError):
            pass
        grouped.setdefault(date_key, []).append(point)
    return grouped


def _estimate_precip_probability(item: dict) -> int:
    probability = item.get("precipitation_probability")
    if probability is not None:
        return int(round(float(probability)))
    precipitation = float(item.get("precipitation_mm") or 0)
    cloud_cover = float(item.get("cloud_cover_avg") or 0)
    humidity = float(item.get("humidity_avg") or 0)
    estimate = precipitation * 12 + cloud_cover * 0.35 + max(0, humidity - 70) * 0.4
    return int(max(0, min(100, round(estimate))))


def merge_forecast(
    official: dict,
    hourly: list[HourlyPoint],
    ml_predictions: list[dict],
    ml_confidence: float,
    days: int,
    aqi_forecast: dict[str, float] | None = None,
) -> ForecastResponse:
    daily: list[DailyForecast] = []
    hourly_groups = _hourly_by_date(hourly)
    aqi_forecast = aqi_forecast or {}
    for index, item in enumerate(official["daily"][:days]):
        date_key = item["date"]
        day_hours = hourly_groups.get(date_key, [])
        ml_item = ml_predictions[index] if index < len(ml_predictions) else {}
        official_max = float(item["temp_max_c"])
        official_min = float(item["temp_min_c"])
        raw_ml_max = float(ml_item.get("temp_max_predicted", official_max))
        raw_ml_min = float(ml_item.get("temp_min_predicted", official_min))
        ml_max = official_max * 0.7 + raw_ml_max * 0.3
        ml_min = official_min * 0.7 + raw_ml_min * 0.3
        if ml_min >= ml_max:
            ml_min = ml_max - max(1.0, official_max - official_min)

        enriched = {
            **item,
            "uv_max": round(max((point.uv_index or 0 for point in day_hours), default=float(item.get("uv_max") or 0)), 1),
            "precipitation_probability": max(
                [point.precipitation_probability or 0 for point in day_hours],
                default=_estimate_precip_probability(item),
            ),
            "aqi_avg": aqi_forecast.get(date_key, item.get("aqi_avg")),
            "aqi_source": "OpenWeather forecast" if date_key in aqi_forecast else None,
        }
        daily.append(
            DailyForecast(
                **enriched,
                temp_ml_predicted=round((ml_min + ml_max) / 2, 1),
                temp_ml_max_predicted=round(ml_max, 1),
                temp_ml_min_predicted=round(ml_min, 1),
            )
        )

    return ForecastResponse(
        city=official["city"],
        lat=official["lat"],
        lon=official["lon"],
        daily=daily,
        hourly=hourly,
        ml_confidence=round(float(ml_confidence), 2),
    )
