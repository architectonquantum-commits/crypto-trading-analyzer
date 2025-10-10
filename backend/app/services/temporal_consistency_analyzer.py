"""
Analizador de Consistencia Temporal
Analiza rendimiento por hora del día y día de la semana
"""
import pandas as pd
import numpy as np
from typing import List, Dict
from datetime import datetime
from collections import defaultdict

class TemporalConsistencyAnalyzer:
    """Analiza la consistencia temporal de los trades."""

    def _to_native(self, value):
        """Convierte numpy types a tipos nativos de Python."""
        import numpy as np
        if isinstance(value, (np.integer, np.int64, np.int32)):
            return int(value)
        elif isinstance(value, (np.floating, np.float64, np.float32)):
            return float(value)
        elif isinstance(value, np.ndarray):
            return value.tolist()
        return value
    

    
    def analyze(self, trades: List[dict]) -> Dict:
        """
        Análisis completo de consistencia temporal.
        
        Returns:
            Dict con análisis por hora, día, heatmap y recomendaciones
        """
        
        if not trades or len(trades) < 20:
            return {
                'insufficient_data': True,
                'message': 'Se necesitan al menos 20 trades para análisis temporal'
            }
        
        # Convertir a DataFrame
        df = pd.DataFrame(trades)
        
        # Asegurar que entry_time es datetime
        if 'entry_time' in df.columns:
            df['entry_time'] = pd.to_datetime(df['entry_time'])
            df['hour'] = df['entry_time'].dt.hour
            df['weekday'] = df['entry_time'].dt.dayofweek
        elif 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour'] = df['timestamp'].dt.hour
            df['weekday'] = df['timestamp'].dt.dayofweek
        else:
            # Usar campos individuales si existen
            df['hour'] = df.get('hour', 12)
            df['weekday'] = df.get('weekday', 0)
        
        # Análisis por hora
        hourly_analysis = self._analyze_by_hour(df)
        
        # Análisis por día
        daily_analysis = self._analyze_by_weekday(df)
        
        # Generar heatmap
        heatmap = self._generate_heatmap(df)
        
        # Identificar mejores/peores
        best_worst = self._identify_best_worst(hourly_analysis, daily_analysis)
        
        # Calcular potencial de optimización
        optimization = self._calculate_optimization(df, best_worst)
        
        return {
            'hourly_analysis': hourly_analysis,
            'daily_analysis': daily_analysis,
            'heatmap': heatmap,
            'best_worst_times': best_worst,
            'optimization_potential': optimization,
            'total_trades': len(trades)
        }
    
    def _analyze_by_hour(self, df: pd.DataFrame) -> List[Dict]:
        """Análisis por hora del día (0-23)."""
        
        hourly_stats = []
        
        for hour in range(24):
            hour_trades = df[df['hour'] == hour]
            
            if len(hour_trades) == 0:
                continue
            
            wins = len(hour_trades[hour_trades['outcome'] == 'win'])
            losses = len(hour_trades[hour_trades['outcome'] == 'loss'])
            total = len(hour_trades)
            
            win_rate = (wins / total * 100) if total > 0 else 0
            
            avg_pnl = hour_trades['pnl'].mean()
            total_pnl = hour_trades['pnl'].sum()
            
            # Profit factor
            winning_pnl = hour_trades[hour_trades['pnl'] > 0]['pnl'].sum()
            losing_pnl = abs(hour_trades[hour_trades['pnl'] < 0]['pnl'].sum())
            profit_factor = (winning_pnl / losing_pnl) if losing_pnl > 0 else 0
            
            hourly_stats.append({
                'hour': self._to_native(hour),
                'total_trades': self._to_native(total),
                'wins': self._to_native(wins),
                'losses': self._to_native(losses),
                'win_rate': round(win_rate, 2),
                'avg_pnl': round(avg_pnl, 2),
                'total_pnl': round(total_pnl, 2),
                'profit_factor': round(profit_factor, 2)
            })
        
        return hourly_stats
    
    def _analyze_by_weekday(self, df: pd.DataFrame) -> List[Dict]:
        """Análisis por día de la semana."""
        
        weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        daily_stats = []
        
        for day_num in range(7):
            day_trades = df[df['weekday'] == day_num]
            
            if len(day_trades) == 0:
                continue
            
            wins = len(day_trades[day_trades['outcome'] == 'win'])
            total = len(day_trades)
            
            win_rate = (wins / total * 100) if total > 0 else 0
            avg_pnl = day_trades['pnl'].mean()
            
            # Profit factor
            winning_pnl = day_trades[day_trades['pnl'] > 0]['pnl'].sum()
            losing_pnl = abs(day_trades[day_trades['pnl'] < 0]['pnl'].sum())
            profit_factor = (winning_pnl / losing_pnl) if losing_pnl > 0 else 0
            
            # Mejor y peor hora de este día
            day_hourly = day_trades.groupby('hour')['pnl'].sum()
            best_hour = int(day_hourly.idxmax()) if len(day_hourly) > 0 else None
            worst_hour = int(day_hourly.idxmin()) if len(day_hourly) > 0 else None
            
            daily_stats.append({
                'day': weekdays[day_num],
                'day_num': self._to_native(day_num),
                'total_trades': self._to_native(total),
                'win_rate': round(win_rate, 2),
                'avg_pnl': round(avg_pnl, 2),
                'profit_factor': round(profit_factor, 2),
                'best_hour': best_hour,
                'worst_hour': worst_hour
            })
        
        return daily_stats
    
    def _generate_heatmap(self, df: pd.DataFrame) -> List[List[float]]:
        """Genera matriz de heatmap (día x hora)."""
        
        heatmap = []
        
        for day in range(7):
            day_row = []
            for hour in range(24):
                trades = df[(df['weekday'] == day) & (df['hour'] == hour)]
                
                if len(trades) == 0:
                    day_row.append(0)
                    continue
                
                # Profit factor como métrica
                winning = trades[trades['pnl'] > 0]['pnl'].sum()
                losing = abs(trades[trades['pnl'] < 0]['pnl'].sum())
                pf = (winning / losing) if losing > 0 else 0
                
                day_row.append(round(pf, 2))
            
            heatmap.append(day_row)
        
        return heatmap
    
    def _identify_best_worst(self, hourly: List[Dict], daily: List[Dict]) -> Dict:
        """Identifica mejores y peores horarios/días."""
        
        # Ordenar por profit factor
        hourly_sorted = sorted(hourly, key=lambda x: x['profit_factor'], reverse=True)
        daily_sorted = sorted(daily, key=lambda x: x['profit_factor'], reverse=True)
        
        # Filtrar solo los que tienen suficientes trades (>10)
        hourly_filtered = [h for h in hourly_sorted if h['total_trades'] >= 5]
        daily_filtered = [d for d in daily_sorted if d['total_trades'] >= 10]
        
        return {
            'best_hours': hourly_filtered[:3] if len(hourly_filtered) >= 3 else hourly_filtered,
            'worst_hours': hourly_filtered[-3:] if len(hourly_filtered) >= 3 else [],
            'best_days': daily_filtered[:2] if len(daily_filtered) >= 2 else daily_filtered,
            'worst_days': daily_filtered[-2:] if len(daily_filtered) >= 2 else []
        }
    
    def _calculate_optimization(self, df: pd.DataFrame, best_worst: Dict) -> Dict:
        """Calcula el potencial de optimización."""
        
        # Stats actuales (todos los trades)
        current_win_rate = (len(df[df['outcome'] == 'win']) / len(df) * 100)
        current_pf = self._calculate_pf(df)
        current_total_pnl = df['pnl'].sum()
        
        # Identificar "mejores horarios" (profit factor > 1.5)
        best_hours = [h['hour'] for h in best_worst.get('best_hours', [])]
        
        if not best_hours:
            return {
                'current_stats': {
                    'win_rate': round(current_win_rate, 2),
                    'profit_factor': round(current_pf, 2),
                    'total_pnl': round(current_total_pnl, 2)
                },
                'optimized_stats': None,
                'improvement': None
            }
        
        # Stats si solo operamos en mejores horarios
        optimized_df = df[df['hour'].isin(best_hours)]
        
        if len(optimized_df) < 10:
            return {
                'current_stats': {
                    'win_rate': round(current_win_rate, 2),
                    'profit_factor': round(current_pf, 2),
                    'total_pnl': round(current_total_pnl, 2)
                },
                'optimized_stats': None,
                'improvement': None
            }
        
        opt_win_rate = (len(optimized_df[optimized_df['outcome'] == 'win']) / len(optimized_df) * 100)
        opt_pf = self._calculate_pf(optimized_df)
        opt_total_pnl = optimized_df['pnl'].sum()
        
        # Calcular mejora
        win_rate_improvement = opt_win_rate - current_win_rate
        pf_improvement = opt_pf - current_pf
        pnl_improvement_pct = ((opt_total_pnl - current_total_pnl) / abs(current_total_pnl) * 100) if current_total_pnl != 0 else 0
        
        return {
            'current_stats': {
                'win_rate': round(current_win_rate, 2),
                'profit_factor': round(current_pf, 2),
                'total_pnl': round(current_total_pnl, 2),
                'trades': len(df)
            },
            'optimized_stats': {
                'win_rate': round(opt_win_rate, 2),
                'profit_factor': round(opt_pf, 2),
                'total_pnl': round(opt_total_pnl, 2),
                'trades': len(optimized_df)
            },
            'improvement': {
                'win_rate_delta': round(win_rate_improvement, 2),
                'profit_factor_delta': round(pf_improvement, 2),
                'pnl_improvement_pct': round(pnl_improvement_pct, 2)
            }
        }
    
    def _calculate_pf(self, df: pd.DataFrame) -> float:
        """Calcula profit factor."""
        winning = df[df['pnl'] > 0]['pnl'].sum()
        losing = abs(df[df['pnl'] < 0]['pnl'].sum())
        return (winning / losing) if losing > 0 else 0


# Singleton
_analyzer = None

def get_temporal_analyzer():
    """Obtiene instancia del analizador."""
    global _analyzer
    if _analyzer is None:
        _analyzer = TemporalConsistencyAnalyzer()
    return _analyzer
