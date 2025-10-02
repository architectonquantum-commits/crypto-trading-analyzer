from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.routes import router
from app.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("🚀 Backend iniciado en http://0.0.0.0:8000")
    print("📚 Docs en http://0.0.0.0:8000/docs")
    yield

app = FastAPI(
    title="Trading App API",
    description="API para análisis técnico y backtesting",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Trading App API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok"}