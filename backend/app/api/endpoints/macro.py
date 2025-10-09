from fastapi import APIRouter, HTTPException
from app.models.macro_analysis import MacroAnalysisRequest, MacroAnalysisResponse
from app.services.modules.macro_analysis import MacroAnalysisModule
from app.utils.market_data import MarketDataFetcher

router = APIRouter()

@router.post("/macro-analysis", response_model=MacroAnalysisResponse)
async def analyze_macro(request: MacroAnalysisRequest):
    try:
        fetcher = MarketDataFetcher()
        df_asset = await fetcher.get_ohlcv(request.symbol, request.timeframe, limit=50)
        current_price = await fetcher.get_current_price(request.symbol)
        df_btc = await fetcher.get_ohlcv("BTC/USDT", request.timeframe, limit=50)
        df_eth = await fetcher.get_ohlcv("ETH/USDT", request.timeframe, limit=50)

        analyzer = MacroAnalysisModule()
        result = analyzer.analyze(
            request.symbol,
            df_asset,
            df_btc,
            df_eth,
            request.timeframe,
            current_price
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/macro-analysis/test")
async def test_macro():
    try:
        request = MacroAnalysisRequest(symbol="BTC/USDT", timeframe="1d")
        return await analyze_macro(request)
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print("ERROR COMPLETO:")
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))