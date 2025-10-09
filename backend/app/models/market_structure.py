from pydantic import BaseModel
from typing import List, Optional

class MarketStructureRequest(BaseModel):
    symbol: str
    timeframe: str = "1h"

class OrderBlock(BaseModel):
    type: str  # "demand" o "supply"
    price_high: float
    price_low: float
    strength: int  # 1-5
    distance_from_current: float  # % de distancia del precio actual

class OrderBlocksAnalysis(BaseModel):
    demand_zones: List[OrderBlock]
    supply_zones: List[OrderBlock]
    nearest_demand: Optional[OrderBlock]
    nearest_supply: Optional[OrderBlock]
    score: int  # 0-2 puntos

class WyckoffPhase(BaseModel):
    phase: str  # "accumulation", "markup", "distribution", "markdown", "neutral"
    confidence: float  # 0-100%
    description: str

class WyckoffAnalysis(BaseModel):
    current_phase: WyckoffPhase
    volume_trend: str  # "increasing", "decreasing", "stable"
    price_action: str  # "bullish", "bearish", "ranging"
    score: int  # 0-2 puntos

class Divergence(BaseModel):
    type: str  # "bullish", "bearish", "hidden_bullish", "hidden_bearish"
    indicator: str  # "RSI" o "MACD"
    strength: str  # "strong", "moderate", "weak"
    timeframe: str

class DivergenceAnalysis(BaseModel):
    rsi_divergence: Optional[Divergence]
    macd_divergence: Optional[Divergence]
    has_divergence: bool
    score: int  # 0-1 punto

class MarketStructureResponse(BaseModel):
    symbol: str
    timeframe: str
    current_price: float
    
    order_blocks: OrderBlocksAnalysis
    wyckoff: WyckoffAnalysis
    divergences: DivergenceAnalysis
    
    total_score: int
    max_score: int = 5
    confidence_percentage: float
    recommendation: str
    summary: str
