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
        """Descarga datos usando CryptoCompare (sin restricciones geo)"""
        try:
            logger.info(f"📡 Descargando con CryptoCompare: {symbol}")
            
            # Calcular días entre fechas
            start = pd.to_datetime(start_date)
            end = pd.to_datetime(end_date)
            days = (end - start).days
            
            # Extraer símbolo base (BTC/USDT -> BTC)
            base_symbol = symbol.split('/')[0]
            
            # Usar fetcher de CryptoCompare
            df = fetch_historical_data_crypto_compare(
                symbol=base_symbol,
                days=min(days, 365),  # Max 1 año
                timeframe=timeframe
            )
            
            if df is None or df.empty:
                logger.error(f"❌ CryptoCompare no retornó datos para {symbol}")
                return None
            
            # Filtrar por rango de fechas
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            mask = (df['timestamp'] >= start) & (df['timestamp'] <= end)
            df = df[mask]
            
            logger.info(f"✅ Descargadas {len(df)} velas de CryptoCompare")
            return df
            
        except Exception as e:
            logger.error(f"❌ Error en descarga CryptoCompare: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _filter_date_range(self, df: pd.DataFrame, start_date: str, end_date: str) -> pd.DataFrame:
        """Filtra DataFrame por rango de fechas"""
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        
        mask = (df['timestamp'] >= start) & (df['timestamp'] <= end)
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
