# backend/app/utils/market_data.py

import ccxt
import pandas as pd
from app.config.crypto_config import get_exchange_for_crypto


class MarketDataFetcher:
    def __init__(self):
        """Inicializa fetcher con múltiples exchanges"""
        self.exchanges = {
            "kraken": ccxt.kraken({'enableRateLimit': True}),
            "binance": ccxt.binance({'enableRateLimit': True})
        }

    def _get_exchange(self, symbol: str):
        """Obtiene el exchange correcto para un símbolo"""
        exchange_name = get_exchange_for_crypto(symbol)
        return self.exchanges[exchange_name]

    async def get_ohlcv(self, symbol: str, timeframe: str = '1h', limit: int = 500):
        """Obtiene datos OHLCV del exchange correcto"""
        try:
            exchange = self._get_exchange(symbol)
            ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            raise Exception(f"Error obteniendo datos: {str(e)}")

    async def get_current_price(self, symbol: str):
        """Obtiene precio actual del exchange correcto"""
        try:
            exchange = self._get_exchange(symbol)
            ticker = exchange.fetch_ticker(symbol)
            return ticker['last']
        except Exception as e:
            raise Exception(f"Error obteniendo precio: {str(e)}")