#!/bin/bash

echo "🔧 Creando Módulo 1 - Análisis Técnico..."

# ============================================
# 1. Modelo de datos
# ============================================
cat > backend/app/models/technical_analysis.py << 'EOF'
from pydantic import BaseModel
from typing import Optional, List, Dict

class TechnicalAnalysisRequest(BaseModel):
    symbol: str  # Ej: "BTC/USDT"
    timeframe: str = "1h"  # Ej: "1m", "5m", "15m", "1h", "4h", "1d"
    
class EMAData(BaseModel):
    ema_9: float
    ema_21: float
    ema_50: float
    ema_200: float
    current_price: float
    trend: str  # "bullish", "bearish", "neutral"
    score: int  # 0-2 puntos

class FibonacciLevel(BaseModel):
    level: str  # "0.236", "0.382", "0.5", "0.618", "0.786"
    price: float
    distance_percent: float  # % de distancia del precio actual

class FibonacciData(BaseModel):
    swing_high: float
    swing_low: float
    current_price: float
    levels: List[FibonacciLevel]
    nearest_level: FibonacciLevel
    score: int  # 0-2 puntos

class SupportResistanceLevel(BaseModel):
    price: float
    strength: int  # 1-5 (cuántas veces tocó ese nivel)
    type: str  # "support" o "resistance"

class SupportResistanceData(BaseModel):
    current_price: float
    supports: List[SupportResistanceLevel]
    resistances: List[SupportResistanceLevel]
    nearest_support: Optional[SupportResistanceLevel]
    nearest_resistance: Optional[SupportResistanceLevel]
    score: int  # 0-3 puntos

class TechnicalAnalysisResponse(BaseModel):
    symbol: str
    timeframe: str
    current_price: float
    
    # Datos de cada indicador
    ema_analysis: EMAData
    fibonacci_analysis: FibonacciData
    support_resistance: SupportResistanceData
    
    # Score total (0-7 puntos)
    total_score: int
    max_score: int = 7
    confidence_percentage: float
    
    # Recomendación
    recommendation: str  # "STRONG_BUY", "BUY", "NEUTRAL", "SELL", "STRONG_SELL"
EOF

# ============================================
# 2. Utilidad para obtener datos de mercado
# ============================================
cat > backend/app/utils/market_data.py << 'EOF'
import ccxt
import pandas as pd
from typing import List, Tuple

class MarketDataFetcher:
    def __init__(self):
        # Por ahora usamos Kraken, después cambiamos a Binance
        self.exchange = ccxt.kraken({
            'enableRateLimit': True,
        })
    
    async def get_ohlcv(self, symbol: str, timeframe: str = '1h', limit: int = 500) -> pd.DataFrame:
        """
        Obtiene datos OHLCV (Open, High, Low, Close, Volume)
        
        Args:
            symbol: Par de trading (ej: "BTC/USDT")
            timeframe: Marco temporal (ej: "1h", "4h", "1d")
            limit: Cantidad de velas a obtener
        
        Returns:
            DataFrame con columnas: timestamp, open, high, low, close, volume
        """
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            
            df = pd.DataFrame(
                ohlcv,
                columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
            )
            
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
            
        except Exception as e:
            raise Exception(f"Error obteniendo datos de {symbol}: {str(e)}")
    
    async def get_current_price(self, symbol: str) -> float:
        """Obtiene el precio actual del activo"""
        try:
            ticker = self.exchange.fetch_ticker(symbol)
            return ticker['last']
        except Exception as e:
            raise Exception(f"Error obteniendo precio de {symbol}: {str(e)}")
EOF

# ============================================
# 3. Servicio de Análisis Técnico
# ============================================
cat > backend/app/services/modules/technical_analysis.py << 'EOF'
import pandas as pd
import numpy as np
from typing import List, Tuple, Optional
from app.models.technical_analysis import (
    EMAData, FibonacciData, FibonacciLevel,
    SupportResistanceData, SupportResistanceLevel,
    TechnicalAnalysisResponse
)

