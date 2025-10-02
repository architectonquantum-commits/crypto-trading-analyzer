import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    BINANCE_API_KEY = os.getenv("BINANCE_API_KEY", "")
    BINANCE_API_SECRET = os.getenv("BINANCE_API_SECRET", "")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trading.db")
    CACHE_EXPIRATION = int(os.getenv("CACHE_EXPIRATION", "300"))
    
    TRADING_PAIRS = [
        "BTCUSDT", "ETHUSDT", "SOLUSDT", "ADAUSDT", "BNBUSDT",
        "MATICUSDT", "AVAXUSDT", "DOTUSDT", "LINKUSDT", "UNIUSDT",
        "ATOMUSDT", "XRPUSDT", "DOGEUSDT", "LTCUSDT", "BCHUSDT",
        "ALGOUSDT", "VETUSDT", "FILUSDT", "AAVEUSDT", "SANDUSDT"
    ]
    
    TIMEFRAME = "1h"
    LIMIT = 500

config = Config()
