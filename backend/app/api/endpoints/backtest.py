# backend/app/api/endpoints/backtest.py
from fastapi import APIRouter, HTTPException
from app.models.backtest import BacktestRequest, BacktestResponse
from app.services.backtest_service import BacktestService

router = APIRouter()
backtest_service = BacktestService()

@router.post("/run", response_model=BacktestResponse)
async def run_backtest(request: BacktestRequest):
    """
    Ejecuta backtesting de una señal
    
    Simula las últimas N operaciones y calcula métricas de efectividad
    """
    try:
        result = await backtest_service.run_backtest(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_backtest_status():
    """Estado del módulo de backtesting"""
    return {
        "status": "ready",
        "version": "1.0.0-mvp",
        "features": ["win_rate", "profit_factor", "trade_simulation"]
    }
