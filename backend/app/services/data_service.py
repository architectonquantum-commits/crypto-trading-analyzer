import pandas as pd
import ccxt
from datetime import datetime, timedelta
from pathlib import Path
import logging
from app.services.crypto_compare_fetcher import fetch_historical_data_crypto_compare

logger = logging.getLogger(__name__)

class DataService:
    """Gestor inteligente de datos con auto-actualización"""
    
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        # self.exchange = ccxt.binance()  # No usado, se usa CryptoCompare
        
        # Política de caché
        self.cache_hours = 24  # Actualizar cada 24h
        
    def get_data(self, symbol: str, timeframe: str, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Obtiene datos con auto-actualización inteligente
        
        Lógica:
        1. Verifica si existe archivo
        2. Verifica si está actualizado
        3. Descarga si es necesario
        4. Retorna DataFrame listo
        """
        # Normalizar símbolo
        symbol_file = symbol.replace("/", "_")
        file_path = self.data_dir / f"{symbol_file}_{timeframe}_REAL.csv"
        
        # Verificar si necesita actualización
        needs_update = self._needs_update(file_path)
        
        if needs_update:
            logger.info(f"📥 Descargando datos frescos: {symbol} {timeframe}")
            df = self._download_data(symbol, timeframe, start_date, end_date)
            
            if df is not None and not df.empty:
                # Guardar con timestamp
                df.to_csv(file_path, index=False)
                logger.info(f"✅ Guardado: {file_path} ({len(df)} velas)")
                return df
            else:
                logger.error(f"❌ Error descargando {symbol}")
                return None
        else:
            # Usar caché
            logger.info(f"📂 Usando caché: {symbol} {timeframe}")
            df = pd.read_csv(file_path)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Filtrar por rango de fechas solicitado
            df = self._filter_date_range(df, start_date, end_date)
            return df
    
    def _needs_update(self, file_path: Path) -> bool:
        """Determina si el archivo necesita actualización"""
        if not file_path.exists():
            logger.info(f"📄 Archivo no existe: {file_path.name}")
            return True
        
        # Verificar edad del archivo
        mod_time = datetime.fromtimestamp(file_path.stat().st_mtime)
        age_hours = (datetime.now() - mod_time).total_seconds() / 3600
        
        if age_hours > self.cache_hours:
            logger.info(f"⏰ Archivo antiguo ({age_hours:.1f}h): {file_path.name}")
            return True
        
        logger.info(f"✅ Archivo reciente ({age_hours:.1f}h): {file_path.name}")
        return False
    
    def _download_data(self, symbol: str, timeframe: str, start_date: str, end_date: str) -> pd.DataFrame:
        """Descarga datos usando CCXT SYNC (sin event loop issues)"""
        try:
            logger.info(f"📡 Descargando con CCXT: {symbol}")
            
            # Convertir fechas
            start = pd.to_datetime(start_date)
            end = pd.to_datetime(end_date)
            
            # Importar MarketDataFetcher
            from app.utils.market_data import MarketDataFetcher
            
            # Crear fetcher
            fetcher = MarketDataFetcher()
            
            # Usar método SYNC (sin async, sin event loop)
            df = fetcher.get_historical_ohlcv_range_sync(
                symbol=symbol,
                timeframe=timeframe,
                start_date=start,
                end_date=end
            )
            
            if df is None or df.empty:
                logger.error(f"❌ CCXT no retornó datos para {symbol}")
                return None
            
            logger.info(f"✅ Descargadas {len(df)} velas desde CCXT")
            return df
            
        except Exception as e:
            logger.error(f"❌ Error en descarga CCXT: {e}")
            import traceback
            traceback.print_exc()
            return None
        mask = (df['timestamp'] >= start) & (df['timestamp'] <= end)
        filtered = df[mask].copy()
        
        logger.info(f"📊 Filtrado: {len(filtered)} velas en rango")
        return filtered
    
    def _filter_date_range(self, df, start_date: str, end_date: str):
        """Filtra DataFrame por rango de fechas"""
        import pandas as pd
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        
        mask = (df["timestamp"] >= start) & (df["timestamp"] <= end)
        filtered = df[mask].copy()
        
        logger.info(f"📊 Filtrado: {len(filtered)} velas en rango")
        return filtered

    def force_refresh(self, symbol: str, timeframe: str):
        """Fuerza actualización eliminando caché"""
        symbol_file = symbol.replace("/", "_")
        file_path = self.data_dir / f"{symbol_file}_{timeframe}_REAL.csv"
        
        if file_path.exists():
            file_path.unlink()
            logger.info(f"🗑️ Caché eliminado: {file_path.name}")

# Instancia global
data_service = DataService()
