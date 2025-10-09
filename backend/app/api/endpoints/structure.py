from fastapi import APIRouter, HTTPException
from app.models.market_structure import MarketStructureRequest, MarketStructureResponse
from app.services.modules.market_structure import MarketStructureModule
from app.utils.market_data import MarketDataFetcher

router = APIRouter()

@router.post("/market-structure", response_model=MarketStructureResponse)
async def analyze_structure(request: MarketStructureRequest):
    """
    Análisis de estructura de mercado

    Incluye:
    - Order Blocks (zonas institucionales)
    - Análisis Wyckoff (acumulación/distribución)
    - Divergencias (RSI/MACD)

    Score total: 0-5 puntos
    """
    try:
        fetcher = MarketDataFetcher()
        df = await fetcher.get_ohlcv(request.symbol, request.timeframe, limit=200)
        current_price = await fetcher.get_current_price(request.symbol)

        analyzer = MarketStructureModule()
        result = analyzer.analyze(df, request.symbol, request.timeframe, current_price)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/market-structure/test")
async def test_structure():
    """Test rápido con BTC/USDT"""
    try:
        request = MarketStructureRequest(
            symbol="BTC/USDT",
            timeframe="1h"
        )
        return await analyze_structure(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))