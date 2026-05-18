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
_confidence = 0.86


def _train_fallback_model() -> RandomForestRegressor:
    global _confidence
    data = engineer_features(build_synthetic_training_data())
    x_train, x_test, y_train, y_test = train_test_split(data[FEATURE_COLUMNS], data["temp_max"], test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=80, random_state=42, min_samples_leaf=2)
    model.fit(x_train, y_train)
    _confidence = max(0.0, min(0.99, r2_score(y_test, model.predict(x_test))))
    return model


def load_models() -> None:
    global _model
    path = Path(settings.ml_model_path)
    if path.exists():
        _model = joblib.load(path)
    else:
        _model = _train_fallback_model()


def _future_row(history: pd.DataFrame, future_date: pd.Timestamp) -> dict:
    return {
        "date": future_date,
        "temp_max": history["temp_max"].iloc[-1],
        "temp_min": history["temp_min"].iloc[-1],
        "humidity": history["humidity"].iloc[-1],
        "wind_speed": history["wind_speed"].iloc[-1],
        "precipitation": history["precipitation"].rolling(7).mean().iloc[-1],
        "cloud_cover": history["cloud_cover"].iloc[-1],
        "uv_index": history["uv_index"].iloc[-1],
    }


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
        predicted = float(_model.predict(features)[0])
        predictions.append({"day_offset": offset, "temp_max_predicted": round(predicted, 1)})
        working = candidate
        working.loc[working.index[-1], "temp_max"] = predicted
    return predictions, _confidence