class TechnicalAnalysisModule:
    
    def calculate_ema(self, df: pd.DataFrame, period: int) -> pd.Series:
        """Calcula la EMA (Exponential Moving Average)"""
        return df['close'].ewm(span=period, adjust=False).mean()
    
    def analyze_emas(self, df: pd.DataFrame, current_price: float) -> EMAData:
        """
        Analiza las EMAs y determina tendencia
        
        Scoring (0-2 puntos):
        - 2 puntos: Todas las EMAs alineadas (bullish o bearish)
        - 1 punto: Tendencia mixta pero mayoría alineada
        - 0 puntos: Sin tendencia clara
        """
        # Calcular EMAs
        ema_9 = self.calculate_ema(df, 9).iloc[-1]
        ema_21 = self.calculate_ema(df, 21).iloc[-1]
        ema_50 = self.calculate_ema(df, 50).iloc[-1]
        ema_200 = self.calculate_ema(df, 200).iloc[-1]
        
        # Determinar tendencia
        bullish_count = 0
        if current_price > ema_9: bullish_count += 1
        if ema_9 > ema_21: bullish_count += 1
        if ema_21 > ema_50: bullish_count += 1
        if ema_50 > ema_200: bullish_count += 1
        
        if bullish_count >= 3:
            trend = "bullish"
            score = 2
        elif bullish_count <= 1:
            trend = "bearish"
            score = 0
        else:
            trend = "neutral"
            score = 1
        
        return EMAData(
            ema_9=round(ema_9, 2),
            ema_21=round(ema_21, 2),
            ema_50=round(ema_50, 2),
            ema_200=round(ema_200, 2),
            current_price=round(current_price, 2),
            trend=trend,
            score=score
        )
    
    def calculate_fibonacci_levels(
        self, 
        swing_high: float, 
        swing_low: float,
        current_price: float
    ) -> FibonacciData:
        """
        Calcula niveles de retroceso de Fibonacci
        
        Scoring (0-2 puntos):
        - 2 puntos: Precio muy cerca de nivel clave (0.618 o 0.5) - alta probabilidad
        - 1 punto: Cerca de otros niveles Fibonacci
        - 0 puntos: Lejos de cualquier nivel
        """
        diff = swing_high - swing_low
        
        levels_data = [
            ("0.000", swing_low),
            ("0.236", swing_low + (diff * 0.236)),
            ("0.382", swing_low + (diff * 0.382)),
            ("0.500", swing_low + (diff * 0.5)),
            ("0.618", swing_low + (diff * 0.618)),
            ("0.786", swing_low + (diff * 0.786)),
            ("1.000", swing_high),
        ]
        
        levels = []
        min_distance = float('inf')
        nearest_level = None
        
        for level_name, level_price in levels_data:
            distance_percent = abs((current_price - level_price) / current_price * 100)
            
            fib_level = FibonacciLevel(
                level=level_name,
                price=round(level_price, 2),
                distance_percent=round(distance_percent, 2)
            )
            levels.append(fib_level)
            
            if distance_percent < min_distance:
                min_distance = distance_percent
                nearest_level = fib_level
        
        # Scoring basado en cercanía a niveles clave
        if nearest_level.level in ["0.618", "0.500"] and min_distance < 1.0:
            score = 2  # Muy cerca de nivel clave
        elif min_distance < 2.0:
            score = 1  # Cerca de algún nivel
        else:
            score = 0  # Lejos de niveles
        
        return FibonacciData(
            swing_high=round(swing_high, 2),
            swing_low=round(swing_low, 2),
            current_price=round(current_price, 2),
            levels=levels,
            nearest_level=nearest_level,
            score=score
        )
    
    def find_support_resistance(
        self, 
        df: pd.DataFrame, 
        current_price: float,
        tolerance: float = 0.02  # 2% tolerancia
    ) -> SupportResistanceData:
        """
        Encuentra niveles de soporte y resistencia
        
        Scoring (0-3 puntos):
        - 3 puntos: Precio en zona de soporte/resistencia fuerte (3+ toques)
        - 2 puntos: Cerca de nivel moderado (2 toques)
        - 1 punto: Cerca de nivel débil (1 toque)
        - 0 puntos: Sin niveles cercanos
        """
        # Encontrar máximos y mínimos locales
        highs = df['high'].values
        lows = df['low'].values
        
        # Agrupar niveles similares
        support_levels = []
        resistance_levels = []
        
        # Encontrar mínimos (soportes)
        for i in range(2, len(lows) - 2):
            if lows[i] < lows[i-1] and lows[i] < lows[i-2] and \
               lows[i] < lows[i+1] and lows[i] < lows[i+2]:
                # Es un mínimo local
                price = lows[i]
                
                # Buscar si ya existe un nivel similar
                found = False
                for level in support_levels:
                    if abs(level['price'] - price) / price < tolerance:
                        level['strength'] += 1
                        found = True
                        break
                
                if not found:
                    support_levels.append({'price': price, 'strength': 1})
        
        # Encontrar máximos (resistencias)
        for i in range(2, len(highs) - 2):
            if highs[i] > highs[i-1] and highs[i] > highs[i-2] and \
               highs[i] > highs[i+1] and highs[i] > highs[i+2]:
                # Es un máximo local
                price = highs[i]
                
                # Buscar si ya existe un nivel similar
                found = False
                for level in resistance_levels:
                    if abs(level['price'] - price) / price < tolerance:
                        level['strength'] += 1
                        found = True
                        break
                
                if not found:
                    resistance_levels.append({'price': price, 'strength': 1})
        
        # Convertir a objetos SupportResistanceLevel
        supports = [
            SupportResistanceLevel(
                price=round(s['price'], 2),
                strength=min(s['strength'], 5),  # Max 5
                type="support"
            )
            for s in sorted(support_levels, key=lambda x: x['price'], reverse=True)[:5]
        ]
        
        resistances = [
            SupportResistanceLevel(
                price=round(r['price'], 2),
                strength=min(r['strength'], 5),
                type="resistance"
            )
            for r in sorted(resistance_levels, key=lambda x: x['price'])[:5]
        ]
        
        # Encontrar niveles más cercanos
        nearest_support = None
        nearest_resistance = None
        
        for s in supports:
            if s.price < current_price:
                nearest_support = s
                break
        
        for r in resistances:
            if r.price > current_price:
                nearest_resistance = r
                break
        
        # Calcular score
        score = 0
        if nearest_support:
            distance = abs(current_price - nearest_support.price) / current_price
            if distance < 0.01 and nearest_support.strength >= 3:  # Muy cerca y fuerte
                score += 2
            elif distance < 0.02:  # Cerca
                score += 1
        
        if nearest_resistance:
            distance = abs(current_price - nearest_resistance.price) / current_price
            if distance < 0.01 and nearest_resistance.strength >= 3:
                score += 1
        
        score = min(score, 3)  # Max 3 puntos
        
        return SupportResistanceData(
            current_price=round(current_price, 2),
            supports=supports,
            resistances=resistances,
            nearest_support=nearest_support,
            nearest_resistance=nearest_resistance,
            score=score
        )
    
    def analyze(
        self, 
        df: pd.DataFrame, 
        symbol: str, 
        timeframe: str,
        current_price: float
    ) -> TechnicalAnalysisResponse:
        """
        Análisis técnico completo
        
        Total: 7 puntos
        - EMAs: 2 puntos
        - Fibonacci: 2 puntos  
        - Soporte/Resistencia: 3 puntos
        """
        # Análisis de EMAs
        ema_analysis = self.analyze_emas(df, current_price)
        
        # Análisis de Fibonacci (usando swing high/low de últimas 100 velas)
        recent_df = df.tail(100)
        swing_high = recent_df['high'].max()
        swing_low = recent_df['low'].min()
        fibonacci_analysis = self.calculate_fibonacci_levels(
            swing_high, swing_low, current_price
        )
        
        # Análisis de Soporte/Resistencia
        sr_analysis = self.find_support_resistance(df, current_price)
        
        # Calcular score total y confianza
        total_score = (
            ema_analysis.score +
            fibonacci_analysis.score +
            sr_analysis.score
        )
        
        confidence_percentage = (total_score / 7) * 100
        
        # Determinar recomendación
        if confidence_percentage >= 85:
            recommendation = "STRONG_BUY"
        elif confidence_percentage >= 70:
            recommendation = "BUY"
        elif confidence_percentage >= 40:
            recommendation = "NEUTRAL"
        elif confidence_percentage >= 25:
            recommendation = "SELL"
        else:
            recommendation = "STRONG_SELL"
        
        return TechnicalAnalysisResponse(
            symbol=symbol,
            timeframe=timeframe,
            current_price=current_price,
            ema_analysis=ema_analysis,
            fibonacci_analysis=fibonacci_analysis,
            support_resistance=sr_analysis,
            total_score=total_score,
            confidence_percentage=round(confidence_percentage, 2),
            recommendation=recommendation
        )
