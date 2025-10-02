from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: str = "sqlite:///./trading_app.db"
    CORS_ORIGINS: str = "http://localhost:3000"

    # Kraken API (no necesitas keys para datos públicos)
    KRAKEN_API_KEY: str = ""
    KRAKEN_API_SECRET: str = ""

    # Cache settings
    CACHE_TTL: int = 300  # 5 minutos

settings = Settings()