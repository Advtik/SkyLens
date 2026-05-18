from app.schemas.forecast import DailyForecast, ForecastResponse, HourlyPoint


def merge_forecast(
    official: dict,
    hourly: list[HourlyPoint],
    ml_predictions: list[dict],
    ml_confidence: float,
    days: int,
) -> ForecastResponse:
    daily: list[DailyForecast] = []
    for index, item in enumerate(official["daily"][:days]):
        ml_value = ml_predictions[index]["temp_max_predicted"] if index < len(ml_predictions) else item["temp_max_c"]
        daily.append(DailyForecast(**item, temp_ml_predicted=round(float(ml_value), 1)))

    return ForecastResponse(
        city=official["city"],
        lat=official["lat"],
        lon=official["lon"],
        daily=daily,
        hourly=hourly,
        ml_confidence=round(float(ml_confidence), 2),
    )

