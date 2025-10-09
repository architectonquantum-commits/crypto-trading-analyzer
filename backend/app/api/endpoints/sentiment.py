from fastapi import APIRouter, HTTPException
from app.models.sentiment_analysis import SentimentAnalysisRequest, SentimentAnalysisResponse
from app.services.modules.sentiment_analysis import SentimentAnalysisModule
from app.utils.market_data import MarketDataFetcher

router = APIRouter()

@router.post("/sentiment-analysis", response_model=SentimentAnalysisResponse)
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """
    Análisis de sentimiento del mercado

    Incluye:
    - Social media sentiment (Twitter, Reddit, Telegram)
    - Funding rates de futuros perpetuos
    - Volumen y Open Interest

    Score total: 0-4 puntos
    """
    try:
        fetcher = MarketDataFetcher()
        df = await fetcher.get_ohlcv(request.symbol, request.timeframe, limit=50)
        current_price = await fetcher.get_current_price(request.symbol)

        analyzer = SentimentAnalysisModule()
        result = analyzer.analyze(request.symbol, df, request.timeframe, current_price)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/sentiment-analysis/test")
async def test_sentiment():
    """Test rápido con BTC/USDT"""
    try:
        request = SentimentAnalysisRequest(symbol="BTC/USDT", timeframe="1h")
        return await analyze_sentiment(request)
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print("ERROR COMPLETO:")
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))