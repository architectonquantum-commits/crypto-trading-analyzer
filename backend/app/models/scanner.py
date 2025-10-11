# backend/app/models/scanner.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ScannerRequest(BaseModel):
    """Request para escanear criptomonedas"""
    timeframe: str = Field(default="1h", description="Timeframe: 1h, 4h, 1d")
    min_confluence: float = Field(
        default=70.0,
        ge=0,
        le=100,
        description="Confluencia mínima para considerar oportunidad (%)"
    )
    symbols: Optional[List[str]] = Field(
        default=None,
        description="Lista opcional de símbolos a escanear (ej: ['BTC', 'ETH']). Si es None, escanea las 23 por defecto"
    )

class CryptoOpportunity(BaseModel):
    """Oportunidad detectada en una criptomoneda"""
    symbol: str
    current_price: float
    confluence_percentage: int
    recommendation: str
    total_score: int
    exchange: str = Field(default="kraken", description="Exchange utilizado")
    
    # 🆕 NUEVOS CAMPOS para SL y TP automáticos
    suggested_stop_loss: Optional[float] = None
    suggested_take_profit: Optional[float] = None
    atr_value: Optional[float] = None
    direction: Optional[str] = None  # "LONG" o "SHORT"

class ScannerResponse(BaseModel):
    """Response del scanner con todas las oportunidades"""
    timestamp: str
    timeframe: str
    total_scanned: int
    opportunities_found: int
    min_confluence_filter: float
    top_opportunities: List[CryptoOpportunity]
    all_results: List[dict]
