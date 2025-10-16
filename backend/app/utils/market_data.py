# backend/app/utils/market_data.py
import ccxt
import pandas as pd
import logging
from app.config.crypto_config import get_exchange_for_crypto

logger = logging.getLogger(__name__)

class MarketDataFetcher:
    def __init__(self):
        """Inicializa fetcher con múltiples exchanges"""
        self.exchanges = {
            "kraken": ccxt.kraken({'enableRateLimit': True}),
            "binance": ccxt.binance({'enableRateLimit': True}),
            "coinex": ccxt.coinex({'enableRateLimit': True})
        }
        logger.info(f"✅ Exchanges inicializados: {list(self.exchanges.keys())}")
    
    def _get_exchange(self, symbol: str):
        """Obtiene el exchange correcto para un símbolo"""
        exchange_name = get_exchange_for_crypto(symbol)
        logger.debug(f"   Exchange para {symbol}: {exchange_name}")
        return self.exchanges[exchange_name]
    
    async def get_ohlcv(self, symbol: str, timeframe: str = '1h', limit: int = 500):
        """Obtiene datos OHLCV del exchange correcto"""
        exchange_name = get_exchange_for_crypto(symbol)
        try:
            logger.debug(f"   Fetching OHLCV: {symbol} from {exchange_name}")
            exchange = self._get_exchange(symbol)
            ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            logger.debug(f"   ✓ Obtenidos {len(df)} candles para {symbol}")
            return df
        except Exception as e:
            logger.error(f"   ❌ Error obteniendo OHLCV de {symbol} ({exchange_name}): {str(e)}")
            raise Exception(f"Error obteniendo datos de {symbol} en {exchange_name}: {str(e)}")
    
    async def get_current_price(self, symbol: str):
        """Obtiene precio actual del exchange correcto"""
        exchange_name = get_exchange_for_crypto(symbol)
        try:
            logger.debug(f"   Fetching precio: {symbol} from {exchange_name}")
            exchange = self._get_exchange(symbol)
            ticker = exchange.fetch_ticker(symbol)
            price = ticker['last']
            logger.debug(f"   ✓ Precio {symbol}: ${price}")
            return price
        except Exception as e:
            logger.error(f"   ❌ Error obteniendo precio de {symbol} ({exchange_name}): {str(e)}")
            raise Exception(f"Error obteniendo precio de {symbol} en {exchange_name}: {str(e)}")
