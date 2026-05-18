from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import forecast, weather
from app.services.ml_service import load_models

app = FastAPI(title="Weather Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1024)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail, "status_code": exc.status_code})


@app.on_event("startup")
async def startup_event() -> None:
    load_models()


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(weather.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
