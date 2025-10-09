import pandas as pd
import numpy as np
from typing import List, Tuple, Optional
from app.models.market_structure import (
    OrderBlock, OrderBlocksAnalysis, WyckoffPhase, WyckoffAnalysis,
    Divergence, DivergenceAnalysis, MarketStructureResponse
)

class MarketStructureModule:

    def calculate_rsi(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calcula el RSI (Relative Strength Index)"""
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def calculate_macd(self, df: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        """Calcula MACD y señal"""
        exp1 = df['close'].ewm(span=12, adjust=False).mean()
        exp2 = df['close'].ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        return macd, signal

    def find_order_blocks(
        self, 
        df: pd.DataFrame, 
        current_price: float
    ) -> OrderBlocksAnalysis:
        """
        Identifica Order Blocks (zonas institucionales)

        Score (0-2 puntos):
        - 2 puntos: Precio cerca de order block fuerte
        - 1 punto: Order blocks identificados pero lejos
        - 0 puntos: Sin order blocks claros
        """
        demand_zones = []
        supply_zones = []

        # Buscar zonas de demanda (bullish order blocks)
        for i in range(10, len(df) - 5):
            # Buscar vela bajista seguida de impulso alcista fuerte
            if (df['close'].iloc[i] < df['open'].iloc[i] and  # Vela bajista
                df['close'].iloc[i+1] > df['close'].iloc[i+2] and  # Impulso alcista
                df['volume'].iloc[i+1] > df['volume'].iloc[i] * 1.5):  # Alto volumen

                high = df['high'].iloc[i]
                low = df['low'].iloc[i]
                distance = abs((current_price - low) / current_price) * 100

                # Calcular fuerza (1-5) basado en volumen y tamaño
                volume_strength = min(5, int(df['volume'].iloc[i+1] / df['volume'].iloc[i]))

                demand_zones.append(OrderBlock(
                    type="demand",
                    price_high=round(high, 2),
                    price_low=round(low, 2),
                    strength=volume_strength,
                    distance_from_current=round(distance, 2)
                ))

        # Buscar zonas de oferta (bearish order blocks)
        for i in range(10, len(df) - 5):
            # Buscar vela alcista seguida de impulso bajista fuerte
            if (df['close'].iloc[i] > df['open'].iloc[i] and  # Vela alcista
                df['close'].iloc[i+1] < df['close'].iloc[i+2] and  # Impulso bajista
                df['volume'].iloc[i+1] > df['volume'].iloc[i] * 1.5):

                high = df['high'].iloc[i]
                low = df['low'].iloc[i]
                distance = abs((current_price - high) / current_price) * 100

                volume_strength = min(5, int(df['volume'].iloc[i+1] / df['volume'].iloc[i]))

                supply_zones.append(OrderBlock(
                    type="supply",
                    price_high=round(high, 2),
                    price_low=round(low, 2),
                    strength=volume_strength,
                    distance_from_current=round(distance, 2)
                ))

        # Ordenar por distancia
        demand_zones.sort(key=lambda x: x.distance_from_current)
        supply_zones.sort(key=lambda x: x.distance_from_current)

        # Tomar solo los 3 más cercanos
        demand_zones = demand_zones[:3]
        supply_zones = supply_zones[:3]

        nearest_demand = demand_zones[0] if demand_zones else None
        nearest_supply = supply_zones[0] if supply_zones else None

        # Calcular score
        score = 0
        if nearest_demand and nearest_demand.distance_from_current < 3 and nearest_demand.strength >= 3:
            score = 2
        elif nearest_supply and nearest_supply.distance_from_current < 3 and nearest_supply.strength >= 3:
            score = 2
        elif nearest_demand or nearest_supply:
            score = 1

        return OrderBlocksAnalysis(
            demand_zones=demand_zones,
            supply_zones=supply_zones,
            nearest_demand=nearest_demand,
            nearest_supply=nearest_supply,
            score=score
        )

    def analyze_wyckoff(self, df: pd.DataFrame) -> WyckoffAnalysis:
        """
        Analiza la estructura Wyckoff

        Score (0-2 puntos):
        - 2 puntos: Fase clara de acumulación o markup
        - 1 punto: Fase identificada pero neutral
        - 0 puntos: Fase de distribución o markdown
        """
        recent = df.tail(50)

        # Analizar tendencia de volumen
        volume_ma = recent['volume'].rolling(window=10).mean()
        volume_increasing = recent['volume'].iloc[-5:].mean() > volume_ma.iloc[-10:-5].mean()

        # Analizar rango de precios
        price_range = recent['high'].max() - recent['low'].min()
        current_range = recent['close'].iloc[-10:].max() - recent['close'].iloc[-10:].min()
        is_ranging = current_range < (price_range * 0.3)

        # Analizar tendencia
        sma_20 = recent['close'].rolling(window=20).mean().iloc[-1]
        current_price = recent['close'].iloc[-1]
        is_bullish = current_price > sma_20

        # Determinar fase Wyckoff
        if is_ranging and volume_increasing and not is_bullish:
            phase = "accumulation"
            confidence = 70
            description = "Posible acumulación: rango con volumen creciente"
            score = 2
        elif is_bullish and not is_ranging and volume_increasing:
            phase = "markup"
            confidence = 75
            description = "Fase de markup: tendencia alcista con volumen"
            score = 2
        elif is_ranging and volume_increasing and is_bullish:
            phase = "distribution"
            confidence = 65
            description = "Posible distribución: rango alto con volumen"
            score = 0
        elif not is_bullish and not is_ranging:
            phase = "markdown"
            confidence = 70
            description = "Fase de markdown: tendencia bajista"
            score = 0
        else:
            phase = "neutral"
            confidence = 50
            description = "Fase neutral: sin patrón claro"
            score = 1

        volume_trend = "increasing" if volume_increasing else "decreasing"
        price_action = "bullish" if is_bullish else "bearish" if not is_ranging else "ranging"

        return WyckoffAnalysis(
            current_phase=WyckoffPhase(
                phase=phase,
                confidence=confidence,
                description=description
            ),
            volume_trend=volume_trend,
            price_action=price_action,
            score=score
        )

    def detect_divergences(self, df: pd.DataFrame) -> DivergenceAnalysis:
        """
        Detecta divergencias RSI y MACD

        Score (0-1 punto):
        - 1 punto: Divergencia alcista detectada
        - 0 puntos: Sin divergencias o divergencia bajista
        """
        rsi = self.calculate_rsi(df)
        macd, signal = self.calculate_macd(df)

        recent = df.tail(30)
        recent_rsi = rsi.tail(30)
        recent_macd = macd.tail(30)

        rsi_div = None
        macd_div = None

        # Detectar divergencia alcista en RSI
        # Precio hace mínimos más bajos, RSI hace mínimos más altos
        price_lows = []
        rsi_lows = []

        for i in range(2, len(recent) - 2):
            if (recent['low'].iloc[i] < recent['low'].iloc[i-1] and 
                recent['low'].iloc[i] < recent['low'].iloc[i+1]):
                price_lows.append((i, recent['low'].iloc[i]))
                rsi_lows.append((i, recent_rsi.iloc[i]))

        if len(price_lows) >= 2:
            if price_lows[-1][1] < price_lows[-2][1] and rsi_lows[-1][1] > rsi_lows[-2][1]:
                rsi_div = Divergence(
                    type="bullish",
                    indicator="RSI",
                    strength="strong",
                    timeframe="recent"
                )

        # Detectar divergencia en MACD (simplificado)
        if recent_macd.iloc[-1] > recent_macd.iloc[-5]:
            if recent['close'].iloc[-1] < recent['close'].iloc[-5]:
                macd_div = Divergence(
                    type="bullish",
                    indicator="MACD",
                    strength="moderate",
                    timeframe="recent"
                )

        has_divergence = rsi_div is not None or macd_div is not None
        score = 1 if (rsi_div and rsi_div.type == "bullish") else 0

        return DivergenceAnalysis(
            rsi_divergence=rsi_div,
            macd_divergence=macd_div,
            has_divergence=has_divergence,
            score=score
        )

    def analyze(
        self,
        df: pd.DataFrame,
        symbol: str,
        timeframe: str,
        current_price: float
    ) -> MarketStructureResponse:
        """
        Análisis completo de estructura de mercado

        Total: 5 puntos
        - Order Blocks: 2 puntos
        - Wyckoff: 2 puntos
        - Divergencias: 1 punto
        """
        order_blocks = self.find_order_blocks(df, current_price)
        wyckoff = self.analyze_wyckoff(df)
        divergences = self.detect_divergences(df)

        total_score = order_blocks.score + wyckoff.score + divergences.score
        confidence_percentage = (total_score / 5) * 100

        if confidence_percentage >= 80:
            recommendation = "STRONG_STRUCTURE"
        elif confidence_percentage >= 60:
            recommendation = "GOOD_STRUCTURE"
        elif confidence_percentage >= 40:
            recommendation = "NEUTRAL_STRUCTURE"
        else:
            recommendation = "WEAK_STRUCTURE"

        summary = (
            f"{symbol} en fase {wyckoff.current_phase.phase} "
            f"con {confidence_percentage:.0f}% de confluencias estructurales."
        )

        return MarketStructureResponse(
            symbol=symbol,
            timeframe=timeframe,
            current_price=current_price,
            order_blocks=order_blocks,
            wyckoff=wyckoff,
            divergences=divergences,
            total_score=total_score,
            confidence_percentage=round(confidence_percentage, 2),
            recommendation=recommendation,
            summary=summary
        )