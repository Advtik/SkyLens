from functools import cached_property

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    owm_api_key: str = ""
    allowed_origins: str = "http://localhost:5173"
    ml_model_path: str = "app/ml/models/rf_temperature.pkl"
    request_timeout: float = 12.0
    cache_ttl_seconds: int = 600

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @cached_property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()

