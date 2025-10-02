from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router
from .database import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TRADE-ARCHI API",
    description="API de análisis técnico para trading de criptomonedas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["trading"])

@app.on_event("startup")
async def startup_event():
    logger.info("Iniciando aplicación TRADE-ARCHI...")
    init_db()
    logger.info("Base de datos inicializada")

@app.get("/")
async def root():
    return {
        "app": "TRADE-ARCHI",
        "status": "activo",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
