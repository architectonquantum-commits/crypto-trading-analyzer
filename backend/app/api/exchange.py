import ccxt
from datetime import datetime
import pandas as pd
from typing import Optional, List, Dict, Any
from app.services.cache import cache

class KrakenService:
    """Servicio para interactuar con Kraken"""

    def __init__(self):
        self.exchange = ccxt.kraken({
            'enableRateLimit': True,
            'options': {'defaultType': 'spot'}
        })

    def get_ohlcv(
        self, 
        symbol: str, 
        timeframe: str = '1h', 
        limit: int = 500
    ) -> pd.DataFrame:
        """
        Obtener datos OHLCV de Kraken

        Args:
            symbol: Par de trading (ej: 'BTC/USDT')
            timeframe: Temporalidad ('1m', '5m', '15m', '1h', '4h', '1d')
            limit: Cantidad de velas
        """
        # Verificar cache
        cache_key = f"ohlcv:{symbol}:{timeframe}:{limit}"
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return pd.DataFrame(cached_data)

        # Obtener datos de Kraken
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)

            df = pd.DataFrame(
                ohlcv,
                columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
            )

            # Convertir timestamp a datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')

            # Guardar en cache (5 minutos)
            cache.set(cache_key, df.to_dict('records'), ttl=300)

            return df

        except Exception as e:
            raise Exception(f"Error obteniendo datos de Kraken: {str(e)}")

    def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Obtener precio actual"""
        cache_key = f"ticker:{symbol}"
        cached = cache.get(cache_key)

        if cached:
            return cached

        try:
            ticker = self.exchange.fetch_ticker(symbol)
            data = {
                'symbol': symbol,
                'last': ticker['last'],
                'bid': ticker['bid'],
                'ask': ticker['ask'],
                'volume': ticker['quoteVolume'],
                'change_24h': ticker['percentage']
            }
            cache.set(cache_key, data, ttl=10)  # 10 segundos
            return data
        except Exception as e:
            raise Exception(f"Error obteniendo ticker: {str(e)}")

    def get_available_symbols(self) -> List[str]:
        """Obtener lista de símbolos disponibles (USDT pairs)"""
        cache_key = "available_symbols"
        cached = cache.get(cache_key)

        if cached:
            return cached

        try:
            markets = self.exchange.load_markets()
            symbols = [
                symbol for symbol in markets.keys()
                if '/USDT' in symbol and markets[symbol]['active']
            ]
            # Top cryptos por defecto
            default_symbols = [
                'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT',
                'ADA/USDT', 'XRP/USDT', 'DOGE/USDT', 'MATIC/USDT',
                'DOT/USDT', 'AVAX/USDT', 'LINK/USDT', 'UNI/USDT',
                'ATOM/USDT', 'LTC/USDT', 'BCH/USDT', 'ALGO/USDT',
                'VET/USDT', 'FIL/USDT', 'AAVE/USDT', 'SAND/USDT'
            ]

            result = [s for s in default_symbols if s in symbols]
            cache.set(cache_key, result, ttl=3600)  # 1 hora
            return result

        except Exception as e:
            raise Exception(f"Error obteniendo símbolos: {str(e)}")

# Instancia global
exchange_service = KrakenService()