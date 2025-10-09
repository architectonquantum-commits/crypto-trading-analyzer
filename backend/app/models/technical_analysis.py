from pydantic import BaseModel
from typing import Optional, List

class TechnicalAnalysisRequest(BaseModel):
    symbol: str
    timeframe: str = "1h"

class EMAData(BaseModel):
    ema_9: float
    ema_21: float
    ema_50: float
    ema_200: float
    current_price: float
    trend: str
    score: int

class FibonacciLevel(BaseModel):
    level: str
    price: float
    distance_percent: float

class FibonacciData(BaseModel):
    swing_high: float
    swing_low: float
    current_price: float
    levels: List[FibonacciLevel]
    nearest_level: FibonacciLevel
    score: int

class SupportResistanceLevel(BaseModel):
    price: float
    strength: int
    type: str

class SupportResistanceData(BaseModel):
    current_price: float
    supports: List[SupportResistanceLevel]
    resistances: List[SupportResistanceLevel]
    nearest_support: Optional[SupportResistanceLevel]
    nearest_resistance: Optional[SupportResistanceLevel]
    score: int

class TechnicalAnalysisResponse(BaseModel):
    symbol: str
    timeframe: str
    current_price: float
    ema_data: EMAData
    fibonacci_data: FibonacciData
    support_resistance_data: SupportResistanceData
    total_score: int
    max_score: int = 7
    confidence_percentage: float
    recommendation: str
    summary: str
