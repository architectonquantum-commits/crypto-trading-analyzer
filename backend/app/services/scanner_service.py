# backend/app/services/scanner_service.py
from typing import Dict, Any
from datetime import datetime
import pandas as pd
import numpy as np
import asyncio

from app.models.scanner import ScannerRequest, ScannerResponse, CryptoOpportunity
from app.services.modules.technical_analysis import TechnicalAnalysisModule
from app.services.modules.market_structure import MarketStructureModule
from app.services.modules.macro_analysis import MacroAnalysisModule
from app.services.modules.sentiment_analysis import SentimentAnalysisModule
from app.utils.market_data import MarketDataFetcher
from app.config.crypto_config import (
    get_all_symbols,
    get_exchange_for_crypto,
    TOTAL_CRYPTOS,
    KRAKEN_COUNT,
    BINANCE_COUNT
)

class ScannerService:
    def __init__(self):
        """Inicializa servicio de scanner con módulos de análisis"""
        self.technical_module = TechnicalAnalysisModule()
        self.structure_module = MarketStructureModule()
        self.macro_module = MacroAnalysisModule()
        self.sentiment_module = SentimentAnalysisModule()
        self.fetcher = MarketDataFetcher()
    
    def calculate_atr(self, df: pd.DataFrame, period: int = 14) -> float:
        """
        Calcula ATR (Average True Range) - Indicador de volatilidad
        
        ATR mide la volatilidad promedio del activo
        Útil para determinar SL y TP dinámicos
        """
        high = df['high']
        low = df['low']
        close = df['close']
        
        # True Range = max de:
        # 1. High - Low
        # 2. abs(High - Close anterior)
        # 3. abs(Low - Close anterior)
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean().iloc[-1]
        
        # Redondeo dinámico basado en el valor
        if atr < 0.01:
            return round(atr, 6)  # Para monedas de bajo precio
        elif atr < 1:
            return round(atr, 4)
        else:
            return round(atr, 2)
    

    def _get_precision(self, value: float) -> int:
        """Determina cuántos decimales usar según el valor"""
        if value < 0.01:
            return 6
        elif value < 1:
            return 4
        elif value < 100:
            return 2
        else:
            return 2
    
    def calculate_sl_tp(self, current_price: float, atr: float, recommendation: str) -> Dict[str, Any]:
        """
        Calcula Stop Loss y Take Profit automáticos basados en ATR
        
        Estrategia:
        - SL: 1.5 x ATR (protección contra volatilidad)
        - TP: 3.0 x ATR (ratio R:R de 2:1)
        
        Para LONG:  SL debajo del precio, TP arriba
        Para SHORT: SL arriba del precio, TP debajo
        """
        # Determinar dirección basada en recomendación
        if recommendation in ["STRONG BUY", "BUY"]:
            direction = "LONG"
            precision = self._get_precision(current_price)
            stop_loss = round(current_price - (atr * 1.5), precision)
            take_profit = round(current_price + (atr * 3.0), precision)
        elif recommendation in ["SELL", "STRONG SELL"]:
            direction = "SHORT"
            precision = self._get_precision(current_price)
            stop_loss = round(current_price + (atr * 1.5), precision)
            take_profit = round(current_price - (atr * 3.0), precision)
        else:  # HOLD
            direction = "LONG"  # Por defecto
            precision = self._get_precision(current_price)
            stop_loss = round(current_price - (atr * 1.5), precision)
            take_profit = round(current_price + (atr * 3.0), precision)
        
        return {
            "direction": direction,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "atr": atr
        }

    async def analyze_crypto(self, symbol: str, timeframe: str = "1h") -> Dict[str, Any]:
        """Analiza una criptomoneda completa con todos los módulos"""
        
        exchange_name = get_exchange_for_crypto(symbol)
        
        
        # Delay anti-rate-limit (más lento para Kraken)
        if exchange_name == "kraken":
            await asyncio.sleep(1.0)
        else:
            await asyncio.sleep(0.3)
        try:
            # Obtener datos de mercado usando el fetcher
            df = await self.fetcher.get_ohlcv(symbol, timeframe, limit=200)
            current_price = await self.fetcher.get_current_price(symbol)
            
            # Módulo 1: Análisis técnico (7 puntos)
            technical = self.technical_module.analyze(df, symbol, timeframe, current_price)
            
            # Módulo 2: Estructura de mercado (5 puntos)
            structure = self.structure_module.analyze(df, symbol, timeframe, current_price)
            
            # Módulo 4: Análisis macro (5 puntos)
            df_btc = await self.fetcher.get_ohlcv("BTC/USDT", "1d", limit=50)
            df_eth = await self.fetcher.get_ohlcv("ETH/USDT", "1d", limit=50)
            macro = self.macro_module.analyze(symbol, df, df_btc, df_eth, timeframe, current_price)
            
            # Módulo 5: Análisis de sentimiento (4 puntos)
            sentiment = self.sentiment_module.analyze(symbol, df, timeframe, current_price)
            
            # Módulo 3: Risk score neutro (2/4) - no aplica en scanner
            risk_score = 2
            
            # Calcular score total (máximo 25 puntos)
            total_score = (
                technical.total_score +
                structure.total_score +
                risk_score +
                macro.total_score +
                sentiment.total_score
            )
            
            confluence_percentage = round((total_score / 25) * 100)
            
            # Determinar recomendación
            if confluence_percentage >= 85:
                recommendation = "STRONG BUY"
            elif confluence_percentage >= 70:
                recommendation = "BUY"
            elif confluence_percentage >= 55:
                recommendation = "HOLD"
            elif confluence_percentage >= 40:
                recommendation = "SELL"
            else:
                recommendation = "STRONG SELL"
            
            # 🆕 CALCULAR ATR y SL/TP AUTOMÁTICOS
            atr = self.calculate_atr(df, period=14)
            sl_tp_data = self.calculate_sl_tp(current_price, atr, recommendation)
            
            # Generar resumen
            summary = (
                f"{symbol}: {confluence_percentage}% confluencias. "
                f"Técnico: {technical.total_score}/7, Estructura: {structure.total_score}/5, "
                f"Macro: {macro.total_score}/5"
            )
            
            return {
                "symbol": symbol,
                "current_price": current_price,
                "technical_score": technical.total_score,
                "structure_score": structure.total_score,
                "risk_score": risk_score,
                "macro_score": macro.total_score,
                "sentiment_score": sentiment.total_score,
                "total_score": total_score,
                "confluence_percentage": confluence_percentage,
                "recommendation": recommendation,
                "summary": summary,
                "exchange": exchange_name,
                # 🆕 NUEVOS CAMPOS
                "suggested_stop_loss": sl_tp_data["stop_loss"],
                "suggested_take_profit": sl_tp_data["take_profit"],
                "atr_value": sl_tp_data["atr"],
                "direction": sl_tp_data["direction"]
            }
        
        except Exception as e:
            # En caso de error, retornar estructura vacía
            return {
                "symbol": symbol,
                "current_price": 0,
                "technical_score": 0,
                "structure_score": 0,
                "risk_score": 0,
                "macro_score": 0,
                "sentiment_score": 0,
                "total_score": 0,
                "confluence_percentage": 0,
                "recommendation": "ERROR",
                "summary": f"Error: {str(e)}",
                "exchange": exchange_name,
                "suggested_stop_loss": None,
                "suggested_take_profit": None,
                "atr_value": None,
                "direction": None
            }
    

    def apply_advanced_filters(
        self, 
        opportunities: list, 
        request
    ) -> list:
        """
        Aplica filtros avanzados a las oportunidades detectadas
        
        Filtros:
        - direction_filter: Filtra LONG o SHORT
        - exchange_filter: Filtra por exchange (kraken/binance)
        
        Returns:
            Lista filtrada de oportunidades
        """
        filtered = opportunities
        filters_info = {}
        
        # 🔹 FILTRO 1: Dirección (LONG/SHORT)
        if request.direction_filter:
            direction_upper = request.direction_filter.upper()
            filtered = [
                opp for opp in filtered 
                if opp.direction and opp.direction.upper() == direction_upper
            ]
            filters_info['direction'] = direction_upper
            print(f"   🔹 Filtro dirección '{direction_upper}': {len(filtered)} resultados")
        
        # 🔹 FILTRO 2: Exchange (kraken/binance)
        if request.exchange_filter:
            exchanges_lower = [ex.lower() for ex in request.exchange_filter]
            filtered = [
                opp for opp in filtered 
                if opp.exchange.lower() in exchanges_lower
            ]
            filters_info['exchanges'] = exchanges_lower
            print(f"   🔹 Filtro exchanges {exchanges_lower}: {len(filtered)} resultados")
        
        return filtered, filters_info
    
    async def scan_all_cryptos(self, request: ScannerRequest) -> ScannerResponse:
        """Escanea todas las criptomonedas configuradas"""
        
        # Obtener lista de símbolos
        # Usar símbolos personalizados o todos por defecto
        symbols = request.symbols if request.symbols else get_all_symbols()
        
        # Validar máximo 5 símbolos personalizados
        if request.symbols and len(request.symbols) > 5:
            raise ValueError("Máximo 5 símbolos permitidos para escaneo personalizado")
        
        print(f"🔍 Escaneando {len(symbols)} criptomonedas...")
        print(f"📊 Timeframe: {request.timeframe}")
        print(f"🎯 Filtro mínimo: {request.min_confluence}%")
        
        # Analizar cada cripto
        results = []
        for i, symbol in enumerate(symbols, 1):
            print(f"  [{i}/{len(symbols)}] Analizando {symbol}...")
            analysis = await self.analyze_crypto(symbol, request.timeframe)
            results.append(analysis)
        
        # Filtrar por confluencia mínima
        opportunities = [
            r for r in results 
            if r["confluence_percentage"] >= request.min_confluence
            and r["recommendation"] != "ERROR"
        ]
        
        # Ordenar por confluencias (mayor a menor)
        opportunities.sort(key=lambda x: x["confluence_percentage"], reverse=True)
        
        # Crear objetos CryptoOpportunity
        top_opportunities = [
            CryptoOpportunity(
                symbol=opp["symbol"],
                current_price=opp["current_price"],
                confluence_percentage=opp["confluence_percentage"],
                recommendation=opp["recommendation"],
                total_score=opp["total_score"],
                exchange=opp["exchange"],
                suggested_stop_loss=opp.get("suggested_stop_loss"),
                suggested_take_profit=opp.get("suggested_take_profit"),
                atr_value=opp.get("atr_value"),
                direction=opp.get("direction")
            )
            for opp in opportunities
        ]
        
        # 🆕 Aplicar filtros avanzados
        filters_info = {}
        if request.direction_filter or request.exchange_filter:
            print(f"\n🔍 Aplicando filtros avanzados...")
            top_opportunities, filters_info = self.apply_advanced_filters(
                top_opportunities, 
                request
            )
        
        print(f"\n✅ Escaneo completado: {len(top_opportunities)} oportunidades encontradas (después de filtros)")
        
        return ScannerResponse(
            timestamp=datetime.now().isoformat(),
            timeframe=request.timeframe,
            total_scanned=len(symbols),
            opportunities_found=len(top_opportunities),
            min_confluence_filter=request.min_confluence,
            top_opportunities=top_opportunities,
            all_results=results,
            filters_applied=filters_info if filters_info else None
        )
    
    def get_scanner_status(self):
        """Estado del scanner"""
        return {
            "status": "ready",
            "total_cryptos": TOTAL_CRYPTOS,
            "exchanges": {
                "kraken": KRAKEN_COUNT,
                "binance": BINANCE_COUNT
            }
        }
