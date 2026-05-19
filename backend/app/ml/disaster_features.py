from datetime import datetime

import numpy as np
import pandas as pd

from app.ml.features import normalize_columns

DISASTER_CLASSES = ["none", "flood", "storm", "heatwave"]
DISASTER_FEATURE_COLUMNS = [
    "month",
    "day_of_year",
    "temp_max",
    "temp_min",
    "humidity",
    "wind_speed",
    "precipitation",
    "cloud_cover",
    "uv_index",
    "rolling_temp_7d",
    "rolling_precip_7d",
    "flag_heavy_rain",
    "flag_extreme_wind",
    "flag_extreme_heat",
    "flag_high_humidity",
    "compound_heat_humidity",
    "compound_rain_wind",
]

ANOMALY_FEATURE_COLUMNS = [
    "temp_max_zscore",
    "temp_min_zscore",
    "precipitation_zscore",
    "wind_speed_zscore",
    "humidity_zscore",
    "cloud_cover_zscore",
    "uv_index_zscore",
    "rolling_precip_7d_zscore",
]


def build_disaster_frame(forecast_data: dict) -> pd.DataFrame:
    rows = []
    for day in forecast_data.get("daily", []):
        date = datetime.fromisoformat(day["date"])
        temp_max = float(day["temp_max_c"])
        temp_min = float(day["temp_min_c"])
        humidity = float(day["humidity_avg"])
        wind_speed = float(day["wind_speed_avg"]) * 3.6
        precipitation = float(day["precipitation_mm"])
        cloud_cover = float(day["cloud_cover_avg"])
        uv_index = float(day["uv_max"])
        rows.append(
            {
                "date": day["date"],
                "month": date.month,
                "day_of_year": date.timetuple().tm_yday,
                "temp_max": temp_max,
                "temp_min": temp_min,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "precipitation": precipitation,
                "cloud_cover": cloud_cover,
                "uv_index": uv_index,
            }
        )
    frame = pd.DataFrame(rows)
    if frame.empty:
        return frame
    frame["rolling_temp_7d"] = frame["temp_max"].rolling(7, min_periods=1).mean()
    frame["rolling_precip_7d"] = frame["precipitation"].rolling(7, min_periods=1).sum()
    frame["flag_heavy_rain"] = (frame["precipitation"] > 20).astype(int)
    frame["flag_extreme_wind"] = (frame["wind_speed"] > 50).astype(int)
    frame["flag_extreme_heat"] = (frame["temp_max"] > 40).astype(int)
    frame["flag_high_humidity"] = (frame["humidity"] > 85).astype(int)
    frame["compound_heat_humidity"] = ((frame["temp_max"] > 35) & (frame["humidity"] > 70)).astype(int)
    frame["compound_rain_wind"] = ((frame["precipitation"] > 10) & (frame["wind_speed"] > 30)).astype(int)
    return frame.replace([np.inf, -np.inf], 0).fillna(0)


def engineer_anomaly_features(df: pd.DataFrame) -> pd.DataFrame:
    frame = normalize_columns(df)
    for column in ["temp_max", "temp_min", "precipitation", "wind_speed", "humidity", "cloud_cover", "uv_index"]:
        rolling_mean = frame[column].rolling(30, min_periods=7).mean()
        rolling_std = frame[column].rolling(30, min_periods=7).std().clip(lower=0.01)
        frame[f"{column}_zscore"] = (frame[column] - rolling_mean) / rolling_std
    precip_7d = frame["precipitation"].rolling(7, min_periods=7).sum()
    precip_mean = frame["precipitation"].rolling(30, min_periods=7).mean() * 7
    precip_std = frame["precipitation"].rolling(30, min_periods=7).std().clip(lower=0.01) * np.sqrt(7)
    frame["rolling_precip_7d_zscore"] = (precip_7d - precip_mean) / precip_std
    return frame.replace([np.inf, -np.inf], 0).dropna().reset_index(drop=True)

