"""
Endpoints de Backtesting Avanzado
"""

from fastapi import APIRouter, HTTPException
from app.models.backtest_advanced import (
    BacktestAdvancedRequest,
    BacktestAdvancedResponse,
    WalkForwardRequest
)
from app.services.backtest_advanced import BacktestAdvancedService

router = APIRouter()

# ========================================
# ENDPOINT 1: Backtesting Avanzado Completo
# ========================================
@router.post("/advanced", response_model=BacktestAdvancedResponse)
async def run_advanced_backtest(request: BacktestAdvancedRequest):
    """
    Ejecuta backtesting avanzado completo con:
    - Walk-Forward Analysis
    - Monte Carlo Simulation (10,000+ simulaciones)
    - Métricas profesionales (Sharpe, Sortino, Calmar, MAE/MFE)
    - Análisis por sesiones y días de la semana
    
    **Tiempo estimado:** 30-60 segundos
    """
    try:
        service = BacktestAdvancedService()
        result = await service.run_advanced_backtest(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en backtesting avanzado: {str(e)}"
        )


# ========================================
# ENDPOINT 2: Solo Walk-Forward (más rápido)
# ========================================
@router.post("/walk-forward")
async def run_walk_forward_only(request: WalkForwardRequest):
    """
    Ejecuta solo Walk-Forward Analysis sin Monte Carlo.
    
    Más rápido para validación rápida de robustez.
    
    **Tiempo estimado:** 10-20 segundos
    """
    try:
        service = BacktestAdvancedService()
        result = await service._run_walk_forward(
            historical_data=None,  # Se obtiene dentro del servicio
            request=BacktestAdvancedRequest(
                signal_data=request.signal_data,
                start_date=request.start_date,
                end_date=request.end_date,
                in_sample_percentage=70,
                rolling_window_days=request.in_sample_days + request.out_sample_days
            )
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en walk-forward: {str(e)}"
        )


# ========================================
# ENDPOINT 3: Health Check
# ========================================
@router.get("/health")
async def health_check():
    """
    Verifica que el servicio de backtesting avanzado está operativo.
    """
    return {
        "status": "operational",
        "service": "Backtesting Avanzado",
        "features": [
            "Walk-Forward Analysis",
            "Monte Carlo Simulation",
            "Advanced Metrics (Sharpe, Sortino, Calmar)",
            "Session Analysis",
            "Weekday Analysis"
        ]
    }

@router.post("/temporal-analysis")
async def analyze_temporal_consistency(data: dict):
    """
    Analiza consistencia temporal de los trades.
    Retorna análisis por hora, día de semana, heatmap y optimizaciones.
    """
    try:
        from app.services.temporal_consistency_analyzer import get_temporal_analyzer
        
        trades = data.get('trades', [])
        
        if not trades:
            return {
                'error': 'No se proporcionaron trades',
                'success': False
            }
        
        analyzer = get_temporal_analyzer()
        result = analyzer.analyze(trades)
        
        # Convertir numpy types a tipos nativos
        import json
        result_json = json.loads(json.dumps(result, default=str))
        
        return {
            'success': True,
            'data': result_json
        }
        
    except Exception as e:
        import traceback
        print(f"❌ Error en temporal-analysis: {e}")
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e)
        }
