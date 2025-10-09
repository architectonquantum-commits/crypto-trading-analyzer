import random
from datetime import datetime, timedelta
from typing import Dict, List, Any

class BacktestingService:
    
    @staticmethod
    def generate_extended_backtest(num_trades: int = 1000) -> Dict[str, Any]:
        """Genera backtesting extendido con equity curve REALISTA"""
        
        INITIAL_CAPITAL = 10000.0
        current_capital = INITIAL_CAPITAL
        equity_curve = []
        trades = []
        wins = 0
        losses = 0
        total_win = 0.0
        total_loss = 0.0
        current_streak = 0
        max_winning_streak = 0
        max_losing_streak = 0
        peak_capital = INITIAL_CAPITAL
        max_drawdown = 0.0
        max_drawdown_pct = 0.0
        start_date = datetime.now() - timedelta(days=365)
        
        # ⭐ CLAVE: Position sizing FIJO (no compuesto) para evitar explosión
        # Operamos siempre con $1000 (10% del capital inicial)
        POSITION_SIZE = INITIAL_CAPITAL * 0.10  # $1000
        
        for i in range(num_trades):
            trade_date = start_date + timedelta(days=(i * 365 / num_trades))
            
            # Win rate 49% (realista)
            is_win = random.random() < 0.49
            
            if is_win:
                # Ganancia: 1% a 4% del position size (más realista)
                gain_pct = random.uniform(1.0, 4.0)
                pnl_amount = POSITION_SIZE * (gain_pct / 100)
                pnl_pct = (pnl_amount / current_capital) * 100  # % relativo al capital total
                
                wins += 1
                total_win += pnl_pct
                current_streak = max(0, current_streak) + 1
                max_winning_streak = max(max_winning_streak, current_streak)
            else:
                # Pérdida: -0.5% a -2% del position size
                loss_pct = random.uniform(0.5, 2.0)
                pnl_amount = -POSITION_SIZE * (loss_pct / 100)
                pnl_pct = (pnl_amount / current_capital) * 100
                
                losses += 1
                total_loss += abs(pnl_pct)
                current_streak = min(0, current_streak) - 1
                max_losing_streak = max(max_losing_streak, abs(current_streak))
            
            # Actualizar capital
            current_capital += pnl_amount
            
            # Protección: No permitir capital negativo
            if current_capital < 0:
                current_capital = 0
            
            # Actualizar peak y calcular drawdown
            if current_capital > peak_capital:
                peak_capital = current_capital
            
            current_drawdown = peak_capital - current_capital
            current_drawdown_pct = (current_drawdown / peak_capital) * 100 if peak_capital > 0 else 0
            
            if current_drawdown_pct > max_drawdown_pct:
                max_drawdown = current_drawdown
                max_drawdown_pct = current_drawdown_pct
            
            equity_curve.append({
                "date": trade_date.strftime("%Y-%m-%d"),
                "trade_number": i + 1,
                "equity": round(current_capital, 2),
                "pnl": round(pnl_amount, 2),
                "pnl_pct": round(pnl_pct, 2),
                "drawdown": round(current_drawdown, 2),
                "drawdown_pct": round(current_drawdown_pct, 2),
                "peak": round(peak_capital, 2)
            })
            
            trades.append({
                "number": i + 1,
                "date": trade_date.strftime("%Y-%m-%d"),
                "result": "WIN" if is_win else "LOSS",
                "pnl_pct": round(pnl_pct, 2),
                "capital_after": round(current_capital, 2)
            })
        
        # Calcular métricas finales
        win_rate = (wins / num_trades) * 100 if num_trades > 0 else 0
        avg_win = total_win / wins if wins > 0 else 0
        avg_loss = total_loss / losses if losses > 0 else 0
        profit_factor = total_win / total_loss if total_loss > 0 else 0
        rr_ratio = avg_win / avg_loss if avg_loss > 0 else 0
        total_return = ((current_capital - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100
        expectancy = (win_rate / 100 * avg_win) - ((100 - win_rate) / 100 * avg_loss)
        
        # Sharpe Ratio
        returns = [t["pnl_pct"] for t in trades]
        avg_return = sum(returns) / len(returns) if returns else 0
        std_dev = (sum((r - avg_return) ** 2 for r in returns) / len(returns)) ** 0.5 if returns else 1
        sharpe_ratio = (avg_return - 0.02) / std_dev if std_dev > 0 else 0
        
        # Recovery Factor
        recovery_factor = total_return / max_drawdown_pct if max_drawdown_pct > 0 else 0
        
        # BTC Benchmark (simplificado: +150% en el año)
        btc_benchmark = []
        btc_initial = INITIAL_CAPITAL
        btc_final = btc_initial * 2.5
        
        for i, point in enumerate(equity_curve):
            btc_value = btc_initial + (btc_final - btc_initial) * (i / num_trades)
            btc_benchmark.append({
                "date": point["date"],
                "btc_value": round(btc_value, 2)
            })
        
        return {
            "summary": {
                "total_trades": num_trades,
                "wins": wins,
                "losses": losses,
                "win_rate": round(win_rate, 1),
                "profit_factor": round(profit_factor, 2),
                "avg_win": round(avg_win, 2),
                "avg_loss": round(avg_loss, 2),
                "risk_reward_ratio": round(rr_ratio, 2),
                "max_winning_streak": max_winning_streak,
                "max_losing_streak": max_losing_streak,
                "expectancy": round(expectancy, 2),
                "sharpe_ratio": round(sharpe_ratio, 2),
                "initial_capital": INITIAL_CAPITAL,
                "final_capital": round(current_capital, 2),
                "total_return": round(total_return, 2),
                "max_drawdown": round(max_drawdown, 2),
                "max_drawdown_pct": round(max_drawdown_pct, 2),
                "recovery_factor": round(recovery_factor, 2)
            },
            "equity_curve": equity_curve,
            "btc_benchmark": btc_benchmark,
            "trades": trades[-20:]
        }
