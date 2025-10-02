from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import pandas as pd

from app.database import get_db
from app.models.bitacora import Operacion, TipoOperacion
from app.api.binance import binance_service
from app.utils.technical_analysis import (
    calculate_indicators,
    detect_patterns,
    calculate_support_resistance
)
from pydantic import BaseModel

router = APIRouter()

# ============= SCHEMAS =============

class OperacionCreate(BaseModel):
    symbol: str
    timeframe: str
    tipo: TipoOperacion
    precio_entrada: float
    stop_loss: float
    take_profit: float
    notas: Optional[str] = None

class OperacionUpdate(BaseModel):
    fecha_salida: Optional[datetime] = None
    precio_salida: Optional[float] = None
    resultado: Optional[float] = None
    notas: Optional[str] = None

class OperacionResponse(BaseModel):
    id: str
    symbol: str
    timeframe: str
    tipo: str
    fecha_entrada: datetime
    precio_entrada: float
    stop_loss: float
    take_profit: float
    fecha_salida: Optional[datetime]
    precio_salida: Optional[float]
    resultado: Optional[float]
    notas: Optional[str]

    class Config:
        from_attributes = True

# ============= RUTAS DE DATOS =============

@router.get("/symbols")
def get_symbols():
    """Obtener lista de símbolos disponibles"""
    try:
        symbols = binance_service.get_available_symbols()
        return {"symbols": symbols}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data")
def get_market_data(
    symbol: str = Query(..., description="Par de trading (BTCUSDT, ETHUSDT, etc.)"),
    interval: str = Query(default="1h", regex="^(1m|5m|15m|1h|4h|1d)$"),
    limit: int = Query(default=500, ge=1, le=1000)
):
    """
    Obtener datos OHLCV de Binance

    - **symbol**: Par de trading (BTCUSDT, ETHUSDT, etc. - sin barra)
    - **interval**: Temporalidad (1m, 5m, 15m, 1h, 4h, 1d)
    - **limit**: Cantidad de velas (máx 1000)
    """
    try:
        df = binance_service.get_ohlcv(symbol, interval, limit)

        # Convertir a formato JSON-friendly
        data = df.to_dict('records')
        for record in data:
            record['timestamp'] = record['timestamp'].isoformat()

        return {
            "symbol": symbol,
            "interval": interval,
            "data": data,
            "count": len(data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ticker")
def get_ticker(symbol: str = Query(..., description="Par de trading")):
    """Obtener precio actual de un símbolo"""
    try:
        ticker = binance_service.get_ticker(symbol)
        return ticker
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis")
def get_analysis(
    symbol: str = Query(..., description="Par de trading"),
    interval: str = Query(default="1h", regex="^(1m|5m|15m|1h|4h|1d)$"),
    limit: int = Query(default=200, ge=50, le=500)
):
    """
    Análisis técnico completo de un símbolo

    Retorna indicadores técnicos, patrones detectados y niveles clave
    """
    try:
        # Obtener datos
        df = binance_service.get_ohlcv(symbol, interval, limit)

        # Calcular indicadores
        df = calculate_indicators(df)

        # Detectar patrones
        patterns = detect_patterns(df)

        # Calcular soporte/resistencia
        levels = calculate_support_resistance(df)

        # Última vela con indicadores
        last_candle = df.iloc[-1].to_dict()
        last_candle['timestamp'] = last_candle['timestamp'].isoformat()

        return {
            "symbol": symbol,
            "interval": interval,
            "last_candle": last_candle,
            "patterns": patterns,
            "levels": levels,
            "indicators": {
                "rsi": float(last_candle.get('rsi', 0)) if pd.notna(last_candle.get('rsi')) else None,
                "adx": float(last_candle.get('ADX_14', 0)) if pd.notna(last_candle.get('ADX_14')) else None,
                "sma_20": float(last_candle.get('sma_20', 0)) if pd.notna(last_candle.get('sma_20')) else None,
                "sma_50": float(last_candle.get('sma_50', 0)) if pd.notna(last_candle.get('sma_50')) else None,
                "ema_12": float(last_candle.get('ema_12', 0)) if pd.notna(last_candle.get('ema_12')) else None,
                "ema_26": float(last_candle.get('ema_26', 0)) if pd.notna(last_candle.get('ema_26')) else None,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= RUTAS DE BITÁCORA =============

@router.post("/bitacora", response_model=OperacionResponse)
def create_operacion(operacion: OperacionCreate, db: Session = Depends(get_db)):
    """Crear una nueva operación en la bitácora"""
    db_operacion = Operacion(**operacion.dict())
    db.add(db_operacion)
    db.commit()
    db.refresh(db_operacion)
    return db_operacion

@router.get("/bitacora", response_model=List[OperacionResponse])
def list_operaciones(
    skip: int = 0,
    limit: int = 100,
    symbol: Optional[str] = None,
    tipo: Optional[TipoOperacion] = None,
    db: Session = Depends(get_db)
):
    """Listar operaciones de la bitácora"""
    query = db.query(Operacion)

    if symbol:
        query = query.filter(Operacion.symbol == symbol)
    if tipo:
        query = query.filter(Operacion.tipo == tipo)

    operaciones = query.order_by(Operacion.fecha_entrada.desc()).offset(skip).limit(limit).all()
    return operaciones

@router.get("/bitacora/{operacion_id}", response_model=OperacionResponse)
def get_operacion(operacion_id: str, db: Session = Depends(get_db)):
    """Obtener una operación específica"""
    operacion = db.query(Operacion).filter(Operacion.id == operacion_id).first()
    if not operacion:
        raise HTTPException(status_code=404, detail="Operación no encontrada")
    return operacion

@router.put("/bitacora/{operacion_id}", response_model=OperacionResponse)
def update_operacion(
    operacion_id: str,
    operacion_update: OperacionUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una operación"""
    db_operacion = db.query(Operacion).filter(Operacion.id == operacion_id).first()
    if not db_operacion:
        raise HTTPException(status_code=404, detail="Operación no encontrada")

    for key, value in operacion_update.dict(exclude_unset=True).items():
        setattr(db_operacion, key, value)

    db.commit()
    db.refresh(db_operacion)
    return db_operacion

@router.delete("/bitacora/{operacion_id}")
def delete_operacion(operacion_id: str, db: Session = Depends(get_db)):
    """Eliminar una operación"""
    db_operacion = db.query(Operacion).filter(Operacion.id == operacion_id).first()
    if not db_operacion:
        raise HTTPException(status_code=404, detail="Operación no encontrada")

    db.delete(db_operacion)
    db.commit()
    return {"message": "Operación eliminada"}