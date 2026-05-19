from pathlib import Path

import joblib
import numpy as np

from app.config import settings
from app.ml.advisory_features import ADVISORY_DIMENSIONS, ADVISORY_FEATURE_COLUMNS, build_advisory_frame

_advisory_bundle: dict | None = None


def load_advisory_models() -> None:
    global _advisory_bundle
    path = Path(settings.advisory_model_path)
    _advisory_bundle = joblib.load(path) if path.exists() else None


def _overall_risk(scores: dict[str, float]) -> str:
    peak = max(scores.values()) if scores else 0
    if peak < 30:
        return "GREEN"
    if peak < 55:
        return "YELLOW"
    if peak < 75:
        return "ORANGE"
    return "RED"


def _fallback_scores(row) -> dict[str, float]:
    heat = max(0, min(100, (row.temp_max - 30) * 7 + max(0, row.humidity - 55) * 0.7))
    rain = max(0, min(100, row.precipitation * 5 + row.cloud_cover * 0.25))
    wind = max(0, min(100, (row.wind_speed - 20) * 2.2))
    uv = max(0, min(100, (row.uv_index - 5) * 12))
    commute = max(rain, wind, heat * 0.45)
    outdoor = max(uv, heat, wind * 0.8, rain * 0.55)
    attendance = max(commute * 0.82, rain * 0.7, heat * 0.65)
    severe = max(heat * 0.75, rain * 0.8, wind)
    return {
        "attendance_disrupted": round(attendance, 1),
        "commute_difficult": round(commute, 1),
        "outdoor_unsafe": round(outdoor, 1),
        "heat_stress": round(heat, 1),
        "rain_disruption": round(rain, 1),
        "weather_severe": round(severe, 1),
    }


def predict_advisory(forecast_data: dict) -> dict:
    global _advisory_bundle
    if _advisory_bundle is None:
        load_advisory_models()

    frame = build_advisory_frame(forecast_data)
    days = []
    if frame.empty:
        return {"days": [], "overall_risk": "GREEN", "confidence": 0.0}

    probas = None
    confidence = 0.64
    if _advisory_bundle:
        model = _advisory_bundle["model"]
        feature_columns = _advisory_bundle.get("feature_columns", ADVISORY_FEATURE_COLUMNS)
        confidence = float(_advisory_bundle.get("confidence", 0.78))
        estimators = getattr(model, "estimators_", None)
        if estimators:
            probas = np.column_stack([est.predict_proba(frame[feature_columns])[:, 1] for est in estimators]) * 100

    for index, row in frame.iterrows():
        if probas is not None:
            scores = {dim: round(float(probas[index, col]), 1) for col, dim in enumerate(ADVISORY_DIMENSIONS)}
        else:
            scores = _fallback_scores(row)
        overall = _overall_risk(scores)
        days.append(
            {
                "date": row["date"],
                "risk_scores": scores,
                "overall_risk": overall,
                "risk_flags": {key: value >= 55 for key, value in scores.items()},
            }
        )

    order = {"GREEN": 0, "YELLOW": 1, "ORANGE": 2, "RED": 3}
    peak = max((day["overall_risk"] for day in days), key=lambda item: order[item])
    return {"days": days, "overall_risk": peak, "confidence": round(confidence, 2)}

