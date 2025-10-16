from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

# ========================================
# REQUEST MODELS
# ========================================

class BacktestAdvancedRequest(BaseModel):
    """Request para backtesting avanzado."""
    signal_data: dict
    start_date: str = Field(..., description="YYYY-MM-DD")
    end_date: str = Field(..., description="YYYY-MM-DD")
    initial_capital: float = Field(default=10000, ge=1000)
    risk_per_trade: float = Field(default=2.0, ge=0.5, le=10)
    
    # Walk-Forward params
    in_sample_percentage: float = Field(default=70, ge=50, le=90)
    rolling_window_days: int = Field(default=30, ge=7, le=90)
    
    # Monte Carlo params
    num_simulations: int = Field(default=10000, ge=1000, le=50000)
    confidence_level: float = Field(default=95, ge=90, le=99)
    
    # Filtros
    min_score: Optional[int] = Field(None, ge=0, le=100)
    max_score: Optional[int] = Field(None, ge=0, le=100)
    sessions: Optional[List[Literal["Asia", "Londres", "Nueva York"]]] = None
    weekdays: Optional[List[int]] = Field(None, ge=0, le=6)


class WalkForwardRequest(BaseModel):
    """Request específico para walk-forward."""
    signal_data: dict
    start_date: str
    end_date: str
    in_sample_days: int = Field(default=60)
    out_sample_days: int = Field(default=30)
    step_days: int = Field(default=15)


# ========================================
# RESPONSE MODELS
# ========================================

class AdvancedMetrics(BaseModel):
    """Métricas profesionales de backtesting."""
    # Básicas
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    
    # P&L
    total_pnl: float
    average_win: float
    average_loss: float
    largest_win: float
    largest_loss: float
    
    # Ratios
    profit_factor: float
    expectancy: float
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    recovery_factor: float
    
    # Drawdown
    max_drawdown: float
    max_drawdown_duration_days: int
    average_drawdown: float
    
    # Streaks
    max_consecutive_wins: int
    max_consecutive_losses: int
    current_streak: int
    current_streak_type: Literal["win", "loss", "none"]
    
    # MAE/MFE
    average_mae: float
    average_mfe: float
    mae_mfe_ratio: float
    
    # R-Multiples
    average_r_multiple: float
    median_r_multiple: float
    r_multiples: List[float]


class MonteCarloResults(BaseModel):
    """Resultados de simulación Monte Carlo."""
    num_simulations: int
    confidence_level: float
    
    # Percentiles
    percentile_5: float
    percentile_25: float
    percentile_50: float  # Mediana
    percentile_75: float
    percentile_95: float
    
    # Estadísticas
    mean_final_equity: float
    std_final_equity: float
    min_final_equity: float
    max_final_equity: float
    
    # Probabilidades
    probability_of_profit: float
    probability_of_ruin: float  # Equity < 50% inicial
    
    # Equity curves (sample de 100)
    sample_curves: List[List[float]]


class WalkForwardPeriod(BaseModel):
    """Resultados de un período walk-forward."""
    period_number: int
    in_sample_start: str
    in_sample_end: str
    out_sample_start: str
    out_sample_end: str
    
    # Métricas in-sample
    in_sample_trades: int
    in_sample_win_rate: float
    in_sample_pnl: float
    in_sample_sharpe: float
    
    # Métricas out-sample
    out_sample_trades: int
    out_sample_win_rate: float
    out_sample_pnl: float
    out_sample_sharpe: float
    
    # Degradación
    win_rate_degradation: float  # % de degradación
    sharpe_degradation: float


class BacktestAdvancedResponse(BaseModel):
    """Response completo de backtesting avanzado."""
    
    # Métricas generales
    advanced_metrics: AdvancedMetrics
    
    # Walk-Forward
    walk_forward_periods: List[WalkForwardPeriod]
    walk_forward_summary: dict
    
    # Monte Carlo
    monte_carlo: MonteCarloResults
    
    # Análisis adicional
    best_session: str
    worst_session: str
    best_weekday: str
    worst_weekday: str
    
    # Equity curve
    equity_curve: List[dict]
    
    # Trades
    total_trades: int
    trades_sample: List[dict]  # Primeros 50
    reality_check: Optional[dict] = None
