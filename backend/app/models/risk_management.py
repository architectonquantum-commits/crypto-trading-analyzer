from pydantic import BaseModel
from typing import List, Optional

class RiskManagementRequest(BaseModel):
    symbol: str
    entry_price: float
    stop_loss: Optional[float] = None  # Si no se provee, se calcula automático
    capital: float = 1000.0  # Capital disponible en USD
    risk_percentage: float = 2.0  # % de capital a arriesgar por trade
    timeframe: str = "1h"

class TakeProfitLevel(BaseModel):
    level: int  # 1, 2, 3
    price: float
    ratio: str  # "1:1", "1:2", "1:3"
    distance_percent: float
    profit_usd: float

class PositionSize(BaseModel):
    units: float  # Cantidad de criptomonedas a comprar
    position_value_usd: float  # Valor total de la posición
    risk_amount_usd: float  # Dinero en riesgo
    percentage_of_capital: float  # % del capital usado

class RiskRewardAnalysis(BaseModel):
    stop_loss_price: float
    stop_loss_distance_percent: float
    stop_loss_based_on: str  # "user_provided", "atr", "support_level"
    atr_value: Optional[float]
    take_profits: List[TakeProfitLevel]
    best_rr_ratio: float
    score: int  # 0-4 puntos

class RiskManagementResponse(BaseModel):
    symbol: str
    timeframe: str
    entry_price: float
    current_price: float
    
    # Análisis de posición
    position_size: PositionSize
    risk_reward: RiskRewardAnalysis
    
    # Score y recomendación
    total_score: int
    max_score: int = 4
    confidence_percentage: float
    recommendation: str
    summary: str
    
    # Warnings
    warnings: List[str] = []
