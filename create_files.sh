#!/bin/bash

echo "📝 Creando archivos del proyecto..."
echo ""

# ============================================
# 1. requirements.txt
# ============================================
echo "📦 Creando requirements.txt..."
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
ccxt==4.1.0
pandas==2.1.3
numpy==1.26.2
python-multipart==0.0.6
aiohttp==3.9.1
requests==2.31.0

# OCR (empezamos con Tesseract - gratis)
pytesseract==0.3.10
Pillow==10.1.0

# Para análisis técnico
ta==0.11.0

# Base de datos
databases==0.8.0
asyncpg==0.29.0
EOF

# ============================================
# 2. backend/app/main.py
# ============================================
echo "🏗️  Creando backend/app/main.py..."
cat > backend/app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import health, validator, scanner

app = FastAPI(
    title="Crypto Analyzer API",
    description="Sistema de validación de señales de trading con IA",
    version="1.0.0"
)

# CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiar a dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(validator.router, prefix="/api", tags=["validator"])
app.include_router(scanner.router, prefix="/api", tags=["scanner"])

@app.get("/")
async def root():
    return {
        "message": "Crypto Analyzer API",
        "version": "1.0.0",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# ============================================
# 3. backend/app/core/config.py
# ============================================
echo "⚙️  Creando backend/app/core/config.py..."
cat > backend/app/core/config.py << 'EOF'
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
EOF

# ============================================
# 4. backend/app/api/endpoints/health.py
# ============================================
echo "🏥 Creando backend/app/api/endpoints/health.py..."
cat > backend/app/api/endpoints/health.py << 'EOF'
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "crypto-analyzer",
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health():
    # Aquí después agregamos checks de APIs, DB, etc.
    return {
        "status": "healthy",
        "checks": {
            "api": "ok",
            "database": "pending",
            "kraken_api": "pending",
            "ocr": "pending"
        }
    }
EOF

# ============================================
# 5. backend/app/api/endpoints/validator.py
# ============================================
echo "🎯 Creando backend/app/api/endpoints/validator.py..."
cat > backend/app/api/endpoints/validator.py << 'EOF'
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any

router = APIRouter()

@router.post("/validate-signal")
async def validate_signal(image: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Valida una señal de trading desde una imagen

    Flow:
    1. Recibe imagen
    2. OCR extrae: activo, entrada, SL, TPs
    3. Análisis con 5 módulos
    4. Calcula confluencias
    5. Retorna recomendación
    """

    # TODO: Implementar OCR
    # TODO: Implementar módulos de análisis

    return {
        "status": "pending_implementation",
        "message": "Endpoint en desarrollo",
        "filename": image.filename
    }
EOF

# ============================================
# 6. backend/app/api/endpoints/scanner.py
# ============================================
echo "📊 Creando backend/app/api/endpoints/scanner.py..."
cat > backend/app/api/endpoints/scanner.py << 'EOF'
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

CRYPTO_LIST = [
    "BTC", "ETH", "BNB", "XRP", "ADA", "SOL", "DOT", "DOGE",
    "AVAX", "MATIC", "LINK", "UNI", "LTC", "ATOM", "XLM",
    "ALGO", "VET", "FIL", "TRX", "ETC", "AAVE", "SNX", "SUSHI"
]

@router.get("/scanner/run")
async def run_scanner() -> Dict[str, Any]:
    """
    Escanea las 23 criptomonedas principales

    Retorna oportunidades ordenadas por % de confluencias
    """

    # TODO: Implementar scanner

    return {
        "status": "pending_implementation",
        "total_cryptos": len(CRYPTO_LIST),
        "cryptos_scanned": CRYPTO_LIST
    }

@router.get("/scanner/status")
async def scanner_status():
    return {
        "status": "ready",
        "cryptos_monitored": len(CRYPTO_LIST),
        "update_frequency": "5 minutes"
    }
EOF

# ============================================
# 7. .replit
# ============================================
echo "🚀 Creando .replit..."
cat > .replit << 'EOF'
run = "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
language = "python3"

[nix]
channel = "stable-23_11"

[deployment]
run = ["sh", "-c", "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"]
EOF

# ============================================
# 8. .env.example
# ============================================
echo "📝 Creando .env.example..."
cat > .env.example << 'EOF'
# Trading Settings
DEFAULT_RISK_PERCENTAGE=2.0
DEFAULT_CAPITAL=1000.0

# API Keys (configurar en Replit Secrets)
KRAKEN_API_KEY=your_kraken_key_here
KRAKEN_API_SECRET=your_kraken_secret_here

# Database
DATABASE_URL=postgresql://user:pass@localhost/cryptoanalyzer
EOF

echo ""
echo "✅ ¡Todos los archivos creados exitosamente!"
echo ""
echo "📁 Archivos creados:"
echo "  ✓ requirements.txt"
echo "  ✓ backend/app/main.py"
echo "  ✓ backend/app/core/config.py"
echo "  ✓ backend/app/api/endpoints/health.py"
echo "  ✓ backend/app/api/endpoints/validator.py"
echo "  ✓ backend/app/api/endpoints/scanner.py"
echo "  ✓ .replit"
echo "  ✓ .env.example"
echo ""
echo "🎯 Próximos pasos:"
echo "1. Click en el botón 'Run' en Replit"
echo "2. Espera a que se instalen las dependencias"
echo "3. La API estará lista en https://tu-repl.replit.app"
echo "4. Prueba los endpoints en https://tu-repl.replit.app/docs"
echo ""