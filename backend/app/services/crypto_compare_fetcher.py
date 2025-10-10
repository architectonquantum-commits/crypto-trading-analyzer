"""
Descarga de datos de CryptoCompare bajo demanda
"""
import requests
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

def download_single_pair(symbol: str, timeframe: str, days: int = 30):
    """Descarga datos de un par específico."""
    
    # Configurar
    API_KEY = "4e0b4e1c8b824f7e9c8e9f5a1e5c8e9f"
    BASE_URL = "https://min-api.cryptocompare.com/data/v2"
    
    # Parsear símbolo
    base, quote = symbol.split('/')
    
    # Determinar límite según timeframe
    if timeframe == '1h':
        endpoint = 'histohour'
        limit = min(days * 24, 2000)
    elif timeframe == '4h':
        endpoint = 'histohour'
        limit = min(days * 6, 2000)
    elif timeframe == '1d':
        endpoint = 'histoday'
        limit = min(days, 2000)
    else:
        limit = 2000
        endpoint = 'histohour'
    
    # Request
    url = f"{BASE_URL}/{endpoint}"
    params = {
        'fsym': base,
        'tsym': quote,
        'limit': limit,
        'api_key': API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['Response'] != 'Success':
        raise Exception(f"API Error: {data.get('Message', 'Unknown error')}")
    
    # Convertir a DataFrame
    df = pd.DataFrame(data['Data']['Data'])
    df['timestamp'] = pd.to_datetime(df['time'], unit='s')
    df = df[['timestamp', 'open', 'high', 'low', 'close', 'volumefrom', 'volumeto']]
    df.columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'volume_quote']
    
    # Guardar CON EL FORMATO CORRECTO
    data_dir = Path('data/historical')
    data_dir.mkdir(parents=True, exist_ok=True)
    
    symbol_clean = symbol.replace('/', '_')
    # FORMATO: SYMBOL_TIMEFRAME_730d_REAL.csv
    filename = f"{symbol_clean}_{timeframe}_730d_REAL.csv"
    filepath = data_dir / filename
    
    df.to_csv(filepath, index=False)
    print(f"✅ Guardado: {filepath} ({len(df)} velas)")
    
    return df


def fetch_historical_data_crypto_compare(symbol: str, days: int = 365, timeframe: str = '1h'):
    """
    Función wrapper para compatibilidad.
    Descarga datos históricos de CryptoCompare.
    
    Args:
        symbol: Símbolo sin barra (ej: 'ALGO', 'BTC')
        days: Días de historia
        timeframe: '1h', '4h', '1d'
    
    Returns:
        DataFrame con columnas: timestamp, open, high, low, close, volume
    """
    try:
        # Agregar /USDT si no tiene par
        if '/' not in symbol:
            symbol = f"{symbol}/USDT"
        
        # Usar la función existente
        df = download_single_pair(symbol, timeframe, days)
        return df
        
    except Exception as e:
        print(f"Error descargando {symbol}: {e}")
        return None
