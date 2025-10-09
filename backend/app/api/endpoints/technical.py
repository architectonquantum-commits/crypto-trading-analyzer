from fastapi import APIRouter, HTTPException
from app.models.technical_analysis import TechnicalAnalysisRequest, TechnicalAnalysisResponse
from app.services.modules.technical_analysis import TechnicalAnalysisModule
from app.utils.market_data import MarketDataFetcher

router = APIRouter()

@router.post("/technical-analysis", response_model=TechnicalAnalysisResponse)
async def analyze_technical(request: TechnicalAnalysisRequest):
    try:
        fetcher = MarketDataFetcher()
        df = await fetcher.get_ohlcv(request.symbol, request.timeframe)
        current_price = await fetcher.get_current_price(request.symbol)
        
        analyzer = TechnicalAnalysisModule()
        result = analyzer.analyze(df, request.symbol, request.timeframe, current_price)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/technical-analysis/test")
async def test_technical():
    try:
        request = TechnicalAnalysisRequest(symbol="BTC/USDT", timeframe="1h")
        return await analyze_technical(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
