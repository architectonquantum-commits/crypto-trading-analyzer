from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import validator, scanner, journal, backtest
from app.core.config import settings
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Crypto Trading Analyzer API",
    version="1.0.0"
)

# CORS - Configuración para producción
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://*.railway.app",
]

# Si hay una variable de entorno FRONTEND_URL, agregarla
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(validator.router, prefix="/api/validator", tags=["validator"])
app.include_router(scanner.router, prefix="/api/scanner", tags=["scanner"])
app.include_router(journal.router, prefix="/api/journal", tags=["journal"])
app.include_router(backtest.router, prefix="/api/backtest", tags=["backtest"])

@app.get("/")
def read_root():
    return {
        "message": "Crypto Trading Analyzer API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Backtesting Avanzado
from app.api.endpoints import backtest_advanced
app.include_router(
    backtest_advanced.router,
    prefix="/api/backtest",
    tags=["Backtesting Avanzado"]
)
