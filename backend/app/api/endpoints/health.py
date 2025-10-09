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
