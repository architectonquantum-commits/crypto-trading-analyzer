"""
Descarga datos históricos de Binance para backtesting
"""
import ccxt
import pandas as pd
from datetime import datetime, timedelta
import os

def download_historical_data(
    symbol: str,
    timeframe: str,
    days_back: int = 365
):
    """Descarga datos históricos y los guarda en CSV."""
    
    print(f"📊 Descargando {symbol} {timeframe} - últimos {days_back} días...")
    
    exchange = ccxt.binance({
        'enableRateLimit': True,
        'options': {'defaultType': 'future'}
    })
    
    # Calcular fechas
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    since = int(start_date.timestamp() * 1000)
    
    all_data = []
    
    # Descargar en chunks
    while since < int(end_date.timestamp() * 1000):
        try:
            print(f"  Fetching desde {datetime.fromtimestamp(since/1000)}")
            
            ohlcv = exchange.fetch_ohlcv(
                symbol,
                timeframe,
                since=since,
                limit=1000
            )
            
            if not ohlcv:
                break
            
            all_data.extend(ohlcv)
            
            # Actualizar since al último timestamp
            since = ohlcv[-1][0] + 1
            
        except Exception as e:
            print(f"  Error: {e}")
            break
    
    # Convertir a DataFrame
    df = pd.DataFrame(
        all_data,
        columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
    )
    
    # Convertir timestamp
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    
    # Eliminar duplicados
    df = df.drop_duplicates(subset=['timestamp'])
    df = df.sort_values('timestamp')
    
    # Guardar
    filename = f"data/historical/{symbol.replace('/', '_')}_{timeframe}_{days_back}d.csv"
    df.to_csv(filename, index=False)
    
    print(f"✅ Descargado: {len(df)} velas")
    print(f"📁 Guardado en: {filename}")
    print(f"📅 Rango: {df['timestamp'].min()} a {df['timestamp'].max()}")
    
    return filename

if __name__ == "__main__":
    # Descargar datasets principales
    pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
    timeframes = ['1h', '4h', '1d']
    
    for pair in pairs:
        for tf in timeframes:
            try:
                download_historical_data(pair, tf, days_back=730)  # 2 años
                print()
            except Exception as e:
                print(f"❌ Error con {pair} {tf}: {e}\n")
