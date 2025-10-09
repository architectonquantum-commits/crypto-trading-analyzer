from pydantic import BaseModel
from typing import List, Optional

class ManualSignalRequest(BaseModel):
    symbol: str
    entry_price: float
    stop_loss: Optional[float] = None
    take_profit_1: Optional[float] = None
    take_profit_2: Optional[float] = None
    take_profit_3: Optional[float] = None
    direction: str = "LONG"
    capital: float = 10000
    risk_percentage: float = 2
    timeframe: str = "1h"

class ModuleScores(BaseModel):
    technical: int
    structure: int
    risk: int
    macro: int
    sentiment: int
    total: int
    max_possible: int = 25
    percentage: float

class ValidationResult(BaseModel):
    recommendation: str
    confidence_level: str
    should_trade: bool
    reasons: List[str]
    warnings: List[str]

class SignalValidationResponse(BaseModel):
    signal_input: ManualSignalRequest
    current_price: float
    timestamp: str
    scores: ModuleScores
    validation: ValidationResult
    summary: str
    detailed_analysis: dict