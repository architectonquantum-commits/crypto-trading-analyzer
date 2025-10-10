"""
Analizador de Contexto de Entrada
Determina si la entrada es en rebote, ruptura, continuación, etc.
"""
import pandas as pd
import numpy as np
from typing import Dict, Tuple

class EntryContextAnalyzer:
    """Analiza el contexto técnico del punto de entrada."""
    
    def analyze_entry_context(
        self,
        entry_price: float,
        direction: str,
        historical_data: pd.DataFrame
    ) -> Dict:
        """
        Analiza el contexto de la entrada.
        
        Returns:
            Dict con: type, confidence, description
        """
        
        # Obtener últimas 50 velas
        recent_data = historical_data.tail(50)
        
        if len(recent_data) < 20:
            return {
                'type': 'insuficiente',
                'confidence': 0,
                'description': 'Datos insuficientes para análisis',
                'icon': '⚠️'
            }
        
        # 1. Identificar tendencia
        trend = self._identify_trend(recent_data)
        
        # 2. Encontrar niveles clave (soportes/resistencias)
        support, resistance = self._find_key_levels(recent_data)
        
        # 3. Detectar tipo de entrada
        context = self._detect_entry_type(
            entry_price, direction, recent_data, 
            trend, support, resistance
        )
        
        return context
    
    def _identify_trend(self, data: pd.DataFrame) -> str:
        """Identifica la tendencia usando SMAs."""
        
        sma_20 = data['close'].rolling(20).mean().iloc[-1]
        sma_50 = data['close'].rolling(50).mean().iloc[-1] if len(data) >= 50 else sma_20
        current_price = data['close'].iloc[-1]
        
        # Tendencia alcista
        if current_price > sma_20 > sma_50:
            return 'alcista'
        # Tendencia bajista
        elif current_price < sma_20 < sma_50:
            return 'bajista'
        # Lateral
        else:
            return 'lateral'
    
    def _find_key_levels(self, data: pd.DataFrame) -> Tuple[float, float]:
        """Encuentra niveles de soporte y resistencia."""
        
        # Últimas 30 velas
        recent = data.tail(30)
        
        # Soporte = mínimo reciente
        support = recent['low'].min()
        
        # Resistencia = máximo reciente
        resistance = recent['high'].max()
        
        return support, resistance
    
    def _detect_entry_type(
        self,
        entry_price: float,
        direction: str,
        data: pd.DataFrame,
        trend: str,
        support: float,
        resistance: float
    ) -> Dict:
        """Detecta el tipo específico de entrada."""
        
        current_price = data['close'].iloc[-1]
        
        # Tolerancia para niveles (1%)
        tolerance = entry_price * 0.01
        
        # LONG
        if direction.lower() == 'long':
            
            # Rebote en soporte
            if abs(entry_price - support) < tolerance:
                if trend == 'alcista':
                    return {
                        'type': 'rebote_soporte_alcista',
                        'confidence': 85,
                        'description': '✅ Rebote en soporte con tendencia alcista',
                        'icon': '🎯',
                        'details': f'Entrada cerca del soporte ${support:,.2f}'
                    }
                else:
                    return {
                        'type': 'rebote_soporte',
                        'confidence': 70,
                        'description': '✅ Rebote en soporte',
                        'icon': '📈',
                        'details': f'Soporte en ${support:,.2f}'
                    }
            
            # Ruptura de resistencia
            elif entry_price > resistance - tolerance:
                return {
                    'type': 'ruptura_alcista',
                    'confidence': 80,
                    'description': '✅ Ruptura alcista confirmada',
                    'icon': '🚀',
                    'details': f'Rompiendo resistencia ${resistance:,.2f}'
                }
            
            # Continuación de tendencia alcista
            elif trend == 'alcista' and entry_price > support + (resistance - support) * 0.3:
                return {
                    'type': 'continuacion_alcista',
                    'confidence': 75,
                    'description': '✅ Continuación de tendencia alcista',
                    'icon': '📊',
                    'details': 'Entrada en tendencia establecida'
                }
            
            # Reversión desde sobreventa
            elif current_price < support + tolerance and trend == 'bajista':
                return {
                    'type': 'reversion_alcista',
                    'confidence': 65,
                    'description': '⚠️ Reversión alcista en zona sobreventa',
                    'icon': '🔄',
                    'details': 'Entrada contra-tendencia, mayor riesgo'
                }
            
            # Sin patrón claro
            else:
                return {
                    'type': 'neutral',
                    'confidence': 50,
                    'description': '⚠️ Entrada en zona neutral',
                    'icon': '➖',
                    'details': 'No hay patrón técnico claro'
                }
        
        # SHORT
        else:
            
            # Rebote en resistencia
            if abs(entry_price - resistance) < tolerance:
                if trend == 'bajista':
                    return {
                        'type': 'rebote_resistencia_bajista',
                        'confidence': 85,
                        'description': '✅ Rebote en resistencia con tendencia bajista',
                        'icon': '🎯',
                        'details': f'Entrada cerca de resistencia ${resistance:,.2f}'
                    }
                else:
                    return {
                        'type': 'rebote_resistencia',
                        'confidence': 70,
                        'description': '✅ Rebote en resistencia',
                        'icon': '📉',
                        'details': f'Resistencia en ${resistance:,.2f}'
                    }
            
            # Ruptura de soporte
            elif entry_price < support + tolerance:
                return {
                    'type': 'ruptura_bajista',
                    'confidence': 80,
                    'description': '✅ Ruptura bajista confirmada',
                    'icon': '📉',
                    'details': f'Rompiendo soporte ${support:,.2f}'
                }
            
            # Continuación de tendencia bajista
            elif trend == 'bajista' and entry_price < resistance - (resistance - support) * 0.3:
                return {
                    'type': 'continuacion_bajista',
                    'confidence': 75,
                    'description': '✅ Continuación de tendencia bajista',
                    'icon': '📊',
                    'details': 'Entrada en tendencia establecida'
                }
            
            # Reversión desde sobrecompra
            elif current_price > resistance - tolerance and trend == 'alcista':
                return {
                    'type': 'reversion_bajista',
                    'confidence': 65,
                    'description': '⚠️ Reversión bajista en zona sobrecompra',
                    'icon': '🔄',
                    'details': 'Entrada contra-tendencia, mayor riesgo'
                }
            
            # Sin patrón claro
            else:
                return {
                    'type': 'neutral',
                    'confidence': 50,
                    'description': '⚠️ Entrada en zona neutral',
                    'icon': '➖',
                    'details': 'No hay patrón técnico claro'
                }


# Singleton
_analyzer = None

def get_entry_context_analyzer():
    """Obtiene instancia del analizador."""
    global _analyzer
    if _analyzer is None:
        _analyzer = EntryContextAnalyzer()
    return _analyzer
