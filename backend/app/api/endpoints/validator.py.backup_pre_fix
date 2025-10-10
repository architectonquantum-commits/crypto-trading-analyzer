from fastapi import APIRouter, HTTPException, Query
from app.models.signal_validator import ManualSignalRequest, SignalValidationResponse
from app.models.technical_analysis import TechnicalAnalysisRequest
from app.models.market_structure import MarketStructureRequest
from app.models.risk_management import RiskManagementRequest
from app.models.macro_analysis import MacroAnalysisRequest
from app.models.sentiment_analysis import SentimentAnalysisRequest

from app.services.modules.technical_analysis import TechnicalAnalysisModule
from app.services.modules.market_structure import MarketStructureModule
from app.services.modules.risk_management import RiskManagementModule
from app.services.modules.macro_analysis import MacroAnalysisModule
from app.services.modules.sentiment_analysis import SentimentAnalysisModule
from app.services.signal_validator_service import SignalValidatorService
from app.utils.market_data import MarketDataFetcher

router = APIRouter()

@router.post("/validate-signal")
async def validate_signal_manual(request: ManualSignalRequest):
    """
    Valida una señal de trading con entrada manual de datos

    Analiza con los 5 módulos:
    - Técnico (7 puntos)
    - Estructura (5 puntos)
    - Riesgo (4 puntos)
    - Macro (5 puntos)
    - Sentimiento (4 puntos)

    Total: 25 puntos
    Recomendación según confluencias:
    - 85-100%: OPERAR (confianza muy alta)
    - 70-84%: OPERAR CON CAUTELA (confianza alta)
    - 55-69%: CONSIDERAR (confianza media)
    - <55%: EVITAR (confianza baja)
    """
    try:
        fetcher = MarketDataFetcher()

        # Obtener datos de mercado
        df = await fetcher.get_ohlcv(request.symbol, request.timeframe, limit=200)
        current_price = await fetcher.get_current_price(request.symbol)

        # Módulo 1: Técnico
        tech_module = TechnicalAnalysisModule()
        tech_result = tech_module.analyze(df, request.symbol, request.timeframe, current_price)

        # Módulo 2: Estructura
        struct_module = MarketStructureModule()
        struct_result = struct_module.analyze(df, request.symbol, request.timeframe, current_price)

        # Módulo 3: Riesgo
        risk_module = RiskManagementModule()
        # DESPUÉS (correcto):
        risk_result = risk_module.analyze(
            df,
            request.symbol,
            request.timeframe,
            request.entry_price,
            current_price,
            request.stop_loss,
            request.capital,
            request.risk_percentage,
            None  # support_level
        )

        # Módulo 4: Macro
        df_btc = await fetcher.get_ohlcv("BTC/USDT", "1d", limit=50)
        df_eth = await fetcher.get_ohlcv("ETH/USDT", "1d", limit=50)

        macro_module = MacroAnalysisModule()
        macro_result = macro_module.analyze(
            request.symbol,
            df,
            df_btc,
            df_eth,
            "1d",
            current_price
        )

        # Módulo 5: Sentimiento
        sent_module = SentimentAnalysisModule()
        sent_result = sent_module.analyze(request.symbol, df, request.timeframe, current_price)

        # Validación final
        validator = SignalValidatorService()
        validation = validator.validate_signal(
            signal=request,
            current_price=current_price,
            tech_score=tech_result.total_score,
            struct_score=struct_result.total_score,
            risk_score=risk_result.total_score,
            macro_score=macro_result.total_score,
            sent_score=sent_result.total_score,
            detailed_analysis={
                "technical": {
                    "score": tech_result.total_score,
                    "recommendation": tech_result.recommendation,
                    "summary": tech_result.summary
                },
                "structure": {
                    "score": struct_result.total_score,
                    "recommendation": struct_result.recommendation,
                    "summary": struct_result.summary
                },
                "risk": {
                    "score": risk_result.total_score,
                    "recommendation": risk_result.recommendation,
                    "summary": risk_result.summary
                },
                "macro": {
                    "score": macro_result.total_score,
                    "recommendation": macro_result.recommendation,
                    "summary": macro_result.summary
                },
                "sentiment": {
                    "score": sent_result.total_score,
                    "recommendation": sent_result.recommendation,
                    "summary": sent_result.summary
                }
            }
        )

        # ✨ NUEVO: Datos listos para bitácora
        journal_entry_data = {
            # Datos de la señal
            "activo": f"{request.symbol} {request.direction}",
            "tipo_activo": "crypto",
            "operacion": request.direction,

            # Precios
            "precio_entrada": request.entry_price,
            "stop_loss": request.stop_loss,
            "take_profit_1": request.take_profit_1,
            "take_profit_2": request.take_profit_2,
            "take_profit_3": request.take_profit_3,
            "beneficio_esperado_porcentaje": ((request.take_profit_1 - request.entry_price) / request.entry_price * 100) if request.take_profit_1 else None,

            # Gestión de riesgo
            "capital_usado": request.capital,
            "riesgo_porcentaje": request.risk_percentage,
            "tamano_posicion": getattr(risk_result, 'position_size', None),
            "apalancamiento_usado": getattr(risk_result, 'leverage_needed', None),
            "margen_bloqueado": getattr(risk_result, 'margin_required', None),
            "rr_ratio": getattr(risk_result, 'rr_ratio', None),

            # Scores
            "score_tecnico": tech_result.total_score,
            "score_estructura": struct_result.total_score,
            "score_riesgo": risk_result.total_score,
            "score_macro": macro_result.total_score,
            "score_sentimiento": sent_result.total_score,
            "score_total": validation.scores.total,
            "confluencia_porcentaje": validation.scores.percentage,
            "recomendacion": validation.validation.recommendation,

            # Análisis completo de los 5 módulos
            "analisis_completo": {
                "tecnico": tech_result.dict() if hasattr(tech_result, 'dict') else {},
                "estructura": struct_result.dict() if hasattr(struct_result, 'dict') else {},
                "macro": macro_result.dict() if hasattr(macro_result, 'dict') else {},
                "sentimiento": sent_result.dict() if hasattr(sent_result, 'dict') else {},
                "riesgo": risk_result.dict() if hasattr(risk_result, 'dict') else {}
            }
        }

        # Convertir validation a dict y agregar journal_entry_data
        response_dict = validation.dict()
        response_dict["journal_entry_data"] = journal_entry_data

        return response_dict

    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print("ERROR COMPLETO:")
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/validate-signal/test")
async def test_validator():
    """Test con señal de ejemplo en BTC/USDT"""
    try:
        request = ManualSignalRequest(
            symbol="BTC/USDT",
            entry_price=122000,
            stop_loss=121000,
            take_profit_1=123000,
            take_profit_2=124000,
            take_profit_3=125000,
            direction="LONG",
            capital=10000,
            risk_percentage=2,
            timeframe="1h"
        )
        return await validate_signal_manual(request)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/backtest/equity-curve")
