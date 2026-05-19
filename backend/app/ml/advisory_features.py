from datetime import datetime

import numpy as np
import pandas as pd

ADVISORY_DIMENSIONS = [
    "attendance_disrupted",
    "commute_difficult",
    "outdoor_unsafe",
    "heat_stress",
    "rain_disruption",
    "weather_severe",
]

ADVISORY_FEATURE_COLUMNS = [
    "month",
    "day_of_week",
    "is_weekend",
    "temp_max",
    "temp_min",
    "humidity",
    "wind_speed",
    "precipitation",
    "cloud_cover",
    "uv_index",
    "heat_index",
    "apparent_temp_max",
    "rolling_precip_3d",
    "rolling_precip_7d",
    "rolling_temp_7d",
    "temp_max_lag1",
    "wind_speed_lag1",
    "temp_delta",
]


def compute_heat_index(temp_c: pd.Series, humidity: pd.Series) -> pd.Series:
    return (
        -8.78469475556
        + 1.61139411 * temp_c
        + 2.33854883889 * humidity
        - 0.14611605 * temp_c * humidity
        - 0.012308094 * temp_c**2
        - 0.0164248277778 * humidity**2
        + 0.002211732 * temp_c**2 * humidity
        + 0.00072546 * temp_c * humidity**2
        - 0.000003582 * temp_c**2 * humidity**2
    ).clip(lower=temp_c)


def build_advisory_frame(forecast_data: dict) -> pd.DataFrame:
    rows = []
    for day in forecast_data.get("daily", []):
        date = datetime.fromisoformat(day["date"])
        rows.append(
            {
                "date": day["date"],
                "month": date.month,
                "day_of_week": date.weekday(),
                "is_weekend": int(date.weekday() >= 5),
                "temp_max": float(day["temp_max_c"]),
                "temp_min": float(day["temp_min_c"]),
                "humidity": float(day["humidity_avg"]),
                "wind_speed": float(day["wind_speed_avg"]) * 3.6,
                "precipitation": float(day["precipitation_mm"]),
                "cloud_cover": float(day["cloud_cover_avg"]),
                "uv_index": float(day["uv_max"]),
            }
        )
    frame = pd.DataFrame(rows)
    if frame.empty:
        return frame
    frame["heat_index"] = compute_heat_index(frame["temp_max"], frame["humidity"])
    frame["apparent_temp_max"] = frame["temp_max"] - 0.4 * (frame["temp_max"] - 10) * (1 - frame["humidity"] / 100)
    frame["rolling_precip_3d"] = frame["precipitation"].rolling(3, min_periods=1).sum()
    frame["rolling_precip_7d"] = frame["precipitation"].rolling(7, min_periods=1).sum()
    frame["rolling_temp_7d"] = frame["temp_max"].rolling(7, min_periods=1).mean()
    frame["temp_max_lag1"] = frame["temp_max"].shift(1).fillna(frame["temp_max"])
    frame["wind_speed_lag1"] = frame["wind_speed"].shift(1).fillna(frame["wind_speed"])
    frame["temp_delta"] = frame["temp_max"] - frame["temp_max_lag1"]
    for column in ADVISORY_FEATURE_COLUMNS:
        if column not in frame:
            frame[column] = 0.0
    return frame.replace([np.inf, -np.inf], 0).fillna(0)

