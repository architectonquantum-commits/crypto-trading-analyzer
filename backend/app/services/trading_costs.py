"""
Módulo de Costos de Trading Realistas
"""
from dataclasses import dataclass
from typing import Dict
import random

@dataclass
class TradingCosts:
    """Configuración de costos de trading."""
    
    # Comisiones (%)
    maker_fee: float = 0.10
    taker_fee: float = 0.15
    
    # Slippage (%)
    avg_slippage: float = 0.05
    max_slippage: float = 0.20
    
    # Spread (%)
    avg_spread: float = 0.02
    
    def calculate_total_trade_cost(
        self,
        entry_price: float,
        exit_price: float,
        position_size: float,
        direction: str = 'long'
    ) -> Dict[str, float]:
        """Calcula costo total del trade."""
        
        # Costos de entrada (comisión + slippage + spread)
        entry_commission = entry_price * position_size * (self.taker_fee / 100)
        entry_slippage = entry_price * position_size * (self.avg_slippage / 100)
        entry_spread = entry_price * position_size * (self.avg_spread / 100)
        entry_cost = entry_commission + entry_slippage + entry_spread
        
        # Costos de salida
        exit_commission = exit_price * position_size * (self.taker_fee / 100)
        exit_slippage = exit_price * position_size * (self.avg_slippage / 100)
        exit_cost = exit_commission + exit_slippage
        
        # P&L
        if direction == 'long':
            raw_pnl = (exit_price - entry_price) * position_size
        else:
            raw_pnl = (entry_price - exit_price) * position_size
        
        total_cost = entry_cost + exit_cost
        net_pnl = raw_pnl - total_cost
        
        return {
            'entry_costs': entry_cost,
            'exit_costs': exit_cost,
            'total_costs': total_cost,
            'raw_pnl': raw_pnl,
            'net_pnl': net_pnl,
            'cost_impact_pct': (total_cost / abs(raw_pnl) * 100) if raw_pnl != 0 else 0,
            'effective_entry': entry_price * (1 + (self.avg_slippage / 100)),
            'effective_exit': exit_price * (1 - (self.avg_slippage / 100))
        }

_trading_costs = None

def get_trading_costs() -> TradingCosts:
    global _trading_costs
    if _trading_costs is None:
        _trading_costs = TradingCosts()
    return _trading_costs
