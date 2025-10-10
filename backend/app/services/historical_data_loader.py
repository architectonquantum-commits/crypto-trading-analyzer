"""
Carga datos históricos desde CSV con auto-descarga si no existen.
"""

from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import pandas as pd

class HistoricalDataLoader:
    """Carga datos históricos con descarga automática."""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.cache = {}
    
    def load_data(
        self,
        symbol: str,
        timeframe: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> pd.DataFrame:
        """
        Carga datos históricos desde CSV.
        Si no existe, descarga automáticamente desde CryptoCompare.
        """
        
        # Buscar archivo (priorizar REALES)
        symbol_file = symbol.replace('/', '_')
        pattern_real = f"{symbol_file}_{timeframe}_*_REAL.csv"
        pattern_synth = f"{symbol_file}_{timeframe}_*.csv"
        
        # Intentar primero datos REALES
        files = list(self.data_dir.glob(pattern_real))
        
        if not files:
            # Intentar datos sintéticos
            files = [f for f in self.data_dir.glob(pattern_synth) if '_REAL' not in f.name]
        
        if not files:
            # NO EXISTE → Auto-descargar
            print(f"⚠️ No se encontró CSV para {symbol} {timeframe}")
            print(f"📥 Descargando automáticamente desde CryptoCompare...")
            
            try:
                df = self._auto_download(symbol, timeframe, start_date, end_date)
                if df is not None and len(df) > 0:
                    return df
            except Exception as e:
                print(f"❌ Error en auto-descarga: {e}")
            
            raise FileNotFoundError(f"No se pudo obtener datos para {symbol} {timeframe}")
        
        # Cargar archivo existente
        file_path = files[0]
        print(f"✅ Usando datos REALES para {symbol} {timeframe}")
        print(f"📂 Cargando: {file_path.name}")
        
        df = pd.read_csv(file_path)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Filtrar por fechas
        if start_date:
            df = df[df['timestamp'] >= start_date]
        if end_date:
            df = df[df['timestamp'] <= end_date]
        
        print(f"✅ {len(df)} velas | {df['timestamp'].min()} a {df['timestamp'].max()}")
        
        return df
    
    def _auto_download(
        self,
        symbol: str,
        timeframe: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> pd.DataFrame:
        """
        Descarga datos automáticamente desde CryptoCompare.
        Guarda el CSV para uso futuro.
        """
        
        # Import aquí para evitar dependencias circulares
        from app.services.data_service import DataService
        
        # Fechas por defecto (últimos 730 días)
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=730)
        
        # Convertir a strings (formato que espera DataService)
        start_str = start_date.strftime('%Y-%m-%d')
        end_str = end_date.strftime('%Y-%m-%d')
        
        # Descargar usando DataService
        service = DataService()
        df = service.get_data(
            symbol=symbol,
            timeframe=timeframe,
            start_date=start_str,
            end_date=end_str
        )
        
        if df is None or len(df) == 0:
            raise Exception(f"CryptoCompare no retornó datos para {symbol}")
        
        print(f"✅ Descargado y guardado automáticamente: {len(df)} velas")
        
        return df
    
    def get_available_symbols(self) -> list:
        """Retorna lista de símbolos disponibles."""
        files = list(self.data_dir.glob("*.csv"))
        symbols = set()
        for f in files:
            parts = f.stem.split('_')
            if len(parts) >= 2:
                symbol = f"{parts[0]}/{parts[1]}"
                symbols.add(symbol)
        return sorted(list(symbols))

# Singleton
_loader = None

def get_historical_loader() -> HistoricalDataLoader:
    """Obtiene instancia del loader."""
    global _loader
    if _loader is None:
        _loader = HistoricalDataLoader()
    return _loader
