from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class TradingLevel(BaseModel):
    """Nivel de trading manual (FVG, Order Block, etc.)"""
    id: Optional[str] = None
    symbol: str
    level_type: Literal["FVG", "Order Block", "Soporte", "Resistencia"]
    direction: Literal["BULLISH", "BEARISH"]
    zone_high: float
    zone_low: Optional[float] = None  # Para FVG, None para niveles simples
    notes: Optional[str] = None
    active: bool = True
    created_at: Optional[str] = None

class TradingLevelCreate(BaseModel):
    """Request para crear nivel"""
    symbol: str
    level_type: Literal["FVG", "Order Block", "Soporte", "Resistencia"]
    direction: Literal["BULLISH", "BEARISH"]
    zone_high: float
    zone_low: Optional[float] = None
    notes: Optional[str] = None

class TradingLevelUpdate(BaseModel):
    """Request para actualizar nivel"""
    active: Optional[bool] = None
    notes: Optional[str] = None

class LevelsAnalysis(BaseModel):
    """Análisis de proximidad a niveles"""
    has_nearby_levels: bool
    nearby_count: int
    bonus_points: int  # 0-10 puntos
    details: list[dict]
