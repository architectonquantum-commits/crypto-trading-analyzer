import pandas as pd
import numpy as np
from typing import List, Optional
from app.models.technical_analysis import (
    EMAData, FibonacciData, FibonacciLevel,
    SupportResistanceData, SupportResistanceLevel,
    TechnicalAnalysisResponse
)

class TechnicalAnalysisModule:
    
    def calculate_ema(self, df: pd.DataFrame, period: int):
        return df['close'].ewm(span=period, adjust=False).mean()
    
    def analyze_emas(self, df: pd.DataFrame, current_price: float):
        ema_9 = self.calculate_ema(df, 9).iloc[-1]
        ema_21 = self.calculate_ema(df, 21).iloc[-1]
        ema_50 = self.calculate_ema(df, 50).iloc[-1]
        ema_200 = self.calculate_ema(df, 200).iloc[-1]
        
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
    
    def calculate_fibonacci(self, df: pd.DataFrame, current_price: float):
        recent_df = df.tail(100)
        swing_high = recent_df['high'].max()
        swing_low = recent_df['low'].min()
        diff = swing_high - swing_low
        
        levels_data = [
            ("0.000", swing_low),
            ("0.236", swing_low + diff * 0.236),
            ("0.382", swing_low + diff * 0.382),
            ("0.500", swing_low + diff * 0.5),
            ("0.618", swing_low + diff * 0.618),
            ("0.786", swing_low + diff * 0.786),
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
        
        if nearest_level.level in ["0.618", "0.500"] and min_distance < 1.0:
            score = 2
        elif min_distance < 2.0:
            score = 1
        else:
            score = 0
        
        return FibonacciData(
            swing_high=round(swing_high, 2),
            swing_low=round(swing_low, 2),
            current_price=round(current_price, 2),
            levels=levels,
            nearest_level=nearest_level,
            score=score
        )
    
    def find_support_resistance(self, df: pd.DataFrame, current_price: float):
        tolerance = 0.02
        highs = df['high'].values
        lows = df['low'].values
        
        support_levels = []
        resistance_levels = []
        
        for i in range(2, len(lows) - 2):
            if (lows[i] < lows[i-1] and lows[i] < lows[i-2] and 
                lows[i] < lows[i+1] and lows[i] < lows[i+2]):
                price = lows[i]
                found = False
                for level in support_levels:
                    if abs(level['price'] - price) / price < tolerance:
                        level['strength'] += 1
                        found = True
                        break
                if not found:
                    support_levels.append({'price': price, 'strength': 1})
        
        for i in range(2, len(highs) - 2):
            if (highs[i] > highs[i-1] and highs[i] > highs[i-2] and 
                highs[i] > highs[i+1] and highs[i] > highs[i+2]):
                price = highs[i]
                found = False
                for level in resistance_levels:
                    if abs(level['price'] - price) / price < tolerance:
                        level['strength'] += 1
                        found = True
                        break
                if not found:
                    resistance_levels.append({'price': price, 'strength': 1})
        
        supports = [
            SupportResistanceLevel(
                price=round(s['price'], 2),
                strength=min(s['strength'], 5),
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
        
        score = 0
        if nearest_support:
            distance = abs(current_price - nearest_support.price) / current_price
            if distance < 0.01 and nearest_support.strength >= 3:
                score += 2
            elif distance < 0.02:
                score += 1
        
        if nearest_resistance:
            distance = abs(current_price - nearest_resistance.price) / current_price
            if distance < 0.01 and nearest_resistance.strength >= 3:
                score += 1
        
        score = min(score, 3)
        
        return SupportResistanceData(
            current_price=round(current_price, 2),
            supports=supports,
            resistances=resistances,
            nearest_support=nearest_support,
            nearest_resistance=nearest_resistance,
            score=score
        )
    
    def analyze(self, df: pd.DataFrame, symbol: str, timeframe: str, current_price: float):
        ema_data = self.analyze_emas(df, current_price)
        fib_data = self.calculate_fibonacci(df, current_price)
        sr_data = self.find_support_resistance(df, current_price)
        
        total_score = ema_data.score + fib_data.score + sr_data.score
        confidence_percentage = (total_score / 7) * 100
        
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
        
        summary = f"{symbol} muestra tendencia {ema_data.trend} con {confidence_percentage:.1f}% de confluencias."
        
        return TechnicalAnalysisResponse(
            symbol=symbol,
            timeframe=timeframe,
            current_price=current_price,
            ema_data=ema_data,
            fibonacci_data=fib_data,
            support_resistance_data=sr_data,
            total_score=total_score,
            confidence_percentage=round(confidence_percentage, 2),
            recommendation=recommendation,
            summary=summary
        )
