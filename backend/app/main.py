from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from app.api.endpoints import validator, scanner, journal, backtest
from app.core.config import settings
import logging
import os
import secrets

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

security = HTTPBasic()

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    # 🐛 DEBUG LOGGING
    env_username = os.getenv("API_USERNAME", "admin")
    env_password = os.getenv("API_PASSWORD", "crypto2024")
    
    logger.info(f"🔐 AUTH ATTEMPT:")
    logger.info(f"   ENV API_USERNAME: {env_username}")
    logger.info(f"   ENV API_PASSWORD: {env_password}")
    logger.info(f"   Received username: {credentials.username}")
    logger.info(f"   Received password: {credentials.password}")
    
    correct_username = secrets.compare_digest(credentials.username, env_username)
    correct_password = secrets.compare_digest(credentials.password, env_password)
    
    logger.info(f"   Username match: {correct_username}")
    logger.info(f"   Password match: {correct_password}")
    
    if not (correct_username and correct_password):
        logger.error(f"❌ AUTH FAILED")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    logger.info(f"✅ AUTH SUCCESS")
    return credentials.username

app = FastAPI(
    title="Crypto Trading Analyzer API",
    version="1.0.0",
    dependencies=[Depends(verify_credentials)]
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://*.railway.app",
]

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

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(validator.router, prefix="/api/validator", tags=["validator"])
app.include_router(scanner.router, prefix="/api/scanner", tags=["scanner"])
app.include_router(journal.router, prefix="/api/journal", tags=["journal"])
app.include_router(backtest.router, prefix="/api/backtest", tags=["backtest"])

from app.api.endpoints import backtest_advanced
app.include_router(backtest_advanced.router, prefix="/api/backtest", tags=["Backtesting Avanzado"])

@app.get("/")
def read_root():
    return {
        "message": "Crypto Trading Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "🔒 Protected"
    }
