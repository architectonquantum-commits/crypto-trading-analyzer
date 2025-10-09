# backend/app/services/backtest_service.py
from typing import List, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

from app.models.backtest import (
    BacktestRequest, BacktestResponse, BacktestMetrics, TradeResult
)
from app.utils.market_data import MarketDataFetcher
from app.services.scanner_service import ScannerService

class BacktestService:
    def __init__(self):
        self.fetcher = MarketDataFetcher()
        self.scanner = ScannerService()
    
    async def run_backtest(self, request: BacktestRequest) -> BacktestResponse:
        """
        Ejecuta backtesting simulando operaciones históricas
        Estrategia: Usa señales del scanner para entrar, SL/TP para salir
        """
        
        # Obtener datos históricos (necesitamos más datos para simular)
        limit = request.num_trades * 10  # Más datos para tener suficientes señales
        df = await self.fetcher.get_ohlcv(request.symbol, request.timeframe, limit=limit)
        
        # Simular operaciones
        trades = self._simulate_trades(df, request)
        
        # Calcular métricas
        metrics = self._calculate_metrics(trades)
        
        # Obtener período analizado
        period_start = df.iloc[0]['timestamp'].isoformat()
        period_end = df.iloc[-1]['timestamp'].isoformat()
        
        return BacktestResponse(
            symbol=request.symbol,
            timeframe=request.timeframe,
            period_start=period_start,
            period_end=period_end,
            metrics=metrics,
            recent_trades=trades[-10:]  # Últimas 10 operaciones
        )
    
    def _simulate_trades(self, df: pd.DataFrame, request: BacktestRequest) -> List[TradeResult]:
        """Simula operaciones basándose en señales del scanner"""
        trades = []
        
        # Iterar por el DataFrame (cada vela puede ser una señal)
        for i in range(50, len(df) - 50):  # Dejar margen para análisis
            # Simular análisis del scanner en ese momento
            entry_price = df.iloc[i]['close']
            
            # Calcular ATR para SL/TP
            atr = self._calculate_atr_simple(df.iloc[i-14:i])
            
            # Determinar dirección (simplificado: basado en tendencia)
            direction = self._determine_direction(df.iloc[i-20:i])
            
            if direction == "LONG":
                stop_loss = entry_price - (atr * 1.5)
                take_profit = entry_price + (atr * 3.0)
            else:  # SHORT
                stop_loss = entry_price + (atr * 1.5)
                take_profit = entry_price - (atr * 3.0)
            
            # Simular salida de la operación
            exit_result = self._simulate_exit(
                df.iloc[i:i+50], 
                entry_price, 
                stop_loss, 
                take_profit, 
                direction
            )
            
            if exit_result:
                trade = TradeResult(
                    timestamp=df.iloc[i]['timestamp'].isoformat(),
                    entry_price=round(entry_price, 2),
                    exit_price=round(exit_result['exit_price'], 2),
                    direction=direction,
                    result=exit_result['result'],
                    profit_loss_percent=round(exit_result['pl_percent'], 2),
                    risk_reward_ratio=round(exit_result['rr_ratio'], 2)
                )
                trades.append(trade)
                
                # Limitar a num_trades
                if len(trades) >= request.num_trades:
                    break
        
        return trades
    
    def _calculate_atr_simple(self, df: pd.DataFrame, period: int = 14) -> float:
        """Calcula ATR simplificado"""
        high = df['high']
        low = df['low']
        close = df['close']
        
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean().iloc[-1]
        
        return atr
    
    def _determine_direction(self, df: pd.DataFrame) -> str:
        """Determina dirección basándose en tendencia simple"""
        # Estrategia simple: comparar precio actual vs promedio de 20 velas
        current_price = df.iloc[-1]['close']
        avg_price = df['close'].mean()
        
        return "LONG" if current_price > avg_price else "SHORT"
    
    def _simulate_exit(
        self, 
        future_df: pd.DataFrame, 
        entry: float, 
        sl: float, 
        tp: float, 
        direction: str
    ) -> Dict[str, Any]:
        """Simula la salida de una operación"""
        
        for i, row in future_df.iterrows():
            high = row['high']
            low = row['low']
            
            if direction == "LONG":
                # Verificar TP
                if high >= tp:
                    pl_percent = ((tp - entry) / entry) * 100
                    return {
                        'exit_price': tp,
                        'result': 'WIN',
                        'pl_percent': pl_percent,
                        'rr_ratio': abs(pl_percent / ((entry - sl) / entry * 100))
                    }
                # Verificar SL
                if low <= sl:
                    pl_percent = ((sl - entry) / entry) * 100
                    return {
                        'exit_price': sl,
                        'result': 'LOSS',
                        'pl_percent': pl_percent,
                        'rr_ratio': 0
                    }
            else:  # SHORT
                # Verificar TP
                if low <= tp:
                    pl_percent = ((entry - tp) / entry) * 100
                    return {
                        'exit_price': tp,
                        'result': 'WIN',
                        'pl_percent': pl_percent,
                        'rr_ratio': abs(pl_percent / ((sl - entry) / entry * 100))
                    }
                # Verificar SL
                if high >= sl:
                    pl_percent = ((entry - sl) / entry) * 100
                    return {
                        'exit_price': sl,
                        'result': 'LOSS',
                        'pl_percent': pl_percent,
                        'rr_ratio': 0
                    }
        
        # Si no tocó ni SL ni TP, cerrar al último precio
        last_price = future_df.iloc[-1]['close']
        if direction == "LONG":
            pl_percent = ((last_price - entry) / entry) * 100
        else:
            pl_percent = ((entry - last_price) / entry) * 100
        
        return {
            'exit_price': last_price,
            'result': 'WIN' if pl_percent > 0 else 'LOSS',
            'pl_percent': pl_percent,
            'rr_ratio': 1.0
        }
    
    def _calculate_metrics(self, trades: List[TradeResult]) -> BacktestMetrics:
        """Calcula métricas del backtesting"""
        
        if not trades:
            return BacktestMetrics(
                total_trades=0,
                winning_trades=0,
                losing_trades=0,
                win_rate=0,
                profit_factor=0,
                average_win=0,
                average_loss=0,
                avg_risk_reward=0,
                max_consecutive_wins=0,
                max_consecutive_losses=0
            )
        
        wins = [t for t in trades if t.result == "WIN"]
        losses = [t for t in trades if t.result == "LOSS"]
        
        total_trades = len(trades)
        winning_trades = len(wins)
        losing_trades = len(losses)
        
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        avg_win = sum(t.profit_loss_percent for t in wins) / len(wins) if wins else 0
        avg_loss = abs(sum(t.profit_loss_percent for t in losses) / len(losses)) if losses else 0
        
        total_profit = sum(t.profit_loss_percent for t in wins)
        total_loss = abs(sum(t.profit_loss_percent for t in losses))
        profit_factor = total_profit / total_loss if total_loss > 0 else 0
        
        avg_rr = sum(t.risk_reward_ratio for t in wins) / len(wins) if wins else 0
        
        # Calcular rachas
        max_wins, max_losses = self._calculate_streaks(trades)
        
        return BacktestMetrics(
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            win_rate=round(win_rate, 2),
            profit_factor=round(profit_factor, 2),
            average_win=round(avg_win, 2),
            average_loss=round(avg_loss, 2),
            avg_risk_reward=round(avg_rr, 2),
            max_consecutive_wins=max_wins,
            max_consecutive_losses=max_losses
        )
    
    def _calculate_streaks(self, trades: List[TradeResult]) -> tuple:
        """Calcula rachas máximas de victorias y derrotas"""
        max_wins = 0
        max_losses = 0
        current_wins = 0
        current_losses = 0
        
        for trade in trades:
            if trade.result == "WIN":
                current_wins += 1
                current_losses = 0
                max_wins = max(max_wins, current_wins)
            else:
                current_losses += 1
                current_wins = 0
                max_losses = max(max_losses, current_losses)
        
        return max_wins, max_losses
