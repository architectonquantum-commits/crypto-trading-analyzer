import pandas as pd
import numpy as np
import pandas_ta as ta

class TechnicalAnalyzer:
    def __init__(self, df):
        self.df = df.copy()
        self.df.columns = [c.lower() for c in self.df.columns]
        
    def calculate_all_indicators(self):
        """Calcula todos los indicadores técnicos"""
        self.calculate_rsi()
        self.calculate_adx()
        self.calculate_smas()
        self.calculate_emas()
        self.calculate_obv()
        self.detect_candlestick_patterns()
        self.detect_order_blocks()
        self.detect_fvg()
        self.calculate_support_resistance()
        return self.df
    
    def calculate_rsi(self, period=14):
        """Calcula el RSI (Relative Strength Index)"""
        self.df['rsi'] = ta.rsi(self.df['close'], length=period)
        return self.df['rsi']
    
    def calculate_adx(self, period=14):
        """Calcula el ADX (Average Directional Index)"""
        adx_df = ta.adx(self.df['high'], self.df['low'], self.df['close'], length=period)
        if adx_df is not None and not adx_df.empty:
            self.df['adx'] = adx_df[f'ADX_{period}']
        else:
            self.df['adx'] = np.nan
        return self.df['adx']
    
    def calculate_smas(self):
        """Calcula las SMAs (Simple Moving Averages)"""
        self.df['sma_20'] = ta.sma(self.df['close'], length=20)
        self.df['sma_50'] = ta.sma(self.df['close'], length=50)
        self.df['sma_200'] = ta.sma(self.df['close'], length=200)
        return self.df[['sma_20', 'sma_50', 'sma_200']]
    
    def calculate_emas(self):
        """Calcula las EMAs (Exponential Moving Averages)"""
        self.df['ema_12'] = ta.ema(self.df['close'], length=12)
        self.df['ema_26'] = ta.ema(self.df['close'], length=26)
        self.df['ema_50'] = ta.ema(self.df['close'], length=50)
        self.df['ema_200'] = ta.ema(self.df['close'], length=200)
        return self.df[['ema_12', 'ema_26', 'ema_50', 'ema_200']]
    
    def calculate_obv(self):
        """Calcula el OBV (On Balance Volume)"""
        self.df['obv'] = ta.obv(self.df['close'], self.df['volume'])
        return self.df['obv']
    
    def detect_candlestick_patterns(self):
        """Detecta patrones de velas japonesas"""
        patterns = []
        
        for i in range(2, len(self.df)):
            pattern = self._identify_pattern(i)
            patterns.append(pattern)
        
        self.df['patron_velas'] = [None, None] + patterns
        return self.df['patron_velas']
    
    def _identify_pattern(self, idx):
        """Identifica patrones específicos de velas"""
        if idx < 2:
            return None
            
        current = self.df.iloc[idx]
        prev = self.df.iloc[idx-1]
        prev2 = self.df.iloc[idx-2]
        
        open_c = current['open']
        close_c = current['close']
        high_c = current['high']
        low_c = current['low']
        
        open_p = prev['open']
        close_p = prev['close']
        high_p = prev['high']
        low_p = prev['low']
        
        body_c = abs(close_c - open_c)
        body_p = abs(close_p - open_p)
        
        if body_c < 0.0001 or body_p < 0.0001:
            return None
        
        # Envolvente alcista
        if (close_p < open_p and close_c > open_c and 
            open_c < close_p and close_c > open_p and body_c > body_p):
            return "envolvente_alcista"
        
        # Envolvente bajista
        if (close_p > open_p and close_c < open_c and 
            open_c > close_p and close_c < open_p and body_c > body_p):
            return "envolvente_bajista"
        
        # Martillo
        lower_shadow = min(open_c, close_c) - low_c
        upper_shadow = high_c - max(open_c, close_c)
        if lower_shadow > 2 * body_c and upper_shadow < body_c * 0.3:
            return "martillo"
        
        # Doji
        if body_c / ((high_c - low_c) + 0.0001) < 0.1:
            return "doji"
        
        # Estrella de la mañana (3 velas)
        if idx >= 2:
            open_p2 = prev2['open']
            close_p2 = prev2['close']
            body_p2 = abs(close_p2 - open_p2)
            
            if (close_p2 < open_p2 and body_p < body_p2 * 0.3 and 
                close_c > open_c and close_c > (open_p2 + close_p2) / 2):
                return "estrella_manana"
        
        return None
    
    def detect_order_blocks(self, lookback=20):
        """Detecta Order Blocks usando conceptos de Smart Money"""
        order_blocks = []
        
        for i in range(lookback, len(self.df)):
            ob = self._find_order_block(i, lookback)
            order_blocks.append(ob)
        
        self.df['order_block'] = [None] * lookback + order_blocks
        return self.df['order_block']
    
    def _find_order_block(self, idx, lookback):
        """Identifica Order Blocks alcistas o bajistas"""
        if idx < lookback + 3:
            return None
        
        current = self.df.iloc[idx]
        recent = self.df.iloc[idx-lookback:idx]
        
        # Order Block alcista: última vela bajista antes de movimiento alcista fuerte
        if current['close'] > current['open']:
            bearish_candles = recent[recent['close'] < recent['open']]
            if len(bearish_candles) > 0:
                last_bearish = bearish_candles.iloc[-1]
                if current['close'] > last_bearish['high'] * 1.02:
                    return f"OB_alcista_{last_bearish['low']:.2f}"
        
        # Order Block bajista: última vela alcista antes de movimiento bajista fuerte
        if current['close'] < current['open']:
            bullish_candles = recent[recent['close'] > recent['open']]
            if len(bullish_candles) > 0:
                last_bullish = bullish_candles.iloc[-1]
                if current['close'] < last_bullish['low'] * 0.98:
                    return f"OB_bajista_{last_bullish['high']:.2f}"
        
        return None
    
    def detect_fvg(self, min_gap_pct=0.2):
        """Detecta Fair Value Gaps (FVG)"""
        fvgs = []
        
        for i in range(2, len(self.df)):
            fvg = self._find_fvg(i, min_gap_pct)
            fvgs.append(fvg)
        
        self.df['fvg'] = [None, None] + fvgs
        return self.df['fvg']
    
    def _find_fvg(self, idx, min_gap_pct):
        """Identifica Fair Value Gaps"""
        if idx < 2:
            return None
        
        prev2 = self.df.iloc[idx-2]
        prev1 = self.df.iloc[idx-1]
        current = self.df.iloc[idx]
        
        # FVG alcista: gap entre high de prev2 y low de current
        if prev2['high'] < current['low']:
            gap = current['low'] - prev2['high']
            if gap / prev2['high'] * 100 >= min_gap_pct:
                return f"FVG_alcista_{prev2['high']:.2f}-{current['low']:.2f}"
        
        # FVG bajista: gap entre low de prev2 y high de current
        if prev2['low'] > current['high']:
            gap = prev2['low'] - current['high']
            if gap / prev2['low'] * 100 >= min_gap_pct:
                return f"FVG_bajista_{current['high']:.2f}-{prev2['low']:.2f}"
        
        return None
    
    def calculate_support_resistance(self, window=20, num_touches=3):
        """Calcula niveles de soporte y resistencia"""
        supports = []
        resistances = []
        
        for i in range(window, len(self.df)):
            support, resistance = self._find_sr_levels(i, window, num_touches)
            supports.append(support)
            resistances.append(resistance)
        
        self.df['soporte'] = [None] * window + supports
        self.df['resistencia'] = [None] * window + resistances
        
        return self.df[['soporte', 'resistencia']]
    
    def _find_sr_levels(self, idx, window, num_touches):
        """Encuentra niveles de soporte y resistencia por clusters de precios"""
        if idx < window:
            return None, None
        
        recent = self.df.iloc[idx-window:idx]
        
        lows = recent['low'].values
        highs = recent['high'].values
        
        # Soporte: clustering de mínimos
        support = self._find_price_cluster(lows, num_touches)
        
        # Resistencia: clustering de máximos
        resistance = self._find_price_cluster(highs, num_touches)
        
        return support, resistance
    
    def _find_price_cluster(self, prices, min_touches, tolerance=0.005):
        """Encuentra clusters de precios (niveles donde el precio toca múltiples veces)"""
        if len(prices) == 0:
            return None
        
        unique_prices = np.unique(prices)
        best_cluster = None
        max_touches = 0
        
        for price in unique_prices:
            touches = sum(1 for p in prices if abs(p - price) / price <= tolerance)
            if touches >= min_touches and touches > max_touches:
                max_touches = touches
                best_cluster = price
        
        return best_cluster if best_cluster else np.mean(prices)