async def get_equity_curve(
    num_trades: int = Query(default=1000, ge=100, le=2000)
):
    """
    Obtener equity curve extendida
    """
    try:
        from app.services.backtesting_service import BacktestingService
        
        backtest_service = BacktestingService()
        result = backtest_service.generate_extended_backtest(num_trades=num_trades)
        
        return {
            "success": True,
            "data": result,
            "message": f"Equity curve generada con {num_trades} operaciones"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generando equity curve: {str(e)}"
        )

@router.post("/entry-context")
async def analyze_entry_context(data: dict):
    """
    Analiza el contexto técnico del punto de entrada.
    
    Determina si la entrada es:
    - Rebote en soporte/resistencia
    - Ruptura alcista/bajista
    - Continuación de tendencia
    - Reversión en zona clave
    """
    try:
        from app.services.entry_context_analyzer import get_entry_context_analyzer
        from app.services.historical_data_loader import get_historical_loader
        from datetime import datetime, timedelta
        
        analyzer = get_entry_context_analyzer()
        loader = get_historical_loader()
        
        # Extraer datos
        symbol = data.get('symbol', 'BTC/USDT')
        timeframe = data.get('timeframe', '1h')
        entry_price = float(data.get('entry_price'))
        direction = data.get('direction', 'long')
        
        # Obtener datos históricos (última semana)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        historical_data = loader.load_data(
            symbol=symbol,
            timeframe=timeframe,
            start_date=start_date,
            end_date=end_date
        )
        
        # Analizar contexto
        context = analyzer.analyze_entry_context(
            entry_price=entry_price,
            direction=direction,
            historical_data=historical_data
        )
        
        return context
        
    except Exception as e:
        import traceback
        print(f"❌ Error en entry-context: {e}")
        traceback.print_exc()
        return {
            'type': 'error',
            'confidence': 0,
            'description': f'Error al analizar contexto: {str(e)}',
            'icon': '❌',
            'details': 'Revisa los logs del backend'
        }
