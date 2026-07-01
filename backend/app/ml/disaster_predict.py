from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from app.config import settings
from app.ml.disaster_features import ANOMALY_FEATURE_COLUMNS, DISASTER_CLASSES, DISASTER_FEATURE_COLUMNS, build_disaster_frame, engineer_anomaly_features

_disaster_bundle: dict | None = None
_anomaly_bundle: dict | None = None


def load_disaster_models() -> None:
    global _disaster_bundle, _anomaly_bundle
    disaster_path = Path(settings.disaster_model_path)
    anomaly_path = Path(settings.anomaly_model_path)
    _disaster_bundle = joblib.load(disaster_path) if disaster_path.exists() else None
    _anomaly_bundle = joblib.load(anomaly_path) if anomaly_path.exists() else None


def _risk_level(confidence: float) -> str:
    if confidence < 60:
        return "ELEVATED"
    if confidence < 80:
        return "HIGH"
    return "CRITICAL"


def _explain_features(row: pd.Series) -> list[str]:
    explanations = []
    if row.get("precipitation", 0) > 20:
        explanations.append(f"Precipitation {row['precipitation']:.1f}mm exceeds heavy-rain threshold")
    if row.get("wind_speed", 0) > 50:
        explanations.append(f"Wind speed {row['wind_speed']:.1f}km/h indicates storm-force conditions")
    if row.get("temp_max", 0) > 40:
        explanations.append(f"Max temperature {row['temp_max']:.1f}C crosses extreme heat threshold")
    if row.get("rolling_precip_7d", 0) > 80:
        explanations.append(f"7-day rainfall {row['rolling_precip_7d']:.1f}mm elevates flood risk")
    return explanations[:3]


def _fallback_breakdown(row: pd.Series) -> dict[str, float]:
    flood = min(96, row.precipitation * 2.4 + row.rolling_precip_7d * 0.75)
    storm = min(96, max(row.wind_speed * 1.25, row.precipitation * 1.7 + row.wind_speed * 0.45))
    heatwave = min(96, max(0, (row.temp_max - 35) * 12 + max(0, row.rolling_temp_7d - 34) * 8))
    none = max(0, 100 - max(flood, storm, heatwave))
    return {"none": round(none, 1), "flood": round(flood, 1), "storm": round(storm, 1), "heatwave": round(heatwave, 1)}


def predict_disaster(forecast_data: dict) -> dict:
    global _disaster_bundle
    if _disaster_bundle is None:
        load_disaster_models()

    frame = build_disaster_frame(forecast_data)
    if frame.empty:
        return {"alerts": [], "confidence": 0.0}

    alerts = []
    confidence = 0.66
    if _disaster_bundle:
        confidence = float(_disaster_bundle.get("confidence", 0.78))
        model = _disaster_bundle["model"]
        classes = _disaster_bundle.get("classes", DISASTER_CLASSES)
        feature_columns = _disaster_bundle.get("feature_columns", DISASTER_FEATURE_COLUMNS)
        matrix = model.predict_proba(frame[feature_columns])
        for index, row in frame.iterrows():
            class_index = int(np.argmax(matrix[index]))
            disaster_type = classes[class_index]
            class_confidence = float(matrix[index][class_index] * 100)
            triggered_features = _explain_features(row)
            if disaster_type != "none" and (class_confidence >= 65 or (class_confidence >= 55 and triggered_features)):
                alerts.append(
                    {
                        "date": row["date"],
                        "type": disaster_type,
                        "confidence": round(class_confidence, 1),
                        "risk_level": _risk_level(class_confidence),
                        "proba_breakdown": {cls: round(float(matrix[index][i] * 100), 1) for i, cls in enumerate(classes)},
                        "triggered_features": triggered_features,
                    }
                )
    else:
        for _, row in frame.iterrows():
            breakdown = _fallback_breakdown(row)
            disaster_type = max(["flood", "storm", "heatwave"], key=lambda key: breakdown[key])
            class_confidence = breakdown[disaster_type]
            triggered_features = _explain_features(row)
            if class_confidence >= 65 or (class_confidence >= 55 and triggered_features):
                alerts.append(
                    {
                        "date": row["date"],
                        "type": disaster_type,
                        "confidence": round(class_confidence, 1),
                        "risk_level": _risk_level(class_confidence),
                        "proba_breakdown": breakdown,
                        "triggered_features": triggered_features,
                    }
                )

    strongest_by_type = {}
    for alert in alerts:
        current = strongest_by_type.get(alert["type"])
        if current is None or alert["confidence"] > current["confidence"]:
            strongest_by_type[alert["type"]] = alert
    ranked_alerts = sorted(strongest_by_type.values(), key=lambda alert: alert["confidence"], reverse=True)
    return {"alerts": ranked_alerts[:3], "confidence": round(confidence, 2)}


def detect_anomaly(historical_df) -> float:
    global _anomaly_bundle
    if _anomaly_bundle is None:
        load_disaster_models()
    features = engineer_anomaly_features(historical_df)
    if features.empty:
        return 0.0
    latest = features[ANOMALY_FEATURE_COLUMNS].iloc[[-1]]
    if _anomaly_bundle:
        scaler = _anomaly_bundle["scaler"]
        model = _anomaly_bundle["model"]
        score = float(model.decision_function(scaler.transform(latest))[0])
        return round(float(np.clip((0 - score) * 50, 0, 100)), 1)
    absolute_peak = float(latest.abs().max(axis=1).iloc[0])
    return round(float(np.clip(absolute_peak * 18, 0, 100)), 1)
