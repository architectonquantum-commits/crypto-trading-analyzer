from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.bitacora import Bitacora
from ..api.binance import binance_service
from ..utils.technical_analysis import analyze_pair
from ..services.cache import cache_manager
from ..config import config
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "API de Trading TRADE-ARCHI activa", "version": "1.0"}

@router.get("/pares")
async def obtener_pares():
    """Devuelve la lista de pares configurados"""
    return {"pares": config.TRADING_PAIRS}

@router.get("/analisis/{par}")
async def analizar_par(par: str, db: Session = Depends(get_db)):
    """Analiza un par específico y devuelve todos los indicadores"""
    
    cache_key = f"analisis_{par}"
    cached_data = cache_manager.get(cache_key)
    
    if cached_data:
        logger.info(f"Datos en caché para {par}")
        return cached_data
    
    try:
        klines = binance_service.get_klines(par, config.TIMEFRAME, config.LIMIT)
        
        if not klines:
            raise HTTPException(status_code=404, detail=f"No se pudieron obtener datos para {par}")
        
        analisis = analyze_pair(klines)
        
        if not analisis:
            raise HTTPException(status_code=500, detail=f"Error al analizar {par}")
        
        result = {
            "par": par,
            "timeframe": config.TIMEFRAME,
            **analisis
        }
        
        bitacora_entry = Bitacora(
            par=par,
            precio=analisis['precio'],
            rsi=analisis.get('rsi'),
            adx=analisis.get('adx'),
            sma_20=analisis.get('sma_20'),
            sma_50=analisis.get('sma_50'),
            sma_200=analisis.get('sma_200'),
            ema_12=analisis.get('ema_12'),
            ema_26=analisis.get('ema_26'),
            ema_50=analisis.get('ema_50'),
            ema_200=analisis.get('ema_200'),
            volumen=analisis['volumen'],
            obv=analisis.get('obv'),
            patron_velas=analisis.get('patron_velas'),
            order_block=analisis.get('order_block'),
            fvg=analisis.get('fvg'),
            soporte=analisis.get('soporte'),
            resistencia=analisis.get('resistencia')
        )
        
        db.add(bitacora_entry)
        db.commit()
        
        cache_manager.set(cache_key, result)
        
        return result
        
    except Exception as e:
        logger.error(f"Error al analizar {par}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analisis-multiple")
async def analizar_multiples_pares(db: Session = Depends(get_db)):
    """Analiza todos los pares configurados"""
    resultados = []
    
    for par in config.TRADING_PAIRS:
        cache_key = f"analisis_{par}"
        cached_data = cache_manager.get(cache_key)
        
        if cached_data:
            resultados.append(cached_data)
            continue
        
        try:
            klines = binance_service.get_klines(par, config.TIMEFRAME, config.LIMIT)
            
            if not klines:
                logger.warning(f"No se pudieron obtener datos para {par}")
                continue
            
            analisis = analyze_pair(klines)
            
            if not analisis:
                logger.warning(f"Error al analizar {par}")
                continue
            
            result = {
                "par": par,
                "timeframe": config.TIMEFRAME,
                "precio": analisis['precio'],
                "rsi": analisis.get('rsi'),
                "adx": analisis.get('adx'),
                "sma_20": analisis.get('sma_20'),
                "sma_50": analisis.get('sma_50'),
                "sma_200": analisis.get('sma_200'),
                "ema_12": analisis.get('ema_12'),
                "ema_26": analisis.get('ema_26'),
                "ema_50": analisis.get('ema_50'),
                "ema_200": analisis.get('ema_200'),
                "volumen": analisis['volumen'],
                "obv": analisis.get('obv'),
                "patron_velas": analisis.get('patron_velas'),
                "order_block": analisis.get('order_block'),
                "fvg": analisis.get('fvg'),
                "soporte": analisis.get('soporte'),
                "resistencia": analisis.get('resistencia')
            }
            
            cache_manager.set(cache_key, result)
            resultados.append(result)
            
        except Exception as e:
            logger.error(f"Error al procesar {par}: {e}")
            continue
    
    return {"pares": resultados, "total": len(resultados)}

@router.get("/bitacora")
async def obtener_bitacora(limite: int = 100, db: Session = Depends(get_db)):
    """Obtiene los últimos registros de la bitácora"""
    registros = db.query(Bitacora).order_by(Bitacora.timestamp.desc()).limit(limite).all()
    return {"registros": registros, "total": len(registros)}

@router.get("/bitacora/{par}")
async def obtener_bitacora_par(par: str, limite: int = 50, db: Session = Depends(get_db)):
    """Obtiene la bitácora de un par específico"""
    registros = db.query(Bitacora).filter(Bitacora.par == par).order_by(Bitacora.timestamp.desc()).limit(limite).all()
    return {"par": par, "registros": registros, "total": len(registros)}

@router.delete("/cache")
async def limpiar_cache():
    """Limpia el caché de análisis"""
    cache_manager.clear()
    return {"message": "Caché limpiado exitosamente"}
