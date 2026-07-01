from datetime import timedelta
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split

from app.config import settings
from app.ml.features import FEATURE_COLUMNS, build_synthetic_training_data, engineer_features, normalize_columns

_model: RandomForestRegressor | None = None
_min_model: RandomForestRegressor | None = None
_confidence = 0.86


def _train_fallback_models() -> tuple[RandomForestRegressor, RandomForestRegressor]:
    global _confidence
    data = engineer_features(build_synthetic_training_data())
    x_train, x_test, y_train, y_test = train_test_split(data[FEATURE_COLUMNS], data["temp_max"], test_size=0.2, random_state=42)
    max_model = RandomForestRegressor(n_estimators=80, random_state=42, min_samples_leaf=2)
    min_model = RandomForestRegressor(n_estimators=80, random_state=24, min_samples_leaf=2)
    max_model.fit(x_train, y_train)
    min_model.fit(x_train, data.loc[y_train.index, "temp_min"])
    max_score = r2_score(y_test, max_model.predict(x_test))
    min_score = r2_score(data.loc[y_test.index, "temp_min"], min_model.predict(x_test))
    _confidence = max(0.0, min(0.99, (max_score + min_score) / 2))
    return max_model, min_model


def load_models() -> None:
    global _model, _min_model
    path = Path(settings.ml_model_path)
    if path.exists():
        _model = joblib.load(path)
        _, _min_model = _train_fallback_models()
    else:
        _model, _min_model = _train_fallback_models()


def _future_row(history: pd.DataFrame, future_date: pd.Timestamp) -> dict:
    recent_precip = history["precipitation"].rolling(7, min_periods=1).mean().iloc[-1]
    return {
        "date": future_date,
        "temp_max": history["temp_max"].iloc[-1],
        "temp_min": history["temp_min"].iloc[-1],
        "humidity": history["humidity"].iloc[-1],
        "wind_speed": history["wind_speed"].iloc[-1],
        "precipitation": recent_precip,
        "cloud_cover": history["cloud_cover"].iloc[-1],
        "uv_index": history["uv_index"].iloc[-1],
    }


def _bounded_min_prediction(history: pd.DataFrame, predicted_max: float, predicted_min: float) -> float:
    recent_range = (history["temp_max"] - history["temp_min"]).tail(14).median()
    if pd.isna(recent_range) or recent_range < 2:
        recent_range = 6
    lower_bound = predicted_max - max(14, recent_range * 1.8)
    upper_bound = predicted_max - max(1.0, recent_range * 0.45)
    return float(min(upper_bound, max(lower_bound, predicted_min)))


def predict(historical_df: pd.DataFrame, days: int = 7) -> tuple[list[dict], float]:
    global _model
    if _model is None:
        load_models()

    history = normalize_columns(historical_df)
    if len(history) < 14:
        history = build_synthetic_training_data(90)

    predictions = []
    working = history.copy()
    for offset in range(1, days + 1):
        future_date = pd.to_datetime(working["date"].iloc[-1]) + timedelta(days=1)
        candidate = pd.concat([working, pd.DataFrame([_future_row(working, future_date)])], ignore_index=True)
        engineered = engineer_features(candidate)
        features = engineered[FEATURE_COLUMNS].iloc[[-1]]
        predicted_max = float(_model.predict(features)[0])
        raw_min = float(_min_model.predict(features)[0]) if _min_model is not None else predicted_max - 6
        predicted_min = _bounded_min_prediction(working, predicted_max, raw_min)
        predictions.append(
            {
                "day_offset": offset,
                "temp_max_predicted": round(predicted_max, 1),
                "temp_min_predicted": round(predicted_min, 1),
            }
        )
        working = candidate
        working.loc[working.index[-1], "temp_max"] = predicted_max
        working.loc[working.index[-1], "temp_min"] = predicted_min
    return predictions, _confidence
