from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

from app.ml.disaster_features import ANOMALY_FEATURE_COLUMNS, DISASTER_CLASSES, DISASTER_FEATURE_COLUMNS, engineer_anomaly_features
from app.ml.features import build_synthetic_training_data, engineer_features


def build_training_frame():
    frame = engineer_features(build_synthetic_training_data(1800))
    frame["rolling_precip_7d"] = frame["precipitation"].rolling(7, min_periods=1).sum()
    frame["flag_heavy_rain"] = (frame["precipitation"] > 20).astype(int)
    frame["flag_extreme_wind"] = (frame["wind_speed"] > 50).astype(int)
    frame["flag_extreme_heat"] = (frame["temp_max"] > 40).astype(int)
    frame["flag_high_humidity"] = (frame["humidity"] > 85).astype(int)
    frame["compound_heat_humidity"] = ((frame["temp_max"] > 35) & (frame["humidity"] > 70)).astype(int)
    frame["compound_rain_wind"] = ((frame["precipitation"] > 10) & (frame["wind_speed"] > 30)).astype(int)
    frame["target"] = "none"
    frame.loc[(frame["rolling_precip_7d"] > 80) | (frame["precipitation"] > 25), "target"] = "flood"
    frame.loc[(frame["wind_speed"] > 60) | ((frame["wind_speed"] > 35) & (frame["precipitation"] > 12)), "target"] = "storm"
    frame.loc[(frame["temp_max"] > 40) & (frame["rolling_temp_7d"] > 37), "target"] = "heatwave"
    return frame.fillna(0)


def train_disaster() -> None:
    data = build_training_frame()
    encoder = LabelEncoder()
    encoder.fit(DISASTER_CLASSES)
    y = encoder.transform(data["target"])
    x_train, x_test, y_train, y_test = train_test_split(data[DISASTER_FEATURE_COLUMNS], y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=160, random_state=42, min_samples_leaf=3, class_weight="balanced")
    model.fit(x_train, y_train)
    score = f1_score(y_test, model.predict(x_test), average="macro")
    output = Path("app/ml/models/disaster_model.pkl")
    output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "classes": list(encoder.classes_), "feature_columns": DISASTER_FEATURE_COLUMNS, "confidence": float(score)}, output)

    anomaly = engineer_anomaly_features(build_synthetic_training_data(900))
    scaler = StandardScaler()
    x_anomaly = scaler.fit_transform(anomaly[ANOMALY_FEATURE_COLUMNS])
    iso = IsolationForest(contamination=0.05, n_estimators=120, random_state=42)
    iso.fit(x_anomaly)
    joblib.dump({"model": iso, "scaler": scaler, "feature_columns": ANOMALY_FEATURE_COLUMNS}, "app/ml/models/anomaly_detector.pkl")
    print(f"Disaster macro F1: {score:.3f}")


if __name__ == "__main__":
    train_disaster()
