import React from 'react';
import { Clock, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const TemporalAnalysisCard = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.insufficient_data) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 text-yellow-400">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-semibold">Análisis Temporal No Disponible</h3>
            <p className="text-sm text-gray-400">
              {analysis?.message || 'Se necesitan más datos para análisis temporal'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { hourly_analysis, daily_analysis, best_worst_times, optimization_potential } = analysis;

  // Obtener mejores horas
  const bestHours = best_worst_times?.best_hours || [];
  const worstHours = best_worst_times?.worst_hours || [];
  const bestDays = best_worst_times?.best_days || [];
  const worstDays = best_worst_times?.worst_days || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="text-blue-400" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-white">Análisis de Consistencia Temporal</h2>
            <p className="text-gray-300">Optimiza tus horarios de trading</p>
          </div>
        </div>
      </div>

      {/* Mejores Horarios */}
      {bestHours.length > 0 && (
        <div className="bg-green-900/20 border-2 border-green-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-400" size={24} />
            <h3 className="text-xl font-bold text-green-400">✅ Mejores Horarios para Operar</h3>
          </div>
          
          <div className="space-y-3">
            {bestHours.map((hour, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-2xl font-bold text-white">{hour.hour}:00</span>
                    <span className="text-gray-400 ml-2">({hour.total_trades} trades)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">Win Rate: {hour.win_rate}%</div>
                    <div className="text-blue-400">PF: {hour.profit_factor}</div>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(hour.profit_factor * 20, 100)}%` }}
                  ></div>
                </div>
                
                <div className="mt-2 text-sm">
                  <span className="text-gray-400">P&L Promedio: </span>
                  <span className={hour.avg_pnl > 0 ? 'text-green-400' : 'text-red-400'}>
                    ${hour.avg_pnl}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Peores Horarios */}
      {worstHours.length > 0 && (
        <div className="bg-red-900/20 border-2 border-red-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-red-400" size={24} />
            <h3 className="text-xl font-bold text-red-400">⚠️ Horarios a Evitar</h3>
          </div>
          
          <div className="space-y-3">
            {worstHours.map((hour, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xl font-bold text-white">{hour.hour}:00</span>
                    <span className="text-gray-400 ml-2">({hour.total_trades} trades)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-bold">Win Rate: {hour.win_rate}%</div>
                    <div className="text-orange-400">PF: {hour.profit_factor}</div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm">
                  <span className="text-gray-400">P&L Promedio: </span>
                  <span className="text-red-400">${hour.avg_pnl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mejores Días */}
      {bestDays.length > 0 && (
        <div className="bg-blue-900/20 border-2 border-blue-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-400" size={24} />
            <h3 className="text-xl font-bold text-blue-400">📅 Mejores Días de la Semana</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestDays.map((day, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <div className="text-xl font-bold text-white mb-2">{day.day}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-green-400 font-bold">{day.win_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit Factor:</span>
                    <span className="text-blue-400">{day.profit_factor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trades:</span>
                    <span className="text-white">{day.total_trades}</span>
                  </div>
                  {day.best_hour !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mejor hora:</span>
                      <span className="text-green-400">{day.best_hour}:00</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Potencial de Optimización */}
      {optimization_potential && !optimization_potential.insufficient_data && optimization_potential.optimized_stats && (
        <div className="bg-purple-900/20 border-2 border-purple-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">💡 Potencial de Optimización</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actual */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Rendimiento Actual</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="font-bold">{optimization_potential.current_stats.win_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Factor:</span>
                  <span className="font-bold">{optimization_potential.current_stats.profit_factor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trades:</span>
                  <span className="font-bold">{optimization_potential.current_stats.trades}</span>
                </div>
              </div>
            </div>

            {/* Optimizado */}
            <div className="bg-gray-800 rounded-lg p-4 border-2 border-green-500">
              <div className="text-green-400 text-sm mb-2">Si operas en mejores horarios</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="font-bold text-green-400">
                    {optimization_potential.optimized_stats.win_rate}%
                    <span className="text-xs ml-1">
                      (+{optimization_potential.improvement.win_rate_delta}%)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Factor:</span>
                  <span className="font-bold text-green-400">
                    {optimization_potential.optimized_stats.profit_factor}
                    <span className="text-xs ml-1">
                      (+{optimization_potential.improvement.profit_factor_delta})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trades:</span>
                  <span className="font-bold">{optimization_potential.optimized_stats.trades}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-900/30 rounded-lg">
            <div className="text-green-400 font-bold text-center">
              💰 Mejora Potencial en P&L: {optimization_potential.improvement.pnl_improvement_pct > 0 ? '+' : ''}
              {optimization_potential.improvement.pnl_improvement_pct}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemporalAnalysisCard;
