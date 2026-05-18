# SkyLens - Weather Forecasting & Analytics Dashboard

SkyLens is a full-stack weather dashboard inspired by MSN Weather. It combines live weather data, forecast analytics, interactive weather maps, and a lightweight RandomForestRegressor trend overlay.

## Tech Stack

- Frontend: React, Vite, TailwindCSS, Zustand, Framer Motion, Recharts, Leaflet.js
- Backend: FastAPI, Python, httpx, Pydantic, scikit-learn
- ML: RandomForestRegressor with Open-Meteo historical data

## Project Structure

```text
SkyLens/
  frontend/
    src/api/
    src/components/common/
    src/components/weather/
    src/components/forecast/charts/
    src/components/map/
    src/hooks/
    src/store/
    src/utils/
  backend/
    app/routers/
    app/services/
    app/schemas/
    app/ml/
```

## Environment Setup

Backend:

```powershell
cd "C:\Dev Work\SkyLens\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd "C:\Dev Work\SkyLens\frontend"
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open the app at `http://localhost:5173`. Backend docs are available at `http://localhost:8000/docs`.

## Environment Variables

Backend `.env`:

```text
OWM_API_KEY=your_openweathermap_api_key
ALLOWED_ORIGINS=http://localhost:5173
ML_MODEL_PATH=app/ml/models/rf_temperature.pkl
```

Frontend `.env.local`:

```text
VITE_API_URL=http://localhost:8000
VITE_OWM_KEY=your_openweathermap_api_key
```

`OWM_API_KEY` enables OpenWeatherMap current weather, AQI, forecast, and map overlays. The backend includes Open-Meteo fallback data so the project remains demo-friendly without a key, but an OpenWeatherMap key is recommended for the complete intended experience.

## API Routes

- `GET /api/health`
- `GET /api/weather?city=Delhi`
- `GET /api/forecast?city=Delhi&days=7`
- `GET /api/forecast/hourly?city=Delhi`

## ML Pipeline

The backend loads `app/ml/models/rf_temperature.pkl` on startup when present. To train a real local model:

```powershell
cd "C:\Dev Work\SkyLens\backend"
python app/ml/train.py
```

If no saved model exists, the API starts with a lightweight synthetic fallback model so forecast responses still include `temp_ml_predicted` and `ml_confidence`.

## Features

- Search with Nominatim city suggestions
- Current weather hero with dynamic condition gradients
- Eight responsive glass metric cards
- 24-hour horizontally scrollable forecast strip
- Seven Recharts analytics tabs
- ML predicted temperature overlay
- Lazy-loaded Leaflet map with weather layer controls
- Loading skeletons and dismissible error banner