def analyze_pair(klines_data):
    """Analiza un par de trading y devuelve todos los indicadores"""
    if not klines_data or len(klines_data) < 200:
        return None
    
    df = pd.DataFrame(klines_data, columns=[
        'timestamp', 'open', 'high', 'low', 'close', 'volume',
        'close_time', 'quote_volume', 'trades', 'taker_buy_base',
        'taker_buy_quote', 'ignore'
    ])
    
    df['open'] = df['open'].astype(float)
    df['high'] = df['high'].astype(float)
    df['low'] = df['low'].astype(float)
    df['close'] = df['close'].astype(float)
    df['volume'] = df['volume'].astype(float)
    
    analyzer = TechnicalAnalyzer(df)
    analyzed_df = analyzer.calculate_all_indicators()
    
    latest = analyzed_df.iloc[-1]
    
    return {
        'precio': float(latest['close']),
        'rsi': float(latest['rsi']) if not pd.isna(latest['rsi']) else None,
        'adx': float(latest['adx']) if not pd.isna(latest['adx']) else None,
        'sma_20': float(latest['sma_20']) if not pd.isna(latest['sma_20']) else None,
        'sma_50': float(latest['sma_50']) if not pd.isna(latest['sma_50']) else None,
        'sma_200': float(latest['sma_200']) if not pd.isna(latest['sma_200']) else None,
        'ema_12': float(latest['ema_12']) if not pd.isna(latest['ema_12']) else None,
        'ema_26': float(latest['ema_26']) if not pd.isna(latest['ema_26']) else None,
        'ema_50': float(latest['ema_50']) if not pd.isna(latest['ema_50']) else None,
        'ema_200': float(latest['ema_200']) if not pd.isna(latest['ema_200']) else None,
        'volumen': float(latest['volume']),
        'obv': float(latest['obv']) if not pd.isna(latest['obv']) else None,
        'patron_velas': latest['patron_velas'] if latest['patron_velas'] else None,
        'order_block': latest['order_block'] if latest['order_block'] else None,
        'fvg': latest['fvg'] if latest['fvg'] else None,
        'soporte': float(latest['soporte']) if not pd.isna(latest['soporte']) else None,
        'resistencia': float(latest['resistencia']) if not pd.isna(latest['resistencia']) else None,
        'historico': analyzed_df[['timestamp', 'open', 'high', 'low', 'close', 'volume']].tail(100).to_dict('records')
    }
