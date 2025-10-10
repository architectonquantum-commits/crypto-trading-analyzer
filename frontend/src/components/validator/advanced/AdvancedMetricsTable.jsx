import Card from '../../shared/Card';
import { Activity } from 'lucide-react';

export default function AdvancedMetricsTable({ metrics }) {
  
  const sections = [
    {
      title: 'Métricas Básicas',
      metrics: [
        { label: 'Total Trades', value: metrics.total_trades },
        { label: 'Trades Ganadores', value: metrics.winning_trades, color: 'text-green-500' },
        { label: 'Trades Perdedores', value: metrics.losing_trades, color: 'text-red-500' },
        { label: 'Win Rate', value: `${metrics.win_rate}%`, color: metrics.win_rate > 50 ? 'text-green-500' : 'text-red-500' },
      ]
    },
    {
      title: 'P&L',
      metrics: [
        { label: 'P&L Total', value: `$${metrics.total_pnl.toFixed(2)}`, color: metrics.total_pnl > 0 ? 'text-green-500' : 'text-red-500' },
        { label: 'Ganancia Promedio', value: `$${metrics.average_win.toFixed(2)}`, color: 'text-green-500' },
        { label: 'Pérdida Promedio', value: `$${metrics.average_loss.toFixed(2)}`, color: 'text-red-500' },
        { label: 'Mayor Ganancia', value: `$${metrics.largest_win.toFixed(2)}` },
        { label: 'Mayor Pérdida', value: `$${metrics.largest_loss.toFixed(2)}` },
      ]
    },
    {
      title: 'Ratios Profesionales',
      metrics: [
        { label: 'Profit Factor', value: metrics.profit_factor.toFixed(2), color: metrics.profit_factor > 1.5 ? 'text-green-500' : 'text-yellow-500' },
        { label: 'Expectancy', value: `$${metrics.expectancy.toFixed(2)}` },
        { label: 'Sharpe Ratio', value: metrics.sharpe_ratio.toFixed(2), color: metrics.sharpe_ratio > 1 ? 'text-green-500' : 'text-yellow-500' },
        { label: 'Sortino Ratio', value: metrics.sortino_ratio.toFixed(2) },
        { label: 'Calmar Ratio', value: metrics.calmar_ratio.toFixed(2) },
        { label: 'Recovery Factor', value: metrics.recovery_factor.toFixed(2) },
      ]
    },
    {
      title: 'Drawdown',
      metrics: [
        { label: 'Max Drawdown', value: `${metrics.max_drawdown.toFixed(2)}%`, color: 'text-red-500' },
        { label: 'Duración Max DD (días)', value: metrics.max_drawdown_duration_days },
        { label: 'Drawdown Promedio', value: `${metrics.average_drawdown.toFixed(2)}%` },
      ]
    },
    {
      title: 'Rachas',
      metrics: [
        { label: 'Racha de Ganancias', value: metrics.max_consecutive_wins, color: 'text-green-500' },
        { label: 'Racha de Pérdidas', value: metrics.max_consecutive_losses, color: 'text-red-500' },
        { label: 'Racha Actual', value: `${metrics.current_streak} (${metrics.current_streak_type})` },
      ]
    },
    {
      title: 'MAE/MFE',
      metrics: [
        { label: 'MAE Promedio', value: `$${metrics.average_mae.toFixed(2)}` },
        { label: 'MFE Promedio', value: `$${metrics.average_mfe.toFixed(2)}` },
        { label: 'Ratio MAE/MFE', value: metrics.mae_mfe_ratio.toFixed(2) },
      ]
    },
    {
      title: 'R-Multiples',
      metrics: [
        { label: 'R-Multiple Promedio', value: metrics.average_r_multiple.toFixed(2) },
        { label: 'R-Multiple Mediano', value: metrics.median_r_multiple.toFixed(2) },
      ]
    }
  ];

  return (
    <Card>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Activity className="text-blue-500" />
        Métricas Avanzadas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-bold text-lg mb-3 text-blue-400">{section.title}</h4>
            <div className="space-y-2">
              {section.metrics.map((metric, mIdx) => (
                <div key={mIdx} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{metric.label}</span>
                  <span className={`font-semibold ${metric.color || 'text-slate-100'}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
