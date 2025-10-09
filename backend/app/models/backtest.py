# backend/app/models/backtest.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BacktestRequest(BaseModel):
    """Request para ejecutar backtesting"""
    symbol: str
    timeframe: str = "1h"
    num_trades: int = 100  # Número de operaciones a simular
    
class TradeResult(BaseModel):
    """Resultado de una operación individual"""
    timestamp: str
    entry_price: float
    exit_price: float
    direction: str  # "LONG" o "SHORT"
    result: str  # "WIN" o "LOSS"
    profit_loss_percent: float
    risk_reward_ratio: float

class BacktestMetrics(BaseModel):
    """Métricas del backtesting"""
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float  # Porcentaje
    profit_factor: float
    average_win: float
    average_loss: float
    avg_risk_reward: float
    max_consecutive_wins: int
    max_consecutive_losses: int
    
class BacktestResponse(BaseModel):
    """Respuesta del backtesting"""
    symbol: str
    timeframe: str
    period_start: str
    period_end: str
    metrics: BacktestMetrics
    recent_trades: List[TradeResult]  # Últimas 10 operaciones
