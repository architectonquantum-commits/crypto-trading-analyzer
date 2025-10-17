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
            "kucoin": ccxt.kucoin({'enableRateLimit': True}),
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

    async def get_historical_ohlcv_range(self, symbol: str, timeframe: str, start_date, end_date):
        """Obtiene datos históricos en un rango de fechas para backtesting"""
        import asyncio
        from datetime import datetime
    
        exchange_name = get_exchange_for_crypto(symbol)
        exchange = self.exchanges.get(exchange_name)
    
        if not exchange:
            raise Exception(f"Exchange {exchange_name} no disponible")
    
        since = int(start_date.timestamp() * 1000)
        end_ts = int(end_date.timestamp() * 1000)
    
        logger.info(f"📡 Descargando históricos: {symbol}")
    
        all_data = []
        current_since = since
    
        while current_since < end_ts:
            try:
                await asyncio.sleep(0.6 if exchange_name == "kraken" else 0.3)
    
                ohlcv = exchange.fetch_ohlcv(symbol, timeframe, since=current_since, limit=1000)
    
                if not ohlcv:
                    break
    
                all_data.extend(ohlcv)
                last_ts = ohlcv[-1][0]
    
                if last_ts == current_since or len(ohlcv) < 1000:
                    break
    
                current_since = last_ts + 1
    
            except Exception as e:
                logger.error(f"❌ Error: {e}")
                break
    
        if not all_data:
            raise Exception(f"No se pudieron obtener datos para {symbol}")
    
        df = pd.DataFrame(all_data, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    
        mask = (df['timestamp'] >= start_date) & (df['timestamp'] <= end_date)
        df = df[mask].copy()
    
        logger.info(f"✅ {len(df)} velas descargadas")
        return df
