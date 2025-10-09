import { TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';
import { Badge } from '../shared';

export default function BacktestResults({ data }) {
  if (!data) return null;

  const { metrics } = data;

  const getWinRateColor = (rate) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProfitFactorColor = (pf) => {
    if (pf >= 2.0) return 'text-green-400';
    if (pf >= 1.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="text-blue-500" size={20} />
          Backtesting Histórico
        </h3>
        <Badge type="info">
          {metrics.total_trades} operaciones
        </Badge>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Award className={getWinRateColor(metrics.win_rate)} size={24} />
          </div>
          <p className="text-xs text-slate-400 mb-1">Win Rate</p>
          <p className={`text-2xl font-bold ${getWinRateColor(metrics.win_rate)}`}>
            {metrics.win_rate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.winning_trades}/{metrics.total_trades}
          </p>
        </div>

        {/* Profit Factor */}
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Target className={getProfitFactorColor(metrics.profit_factor)} size={24} />
          </div>
          <p className="text-xs text-slate-400 mb-1">Profit Factor</p>
          <p className={`text-2xl font-bold ${getProfitFactorColor(metrics.profit_factor)}`}>
            {metrics.profit_factor}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.profit_factor >= 1.5 ? 'Excelente' : 'Mejorable'}
          </p>
        </div>

        {/* Avg Win */}
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Ganancia Promedio</p>
          <p className="text-2xl font-bold text-green-400">
            +{metrics.average_win}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Por operación ganadora
          </p>
        </div>

        {/* Avg Loss */}
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Pérdida Promedio</p>
          <p className="text-2xl font-bold text-red-400">
            -{metrics.average_loss}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Por operación perdedora
          </p>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700 rounded p-3">
          <p className="text-xs text-slate-400">Risk:Reward Promedio</p>
          <p className="text-lg font-bold text-white">1:{metrics.avg_risk_reward.toFixed(1)}</p>
        </div>
        <div className="bg-slate-700 rounded p-3">
          <p className="text-xs text-slate-400">Racha Ganadora Máx</p>
          <p className="text-lg font-bold text-green-400">{metrics.max_consecutive_wins}</p>
        </div>
        <div className="bg-slate-700 rounded p-3">
          <p className="text-xs text-slate-400">Racha Perdedora Máx</p>
          <p className="text-lg font-bold text-red-400">{metrics.max_consecutive_losses}</p>
        </div>
        <div className="bg-slate-700 rounded p-3">
          <p className="text-xs text-slate-400">Período</p>
          <p className="text-sm font-semibold text-white">
            {new Date(data.period_start).toLocaleDateString()} - 
            {new Date(data.period_end).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Interpretación */}
      <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-blue-500">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-blue-400 mt-1" size={20} />
          <div>
            <p className="text-sm font-semibold text-blue-300 mb-1">
              Interpretación Profesional
            </p>
            <p className="text-xs text-slate-300">
              {metrics.win_rate >= 65 && metrics.profit_factor >= 1.5 ? (
                <>✅ <strong>Sistema Confiable:</strong> Win rate y profit factor indican alta probabilidad de éxito. Recomendado para capital real con gestión de riesgo adecuada.</>
              ) : metrics.win_rate >= 55 && metrics.profit_factor >= 1.2 ? (
                <>⚠️ <strong>Sistema Promedio:</strong> Resultados aceptables pero requiere optimización. Considerar paper trading antes de capital real.</>
              ) : (
                <>❌ <strong>Sistema Riesgoso:</strong> Métricas por debajo del estándar profesional. NO recomendado para capital real sin mejoras significativas.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
