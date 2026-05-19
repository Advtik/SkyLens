from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputClassifier

from app.ml.advisory_features import ADVISORY_FEATURE_COLUMNS
from app.ml.features import build_synthetic_training_data, engineer_features

TARGET_COLUMNS = [
    "y_attendance_disrupted",
    "y_commute_difficult",
    "y_outdoor_unsafe",
    "y_heat_stress",
    "y_rain_disruption",
    "y_weather_severe",
]


def generate_targets(df: pd.DataFrame) -> pd.DataFrame:
    frame = df.copy()
    frame["y_attendance_disrupted"] = ((frame["precipitation"] > 10) | (frame["wind_speed"] > 40) | (frame["temp_max"] > 42)).astype(int)
    frame["y_commute_difficult"] = ((frame["precipitation"] > 5) | (frame["wind_speed"] > 30) | (frame["cloud_cover"] > 85) | (frame["temp_max"] > 40)).astype(int)
    frame["y_outdoor_unsafe"] = ((frame["uv_index"] > 8) | (frame["temp_max"] > 38) | (frame["wind_speed"] > 50) | (frame["precipitation"] > 15)).astype(int)
    frame["y_heat_stress"] = ((frame["temp_max"] > 36) & (frame["humidity"] > 60)).astype(int)
    frame["y_rain_disruption"] = ((frame["precipitation"] > 8) | ((frame["precipitation"] > 3) & (frame["cloud_cover"] > 80))).astype(int)
    frame["y_weather_severe"] = ((frame["y_attendance_disrupted"] + frame["y_commute_difficult"] + frame["y_outdoor_unsafe"]) >= 2).astype(int)
    return frame


def build_training_frame() -> pd.DataFrame:
    frame = engineer_features(build_synthetic_training_data(1800))
    frame["is_weekend"] = (frame["day_of_week"] >= 5).astype(int)
    frame["heat_index"] = frame["temp_max"] + (frame["humidity"] - 50) * 0.08
    frame["apparent_temp_max"] = frame["temp_max"] - 0.4 * (frame["temp_max"] - 10) * (1 - frame["humidity"] / 100)
    frame["rolling_precip_3d"] = frame["precipitation"].rolling(3, min_periods=1).sum()
    frame["temp_delta"] = frame["temp_max"] - frame["temp_max_lag1"]
    for column in ADVISORY_FEATURE_COLUMNS:
        if column not in frame:
            frame[column] = 0
    return generate_targets(frame).fillna(0)


def train_advisory() -> None:
    data = build_training_frame()
    x_train, x_test, y_train, y_test = train_test_split(data[ADVISORY_FEATURE_COLUMNS], data[TARGET_COLUMNS], test_size=0.2, random_state=42)
    model = MultiOutputClassifier(RandomForestClassifier(n_estimators=120, random_state=42, min_samples_leaf=3, class_weight="balanced"))
    model.fit(x_train, y_train)
    probas = np.column_stack([est.predict_proba(x_test)[:, 1] for est in model.estimators_])
    aucs = []
    for index, target in enumerate(TARGET_COLUMNS):
        try:
            aucs.append(roc_auc_score(y_test[target], probas[:, index]))
        except ValueError:
            pass
    confidence = float(np.mean(aucs)) if aucs else 0.65
    output = Path("app/ml/models/advisory_model.pkl")
    output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "feature_columns": ADVISORY_FEATURE_COLUMNS, "confidence": confidence}, output)
    print(f"Advisory ROC-AUC: {confidence:.3f}")


if __name__ == "__main__":
    train_advisory()

