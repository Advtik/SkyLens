from datetime import date
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import httpx
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from app.ml.features import FEATURE_COLUMNS, build_synthetic_training_data, engineer_features

CITIES = [
    ("London", 51.5072, -0.1276),
    ("Delhi", 28.6139, 77.2090),
    ("New York", 40.7128, -74.0060),
    ("Tokyo", 35.6762, 139.6503),
    ("Sydney", -33.8688, 151.2093),
]


def fetch_historical(lat: float, lon: float) -> pd.DataFrame:
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": "2019-01-01",
        "end_date": date.today().isoformat(),
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,cloud_cover_mean,uv_index_max,relative_humidity_2m_mean",
        "timezone": "auto",
    }
    response = httpx.get("https://archive-api.open-meteo.com/v1/archive", params=params, timeout=30)
    response.raise_for_status()
    return pd.DataFrame(response.json()["daily"])


def train() -> None:
    frames = []
    for _, lat, lon in CITIES:
        try:
            frames.append(fetch_historical(lat, lon))
        except Exception:
            continue
    raw = pd.concat(frames, ignore_index=True) if frames else build_synthetic_training_data()
    data = engineer_features(raw)
    x_train, x_test, y_train, y_test = train_test_split(data[FEATURE_COLUMNS], data["temp_max"], test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42, min_samples_leaf=2)
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    print(f"MAE: {mean_absolute_error(y_test, predictions):.2f}C")
    print(f"R2: {r2_score(y_test, predictions):.2f}")
    output = Path("app/ml/models/rf_temperature.pkl")
    output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output)


if __name__ == "__main__":
    train()
