from binance.client import Client
from binance.exceptions import BinanceAPIException
from ..config import config
import logging

logger = logging.getLogger(__name__)

class BinanceService:
    def __init__(self):
        try:
            if config.BINANCE_API_KEY and config.BINANCE_API_SECRET:
                self.client = Client(config.BINANCE_API_KEY, config.BINANCE_API_SECRET)
            else:
                self.client = Client("", "")
            logger.info("Cliente de Binance inicializado correctamente")
        except Exception as e:
            logger.error(f"Error al inicializar cliente de Binance: {e}")
            self.client = Client("", "")
    
    def get_klines(self, symbol: str, interval: str = "1h", limit: int = 500):
        """Obtiene datos de velas (klines) de Binance"""
        try:
            klines = self.client.get_klines(
                symbol=symbol,
                interval=interval,
                limit=limit
            )
            return klines
        except BinanceAPIException as e:
            logger.error(f"Error de API de Binance para {symbol}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error al obtener klines para {symbol}: {e}")
            return None
    
    def get_ticker_price(self, symbol: str):
        """Obtiene el precio actual de un símbolo"""
        try:
            ticker = self.client.get_symbol_ticker(symbol=symbol)
            return float(ticker['price'])
        except Exception as e:
            logger.error(f"Error al obtener precio de {symbol}: {e}")
            return None
    
    def get_24h_ticker(self, symbol: str):
        """Obtiene estadísticas de 24 horas de un símbolo"""
        try:
            ticker = self.client.get_ticker(symbol=symbol)
            return {
                'symbol': ticker['symbol'],
                'price': float(ticker['lastPrice']),
                'change_24h': float(ticker['priceChangePercent']),
                'high_24h': float(ticker['highPrice']),
                'low_24h': float(ticker['lowPrice']),
                'volume_24h': float(ticker['volume'])
            }
        except Exception as e:
            logger.error(f"Error al obtener ticker 24h de {symbol}: {e}")
            return None

binance_service = BinanceService()
