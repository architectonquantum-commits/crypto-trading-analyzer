import { Target, TrendingUp } from 'lucide-react';

export default function LevelsProximityIndicator({ analysis }) {
  if (!analysis || !analysis.has_nearby_levels) {
    return null;
  }

  const getBonusColor = (points) => {
    if (points >= 8) return 'text-green-400 bg-green-900/30 border-green-600';
    if (points >= 5) return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
    return 'text-blue-400 bg-blue-900/30 border-blue-600';
  };

  return (
    <div className={`rounded-lg p-4 border-2 ${getBonusColor(analysis.bonus_points)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={24} />
          <div>
            <h3 className="font-semibold">Análisis de Niveles</h3>
            <p className="text-sm opacity-80">
              {analysis.nearby_count} nivel(es) cercano(s)
            </p>
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">+{analysis.bonus_points}</div>
          <div className="text-xs opacity-80">puntos bonus</div>
        </div>
      </div>

      <div className="space-y-2">
        {analysis.details.map((detail, idx) => (
          <div key={idx} className="bg-black/20 rounded p-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {detail.level_type} {detail.direction === 'BULLISH' ? '🟢' : '🔴'}
              </span>
              <span className="font-bold">+{detail.points} pts</span>
            </div>
            <p className="text-xs opacity-80 mt-1">{detail.status}</p>
            {detail.notes && (
              <p className="text-xs opacity-60 mt-1 italic">💬 {detail.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
