"""
Descargador Profesional de Datos Históricos
Fuentes: Bybit → CryptoCompare → yfinance (fallback)
"""
import ccxt
import pandas as pd
import requests
from datetime import datetime, timedelta
import time

class ProfessionalDataDownloader:
    """Descarga datos históricos de múltiples fuentes con validación."""
    
    def __init__(self):
        self.sources = ['bybit', 'cryptocompare', 'yfinance']
        self.current_source = None
    
    def download_bybit(self, symbol, timeframe, days_back):
        """Intenta descargar desde Bybit (sin restricciones geo)."""
        print(f"📊 Intentando Bybit...")
        
        try:
            exchange = ccxt.bybit({
                'enableRateLimit': True,
                'timeout': 30000
            })
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            since = int(start_date.timestamp() * 1000)
            
            all_data = []
            
            while since < int(end_date.timestamp() * 1000):
                ohlcv = exchange.fetch_ohlcv(
                    symbol,
                    timeframe,
                    since=since,
                    limit=1000
                )
                
                if not ohlcv:
                    break
                
                all_data.extend(ohlcv)
                since = ohlcv[-1][0] + 1
                time.sleep(exchange.rateLimit / 1000)
            
            if len(all_data) > 0:
                print(f"✅ Bybit: {len(all_data)} velas descargadas")
                self.current_source = 'bybit'
                return self._to_dataframe(all_data)
            
        except Exception as e:
            print(f"❌ Bybit falló: {e}")
        
        return None
    
    def download_cryptocompare(self, symbol, timeframe, days_back):
        """Descarga desde CryptoCompare (gratis, sin restricciones)."""
        print(f"📊 Intentando CryptoCompare...")
        
        try:
            # Mapeo de símbolos
            fsym = symbol.split('/')[0]  # BTC
            tsym = symbol.split('/')[1]  # USDT
            
            # Mapeo de timeframe
            tf_map = {
                '1h': {'endpoint': 'histohour', 'limit': 2000},
                '4h': {'endpoint': 'histohour', 'limit': 2000},
                '1d': {'endpoint': 'histoday', 'limit': 2000}
            }
            
            tf_config = tf_map.get(timeframe, tf_map['1h'])
            
            url = f"https://min-api.cryptocompare.com/data/v2/{tf_config['endpoint']}"
            params = {
                'fsym': fsym,
                'tsym': tsym,
                'limit': min(days_back * 24, tf_config['limit']),
                'toTs': int(datetime.now().timestamp())
            }
            
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if data['Response'] == 'Success':
                    ohlcv_data = []
                    
                    for candle in data['Data']['Data']:
                        ohlcv_data.append([
                            candle['time'] * 1000,
                            candle['open'],
                            candle['high'],
                            candle['low'],
                            candle['close'],
                            candle['volumefrom']
                        ])
                    
                    print(f"✅ CryptoCompare: {len(ohlcv_data)} velas descargadas")
                    self.current_source = 'cryptocompare'
                    return self._to_dataframe(ohlcv_data)
            
        except Exception as e:
            print(f"❌ CryptoCompare falló: {e}")
        
        return None
    
    def download_yfinance(self, symbol, timeframe, days_back):
        """Fallback: yfinance (para algunos pares crypto)."""
        print(f"📊 Intentando yfinance...")
        
        try:
            import yfinance as yf
            
            # Mapeo de símbolos
            ticker_map = {
                'BTC/USDT': 'BTC-USD',
                'ETH/USDT': 'ETH-USD',
                'SOL/USDT': 'SOL-USD',
                'LINK/USDT': 'LINK-USD'
            }
            
            ticker = ticker_map.get(symbol)
            
            if not ticker:
                return None
            
            # Mapeo de timeframe
            interval_map = {
                '1h': '1h',
                '4h': '4h',
                '1d': '1d'
            }
            
            interval = interval_map.get(timeframe, '1h')
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            df = yf.download(
                ticker,
                start=start_date,
                end=end_date,
                interval=interval,
                progress=False
            )
            
            if len(df) > 0:
                ohlcv_data = []
                for idx, row in df.iterrows():
                    ohlcv_data.append([
                        int(idx.timestamp() * 1000),
                        row['Open'],
                        row['High'],
                        row['Low'],
                        row['Close'],
                        row['Volume']
                    ])
                
                print(f"✅ yfinance: {len(ohlcv_data)} velas descargadas")
                self.current_source = 'yfinance'
                return self._to_dataframe(ohlcv_data)
        
        except Exception as e:
            print(f"❌ yfinance falló: {e}")
        
        return None
    
    def _to_dataframe(self, ohlcv_data):
        """Convierte a DataFrame con validación."""
        df = pd.DataFrame(
            ohlcv_data,
            columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
        )
        
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df = df.drop_duplicates(subset=['timestamp'])
        df = df.sort_values('timestamp')
        
        # Validación de calidad
        print(f"\n🔍 Validación de datos:")
        print(f"  - Velas: {len(df)}")
        print(f"  - Rango: {df['timestamp'].min()} a {df['timestamp'].max()}")
        print(f"  - Precio min: ${df['close'].min():.2f}")
        print(f"  - Precio max: ${df['close'].max():.2f}")
        print(f"  - Valores nulos: {df.isnull().sum().sum()}")
        
        # Detectar gaps sospechosos
        time_diffs = df['timestamp'].diff()
        large_gaps = time_diffs[time_diffs > pd.Timedelta(hours=2)].count()
        print(f"  - Gaps grandes (>2h): {large_gaps}")
        
        return df
    
    def download_with_fallback(self, symbol, timeframe, days_back=730):
        """Intenta todas las fuentes hasta que una funcione."""
        print(f"\n{'='*60}")
        print(f"📥 DESCARGANDO: {symbol} {timeframe} ({days_back} días)")
        print(f"{'='*60}\n")
        
        # Intentar Bybit primero
        df = self.download_bybit(symbol, timeframe, days_back)
        if df is not None:
            return df, 'bybit'
        
        # Intentar CryptoCompare
        df = self.download_cryptocompare(symbol, timeframe, days_back)
        if df is not None:
            return df, 'cryptocompare'
        
        # Intentar yfinance
        df = self.download_yfinance(symbol, timeframe, days_back)
        if df is not None:
            return df, 'yfinance'
        
        print(f"\n❌ TODAS LAS FUENTES FALLARON para {symbol}")
        return None, None


if __name__ == "__main__":
    downloader = ProfessionalDataDownloader()
    
    # Pares principales
    pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'LINK/USDT']
    timeframes = ['1h', '4h', '1d']
    
    results = {}
    
    for pair in pairs:
        for tf in timeframes:
            df, source = downloader.download_with_fallback(pair, tf, days_back=730)
            
            if df is not None:
                # Guardar
                filename = f"data/historical/{pair.replace('/', '_')}_{tf}_730d_REAL.csv"
                df.to_csv(filename, index=False)
                
                results[f"{pair}_{tf}"] = {
                    'source': source,
                    'candles': len(df),
                    'filename': filename
                }
                
                print(f"✅ Guardado: {filename}\n")
            else:
                results[f"{pair}_{tf}"] = {'source': 'FAILED'}
            
            time.sleep(2)  # Rate limiting
    
    # Resumen
    print(f"\n{'='*60}")
    print("📊 RESUMEN DE DESCARGA")
    print(f"{'='*60}\n")
    
    for key, info in results.items():
        status = "✅" if info['source'] != 'FAILED' else "❌"
        print(f"{status} {key}: {info.get('source', 'FAILED')} - {info.get('candles', 0)} velas")
