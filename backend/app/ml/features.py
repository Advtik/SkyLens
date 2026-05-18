import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "day_of_year",
    "month",
    "day_of_week",
    "temp_max_lag1",
    "temp_max_lag3",
    "temp_max_lag7",
    "temp_min_lag1",
    "humidity_lag1",
    "wind_speed_lag1",
    "precip_lag1",
    "rolling_temp_7d",
    "rolling_precip_7d",
    "cloud_cover_lag1",
    "uv_index_lag1",
]


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    renamed = df.rename(
        columns={
            "time": "date",
            "temperature_2m_max": "temp_max",
            "temperature_2m_min": "temp_min",
            "relative_humidity_2m_mean": "humidity",
            "wind_speed_10m_max": "wind_speed",
            "precipitation_sum": "precipitation",
            "cloud_cover_mean": "cloud_cover",
            "uv_index_max": "uv_index",
        }
    ).copy()
    for column in ["temp_max", "temp_min", "humidity", "wind_speed", "precipitation", "cloud_cover", "uv_index"]:
        if column not in renamed:
            renamed[column] = 0.0
        renamed[column] = pd.to_numeric(renamed[column], errors="coerce")
    renamed["date"] = pd.to_datetime(renamed["date"])
    return renamed.sort_values("date").ffill().bfill().fillna(0)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    frame = normalize_columns(df)
    frame["day_of_year"] = frame["date"].dt.dayofyear
    frame["month"] = frame["date"].dt.month
    frame["day_of_week"] = frame["date"].dt.dayofweek
    for lag in [1, 3, 7]:
        frame[f"temp_max_lag{lag}"] = frame["temp_max"].shift(lag)
    frame["temp_min_lag1"] = frame["temp_min"].shift(1)
    frame["humidity_lag1"] = frame["humidity"].shift(1)
    frame["wind_speed_lag1"] = frame["wind_speed"].shift(1)
    frame["precip_lag1"] = frame["precipitation"].shift(1)
    frame["rolling_temp_7d"] = frame["temp_max"].rolling(7).mean()
    frame["rolling_precip_7d"] = frame["precipitation"].rolling(7).sum()
    frame["cloud_cover_lag1"] = frame["cloud_cover"].shift(1)
    frame["uv_index_lag1"] = frame["uv_index"].shift(1)
    return frame.dropna().reset_index(drop=True)


def build_synthetic_training_data(days: int = 900) -> pd.DataFrame:
    dates = pd.date_range(end=pd.Timestamp.today().normalize(), periods=days)
    day = dates.dayofyear.to_numpy()
    seasonal = 26 + 10 * np.sin((day - 80) / 365 * 2 * np.pi)
    noise = np.random.default_rng(42).normal(0, 2.5, size=days)
    return pd.DataFrame(
        {
            "date": dates,
            "temp_max": seasonal + noise,
            "temp_min": seasonal - 7 + noise * 0.6,
            "humidity": np.clip(58 + 20 * np.cos(day / 365 * 2 * np.pi), 25, 95),
            "wind_speed": np.clip(12 + np.random.default_rng(7).normal(0, 3, size=days), 2, 28),
            "precipitation": np.clip(np.random.default_rng(11).gamma(1.1, 2.0, size=days) - 1, 0, 20),
            "cloud_cover": np.clip(45 + np.random.default_rng(13).normal(0, 20, size=days), 0, 100),
            "uv_index": np.clip(5 + 4 * np.sin((day - 70) / 365 * 2 * np.pi), 0, 11),
        }
    )
