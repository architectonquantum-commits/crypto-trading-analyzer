import { useEffect } from 'react';
import { TrendingUp, Target, DollarSign, Activity } from 'lucide-react';
import { Card } from '../shared';
import useJournalStore from '../../store/journalStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function StatsCards() {
  const { stats, fetchStats, loading } = useJournalStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    {
      title: 'Total Trades',
      value: stats?.total_trades || 0,
      icon: TrendingUp,
      color: 'cyan',
      description: stats?.total_trades > 0 
        ? `${stats.open_trades} abiertos, ${stats.closed_trades} cerrados`
        : 'Aún no tienes operaciones',
    },
    {
      title: 'Win Rate',
      value: stats?.win_rate ? formatPercent(stats.win_rate) : '0%',
      icon: Target,
      color: stats?.win_rate >= 50 ? 'green' : 'red',
      description: stats?.closed_trades > 0
        ? `${stats.winning_trades} ganadoras, ${stats.losing_trades} perdedoras`
        : 'Datos se calcularán cuando cierres trades',
    },
    {
      title: 'Profit/Loss',
      value: stats?.total_pnl ? formatCurrency(stats.total_pnl) : '$0.00',
      icon: DollarSign,
      color: (stats?.total_pnl || 0) >= 0 ? 'green' : 'red',
      description: stats?.total_pnl
        ? `ROI: ${formatPercent(stats.roi || 0)}`
        : 'Ganancias/pérdidas acumuladas',
    },
    {
      title: 'Avg RR Ratio',
      value: stats?.avg_rr_ratio ? stats.avg_rr_ratio.toFixed(2) : '0.00',
      icon: Activity,
      color: (stats?.avg_rr_ratio || 0) >= 2 ? 'green' : 'yellow',
      description: stats?.avg_rr_ratio
        ? 'Relación promedio Riesgo/Recompensa'
        : 'Se calcula con trades cerrados',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: 'bg-[#22D3EE]/10 text-[#22D3EE]',
      green: 'bg-green-500/10 text-green-500',
      red: 'bg-red-500/10 text-red-500',
      yellow: 'bg-yellow-500/10 text-yellow-500',
    };
    return colors[color] || colors.cyan;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-24 bg-slate-700 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="hover:bg-slate-700/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-400 mb-2">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-white mb-1">
                {card.value}
              </p>
              <p className="text-xs text-slate-500">
                {card.description}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${getColorClasses(card.color)}`}>
              <card.icon size={24} strokeWidth={2} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