EOF

# ============================================
# 4. Endpoint para probar el módulo
# ============================================
cat > backend/app/api/endpoints/technical.py << 'EOF'
from fastapi import APIRouter, HTTPException
from app.models.technical_analysis import TechnicalAnalysisRequest, TechnicalAnalysisResponse
from app.services.modules.technical_analysis import TechnicalAnalysisModule
from app.utils.market_data import MarketDataFetcher

router = APIRouter()

@router.post("/technical-analysis", response_model=TechnicalAnalysisResponse)
async def analyze_technical(request: TechnicalAnalysisRequest):
    """
    Realiza análisis técnico completo de un activo
    
    Incluye:
    - EMAs (9, 21, 50, 200)
    - Niveles de Fibonacci
    - Soporte y Resistencia
    
    Score total: 0-7 puntos
    """
    try:
        # Obtener datos del mercado
        fetcher = MarketDataFetcher()
        df = await fetcher.get_ohlcv(request.symbol, request.timeframe)
        current_price = await fetcher.get_current_price(request.symbol)
        
        # Realizar análisis
        analyzer = TechnicalAnalysisModule()
        result = analyzer.analyze(df, request.symbol, request.timeframe, current_price)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis: {str(e)}")

@router.get("/technical-analysis/test")
async def test_technical():
    """Endpoint de prueba rápida con BTC/USDT"""
    try:
        request = TechnicalAnalysisRequest(
            symbol="BTC/USDT",
            timeframe="1h"
        )
        return await analyze_technical(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
EOF

echo "✅ Módulo 1 creado exitosamente"
