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
Copy-Item .env.example .env
npm run dev
```

Open the app at `http://localhost:5173`. Backend docs are available at `http://localhost:8000/docs`.

## Environment Variables

Backend `.env`:

```text
OWM_API_KEY=your_openweathermap_api_key
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ALLOWED_ORIGIN_REGEX=
ML_MODEL_PATH=app/ml/models/rf_temperature.pkl
ADVISORY_MODEL_PATH=app/ml/models/advisory_model.pkl
DISASTER_MODEL_PATH=app/ml/models/disaster_model.pkl
ANOMALY_MODEL_PATH=app/ml/models/anomaly_detector.pkl
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TIMEOUT=20
REQUEST_TIMEOUT=12
CACHE_TTL_SECONDS=600
DISASTER_CACHE_TTL_SECONDS=300
```

Frontend `.env`:

```text
VITE_API_URL=http://localhost:8000
VITE_OWM_KEY=your_openweathermap_api_key
```

`OWM_API_KEY` enables OpenWeatherMap current weather, AQI, forecast, and map overlays. The backend includes Open-Meteo fallback data so the project remains demo-friendly without a key, but an OpenWeatherMap key is recommended for the complete intended experience.

## Deployment

The repo is prepared for a split deployment:

- Backend: Render web service from `backend/`
- Frontend: Vercel project from `frontend/`

### Render Backend

Use the included `render.yaml` blueprint from the repository root, or create a Render web service manually with these settings:

```text
Root Directory: backend
Runtime: Python
Build Command: pip install --upgrade pip && pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /api/health
```

Set these Render environment variables:

```text
PYTHON_VERSION=3.11.9
OWM_API_KEY=your_openweathermap_api_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app
REQUEST_TIMEOUT=12
CACHE_TTL_SECONDS=600
DISASTER_CACHE_TTL_SECONDS=300
```

After Render gives you a backend URL, confirm `https://your-render-service.onrender.com/api/health` returns `{"status":"ok"}`.

### Vercel Frontend

Create the Vercel project with `frontend/` as the project root. The included `frontend/vercel.json` sets the Vite framework, `npm ci`, `npm run build`, `dist`, and SPA rewrites.

Set these Vercel environment variables:

```text
VITE_API_URL=https://your-render-service.onrender.com
VITE_OWM_KEY=your_openweathermap_api_key
```

Redeploy the frontend after changing `VITE_API_URL`; Vite injects that value at build time. Then update Render `ALLOWED_ORIGINS` with the final Vercel production URL. The regex is included to support Vercel preview deployments.

## API Routes

- `GET /api/health`
- `GET /api/weather?city=Delhi`
- `GET /api/forecast?city=Delhi&days=7`
- `GET /api/forecast/hourly?city=Delhi`
- `GET /api/advisory?city=Delhi`
- `GET /api/disaster?city=Delhi`
- `POST /api/groq/voice`

## ML Pipeline

The backend loads `app/ml/models/rf_temperature.pkl` on startup when present. To train a real local model:

```powershell
cd "C:\Dev Work\SkyLens\backend"
python app/ml/train.py
```

If no saved model exists, the API starts with a lightweight synthetic fallback model so forecast responses still include `temp_ml_predicted` and `ml_confidence`.

## Features

- Search with Nominatim city suggestions
- Favorite cities stored locally in the browser
- Voice assistant with browser speech recognition and speech synthesis
- Current weather hero with dynamic condition gradients
- Eight responsive glass metric cards
- 24-hour horizontally scrollable forecast strip
- Seven Recharts analytics tabs
- ML predicted temperature overlay
- School/college advisory risk scoring
- Disaster warning assessment with anomaly context
- Lazy-loaded Leaflet map with weather layer controls
- Loading skeletons and dismissible error banner
