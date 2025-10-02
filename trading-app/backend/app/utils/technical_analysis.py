import pandas as pd
import numpy as np
from typing import Dict, List, Any

def calculate_sma(series: pd.Series, period: int) -> pd.Series:
    """Calcular Simple Moving Average"""
    return series.rolling(window=period).mean()

def calculate_ema(series: pd.Series, period: int) -> pd.Series:
    """Calcular Exponential Moving Average"""
    return series.ewm(span=period, adjust=False).mean()

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Calcular RSI"""
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Calcular indicadores técnicos sobre un DataFrame de OHLCV"""
    df = df.copy()

    # SMAs
    df['sma_20'] = calculate_sma(df['close'], 20)
    df['sma_50'] = calculate_sma(df['close'], 50)
    df['sma_200'] = calculate_sma(df['close'], 200)

    # EMAs
    df['ema_12'] = calculate_ema(df['close'], 12)
    df['ema_26'] = calculate_ema(df['close'], 26)
    df['ema_50'] = calculate_ema(df['close'], 50)
    df['ema_200'] = calculate_ema(df['close'], 200)

    # RSI
    df['rsi'] = calculate_rsi(df['close'])

    # ADX simplificado (aproximación)
    df['ADX_14'] = 50  # Placeholder por ahora

    # OBV
    df['obv'] = (np.sign(df['close'].diff()) * df['volume']).fillna(0).cumsum()

    return df

def detect_patterns(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Detectar patrones de velas japonesas"""
    patterns = []

    if len(df) < 3:
        return patterns

    last_3 = df.tail(3).reset_index(drop=True)

    if len(last_3) < 2:
        return patterns

    prev = last_3.iloc[-2]
    curr = last_3.iloc[-1]

    # Envolvente alcista
    if (prev['close'] < prev['open'] and
        curr['close'] > curr['open'] and
        curr['open'] < prev['close'] and
        curr['close'] > prev['open']):

        patterns.append({
            'type': 'bullish_engulfing',
            'name': 'Envolvente Alcista',
            'timestamp': curr['timestamp'],
            'signal': 'LONG'
        })

    # Envolvente bajista
    if (prev['close'] > prev['open'] and
        curr['close'] < curr['open'] and
        curr['open'] > prev['close'] and
        curr['close'] < prev['open']):

        patterns.append({
            'type': 'bearish_engulfing',
            'name': 'Envolvente Bajista',
            'timestamp': curr['timestamp'],
            'signal': 'SHORT'
        })

    # Doji
    body = abs(curr['close'] - curr['open'])
    range_size = curr['high'] - curr['low']

    if range_size > 0 and body / range_size < 0.1:
        patterns.append({
            'type': 'doji',
            'name': 'Doji',
            'timestamp': curr['timestamp'],
            'signal': 'NEUTRAL'
        })

    return patterns

def calculate_support_resistance(df: pd.DataFrame, window: int = 20) -> Dict[str, float]:
    """Calcular niveles de soporte y resistencia"""
    if len(df) < window:
        window = len(df)

    recent = df.tail(window)

    return {
        'support': float(recent['low'].min()),
        'resistance': float(recent['high'].max()),
        'current_price': float(df.iloc[-1]['close'])
    }