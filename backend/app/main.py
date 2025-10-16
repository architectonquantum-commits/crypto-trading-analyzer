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

# ═══════════════════════════════════════════════
# 🔒 HTTP BASIC AUTH
# ═══════════════════════════════════════════════
security = HTTPBasic()

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """
    Verificar usuario y contraseña.
    Por defecto: admin / crypto2024
    Puedes cambiarlos en Railway → Variables:
      - API_USERNAME
      - API_PASSWORD
    """
    correct_username = secrets.compare_digest(
        credentials.username, 
        os.getenv("API_USERNAME", "admin")
    )
    correct_password = secrets.compare_digest(
        credentials.password, 
        os.getenv("API_PASSWORD", "crypto2024")
    )
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# ═══════════════════════════════════════════════
# 🚀 FASTAPI APP (CON AUTH EN TODA LA APP)
# ═══════════════════════════════════════════════
app = FastAPI(
    title="Crypto Trading Analyzer API",
    version="1.0.0",
    dependencies=[Depends(verify_credentials)]  # ← Protege toda la app
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

# ═══════════════════════════════════════════════
# 📡 ENDPOINTS PÚBLICOS (SIN AUTH)
# ═══════════════════════════════════════════════

@app.get("/health")
def health_check():
    """Health check - sin autenticación para monitoreo"""
    return {"status": "healthy"}

# ═══════════════════════════════════════════════
# 🔐 ROUTERS PROTEGIDOS (CON AUTH)
# ═══════════════════════════════════════════════

# Registrar routers
app.include_router(validator.router, prefix="/api/validator", tags=["validator"])
app.include_router(scanner.router, prefix="/api/scanner", tags=["scanner"])
app.include_router(journal.router, prefix="/api/journal", tags=["journal"])
app.include_router(backtest.router, prefix="/api/backtest", tags=["backtest"])

# Backtesting Avanzado
from app.api.endpoints import backtest_advanced
app.include_router(
    backtest_advanced.router,
    prefix="/api/backtest",
    tags=["Backtesting Avanzado"]
)

@app.get("/")
def read_root():
    return {
        "message": "Crypto Trading Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "🔒 Protected with HTTP Basic Auth"
    }
