from fastapi import APIRouter, HTTPException
from app.models.risk_management import RiskManagementRequest, RiskManagementResponse
from app.services.modules.risk_management import RiskManagementModule
from app.utils.market_data import MarketDataFetcher

router = APIRouter()

@router.post("/risk-management", response_model=RiskManagementResponse)
async def analyze_risk(request: RiskManagementRequest):
    """
    Análisis completo de gestión de riesgo
    
    Calcula:
    - Tamaño de posición óptimo
    - Stop Loss (automático si no se provee)
    - Take Profits con ratios R:R
    - Score de calidad del setup (0-4 puntos)
    """
    try:
        fetcher = MarketDataFetcher()
        df = await fetcher.get_ohlcv(request.symbol, request.timeframe)
        current_price = await fetcher.get_current_price(request.symbol)
        
        analyzer = RiskManagementModule()
        result = analyzer.analyze(
            df=df,
            symbol=request.symbol,
            timeframe=request.timeframe,
            entry_price=request.entry_price,
            current_price=current_price,
            user_stop_loss=request.stop_loss,
            capital=request.capital,
            risk_percentage=request.risk_percentage
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/risk-management/test")
async def test_risk():
    """Test rápido con BTC/USDT"""
    try:
        fetcher = MarketDataFetcher()
        current_price = await fetcher.get_current_price("BTC/USDT")
        
        request = RiskManagementRequest(
            symbol="BTC/USDT",
            entry_price=current_price,
            capital=10000.0,
            risk_percentage=2.0,
            timeframe="1h"
        )
        return await analyze_risk(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
