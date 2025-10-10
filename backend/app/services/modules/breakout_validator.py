"""
Módulo de Validación de Ruptura Técnica (Breakout Validator)
Valida señales de trading basadas en 5 criterios técnicos avanzados
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime


class BreakoutValidatorModule:
    """
    Valida rupturas de resistencia con 5 criterios técnicos:
    1. Ruptura de resistencia con volumen (0-2 puntos)
    2. RSI entre 50-70 (0-2 puntos)
    3. MACD cruce alcista (0-2 puntos)
    4. Precio > EMA 20 (0-2 puntos)
    5. Volumen > promedio 20 períodos (0-2 puntos)
    
    Total: 10 puntos
    - 8-10: STRONG_BREAKOUT (ruptura fuerte)
    - 6-7: GOOD_BREAKOUT (ruptura buena)
    - 4-5: WEAK_BREAKOUT (ruptura débil)
    - <4: FAILED_BREAKOUT (ruptura fallida)
    """
    
    def __init__(self):
        self.max_score = 10
    
    # ==================== INDICADORES TÉCNICOS ====================
    
    def calculate_rsi(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """
        Calcula el RSI (Relative Strength Index)
        
        RSI = 100 - (100 / (1 + RS))
        donde RS = Average Gain / Average Loss
        
        Args:
            df: DataFrame con columna 'close'
            period: Período del RSI (default: 14)
        
        Returns:
            Series con valores RSI (0-100)
        """
        delta = df['close'].diff()
        
        # Separar ganancias y pérdidas
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        # Calcular promedios móviles
        avg_gain = gain.rolling(window=period, min_periods=period).mean()
        avg_loss = loss.rolling(window=period, min_periods=period).mean()
        
        # Evitar división por cero
        rs = avg_gain / avg_loss.replace(0, np.nan)
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def calculate_macd(
        self, 
        df: pd.DataFrame, 
        fast: int = 12, 
        slow: int = 26, 
        signal: int = 9
    ) -> Dict[str, pd.Series]:
        """
        Calcula el MACD (Moving Average Convergence Divergence)
        
        MACD Line = EMA(12) - EMA(26)
        Signal Line = EMA(9) del MACD Line
        Histogram = MACD Line - Signal Line
        
        Args:
            df: DataFrame con columna 'close'
            fast: Período EMA rápida (default: 12)
            slow: Período EMA lenta (default: 26)
            signal: Período EMA de señal (default: 9)
        
        Returns:
            Dict con 'macd_line', 'signal_line', 'histogram'
        """
        # Calcular EMAs
        ema_fast = df['close'].ewm(span=fast, adjust=False).mean()
        ema_slow = df['close'].ewm(span=slow, adjust=False).mean()
        
        # MACD Line
        macd_line = ema_fast - ema_slow
        
        # Signal Line (EMA del MACD)
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        
        # Histogram
        histogram = macd_line - signal_line
        
        return {
            'macd_line': macd_line,
            'signal_line': signal_line,
            'histogram': histogram
        }
    
    def calculate_volume_avg(self, df: pd.DataFrame, period: int = 20) -> pd.Series:
        """
        Calcula el volumen promedio de N períodos
        
        Args:
            df: DataFrame con columna 'volume'
            period: Número de períodos (default: 20)
        
        Returns:
            Series con volumen promedio móvil
        """
        return df['volume'].rolling(window=period, min_periods=period).mean()
    
    def calculate_ema_slope(self, df: pd.DataFrame, period: int = 21) -> float:
        """
        Calcula la pendiente de la EMA (alcista/bajista)
        
        Args:
            df: DataFrame con columna 'close'
            period: Período de la EMA (default: 21)
        
        Returns:
            Pendiente (positiva = alcista, negativa = bajista)
        """
        ema = df['close'].ewm(span=period, adjust=False).mean()
        
        # Pendiente = (EMA actual - EMA 5 períodos atrás) / 5
        if len(ema) >= 5:
            slope = (ema.iloc[-1] - ema.iloc[-5]) / 5
            return slope
        return 0
    
    # ==================== VALIDACIÓN DE CRITERIOS ====================
    
    def validate_criterion_1_resistance_breakout(
        self, 
        current_price: float,
        resistance_price: float,
        current_volume: float,
        avg_volume: float
    ) -> Dict:
        """
        Criterio 1: Ruptura de resistencia con volumen
        
        Puntos:
        - +1: Precio > Resistencia + 0.5%
        - +1: Volumen actual > 1.5x promedio 20p
        
        Returns:
            Dict con score, passed, details
        """
        score = 0
        details = []
        
        # Calcular % de ruptura
        breakout_pct = ((current_price - resistance_price) / resistance_price) * 100
        
        # Validar ruptura de precio
        if breakout_pct >= 0.5:
            score += 1
            details.append(f"✅ Precio rompió resistencia +{breakout_pct:.2f}%")
        else:
            details.append(f"❌ Precio no alcanzó +0.5% sobre resistencia ({breakout_pct:.2f}%)")
        
        # Validar volumen
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 0
        if volume_ratio >= 1.5:
            score += 1
            details.append(f"✅ Volumen {volume_ratio:.2f}x el promedio")
        else:
            details.append(f"❌ Volumen insuficiente ({volume_ratio:.2f}x el promedio)")
        
        return {
            'score': score,
            'max_score': 2,
            'passed': score >= 1,
            'details': details,
            'metrics': {
                'breakout_pct': round(breakout_pct, 2),
                'volume_ratio': round(volume_ratio, 2)
            }
        }
    
    def validate_criterion_2_rsi(self, rsi_value: float) -> Dict:
        """
        Criterio 2: RSI entre 50-70
        
        Puntos:
        - +1: RSI > 50 (momentum alcista)
        - +1: RSI < 70 (sin sobrecompra)
        
        Returns:
            Dict con score, passed, details
        """
        score = 0
        details = []
        
        # Validar RSI > 50
        if rsi_value > 50:
            score += 1
            details.append(f"✅ RSI {rsi_value:.1f} indica momentum alcista")
        else:
            details.append(f"❌ RSI {rsi_value:.1f} está débil (<50)")
        
        # Validar RSI < 70
        if rsi_value < 70:
            score += 1
            details.append(f"✅ RSI {rsi_value:.1f} sin sobrecompra")
        else:
            details.append(f"⚠️ RSI {rsi_value:.1f} en sobrecompra (>70)")
        
        return {
            'score': score,
            'max_score': 2,
            'passed': score >= 1,
            'details': details,
            'metrics': {
                'rsi': round(rsi_value, 2)
            }
        }
    
    def validate_criterion_3_macd(
        self, 
        macd_line: float,
        signal_line: float,
        histogram: float
    ) -> Dict:
        """
        Criterio 3: MACD cruce alcista
        
        Puntos:
        - +1: MACD line > Signal line
        - +1: Histogram > 0
        
        Returns:
            Dict con score, passed, details
        """
        score = 0
        details = []
        
        # Validar MACD > Signal
        if macd_line > signal_line:
            score += 1
            details.append(f"✅ MACD ({macd_line:.4f}) > Signal ({signal_line:.4f})")
        else:
            details.append(f"❌ MACD ({macd_line:.4f}) < Signal ({signal_line:.4f})")
        
        # Validar Histogram positivo
        if histogram > 0:
            score += 1
            details.append(f"✅ Histogram positivo ({histogram:.4f})")
        else:
            details.append(f"❌ Histogram negativo ({histogram:.4f})")
        
        return {
            'score': score,
            'max_score': 2,
            'passed': score >= 1,
            'details': details,
            'metrics': {
                'macd_line': round(macd_line, 4),
                'signal_line': round(signal_line, 4),
                'histogram': round(histogram, 4)
            }
        }
    
    def validate_criterion_4_ema(
        self, 
        current_price: float,
        ema_21: float,
        ema_slope: float
    ) -> Dict:
        """
        Criterio 4: Precio > EMA 20
        
        Puntos:
        - +1: Precio > EMA 21
        - +1: EMA 21 en pendiente alcista
        
        Returns:
            Dict con score, passed, details
        """
        score = 0
        details = []
        
        # Validar Precio > EMA
        if current_price > ema_21:
            pct_above = ((current_price - ema_21) / ema_21) * 100
            score += 1
            details.append(f"✅ Precio +{pct_above:.2f}% sobre EMA 21")
        else:
            details.append(f"❌ Precio debajo de EMA 21")
        
        # Validar pendiente alcista
        if ema_slope > 0:
            score += 1
            details.append(f"✅ EMA 21 en tendencia alcista")
        else:
            details.append(f"❌ EMA 21 en tendencia bajista")
        
        return {
            'score': score,
            'max_score': 2,
            'passed': score >= 1,
            'details': details,
            'metrics': {
                'ema_21': round(ema_21, 2),
                'ema_slope': round(ema_slope, 6)
            }
        }
    
    def validate_criterion_5_volume_trend(
        self, 
        df: pd.DataFrame,
        current_volume: float,
        avg_volume: float
    ) -> Dict:
        """
        Criterio 5: Volumen > promedio 20 períodos
        
        Puntos:
        - +1: Volumen actual > promedio 20p
        - +1: Volumen creciente últimas 3 velas
        
        Returns:
            Dict con score, passed, details
        """
        score = 0
        details = []
        
        # Validar volumen > promedio
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 0
        if volume_ratio > 1.0:
            score += 1
            details.append(f"✅ Volumen {volume_ratio:.2f}x el promedio")
        else:
            details.append(f"❌ Volumen por debajo del promedio ({volume_ratio:.2f}x)")
        
        # Validar volumen creciente últimas 3 velas
        if len(df) >= 3:
            last_3_volumes = df['volume'].iloc[-3:].values
            if last_3_volumes[-1] > last_3_volumes[-2] > last_3_volumes[-3]:
                score += 1
                details.append(f"✅ Volumen creciente últimas 3 velas")
            else:
                details.append(f"❌ Volumen no muestra tendencia creciente")
        
        return {
            'score': score,
            'max_score': 2,
            'passed': score >= 1,
            'details': details,
            'metrics': {
                'volume_ratio': round(volume_ratio, 2),
                'current_volume': round(current_volume, 2)
            }
        }
    
    # ==================== VALIDACIÓN COMPLETA ====================
    
    def validate_breakout(
        self,
        df: pd.DataFrame,
        current_price: float,
        resistance_price: float
    ) -> Dict:
        """
        Valida ruptura técnica con los 5 criterios
        
        Args:
            df: DataFrame con OHLCV (mínimo 200 velas recomendado)
            current_price: Precio actual
            resistance_price: Nivel de resistencia a romper
        
        Returns:
            Dict completo con validación de todos los criterios
        """
        
        # Calcular indicadores
        rsi = self.calculate_rsi(df, period=14)
        macd_data = self.calculate_macd(df)
        volume_avg = self.calculate_volume_avg(df, period=20)
        ema_21 = df['close'].ewm(span=21, adjust=False).mean()
        ema_slope = self.calculate_ema_slope(df, period=21)
        
        # Valores actuales
        current_rsi = rsi.iloc[-1]
        current_macd_line = macd_data['macd_line'].iloc[-1]
        current_signal_line = macd_data['signal_line'].iloc[-1]
        current_histogram = macd_data['histogram'].iloc[-1]
        current_volume = df['volume'].iloc[-1]
        current_avg_volume = volume_avg.iloc[-1]
        current_ema_21 = ema_21.iloc[-1]
        
        # Validar cada criterio
        criterion_1 = self.validate_criterion_1_resistance_breakout(
            current_price, resistance_price, current_volume, current_avg_volume
        )
        
        criterion_2 = self.validate_criterion_2_rsi(current_rsi)
        
        criterion_3 = self.validate_criterion_3_macd(
            current_macd_line, current_signal_line, current_histogram
        )
        
        criterion_4 = self.validate_criterion_4_ema(
            current_price, current_ema_21, ema_slope
        )
        
        criterion_5 = self.validate_criterion_5_volume_trend(
            df, current_volume, current_avg_volume
        )
        
        # Calcular score total
        total_score = (
            criterion_1['score'] +
            criterion_2['score'] +
            criterion_3['score'] +
            criterion_4['score'] +
            criterion_5['score']
        )
        
        # Determinar recomendación
        if total_score >= 8:
            recommendation = "STRONG_BREAKOUT"
            confidence = "MUY ALTA"
        elif total_score >= 6:
            recommendation = "GOOD_BREAKOUT"
            confidence = "ALTA"
        elif total_score >= 4:
            recommendation = "WEAK_BREAKOUT"
            confidence = "MEDIA"
        else:
            recommendation = "FAILED_BREAKOUT"
            confidence = "BAJA"
        
        # Construir respuesta completa
        return {
            'total_score': total_score,
            'max_score': self.max_score,
            'score_percentage': round((total_score / self.max_score) * 100, 2),
            'recommendation': recommendation,
            'confidence': confidence,
            'criteria': {
                'criterion_1_resistance_breakout': criterion_1,
                'criterion_2_rsi': criterion_2,
                'criterion_3_macd': criterion_3,
                'criterion_4_ema': criterion_4,
                'criterion_5_volume_trend': criterion_5
            },
            'summary': self._generate_summary(
                total_score, recommendation, current_price, resistance_price
            )
        }
    
    def _generate_summary(
        self, 
        score: int,
        recommendation: str,
        current_price: float,
        resistance_price: float
    ) -> str:
        """Genera resumen ejecutivo de la validación"""
        
        breakout_pct = ((current_price - resistance_price) / resistance_price) * 100
        
        summaries = {
            'STRONG_BREAKOUT': f"✅ Ruptura FUERTE confirmada. Precio rompió resistencia {resistance_price:.2f} con {score}/10 confluencias técnicas. Alta probabilidad de continuación alcista.",
            'GOOD_BREAKOUT': f"✅ Ruptura BUENA detectada. Precio sobre resistencia {resistance_price:.2f} con {score}/10 confluencias. Probabilidad moderada-alta de éxito.",
            'WEAK_BREAKOUT': f"⚠️ Ruptura DÉBIL. Precio intentó romper {resistance_price:.2f} pero solo {score}/10 criterios se cumplen. Precaución recomendada.",
            'FAILED_BREAKOUT': f"❌ Ruptura FALLIDA. Precio en {current_price:.2f} no cumple criterios mínimos ({score}/10). Evitar entrada."
        }
        
        return summaries.get(recommendation, "Validación completada")


# Instancia global
breakout_validator = BreakoutValidatorModule()
