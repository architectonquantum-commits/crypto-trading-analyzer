"""
Módulo de Reality Check para Backtesting
Detecta métricas sospechosas que indican overfitting o condiciones irrealistas
"""

from typing import Dict, List
from dataclasses import dataclass

@dataclass
class RealityCheckResult:
    """Resultado del reality check"""
    is_realistic: bool
    confidence_score: float  # 0-100
    warnings: List[str]
    red_flags: List[str]
    suggestions: List[str]
    grade: str  # A, B, C, D, F

class BacktestRealityCheck:
    """
    Valida si los resultados de backtesting son realistas
    o muestran señales de overfitting/optimización excesiva
    """
    
    def __init__(self):
        # Umbrales de "demasiado bueno para ser verdad"
        self.thresholds = {
            'sharpe_suspicious': 5.0,
            'sharpe_extreme': 3.0,
            'calmar_suspicious': 10.0,
            'sortino_suspicious': 10.0,
            'profit_factor_extreme': 5.0,
            'max_dd_too_low': 3.0,
            'win_rate_too_high': 75.0,
            'r_multiple_min': 1.0,
        }
    
    def analyze(self, metrics: Dict, num_trades: int) -> RealityCheckResult:
        """Analiza las métricas y detecta anomalías"""
        
        warnings = []
        red_flags = []
        suggestions = []
        confidence_score = 100.0
        
        # 1. Sharpe Ratio
        sharpe = metrics.get('sharpe_ratio', 0)
        if sharpe > self.thresholds['sharpe_suspicious']:
            red_flags.append(
                f"🚨 Sharpe Ratio {sharpe:.2f} es EXTREMADAMENTE alto (>5). "
                f"Valores así son casi imposibles en trading real. "
                f"Probable overfitting o datos sin ruido realista."
            )
            confidence_score -= 30
        elif sharpe > self.thresholds['sharpe_extreme']:
            warnings.append(
                f"⚠️ Sharpe Ratio {sharpe:.2f} es excepcional (>3). "
                f"Valores así son raros. Verifica realismo de costos y slippage."
            )
            confidence_score -= 10
        
        # 2. Calmar Ratio
        calmar = metrics.get('calmar_ratio', 0)
        if calmar > self.thresholds['calmar_suspicious']:
            red_flags.append(
                f"🚨 Calmar Ratio {calmar:.2f} es irrealmente alto (>10). "
                f"Esto sugiere drawdown artificialmente bajo. "
                f"Posible cherry-picking de período favorable."
            )
            confidence_score -= 20
        
        # 3. Max Drawdown vs Trades
        max_dd = metrics.get('max_drawdown', 0)
        if num_trades > 50 and max_dd < self.thresholds['max_dd_too_low']:
            red_flags.append(
                f"🚨 Max Drawdown {max_dd:.2f}% es sospechosamente bajo para {num_trades} trades. "
                f"En mercados volátiles de cripto, esperarías 5-15%. "
                f"Posibles causas: período muy favorable, costos irrealistas, o position sizing incorrecto."
            )
            confidence_score -= 25
            suggestions.append(
                "✓ Ejecuta Walk-Forward Analysis en múltiples períodos"
            )
            suggestions.append(
                "✓ Aumenta slippage a 0.1-0.2% y comisiones a 0.1%"
            )
        
        # 4. Win Rate
        win_rate = metrics.get('win_rate', 0)
        if win_rate > self.thresholds['win_rate_too_high']:
            warnings.append(
                f"⚠️ Win Rate {win_rate:.1f}% es muy alto (>75%). "
                f"Difícil de mantener en trading real con volatilidad."
            )
            confidence_score -= 15
        
        # 5. R-Multiple (escalabilidad)
        r_multiple = metrics.get('average_r_multiple', 0)
        if r_multiple < self.thresholds['r_multiple_min']:
            red_flags.append(
                f"🚨 R-Multiple promedio {r_multiple:.2f} < 1.0: "
                f"La estrategia NO escala bien. "
                f"Estás ganando por volumen, no por calidad de setups. "
                f"Si aumentas position size, los costos eliminarán las ganancias."
            )
            confidence_score -= 20
            suggestions.append(
                "✓ Optimiza puntos de entrada para R-Multiple >1.5"
            )
            suggestions.append(
                "✓ Agrega filtros para trades de mayor calidad"
            )
        
        # 6. Profit Factor extremo
        pf = metrics.get('profit_factor', 0)
        if pf > self.thresholds['profit_factor_extreme']:
            warnings.append(
                f"⚠️ Profit Factor {pf:.2f} es extremadamente alto (>5). "
                f"Valores así son raros en estrategias sostenibles a largo plazo."
            )
            confidence_score -= 10
        
        # 7. Sortino extremo
        sortino = metrics.get('sortino_ratio', 0)
        if sortino > self.thresholds['sortino_suspicious']:
            warnings.append(
                f"⚠️ Sortino Ratio {sortino:.2f} es sospechosamente alto (>10). "
                f"Sugiere pérdidas muy controladas o período muy favorable."
            )
            confidence_score -= 10
        
        # 8. Conjunto de red flags = Overfitting probable
        if len(red_flags) >= 3:
            suggestions.append(
                "🚨 MÚLTIPLES RED FLAGS: Alta probabilidad de overfitting"
            )
            suggestions.append(
                "✓ CRÍTICO: Ejecuta Walk-Forward Analysis obligatorio"
            )
            suggestions.append(
                "✓ Prueba en datos Out-of-Sample completamente nuevos"
            )
        
        # 9. Sistema perdedor
        total_pnl = metrics.get('total_pnl', 0)
        if total_pnl < 0:
            red_flags.append(
                f"🚨 P&L Total negativo (${total_pnl:.2f}): Sistema PERDEDOR"
            )
            suggestions.append(
                "✓ NO OPERAR con este sistema hasta optimizarlo"
            )
            confidence_score = 0
        
        # 10. Sugerencias generales si todo OK
        if len(red_flags) == 0 and len(warnings) == 0:
            suggestions.append(
                "✓ Métricas dentro de rangos aceptables"
            )
            suggestions.append(
                "✓ Aún así, considera Walk-Forward para validar robustez"
            )
        
        # Determinar grade
        if confidence_score >= 90:
            grade = "A"
        elif confidence_score >= 75:
            grade = "B"
        elif confidence_score >= 60:
            grade = "C"
        elif confidence_score >= 40:
            grade = "D"
        else:
            grade = "F"
        
        # Es realista si score >60 y <2 red flags
        is_realistic = confidence_score > 60 and len(red_flags) < 2
        
        return RealityCheckResult(
            is_realistic=is_realistic,
            confidence_score=max(0, confidence_score),
            warnings=warnings,
            red_flags=red_flags,
            suggestions=suggestions,
            grade=grade
        )

# Singleton
_reality_checker = None

def get_reality_checker() -> BacktestRealityCheck:
    """Obtiene instancia del reality checker"""
    global _reality_checker
    if _reality_checker is None:
        _reality_checker = BacktestRealityCheck()
    return _reality_checker
