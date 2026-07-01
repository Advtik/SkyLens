from functools import cached_property

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    owm_api_key: str = ""
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    allowed_origin_regex: str = ""
    ml_model_path: str = "app/ml/models/rf_temperature.pkl"
    advisory_model_path: str = "app/ml/models/advisory_model.pkl"
    disaster_model_path: str = "app/ml/models/disaster_model.pkl"
    anomaly_model_path: str = "app/ml/models/anomaly_detector.pkl"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_timeout: float = 20.0
    request_timeout: float = 12.0
    cache_ttl_seconds: int = 600
    disaster_cache_ttl_seconds: int = 300

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @cached_property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
