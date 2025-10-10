"""
Genera datos sintéticos realistas para backtesting
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_realistic_ohlcv(
    symbol: str,
    days: int = 365,
    timeframe: str = '1h'
):
    """Genera datos OHLCV realistas basados en estadísticas de mercado."""
    
    print(f"🎲 Generando datos sintéticos {symbol} {timeframe}...")
    
    # Parámetros realistas por símbolo
    params = {
        'BTC/USDT': {'base': 45000, 'volatility': 0.02, 'trend': 0.0001},
        'ETH/USDT': {'base': 2500, 'volatility': 0.025, 'trend': 0.0002},
        'SOL/USDT': {'base': 100, 'volatility': 0.03, 'trend': 0.0003}
    }
    
    p = params.get(symbol, params['BTC/USDT'])
    
    # Timeframe a minutos
    tf_minutes = {'1h': 60, '4h': 240, '1d': 1440}
    minutes = tf_minutes.get(timeframe, 60)
    
    # Número de velas
    total_minutes = days * 24 * 60
    num_candles = total_minutes // minutes
    
    # Generar serie temporal
    timestamps = [
        datetime.now() - timedelta(minutes=minutes * i)
        for i in range(num_candles, 0, -1)
    ]
    
    # Generar precios con random walk realista
    np.random.seed(42)
    
    prices = [p['base']]
    for _ in range(num_candles - 1):
        change = np.random.normal(p['trend'], p['volatility'])
        new_price = prices[-1] * (1 + change)
        prices.append(max(new_price, 1))
    
    # Generar OHLCV
    data = []
    for i, (ts, close) in enumerate(zip(timestamps, prices)):
        volatility_factor = np.random.uniform(0.995, 1.005)
        
        open_price = close * np.random.uniform(0.998, 1.002)
        high = max(open_price, close) * volatility_factor
        low = min(open_price, close) / volatility_factor
        volume = np.random.uniform(1000, 10000)
        
        data.append({
            'timestamp': ts,
            'open': round(open_price, 2),
            'high': round(high, 2),
            'low': round(low, 2),
            'close': round(close, 2),
            'volume': round(volume, 2)
        })
    
    df = pd.DataFrame(data)
    
    # Guardar
    filename = f"data/historical/{symbol.replace('/', '_')}_{timeframe}_{days}d.csv"
    df.to_csv(filename, index=False)
    
    print(f"✅ {len(df)} velas generadas")
    print(f"📅 {df['timestamp'].min()} a {df['timestamp'].max()}")
    print(f"💰 Rango: ${df['close'].min():.2f} - ${df['close'].max():.2f}\n")
    
    return filename

if __name__ == "__main__":
    print("=" * 60)
    print("🎲 GENERANDO DATASETS SINTÉTICOS REALISTAS")
    print("=" * 60)
    print()
    
    # Generar 2 años de datos
    generate_realistic_ohlcv('BTC/USDT', days=730, timeframe='1h')
    generate_realistic_ohlcv('ETH/USDT', days=730, timeframe='1h')
    generate_realistic_ohlcv('SOL/USDT', days=730, timeframe='1h')
    
    generate_realistic_ohlcv('BTC/USDT', days=730, timeframe='4h')
    generate_realistic_ohlcv('ETH/USDT', days=730, timeframe='4h')
    
    generate_realistic_ohlcv('BTC/USDT', days=730, timeframe='1d')
    
    print("=" * 60)
    print("✅ GENERACIÓN COMPLETADA")
    print("=" * 60)
