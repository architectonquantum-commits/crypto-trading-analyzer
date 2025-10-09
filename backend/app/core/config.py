from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Crypto Analyzer"

    # Database (Replit DB por ahora)
    DATABASE_URL: Optional[str] = None

    # Trading Settings
    DEFAULT_RISK_PERCENTAGE: float = 2.0  # 2% por trade
    DEFAULT_CAPITAL: float = 1000.0  # Capital default en USD

    # API Keys (se configuran en Replit Secrets)
    KRAKEN_API_KEY: Optional[str] = None
    KRAKEN_API_SECRET: Optional[str] = None

    # Google Vision (para después)
    GOOGLE_VISION_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
