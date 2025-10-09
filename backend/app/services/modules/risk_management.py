import pandas as pd
import numpy as np
from typing import List, Tuple, Optional
from app.models.risk_management import (
    PositionSize, TakeProfitLevel, RiskRewardAnalysis,
    RiskManagementResponse
)

class RiskManagementModule:
    
    def calculate_atr(self, df: pd.DataFrame, period: int = 14) -> float:
        """
        Calcula el Average True Range (ATR) para medir volatilidad
        """
        high = df['high']
        low = df['low']
        close = df['close']
        
        # True Range
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean().iloc[-1]
        
        return atr
    
    def calculate_position_size(
        self,
        entry_price: float,
        stop_loss: float,
        capital: float,
        risk_percentage: float
    ) -> PositionSize:
        """
        Calcula el tamaño de posición óptimo
        
        Fórmula: Position Size = (Capital × Risk%) / (Entry - Stop Loss)
        """
        risk_amount = capital * (risk_percentage / 100)
        price_difference = abs(entry_price - stop_loss)
        
        if price_difference == 0:
            # Evitar división por cero
            units = 0
            position_value = 0
        else:
            units = risk_amount / price_difference
            position_value = units * entry_price
        
        percentage_of_capital = (position_value / capital) * 100
        
        return PositionSize(
            units=round(units, 6),
            position_value_usd=round(position_value, 2),
            risk_amount_usd=round(risk_amount, 2),
            percentage_of_capital=round(percentage_of_capital, 2)
        )
    
    def calculate_stop_loss(
        self,
        df: pd.DataFrame,
        entry_price: float,
        user_stop_loss: Optional[float] = None,
        support_level: Optional[float] = None
    ) -> Tuple[float, str, Optional[float]]:
        """
        Calcula el Stop Loss óptimo
        
        Prioridad:
        1. Stop Loss provisto por el usuario
        2. Nivel de soporte técnico - 0.5%
        3. ATR × 2 por debajo del entry
        """
        atr = self.calculate_atr(df)
        
        if user_stop_loss:
            return user_stop_loss, "user_provided", atr
        
        if support_level and support_level < entry_price:
            # Stop loss ligeramente por debajo del soporte
            sl = support_level * 0.995  # 0.5% debajo del soporte
            return round(sl, 2), "support_level", atr
        
        # Stop loss basado en ATR (2 × ATR)
        sl = entry_price - (atr * 2)
        return round(sl, 2), "atr", atr
    
    def calculate_take_profits(
        self,
        entry_price: float,
        stop_loss: float,
        position_size: PositionSize,
        ratios: List[float] = [1.0, 2.0, 3.0]
    ) -> List[TakeProfitLevel]:
        """
        Calcula niveles de Take Profit basados en ratios R:R
        """
        risk_distance = abs(entry_price - stop_loss)
        take_profits = []
        
        for i, ratio in enumerate(ratios, start=1):
            tp_price = entry_price + (risk_distance * ratio)
            distance_percent = ((tp_price - entry_price) / entry_price) * 100
            profit_usd = (tp_price - entry_price) * position_size.units
            
            take_profits.append(TakeProfitLevel(
                level=i,
                price=round(tp_price, 2),
                ratio=f"1:{int(ratio)}",
                distance_percent=round(distance_percent, 2),
                profit_usd=round(profit_usd, 2)
            ))
        
        return take_profits
    
    def calculate_rr_score(
        self,
        best_rr_ratio: float,
        stop_loss_distance_percent: float,
        position_percentage: float
    ) -> Tuple[int, List[str]]:
        """
        Calcula score de gestión de riesgo (0-4 puntos)
        
        Criterios:
        - Ratio R:R (2 puntos)
        - Stop Loss razonable (1 punto)
        - Tamaño de posición (1 punto)
        """
        score = 0
        warnings = []
        
        # 1. Ratio R:R (0-2 puntos)
        if best_rr_ratio >= 3.0:
            score += 2
        elif best_rr_ratio >= 2.0:
            score += 1
        else:
            warnings.append("Ratio R:R bajo (<2:1). Considerar mejor setup.")
        
        # 2. Stop Loss razonable (0-1 punto)
        if 1.0 <= stop_loss_distance_percent <= 5.0:
            score += 1
        elif stop_loss_distance_percent > 10.0:
            warnings.append(f"Stop Loss muy amplio ({stop_loss_distance_percent:.1f}%). Alto riesgo.")
        elif stop_loss_distance_percent < 0.5:
            warnings.append(f"Stop Loss muy ajustado ({stop_loss_distance_percent:.1f}%). Puede ser cazado.")
        
        # 3. Tamaño de posición (0-1 punto)
        if position_percentage <= 50:
            score += 1
        elif position_percentage > 100:
            warnings.append(f"Posición requiere {position_percentage:.1f}% del capital. Apalancamiento necesario.")
        else:
            warnings.append(f"Posición usa {position_percentage:.1f}% del capital. Considerar reducir riesgo.")
        
        return score, warnings
    
    def analyze(
        self,
        df: pd.DataFrame,
        symbol: str,
        timeframe: str,
        entry_price: float,
        current_price: float,
        user_stop_loss: Optional[float],
        capital: float,
        risk_percentage: float,
        support_level: Optional[float] = None
    ) -> RiskManagementResponse:
        """
        Análisis completo de gestión de riesgo
        
        Score: 0-4 puntos
        - R:R ratio: 2 puntos
        - Stop Loss: 1 punto
        - Position Size: 1 punto
        """
        # Calcular Stop Loss
        stop_loss, sl_source, atr = self.calculate_stop_loss(
            df, entry_price, user_stop_loss, support_level
        )
        
        stop_loss_distance_percent = abs((entry_price - stop_loss) / entry_price) * 100
        
        # Calcular tamaño de posición
        position_size = self.calculate_position_size(
            entry_price, stop_loss, capital, risk_percentage
        )
        
        # Calcular Take Profits
        take_profits = self.calculate_take_profits(
            entry_price, stop_loss, position_size
        )
        
        # Mejor ratio R:R (usualmente el TP3)
        best_rr_ratio = float(take_profits[-1].ratio.split(':')[1])
        
        # Calcular score
        score, warnings = self.calculate_rr_score(
            best_rr_ratio,
            stop_loss_distance_percent,
            position_size.percentage_of_capital
        )
        
        # Risk Reward Analysis
        risk_reward = RiskRewardAnalysis(
            stop_loss_price=stop_loss,
            stop_loss_distance_percent=round(stop_loss_distance_percent, 2),
            stop_loss_based_on=sl_source,
            atr_value=round(atr, 2) if atr else None,
            take_profits=take_profits,
            best_rr_ratio=best_rr_ratio,
            score=score
        )
        
        confidence_percentage = (score / 4) * 100
        
        # Recomendación
        if confidence_percentage >= 75:
            recommendation = "EXCELLENT_SETUP"
        elif confidence_percentage >= 50:
            recommendation = "GOOD_SETUP"
        elif confidence_percentage >= 25:
            recommendation = "ACCEPTABLE_SETUP"
        else:
            recommendation = "POOR_SETUP"
        
        # Resumen
        summary = (
            f"Arriesgar ${position_size.risk_amount_usd} ({risk_percentage}% del capital) "
            f"para ganar hasta ${take_profits[-1].profit_usd} (R:R 1:{int(best_rr_ratio)}). "
            f"Comprar {position_size.units} {symbol.split('/')[0]}."
        )
        
        return RiskManagementResponse(
            symbol=symbol,
            timeframe=timeframe,
            entry_price=entry_price,
            current_price=current_price,
            position_size=position_size,
            risk_reward=risk_reward,
            total_score=score,
            confidence_percentage=round(confidence_percentage, 2),
            recommendation=recommendation,
            summary=summary,
            warnings=warnings
        )
