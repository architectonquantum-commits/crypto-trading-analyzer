import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { Card } from '../shared';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function JournalStats({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-16 bg-slate-700 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const winRate = stats.total_trades > 0 
    ? (stats.trades_ganados / stats.total_trades) * 100 
    : 0;

  const cards = [
    {
      label: 'Total Trades',
      value: stats.total_trades || 0,
      icon: Activity,
      color: 'text-blue-400',
    },
    {
      label: 'Win Rate',
      value: formatPercent(winRate, 1),
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      label: 'Trades Activos',
      value: stats.trades_activos || 0,
      icon: Activity,
      color: 'text-yellow-400',
    },
    {
      label: 'P&L Total',
      value: formatCurrency(stats.ganancia_total || 0),
      icon: DollarSign,
      color: stats.ganancia_total >= 0 ? 'text-green-400' : 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <Icon className={card.color} size={32} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
